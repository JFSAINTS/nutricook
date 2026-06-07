// i18n — Internationalization (Spanish / English)

const translations = {
  es: {
    // Navigation & Views
    planner: '📅 Plan Semanal',
    pantry: '🛒 Despensa',
    recipes: '🔍 Recetas',
    favorites: '❤️ Favoritos',
    menus: '📋 Menús',
    weight: '⚖️ Peso',
    preferences: '⚙️ Preferencias',
    stats: '📊 Estadísticas',

    // Weight Control
    weightControl: 'Control de Peso',
    yourWeightGoal: 'Tu meta de peso',
    age: 'Edad (años)',
    gender: 'Género',
    male: 'Masculino',
    female: 'Femenino',
    height: 'Altura (cm)',
    currentWeight: 'Peso actual (kg)',
    targetWeight: 'Peso objetivo (kg)',
    daysToGoal: 'Días para lograr objetivo',
    calculatePlan: 'Calcular Plan',
    planCalculated: 'Plan de peso calculado correctamente ✓',
    pleaseCompleteFields: 'Por favor completa todos los campos',
    currentWeightLabel: 'Peso Actual',
    targetWeightLabel: 'Peso Objetivo',
    toLose: 'A Perder',
    dailyExpenditure: 'Gasto Calórico Diario (TMB)',
    recommendedCalories: 'Calorías Recomendadas',
    dailyDeficit: 'Déficit Diario',
    estimatedTime: 'Tiempo Estimado',
    progress: 'Progreso',
    completed: 'completado',
    recordWeightToday: 'Registrar peso hoy',
    kg: 'kg',
    record: 'Registrar',
    weightRecorded: 'Peso registrado',
    weightHistory: 'Historial de pesos',
    noRecords: 'Sin registros aún',
    changeGoal: 'Cambiar meta',
    deleteWeightGoal: '¿Eliminar meta de peso y volver a configurar?',
    weightGoalReset: 'Meta de peso reiniciada',
    validWeight: 'Ingresa un peso válido',

    // Preferences
    preferenceTitle: 'Preferencias',
    language: 'Idioma',
    dailyCaloriesLabel: 'Calorías diarias objetivo',
    breakfastPercentage: 'Desayuno (%)',
    lunchPercentage: 'Almuerzo (%)',
    dinnerPercentage: 'Cena (%)',
    snackPercentage: 'Picoteos (%)',
    allergies: 'Alérgenos/Intolerancias (separadas por comas)',
    cuisines: 'Preferencias de cocina',
    maxPrepTime: 'Tiempo máximo de preparación (minutos)',
    save: 'Guardar',
    preferencesUpdated: 'Preferencias actualizadas ✓',

    // API Settings
    apiSettings: 'Configuración de API',
    selectProvider: 'Selecciona proveedor',
    apiKey: 'API Key',
    saveKey: 'Guardar Key',
    toggleShowKey: 'Mostrar/Ocultar',
    importEnvFile: 'Importar desde .env',
    chooseFile: 'Elegir archivo',
    apiConfiguredSuccess: 'API configurada correctamente ✓',
    apiConfigError: 'Error',
    couldNotSave: 'No se pudo guardar',
    connectionError: 'Error de conexión',
    noFileSelected: 'Selecciona un archivo .env',
    keyNotFound: 'No se encontró CLAUDE_API_KEY en el archivo',
    invalidKeyFormat: 'API key inválida en el archivo',
    keyImported: 'Key importada, presiona "Guardar Key"',
    errorReadingFile: 'Error al leer archivo',

    // Pantry
    pantryEmpty: 'Tu despensa está vacía',
    addIngredientsForRecipes: 'Agrega ingredientes para generar recetas personalizadas',
    addIngredient: 'Agregar Ingrediente',
    selectCategory: 'Selecciona categoría',
    ingredientName: 'Nombre del ingrediente',
    freshProduce: '🥬 Productos Frescos',
    proteins: '🥚 Proteínas',
    grains: '🌾 Granos y Cereales',
    legumes: '🫘 Legumbres',
    spices: '🧂 Especias y Condimentos',
    dairy: '🥛 Lácteos',
    oils: '🫒 Aceites y Grasas',
    canned: '🥫 Conservas',
    sauces: '🍯 Salsas y Aderezos',
    other: '📦 Otros',
    ingredientAdded: 'agregado a',
    ingredientRemoved: 'removido ✓',

    // Recipes
    generateWeek: 'Generar Semana',
    healthyRecipes: 'Recetas Saludables',
    byIngredients: 'Por Ingredientes',
    noAllergens: 'Sin Alérgenos',
    recipeName: 'Nombre de la receta',
    generateRecipe: 'Generar Receta',
    addToDay: 'Agregar al día',
    generateRecipeSuccess: 'Receta generada ✓',
    errorGenerating: 'Error al generar receta',
    calories: 'Calorías',
    prepTime: 'Tiempo prep',
    ingredients: 'Ingredientes',
    steps: 'Pasos',
    generateImage: 'Generando imagen...',

    // Day Planner
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
    breakfast: 'Desayuno',
    lunch: 'Almuerzo',
    dinner: 'Cena',
    snack: 'Picoteos',
    addMeal: 'Agregar comida',
    edit: 'Editar',
    delete: 'Eliminar',
    mealAdded: 'Comida agregada ✓',
    mealDeleted: 'Comida eliminada ✓',

    // Buttons & UI
    add: 'Agregar',
    close: 'Cerrar',
    logout: 'Cerrar sesión',
    loading: 'Cargando...',
    info: 'Información',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
  },

  en: {
    // Navigation & Views
    planner: '📅 Weekly Plan',
    pantry: '🛒 Pantry',
    recipes: '🔍 Recipes',
    favorites: '❤️ Favorites',
    menus: '📋 Menus',
    weight: '⚖️ Weight',
    preferences: '⚙️ Preferences',
    stats: '📊 Statistics',

    // Weight Control
    weightControl: 'Weight Control',
    yourWeightGoal: 'Your weight goal',
    age: 'Age (years)',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    height: 'Height (cm)',
    currentWeight: 'Current weight (kg)',
    targetWeight: 'Target weight (kg)',
    daysToGoal: 'Days to achieve goal',
    calculatePlan: 'Calculate Plan',
    planCalculated: 'Weight plan calculated successfully ✓',
    pleaseCompleteFields: 'Please fill in all fields',
    currentWeightLabel: 'Current Weight',
    targetWeightLabel: 'Target Weight',
    toLose: 'To Lose',
    dailyExpenditure: 'Daily Caloric Expenditure (BMR)',
    recommendedCalories: 'Recommended Calories',
    dailyDeficit: 'Daily Deficit',
    estimatedTime: 'Estimated Time',
    progress: 'Progress',
    completed: 'completed',
    recordWeightToday: 'Record weight today',
    kg: 'kg',
    record: 'Record',
    weightRecorded: 'Weight recorded',
    weightHistory: 'Weight history',
    noRecords: 'No records yet',
    changeGoal: 'Change goal',
    deleteWeightGoal: 'Delete weight goal and reconfigure?',
    weightGoalReset: 'Weight goal reset',
    validWeight: 'Enter a valid weight',

    // Preferences
    preferenceTitle: 'Preferences',
    language: 'Language',
    dailyCaloriesLabel: 'Target daily calories',
    breakfastPercentage: 'Breakfast (%)',
    lunchPercentage: 'Lunch (%)',
    dinnerPercentage: 'Dinner (%)',
    snackPercentage: 'Snacks (%)',
    allergies: 'Allergies/Intolerances (comma separated)',
    cuisines: 'Cuisine preferences',
    maxPrepTime: 'Maximum prep time (minutes)',
    save: 'Save',
    preferencesUpdated: 'Preferences updated ✓',

    // API Settings
    apiSettings: 'API Configuration',
    selectProvider: 'Select provider',
    apiKey: 'API Key',
    saveKey: 'Save Key',
    toggleShowKey: 'Show/Hide',
    importEnvFile: 'Import from .env',
    chooseFile: 'Choose file',
    apiConfiguredSuccess: 'API configured successfully ✓',
    apiConfigError: 'Error',
    couldNotSave: 'Could not save',
    connectionError: 'Connection error',
    noFileSelected: 'Select a .env file',
    keyNotFound: 'CLAUDE_API_KEY not found in file',
    invalidKeyFormat: 'Invalid API key in file',
    keyImported: 'Key imported, press "Save Key"',
    errorReadingFile: 'Error reading file',

    // Pantry
    pantryEmpty: 'Your pantry is empty',
    addIngredientsForRecipes: 'Add ingredients to generate personalized recipes',
    addIngredient: 'Add Ingredient',
    selectCategory: 'Select category',
    ingredientName: 'Ingredient name',
    freshProduce: '🥬 Fresh Produce',
    proteins: '🥚 Proteins',
    grains: '🌾 Grains & Cereals',
    legumes: '🫘 Legumes',
    spices: '🧂 Spices & Seasonings',
    dairy: '🥛 Dairy',
    oils: '🫒 Oils & Fats',
    canned: '🥫 Canned Goods',
    sauces: '🍯 Sauces & Dressings',
    other: '📦 Other',
    ingredientAdded: 'added to',
    ingredientRemoved: 'removed ✓',

    // Recipes
    generateWeek: 'Generate Week',
    healthyRecipes: 'Healthy Recipes',
    byIngredients: 'By Ingredients',
    noAllergens: 'No Allergens',
    recipeName: 'Recipe name',
    generateRecipe: 'Generate Recipe',
    addToDay: 'Add to day',
    generateRecipeSuccess: 'Recipe generated ✓',
    errorGenerating: 'Error generating recipe',
    calories: 'Calories',
    prepTime: 'Prep time',
    ingredients: 'Ingredients',
    steps: 'Steps',
    generateImage: 'Generating image...',

    // Day Planner
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snacks',
    addMeal: 'Add meal',
    edit: 'Edit',
    delete: 'Delete',
    mealAdded: 'Meal added ✓',
    mealDeleted: 'Meal deleted ✓',

    // Buttons & UI
    add: 'Add',
    close: 'Close',
    logout: 'Logout',
    loading: 'Loading...',
    info: 'Info',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
  }
};

// i18n manager
let i18n = {
  currentLanguage: 'es',

  init() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('nutricook_language');
      if (saved) {
        this.currentLanguage = saved;
      }
    }
  },

  setLanguage(lang) {
    if (translations[lang]) {
      this.currentLanguage = lang;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('nutricook_language', lang);
      }
      return true;
    }
    return false;
  },

  t(key) {
    const trans = translations[this.currentLanguage];
    return trans && trans[key] ? trans[key] : key;
  },

  getLanguages() {
    return Object.keys(translations);
  },
};

// Global export for browser
if (typeof window !== 'undefined') {
  window.i18n = i18n;
  window.translations = translations;
}

// Export for use in Node.js and ES modules
export { i18n, translations };
