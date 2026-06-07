import { generateRecipe, generateMealPlan } from './claude-recipes.js';

const APP_VERSION = '0.1.0';
const DB_KEY = 'nutricook_db_v1';
const PREFS_KEY = 'nutricook_prefs_v1';
const LAST_UPDATE_CHECK = 'nutricook_last_update_check';

let app = {
  db: { weekly_plan: {}, history: [] },
  prefs: {
    dailyCalories: 2000,
    breakfastCal: 25,
    lunchCal: 40,
    dinnerCal: 30,
    snackCal: 5,
    allergies: [],
    cuisines: [],
    maxPrepTime: 45,
  },
  currentWeek: new Date(),
  currentView: 'planner',

  init() {
    this.registerServiceWorker();
    this.loadData();
    this.setupEventListeners();
    this.updateSyncDot();
    this.renderCurrentView();
    this.showWeekLabel();
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
        this.prefs = { ...this.prefs, ...JSON.parse(savedPrefs) };
      } catch (e) {
        console.error('Error loading prefs:', e);
      }
    }

    this.loadPreferencesUI();
  },

  saveData() {
    localStorage.setItem(DB_KEY, JSON.stringify(this.db));
    localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs));
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
    const ingredients = document.getElementById('ingredientsList').value.trim();
    if (!ingredients) {
      this.showToast('Ingresa algunos ingredientes', 'error');
      return;
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
    result.innerHTML = `
      <div class="recipe-card">
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
        <button class="btn-primary" onclick="app.addRecipeToDay()" style="margin-top: 16px; width: 100%;">
          ➕ Agregar a plan semanal
        </button>
      </div>
    `;
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
    document.getElementById('dailyCalories').value = this.prefs.dailyCalories;
    document.getElementById('breakfastCal').value = this.prefs.breakfastCal;
    document.getElementById('lunchCal').value = this.prefs.lunchCal;
    document.getElementById('dinnerCal').value = this.prefs.dinnerCal;
    document.getElementById('snackCal').value = this.prefs.snackCal;
    document.getElementById('allergies').value = this.prefs.allergies.join(', ');
    document.getElementById('maxPrepTime').value = this.prefs.maxPrepTime;

    this.prefs.cuisines.forEach(cuisine => {
      const checkbox = document.querySelector(`input[name="cuisine"][value="${cuisine}"]`);
      if (checkbox) checkbox.checked = true;
    });
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

  openSettingsModal() {
    this.showToast('Ajustes (próximamente)', 'error');
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
