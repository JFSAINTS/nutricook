// NutriCook i18n - Internationalization (Español / English)
const i18n = {
  currentLanguage: 'es',

  translations: {
    es: {
      age: 'Edad',
      allergies: 'Alergias / Restricciones',
      breakfast: 'Desayuno',
      breakfastPercentage: '% Desayuno',
      byIngredients: 'Por Ingredientes',
      calculatePlan: 'Calcular Plan',
      cuisines: 'Tipos de Cocina',
      currentWeight: 'Peso Actual (kg)',
      dailyCaloriesLabel: 'Calorías Diarias',
      daysToGoal: 'Días para el Objetivo',
      dinner: 'Cena',
      dinnerPercentage: '% Cena',
      favorites: 'Favoritas',
      female: 'Mujer',
      gender: 'Género',
      generateRecipe: 'Generar Receta',
      healthyRecipes: 'Recetas Saludables',
      height: 'Altura (cm)',
      lunch: 'Almuerzo',
      lunchPercentage: '% Almuerzo',
      male: 'Hombre',
      maxPrepTime: 'Tiempo Máx. Preparación (min)',
      menus: 'Menús',
      noAllergens: 'Sin alérgenos',
      pantry: 'Despensa',
      planner: 'Plan Semanal',
      preferences: 'Preferencias',
      preferencesUpdated: 'Preferencias guardadas ✓',
      record: 'Registrar',
      recordWeightToday: 'Registrar Peso de Hoy',
      save: 'Guardar',
      snack: 'Merienda',
      snackPercentage: '% Merienda',
      stats: 'Estadísticas',
      targetWeight: 'Peso Objetivo (kg)',
      weight: 'Peso',
      weightControl: 'Control de Peso'
    },
    en: {
      age: 'Age',
      allergies: 'Allergies / Restrictions',
      breakfast: 'Breakfast',
      breakfastPercentage: '% Breakfast',
      byIngredients: 'By Ingredients',
      calculatePlan: 'Calculate Plan',
      cuisines: 'Cuisine Types',
      currentWeight: 'Current Weight (kg)',
      dailyCaloriesLabel: 'Daily Calories',
      daysToGoal: 'Days to Goal',
      dinner: 'Dinner',
      dinnerPercentage: '% Dinner',
      favorites: 'Favorites',
      female: 'Female',
      gender: 'Gender',
      generateRecipe: 'Generate Recipe',
      healthyRecipes: 'Healthy Recipes',
      height: 'Height (cm)',
      lunch: 'Lunch',
      lunchPercentage: '% Lunch',
      male: 'Male',
      maxPrepTime: 'Max Prep Time (min)',
      menus: 'Menus',
      noAllergens: 'No allergens',
      pantry: 'Pantry',
      planner: 'Weekly Planner',
      preferences: 'Preferences',
      preferencesUpdated: 'Preferences saved ✓',
      record: 'Record',
      recordWeightToday: 'Record Today\'s Weight',
      save: 'Save',
      snack: 'Snack',
      snackPercentage: '% Snack',
      stats: 'Statistics',
      targetWeight: 'Target Weight (kg)',
      weight: 'Weight',
      weightControl: 'Weight Control'
    }
  },

  init() {
    const saved = localStorage.getItem('nutricook_prefs_v1');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        if (prefs.language) {
          this.currentLanguage = prefs.language;
        }
      } catch (e) {}
    }
    const browserLang = navigator.language?.substring(0, 2);
    if (!saved && browserLang && this.translations[browserLang]) {
      this.currentLanguage = browserLang;
    }
  },

  t(key) {
    const lang = this.translations[this.currentLanguage] || this.translations['es'];
    return lang[key] || this.translations['es'][key] || key;
  },

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLanguage = lang;
    }
  }
};
