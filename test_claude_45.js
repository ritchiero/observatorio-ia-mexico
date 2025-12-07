import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function test() {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Responde con "OK" si puedes leer esto.'
      }]
    });
    
    console.log('✅ Modelo funciona correctamente');
    console.log('Respuesta:', message.content[0].text);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
