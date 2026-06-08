(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function a(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=a(i);fetch(i.href,s)}})();const NC_KEY_SK="nutricook_api_key";const NC_PROV_SK="nutricook_api_provider";async function callAI(e,maxTok){const provider=localStorage.getItem(NC_PROV_SK)||"groq";const key=localStorage.getItem(NC_KEY_SK);if(!key)throw new Error("No API key. Ve a Ajustes y configura tu clave.");let text;if(provider==="anthropic"){const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-3-haiku-20240307",max_tokens:maxTok||1024,messages:[{role:"user",content:e}]})});if(!r.ok)throw new Error("API error: "+r.status);text=(await r.json()).content[0].text}else if(provider==="gemini"){const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+key,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:e}]}],generationConfig:{maxOutputTokens:maxTok||1024}})});if(!r.ok)throw new Error("API error: "+r.status);text=(await r.json()).candidates[0].content.parts[0].text}else{let baseUrl,model,extra={};if(provider==="groq"){baseUrl="https://api.groq.com/openai";model="llama-3.3-70b-versatile"}else if(provider==="openrouter"){baseUrl="https://openrouter.ai/api";model="qwen/qwen3-coder:free";extra={"HTTP-Referer":"https://jfsaints.github.io/nutricook/","X-Title":"NutriCook"}}else{baseUrl="https://api.openai.com";model="gpt-4o-mini"}const r=await fetch(baseUrl+"/v1/chat/completions",{method:"POST",headers:Object.assign({"Content-Type":"application/json","Authorization":"Bearer "+key},extra),body:JSON.stringify({model:model,max_tokens:maxTok||1024,messages:[{role:"user",content:e}]})});if(!r.ok)throw new Error("API error: "+r.status);const d=await r.json();if(!d.choices||!d.choices[0])throw new Error("Respuesta inesperada del proveedor");text=d.choices[0].message.content}return text}async function y(e){try{const text=await callAI(e+"\n\nResponde SOLO con el JSON valido, sin explicaciones adicionales.",1024);const i=text.match(/\{[\s\S]*\}/);if(!i)throw new Error("No valid JSON found");return JSON.parse(i[0])}catch(t){throw console.error("API error:",t),t}}async function $(e){try{const text=await callAI(e+"\n\nResponde SOLO con el JSON valido, sin explicaciones adicionales.",2048);const i=text.match(/\{[\s\S]*\}/);if(!i)throw new Error("No valid JSON found");return JSON.parse(i[0])}catch(t){throw console.error("API error:",t),t}}const L="0.2.2",v="nutricook_db_v1",f="nutricook_prefs_v1",S="nutricook_pantry_v1",C="nutricook_favorites_v1",B="nutricook_menus_v1",M="nutricook_disclaimer_v1",u={fresh:{label:"🥬 Productos Frescos",examples:"tomate, cebolla, ajo, zanahoria, lechuga"},proteins:{label:"🥚 Proteínas",examples:"pollo, carne, pescado, huevo"},grains:{label:"🌾 Granos y Cereales",examples:"arroz, pasta, pan, avena"},legumes:{label:"🫘 Legumbres",examples:"lentejas, garbanzos, frijoles"},spices:{label:"🧂 Especias y Condimentos",examples:"sal, pimienta, comino, orégano"},dairy:{label:"🥛 Lácteos",examples:"leche, queso, yogur, mantequilla"},oils:{label:"🫒 Aceites y Grasas",examples:"aceite oliva, aceite girasol"},canned:{label:"🥫 Conservas",examples:"tomate, atún, maíz, frijoles"},sauces:{label:"🍯 Salsas y Aderezos",examples:"mayonesa, salsa soja, vinagre"},other:{label:"📦 Otros",examples:"harina, azúcar, café, té"}};let h={db:{weekly_plan:{},history:[]},pantry:{fresh:[],proteins:[],grains:[],legumes:[],spices:[],dairy:[],oils:[],canned:[],sauces:[],other:[]},prefs:{dailyCalories:2e3,breakfastCal:25,lunchCal:40,dinnerCal:30,snackCal:5,allergies:[],cuisines:[],maxPrepTime:45,apiProvider:null},currentWeek:new Date,currentView:"planner",currentRecipe:null,favorites:{recipes:[]},menus:{saved:[]},init(){i18n.init(),this.registerServiceWorker(),this.loadData(),this.setupEventListeners(),this.updateSyncDot(),this.showDisclaimerIfNeeded(),this.renderCurrentView(),this.showWeekLabel(),this.updateUILanguage()},registerServiceWorker(){"serviceWorker"in navigator&&navigator.serviceWorker.register("sw.js").then(e=>console.log("SW registered")).catch(e=>console.log("SW registration failed:",e))},loadData(){const e=localStorage.getItem(v),t=localStorage.getItem(f),a=localStorage.getItem(S),n=localStorage.getItem(C),i=localStorage.getItem(B);if(e)try{this.db=JSON.parse(e)}catch(s){console.error("Error loading DB:",s),this.db={weekly_plan:{},history:[]}}if(t)try{const s=JSON.parse(t);this.prefs={...this.prefs,...s},s.language&&i18n.setLanguage(s.language)}catch(s){console.error("Error loading prefs:",s)}if(a)try{this.pantry={...this.pantry,...JSON.parse(a)}}catch(s){console.error("Error loading pantry:",s)}if(n)try{this.favorites=JSON.parse(n)}catch(s){console.error("Error loading favorites:",s)}if(i)try{this.menus=JSON.parse(i)}catch(s){console.error("Error loading menus:",s)}this.loadPreferencesUI()},saveData(){this.prefs.language=i18n.currentLanguage,localStorage.setItem(v,JSON.stringify(this.db)),localStorage.setItem(f,JSON.stringify(this.prefs)),localStorage.setItem(S,JSON.stringify(this.pantry)),localStorage.setItem(C,JSON.stringify(this.favorites)),localStorage.setItem(B,JSON.stringify(this.menus))},setupEventListeners(){document.querySelectorAll(".nav-btn").forEach(t=>{t.addEventListener("click",a=>{const n=a.target.dataset.view;this.switchView(n)})}),document.getElementById("prevWeek").addEventListener("click",()=>this.previousWeek()),document.getElementById("nextWeek").addEventListener("click",()=>this.nextWeek()),document.getElementById("generatePlan").addEventListener("click",()=>this.openGeneratePlanModal()),document.querySelectorAll(".tab-btn").forEach(t=>{t.addEventListener("click",a=>this.switchTab(a.target))}),document.getElementById("backupBtn").addEventListener("click",()=>this.downloadBackup()),document.getElementById("settingsBtn").addEventListener("click",()=>this.openSettingsModal()),document.getElementById("logoutBtn").addEventListener("click",()=>this.logout());const e=document.getElementById("addIngredientBtn");e&&e.addEventListener("click",()=>this.openAddIngredientModal()),document.getElementById("dayModal").addEventListener("click",t=>{t.target.id==="dayModal"&&this.closeModal()}),document.getElementById("recipeModal").addEventListener("click",t=>{t.target.id==="recipeModal"&&this.closeRecipeModal()})},switchView(e){this.currentView=e,document.querySelectorAll(".view").forEach(t=>t.classList.remove("active")),document.getElementById(e+"View").classList.add("active"),document.querySelectorAll(".nav-btn").forEach(t=>t.classList.remove("active")),document.querySelector(`[data-view="${e}"]`).classList.add("active"),e==="planner"?this.renderPlannerView():e==="pantry"?this.renderPantryView():e==="favorites"?this.renderFavoritesView():e==="menus"?this.renderMenusView():e==="weight"?this.renderWeightControlView():e==="stats"&&this.renderStatsView()},switchTab(e){const t=e.dataset.tab;document.querySelectorAll(".tab-btn").forEach(a=>a.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(a=>a.classList.remove("active")),e.classList.add("active"),document.querySelector(`[data-tab="${t}"]`).classList.add("active")},renderPantryView(){const e=document.getElementById("pantryCategories");e.innerHTML="";let t=0;if(Object.keys(u).forEach(a=>{t+=this.pantry[a].length}),t===0){e.innerHTML=`
        <div class="pantry-empty">
          <div class="pantry-empty-icon">🛒</div>
          <div class="pantry-empty-text">
            Tu despensa está vacía.<br>
            Agrega ingredientes para generar recetas personalizadas.
          </div>
        </div>
      `;return}Object.keys(u).forEach(a=>{const n=u[a],i=this.pantry[a]||[];if(i.length>0){const s=document.createElement("div");s.className="pantry-category",s.innerHTML=`
          <div class="pantry-category-header">
            <span class="pantry-category-title">${n.label}</span>
            <span class="pantry-category-count">${i.length}</span>
          </div>
          <div class="pantry-ingredients">
            ${i.map(o=>`
              <div class="pantry-ingredient">
                <span class="pantry-ingredient-name">${o}</span>
                <div class="pantry-ingredient-actions">
                  <button class="pantry-ingredient-btn" onclick="app.removeIngredient('${a}', '${o}')">✕</button>
                </div>
              </div>
            `).join("")}
          </div>
        `,e.appendChild(s)}})},openAddIngredientModal(){const e=document.getElementById("dayModal"),t=document.getElementById("dayModalTitle"),a=document.getElementById("dayModalBody");t.textContent="➕ Agregar Ingrediente";const n=Object.entries(u).map(([i,s])=>`<option value="${i}">${s.label}</option>`).join("");a.innerHTML=`
      <div class="form-group">
        <label>Categoría:</label>
        <select id="ingredientCategory">
          ${n}
        </select>
      </div>
      <div class="form-group">
        <label>Nombre del ingrediente:</label>
        <input type="text" id="ingredientName" placeholder="Ej: tomate cherry" autofocus>
      </div>
      <div class="form-group" id="examplesHint" style="font-size: 12px; color: var(--text3); padding: 8px; background: var(--bg3); border-radius: var(--radius-sm);">
        Ejemplos: ${u.fresh.examples}
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn-primary" onclick="app.addIngredient()" style="flex: 1;">Agregar</button>
        <button class="btn-secondary" onclick="app.closeModal()" style="flex: 1;">Cancelar</button>
      </div>
    `,document.getElementById("ingredientCategory").addEventListener("change",i=>{const s=u[i.target.value];document.getElementById("examplesHint").textContent="Ejemplos: "+s.examples}),e.classList.add("active"),document.getElementById("ingredientName").focus()},addIngredient(){const e=document.getElementById("ingredientCategory").value,t=document.getElementById("ingredientName").value.trim().toLowerCase();if(!t){this.showToast("Ingresa el nombre del ingrediente","error");return}if(this.pantry[e].includes(t)){this.showToast("Este ingrediente ya está en tu despensa","error");return}this.pantry[e].push(t),this.pantry[e].sort(),this.saveData(),this.currentView==="pantry"&&this.renderPantryView(),this.closeModal(),this.showToast(`${t} agregado a ${u[e].label} ✓`,"success")},removeIngredient(e,t){confirm(`¿Quitar "${t}" de tu despensa?`)&&(this.pantry[e]=this.pantry[e].filter(a=>a!==t),this.saveData(),this.currentView==="pantry"&&this.renderPantryView(),this.showToast(`${t} removido ✓`,"success"))},getPantryIngredientsAsText(){const e=[];return Object.values(this.pantry).forEach(t=>{e.push(...t)}),e.join(", ")},renderFavoritesView(){const e=document.getElementById("favoritesList"),t=document.getElementById("createMenuBtn");if(!this.favorites.recipes||this.favorites.recipes.length===0){e.innerHTML=`
        <div style="text-align: center; padding: 40px; color: var(--text3);">
          <div style="font-size: 48px; margin-bottom: 16px;">🤍</div>
          <div>No hay recetas favoritas aún.</div>
          <div style="font-size: 12px; margin-top: 8px;">Agrega recetas a favoritas desde 🔍 Recetas</div>
        </div>
      `,t.style.display="none";return}t.style.display="inline-block",e.innerHTML=this.favorites.recipes.map(a=>`
      <div class="recipe-card">
        <div class="recipe-title">${a.name}</div>
        <div class="recipe-meta">
          <span>⏱️ ${a.time||"—"} min</span>
          <span>🔥 ${a.calories||"—"} kcal</span>
        </div>
        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <button class="btn-primary" onclick="app.addRecipeToDay()" style="flex: 1; font-size: 12px;">Agregar</button>
          <button class="btn-secondary" onclick="app.removeRecipeFromFavorites('${a.name}')" style="flex: 0.5; font-size: 12px;">✕</button>
        </div>
      </div>
    `).join("")},renderMenusView(){const e=document.getElementById("menusList");if(!this.menus.saved||this.menus.saved.length===0){e.innerHTML=`
        <div style="text-align: center; padding: 40px; color: var(--text3);">
          <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
          <div>No hay menús guardados.</div>
          <div style="font-size: 12px; margin-top: 8px;">Crea menús desde tus recetas favoritas</div>
        </div>
      `;return}e.innerHTML=`
      <div class="menus-grid">
        ${this.menus.saved.map(t=>`
          <div class="menu-card">
            <div class="menu-header">
              <h3>${t.name}</h3>
              <button onclick="app.removeMenu('${t.id}')" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 16px;">✕</button>
            </div>

            <div class="menu-meals">
              <div class="menu-meal">
                <span style="color: var(--text2); font-size: 12px;">Desayuno</span>
                <div>${t.breakfast.name}</div>
                <div style="font-size: 12px; color: var(--text3);">${t.breakfast.calories} kcal</div>
              </div>

              <div class="menu-meal">
                <span style="color: var(--text2); font-size: 12px;">Almuerzo</span>
                <div>${t.lunch.name}</div>
                <div style="font-size: 12px; color: var(--text3);">${t.lunch.calories} kcal</div>
              </div>

              <div class="menu-meal">
                <span style="color: var(--text2); font-size: 12px;">Cena</span>
                <div>${t.dinner.name}</div>
                <div style="font-size: 12px; color: var(--text3);">${t.dinner.calories} kcal</div>
            </div>

            <div style="padding-top: 12px; border-top: 1px solid var(--border); margin-top: 12px;">
              <div style="font-weight: 600; color: var(--accent);">${t.totalCalories} kcal total</div>
              <button class="btn-primary" onclick="app.openDayMenuSelector('${t.id}')" style="width: 100%; margin-top: 12px; font-size: 12px;">
                📅 Aplicar a un día
              </button>
            </div>
          </div>
        `).join("")}
      </div>
    `},removeMenu(e){confirm("¿Eliminar este menú?")&&(this.menus.saved=this.menus.saved.filter(t=>t.id!==e),this.saveData(),this.renderMenusView(),this.showToast("Menú eliminado","success"))},openDayMenuSelector(e){const t=document.getElementById("dayModal"),a=document.getElementById("dayModalTitle"),n=document.getElementById("dayModalBody");a.textContent="📅 Selecciona un día";const i=this.getWeekStart(this.currentWeek),s=[];for(let o=0;o<7;o++){const r=new Date(i);r.setDate(r.getDate()+o);const l=this.formatDate(r),d=this.getDayName(r);s.push({key:l,name:d,date:r.toLocaleDateString("es-ES",{month:"short",day:"numeric"})})}n.innerHTML=`
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        ${s.map(o=>`
          <button class="btn-secondary" onclick="app.applyFavoriteMenuToDay('${o.key}', '${e}')" style="padding: 16px; text-align: center;">
            <div style="font-weight: 600;">${o.name}</div>
            <div style="font-size: 12px; color: var(--text3);">${o.date}</div>
          </button>
        `).join("")}
      </div>
      <button class="btn-secondary" onclick="app.closeModal()" style="width: 100%; margin-top: 16px;">Cancelar</button>
    `,t.classList.add("active")},renderCurrentView(){this.switchView(this.currentView)},renderPlannerView(){const e=this.getWeekStart(this.currentWeek),t=document.getElementById("daysGrid");t.innerHTML="";for(let a=0;a<7;a++){const n=new Date(e);n.setDate(n.getDate()+a);const i=this.formatDate(n),s=this.db.weekly_plan[i]||{meals:[]},o=document.createElement("div");o.className="day-card",o.innerHTML=`
        <div class="day-header">
          <div>
            <div class="day-title">${this.getDayName(n)}</div>
            <div class="day-date">${n.toLocaleDateString("es-ES",{month:"short",day:"numeric"})}</div>
          </div>
        </div>
        <div class="meals">
          ${s.meals.map(r=>`
            <div class="meal">
              <div class="meal-type">${this.getMealTypeLabel(r.type)}</div>
              <div class="meal-name">${r.name}</div>
              <div class="meal-calories">${r.calories||"—"} kcal</div>
              <div class="meal-actions">
                <button class="meal-action" onclick="app.editMeal('${i}', '${r.type}')">✏️ Editar</button>
                <button class="meal-action" onclick="app.removeMeal('${i}', '${r.type}')">🗑️ Quitar</button>
              </div>
            </div>
          `).join("")}
        </div>
        <div style="margin-top: 16px;">
          <button class="btn-secondary" onclick="app.openDayModal('${i}')" style="width: 100%;">
            ➕ Agregar comida
          </button>
        </div>
      `,t.appendChild(o)}},openDayModal(e){const t=document.getElementById("dayModal"),a=document.getElementById("dayModalTitle"),n=document.getElementById("dayModalBody"),i=new Date(e);a.textContent=`${this.getDayName(i)} - ${i.toLocaleDateString("es-ES")}`,n.innerHTML=`
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
        <button class="btn-primary" onclick="app.addMealToDay('${e}')">Agregar</button>
        <button class="btn-secondary" onclick="app.closeModal()" style="flex: 1;">Cancelar</button>
      </div>
    `,t.classList.add("active")},addMealToDay(e){const t=document.getElementById("mealType").value,a=document.getElementById("mealName").value.trim(),n=parseInt(document.getElementById("mealCalories").value)||0,i=document.getElementById("mealIngredients").value.trim(),s=document.getElementById("mealPrep").value.trim();if(!a){this.showToast("Por favor ingresa el nombre de la receta","error");return}this.db.weekly_plan[e]||(this.db.weekly_plan[e]={meals:[]}),this.db.weekly_plan[e].meals=this.db.weekly_plan[e].meals.filter(o=>o.type!==t),this.db.weekly_plan[e].meals.push({type:t,name:a,calories:n,ingredients:i,prep:s,added:new Date().toISOString()}),this.saveData(),this.renderPlannerView(),this.closeModal(),this.showToast("Comida agregada ✓","success")},editMeal(e,t){const n=this.db.weekly_plan[e].meals.find(r=>r.type===t);if(!n)return;const i=document.getElementById("dayModal"),s=document.getElementById("dayModalTitle"),o=document.getElementById("dayModalBody");s.textContent="Editar comida",o.innerHTML=`
      <div class="form-group">
        <label>Nombre de la receta:</label>
        <input type="text" id="editMealName" value="${n.name}">
      </div>
      <div class="form-group">
        <label>Calorías:</label>
        <input type="number" id="editMealCalories" value="${n.calories}" min="0">
      </div>
      <div class="form-group">
        <label>Ingredientes:</label>
        <textarea id="editMealIngredients" style="width: 100%; height: 80px; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg3); color: var(--text); font-family: inherit;">${n.ingredients||""}</textarea>
      </div>
      <div class="form-group">
        <label>Preparación:</label>
        <textarea id="editMealPrep" style="width: 100%; height: 80px; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg3); color: var(--text); font-family: inherit;">${n.prep||""}</textarea>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn-primary" onclick="app.updateMeal('${e}', '${t}')">Guardar</button>
        <button class="btn-secondary" onclick="app.closeModal()" style="flex: 1;">Cancelar</button>
      </div>
    `,i.classList.add("active")},updateMeal(e,t){const a=document.getElementById("editMealName").value.trim(),n=parseInt(document.getElementById("editMealCalories").value)||0,i=document.getElementById("editMealIngredients").value.trim(),s=document.getElementById("editMealPrep").value.trim();if(!a){this.showToast("Por favor ingresa el nombre","error");return}const o=this.db.weekly_plan[e].meals.find(r=>r.type===t);o&&(o.name=a,o.calories=n,o.ingredients=i,o.prep=s),this.saveData(),this.renderPlannerView(),this.closeModal(),this.showToast("Comida actualizada ✓","success")},removeMeal(e,t){confirm("¿Quitar esta comida?")&&(this.db.weekly_plan[e].meals=this.db.weekly_plan[e].meals.filter(a=>a.type!==t),this.saveData(),this.renderPlannerView(),this.showToast("Comida eliminada","success"))},openGeneratePlanModal(){const e=document.getElementById("dayModal"),t=document.getElementById("dayModalTitle"),a=document.getElementById("dayModalBody");t.textContent="Generar plan semanal",a.innerHTML=`
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
    `,e.classList.add("active")},async generateHealthyPlan(){this.closeModal(),this.showLoading("Generando plan saludable...");try{const e=this.getWeekStart(this.currentWeek),t=`Crea un plan de comidas semanal saludable (lunes a domingo) con:
- Desayuno, almuerzo y cena cada día
- Máximo ${this.prefs.maxPrepTime} minutos de preparación
- Variedad de alimentos
- Aproximadamente ${this.prefs.dailyCalories} calorías diarias
- Sin: ${this.prefs.allergies.join(", ")||"ningún ingrediente específico"}

Devuelve un JSON con estructura:
{
  "lunes": { "breakfast": {"name": "...", "calories": 350}, "lunch": {...}, "dinner": {...} },
  ...
}`,a=await $(t);a&&(this.loadPlanToWeek(a,e),this.renderPlannerView(),this.hideLoading(),this.showToast("Plan generado ✓","success"))}catch(e){this.hideLoading(),this.showToast("Error al generar plan: "+e.message,"error")}},async generateByMyIngredients(){this.closeModal();const ing=this.getPantryIngredientsAsText();if(!ing){this.showToast("Tu despensa esta vacia. Agrega ingredientes en la pestana Despensa.","error");return}this.showLoading("Generando plan con tus ingredientes...");try{const e=this.getWeekStart(this.currentWeek),t=`Crea un plan de comidas semanal (lunes a domingo) usando principalmente estos ingredientes disponibles: ${ing}.
- Desayuno, almuerzo y cena cada dia
- Maximo ${this.prefs.maxPrepTime} minutos de preparacion
- Aproximadamente ${this.prefs.dailyCalories} calorias diarias
- Sin: ${this.prefs.allergies.join(", ")||"ningun ingrediente especifico"}

Devuelve un JSON con estructura:
{
  "lunes": { "breakfast": {"name": "...", "calories": 350}, "lunch": {...}, "dinner": {...} },
  ...
}`,a=await $(t);a&&(this.loadPlanToWeek(a,e),this.renderPlannerView(),this.hideLoading(),this.showToast("Plan generado","success"))}catch(e){this.hideLoading(),this.showToast("Error al generar plan: "+e.message,"error")}},async generateAvoidingAllergies(){this.closeModal();const al=this.prefs.allergies.join(", ");if(!al){this.showToast("No tienes alergenos configurados. Ve a Preferencias para agregarlos.","error");return}this.showLoading("Generando plan sin alergenos...");try{const e=this.getWeekStart(this.currentWeek),t=`Crea un plan de comidas semanal saludable (lunes a domingo).
- DEBE evitar completamente: ${al}
- Desayuno, almuerzo y cena cada dia
- Maximo ${this.prefs.maxPrepTime} minutos de preparacion
- Aproximadamente ${this.prefs.dailyCalories} calorias diarias
- Variedad de alimentos

Devuelve un JSON con estructura:
{
  "lunes": { "breakfast": {"name": "...", "calories": 350}, "lunch": {...}, "dinner": {...} },
  ...
}`,a=await $(t);a&&(this.loadPlanToWeek(a,e),this.renderPlannerView(),this.hideLoading(),this.showToast("Plan generado","success"))}catch(e){this.hideLoading(),this.showToast("Error al generar plan: "+e.message,"error")}},loadPlanToWeek(e,t){["lunes","martes","miércoles","jueves","viernes","sábado","domingo"].forEach((n,i)=>{var l,d,p,c,m,g,b,x,w,I,k,E;const s=new Date(t);s.setDate(s.getDate()+i);const o=this.formatDate(s),r=e[n.toLowerCase()]||{};this.db.weekly_plan[o]={meals:[{type:"breakfast",name:((l=r.breakfast)==null?void 0:l.name)||"Desayuno",calories:((d=r.breakfast)==null?void 0:d.calories)||350,ingredients:((p=r.breakfast)==null?void 0:p.ingredients)||"",prep:((c=r.breakfast)==null?void 0:c.prep)||"",added:new Date().toISOString()},{type:"lunch",name:((m=r.lunch)==null?void 0:m.name)||"Almuerzo",calories:((g=r.lunch)==null?void 0:g.calories)||650,ingredients:((b=r.lunch)==null?void 0:b.ingredients)||"",prep:((x=r.lunch)==null?void 0:x.prep)||"",added:new Date().toISOString()},{type:"dinner",name:((w=r.dinner)==null?void 0:w.name)||"Cena",calories:((I=r.dinner)==null?void 0:I.calories)||500,ingredients:((k=r.dinner)==null?void 0:k.ingredients)||"",prep:((E=r.dinner)==null?void 0:E.prep)||"",added:new Date().toISOString()}]}}),this.saveData()},async generateHealthyRecipe(){const e=document.getElementById("mealTypeHealthy").value;if(!e){this.showToast("Selecciona un tipo de comida","error");return}this.showLoading("Generando receta...");try{const t=`Crea una receta saludable para ${e==="breakfast"?"desayuno":e==="lunch"?"almuerzo":e==="dinner"?"cena":"picoteo"}.
- Calorías: ${this.getCaloriesForMealType(e)}
- Máximo ${this.prefs.maxPrepTime} minutos
- Sin: ${this.prefs.allergies.join(", ")||"ningún ingrediente específico"}

Devuelve JSON con: {"name": "...", "calories": 350, "time": 30, "ingredients": ["..."], "steps": ["1. ...", "2. ..."], "tags": ["vegetariano", "rápido"]}`,a=await y(t);a&&this.displayRecipe(a)}catch(t){this.showToast("Error: "+t.message,"error")}finally{this.hideLoading()}},async generateByIngredients(){let e=document.getElementById("ingredientsList").value.trim();if(!e){const t=this.getPantryIngredientsAsText();if(t)if(confirm(`¿Usar los ingredientes de tu despensa? (${t.substring(0,50)}...)`))e=t;else{this.showToast("Ingresa algunos ingredientes","error");return}else{this.showToast("Ingresa ingredientes o agrega a tu Despensa","error");return}}this.showLoading("Buscando recetas...");try{const t=`Crea una receta deliciosa usando estos ingredientes: ${e}.
- Máximo ${this.prefs.maxPrepTime} minutos
- Sin: ${this.prefs.allergies.join(", ")||"ningún ingrediente específico"}
- Aproximadamente 400-600 calorías

Devuelve JSON con: {"name": "...", "calories": 500, "time": 30, "ingredients": ["..."], "steps": ["1. ...", "2. ..."], "tags": [...]}`,a=await y(t);a&&this.displayRecipe(a)}catch(t){this.showToast("Error: "+t.message,"error")}finally{this.hideLoading()}},async generateWithoutAllergies(){const e=document.getElementById("allergiesList").value.trim(),t=document.getElementById("mealTypeAllergies").value;if(!e||!t){this.showToast("Completa todos los campos","error");return}this.showLoading("Generando receta adaptada...");try{const a=`Crea una receta adaptada para ${t==="breakfast"?"desayuno":t==="lunch"?"almuerzo":"cena"}.
- DEBE evitar completamente: ${e}
- Máximo ${this.prefs.maxPrepTime} minutos
- Aproximadamente ${this.getCaloriesForMealType(t)} calorías
- Deliciosa y nutritiva

Devuelve JSON con: {"name": "...", "calories": 350, "time": 30, "ingredients": ["..."], "steps": ["1. ...", "2. ..."], "tags": [...]}`,n=await y(a);n&&this.displayRecipe(n)}catch(a){this.showToast("Error: "+a.message,"error")}finally{this.hideLoading()}},displayRecipe(e){const t=document.getElementById("recipeResult");this.generateRecipeImage(e),t.innerHTML=`
      <div class="recipe-card">
        <div id="recipeImage" style="width: 100%; height: 250px; background: var(--bg3); border-radius: var(--radius); margin-bottom: 16px; display: flex; align-items: center; justify-content: center; color: var(--text3); font-size: 12px;">
          <div style="text-align: center;">
            <div class="spinner" style="margin: 0 auto 8px;"></div>
            Generando imagen...
          </div>
        </div>

        <div class="recipe-title">${e.name}</div>
        <div class="recipe-meta">
          <span>⏱️ ${e.time||"—"} min</span>
          <span>🔥 ${e.calories||"—"} kcal</span>
        </div>
        <div class="recipe-tags">
          ${(e.tags||[]).map(a=>`<div class="tag">${a}</div>`).join("")}
        </div>
        <div style="margin-top: 16px;">
          <h4 style="margin-bottom: 8px;">Ingredientes:</h4>
          <ul style="margin-left: 20px; color: var(--text2);">
            ${(e.ingredients||[]).map(a=>`<li>${a}</li>`).join("")}
          </ul>
        </div>
        <div style="margin-top: 16px;">
          <h4 style="margin-bottom: 8px;">Preparación:</h4>
          <ol style="margin-left: 20px; color: var(--text2);">
            ${(e.steps||[]).map(a=>`<li>${a}</li>`).join("")}
          </ol>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 16px;">
          <button class="btn-primary" onclick="app.addRecipeToDay()" style="flex: 1;">
            ➕ Agregar a plan semanal
          </button>
          <button id="favBtn" class="btn-secondary" onclick="app.toggleFavoriteRecipe(app.currentRecipe)" style="flex: 0.5;">
            ${this.isFavoriteRecipe(e)?"❤️":"🤍"}
          </button>
        </div>
      </div>
    `,this.currentRecipe=e,this.updateFavoriteButton(e)},async generateRecipeImage(e){try{const t=`A delicious, appetizing photo of ${e.name}, professional food photography, well-plated, studio lighting, high quality`,a=`recipe_img_${e.name.toLowerCase().replace(/\s+/g,"_")}`,n=localStorage.getItem(a);if(n){const i=document.getElementById("recipeImage");i&&(i.innerHTML=`<img src="${n}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius);" alt="${e.name}">`);return}this.generateImageHuggingFace(t,a,e.name)}catch(t){console.error("Image generation error:",t);const a=document.getElementById("recipeImage");a&&(a.innerHTML='<div style="font-size: 48px; opacity: 0.3;">🍽️</div>')}},async generateImageHuggingFace(e,t,a){try{const n=await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",{headers:{Accept:"image/png"},method:"POST",body:JSON.stringify({inputs:e,negative_prompt:"blurry, low quality, distorted"})});if(n.ok){const i=await n.blob(),s=URL.createObjectURL(i),o=new FileReader;o.readAsDataURL(i),o.onload=()=>{const l=o.result;if(l.length<5e5)try{localStorage.setItem(t,l)}catch{console.log("Cache storage full, skipping image cache")}};const r=document.getElementById("recipeImage");r&&(r.innerHTML=`<img src="${s}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius);" alt="${a}">`)}else this.showRecipePlaceholder(a)}catch(n){console.error("Hugging Face API error:",n),this.showRecipePlaceholder(a)}},showRecipePlaceholder(e){const t=document.getElementById("recipeImage");if(t){const a=["🍽️","🥘","🍜","🍲","🥗","🍛","🍝","🥘","🍱","🥙"],n=a[Math.floor(Math.random()*a.length)];t.innerHTML=`
        <div style="text-align: center; font-size: 60px; opacity: 0.5;">
          ${n}
        </div>
      `}},toggleFavoriteRecipe(e){this.isFavoriteRecipe(e)?(this.removeRecipeFromFavorites(e.name),this.showToast("Receta removida de favoritos","success")):(this.addRecipeToFavorites(e),this.showToast("Receta agregada a favoritos ❤️","success")),this.updateFavoriteButton(e)},isFavoriteRecipe(e){return this.favorites.recipes.some(t=>t.name===e.name)},addRecipeToFavorites(e){this.isFavoriteRecipe(e)||(this.favorites.recipes.push({id:this.generateId(),...e,addedToFavorites:new Date().toISOString()}),this.saveData())},removeRecipeFromFavorites(e){this.favorites.recipes=this.favorites.recipes.filter(t=>t.name!==e),this.saveData()},generateId(){return"id_"+Date.now()+"_"+Math.random().toString(36).substr(2,9)},getFavoriteRecipesByType(e){const t=this.favorites.recipes||[];return e?t.filter(a=>{const n=a.calories||0;return e==="breakfast"?n<300||n>=300&&n<=600:e==="lunch"?n>=600&&n<=800:e==="dinner"?n>=500&&n<=700:!0}):t},createFavoriteMenuModal(){if(this.favorites.recipes.length<2){this.showToast("Necesitas al menos 2 recetas favoritas","error");return}const e=document.getElementById("dayModal"),t=document.getElementById("dayModalTitle"),a=document.getElementById("dayModalBody");t.textContent="❤️ Crear Menú Favorito";const n=this.favorites.recipes.filter(o=>!o.type||o.type==="breakfast"||(o.calories||0)<400),i=this.favorites.recipes.filter(o=>!o.type||o.type==="lunch"||(o.calories||0)>=400&&(o.calories||0)<=800),s=this.favorites.recipes.filter(o=>!o.type||o.type==="dinner"||(o.calories||0)>=400&&(o.calories||0)<=700);a.innerHTML=`
      <div class="form-group">
        <label>Nombre del menú:</label>
        <input type="text" id="menuName" placeholder="Ej: Menú Saludable Lunes" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg3); color: var(--text);">
      </div>

      <div class="form-group">
        <label>Desayuno:</label>
        <select id="menuBreakfast" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg3); color: var(--text);">
          <option value="">-- Selecciona desayuno --</option>
          ${n.map(o=>`<option value="${o.id}">${o.name} (${o.calories} kcal)</option>`).join("")}
        </select>
      </div>

      <div class="form-group">
        <label>Almuerzo:</label>
        <select id="menuLunch" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg3); color: var(--text);">
          <option value="">-- Selecciona almuerzo --</option>
          ${i.map(o=>`<option value="${o.id}">${o.name} (${o.calories} kcal)</option>`).join("")}
        </select>
      </div>

      <div class="form-group">
        <label>Cena:</label>
        <select id="menuDinner" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg3); color: var(--text);">
          <option value="">-- Selecciona cena --</option>
          ${s.map(o=>`<option value="${o.id}">${o.name} (${o.calories} kcal)</option>`).join("")}
        </select>
      </div>

      <div style="display: flex; gap: 12px;">
        <button class="btn-primary" onclick="app.saveFavoriteMenu()" style="flex: 1;">Guardar Menú</button>
        <button class="btn-secondary" onclick="app.closeModal()" style="flex: 1;">Cancelar</button>
      </div>
    `,e.classList.add("active")},saveFavoriteMenu(){const e=document.getElementById("menuName").value.trim(),t=document.getElementById("menuBreakfast").value,a=document.getElementById("menuLunch").value,n=document.getElementById("menuDinner").value;if(!e||!t||!a||!n){this.showToast("Completa todos los campos","error");return}const i=this.favorites.recipes.find(l=>l.id===t),s=this.favorites.recipes.find(l=>l.id===a),o=this.favorites.recipes.find(l=>l.id===n),r={id:this.generateId(),name:e,breakfast:{...i},lunch:{...s},dinner:{...o},totalCalories:(i.calories||0)+(s.calories||0)+(o.calories||0),created:new Date().toISOString()};this.menus.saved.push(r),this.saveData(),this.closeModal(),this.showToast(`Menú "${e}" guardado ❤️`,"success")},applyFavoriteMenuToDay(e,t){const a=this.menus.saved.find(n=>n.id===t);a&&(this.db.weekly_plan[e]||(this.db.weekly_plan[e]={meals:[]}),this.db.weekly_plan[e].meals=[{type:"breakfast",name:a.breakfast.name,calories:a.breakfast.calories,ingredients:a.breakfast.ingredients,prep:a.breakfast.prep,added:new Date().toISOString()},{type:"lunch",name:a.lunch.name,calories:a.lunch.calories,ingredients:a.lunch.ingredients,prep:a.lunch.prep,added:new Date().toISOString()},{type:"dinner",name:a.dinner.name,calories:a.dinner.calories,ingredients:a.dinner.ingredients,prep:a.dinner.prep,added:new Date().toISOString()}],this.saveData(),this.renderPlannerView(),this.showToast(`Menú "${a.name}" aplicado al día ✓`,"success"))},updateFavoriteButton(e){const t=document.getElementById("favBtn");if(t){const a=this.isFavoriteRecipe(e);t.textContent=a?"❤️ En favoritos":"🤍 Agregar a favoritos",t.style.background=a?"var(--danger)":"var(--accent)"}},savePreferences(){this.prefs.dailyCalories=parseInt(document.getElementById("dailyCalories").value)||2e3,this.prefs.breakfastCal=parseInt(document.getElementById("breakfastCal").value)||25,this.prefs.lunchCal=parseInt(document.getElementById("lunchCal").value)||40,this.prefs.dinnerCal=parseInt(document.getElementById("dinnerCal").value)||30,this.prefs.snackCal=parseInt(document.getElementById("snackCal").value)||5,this.prefs.allergies=document.getElementById("allergies").value.split(",").map(e=>e.trim()).filter(e=>e),this.prefs.maxPrepTime=parseInt(document.getElementById("maxPrepTime").value)||45,this.prefs.cuisines=Array.from(document.querySelectorAll('input[name="cuisine"]:checked')).map(e=>e.value),this.saveData(),this.showToast("Preferencias guardadas ✓","success")},loadPreferencesUI(){const e=document.getElementById("languageSelect");e&&(e.value=i18n.currentLanguage);const t=document.getElementById("dailyCalories");t&&(t.value=this.prefs.dailyCalories,(t.parentElement.querySelector("label")||{}).textContent=i18n.t("dailyCaloriesLabel")+":");const a=document.getElementById("breakfastCal");a&&(a.value=this.prefs.breakfastCal,(a.parentElement.querySelector("label")||{}).textContent=i18n.t("breakfastPercentage")+" (%): ");const n=document.getElementById("lunchCal");n&&(n.value=this.prefs.lunchCal,(n.parentElement.querySelector("label")||{}).textContent=i18n.t("lunchPercentage")+" (%): ");const i=document.getElementById("dinnerCal");i&&(i.value=this.prefs.dinnerCal,(i.parentElement.querySelector("label")||{}).textContent=i18n.t("dinnerPercentage")+" (%): ");const s=document.getElementById("snackCal");s&&(s.value=this.prefs.snackCal,(s.parentElement.querySelector("label")||{}).textContent=i18n.t("snackPercentage")+" (%): ");const o=document.getElementById("allergies");o&&(o.value=this.prefs.allergies.join(", "),(o.parentElement.querySelector("label")||{}).textContent=i18n.t("allergies")+":",o.placeholder="Ej: "+(i18n.currentLanguage==="es"?"lácteos, gluten":"dairy, gluten"));const r=document.getElementById("maxPrepTime");r&&(r.value=this.prefs.maxPrepTime,(r.parentElement.querySelector("label")||{}).textContent=i18n.t("maxPrepTime")+":"),document.querySelectorAll('input[name="cuisine"]').forEach(c=>{c.checked=this.prefs.cuisines.includes(c.value)});const d=document.querySelector("#preferencesView .btn-primary");d&&(d.textContent=i18n.t("save"));const p=document.querySelector("label:has(+ .checkbox-group)");p&&(p.textContent=i18n.t("cuisines")+":")},renderStatsView(){const e=this.getWeekStart(this.currentWeek);let t=0;const a=new Set;for(let s=0;s<7;s++){const o=new Date(e);o.setDate(o.getDate()+s);const r=this.formatDate(o),l=this.db.weekly_plan[r];l&&l.meals.forEach(d=>{t+=d.calories||0,a.add(d.name)})}document.getElementById("weekCalories").textContent=t.toLocaleString("es-ES"),document.getElementById("recipeVariety").textContent=a.size+" recetas";const n=this.prefs.dailyCalories*7,i=Math.min(100,Math.round(t/n*100));document.getElementById("dietCompliance").style.width=i+"%",document.getElementById("dietComplianceText").textContent=i+"%"},getCaloriesForMealType(e){const t=this.prefs.dailyCalories,a={breakfast:this.prefs.breakfastCal,lunch:this.prefs.lunchCal,dinner:this.prefs.dinnerCal,snack:this.prefs.snackCal};return Math.round(t*(a[e]||30)/100)},previousWeek(){this.currentWeek.setDate(this.currentWeek.getDate()-7),this.showWeekLabel(),this.renderPlannerView()},nextWeek(){this.currentWeek.setDate(this.currentWeek.getDate()+7),this.showWeekLabel(),this.renderPlannerView()},showWeekLabel(){const e=this.getWeekStart(this.currentWeek),t=new Date(e);t.setDate(t.getDate()+6);const a=`${e.toLocaleDateString("es-ES",{month:"short",day:"numeric"})} - ${t.toLocaleDateString("es-ES",{month:"short",day:"numeric"})}`;document.getElementById("weekLabel").textContent=a},getWeekStart(e){const t=new Date(e),a=t.getDay(),n=t.getDate()-a+(a===0?-6:1);return new Date(t.setDate(n))},formatDate(e){return e.toISOString().split("T")[0]},getDayName(e){return e.toLocaleDateString("es-ES",{weekday:"long"}).charAt(0).toUpperCase()+e.toLocaleDateString("es-ES",{weekday:"long"}).slice(1)},getMealTypeLabel(e){return{breakfast:"Desayuno",lunch:"Almuerzo",dinner:"Cena",snack:"Picoteo"}[e]||e},downloadBackup(){const e={version:L,exported:new Date().toISOString(),db:this.db,prefs:this.prefs},t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),a=URL.createObjectURL(t),n=document.createElement("a");n.href=a,n.download=`nutricook-backup-${this.formatDate(new Date)}.json`,n.click(),URL.revokeObjectURL(a),this.showToast("Backup descargado ✓","success")},async openSettingsModal(){var s,o,r,l;const e=document.getElementById("dayModal"),t=document.getElementById("dayModalTitle"),a=document.getElementById("dayModalBody");t.textContent="⚙️ Ajustes";const n=await this.checkProxyStatus(),i={anthropic:{name:"Anthropic Claude",placeholder:"sk-ant-...",link:"https://console.anthropic.com/account/keys",description:"Claude 3 Haiku — compatible con web"},openai:{name:"OpenAI GPT",placeholder:"sk-...",link:"https://platform.openai.com/api-keys",description:"GPT-4o-mini — compatible con web"},gemini:{name:"Google Gemini",placeholder:"AIza...",link:"https://aistudio.google.com/app/apikey",description:"Gemini 2.0 Flash — compatible con web ⭐"},groq:{name:"Groq",placeholder:"gsk_...",link:"https://console.groq.com/keys",description:"Llama 3.3 70B — gratis, rápido ⭐ Recomendado"},openrouter:{name:"OpenRouter (Qwen)",placeholder:"sk-or-v1-...",link:"https://openrouter.ai/keys",description:"Qwen3 Coder gratis - compatible con web"}};a.innerHTML=`
      <div style="margin-bottom: 24px;">
        <h3 style="margin-bottom: 16px; font-weight: 600;">Proveedor de IA</h3>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text2);">
            Selecciona el proveedor:
          </label>
          <select id="settingsProvider" onchange="app.updateProviderInfo()">
            <option value="">-- Selecciona proveedor --</option>
            <option value="anthropic" ${n.provider==="anthropic"?"selected":""}>Anthropic Claude</option>
            <option value="openai" ${n.provider==="openai"?"selected":""}>OpenAI GPT</option>
            <option value="gemini" ${n.provider==="gemini"?"selected":""}>Google Gemini</option>
            <option value="groq" ${n.provider==="groq"?"selected":""}>Groq</option><option value="openrouter" ${n.provider==="openrouter"?"selected":""}>OpenRouter (Qwen3 Coder gratis)</option>
          </select>
        </div>

        <div id="providerHelp" style="padding: 12px; background: var(--bg3); border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 12px; color: var(--text2);">
          ${n.provider?`<strong>${(s=i[n.provider])==null?void 0:s.name}</strong><br>${(o=i[n.provider])==null?void 0:o.description}`:"Selecciona un proveedor para ver instrucciones"}
        </div>

        <div style="padding: 12px; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius-sm); margin-bottom: 16px;">
          <div style="font-size: 12px; color: var(--text3); margin-bottom: 8px;">Estado:</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${n.configured?"var(--success)":"var(--danger)"}; display: inline-block;"></span>
            <span style="color: ${n.configured?"var(--success)":"var(--text2)"};">
              ${n.configured?"✓ Configurada ("+n.providerName+", "+n.keyPrefix+")":"✗ No configurada"}
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

        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <button class="btn-primary" onclick="app.saveApiKeyWithProvider()" style="flex: 1;">Guardar</button>
          <button class="btn-secondary" onclick="app.toggleShowApiKey()" style="flex: 1;">Ver/Ocultar</button>
        </div>

        <div id="providerLink" style="padding: 12px; background: var(--bg4); border-left: 3px solid var(--warn); border-radius: var(--radius-sm); margin-bottom: 16px;">
          <div style="font-size: 12px; color: var(--text2); line-height: 1.6;">
            ${n.provider?`
              <strong>¿Dónde obtener tu API key?</strong><br>
              1. Ve a <a href="${((l=(r=n.availableProviders)==null?void 0:r.find(d=>d.id===n.provider))==null?void 0:l.link)||"#"}" target="_blank" style="color: var(--accent); text-decoration: underline;">consola de ${n.providerName}</a><br>
              2. Copia tu API key<br>
              3. Pégala arriba y presiona "Guardar"
            `:"Selecciona un proveedor arriba para ver instrucciones"}
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
    `,e.classList.add("active")},async checkProxyStatus(){const key=localStorage.getItem("nutricook_api_key");const provider=localStorage.getItem("nutricook_api_provider");const names={"anthropic":"Anthropic Claude","openai":"OpenAI GPT","gemini":"Google Gemini","groq":"Groq","openrouter":"OpenRouter (Qwen)"};if(key&&provider){return{configured:!0,provider:provider,providerName:names[provider]||provider,keyPrefix:key.substring(0,8)+"..."}}return{configured:!1,provider:"",providerName:"",keyPrefix:""}},updateProviderInfo(){const t=document.getElementById("settingsProvider").value;if(!t){document.getElementById("providerHelp").innerHTML="Selecciona un proveedor para ver instrucciones";return}const n={anthropic:{name:"Anthropic Claude",description:"Claude 3 models (Opus, Sonnet, Haiku)",placeholder:"sk-ant-..."},openai:{name:"OpenAI GPT",description:"GPT-4, GPT-3.5-turbo, etc.",placeholder:"sk-..."},gemini:{name:"Google Gemini",description:"Google Gemini Pro",placeholder:"AIza..."},groq:{name:"Groq",description:"Fast inference (Mixtral, LLaMA)",placeholder:"gsk_..."},openrouter:{name:"OpenRouter (Qwen)",description:"Qwen3 Coder gratis via OpenRouter",placeholder:"sk-or-v1-..."}}[t];document.getElementById("providerHelp").innerHTML=`<strong>${n.name}</strong><br>${n.description}`,document.getElementById("settingsApiKey").placeholder=n.placeholder},async saveApiKeyWithProvider(){const e=document.getElementById("settingsProvider"),t=document.getElementById("settingsApiKey"),a=e.value,n=t.value.trim();if(!a){this.showToast("Selecciona un proveedor","error");return}if(!n){this.showToast("Ingresa una API key","error");return}localStorage.setItem("nutricook_api_key",n);localStorage.setItem("nutricook_api_provider",a);this.prefs.apiProvider=a;this.saveData();this.showToast("API configurada correctamente ✓","success");t.value="";setTimeout(()=>this.closeModal(),1e3)},toggleShowApiKey(){const e=document.getElementById("settingsApiKey");e&&(e.type=e.type==="password"?"text":"password")},async importEnvFile(){const t=document.getElementById("envFileInput").files[0];if(!t){this.showToast("Selecciona un archivo .env","error");return}try{const n=(await t.text()).match(/CLAUDE_API_KEY\s*=\s*(.+)/);if(!n){this.showToast("No se encontró CLAUDE_API_KEY en el archivo","error");return}const i=n[1].trim().replace(/['"]/g,"");if(!i.startsWith("sk-")){this.showToast("API key inválida en el archivo","error");return}document.getElementById("settingsApiKey").value=i,this.showToast('Key importada, presiona "Guardar Key"',"success")}catch(a){this.showToast("Error al leer archivo: "+a.message,"error")}},logout(){confirm("¿Cerrar sesión y limpiar datos?")&&(localStorage.removeItem(v),localStorage.removeItem(f),location.reload())},showLoading(e="Cargando..."){const t=document.getElementById("loadingOverlay");document.getElementById("loadingText").textContent=e,t.classList.add("active")},hideLoading(){document.getElementById("loadingOverlay").classList.remove("active")},closeModal(){document.getElementById("dayModal").classList.remove("active")},closeRecipeModal(){document.getElementById("recipeModal").classList.remove("active")},showToast(e,t="info"){const a=document.getElementById("toast");a.textContent=e,a.className=`toast show ${t}`,setTimeout(()=>a.classList.remove("show"),3e3)},calculateWeightGoal(){const e=parseInt(document.getElementById("weightAge").value)||25,t=document.getElementById("weightGender").value,a=parseInt(document.getElementById("weightHeight").value)||170,n=parseFloat(document.getElementById("weightCurrent").value)||0,i=parseFloat(document.getElementById("weightTarget").value)||0,s=parseInt(document.getElementById("weightDays").value)||60;if(!n||!i||!a||!e){this.showToast("Por favor completa todos los campos","error");return}let o;t==="male"?o=10*n+6.25*a-5*e+5:o=10*n+6.25*a-5*e-161;const r=Math.round(o*1.55),d=Math.abs(n-i)*7700,p=Math.round(d/s);let c;n>i?c=r-p:c=r+p,c=Math.max(1200,Math.round(c)),this.prefs.weightGoal={currentWeight:n,targetWeight:i,age:e,height:a,gender:t,days:s,tmb:Math.round(o),dailyExpenditure:r,dailyDeficit:Math.abs(p),recommendedCalories:c,createdAt:new Date().toISOString()},this.prefs.dailyCalories=c,this.prefs.weightHistory||(this.prefs.weightHistory=[]),this.prefs.weightHistory=[{date:new Date().toISOString(),weight:n},...this.prefs.weightHistory],this.saveData(),this.switchView("weight"),this.renderWeightControlView(),this.showToast("Plan de peso calculado correctamente ✓","success")},recordWeightEntry(){const e=document.getElementById("recordWeightInput"),t=parseFloat(e.value);if(!t||t<=0){this.showToast("Ingresa un peso válido","error");return}this.prefs.weightHistory||(this.prefs.weightHistory=[]),this.prefs.weightHistory.unshift({date:new Date().toISOString(),weight:t}),e.value="",this.saveData(),this.renderWeightControlView(),this.showToast(`Peso registrado: ${t} kg ✓`,"success")},resetWeightGoal(){confirm("¿Eliminar meta de peso y volver a configurar?")&&(this.prefs.weightGoal=null,this.prefs.weightHistory=[],this.saveData(),this.renderWeightControlView(),this.showToast("Meta de peso reiniciada","info"))},renderWeightControlView(){document.getElementById("weightView");const e=document.getElementById("weightSetup"),t=document.getElementById("weightProgress");if(!this.prefs.weightGoal){e.style.display="block",t.style.display="none";return}const a=this.prefs.weightGoal,n=this.prefs.weightHistory||[],i=n.length>0?n[0].weight:a.currentWeight,s=Math.abs(a.targetWeight-i),o=Math.abs(a.targetWeight-a.currentWeight),r=Math.max(0,Math.min(100,(o-s)/o*100));e.style.display="none",t.style.display="block",document.getElementById("displayCurrentWeight").textContent=`${i.toFixed(1)} kg`,document.getElementById("displayTargetWeight").textContent=`${a.targetWeight.toFixed(1)} kg`,document.getElementById("displayWeightLoss").textContent=`${Math.abs(a.currentWeight-a.targetWeight).toFixed(1)} kg`,document.getElementById("displayTMB").textContent=`${a.tmb} kcal`,document.getElementById("displayRecommendedCalories").textContent=`${a.recommendedCalories} kcal`,document.getElementById("displayDailyDeficit").textContent=`${a.dailyDeficit} kcal`,document.getElementById("displayEstimatedTime").textContent=`${a.days} días`,document.getElementById("progressFill").style.width=`${r}%`,document.getElementById("progressPercent").textContent=`${Math.round(r)}%`;const l=document.getElementById("weightHistory");n.length>0?l.innerHTML=n.map(d=>{const p=new Date(d.date).toLocaleDateString("es-ES"),c=d.weight-a.currentWeight,m=c===0?"":c>0?`+${c.toFixed(1)} kg`:`${c.toFixed(1)} kg`,g=c>0&&a.currentWeight>a.targetWeight?"color: var(--danger);":c<0&&a.currentWeight>a.targetWeight?"color: var(--success);":"";return`
          <div class="weight-history-entry">
            <div>
              <div class="weight-history-date">${p}</div>
            </div>
            <div class="weight-history-value" style="${g}">
              ${d.weight.toFixed(1)} kg ${m}
            </div>
          </div>
        `}).join(""):l.innerHTML='<div style="padding: 10px; text-align: center; color: var(--text3);">Sin registros aún</div>'},showDisclaimerIfNeeded(){if(!localStorage.getItem(M)){const t=document.getElementById("disclaimerModal");t&&(t.style.display="flex")}},acceptDisclaimer(){localStorage.setItem(M,"true");const e=document.getElementById("disclaimerModal");e&&(e.style.display="none")},changeLanguage(e){i18n.setLanguage(e)&&(this.saveData(),this.updateUILanguage(),this.loadPreferencesUI(),this.currentView==="weight"&&this.renderWeightControlView(),this.showToast(i18n.t("preferencesUpdated"),"success"))},updateUILanguage(){document.querySelector(".app-title").textContent="🍽️ NutriCook";const e={planner:i18n.t("planner"),pantry:i18n.t("pantry"),favorites:i18n.t("favorites"),menus:i18n.t("menus"),weight:i18n.t("weight"),preferences:i18n.t("preferences"),stats:i18n.t("stats")};Object.entries(e).forEach(([s,o])=>{const r=document.querySelector(`[data-view="${s}"]`);r&&(r.textContent=o)});const t=document.getElementById("languageSelect");t&&(t.value=i18n.currentLanguage);const a=document.querySelector("#weightView .view-header h2");a&&(a.textContent="⚖️ "+i18n.t("weightControl"));const n=document.querySelector("#preferencesView .view-header h2");n&&(n.textContent="⚙️ "+i18n.t("preferences"));const i=document.querySelector("#statsView .view-header h2");i&&(i.textContent=i18n.t("stats")),this.updateWeightViewLabels(),this.updateRecipeViewLabels()},updateWeightViewLabels(){const e=document.getElementById("weightSetup");if(e){e.querySelectorAll("label").forEach(s=>{const o=s.textContent;o.includes("Edad")?s.textContent=i18n.t("age")+":":o.includes("Género")?s.textContent=i18n.t("gender")+":":o.includes("Altura")?s.textContent=i18n.t("height")+":":o.includes("Peso actual")?s.textContent=i18n.t("currentWeight")+":":o.includes("Peso objetivo")?s.textContent=i18n.t("targetWeight")+":":o.includes("Días")&&(s.textContent=i18n.t("daysToGoal")+":")});const n=e.querySelector(".btn-primary");n&&(n.textContent=i18n.t("calculatePlan"));const i=e.querySelector("select");if(i){const s=i.querySelectorAll("option");s[0].textContent=i18n.t("male"),s[1].textContent=i18n.t("female")}}const t=document.querySelector('[style*="margin-top: 20px"]');if(t&&t.querySelector("#recordWeightInput")){const a=t.querySelector("h3");a&&(a.textContent=i18n.t("recordWeightToday"));const n=t.querySelector(".btn-primary");n&&(n.textContent=i18n.t("record"))}},updateRecipeViewLabels(){const e=document.getElementById("recipesView");if(e){const t=e.querySelectorAll(".tab-btn");t.length>=3&&(t[0].textContent="🥗 "+i18n.t("healthyRecipes"),t[1].textContent="🛒 "+i18n.t("byIngredients"),t[2].textContent="🚫 "+i18n.t("noAllergens")),e.querySelectorAll("select").forEach(i=>{const s=i.querySelectorAll("option");s[1]&&s[1].value==="breakfast"&&(s[1].textContent=i18n.t("breakfast"),s[2]&&(s[2].textContent=i18n.t("lunch")),s[3]&&(s[3].textContent=i18n.t("dinner")),s[4]&&(s[4].textContent=i18n.t("snack")))}),e.querySelectorAll(".btn-primary").forEach(i=>{(i.textContent.includes("Generar")||i.textContent.includes("Generate")||i.textContent.includes("Buscar")||i.textContent.includes("Search"))&&(i.textContent=i18n.t("generateRecipe"))})}},updateSyncDot(){const e=document.getElementById("syncDot");navigator.onLine?e.className="sync-dot online":e.className="sync-dot offline"}};document.readyState==="loading"?window.addEventListener("DOMContentLoaded",()=>h.init()):h.init();window.addEventListener("online",()=>h.updateSyncDot());window.addEventListener("offline",()=>h.updateSyncDot());window.app=h;
