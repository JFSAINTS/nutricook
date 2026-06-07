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

### Como app (Windows / Mac)
- Descarga desde [Releases](https://github.com/JFSAINTS/nutricook/releases)
- Ejecuta el instalador `.exe` (Windows) o `.dmg` (Mac)

### Como app (Android)
- Descarga `nutricook.apk` desde [Releases](https://github.com/JFSAINTS/nutricook/releases)
- O instala desde Play Store (próximamente)

---

## Requisitos

- **Navegador moderno**: Chrome, Firefox, Safari, Edge
- **API Key de Claude** (opcional): para generación automática de recetas

---

## Configuración

### 1. Obtén tu API Key
Ve a https://console.anthropic.com/account/keys y copia tu `sk-ant-...`

### 2. Configura la API Key
Dos opciones:

**A) Desde los Ajustes (UI)**
- Abre la app → ⚙️ **Ajustes**
- Ingresa tu API key manualmente
- O importa desde archivo `.env`

**B) Desde terminal (más seguro)**
```powershell
$env:CLAUDE_API_KEY = "sk-ant-tu-key"
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
