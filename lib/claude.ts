import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeSearchOptions {
  prompt: string;
  maxTokens?: number;
}

export async function searchWithClaude(options: ClaudeSearchOptions): Promise<string> {
  const { prompt, maxTokens = 4096 } = options;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      tools: [
        {
          type: 'web_search_20250305' as const,
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

    // Extraer el texto de la respuesta
    const textContent = response.content.find((block) => block.type === 'text');
    if (textContent && 'text' in textContent) {
      return textContent.text;
    }

    return JSON.stringify(response.content);
  } catch (error) {
    console.error('Error al llamar a Claude API:', error);
    throw error;
  }
}

export { anthropic };
