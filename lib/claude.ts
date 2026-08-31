import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeSearchOptions {
  prompt: string;
  maxTokens?: number;
}

export async function searchWithClaude(options: ClaudeSearchOptions): Promise<string> {
  const { prompt, maxTokens = 16000 } = options;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-5',
      max_tokens: maxTokens,
      thinking: { type: 'adaptive' },
      tools: [
        {
          type: 'web_search_20260209' as const,
          name: 'web_search',
        },
      ],
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

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
    // Ruidoso a propósito: este error se tragaba en el try/catch de los agentes y
    // el cron reportaba éxito mientras no escribía nada (ver lib/agents.ts).
    if (error instanceof Anthropic.APIError) {
      console.error(`[claude] Error de API ${error.status}: ${error.message}`);
    } else {
      console.error('[claude] Error al llamar a Claude API:', error);
    }
    throw error;
  }
}

export { anthropic };
