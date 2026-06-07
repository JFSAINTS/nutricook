# 🍽️ NutriCook

**Planificador semanal inteligente de comidas saludables con recetas personalizadas.**

NutriCook es una Progressive Web App (PWA) que te ayuda a:
- 📅 Planificar comidas de lunes a domingo
- 🤖 Generar recetas con inteligencia artificial (Claude API)
- 🥗 Adaptar recetas según tus alérgenos e ingredientes disponibles
- 📊 Controlar calorías y cumplir tus metas dietéticas
- 📱 Funcionar sin conexión (offline-first)
- 📲 Instalarse como app en web y Android

---

## Características

### Mi Despensa
Registra los ingredientes disponibles en tu cocina:
- **10 categorías**: Productos Frescos, Proteínas, Granos, Legumbres, Especias, Lácteos, Aceites, Conservas, Salsas, Otros
- **Agregar/Quitar** ingredientes fácilmente
- **Auto-completar** en generación de recetas (sugiere usar tus ingredientes)

### Plan Semanal
Visualiza y edita desayuno, almuerzo, cena y picoteos para cada día de la semana.

### Generación de Recetas Inteligente
Tres formas de generar recetas:
1. **Recetas Saludables** — equilibradas según tus preferencias calóricas
2. **Por Ingredientes** — usa lo que tienes en casa
3. **Sin Alérgenos** — adaptadas para tus intolerancias dietéticas

### 🖼️ Imágenes de Recetas
- Cada receta generada incluye una **imagen del plato preparado**
- Usa **Stable Diffusion** (Hugging Face) para generar fotos realistas
- Las imágenes se **cachean localmente** para acelerar futuras búsquedas
- Si falla la generación, muestra un emoji representativo
- Fallback inteligente: no interrumpe la experiencia

### 🎨 Diseño Kawaii
- **Fondo decorativo** con elementos de comida cute
- Elementos: pizzas, cupcakes, donas, sandia, helado, café, sushi
- Caras felices en los elementos grandes
- Diseño suave con opacidad ajustada
- Mejora la experiencia visual sin ser invasivo

### Información Nutricional
Cada receta incluye calorías, tiempo de preparación, ingredientes y pasos detallados.

### Estadísticas
Monitorea tu progreso semanal: calorías totales, variedad de recetas, cumplimiento de metas.

### Modo Offline
Todos tus datos se guardan localmente. La app funciona sin internet.

---

## Instalación

### En navegador
1. Abre [nutricook.github.io](https://nutricook.github.io) (próximamente)
2. O clona el repo: `git clone https://github.com/JFSAINTS/nutricook`
3. Abre `index.html` en tu navegador
4. Configura tu API key en ⚙️ **Ajustes** (Anthropic, OpenAI, Google Gemini o Groq)

### Como app (Windows / Mac)
- Descarga desde [Releases](https://github.com/JFSAINTS/nutricook/releases)
- Ejecuta el instalador `.exe` (Windows) o `.dmg` (Mac)

### Como app (Android)
- Descarga `nutricook.apk` desde [Releases](https://github.com/JFSAINTS/nutricook/releases)
- O instala desde Play Store (próximamente)

---

## Requisitos

- **Navegador moderno**: Chrome, Firefox, Safari, Edge
- **API Key de cualquier proveedor** (Anthropic, OpenAI, Google Gemini o Groq)

## Proveedores Soportados

| Proveedor | API Key | Modelo | Costo |
|-----------|---------|--------|-------|
| **Anthropic Claude** | `sk-ant-...` | Claude 3 (Opus, Sonnet, Haiku) | $0.003/1K tokens |
| **OpenAI GPT** | `sk-...` | GPT-4, GPT-3.5-turbo | $0.01-0.03/1K tokens |
| **Google Gemini** | `AIza...` | Gemini Pro | Gratis (50 req/día) |
| **Groq** | `gsk_...` | Mixtral, LLaMA 2 | Gratis (muy rápido) |

---

## Configuración

### 1. Elige tu Proveedor y obtén API Key

**Anthropic Claude** (Recomendado)
- URL: https://console.anthropic.com/account/keys
- Key format: `sk-ant-...`

**OpenAI GPT**
- URL: https://platform.openai.com/api-keys
- Key format: `sk-...`

**Google Gemini** (Gratis)
- URL: https://aistudio.google.com/app/apikey
- Key format: `AIza...`

**Groq** (Muy rápido, Gratis)
- URL: https://console.groq.com/keys
- Key format: `gsk_...`

### 2. Configura la API Key
Dos opciones:

**A) Desde los Ajustes (UI - Recomendado)**
- Abre la app → ⚙️ **Ajustes**
- Selecciona proveedor (dropdown)
- Ingresa tu API key
- Presiona "Guardar"

**B) Desde terminal (más seguro)**
```powershell
$env:NUTRICOOK_PROVIDER = "anthropic"  # o openai, gemini, groq
$env:NUTRICOOK_API_KEY = "tu-api-key"
.\dev.ps1
```

### 3. Preferencias personales
1. Ve a **⚙️ Preferencias**
2. Configura:
   - Calorías diarias objetivo
   - Alérgenos/intolerancias
   - Preferencias de cocina
   - Tiempo máximo de preparación

### 2. Generar plan semanal
1. En **📅 Plan Semanal**, presiona **✨ Generar Semana**
2. Elige: Saludable, Por Ingredientes, o Sin Alérgenos
3. ¡Listo! Tu plan se genera automáticamente

### 3. Editar comidas
- Haz clic en **✏️ Editar** en cualquier comida
- O presiona **➕ Agregar comida** para crear una nueva

---

## Tecnología

- **Frontend**: Vanilla JavaScript + HTML5 + CSS3
- **AI**: Claude API (Anthropic)
- **Base de datos**: localStorage (offline)
- **PWA**: Service Worker + manifest.json
- **Desktop**: Electron (Windows)
- **Mobile**: Android TWA (Android)

---

## Estructura

```
index.html          ← App principal
app.js              ← Lógica central
styles.css          ← Estilos (tema oscuro)
claude-recipes.js   ← Integración con Claude API
manifest.json       ← PWA manifest
sw.js               ← Service Worker (offline)
```

---

## Desarrollo

### Servidor local
```bash
python -m http.server 3456
# Abre: http://localhost:3456
```

### Con Vite (opcional)
```bash
npm install
npm run dev          # dev server con HMR
npm run build        # producción
```

### Build para Android APK
```bash
cd android-twa
./gradlew.bat assembleRelease
```

---

## Privacidad

- ✅ **Sin servidor backend**: todos tus datos quedan en tu dispositivo
- ✅ **Datos locales**: localStorage, no enviamos info a servidores
- ⚠️ **Claude API**: solo si activas generación de recetas. Lee su [política de privacidad](https://anthropic.com/privacy)

---

## Roadmap

### v0.1.0 (Actual)
- [x] Plan semanal básico
- [x] Generación de recetas con Claude
- [x] PWA offline
- [ ] Iconos y screenshots
- [ ] Proxy backend para API key

### v0.2.0
- [ ] Historial de comidas
- [ ] Compartir planes (Firebase)
- [ ] Rating de recetas (⭐)
- [ ] Exportar PDF

### v0.3.0+
- [ ] Sincronización en la nube (Firebase)
- [ ] Comparte planes con familia
- [ ] Recetas guardadas favoritas
- [ ] Integración con apps de fitness

---

## Contribuciones

Reporta bugs en [Issues](https://github.com/JFSAINTS/nutricook/issues).

Sugerencias de features: [Discussions](https://github.com/JFSAINTS/nutricook/discussions).

---

## Licencia

MIT — usa libremente en proyectos personales y comerciales.

---

## Créditos

Desarrollado por **@JFSAINTS**  
Powered by **Claude AI** (Anthropic)

---

**¿Preguntas o feedback?** Abre un [issue](https://github.com/JFSAINTS/nutricook/issues) o contacta a [@JFSAINTS](https://github.com/JFSAINTS).
