// Claude API integration for recipe generation
// NOTE: In production, this should go through a backend proxy to avoid exposing the API key in frontend code

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || 'your-api-key-here';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

async function generateRecipe(prompt) {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt + '\n\nResponde SOLO con el JSON válido, sin explicaciones adicionales.',
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract JSON from response (might be wrapped in markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

async function generateMealPlan(prompt) {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt + '\n\nResponde SOLO con el JSON válido, sin explicaciones adicionales.',
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

export { generateRecipe, generateMealPlan };
