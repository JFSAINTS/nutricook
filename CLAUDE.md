# CLAUDE.md — NutriCook

Contexto del proyecto para Claude Code. Resumen de estructura, flujo y decisiones de diseño.

---

## ¿Qué es NutriCook?

**NutriCook** es una PWA (Progressive Web App) vanilla JS/HTML/CSS para planificar comidas semanales saludables.

### Características principales
- **Plan semanal** (lunes-domingo) con desayuno, almuerzo, cena y picoteos
- **Generación inteligente de recetas** via Claude API:
  - Recetas saludables y equilibradas
  - Recetas basadas en ingredientes disponibles
  - Recetas adaptadas para alergias/intolerancias
- **Información calórica** por comida y control diario
- **Preferencias personalizables**: calorías diarias, restricciones dietéticas, tiempos de preparación
- **Estadísticas semanales**: calorías totales, variedad de recetas, cumplimiento de dieta
- **Offline-first**: datos en `localStorage`, funciona sin conexión
- **Versiones**: web (navegador) + APK (Android)

---

## Estructura de archivos

```
D:\NUTRICOOK\
├── index.html           ← App principal (PWA shell)
├── app.js               ← Lógica JS (~900 líneas, modular)
├── styles.css           ← Estilos tema verde (~700 líneas)
├── claude-recipes.js    ← Integración Claude API
├── manifest.json        ← PWA manifest + shortcuts
├── sw.js                ← Service Worker (cache offline)
├── package.json         ← Metadatos npm
├── CLAUDE.md            ← Este archivo
├── .claude/
│   └── launch.json      ← Servidor local Python puerto 3456
└── icons/
    └── icon-*.png       ← Iconos PWA múltiples tamaños (pendiente)
```

---

## Tecnología

- **Frontend**: vanilla JS (ES modules) + HTML5 + CSS3
- **BD local**: `localStorage` (key: `nutricook_db_v1`)
- **AI**: Claude API (Anthropic) para generar recetas y planes
- **PWA**: Service Worker para offline, manifest.json para instalación
- **Servidor web**: Python `http.server` puerto 3456
- **API Proxy**: Node.js `api-proxy.js` puerto 3500 (protege API key)

---

## Servidor de desarrollo

### Setup inicial (2 opciones)

**Opción 1: Variable de entorno (terminal)**
```powershell
# Elige proveedor: anthropic, openai, gemini, groq
$env:NUTRICOOK_PROVIDER = "anthropic"
$env:NUTRICOOK_API_KEY = "sk-ant-your-key-here"
.\dev.ps1
# Abre: http://localhost:3456
```

**Opción 2: Desde la app (UI - Recomendado)**
```powershell
.\dev.ps1
# Sin variables de entorno
# Abre: http://localhost:3456
# Ve a ⚙️ Ajustes
# Selecciona proveedor (dropdown)
# Ingresa tu API key
# Presiona Guardar
```

### Arquitectura de seguridad
- **Frontend** (port 3456): no almacena API key, envía solo al proxy local
- **API Proxy** (port 3500): recibe key del usuario (una vez), la guarda en memoria
- **Storage**: key en memoria del proxy, no en disco ni localStorage
- **Seguridad**: al cerrar proxy se pierde la key (sesión segura)

### Proveedores Soportados

El proxy soporta múltiples proveedores LLM con payload/response normalization:

**1. Anthropic Claude** (`sk-ant-*`)
```
Modelo: Claude 3 (Opus, Sonnet, Haiku)
Endpoint: https://api.anthropic.com/v1/messages
Header: x-api-key
```

**2. OpenAI GPT** (`sk-*`)
```
Modelo: GPT-4, GPT-3.5-turbo
Endpoint: https://api.openai.com/v1/chat/completions
Header: Authorization: Bearer <key>
```

**3. Google Gemini** (`AIza*`)
```
Modelo: Gemini Pro
Endpoint: https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent
Query: ?key=<key>
```

**4. Groq** (`gsk_*`)
```
Modelo: Mixtral 8x7B, LLaMA 2
Endpoint: https://api.groq.com/openai/v1/chat/completions
Header: Authorization: Bearer <key>
```

### Cómo funciona el routing

1. Frontend envía request a proxy (sin key)
2. Proxy detecta provider configurado
3. Proxy transforma el payload según formato de cada provider
4. Proxy añade headers/auth específicos
5. Proxy parsea respuesta y normaliza a formato standard
6. Respuesta normalizada vuelve al frontend
7. Frontend nunca sabe qué provider se usó

**Ventaja:** Cambiar de provider es instantáneo, sin recargar la app.

### Archivos
- `dev.ps1` — script que inicia web + proxy
- `api-proxy.js` — servidor Node.js que protege API key
- `.env.example` — template para variables de entorno
- `test-recipes.js` — script de prueba para generar planes

---

## Estructura de datos

### Base de datos (`nutricook_db_v1`)
```js
{
  "weekly_plan": {
    "2026-01-13": {
      "meals": [
        {
          "type": "breakfast",        // breakfast|lunch|dinner|snack
          "name": "Tostadas de aguacate",
          "calories": 350,
          "ingredients": "Pan integral, aguacate, limón, sal",
          "prep": "1. Tuesta el pan...",
          "added": "2026-01-13T08:30:00Z"
        },
        ...
      ]
    },
    "2026-01-14": { ... },
    ...
  },
  "history": [
    { "date": "2026-01-13", "meals": [...], "totalCalories": 1900 }
  ]
}
```

### Preferencias (`nutricook_prefs_v1`)
```js
{
  "dailyCalories": 2000,          // Calorías objetivo
  "breakfastCal": 25,            // % del total
  "lunchCal": 40,                // %
  "dinnerCal": 30,               // %
  "snackCal": 5,                 // %
  "allergies": ["gluten", "lácteos"],
  "cuisines": ["mediterranean", "vegetarian"],
  "maxPrepTime": 45              // minutos
}
```

### Despensa (`nutricook_pantry_v1`)
```js
{
  "fresh": ["tomate", "cebolla", "ajo", "lechuga"],
  "proteins": ["pollo", "huevo", "salmón"],
  "grains": ["arroz", "pasta", "pan integral"],
  "legumes": ["lentejas", "garbanzos"],
  "spices": ["sal", "pimienta", "comino"],
  "dairy": ["leche", "queso feta", "yogur"],
  "oils": ["aceite oliva", "aceite girasol"],
  "canned": ["tomate triturado", "atún"],
  "sauces": ["mayonesa", "vinagre"],
  "other": ["harina", "azúcar"]
}
```

---

## Flujos principales

### 1. Despensa (nuevo)
- Usuario navega a **🛒 Despensa** en sidebar
- Ve todos sus ingredientes organizados por 10 categorías
- Botón **➕ Agregar Ingrediente** abre modal
- Selecciona categoría (Productos Frescos, Proteínas, etc.)
- Ingresa nombre (Ej: "tomate cherry")
- Se guarda en localStorage + se ordena alfabéticamente
- Botón ✕ en cada ingrediente lo remove
- Al generar recetas "Por ingredientes", sugiere usar pantry

### 2. Plan semanal
- Usuario navega entre semanas con `← →`
- Cada día muestra tarjeta con comidas del plan
- Botón "Generar Semana" abre modal con 3 opciones:
  - **Plan saludable**: genera automáticamente basado en preferencias
  - **Por ingredientes**: usa ingredientes ingresados O los de la despensa
  - **Sin alérgenos**: el usuario especifica qué evitar

### 3. Generación de recetas via Claude
```
usuario escribe prompt →
  → fetch a Claude API
    → JSON con {name, calories, time, ingredients, steps, tags}
      → muestra receta en UI
        → botón "Agregar a plan" → inserta en weekly_plan
```

Modelo usado: `claude-opus-4-1` (máximo token, mejor calidad)

### 3. Preferencias personalizables
- Calorías diarias + distribución por comida (%)
- Alérgenos/intolerancias
- Preferencias de cocina (mediterránea, vegana, etc.)
- Tiempo máximo de preparación

Se guardan en `localStorage` para persistencia offline.

### 4. Estadísticas
- Total de calorías en la semana
- Recetas únicas (variedad)
- % de cumplimiento de dieta (calorías reales vs. objetivo)
- Gráficos simples en barras/números

---

## Componentes clave

### `app.js` — Estado y lógica global

**Objeto `app`:**
- `db`: datos semanales
- `prefs`: preferencias usuario
- `currentWeek`: fecha actual de la semana
- `currentView`: vista activa (planner/recipes/preferences/stats)

**Métodos principales:**
- `init()` — bootstrap: cargar datos, listeners, renderizar
- `switchView(name)` — cambiar de vista (planner, pantry, recipes, preferences, stats)
- `renderPlannerView()` — renderizar plan semanal
- `renderPantryView()` — renderizar despensa por categorías
- `openAddIngredientModal()` — modal para agregar ingrediente
- `addIngredient()` — guardar ingrediente en despensa
- `removeIngredient(category, ingredient)` — eliminar de despensa
- `getPantryIngredientsAsText()` — retorna todos los ingredientes como string
- `generateHealthyRecipe()` — generar receta vía Claude
- `addMealToDay(dayKey)` — insertar comida en un día
- `saveData()` / `loadData()` — persistencia localStorage
- `showToast(msg, type)` — notificaciones
- `showLoading(text)` / `hideLoading()` — overlay de carga

### `claude-recipes.js` — Integración API

**Funciones export:**
- `generateRecipe(prompt)` — 1 receta basada en prompt libre
- `generateMealPlan(prompt)` — plan de 7 días

Ambas:
1. Hacen fetch a `https://api.anthropic.com/v1/messages`
2. Extraen JSON de la respuesta (pueden estar en markdown code blocks)
3. Devuelven objeto parseado

⚠️ **IMPORTANTE**: La API key está hardcodeada actualmente. En producción, usar un proxy backend.

### UI Componentes

**Sidebar**
- Logo + sync dot
- Nav buttons (Plan, Recetas, Preferencias, Stats)
- Botones: Backup, Ajustes, Logout

**Vista Plan Semanal**
- Controles: semana anterior/siguiente, label semana, botón generar
- Grid de 7 tarjetas (1 por día)
- Cada tarjeta: comidas, calorías, botones editar/quitar, botón agregar

**Vista Buscar Recetas**
- 3 tabs: Saludables, Por Ingredientes, Sin Alérgenos
- Input fields + botón generar
- Resultado: tarjeta de receta con ingredientes, pasos, botón agregar

**Vista Preferencias**
- Inputs: calorías, distribución %, alérgenos, cocinas, tiempo prep
- Guardar en localStorage

**Vista Estadísticas**
- Calorías totales semana
- Variedad de recetas
- Barra de progreso % dieta

---

## Tema de color

```css
--bg: #0e0e12;        /* Fondo oscuro profundo */
--bg2: #16161d;       /* Cards, sidebar */
--bg3: #1e1e28;       /* Inputs, hover */
--bg4: #26263a;       /* Elementos inactivos */
--accent: #10b981;    /* Verde (diferente a Collectr púrpura) */
--accent2: #34d399;   /* Verde claro */
--accent3: #6ee7b7;   /* Verde muy claro */
--gold: #f5c842;      /* Estrellas rating (si se agrega) */
--text: #e8e8f0;      /* Texto principal */
--text2: #9898b0;     /* Texto secundario */
--text3: #5a5a78;     /* Texto terciario */
--border: rgba(16,185,129,0.15);
--border2: rgba(16,185,129,0.35);
```

Tema oscuro tipo Collectr pero con acento verde (nutricional, saludable).

---

## Flujo de deployment

### Versión Web (navegador)
```powershell
cd D:\NUTRICOOK
python -m http.server 3456
# Abre: http://localhost:3456/index.html
```

Publicar en:
- GitHub Pages (repo público)
- Netlify / Vercel (automático desde git)
- Servidor propio (HTTPS requerido para PWA)

### Versión Android APK

Opciones:
1. **Android TWA** (Trusted Web Activity) — wrapea la web en APK nativo
   - Similar a Collectr: repositorio separado `android-twa`
   - Carga contenido desde GitHub Pages (URL fija)
   - Solo recompilar si cambian iconos/manifest
   - Requisitos: Java 21, Android SDK, Gradle

2. **Capacitor** (Ionic)
   - Build: `npm run build:android`
   - Genera APK de producción

3. **React Native** (si queremos ir más allá)
   - Completo, pero requiere reescribir app
   - No recomendado para MVP

**Recomendación**: Usar Android TWA (como Collectr) para MVP.

---

## Instalación y desarrollo

### Requisitos
- Node.js 18+ (opcional, solo para build tools)
- Python 3.8+ (dev server)
- Git

### Setup inicial
```powershell
git clone https://github.com/JFSAINTS/nutricook D:\NUTRICOOK
cd D:\NUTRICOOK
python -m http.server 3456
# Abre: http://localhost:3456
```

### Con vite (opcional, para assets)
```powershell
npm install
npm run dev          # dev server con HMR
npm run build        # producción
```

---

## Checklist de features MVP (v0.1.0)

### Completado
- [x] UI base: sidebar, vistas, modales
- [x] Plan semanal: crear/editar/eliminar comidas
- [x] Despensa: organizar ingredientes por 10 categorías
- [x] Preferencias: guardar configuración
- [x] Búsqueda de recetas: 3 métodos (saludables, ingredientes, alérgenos)
- [x] Multi-provider API: Anthropic, OpenAI, Gemini, Groq
- [x] Imágenes de recetas: Stable Diffusion (Hugging Face)
- [x] Fondo kawaii: diseño cute con elementos de comida
- [x] Integración API: generación de recetas
- [x] localStorage: persistencia offline
- [x] Service Worker: offline mode
- [x] Estadísticas básicas: calorías, variedad
- [x] API proxy: protección de keys
- [x] Tests: pantry, config, mock, multi-provider

### Pendiente
- [ ] Crear iconos PWA finales (16, 32, 48, 128, 192, 256, 512px)
- [ ] Screenshots PWA (narrow 540x720, wide 1280x720)
- [ ] Android APK (Electron + TWA)
- [ ] GitHub Pages deployment
- [ ] Auto-update check (como Collectr)
- [ ] Historial de comidas (recetas que usé)
- [ ] Compartir planes (Firebase Firestore opcional)
- [ ] Rating de recetas (⭐)

---

## Variables de entorno (si usamos build tool)

```bash
VITE_CLAUDE_API_KEY=sk-...
VITE_API_URL=https://api.anthropic.com/v1/messages
```

Para desarrollo local sin backend:
- Claude API key debe guardarse en navegador (inseguro)
- Mejor: proxy NodeJS simple que pase requests a Claude

---

## Notas de desarrollo

1. **Sin frameworks**: mantener como vanilla JS para simplificar builds
2. **Offline first**: todo funciona sin conexión, API es plus
3. **Modular**: `app.js` es el core, `claude-recipes.js` es plug-in
4. **Mobile-first**: responsive en sidebar en móvil (flex-direction: row)
5. **Tema consistente**: verde como Collectr usa púrpura
6. **Nomenclatura**: `nutricook_*` para localStorage, evitar colisiones

---

## Comandos útiles

```powershell
# Dev server
python -m http.server 3456

# Push a GitHub
git -C D:\NUTRICOOK add -A
git -C D:\NUTRICOOK commit -m "feat: descripción"
git -C D:\NUTRICOOK push origin main

# Crear release
gh release create v0.1.0 --title "NutriCook v0.1.0" --notes "Primera versión..."
```

---

## Próximas sesiones

1. Crear iconos PWA (usar Pillow o Figma)
2. Setup proxy backend para Claude API
3. Build Android APK
4. Deploy a GitHub Pages
5. Agregar historial de recetas
6. Compartir planes vía Firebase (opcional)
7. Tests + CI/CD

---

## Cambios sesión 2026-06-07 (v0.2.0) — Control de Peso

### Nueva vista: ⚖️ Control de Peso

Integración completa de un sistema de control de peso basado en cálculos nutricionales:

**Funcionalidades:**
- **Formulario de meta de peso**:
  - Edad, género (M/F), altura (cm)
  - Peso actual y peso objetivo
  - Días para lograr la meta
  
- **Cálculos automáticos** (Mifflin-St Jeor):
  - **TMB (Tasa Metabólica Basal)**: energía en reposo
  - **Gasto calórico diario**: TMB × 1.55 (actividad moderada)
  - **Déficit/Superávit diario**: basado en 7700 kcal por kg
  - **Calorías recomendadas**: gasto - déficit (perder peso) o gasto + superávit (ganar peso)
  - Mínimo seguro: 1200 kcal/día

- **Seguimiento de progreso**:
  - Barra de progreso visual con porcentaje
  - Historial de pesos registrados por fecha
  - Indicadores de progreso (rojo/verde) según dirección
  - Cálculo automático de peso actual desde historial

- **Integración con calorías diarias**:
  - Las calorías recomendadas se guardan en `prefs.dailyCalories`
  - El plan de comidas se ajusta automáticamente
  - Se mantiene la distribución por tipo de comida (desayuno 25%, almuerzo 40%, etc.)

**Métodos en `app.js`:**
- `calculateWeightGoal()`: calcula BMR, déficit, y calorías recomendadas
- `recordWeightEntry()`: registra peso diario y actualiza historial
- `renderWeightControlView()`: renderiza vista completa o formulario de setup
- `resetWeightGoal()`: limpia meta y vuelve a formulario

**Almacenamiento:**
- `this.prefs.weightGoal`: { currentWeight, targetWeight, age, height, gender, days, tmb, dailyExpenditure, dailyDeficit, recommendedCalories, createdAt }
- `this.prefs.weightHistory`: [ { date: ISO, weight: kg }, ... ]
- `this.prefs.dailyCalories`: actualizado con calorías recomendadas

**Styles CSS:**
- `.weight-container`, `.weight-setup`, `.weight-progress`: layouts principales
- `.weight-stats`: grid de 7 estadísticas (Peso Actual, Objetivo, A Perder, TMB, Recomendadas, Déficit, Tiempo)
- `.progress-bar`, `.progress-fill`: barra de progreso con gradiente
- `.weight-history-entry`: elementos del historial con colores dinámicos
- Botones `.btn-primary` y `.btn-secondary` con estilos consistentes

**HTML:**
- Botón de navegación: `<button class="nav-btn" data-view="weight">⚖️ Peso</button>`
- Sección completa: `<section id="weightView" class="view">` (líneas 155-254)
- Formulario con 6 inputs numéricos + selector de género
- Botón "Calcular Plan" que llama a `app.calculateWeightGoal()`
- Panel de progreso con estadísticas, barra de progreso, historial
- Input para registrar peso + botón "Registrar"
- Botón "Cambiar meta" para resetear

**Fórmulas:**
```
TMB (Mifflin-St Jeor):
  Hombre: (10 × peso) + (6.25 × altura) - (5 × edad) + 5
  Mujer: (10 × peso) + (6.25 × altura) - (5 × edad) - 161

Gasto Diario = TMB × 1.55 (actividad moderada)

Calorías a gastar/ganar = (meta - actual) kg × 7700 kcal/kg

Déficit/Superávit diario = calorías totales ÷ días

Calorías Recomendadas:
  - Perder: gasto - déficit
  - Ganar: gasto + superávit
  - Mínimo: 1200 kcal
```

**Tests:**
- `test-weight-control.js`: pruebas de cálculos básicos (2 casos)
- `test-weight-integration.js`: pruebas de integración completa (5 casos)
  - Pérdida de peso (hombre)
  - Registro de peso y progreso
  - Ganancia de peso (mujer)
  - Integración con calorías diarias
  - Casos extremos y thresholds

Todos los tests pasan ✓

---

**Estado**: MVP funcional con control de peso integrado.
**Última actualización**: 2026-06-07
