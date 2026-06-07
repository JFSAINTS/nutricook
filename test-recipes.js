#!/usr/bin/env node
/**
 * NutriCook Recipe Generation Test
 *
 * Tests the meal plan generation with 2 meals per day
 * Usage: CLAUDE_API_KEY=sk-... node test-recipes.js
 */

const http = require('http');

const API_PROXY = 'http://localhost:3500/api/recipes';
const API_KEY = process.env.CLAUDE_API_KEY;

if (!API_KEY) {
  console.error('ERROR: CLAUDE_API_KEY environment variable not set');
  console.error('Usage: CLAUDE_API_KEY=sk-... node test-recipes.js');
  process.exit(1);
}

// Test payload: Generate meal plan for 2 meals per day
const testPayload = {
  model: 'claude-opus-4-1',
  max_tokens: 2048,
  messages: [
    {
      role: 'user',
      content: `Crea un plan de comidas semanal (lunes a domingo) con:
- Solo DESAYUNO y CENA cada día (2 comidas)
- Máximo 30 minutos de preparación
- Variedad de alimentos
- Aproximadamente 1500 calorías diarias (600 desayuno, 900 cena)
- Sin gluten, sin lácteos

Devuelve SOLO un JSON válido sin explicaciones, con esta estructura:
{
  "lunes": {
    "breakfast": {
      "name": "Nombre de la receta",
      "calories": 600,
      "time": 20,
      "ingredients": ["Ingrediente 1", "Ingrediente 2"],
      "steps": ["Paso 1", "Paso 2"]
    },
    "dinner": {
      "name": "Nombre de la receta",
      "calories": 900,
      "time": 30,
      "ingredients": ["Ingrediente 1"],
      "steps": ["Paso 1"]
    }
  },
  "martes": { ... },
  ...
}`,
    },
  ],
};

console.log('NutriCook Recipe Generation Test');
console.log('================================\n');
console.log('Test: Generate 7-day meal plan (breakfast + dinner)\n');

const options = {
  hostname: 'localhost',
  port: 3500,
  path: '/api/recipes',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(testPayload)),
  },
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status: ${res.statusCode}\n`);

    try {
      const response = JSON.parse(data);

      if (response.error) {
        console.error('API Error:', response.error);
        if (response.details) {
          console.error('Details:', response.details);
        }
        process.exit(1);
      }

      // Extract meal plan from response
      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error('ERROR: No valid JSON found in response');
        console.error('Response:', content.substring(0, 500));
        process.exit(1);
      }

      const mealPlan = JSON.parse(jsonMatch[0]);

      console.log('Generated Meal Plan:');
      console.log('====================\n');

      const days = [
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
        'domingo',
      ];

      let totalCalories = 0;

      days.forEach((day) => {
        if (mealPlan[day]) {
          console.log(`\n${day.toUpperCase()}`);
          console.log('-'.repeat(40));

          const breakfast = mealPlan[day].breakfast || {};
          const dinner = mealPlan[day].dinner || {};

          const breakfastCals = breakfast.calories || 0;
          const dinnerCals = dinner.calories || 0;
          const dailyTotal = breakfastCals + dinnerCals;

          totalCalories += dailyTotal;

          console.log(`\nBreakfast: ${breakfast.name || 'N/A'}`);
          console.log(`  Calories: ${breakfastCals}`);
          console.log(
            `  Time: ${breakfast.time || '—'} min`,
          );
          if (breakfast.ingredients && breakfast.ingredients.length > 0) {
            console.log(
              `  Ingredients: ${breakfast.ingredients.slice(0, 3).join(', ')}${breakfast.ingredients.length > 3 ? '...' : ''}`,
            );
          }

          console.log(`\nDinner: ${dinner.name || 'N/A'}`);
          console.log(`  Calories: ${dinnerCals}`);
          console.log(
            `  Time: ${dinner.time || '—'} min`,
          );
          if (dinner.ingredients && dinner.ingredients.length > 0) {
            console.log(
              `  Ingredients: ${dinner.ingredients.slice(0, 3).join(', ')}${dinner.ingredients.length > 3 ? '...' : ''}`,
            );
          }

          console.log(`\nDaily Total: ${dailyTotal} kcal`);
        }
      });

      console.log('\n' + '='.repeat(40));
      console.log(`Weekly Total: ${totalCalories} kcal`);
      console.log(`Daily Average: ${Math.round(totalCalories / 7)} kcal`);
      console.log('\nTest completed successfully!');
    } catch (err) {
      console.error('JSON Parse Error:', err.message);
      console.error('Response:', data.substring(0, 500));
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('Request Error:', err.message);
  if (
    err.code === 'ECONNREFUSED' ||
    err.code === 'ECONNRESET'
  ) {
    console.error(
      '\nMake sure the proxy is running:',
    );
    console.error('  CLAUDE_API_KEY=sk-... node api-proxy.js');
  }
  process.exit(1);
});

req.write(JSON.stringify(testPayload));
req.end();
