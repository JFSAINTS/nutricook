# 🚀 NutriCook — Quick Start

Comienza en 3 pasos.

---

## 1️⃣ Obtén tu API Key de Claude

Visita: https://console.anthropic.com/account/keys

1. Inicia sesión en tu cuenta Anthropic
2. Copia tu API key (`sk-ant-...`)
3. Guárdalo seguro (no lo compartas)

---

## 2️⃣ Inicia los servidores

### PowerShell (Windows)
```powershell
# Ve al directorio del proyecto
cd D:\NUTRICOOK

# Configura tu API key
$env:CLAUDE_API_KEY = "sk-ant-tu-api-key-aqui"

# Inicia web + API proxy
.\dev.ps1
```

### Bash / Zsh (Mac / Linux)
```bash
cd /path/to/nutricook

# Configura tu API key
export CLAUDE_API_KEY="sk-ant-tu-api-key-aqui"

# Inicia servidores (manualmente)
python -m http.server 3456 &       # Terminal 1
CLAUDE_API_KEY=$CLAUDE_API_KEY node api-proxy.js &  # Terminal 2
```

---

## 3️⃣ Abre la app

Abre tu navegador y ve a:

### 🌐 http://localhost:3456

¡Bienvenido a NutriCook!

---

## ✨ Primeros pasos en la app

1. **Configura tus preferencias**
   - Ve a ⚙️ **Preferencias**
   - Ingresa calorías diarias objetivo (default: 2000)
   - Agrega alérgenos/intolerancias si tienes
   - Selecciona preferencias de cocina
   - Guarda

2. **Genera tu primer plan semanal**
   - Vuelve a 📅 **Plan Semanal**
   - Presiona ✨ **Generar Semana**
   - Elige un modo: Saludable, Por Ingredientes, o Sin Alérgenos
   - ¡Espera a que Claude genere tu plan!

3. **Edita comidas según necesites**
   - Haz clic en cualquier comida para editarla
   - O agrega nuevas comidas con ➕ **Agregar comida**

4. **Monitorea tu progreso**
   - Ve a 📊 **Estadísticas** para ver:
     - Calorías totales de la semana
     - Variedad de recetas
     - Cumplimiento de tu meta dietética

---

## 🧪 Prueba sin API key real

Si aún no tienes API key, prueba el mock:

```powershell
node test-mock.js
```

Esto genera un plan semanal de ejemplo sin necesidad de conectarse a Claude.

---

## 🔒 Seguridad

Tu API key se protege con un **proxy local**:

```
App Frontend (3456) → API Proxy (3500) → Claude API
     ↓ sin key           ↓ agrega key      ↓ respuesta
```

- **Tu navegador**: nunca ve la API key
- **Tu computadora**: solo tú controlas el proxy
- **Internet**: solo el proxy habla con Claude

---

## 📱 Características principales

### ✅ Funcionales ahora
- [x] Plan semanal (7 días)
- [x] Generación de recetas con Claude
- [x] 3 modos: Saludable, Por Ingredientes, Sin Alérgenos
- [x] Preferencias personalizables
- [x] Control calórico
- [x] Guardar datos localmente (offline)
- [x] Estadísticas semanales

### 🚧 Próximamente
- [ ] Android APK
- [ ] Historial de comidas
- [ ] Compartir planes
- [ ] Recetas favoritas
- [ ] Integración con app de fitness

---

## ⚙️ Troubleshooting

### "Connection refused on port 3500"
El proxy no está corriendo. Asegúrate de ejecutar:
```powershell
$env:CLAUDE_API_KEY = "sk-..."
.\dev.ps1
```

### "API key not set"
Olvídaste configurar `CLAUDE_API_KEY`. Hazlo en tu terminal ANTES de iniciar:
```powershell
$env:CLAUDE_API_KEY = "sk-ant-your-key"
```

### "No recipes generated"
- Verifica que el proxy esté corriendo (debería ver logs en Terminal 2)
- Asegúrate de tener saldo en tu cuenta Anthropic
- Verifica que tu API key sea válida

### "Datos no se guardan"
Los datos se guardan en `localStorage` del navegador:
- Abre DevTools (F12)
- Storage → Local Storage
- Busca `nutricook_db_v1` y `nutricook_prefs_v1`

---

## 📖 Documentación completa

Para más detalles, lee:
- **CLAUDE.md** — Arquitectura, estructura de datos, desarrollo
- **README.md** — Features, tecnología, roadmap

---

## 🚀 Próximas sesiones

1. Deploy a GitHub Pages (web)
2. Build Android APK (TWA)
3. Agregar Cloud sync (Firebase Firestore)
4. Historial de comidas

---

**¡Listo para cocinar saludable?** 🥗

Comienza en http://localhost:3456
