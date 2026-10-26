import Anthropic from '@anthropic-ai/sdk';
import { calculateRetryBudget } from './retry-budget.ts';
import { clasificarErrorAbort } from './error-classifier.ts';

// SDK de Anthropic con timeout explícito de 10 minutos (default es 600s)
// Sin especificar maxRetries para que el retry sea manejado por retryWithBackoff
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 600_000, // 10 minutos
  maxRetries: 0, // Manejamos retry manualmente con presupuesto
});

export interface ClaudeSearchOptions {
  prompt: string;
  maxTokens?: number;
  timeoutMs?: number;
  maxSearches?: number;
  globalDeadline?: number; // Timestamp absoluto (Date.now()) del deadline global del agente
}

export interface ClaudeSearchResult {
  texto: string;
  turnos: number;
  duracionMs: number;
}

// Fallback a OpenRouter cuando Anthropic falle por billing/créditos
async function searchWithOpenRouter(options: ClaudeSearchOptions): Promise<string> {
  const { prompt, maxTokens = 16000 } = options;
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY no está configurado para el fallback');
  }

  console.log('[claude] Fallback a OpenRouter activado');

  // Usar modelo similar a Claude para mantener compatibilidad
  const model = process.env.OPENROUTER_FALLBACK_MODEL || 'anthropic/claude-opus-4';
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://www.observatorio-ia-mexico.com',
      'X-Title': 'Observatorio IA México',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter falló (HTTP ${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('OpenRouter devolvió respuesta vacía');
  }

  return content;
}

/**
 * Helper para retry con exponential backoff que respeta presupuesto de tiempo
 * Usa calculateRetryBudget (de retry-budget.ts) para testing
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    initialDelayMs: number;
    shouldRetry: (error: unknown, attempt: number) => boolean;
    onRetry?: (attempt: number, error: unknown) => void;
    deadline?: number; // Timestamp absoluto (Date.now() + budget)
    timeoutMs?: number; // Para calcular presupuesto necesario
  }
): Promise<T> {
  const { maxRetries, initialDelayMs, shouldRetry, onRetry, deadline, timeoutMs } = options;
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Verificar si se debe reintentar
      if (attempt === maxRetries || !shouldRetry(error, attempt)) {
        throw error;
      }
      
      // Verificar presupuesto
      const budget = calculateRetryBudget({
        now: Date.now(),
        deadline,
        attempt,
        initialDelayMs,
        timeoutMs,
      });
      
      if (!budget.canRetry) {
        console.log(`[claude] ${budget.reason}. Abortando retries.`);
        throw error;
      }
      
      if (onRetry) {
        onRetry(attempt + 1, error);
      }
      console.log(`[claude] Retry ${attempt + 1}/${maxRetries} después de ${budget.delay}ms`);
      await new Promise(resolve => setTimeout(resolve, budget.delay));
    }
  }
  
  throw lastError;
}

export async function searchWithClaude(options: ClaudeSearchOptions): Promise<ClaudeSearchResult> {
  const { prompt, maxTokens = 16000, timeoutMs, maxSearches = 8, globalDeadline } = options;
  const startTime = Date.now();

  // Validación: timeoutMs debe ser positivo y razonable
  if (timeoutMs !== undefined && timeoutMs <= 0) {
    console.error(`[claude] WARNING: timeoutMs inválido (${timeoutMs}ms). No se aplicará timeout.`);
  }

  // Validación: si globalDeadline está en el pasado, abortar inmediatamente
  if (globalDeadline && Date.now() >= globalDeadline) {
    throw new Error(`Global deadline ya expiró (deadline: ${new Date(globalDeadline).toISOString()})`);
  }

  // Retry en errores transitorios: 5xx, 429
  // NO reintentar si ya se gastó el presupuesto global o no cabe otro intento
  const shouldRetry = (error: unknown, attempt: number): boolean => {
    // Solo 1 reintento (2 intentos totales) para no exceder presupuesto
    if (attempt >= 1) return false;
    
    // Verificar si hay tiempo para otro intento completo
    if (globalDeadline) {
      const now = Date.now();
      const timeLeft = globalDeadline - now;
      const timeNeededForRetry = (timeoutMs || 30_000) + 1000; // timeout + backoff
      if (timeLeft < timeNeededForRetry) {
        console.log(`[claude] No hay presupuesto global para reintentar (left: ${timeLeft}ms, needed: ${timeNeededForRetry}ms)`);
        return false;
      }
    }
    
    // IMPORTANTE: Detectar abort ANTES de APIError genérico
    // El SDK lanza Anthropic.APIUserAbortError, no un Error con name='AbortError'
    const isAbort = error instanceof Anthropic.APIUserAbortError || 
                    (error instanceof Error && error.name === 'AbortError');
    
    if (isAbort) {
      // Aquí NO tenemos acceso a abortedByOurTimer, pero podemos inferir:
      // Si es timeout propio Y hay presupuesto, reintentar
      // Si es abort externo, NO reintentar
      // Por simplicidad: NO reintentar ningún abort en shouldRetry
      // (la clasificación completa se hace en el catch)
      console.log(`[claude] No se reintenta abort (será clasificado en catch)`);
      return false;
    }
    
    // Errores de API transitorios (DESPUÉS del check de abort)
    if (error instanceof Anthropic.APIError) {
      const status = error.status;
      return status === 429 || status === 503 || (status !== undefined && status >= 500);
    }
    return false;
  };

  const executeSearch = async (): Promise<ClaudeSearchResult> => {
    const attemptStartTime = Date.now();
    
    // No arrancar si no cabe en el deadline global
    if (globalDeadline) {
      const now = Date.now();
      const timeLeft = globalDeadline - now;
      const timeNeeded = timeoutMs || 30_000;
      if (timeLeft < timeNeeded) {
        throw new Error(`No se arranca: tiempo restante (${timeLeft}ms) < timeout necesario (${timeNeeded}ms)`);
      }
    }
    
    try {
      const tools = [
        {
          type: 'web_search_20260209' as const,
          name: 'web_search' as const,
          max_uses: maxSearches,
        },
      ];
      let messages: Anthropic.MessageParam[] = [
        {
          role: 'user',
          content: prompt,
        },
      ];

      // Crear nuevo AbortController para este intento (NO reutilizar entre intentos)
      const abortController = new AbortController();
      let timeoutId: NodeJS.Timeout | undefined;
      let abortedByOurTimer = false; // Flag para distinguir timeout propio vs abort externo

      // Recortar timeout al deadline global
      let effectiveTimeout = timeoutMs;
      let timeoutWasClipped = false;
      if (globalDeadline && timeoutMs) {
        const timeLeft = globalDeadline - Date.now();
        const originalTimeout = timeoutMs;
        effectiveTimeout = Math.min(timeoutMs, timeLeft);
        timeoutWasClipped = effectiveTimeout < originalTimeout;
        if (timeoutWasClipped) {
          console.log(`[claude] Timeout recortado: ${originalTimeout}ms → ${effectiveTimeout}ms (deadline global)`);
        }
      }

      // Aplicar timeout solo si es positivo
      if (effectiveTimeout && effectiveTimeout > 0) {
        const elapsedSinceStart = Date.now() - startTime;
        console.log(`[claude] Iniciando llamada con timeout ${effectiveTimeout}ms (elapsed total: ${elapsedSinceStart}ms)`);
        timeoutId = setTimeout(() => {
          console.log(`[claude] Timeout alcanzado después de ${effectiveTimeout}ms. Abortando.`);
          abortedByOurTimer = true;
          abortController.abort();
        }, effectiveTimeout);
      } else if (effectiveTimeout !== undefined) {
        console.warn(`[claude] effectiveTimeout=${effectiveTimeout} es inválido. Continuando sin timeout.`);
      }

      try {
        let response = await anthropic.messages.create(
          {
            model: 'claude-opus-5',
            max_tokens: maxTokens,
            thinking: { type: 'adaptive' },
            tools,
            messages,
          },
          {
            signal: abortController.signal,
          }
        );

        let turnos = 1;

        // Reducir reintentos pause_turn de 3 a 2 para evitar timeouts
        for (let continuacion = 0; response.stop_reason === 'pause_turn' && continuacion < 2; continuacion++) {
          messages = [
            ...messages,
            { role: 'assistant', content: response.content },
          ];
          response = await anthropic.messages.create(
            {
              model: 'claude-opus-5',
              max_tokens: maxTokens,
              thinking: { type: 'adaptive' },
              tools,
              messages,
            },
            {
              signal: abortController.signal,
            }
          );
          turnos++;
        }

        if (timeoutId) clearTimeout(timeoutId);

        if (response.stop_reason === 'pause_turn') {
          throw new Error('Claude no completó la búsqueda después de 2 continuaciones.');
        }

        // Una negativa de seguridad llega como HTTP 200: hay que revisarla ANTES
        // de leer el contenido, o el agente la interpreta como "no encontré nada".
        if (response.stop_reason === 'refusal') {
          throw new Error(
            `Claude declinó la solicitud (categoría: ${response.stop_details?.category ?? 'desconocida'}).`
          );
        }

        // Con búsqueda web la respuesta trae varios bloques (thinking, resultados de
        // búsqueda, texto). Se concatena TODO el texto: quedarse con el primer bloque
        // devolvía el preámbulo en vez del JSON que el agente necesita parsear.
        const texto = response.content
          .filter((block): block is Anthropic.TextBlock => block.type === 'text')
          .map((block) => block.text)
          .join('\n')
          .trim();

        const duracionMs = Date.now() - attemptStartTime;

        return {
          texto: texto || JSON.stringify(response.content),
          turnos,
          duracionMs,
        };
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);

        // C1: Mejorar detección de abort usando clasificarErrorAbort
        const elapsed = Date.now() - attemptStartTime;
        const classification = clasificarErrorAbort(error, {
          abortedByOurTimer,
          elapsed,
          timeoutMs,
          signalAborted: abortController.signal.aborted,
          signalReason: (abortController.signal as any).reason,
        });

        if (classification.isAbort) {
          // R5: Si el timeout fue recortado, reportar el timeout efectivo en el mensaje
          const timeoutInfo = timeoutWasClipped
            ? ` (timeout efectivo ${effectiveTimeout}ms, recortado de ${timeoutMs}ms)`
            : ` (timeout ${timeoutMs}ms)`;
          const abortError = new Error(
            `${classification.type} tras ${elapsed}ms${timeoutInfo}`
          );
          (abortError as any).name = classification.name;
          (abortError as any).code = classification.code;
          (abortError as any).type = classification.type;
          (abortError as any).timeout = timeoutMs;
          (abortError as any).timeoutMs = timeoutMs;
          (abortError as any).timeoutEfectivo = effectiveTimeout;
          (abortError as any).timeoutRecortado = timeoutWasClipped;
          (abortError as any).elapsed = elapsed;
          (abortError as any).abortedByOurTimer = classification.abortedByOurTimer;
          if (classification.signalReason !== undefined) {
            (abortError as any).signalReason = classification.signalReason;
          }
          throw abortError;
        }
        throw error;
      }
    } catch (error) {
      // IMPORTANTE: Ya clasificamos abort en el catch interno
      // Aquí solo manejamos otros errores de API
      
      // Detectar error de billing/créditos de Anthropic (HTTP 400)
      if (error instanceof Anthropic.APIError && error.status === 400) {
        const mensaje = error.message || '';
        const esBillingError = /credit|balance|billing|payment/i.test(mensaje);
        
        if (esBillingError) {
          console.error(`[claude] Error de créditos Anthropic: ${mensaje}`);
          
          // Intentar fallback a OpenRouter si está configurado
          if (process.env.OPENROUTER_API_KEY) {
            try {
              console.log('[claude] Intentando fallback a OpenRouter...');
              const fallbackTexto = await searchWithOpenRouter(options);
              const duracionMs = Date.now() - startTime;
              return {
                texto: fallbackTexto,
                turnos: 1,
                duracionMs,
              };
            } catch (fallbackError) {
              console.error('[claude] Fallback a OpenRouter también falló:', fallbackError);
              // Propagar error combinado
              throw new Error(
                `Anthropic falló por créditos bajos Y el fallback a OpenRouter también falló. ` +
                `Anthropic: ${mensaje}. OpenRouter: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
              );
            }
          } else {
            // No hay fallback configurado
            throw new Error(
              `Anthropic falló por créditos bajos (${mensaje}) y no hay OPENROUTER_API_KEY configurado para fallback.`
            );
          }
        }
      }
      
      // Cualquier otro error de Anthropic (PERO NO abort, que ya clasificamos)
      if (error instanceof Anthropic.APIError && !(error instanceof Anthropic.APIUserAbortError)) {
        const status = error.status ?? 'unknown';
        const statusCode = typeof error.status === 'number' ? error.status : undefined;
        console.error(`[claude] Error de API ${status}: ${error.message}`);
        const apiError = new Error(`Error de Anthropic API (${status}): ${error.message}`);
        (apiError as any).name = 'AnthropicAPIError';
        (apiError as any).status = statusCode;
        (apiError as any).statusText = error.status;
        throw apiError;
      } else {
        console.error('[claude] Error al llamar a Claude API:', error);
        throw error;
      }
    }
  };

  // Ejecutar con retry (máximo 1 reintento = 2 intentos totales)
  // Usar globalDeadline del agente, no calcular deadline local
  return retryWithBackoff(executeSearch, {
    maxRetries: 1, // Solo 1 reintento para no exceder presupuesto
    initialDelayMs: 1000, // Backoff corto (1s, 2s)
    shouldRetry,
    deadline: globalDeadline, // Deadline global del agente de monitoreo
    timeoutMs, // Para calcular presupuesto necesario en retry
    onRetry: (attempt, error) => {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const timeLeft = globalDeadline ? globalDeadline - Date.now() : 'N/A';
      console.log(`[claude] Intento ${attempt} falló: ${errorMsg}. Presupuesto global restante: ${timeLeft}ms`);
    },
  });
}

export { anthropic };
