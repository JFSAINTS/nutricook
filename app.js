import { generateRecipe, generateMealPlan } from './claude-recipes.js';

const APP_VERSION = '0.1.0';
const DB_KEY = 'nutricook_db_v1';
const PREFS_KEY = 'nutricook_prefs_v1';
const PANTRY_KEY = 'nutricook_pantry_v1';
const FAVORITES_KEY = 'nutricook_favorites_v1';
const MENUS_KEY = 'nutricook_menus_v1';
const LAST_UPDATE_CHECK = 'nutricook_last_update_check';

const PANTRY_CATEGORIES = {
  fresh: { label: '🥬 Productos Frescos', examples: 'tomate, cebolla, ajo, zanahoria, lechuga' },
  proteins: { label: '🥚 Proteínas', examples: 'pollo, carne, pescado, huevo' },
  grains: { label: '🌾 Granos y Cereales', examples: 'arroz, pasta, pan, avena' },
  legumes: { label: '🫘 Legumbres', examples: 'lentejas, garbanzos, frijoles' },
  spices: { label: '🧂 Especias y Condimentos', examples: 'sal, pimienta, comino, orégano' },
  dairy: { label: '🥛 Lácteos', examples: 'leche, queso, yogur, mantequilla' },
  oils: { label: '🫒 Aceites y Grasas', examples: 'aceite oliva, aceite girasol' },
  canned: { label: '🥫 Conservas', examples: 'tomate, atún, maíz, frijoles' },
  sauces: { label: '🍯 Salsas y Aderezos', examples: 'mayonesa, salsa soja, vinagre' },
  other: { label: '📦 Otros', examples: 'harina, azúcar, café, té' },
};

let app = {
  db: { weekly_plan: {}, history: [] },
  pantry: {
    fresh: [],
    proteins: [],
    grains: [],
    legumes: [],
    spices: [],
    dairy: [],
    oils: [],
    canned: [],
    sauces: [],
    other: [],
  },
  prefs: {
    dailyCalories: 2000,
    breakfastCal: 25,
    lunchCal: 40,
    dinnerCal: 30,
    snackCal: 5,
    allergies: [],
    cuisines: [],
    maxPrepTime: 45,
    apiProvider: null,  // anthropic, openai, gemini, groq
  },
  currentWeek: new Date(),
  currentView: 'planner',
  currentRecipe: null,  // para guardar receta temporalmente
  favorites: {
    recipes: [],  // recetas marcadas como favoritas
  },
  menus: {
    saved: [],  // menús favoritos guardados
  },

  init() {
    i18n.init();
    this.registerServiceWorker();
    this.loadData();
    this.setupEventListeners();
    this.updateSyncDot();
    this.renderCurrentView();
    this.showWeekLabel();
    this.updateUILanguage();
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('SW registered'))
        .catch(err => console.log('SW registration failed:', err));
    }
  },

  loadData() {
    const savedDB = localStorage.getItem(DB_KEY);
    const savedPrefs = localStorage.getItem(PREFS_KEY);
    const savedPantry = localStorage.getItem(PANTRY_KEY);
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);
    const savedMenus = localStorage.getItem(MENUS_KEY);

    if (savedDB) {
      try {
        this.db = JSON.parse(savedDB);
      } catch (e) {
        console.error('Error loading DB:', e);
        this.db = { weekly_plan: {}, history: [] };
      }
    }

    if (savedPrefs) {
      try {
        const savedPrefsObj = JSON.parse(savedPrefs);
        this.prefs = { ...this.prefs, ...savedPrefsObj };
        if (savedPrefsObj.language) {
          i18n.setLanguage(savedPrefsObj.language);
        }
      } catch (e) {
        console.error('Error loading prefs:', e);
      }
    }

    if (savedPantry) {
      try {
        this.pantry = { ...this.pantry, ...JSON.parse(savedPantry) };
      } catch (e) {
        console.error('Error loading pantry:', e);
      }
    }

    if (savedFavorites) {
      try {
        this.favorites = JSON.parse(savedFavorites);
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }

    if (savedMenus) {
      try {
        this.menus = JSON.parse(savedMenus);
      } catch (e) {
        console.error('Error loading menus:', e);
      }
    }

    this.loadPreferencesUI();
  },

  saveData() {
    this.prefs.language = i18n.currentLanguage;
    localStorage.setItem(DB_KEY, JSON.stringify(this.db));
    localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs));
    localStorage.setItem(PANTRY_KEY, JSON.stringify(this.pantry));
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(this.favorites));
    localStorage.setItem(MENUS_KEY, JSON.stringify(this.menus));
  },

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        this.switchView(view);
      });
    });

    // Week navigation
    document.getElementById('prevWeek').addEventListener('click', () => this.previousWeek());
    document.getElementById('nextWeek').addEventListener('click', () => this.nextWeek());
    document.getElementById('generatePlan').addEventListener('click', () => this.openGeneratePlanModal());

    // Recipe tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target));
    });

    // Sidebar buttons
    document.getElementById('backupBtn').addEventListener('click', () => this.downloadBackup());
    document.getElementById('settingsBtn').addEventListener('click', () => this.openSettingsModal());
    document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

    // Pantry button
    const addIngredientBtn = document.getElementById('addIngredientBtn');
    if (addIngredientBtn) {
      addIngredientBtn.addEventListener('click', () => this.openAddIngredientModal());
    }

    // Close modals on background click
    document.getElementById('dayModal').addEventListener('click', (e) => {
      if (e.target.id === 'dayModal') this.closeModal();
    });
    document.getElementById('recipeModal').addEventListener('click', (e) => {
      if (e.target.id === 'recipeModal') this.closeRecipeModal();
    });
  },

  switchView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewName + 'View').classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    if (viewName === 'planner') {
      this.renderPlannerView();
    } else if (viewName === 'pantry') {
      this.renderPantryView();
    } else if (viewName === 'favorites') {
      this.renderFavoritesView();
    } else if (viewName === 'menus') {
      this.renderMenusView();
    } else if (viewName === 'weight') {
      this.renderWeightControlView();
    } else if (viewName === 'stats') {
      this.renderStatsView();
    }
  },

  switchTab(btn) {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  },

  renderPantryView() {
    const container = document.getElementById('pantryCategories');
    container.innerHTML = '';

    let totalIngredients = 0;
    Object.keys(PANTRY_CATEGORIES).forEach((catKey) => {
      totalIngredients += this.pantry[catKey].length;
    });

    if (totalIngredients === 0) {
      container.innerHTML = `
        <div class="pantry-empty">
          <div class="pantry-empty-icon">🛒</div>
          <div class="pantry-empty-text">
            Tu despensa está vacía.<br>
            Agrega ingredientes para generar recetas personalizadas.
          </div>
        </div>
      `;
      return;
    }

    Object.keys(PANTRY_CATEGORIES).forEach((catKey) => {
      const category = PANTRY_CATEGORIES[catKey];
      const ingredients = this.pantry[catKey] || [];

      if (ingredients.length > 0) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'pantry-category';
        categoryDiv.innerHTML = `
          <div class="pantry-category-header">
            <span class="pantry-category-title">${category.label}</span>
            <span class="pantry-category-count">${ingredients.length}</span>
          </div>
          <div class="pantry-ingredients">
            ${ingredients.map(ing => `
              <div class="pantry-ingredient">
                <span class="pantry-ingredient-name">${ing}</span>
                <div class="pantry-ingredient-actions">
                  <button class="pantry-ingredient-btn" onclick="app.removeIngredient('${catKey}', '${ing}')">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        container.appendChild(categoryDiv);
      }
    });
  },

  openAddIngredientModal() {
    const modal = document.getElementById('dayModal');
    const title = document.getElementById('dayModalTitle');
    const body = document.getElementById('dayModalBody');

    title.textContent = '➕ Agregar Ingrediente';

    const categoryOptions = Object.entries(PANTRY_CATEGORIES)
      .map(([key, cat]) => `<option value="${key}">${cat.label}</option>`)
      .join('');

    body.innerHTML = `
      <div class="form-group">
        <label>Categoría:</label>
        <select id="ingredientCategory">
          ${categoryOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Nombre del ingrediente:</label>
        <input type="text" id="ingredientName" placeholder="Ej: tomate cherry" autofocus>
      </div>
      <div class="form-group" id="examplesHint" style="font-size: 12px; color: var(--text3); padding: 8px; background: var(--bg3); border-radius: var(--radius-sm);">
        Ejemplos: ${PANTRY_CATEGORIES.fresh.examples}
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn-primary" onclick="app.addIngredient()" style="flex: 1;">Agregar</button>
        <button class="btn-secondary" onclick="app.closeModal()" style="flex: 1;">Cancelar</button>
      </div>
    `;

    // Update examples hint when category changes
    document.getElementById('ingredientCategory').addEventListener('change', (e) => {
      const cat = PANTRY_CATEGORIES[e.target.value];
      document.getElementById('examplesHint').textContent = 'Ejemplos: ' + cat.examples;
    });

    modal.classList.add('active');
    document.getElementById('ingredientName').focus();
  },

  addIngredient() {
    const category = document.getElementById('ingredientCategory').value;
    const name = document.getElementById('ingredientName').value.trim().toLowerCase();

    if (!name) {
      this.showToast('Ingresa el nombre del ingrediente', 'error');
      return;
    }

    // Check if already exists
    if (this.pantry[category].includes(name)) {
      this.showToast('Este ingrediente ya está en tu despensa', 'error');
      return;
    }

    this.pantry[category].push(name);
    this.pantry[category].sort();
    this.saveData();

    if (this.currentView === 'pantry') {
      this.renderPantryView();
    }

    this.closeModal();
    this.showToast(`${name} agregado a ${PANTRY_CATEGORIES[category].label} ✓`, 'success');
  },

  removeIngredient(category, ingredient) {
    if (!confirm(`¿Quitar "${ingredient}" de tu despensa?`)) return;

    this.pantry[category] = this.pantry[category].filter(ing => ing !== ingredient);
    this.saveData();

    if (this.currentView === 'pantry') {
      this.renderPantryView();
    }

    this.showToast(`${ingredient} removido ✓`, 'success');
  },

  getPantryIngredientsAsText() {
    const ingredients = [];
    Object.values(this.pantry).forEach(list => {
      ingredients.push(...list);
    });
    return ingredients.join(', ');
  },

  renderFavoritesView() {
    const container = document.getElementById('favoritesList');
    const createBtn = document.getElementById('createMenuBtn');

    if (!this.favorites.recipes || this.favorites.recipes.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text3);">
          <div style="font-size: 48px; margin-bottom: 16px;">🤍</div>
          <div>No hay recetas favoritas aún.</div>
          <div style="font-size: 12px; margin-top: 8px;">Agrega recetas a favoritas desde 🔍 Recetas</div>
        </div>
      `;
      createBtn.style.display = 'none';
      return;
    }

    createBtn.style.display = 'inline-block';

    container.innerHTML = this.favorites.recipes.map(recipe => `
      <div class="recipe-card">
        <div class="recipe-title">${recipe.name}</div>
        <div class="recipe-meta">
          <span>⏱️ ${recipe.time || '—'} min</span>
          <span>🔥 ${recipe.calories || '—'} kcal</span>
        </div>
        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <button class="btn-primary" onclick="app.addRecipeToDay()" style="flex: 1; font-size: 12px;">Agregar</button>
          <button class="btn-secondary" onclick="app.removeRecipeFromFavorites('${recipe.name}')" style="flex: 0.5; font-size: 12px;">✕</button>
        </div>
      </div>
    `).join('');
  },

  renderMenusView() {
    const container = document.getElementById('menusList');

    if (!this.menus.saved || this.menus.saved.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text3);">
          <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
          <div>No hay menús guardados.</div>
          <div style="font-size: 12px; margin-top: 8px;">Crea menús desde tus recetas favoritas</div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="menus-grid">
        ${this.menus.saved.map(menu => `
          <div class="menu-card">
            <div class="menu-header">
              <h3>${menu.name}</h3>
              <button onclick="app.removeMenu('${menu.id}')" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 16px;">✕</button>
            </div>

            <div class="menu-meals">
              <div class="menu-meal">
                <span style="color: var(--text2); font-size: 12px;">Desayuno</span>
                <div>${menu.breakfast.name}</div>
                <div style="font-size: 12px; color: var(--text3);">${menu.breakfast.calories} kcal</div>
              </div>

              <div class="menu-meal">
                <span style="color: var(--text2); font-size: 12px;">Almuerzo</span>
                <div>${menu.lunch.name}</div>
                <div style="font-size: 12px; color: var(--text3);">${menu.lunch.calories} kcal</div>
              </div>

              <div class="menu-meal">
                <span style="color: var(--text2); font-size: 12px;">Cena</span>
                <div>${menu.dinner.name}</div>
                <div style="font-size: 12px; color: var(--text3);">${menu.dinner.calories} kcal</div>
            </div>

            <div style="padding-top: 12px; border-top: 1px solid var(--border); margin-top: 12px;">
              <div style="font-weight: 600; color: var(--accent);">${menu.totalCalories} kcal total</div>
              <button class="btn-primary" onclick="app.openDayMenuSelector('${menu.id}')" style="width: 100%; margin-top: 12px; font-size: 12px;">
                📅 Aplicar a un día
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  removeMenu(menuId) {
    if (!confirm('¿Eliminar este menú?')) return;
    this.menus.saved = this.menus.saved.filter(m => m.id !== menuId);
    this.saveData();
    this.renderMenusView();
    this.showToast('Menú eliminado', 'success');
  },

  openDayMenuSelector(menuId) {
    const modal = document.getElementById('dayModal');
    const title = document.getElementById('dayModalTitle');
    const body = document.getElementById('dayModalBody');

    title.textContent = '📅 Selecciona un día';

    const weekStart = this.getWeekStart(this.currentWeek);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dayKey = this.formatDate(date);
      const dayName = this.getDayName(date);
      days.push({ key: dayKey, name: dayName, date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) });
    }

    body.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        ${days.map(day => `
          <button class="btn-secondary" onclick="app.applyFavoriteMenuToDay('${day.key}', '${menuId}')" style="padding: 16px; text-align: center;">
            <div style="font-weight: 600;">${day.name}</div>
            <div style="font-size: 12px; color: var(--text3);">${day.date}</div>
          </button>
        `).join('')}
      </div>
      <button class="btn-secondary" onclick="app.closeModal()" style="width: 100%; margin-top: 16px;">Cancelar</button>
    `;

    modal.classList.add('active');
  },

  renderCurrentView() {
    this.switchView(this.currentView);
  },

  renderPlannerView() {
    const weekStart = this.getWeekStart(this.currentWeek);
    const grid = document.getElementById('daysGrid');
    grid.innerHTML = '';

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dayKey = this.formatDate(date);
      const dayPlan = this.db.weekly_plan[dayKey] || { meals: [] };

      const dayCard = document.createElement('div');
      dayCard.className = 'day-card';
      dayCard.innerHTML = `
        <div class="day-header">
          <div>
            <div class="day-title">${this.getDayName(date)}</div>
            <div class="day-date">${date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</div>
          </div>
        </div>
        <div class="meals">
          ${dayPlan.meals.map(meal => `
            <div class="meal">
              <div class="meal-type">${this.getMealTypeLabel(meal.type)}</div>
              <div class="meal-name">${meal.name}</div>
              <div class="meal-calories">${meal.calories || '—'} kcal</div>
              <div class="meal-actions">
                <button class="meal-action" onclick="app.editMeal('${dayKey}', ${meal.type})">✏️ Editar</button>
                <button class="meal-action" onclick="app.removeMeal('${dayKey}', ${meal.type})">🗑️ Quitar</button>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top: 16px;">
          <button class="btn-secondary" onclick="app.openDayModal('${dayKey}')" style="width: 100%;">
            ➕ Agregar comida
          </button>
        </div>
      `;
      grid.appendChild(dayCard);
    }
  },

  openDayModal(dayKey) {
    const modal = document.getElementById('dayModal');
    const title = document.getElementById('dayModalTitle');
    const body = document.getElementById('dayModalBody');

    const date = new Date(dayKey);
    title.textContent = `${this.getDayName(date)} - ${date.toLocaleDateString('es-ES')}`;

    body.innerHTML = `
      <div class="form-group">
        <label>Tipo de comida:</label>
        <select id="mealType">
          <option value="breakfast">Desayuno</option>
          <option value="lunch">Almuerzo</option>
          <option value="dinner">Cena</option>
          <option value="snack">Picoteo</option>
        </select>
      </div>
      <div class="form-group">
        <label>Nombre de la receta:</label>
        <input type="text" id="mealName" placeholder="Ej: Tostadas de aguacate">
      </div>
      <div class="form-group">
        <label>Calorías:</label>
        <input type="number" id="mealCalories" placeholder="350" min="0">
      </div>
      <div class="form-group">
        <label>Ingredientes (opcional):</label>
        <textarea id="mealIngredients" placeholder="Pan integral, aguacate, limón..." style="width: 100%; height: 80px; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg3); color: var(--text); font-family: inherit;"></textarea>
      </div>
      <div class="form-group">
        <label>Preparación (opcional):</label>
        <textarea id="mealPrep" placeholder="1. Tuesta el pan..." style="width: 100%; height: 80px; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg3); color: var(--text); font-family: inherit;"></textarea>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn-primary" onclick="app.addMealToDay('${dayKey}')">Agregar</button>
        <button class="btn-secondary" onclick="app.closeModal()" style="flex: 1;">Cancelar</button>
      </div>
    `;

    modal.classList.add('active');
  },

  addMealToDay(dayKey) {
    const type = document.getElementById('mealType').value;
    const name = document.getElementById('mealName').value.trim();
    const calories = parseInt(document.getElementById('mealCalories').value) || 0;
    const ingredients = document.getElementById('mealIngredients').value.trim();
    const prep = document.getElementById('mealPrep').value.trim();

    if (!name) {
      this.showToast('Por favor ingresa el nombre de la receta', 'error');
      return;
    }

    if (!this.db.weekly_plan[dayKey]) {
      this.db.weekly_plan[dayKey] = { meals: [] };
    }

    // Remove if exists
    this.db.weekly_plan[dayKey].meals = this.db.weekly_plan[dayKey].meals.filter(m => m.type !== type);

    // Add new meal
    this.db.weekly_plan[dayKey].meals.push({
      type,
      name,
      calories,
      ingredients,
      prep,
      added: new Date().toISOString(),
    });

    this.saveData();
    this.renderPlannerView();
    this.closeModal();
    this.showToast('Comida agregada ✓', 'success');
  },

  editMeal(dayKey, type) {
    const plan = this.db.weekly_plan[dayKey];
    const meal = plan.meals.find(m => m.type === type);
    if (!meal) return;

    const modal = document.getElementById('dayModal');
    const title = document.getElementById('dayModalTitle');
    const body = document.getElementById('dayModalBody');

    title.textContent = 'Editar comida';

    body.innerHTML = `
      <div class="form-group">
        <label>Nombre de la receta:</label>
        <input type="text" id="editMealName" value="${meal.name}">
      </div>
      <div class="form-group">
        <label>Calorías:</label>
        <input type="number" id="editMealCalories" value="${meal.calories}" min="0">
      </div>
      <div class="form-group">
        <label>Ingredientes:</label>
        <textarea id="editMealIngredients" style="width: 100%; height: 80px; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg3); color: var(--text); font-family: inherit;">${meal.ingredients || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Preparación:</label>
        <textarea id="editMealPrep" style="width: 100%; height: 80px; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg3); color: var(--text); font-family: inherit;">${meal.prep || ''}</textarea>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn-primary" onclick="app.updateMeal('${dayKey}', '${type}')">Guardar</button>
        <button class="btn-secondary" onclick="app.closeModal()" style="flex: 1;">Cancelar</button>
      </div>
    `;

    modal.classList.add('active');
  },

  updateMeal(dayKey, type) {
    const name = document.getElementById('editMealName').value.trim();
    const calories = parseInt(document.getElementById('editMealCalories').value) || 0;
    const ingredients = document.getElementById('editMealIngredients').value.trim();
    const prep = document.getElementById('editMealPrep').value.trim();

    if (!name) {
      this.showToast('Por favor ingresa el nombre', 'error');
      return;
    }

    const meal = this.db.weekly_plan[dayKey].meals.find(m => m.type === type);
    if (meal) {
      meal.name = name;
      meal.calories = calories;
      meal.ingredients = ingredients;
      meal.prep = prep;
    }

    this.saveData();
    this.renderPlannerView();
    this.closeModal();
    this.showToast('Comida actualizada ✓', 'success');
  },

  removeMeal(dayKey, type) {
    if (!confirm('¿Quitar esta comida?')) return;
    this.db.weekly_plan[dayKey].meals = this.db.weekly_plan[dayKey].meals.filter(m => m.type !== type);
    this.saveData();
    this.renderPlannerView();
    this.showToast('Comida eliminada', 'success');
  },

  openGeneratePlanModal() {
    const modal = document.getElementById('dayModal');
    const title = document.getElementById('dayModalTitle');
    const body = document.getElementById('dayModalBody');

    title.textContent = 'Generar plan semanal';

    body.innerHTML = `
      <div class="form-group">
        <label>Selecciona una opción:</label>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button class="btn-secondary" onclick="app.generateHealthyPlan()" style="text-align: left;">🥗 Plan saludable equilibrado</button>
          <button class="btn-secondary" onclick="app.generateByMyIngredients()" style="text-align: left;">🛒 Basado en mis ingredientes</button>
          <button class="btn-secondary" onclick="app.generateAvoidingAllergies()" style="text-align: left;">🚫 Evitando mis alérgenos</button>
        </div>
      </div>
      <div style="margin-top: 16px;">
        <button class="btn-secondary" onclick="app.closeModal()" style="width: 100%;">Cancelar</button>
      </div>
    `;

    modal.classList.add('active');
  },

  async generateHealthyPlan() {
    this.closeModal();
    this.showLoading('Generando plan saludable...');
    try {
      const weekStart = this.getWeekStart(this.currentWeek);
      const prompt = `Crea un plan de comidas semanal saludable (lunes a domingo) con:
- Desayuno, almuerzo y cena cada día
- Máximo ${this.prefs.maxPrepTime} minutos de preparación
- Variedad de alimentos
- Aproximadamente ${this.prefs.dailyCalories} calorías diarias
- Sin: ${this.prefs.allergies.join(', ') || 'ningún ingrediente específico'}

Devuelve un JSON con estructura:
{
  "lunes": { "breakfast": {"name": "...", "calories": 350}, "lunch": {...}, "dinner": {...} },
  ...
}`;

      const plan = await generateMealPlan(prompt);
      if (plan) {
        this.loadPlanToWeek(plan, weekStart);
        this.renderPlannerView();
        this.hideLoading();
        this.showToast('Plan generado ✓', 'success');
      }
    } catch (err) {
      this.hideLoading();
      this.showToast('Error al generar plan: ' + err.message, 'error');
    }
  },

  loadPlanToWeek(plan, weekStart) {
    const dayNames = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

    dayNames.forEach((dayName, index) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + index);
      const dayKey = this.formatDate(date);

      const dayPlan = plan[dayName.toLowerCase()] || {};
      this.db.weekly_plan[dayKey] = {
        meals: [
          {
            type: 'breakfast',
            name: dayPlan.breakfast?.name || 'Desayuno',
            calories: dayPlan.breakfast?.calories || 350,
            ingredients: dayPlan.breakfast?.ingredients || '',
            prep: dayPlan.breakfast?.prep || '',
            added: new Date().toISOString(),
          },
          {
            type: 'lunch',
            name: dayPlan.lunch?.name || 'Almuerzo',
            calories: dayPlan.lunch?.calories || 650,
            ingredients: dayPlan.lunch?.ingredients || '',
            prep: dayPlan.lunch?.prep || '',
            added: new Date().toISOString(),
          },
          {
            type: 'dinner',
            name: dayPlan.dinner?.name || 'Cena',
            calories: dayPlan.dinner?.calories || 500,
            ingredients: dayPlan.dinner?.ingredients || '',
            prep: dayPlan.dinner?.prep || '',
            added: new Date().toISOString(),
          },
        ],
      };
    });

    this.saveData();
  },

  async generateHealthyRecipe() {
    const mealType = document.getElementById('mealTypeHealthy').value;
    if (!mealType) {
      this.showToast('Selecciona un tipo de comida', 'error');
      return;
    }

    this.showLoading('Generando receta...');
    try {
      const prompt = `Crea una receta saludable para ${mealType === 'breakfast' ? 'desayuno' : mealType === 'lunch' ? 'almuerzo' : mealType === 'dinner' ? 'cena' : 'picoteo'}.
- Calorías: ${this.getCaloriesForMealType(mealType)}
- Máximo ${this.prefs.maxPrepTime} minutos
- Sin: ${this.prefs.allergies.join(', ') || 'ningún ingrediente específico'}

Devuelve JSON con: {"name": "...", "calories": 350, "time": 30, "ingredients": ["..."], "steps": ["1. ...", "2. ..."], "tags": ["vegetariano", "rápido"]}`;

      const recipe = await generateRecipe(prompt);
      if (recipe) {
        this.displayRecipe(recipe);
      }
    } catch (err) {
      this.showToast('Error: ' + err.message, 'error');
    } finally {
      this.hideLoading();
    }
  },

  async generateByIngredients() {
    let ingredients = document.getElementById('ingredientsList').value.trim();

    // If empty, suggest using pantry
    if (!ingredients) {
      const pantryItems = this.getPantryIngredientsAsText();
      if (pantryItems) {
        if (confirm(`¿Usar los ingredientes de tu despensa? (${pantryItems.substring(0, 50)}...)`)) {
          ingredients = pantryItems;
        } else {
          this.showToast('Ingresa algunos ingredientes', 'error');
          return;
        }
      } else {
        this.showToast('Ingresa ingredientes o agrega a tu Despensa', 'error');
        return;
      }
    }

    this.showLoading('Buscando recetas...');
    try {
      const prompt = `Crea una receta deliciosa usando estos ingredientes: ${ingredients}.
- Máximo ${this.prefs.maxPrepTime} minutos
- Sin: ${this.prefs.allergies.join(', ') || 'ningún ingrediente específico'}
- Aproximadamente 400-600 calorías

Devuelve JSON con: {"name": "...", "calories": 500, "time": 30, "ingredients": ["..."], "steps": ["1. ...", "2. ..."], "tags": [...]}`;

      const recipe = await generateRecipe(prompt);
      if (recipe) {
        this.displayRecipe(recipe);
      }
    } catch (err) {
      this.showToast('Error: ' + err.message, 'error');
    } finally {
      this.hideLoading();
    }
  },

  async generateWithoutAllergies() {
    const allergies = document.getElementById('allergiesList').value.trim();
    const mealType = document.getElementById('mealTypeAllergies').value;

    if (!allergies || !mealType) {
      this.showToast('Completa todos los campos', 'error');
      return;
    }

    this.showLoading('Generando receta adaptada...');
    try {
      const prompt = `Crea una receta adaptada para ${mealType === 'breakfast' ? 'desayuno' : mealType === 'lunch' ? 'almuerzo' : 'cena'}.
- DEBE evitar completamente: ${allergies}
- Máximo ${this.prefs.maxPrepTime} minutos
- Aproximadamente ${this.getCaloriesForMealType(mealType)} calorías
- Deliciosa y nutritiva

Devuelve JSON con: {"name": "...", "calories": 350, "time": 30, "ingredients": ["..."], "steps": ["1. ...", "2. ..."], "tags": [...]}`;

      const recipe = await generateRecipe(prompt);
      if (recipe) {
        this.displayRecipe(recipe);
      }
    } catch (err) {
      this.showToast('Error: ' + err.message, 'error');
    } finally {
      this.hideLoading();
    }
  },

  displayRecipe(recipe) {
    const result = document.getElementById('recipeResult');

    // Generate image for recipe
    this.generateRecipeImage(recipe);

    result.innerHTML = `
      <div class="recipe-card">
        <div id="recipeImage" style="width: 100%; height: 250px; background: var(--bg3); border-radius: var(--radius); margin-bottom: 16px; display: flex; align-items: center; justify-content: center; color: var(--text3); font-size: 12px;">
          <div style="text-align: center;">
            <div class="spinner" style="margin: 0 auto 8px;"></div>
            Generando imagen...
          </div>
        </div>

        <div class="recipe-title">${recipe.name}</div>
        <div class="recipe-meta">
          <span>⏱️ ${recipe.time || '—'} min</span>
          <span>🔥 ${recipe.calories || '—'} kcal</span>
        </div>
        <div class="recipe-tags">
          ${(recipe.tags || []).map(tag => `<div class="tag">${tag}</div>`).join('')}
        </div>
        <div style="margin-top: 16px;">
          <h4 style="margin-bottom: 8px;">Ingredientes:</h4>
          <ul style="margin-left: 20px; color: var(--text2);">
            ${(recipe.ingredients || []).map(ing => `<li>${ing}</li>`).join('')}
          </ul>
        </div>
        <div style="margin-top: 16px;">
          <h4 style="margin-bottom: 8px;">Preparación:</h4>
          <ol style="margin-left: 20px; color: var(--text2);">
            ${(recipe.steps || []).map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 16px;">
          <button class="btn-primary" onclick="app.addRecipeToDay()" style="flex: 1;">
            ➕ Agregar a plan semanal
          </button>
          <button id="favBtn" class="btn-secondary" onclick="app.toggleFavoriteRecipe(app.currentRecipe)" style="flex: 0.5;">
            ${this.isFavoriteRecipe(recipe) ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    `;

    this.currentRecipe = recipe;
    this.updateFavoriteButton(recipe);
  },

  async generateRecipeImage(recipe) {
    try {
      // Create prompt for image generation
      const prompt = `A delicious, appetizing photo of ${recipe.name}, professional food photography, well-plated, studio lighting, high quality`;

      // Try to get image from cache first
      const cacheKey = `recipe_img_${recipe.name.toLowerCase().replace(/\s+/g, '_')}`;
      const cachedImage = localStorage.getItem(cacheKey);

      if (cachedImage) {
        const imageEl = document.getElementById('recipeImage');
        if (imageEl) {
          imageEl.innerHTML = `<img src="${cachedImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius);" alt="${recipe.name}">`;
        }
        return;
      }

      // Generate using Hugging Face (free API, no key needed for limited requests)
      // Alternative: use Unsplash API or placeholder
      this.generateImageHuggingFace(prompt, cacheKey, recipe.name);
    } catch (err) {
      console.error('Image generation error:', err);
      // Show placeholder on error
      const imageEl = document.getElementById('recipeImage');
      if (imageEl) {
        imageEl.innerHTML = `<div style="font-size: 48px; opacity: 0.3;">🍽️</div>`;
      }
    }
  },

  async generateImageHuggingFace(prompt, cacheKey, recipeName) {
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2', {
        headers: { Accept: 'image/png' },
        method: 'POST',
        body: JSON.stringify({ inputs: prompt, negative_prompt: 'blurry, low quality, distorted' }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Cache as data URL (limited size)
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
          const dataUrl = reader.result;
          // Only cache if not too large
          if (dataUrl.length < 500000) {
            try {
              localStorage.setItem(cacheKey, dataUrl);
            } catch (e) {
              console.log('Cache storage full, skipping image cache');
            }
          }
        };

        // Display image immediately
        const imageEl = document.getElementById('recipeImage');
        if (imageEl) {
          imageEl.innerHTML = `<img src="${url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius);" alt="${recipeName}">`;
        }
      } else {
        // Fallback: use placeholder with recipe emoji
        this.showRecipePlaceholder(recipeName);
      }
    } catch (err) {
      console.error('Hugging Face API error:', err);
      this.showRecipePlaceholder(recipeName);
    }
  },

  showRecipePlaceholder(recipeName) {
    const imageEl = document.getElementById('recipeImage');
    if (imageEl) {
      const emojis = ['🍽️', '🥘', '🍜', '🍲', '🥗', '🍛', '🍝', '🥘', '🍱', '🥙'];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      imageEl.innerHTML = `
        <div style="text-align: center; font-size: 60px; opacity: 0.5;">
          ${emoji}
        </div>
      `;
    }
  },

  toggleFavoriteRecipe(recipe) {
    const isFav = this.isFavoriteRecipe(recipe);

    if (isFav) {
      this.removeRecipeFromFavorites(recipe.name);
      this.showToast('Receta removida de favoritos', 'success');
    } else {
      this.addRecipeToFavorites(recipe);
      this.showToast('Receta agregada a favoritos ❤️', 'success');
    }

    // Update UI if visible
    this.updateFavoriteButton(recipe);
  },

  isFavoriteRecipe(recipe) {
    return this.favorites.recipes.some(fav => fav.name === recipe.name);
  },

  addRecipeToFavorites(recipe) {
    if (!this.isFavoriteRecipe(recipe)) {
      this.favorites.recipes.push({
        id: this.generateId(),
        ...recipe,
        addedToFavorites: new Date().toISOString(),
      });
      this.saveData();
    }
  },

  removeRecipeFromFavorites(recipeName) {
    this.favorites.recipes = this.favorites.recipes.filter(r => r.name !== recipeName);
    this.saveData();
  },

  generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  getFavoriteRecipesByType(type) {
    // Infer type from recipe if not provided
    const favorites = this.favorites.recipes || [];

    if (!type) return favorites;

    // Try to infer meal type from name/calories
    return favorites.filter(recipe => {
      const calories = recipe.calories || 0;
      if (type === 'breakfast') return calories < 300 || calories >= 300 && calories <= 600;
      if (type === 'lunch') return calories >= 600 && calories <= 800;
      if (type === 'dinner') return calories >= 500 && calories <= 700;
      return true;
    });
  },

  createFavoriteMenuModal() {
    if (this.favorites.recipes.length < 2) {
      this.showToast('Necesitas al menos 2 recetas favoritas', 'error');
      return;
    }

    const modal = document.getElementById('dayModal');
    const title = document.getElementById('dayModalTitle');
    const body = document.getElementById('dayModalBody');

    title.textContent = '❤️ Crear Menú Favorito';

    const breakfastOptions = this.favorites.recipes.filter(r => !r.type || r.type === 'breakfast' || (r.calories || 0) < 400);
    const lunchOptions = this.favorites.recipes.filter(r => !r.type || r.type === 'lunch' || (r.calories || 0) >= 400 && (r.calories || 0) <= 800);
    const dinnerOptions = this.favorites.recipes.filter(r => !r.type || r.type === 'dinner' || (r.calories || 0) >= 400 && (r.calories || 0) <= 700);

    body.innerHTML = `
      <div class="form-group">
        <label>Nombre del menú:</label>
        <input type="text" id="menuName" placeholder="Ej: Menú Saludable Lunes" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg3); color: var(--text);">
      </div>

      <div class="form-group">
        <label>Desayuno:</label>
        <select id="menuBreakfast" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg3); color: var(--text);">
          <option value="">-- Selecciona desayuno --</option>
          ${breakfastOptions.map(r => `<option value="${r.id}">${r.name} (${r.calories} kcal)</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>Almuerzo:</label>
        <select id="menuLunch" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg3); color: var(--text);">
          <option value="">-- Selecciona almuerzo --</option>
          ${lunchOptions.map(r => `<option value="${r.id}">${r.name} (${r.calories} kcal)</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>Cena:</label>
        <select id="menuDinner" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg3); color: var(--text);">
          <option value="">-- Selecciona cena --</option>
          ${dinnerOptions.map(r => `<option value="${r.id}">${r.name} (${r.calories} kcal)</option>`).join('')}
        </select>
      </div>

      <div style="display: flex; gap: 12px;">
        <button class="btn-primary" onclick="app.saveFavoriteMenu()" style="flex: 1;">Guardar Menú</button>
        <button class="btn-secondary" onclick="app.closeModal()" style="flex: 1;">Cancelar</button>
      </div>
    `;

    modal.classList.add('active');
  },

  saveFavoriteMenu() {
    const name = document.getElementById('menuName').value.trim();
    const breakfastId = document.getElementById('menuBreakfast').value;
    const lunchId = document.getElementById('menuLunch').value;
    const dinnerId = document.getElementById('menuDinner').value;

    if (!name || !breakfastId || !lunchId || !dinnerId) {
      this.showToast('Completa todos los campos', 'error');
      return;
    }

    const breakfast = this.favorites.recipes.find(r => r.id === breakfastId);
    const lunch = this.favorites.recipes.find(r => r.id === lunchId);
    const dinner = this.favorites.recipes.find(r => r.id === dinnerId);

    const menu = {
      id: this.generateId(),
      name,
      breakfast: { ...breakfast },
      lunch: { ...lunch },
      dinner: { ...dinner },
      totalCalories: (breakfast.calories || 0) + (lunch.calories || 0) + (dinner.calories || 0),
      created: new Date().toISOString(),
    };

    this.menus.saved.push(menu);
    this.saveData();
    this.closeModal();
    this.showToast(`Menú "${name}" guardado ❤️`, 'success');
  },

  applyFavoriteMenuToDay(dayKey, menuId) {
    const menu = this.menus.saved.find(m => m.id === menuId);
    if (!menu) return;

    if (!this.db.weekly_plan[dayKey]) {
      this.db.weekly_plan[dayKey] = { meals: [] };
    }

    // Clear existing meals and add menu meals
    this.db.weekly_plan[dayKey].meals = [
      {
        type: 'breakfast',
        name: menu.breakfast.name,
        calories: menu.breakfast.calories,
        ingredients: menu.breakfast.ingredients,
        prep: menu.breakfast.prep,
        added: new Date().toISOString(),
      },
      {
        type: 'lunch',
        name: menu.lunch.name,
        calories: menu.lunch.calories,
        ingredients: menu.lunch.ingredients,
        prep: menu.lunch.prep,
        added: new Date().toISOString(),
      },
      {
        type: 'dinner',
        name: menu.dinner.name,
        calories: menu.dinner.calories,
        ingredients: menu.dinner.ingredients,
        prep: menu.dinner.prep,
        added: new Date().toISOString(),
      },
    ];

    this.saveData();
    this.renderPlannerView();
    this.showToast(`Menú "${menu.name}" aplicado al día ✓`, 'success');
  },

  updateFavoriteButton(recipe) {
    const btn = document.getElementById('favBtn');
    if (btn) {
      const isFav = this.isFavoriteRecipe(recipe);
      btn.textContent = isFav ? '❤️ En favoritos' : '🤍 Agregar a favoritos';
      btn.style.background = isFav ? 'var(--danger)' : 'var(--accent)';
    }
  },

  savePreferences() {
    this.prefs.dailyCalories = parseInt(document.getElementById('dailyCalories').value) || 2000;
    this.prefs.breakfastCal = parseInt(document.getElementById('breakfastCal').value) || 25;
    this.prefs.lunchCal = parseInt(document.getElementById('lunchCal').value) || 40;
    this.prefs.dinnerCal = parseInt(document.getElementById('dinnerCal').value) || 30;
    this.prefs.snackCal = parseInt(document.getElementById('snackCal').value) || 5;
    this.prefs.allergies = document.getElementById('allergies').value.split(',').map(a => a.trim()).filter(a => a);
    this.prefs.maxPrepTime = parseInt(document.getElementById('maxPrepTime').value) || 45;

    this.prefs.cuisines = Array.from(document.querySelectorAll('input[name="cuisine"]:checked')).map(c => c.value);

    this.saveData();
    this.showToast('Preferencias guardadas ✓', 'success');
  },

  loadPreferencesUI() {
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
      langSelect.value = i18n.currentLanguage;
    }

    const dailyCaloriesInput = document.getElementById('dailyCalories');
    if (dailyCaloriesInput) {
      dailyCaloriesInput.value = this.prefs.dailyCalories;
      dailyCaloriesInput.parentElement.querySelector('label').textContent = i18n.t('dailyCaloriesLabel') + ':';
    }

    const breakfastCal = document.getElementById('breakfastCal');
    if (breakfastCal) {
      breakfastCal.value = this.prefs.breakfastCal;
      breakfastCal.parentElement.querySelector('label').textContent = i18n.t('breakfastPercentage') + ' (%): ';
    }

    const lunchCal = document.getElementById('lunchCal');
    if (lunchCal) {
      lunchCal.value = this.prefs.lunchCal;
      lunchCal.parentElement.querySelector('label').textContent = i18n.t('lunchPercentage') + ' (%): ';
    }

    const dinnerCal = document.getElementById('dinnerCal');
    if (dinnerCal) {
      dinnerCal.value = this.prefs.dinnerCal;
      dinnerCal.parentElement.querySelector('label').textContent = i18n.t('dinnerPercentage') + ' (%): ';
    }

    const snackCal = document.getElementById('snackCal');
    if (snackCal) {
      snackCal.value = this.prefs.snackCal;
      snackCal.parentElement.querySelector('label').textContent = i18n.t('snackPercentage') + ' (%): ';
    }

    const allergiesInput = document.getElementById('allergies');
    if (allergiesInput) {
      allergiesInput.value = this.prefs.allergies.join(', ');
      allergiesInput.parentElement.querySelector('label').textContent = i18n.t('allergies') + ':';
      allergiesInput.placeholder = 'Ej: ' + (i18n.currentLanguage === 'es' ? 'lácteos, gluten' : 'dairy, gluten');
    }

    const maxPrepTimeInput = document.getElementById('maxPrepTime');
    if (maxPrepTimeInput) {
      maxPrepTimeInput.value = this.prefs.maxPrepTime;
      maxPrepTimeInput.parentElement.querySelector('label').textContent = i18n.t('maxPrepTime') + ':';
    }

    // Update cuisine checkboxes
    const cuisineCheckboxes = document.querySelectorAll('input[name="cuisine"]');
    cuisineCheckboxes.forEach(checkbox => {
      checkbox.checked = this.prefs.cuisines.includes(checkbox.value);
    });

    // Update button text
    const saveBtn = document.querySelector('#preferencesView .btn-primary');
    if (saveBtn) {
      saveBtn.textContent = i18n.t('save');
    }

    // Update preference labels
    const cuisineLabel = document.querySelector('label:has(+ .checkbox-group)');
    if (cuisineLabel) {
      cuisineLabel.textContent = i18n.t('cuisines') + ':';
    }
  },

  renderStatsView() {
    const weekStart = this.getWeekStart(this.currentWeek);
    let totalCalories = 0;
    const mealNames = new Set();

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dayKey = this.formatDate(date);
      const dayPlan = this.db.weekly_plan[dayKey];

      if (dayPlan) {
        dayPlan.meals.forEach(meal => {
          totalCalories += meal.calories || 0;
          mealNames.add(meal.name);
        });
      }
    }

    document.getElementById('weekCalories').textContent = totalCalories.toLocaleString('es-ES');
    document.getElementById('recipeVariety').textContent = mealNames.size + ' recetas';

    const recommended = this.prefs.dailyCalories * 7;
    const compliance = Math.min(100, Math.round((totalCalories / recommended) * 100));
    document.getElementById('dietCompliance').style.width = compliance + '%';
    document.getElementById('dietComplianceText').textContent = compliance + '%';
  },

  getCaloriesForMealType(type) {
    const daily = this.prefs.dailyCalories;
    const percentages = {
      breakfast: this.prefs.breakfastCal,
      lunch: this.prefs.lunchCal,
      dinner: this.prefs.dinnerCal,
      snack: this.prefs.snackCal,
    };
    return Math.round((daily * (percentages[type] || 30)) / 100);
  },

  previousWeek() {
    this.currentWeek.setDate(this.currentWeek.getDate() - 7);
    this.showWeekLabel();
    this.renderPlannerView();
  },

  nextWeek() {
    this.currentWeek.setDate(this.currentWeek.getDate() + 7);
    this.showWeekLabel();
    this.renderPlannerView();
  },

  showWeekLabel() {
    const weekStart = this.getWeekStart(this.currentWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const label = `${weekStart.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`;
    document.getElementById('weekLabel').textContent = label;
  },

  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  },

  formatDate(date) {
    return date.toISOString().split('T')[0];
  },

  getDayName(date) {
    return date.toLocaleDateString('es-ES', { weekday: 'long' }).charAt(0).toUpperCase() +
           date.toLocaleDateString('es-ES', { weekday: 'long' }).slice(1);
  },

  getMealTypeLabel(type) {
    const labels = { breakfast: 'Desayuno', lunch: 'Almuerzo', dinner: 'Cena', snack: 'Picoteo' };
    return labels[type] || type;
  },

  downloadBackup() {
    const data = {
      version: APP_VERSION,
      exported: new Date().toISOString(),
      db: this.db,
      prefs: this.prefs,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutricook-backup-${this.formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Backup descargado ✓', 'success');
  },

  async openSettingsModal() {
    const modal = document.getElementById('dayModal');
    const title = document.getElementById('dayModalTitle');
    const body = document.getElementById('dayModalBody');

    title.textContent = '⚙️ Ajustes';

    // Check current proxy status
    const status = await this.checkProxyStatus();

    const providerInfo = {
      anthropic: {
        name: 'Anthropic Claude',
        placeholder: 'sk-ant-...',
        link: 'https://console.anthropic.com/account/keys',
        description: 'Claude 3 models (Opus, Sonnet, Haiku)',
      },
      openai: {
        name: 'OpenAI GPT',
        placeholder: 'sk-...',
        link: 'https://platform.openai.com/api-keys',
        description: 'GPT-4, GPT-3.5-turbo, etc.',
      },
      gemini: {
        name: 'Google Gemini',
        placeholder: 'AIza...',
        link: 'https://aistudio.google.com/app/apikey',
        description: 'Google Gemini Pro',
      },
      groq: {
        name: 'Groq',
        placeholder: 'gsk_...',
        link: 'https://console.groq.com/keys',
        description: 'Fast inference (Mixtral, LLaMA)',
      },
    };

    body.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h3 style="margin-bottom: 16px; font-weight: 600;">Proveedor de IA</h3>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text2);">
            Selecciona el proveedor:
          </label>
          <select id="settingsProvider" onchange="app.updateProviderInfo()">
            <option value="">-- Selecciona proveedor --</option>
            <option value="anthropic" ${status.provider === 'anthropic' ? 'selected' : ''}>Anthropic Claude</option>
            <option value="openai" ${status.provider === 'openai' ? 'selected' : ''}>OpenAI GPT</option>
            <option value="gemini" ${status.provider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
            <option value="groq" ${status.provider === 'groq' ? 'selected' : ''}>Groq</option>
          </select>
        </div>

        <div id="providerHelp" style="padding: 12px; background: var(--bg3); border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 12px; color: var(--text2);">
          ${status.provider ? `<strong>${providerInfo[status.provider]?.name}</strong><br>${providerInfo[status.provider]?.description}` : 'Selecciona un proveedor para ver instrucciones'}
        </div>

        <div style="padding: 12px; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius-sm); margin-bottom: 16px;">
          <div style="font-size: 12px; color: var(--text3); margin-bottom: 8px;">Estado:</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${status.configured ? 'var(--success)' : 'var(--danger)'}; display: inline-block;"></span>
            <span style="color: ${status.configured ? 'var(--success)' : 'var(--text2)'};">
              ${status.configured ? '✓ Configurada (' + status.providerName + ', ' + status.keyPrefix + ')' : '✗ No configurada'}
            </span>
          </div>
        </div>

        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text2);">
          Ingresa tu API Key:
        </label>
        <input
          type="password"
          id="settingsApiKey"
          placeholder="Tu API key aquí..."
          style="width: 100%; padding: 10px 12px; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); margin-bottom: 16px; font-family: monospace; font-size: 12px;"
        >

        <div style="padding: 12px; background: var(--bg3); border-radius: var(--radius-sm); margin-bottom: 16px;">
          <div style="font-size: 12px; color: var(--text3); margin-bottom: 8px;">Estado:</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${status.configured ? 'var(--success)' : 'var(--danger)'}; display: inline-block;"></span>
            <span style="color: ${status.configured ? 'var(--success)' : 'var(--text2)'};">
              ${status.configured ? '✓ Configurada (' + status.keyPrefix + ')' : '✗ No configurada'}
            </span>
          </div>
        </div>

        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text2);">
          Ingresa tu API Key:
        </label>
        <input
          type="password"
          id="settingsApiKey"
          placeholder="sk-ant-..."
          style="width: 100%; padding: 10px 12px; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); margin-bottom: 16px; font-family: monospace; font-size: 12px;"
        >

        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <button class="btn-primary" onclick="app.saveApiKeyWithProvider()" style="flex: 1;">Guardar</button>
          <button class="btn-secondary" onclick="app.toggleShowApiKey()" style="flex: 1;">Ver/Ocultar</button>
        </div>

        <div id="providerLink" style="padding: 12px; background: var(--bg4); border-left: 3px solid var(--warn); border-radius: var(--radius-sm); margin-bottom: 16px;">
          <div style="font-size: 12px; color: var(--text2); line-height: 1.6;">
            ${status.provider ? `
              <strong>¿Dónde obtener tu API key?</strong><br>
              1. Ve a <a href="${status.availableProviders?.find(p => p.id === status.provider)?.link || '#'}" target="_blank" style="color: var(--accent); text-decoration: underline;">consola de ${status.providerName}</a><br>
              2. Copia tu API key<br>
              3. Pégala arriba y presiona "Guardar"
            ` : 'Selecciona un proveedor arriba para ver instrucciones'}
          </div>
        </div>
      </div>

      <div style="border-top: 1px solid var(--border); padding-top: 16px;">
        <h3 style="margin-bottom: 16px; font-weight: 600;">Importar desde archivo</h3>
        <input
          type="file"
          id="envFileInput"
          accept=".env,.txt"
          style="margin-bottom: 12px;"
        >
        <button class="btn-secondary" onclick="app.importEnvFile()" style="width: 100%; margin-bottom: 16px;">
          Importar .env
        </button>
        <div style="font-size: 12px; color: var(--text3);">
          Sube un archivo .env con: <code style="background: var(--bg3); padding: 2px 4px;">CLAUDE_API_KEY=sk-...</code>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex; gap: 12px;">
        <button class="btn-primary" onclick="app.closeModal()" style="flex: 1;">Cerrar</button>
      </div>
    `;

    modal.classList.add('active');
  },

  async checkProxyStatus() {
    try {
      const response = await fetch('http://localhost:3500/api/config/status');
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Proxy not available:', err);
      return { configured: false, keyPrefix: 'error' };
    }
  },

  updateProviderInfo() {
    const providerSelect = document.getElementById('settingsProvider');
    const provider = providerSelect.value;

    if (!provider) {
      document.getElementById('providerHelp').innerHTML = 'Selecciona un proveedor para ver instrucciones';
      return;
    }

    const providerInfoMap = {
      anthropic: {
        name: 'Anthropic Claude',
        description: 'Claude 3 models (Opus, Sonnet, Haiku)',
        placeholder: 'sk-ant-...',
      },
      openai: {
        name: 'OpenAI GPT',
        description: 'GPT-4, GPT-3.5-turbo, etc.',
        placeholder: 'sk-...',
      },
      gemini: {
        name: 'Google Gemini',
        description: 'Google Gemini Pro',
        placeholder: 'AIza...',
      },
      groq: {
        name: 'Groq',
        description: 'Fast inference (Mixtral, LLaMA)',
        placeholder: 'gsk_...',
      },
    };

    const info = providerInfoMap[provider];
    document.getElementById('providerHelp').innerHTML = `<strong>${info.name}</strong><br>${info.description}`;
    document.getElementById('settingsApiKey').placeholder = info.placeholder;
  },

  async saveApiKeyWithProvider() {
    const providerSelect = document.getElementById('settingsProvider');
    const keyInput = document.getElementById('settingsApiKey');
    const provider = providerSelect.value;
    const key = keyInput.value.trim();

    if (!provider) {
      this.showToast('Selecciona un proveedor', 'error');
      return;
    }

    if (!key) {
      this.showToast('Ingresa una API key', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:3500/api/config/set-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key }),
      });

      const result = await response.json();

      if (response.ok) {
        this.prefs.apiProvider = provider;
        this.saveData();
        this.showToast('API configurada correctamente ✓', 'success');
        keyInput.value = '';
        setTimeout(() => this.closeModal(), 1000);
      } else {
        this.showToast('Error: ' + (result.error || 'No se pudo guardar'), 'error');
      }
    } catch (err) {
      this.showToast('Error de conexión: ' + err.message, 'error');
    }
  },

  toggleShowApiKey() {
    const input = document.getElementById('settingsApiKey');
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  },

  async importEnvFile() {
    const fileInput = document.getElementById('envFileInput');
    const file = fileInput.files[0];

    if (!file) {
      this.showToast('Selecciona un archivo .env', 'error');
      return;
    }

    try {
      const content = await file.text();
      const match = content.match(/CLAUDE_API_KEY\s*=\s*(.+)/);

      if (!match) {
        this.showToast('No se encontró CLAUDE_API_KEY en el archivo', 'error');
        return;
      }

      const key = match[1].trim().replace(/['"]/g, '');

      if (!key.startsWith('sk-')) {
        this.showToast('API key inválida en el archivo', 'error');
        return;
      }

      document.getElementById('settingsApiKey').value = key;
      this.showToast('Key importada, presiona "Guardar Key"', 'success');
    } catch (err) {
      this.showToast('Error al leer archivo: ' + err.message, 'error');
    }
  },

  logout() {
    if (confirm('¿Cerrar sesión y limpiar datos?')) {
      localStorage.removeItem(DB_KEY);
      localStorage.removeItem(PREFS_KEY);
      location.reload();
    }
  },

  showLoading(text = 'Cargando...') {
    const overlay = document.getElementById('loadingOverlay');
    document.getElementById('loadingText').textContent = text;
    overlay.classList.add('active');
  },

  hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
  },

  closeModal() {
    document.getElementById('dayModal').classList.remove('active');
  },

  closeRecipeModal() {
    document.getElementById('recipeModal').classList.remove('active');
  },

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
  },

  calculateWeightGoal() {
    const age = parseInt(document.getElementById('weightAge').value) || 25;
    const gender = document.getElementById('weightGender').value;
    const height = parseInt(document.getElementById('weightHeight').value) || 170;
    const currentWeight = parseFloat(document.getElementById('weightCurrent').value) || 0;
    const targetWeight = parseFloat(document.getElementById('weightTarget').value) || 0;
    const days = parseInt(document.getElementById('weightDays').value) || 60;

    if (!currentWeight || !targetWeight || !height || !age) {
      this.showToast('Por favor completa todos los campos', 'error');
      return;
    }

    // Calcular TMB (Basal Metabolic Rate) usando Mifflin-St Jeor
    let tmb;
    if (gender === 'male') {
      tmb = (10 * currentWeight) + (6.25 * height) - (5 * age) + 5;
    } else {
      tmb = (10 * currentWeight) + (6.25 * height) - (5 * age) - 161;
    }

    // Calcular gasto calórico diario (TMB * factor de actividad moderado)
    const dailyExpenditure = Math.round(tmb * 1.55);

    // Calcular diferencia de peso
    const weightDifference = Math.abs(currentWeight - targetWeight);

    // Calcular calorías a gastar/ganar (7700 kcal = 1 kg)
    const totalCaloriesNeeded = weightDifference * 7700;

    // Calcular déficit/superávit diario requerido
    const dailyDeficit = Math.round(totalCaloriesNeeded / days);

    // Calorías recomendadas = gasto diario - déficit (si perder peso) o + superávit (si ganar)
    let recommendedCalories;
    if (currentWeight > targetWeight) {
      // Perder peso
      recommendedCalories = dailyExpenditure - dailyDeficit;
    } else {
      // Ganar peso
      recommendedCalories = dailyExpenditure + dailyDeficit;
    }

    recommendedCalories = Math.max(1200, Math.round(recommendedCalories)); // Mínimo seguro

    // Guardar datos de peso
    this.prefs.weightGoal = {
      currentWeight,
      targetWeight,
      age,
      height,
      gender,
      days,
      tmb: Math.round(tmb),
      dailyExpenditure,
      dailyDeficit: Math.abs(dailyDeficit),
      recommendedCalories,
      createdAt: new Date().toISOString(),
    };

    // Actualizar preferencias con nuevas calorías
    this.prefs.dailyCalories = recommendedCalories;

    // Inicializar historial de pesos
    if (!this.prefs.weightHistory) {
      this.prefs.weightHistory = [];
    }
    this.prefs.weightHistory = [{
      date: new Date().toISOString(),
      weight: currentWeight,
    }, ...this.prefs.weightHistory];

    this.saveData();
    this.switchView('weight');
    this.renderWeightControlView();
    this.showToast('Plan de peso calculado correctamente ✓', 'success');
  },

  recordWeightEntry() {
    const input = document.getElementById('recordWeightInput');
    const weight = parseFloat(input.value);

    if (!weight || weight <= 0) {
      this.showToast('Ingresa un peso válido', 'error');
      return;
    }

    if (!this.prefs.weightHistory) {
      this.prefs.weightHistory = [];
    }

    this.prefs.weightHistory.unshift({
      date: new Date().toISOString(),
      weight,
    });

    input.value = '';
    this.saveData();
    this.renderWeightControlView();
    this.showToast(`Peso registrado: ${weight} kg ✓`, 'success');
  },

  resetWeightGoal() {
    if (confirm('¿Eliminar meta de peso y volver a configurar?')) {
      this.prefs.weightGoal = null;
      this.prefs.weightHistory = [];
      this.saveData();
      this.renderWeightControlView();
      this.showToast('Meta de peso reiniciada', 'info');
    }
  },

  renderWeightControlView() {
    const container = document.getElementById('weightView');
    const setup = document.getElementById('weightSetup');
    const progress = document.getElementById('weightProgress');

    if (!this.prefs.weightGoal) {
      setup.style.display = 'block';
      progress.style.display = 'none';
      return;
    }

    const goal = this.prefs.weightGoal;
    const history = this.prefs.weightHistory || [];
    const currentWeight = history.length > 0 ? history[0].weight : goal.currentWeight;
    const remaining = Math.abs(goal.targetWeight - currentWeight);
    const total = Math.abs(goal.targetWeight - goal.currentWeight);
    const progress_percent = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));

    setup.style.display = 'none';
    progress.style.display = 'block';

    // Actualizar valores mostrados
    document.getElementById('displayCurrentWeight').textContent = `${currentWeight.toFixed(1)} kg`;
    document.getElementById('displayTargetWeight').textContent = `${goal.targetWeight.toFixed(1)} kg`;
    document.getElementById('displayWeightLoss').textContent = `${Math.abs(goal.currentWeight - goal.targetWeight).toFixed(1)} kg`;
    document.getElementById('displayTMB').textContent = `${goal.tmb} kcal`;
    document.getElementById('displayRecommendedCalories').textContent = `${goal.recommendedCalories} kcal`;
    document.getElementById('displayDailyDeficit').textContent = `${goal.dailyDeficit} kcal`;
    document.getElementById('displayEstimatedTime').textContent = `${goal.days} días`;

    document.getElementById('progressFill').style.width = `${progress_percent}%`;
    document.getElementById('progressPercent').textContent = `${Math.round(progress_percent)}%`;

    // Mostrar historial de pesos
    const historyContainer = document.getElementById('weightHistory');
    if (history.length > 0) {
      historyContainer.innerHTML = history.map(entry => {
        const date = new Date(entry.date).toLocaleDateString('es-ES');
        const diff = entry.weight - goal.currentWeight;
        const diffText = diff === 0 ? '' : (diff > 0 ? `+${diff.toFixed(1)} kg` : `${diff.toFixed(1)} kg`);
        const diffColor = diff > 0 && goal.currentWeight > goal.targetWeight ? 'color: var(--danger);' : diff < 0 && goal.currentWeight > goal.targetWeight ? 'color: var(--success);' : '';
        return `
          <div class="weight-history-entry">
            <div>
              <div class="weight-history-date">${date}</div>
            </div>
            <div class="weight-history-value" style="${diffColor}">
              ${entry.weight.toFixed(1)} kg ${diffText}
            </div>
          </div>
        `;
      }).join('');
    } else {
      historyContainer.innerHTML = '<div style="padding: 10px; text-align: center; color: var(--text3);">Sin registros aún</div>';
    }
  },

  changeLanguage(lang) {
    if (i18n.setLanguage(lang)) {
      this.saveData();
      this.updateUILanguage();
      this.loadPreferencesUI();
      if (this.currentView === 'weight') {
        this.renderWeightControlView();
      }
      this.showToast(i18n.t('preferencesUpdated'), 'success');
    }
  },

  updateUILanguage() {
    // Update app title
    document.querySelector('.app-title').textContent = '🍽️ NutriCook';

    // Update navigation buttons
    const navButtons = {
      'planner': i18n.t('planner'),
      'pantry': i18n.t('pantry'),
      'favorites': i18n.t('favorites'),
      'menus': i18n.t('menus'),
      'weight': i18n.t('weight'),
      'preferences': i18n.t('preferences'),
      'stats': i18n.t('stats'),
    };

    Object.entries(navButtons).forEach(([view, label]) => {
      const btn = document.querySelector(`[data-view="${view}"]`);
      if (btn) btn.textContent = label;
    });

    // Update language selector
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
      langSelect.value = i18n.currentLanguage;
    }

    // Update view headers
    const weightheader = document.querySelector('#weightView .view-header h2');
    if (weightheader) {
      weightheader.textContent = i18n.t('weight') + ' ' + i18n.t('weightControl').split(' ')[2];
    }

    const prefsHeader = document.querySelector('#preferencesView .view-header h2');
    if (prefsHeader) {
      prefsHeader.textContent = '⚙️ ' + i18n.t('preferences');
    }

    const statsHeader = document.querySelector('#statsView .view-header h2');
    if (statsHeader) {
      statsHeader.textContent = i18n.t('stats');
    }

    // Update view labels and buttons
    this.updateWeightViewLabels();
    this.updateRecipeViewLabels();
  },

  updateWeightViewLabels() {
    const weightSetup = document.getElementById('weightSetup');
    if (weightSetup) {
      const labels = weightSetup.querySelectorAll('label');
      labels.forEach(label => {
        const text = label.textContent;
        if (text.includes('Edad')) label.textContent = i18n.t('age') + ':';
        else if (text.includes('Género')) label.textContent = i18n.t('gender') + ':';
        else if (text.includes('Altura')) label.textContent = i18n.t('height') + ':';
        else if (text.includes('Peso actual')) label.textContent = i18n.t('currentWeight') + ':';
        else if (text.includes('Peso objetivo')) label.textContent = i18n.t('targetWeight') + ':';
        else if (text.includes('Días')) label.textContent = i18n.t('daysToGoal') + ':';
      });

      const calcBtn = weightSetup.querySelector('.btn-primary');
      if (calcBtn) calcBtn.textContent = i18n.t('calculatePlan');

      const select = weightSetup.querySelector('select');
      if (select) {
        const options = select.querySelectorAll('option');
        options[0].textContent = i18n.t('male');
        options[1].textContent = i18n.t('female');
      }
    }

    const recordSection = document.querySelector('[style*="margin-top: 20px"]');
    if (recordSection && recordSection.querySelector('#recordWeightInput')) {
      const h3 = recordSection.querySelector('h3');
      if (h3) h3.textContent = i18n.t('recordWeightToday');
      const btn = recordSection.querySelector('.btn-primary');
      if (btn) btn.textContent = i18n.t('record');
    }
  },

  updateRecipeViewLabels() {
    const recipesView = document.getElementById('recipesView');
    if (recipesView) {
      const tabs = recipesView.querySelectorAll('.tab-btn');
      if (tabs.length >= 3) {
        tabs[0].textContent = '🥗 ' + i18n.t('healthyRecipes');
        tabs[1].textContent = '🛒 ' + i18n.t('byIngredients');
        tabs[2].textContent = '🚫 ' + i18n.t('noAllergens');
      }

      const selects = recipesView.querySelectorAll('select');
      selects.forEach(select => {
        const options = select.querySelectorAll('option');
        if (options[1] && options[1].value === 'breakfast') {
          options[1].textContent = i18n.t('breakfast');
          options[2].textContent = i18n.t('lunch');
          options[3].textContent = i18n.t('dinner');
          options[4].textContent = i18n.t('snack');
        }
      });

      const buttons = recipesView.querySelectorAll('.btn-primary');
      buttons.forEach(btn => {
        if (btn.textContent.includes('Generar') || btn.textContent.includes('Generate')) {
          btn.textContent = i18n.t('generateRecipe');
        } else if (btn.textContent.includes('Buscar') || btn.textContent.includes('Search')) {
          btn.textContent = i18n.t('generateRecipe');
        }
      });
    }
  },

  updateSyncDot() {
    const dot = document.getElementById('syncDot');
    if (navigator.onLine) {
      dot.className = 'sync-dot online';
    } else {
      dot.className = 'sync-dot offline';
    }
  },
};

// Initialize on load
window.addEventListener('DOMContentLoaded', () => app.init());
window.addEventListener('online', () => app.updateSyncDot());
window.addEventListener('offline', () => app.updateSyncDot());

// Global reference for inline onclick
window.app = app;
