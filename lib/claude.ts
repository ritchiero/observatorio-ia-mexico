import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeSearchOptions {
  prompt: string;
  maxTokens?: number;
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

export async function searchWithClaude(options: ClaudeSearchOptions): Promise<string> {
  const { prompt, maxTokens = 16000 } = options;

  try {
    const tools = [
      {
        type: 'web_search_20260209' as const,
        name: 'web_search' as const,
      },
    ];
    let messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    let response = await anthropic.messages.create({
      model: 'claude-opus-5',
      max_tokens: maxTokens,
      thinking: { type: 'adaptive' },
      tools,
      messages,
    });

    // Las herramientas de servidor pueden pausar una búsqueda larga. Reenviar
    // la respuesta como turno del asistente conserva el estado y permite que
    // Claude termine el JSON en vez de tratar una pausa como "cero hallazgos".
    for (let continuacion = 0; response.stop_reason === 'pause_turn' && continuacion < 3; continuacion++) {
      messages = [
        ...messages,
        { role: 'assistant', content: response.content },
      ];
      response = await anthropic.messages.create({
        model: 'claude-opus-5',
        max_tokens: maxTokens,
        thinking: { type: 'adaptive' },
        tools,
        messages,
      });
    }

    if (response.stop_reason === 'pause_turn') {
      throw new Error('Claude no completó la búsqueda después de 3 continuaciones.');
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

    if (texto) return texto;

    return JSON.stringify(response.content);
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
            return await searchWithOpenRouter(options);
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
      console.error(`[claude] Error de API ${error.status}: ${error.message}`);
      throw new Error(`Error de Anthropic API (${error.status}): ${error.message}`);
    } else {
      console.error('[claude] Error al llamar a Claude API:', error);
      throw error;
    }
  }
}

export { anthropic };
