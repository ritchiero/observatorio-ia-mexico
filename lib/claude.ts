import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeSearchOptions {
  prompt: string;
  maxTokens?: number;
  timeoutMs?: number;
  maxSearches?: number;
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
 * Helper para retry con exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    initialDelayMs: number;
    shouldRetry: (error: unknown) => boolean;
    onRetry?: (attempt: number, error: unknown) => void;
  }
): Promise<T> {
  const { maxRetries, initialDelayMs, shouldRetry, onRetry } = options;
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      const delay = initialDelayMs * Math.pow(2, attempt);
      if (onRetry) {
        onRetry(attempt + 1, error);
      }
      console.log(`[claude] Retry ${attempt + 1}/${maxRetries} después de ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

export async function searchWithClaude(options: ClaudeSearchOptions): Promise<ClaudeSearchResult> {
  const { prompt, maxTokens = 16000, timeoutMs, maxSearches = 8 } = options;
  const startTime = Date.now();

  // Retry en errores transitorios: abort, timeout, 5xx, 429
  const shouldRetry = (error: unknown): boolean => {
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return true;
      }
      if (error.message.includes('timeout') || error.message.includes('aborted')) {
        return true;
      }
    }
    if (error instanceof Anthropic.APIError) {
      const status = error.status;
      if (status === 429 || status === 503 || (status && status >= 500)) {
        return true;
      }
    }
    return false;
  };

  const executeSearch = async (): Promise<ClaudeSearchResult> => {
    const attemptStartTime = Date.now();
    
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

      const abortController = new AbortController();
      let timeoutId: NodeJS.Timeout | undefined;

      if (timeoutMs) {
        timeoutId = setTimeout(() => {
          console.log(`[claude] Cancelando petición después de ${timeoutMs}ms`);
          abortController.abort();
        }, timeoutMs);
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

        // Convertir AbortError en timeout explícito con metadata completa
        if (error instanceof Error && error.name === 'AbortError') {
          const timeoutError = new Error(`Búsqueda con Claude cancelada después de ${timeoutMs}ms (timeout)`);
          (timeoutError as any).name = 'TimeoutError';
          (timeoutError as any).code = 'TIMEOUT';
          (timeoutError as any).timeout = timeoutMs;
          throw timeoutError;
        }
        throw error;
      }
    } catch (error) {
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
              const duracionMs = Date.now() - attemptStartTime;
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
      
      // Cualquier otro error de Anthropic o error no manejado
      if (error instanceof Anthropic.APIError) {
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

  // Ejecutar con retry (máximo 2 reintentos = 3 intentos totales)
  return retryWithBackoff(executeSearch, {
    maxRetries: 2,
    initialDelayMs: 2000,
    shouldRetry,
    onRetry: (attempt, error) => {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`[claude] Intento ${attempt} falló: ${errorMsg}`);
    },
  });
}

export { anthropic };
