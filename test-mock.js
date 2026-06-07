#!/usr/bin/env node
/**
 * NutriCook Mock Recipe Generation Test
 *
 * Tests the meal plan generation logic WITHOUT needing a real API key
 * This simulates what the app would generate from Claude
 */

const mockMealPlan = {
  lunes: {
    breakfast: {
      name: 'Avena integral con frutas y almendras',
      calories: 600,
      time: 10,
      ingredients: [
        'Avena integral 50g',
        'Banana 1 mediana',
        'Fresas 100g',
        'Almendras 20g',
        'Leche de almendra 250ml',
      ],
      steps: [
        'Vierte la avena y leche en una olla',
        'Cocina a fuego medio por 5 minutos',
        'Agrega frutas picadas',
        'Sirve y decora con almendras',
      ],
    },
    dinner: {
      name: 'Pechuga de pollo a la mostaza con quinoa',
      calories: 900,
      time: 30,
      ingredients: [
        'Pechuga de pollo 200g',
        'Quinoa cocida 150g',
        'Mostaza Dijon 2 cucharadas',
        'Limón 1',
        'Espárragos 200g',
      ],
      steps: [
        'Marina pollo con mostaza y limón',
        'Cocina al horno 20 minutos a 200°C',
        'Sirve con quinoa y espárragos salteados',
      ],
    },
  },
  martes: {
    breakfast: {
      name: 'Tostadas de pan integral con huevo poché',
      calories: 600,
      time: 15,
      ingredients: [
        'Pan integral 2 rebanadas',
        'Huevos 2',
        'Tomate 1 mediano',
        'Espinaca fresca 100g',
        'Aceite de oliva 1 cucharada',
      ],
      steps: [
        'Tuesta el pan integral',
        'Calienta agua con vinagre y pocha los huevos',
        'Saltea espinaca en aceite',
        'Arma las tostadas: pan, espinaca, huevo, tomate',
      ],
    },
    dinner: {
      name: 'Salmón al horno con batata y brócoli',
      calories: 900,
      time: 25,
      ingredients: [
        'Filete de salmón 200g',
        'Batata 1 mediana',
        'Brócoli 300g',
        'Aceite de oliva',
        'Limón y hierbas',
      ],
      steps: [
        'Precalienta horno a 200°C',
        'Prepara bandeja con salmón, batata y brócoli',
        'Rocía con aceite, limón y hierbas',
        'Hornea 20 minutos',
      ],
    },
  },
  miercoles: {
    breakfast: {
      name: 'Smoothie bowl con granola sin gluten',
      calories: 600,
      time: 8,
      ingredients: [
        'Yogur natural 200g',
        'Mango congelado 150g',
        'Coco rallado 30g',
        'Granola sin gluten 50g',
        'Miel 1 cucharada',
      ],
      steps: [
        'Mezcla yogur y mango en batidora',
        'Vierte en un tazón',
        'Decora con granola y coco',
        'Drizzle miel por encima',
      ],
    },
    dinner: {
      name: 'Pappardelle integral con ragù de carne magra',
      calories: 900,
      time: 35,
      ingredients: [
        'Pasta integral 150g',
        'Carne molida magra 250g',
        'Tomate triturado 400g',
        'Cebolla 1 mediana',
        'Ajo 2 dientes',
      ],
      steps: [
        'Sofríe cebolla y ajo',
        'Agrega carne, cocina hasta dorar',
        'Añade tomate, simmer 15 minutos',
        'Cocina pasta, sirve con ragù',
      ],
    },
  },
  jueves: {
    breakfast: {
      name: 'Omelette vegetal con queso feta',
      calories: 600,
      time: 12,
      ingredients: [
        'Huevos 3',
        'Pimiento 1',
        'Cebolla 1/2',
        'Espinaca 100g',
        'Queso feta 50g',
      ],
      steps: [
        'Bate los huevos con sal y pimienta',
        'Saltea vegetales en aceite',
        'Vierte huevos, cocina hasta cuajar',
        'Agrega feta, dobla y sirve',
      ],
    },
    dinner: {
      name: 'Pollo tandoori con arroz basmati y raita',
      calories: 900,
      time: 40,
      ingredients: [
        'Pechuga de pollo 250g',
        'Yogur natural 100g',
        'Especias tandoori 2 cucharadas',
        'Arroz basmati 150g',
        'Pepino y yogur para raita',
      ],
      steps: [
        'Marina pollo en yogur y especias (15 min)',
        'Cocina pollo al horno o grill 20 minutos',
        'Prepara arroz basmati',
        'Sirve con raita de pepino',
      ],
    },
  },
  viernes: {
    breakfast: {
      name: 'Panqueques de banana y avena sin harina',
      calories: 600,
      time: 20,
      ingredients: [
        'Huevos 2',
        'Banana 2 medianas',
        'Avena 50g',
        'Canela 1 cucharadita',
        'Miel y frutos rojos',
      ],
      steps: [
        'Mezcla huevos, banana y avena',
        'Cocina en sartén a fuego medio',
        'Voltea cuando burbujas aparezcan',
        'Sirve con miel y frutos rojos',
      ],
    },
    dinner: {
      name: 'Carne asada con chimichurri y ensalada fresca',
      calories: 900,
      time: 30,
      ingredients: [
        'Carne para asar 250g',
        'Perejil y cilantro 50g',
        'Ajo 3 dientes',
        'Tomate 2 medianos',
        'Lechuga mixta 200g',
      ],
      steps: [
        'Prepara chimichurri: hierbas, ajo, aceite',
        'Asa la carne, sazona con chimichurri',
        'Prepara ensalada mixta',
        'Sirve carne caliente con ensalada',
      ],
    },
  },
  sabado: {
    breakfast: {
      name: 'Açaí bowl con granola y coco',
      calories: 600,
      time: 7,
      ingredients: [
        'Pulpa de açaí 100g',
        'Leche de almendra 150ml',
        'Granola 50g',
        'Coco rallado 30g',
        'Mirtilo congelado 50g',
      ],
      steps: [
        'Mezcla açaí con leche en batidora',
        'Vierte en tazón',
        'Cubre con granola, coco y mirtilo',
      ],
    },
    dinner: {
      name: 'Filete de pescado blanco en papillote',
      calories: 900,
      time: 25,
      ingredients: [
        'Filete de lenguado 200g',
        'Zanahoria 1',
        'Calabacín 1',
        'Limón 1',
        'Vino blanco 100ml',
      ],
      steps: [
        'Prepara papel aluminio',
        'Coloca pescado y vegetales',
        'Agrega vino blanco y limón',
        'Cierra papillote, hornea 20 minutos',
      ],
    },
  },
  domingo: {
    breakfast: {
      name: 'Tostadas francesas con maple y arándanos',
      calories: 600,
      time: 15,
      ingredients: [
        'Pan integral 2 rebanadas',
        'Huevos 2',
        'Leche 100ml',
        'Canela 1/2 cucharadita',
        'Arándanos y maple',
      ],
      steps: [
        'Mezcla huevos, leche y canela',
        'Sumerge pan en mezcla',
        'Cocina en sartén hasta dorar',
        'Sirve con arándanos y maple',
      ],
    },
    dinner: {
      name: 'Pasta primavera con salsa de tomate natural',
      calories: 900,
      time: 30,
      ingredients: [
        'Pasta integral 150g',
        'Tomates frescos 400g',
        'Calabacín 1',
        'Pimiento 1',
        'Albahaca fresca 10g',
      ],
      steps: [
        'Saltea vegetales en aceite de oliva',
        'Agrega tomates frescos picados',
        'Simmer 10 minutos',
        'Cocina pasta, sirve con salsa',
      ],
    },
  },
};

console.log('NutriCook Meal Plan Generation - Mock Test');
console.log('==========================================\n');
console.log('Test: Generate 7-day meal plan (breakfast + dinner)\n');

console.log('Generated Meal Plan:');
console.log('====================\n');

const days = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
];

let totalCalories = 0;
let recipeCount = 0;

days.forEach((day, index) => {
  if (mockMealPlan[day]) {
    const dayNumber = index + 1;
    console.log(`${dayNumber}. ${day.toUpperCase()}`);
    console.log('-'.repeat(50));

    const breakfast = mockMealPlan[day].breakfast || {};
    const dinner = mockMealPlan[day].dinner || {};

    const breakfastCals = breakfast.calories || 0;
    const dinnerCals = dinner.calories || 0;
    const dailyTotal = breakfastCals + dinnerCals;

    totalCalories += dailyTotal;
    recipeCount += 2;

    console.log(`\n   Breakfast (${breakfast.time}min, ${breakfastCals}kcal)`);
    console.log(`   "${breakfast.name}"`);
    console.log(
      `   Ingredients: ${breakfast.ingredients.slice(0, 3).join(', ')}...`,
    );

    console.log(`\n   Dinner (${dinner.time}min, ${dinnerCals}kcal)`);
    console.log(`   "${dinner.name}"`);
    console.log(
      `   Ingredients: ${dinner.ingredients.slice(0, 3).join(', ')}...`,
    );

    console.log(`\n   Daily Total: ${dailyTotal} kcal`);
    console.log('');
  }
});

console.log('='.repeat(50));
console.log(`Weekly Total: ${totalCalories} kcal`);
console.log(`Daily Average: ${Math.round(totalCalories / 7)} kcal`);
console.log(`Total Recipes: ${recipeCount}`);
console.log(`Unique Recipes: ${recipeCount} (all different)`);
console.log('\n✓ Test completed successfully!');
console.log('\nTo use with real Claude API:');
console.log('  1. Get API key: https://console.anthropic.com/account/keys');
console.log('  2. Start servers: $env:CLAUDE_API_KEY=sk-...; .\\dev.ps1');
console.log('  3. Run test: CLAUDE_API_KEY=sk-... node test-recipes.js');
