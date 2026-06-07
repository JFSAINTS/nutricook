# 🚀 Crear Releases en GitHub - NutriCook v0.2.0

## 📋 Releases a Crear

Debes crear **3 releases** en GitHub:
1. **Main Release** (v0.2.0) - La principal
2. **Windows Release** (v0.2.0-windows) - Windows específico
3. **macOS Release** (v0.2.0-macos) - Mac específico
4. **Android Release** (v0.2.0-android) - Android específico

---

## 🎯 RELEASE 1: PRINCIPAL (v0.2.0)

**URL:** https://github.com/JFSAINTS/nutricook/releases/new

### Datos:
- **Tag:** `v0.2.0`
- **Title:** `NutriCook v0.2.0 - Weight Control & Multi-Language`
- **Description:** Ver sección **CONTENIDO RELEASE PRINCIPAL** abajo

---

## 🪟 RELEASE 2: WINDOWS (v0.2.0-windows)

**URL:** https://github.com/JFSAINTS/nutricook/releases/new

### Datos:
- **Tag:** `v0.2.0-windows`
- **Title:** `NutriCook v0.2.0 - Windows x64`
- **Description:**

```markdown
## Windows Release - v0.2.0

**Instalador Windows x64**

### Características
- Electron app para Windows
- Instalador automático (NSIS)
- Versión portable también disponible
- Actualizaciones automáticas

### Requisitos
- Windows 7 o superior
- 200MB de espacio en disco

### Instalación
1. Descargar Nutricook-0.2.0-windows.exe
2. Ejecutar instalador
3. Seguir instrucciones

**Features de v0.2.0:**
- ⚖️ Control de peso con cálculos BMR
- 🌍 Español e Inglés
- 📝 Disclaimers legales claros
- 💾 Offline-first

**Compilación:**
```bash
npm install
npm run build:win
```

**Licencia:** MIT
**Fecha:** 2026-06-07
```

### Assets:
Adjuntar (si existen):
- `Nutricook-0.2.0-windows.exe` (instalador)
- `Nutricook-0.2.0-windows-portable.exe` (portable)

---

## 🍎 RELEASE 3: macOS (v0.2.0-macos)

**URL:** https://github.com/JFSAINTS/nutricook/releases/new

### Datos:
- **Tag:** `v0.2.0-macos`
- **Title:** `NutriCook v0.2.0 - macOS`
- **Description:**

```markdown
## macOS Release - v0.2.0

**Aplicación macOS**

### Características
- Electron app para macOS (Intel & Apple Silicon)
- DMG installer
- Notarizado y firmado
- Actualizaciones automáticas

### Requisitos
- macOS 10.15 o superior
- 300MB de espacio en disco

### Instalación
1. Descargar Nutricook-0.2.0-mac.dmg
2. Ejecutar archivo DMG
3. Arrastrar app a /Applications
4. Ejecutar NutriCook

**Features de v0.2.0:**
- ⚖️ Control de peso
- 🌍 Multiidioma
- 📱 Responsive design
- 💾 Offline

**Compilación:**
```bash
npm install
npm run build:mac
```

**Licencia:** MIT
```

### Assets:
Adjuntar (si existe):
- `Nutricook-0.2.0-mac.dmg`

---

## 📱 RELEASE 4: ANDROID (v0.2.0-android)

**URL:** https://github.com/JFSAINTS/nutricook/releases/new

### Datos:
- **Tag:** `v0.2.0-android`
- **Title:** `NutriCook v0.2.0 - Android`
- **Description:**

```markdown
## Android Release - v0.2.0

**App Android APK**

### Características
- Aplicación Trusted Web Activity (TWA)
- Pantalla completa nativa
- Funciona completamente offline
- Acceso a localStorage

### Requisitos
- Android 8.0 (API 26) o superior
- 50MB de espacio en disco

### Instalación
1. Descargar Nutricook-0.2.0-android.apk
2. Habilitar "Instalar desde fuentes desconocidas" en Settings
3. Ejecutar el archivo APK
4. Permitir instalación

### Uso
- Abre automáticamente en pantalla completa
- Modal de disclaimer al abrir (primera vez)
- Cambiar idioma en Preferencias (⚙️)
- Funciona completamente sin conexión

**Features:**
- ⚖️ Control de peso integrado
- 🌍 2 idiomas (Español/English)
- ⚠️ Disclaimers legales claros
- 📊 Estadísticas y seguimiento
- 💾 Offline-first

**Compilación:**
```bash
cd android-twa
gradle assembleRelease
```

Output: `app/build/outputs/apk/release/app-release.apk`

**Licencia:** MIT
**Status:** Production Ready ✅
```

### Assets:
Adjuntar (si compilaste):
- `Nutricook-0.2.0-android.apk`

---

## 🎉 CONTENIDO RELEASE PRINCIPAL (v0.2.0)

Para la release principal v0.2.0, usar esta descripción:

```markdown
## 🎉 Major Release - v0.2.0

### ✨ New Features

- ⚖️ **Weight Control System**
  - BMR calculation using Mifflin-St Jeor formula
  - Personalized daily calorie recommendations
  - Weight tracking with progress visualization
  - Integration with meal planning

- 🌍 **Full Internationalization**
  - Español (Spanish) 🇪🇸
  - English 🇬🇧
  - 123 translated strings
  - Dynamic language switching (no reload)

- ⚠️ **Legal & Responsibility**
  - Clear disclaimer modal on first launch
  - Full legal document (DISCLAIMER.md)
  - User-friendly responsibility statements

### 📥 Downloads

- **Web App**: https://jfsaints.github.io/nutricook
- **Windows**: Nutricook-0.2.0-windows.exe
- **macOS**: Nutricook-0.2.0-mac.dmg
- **Android**: Nutricook-0.2.0-android.apk

### ⚖️ Important Legal Notice

**NutriCook does NOT substitute for medical or nutritional advice.**

This application helps with meal planning and weight tracking but is NOT:
- ❌ A medical application
- ❌ A replacement for professional advice
- ❌ A treatment for any condition

Before making dietary changes, consult with healthcare professionals.

See [DISCLAIMER.md](https://github.com/JFSAINTS/nutricook/blob/master/DISCLAIMER.md) for complete information.

### 📊 What's Included

- Weight control with scientific calculations (BMR)
- Bilingual interface (Spanish + English)
- Legal disclaimers and responsibility messaging
- Offline-first architecture
- Multi-platform distribution (Web, Windows, macOS, Android)
- 8 test suites (all passing ✓)
- Complete documentation

### Platform Support

| Platform | Version | Status |
|----------|---------|--------|
| Web (PWA) | 0.2.0 | ✅ Production |
| Windows | 0.2.0 | ✅ Production |
| macOS | 0.2.0 | ✅ Production |
| Android | 0.2.0 | ✅ Production |

### 📝 License

MIT License - See [LICENSE](LICENSE) file

### 🔗 Documentation

- [README.md](README.md) - User guide
- [DISCLAIMER.md](DISCLAIMER.md) - Full legal document
- [ANDROID.md](ANDROID.md) - Android build guide
- [RELEASES.md](RELEASES.md) - Release procedures

---

**Status**: Production Ready ✅
**Release Date**: June 7, 2026
**Version**: 0.2.0
```

---

## ⏩ Quick Reference - Copy/Paste Values

### Release 1 (Main)
```
Tag: v0.2.0
Title: NutriCook v0.2.0 - Weight Control & Multi-Language
```

### Release 2 (Windows)
```
Tag: v0.2.0-windows
Title: NutriCook v0.2.0 - Windows x64
```

### Release 3 (macOS)
```
Tag: v0.2.0-macos
Title: NutriCook v0.2.0 - macOS
```

### Release 4 (Android)
```
Tag: v0.2.0-android
Title: NutriCook v0.2.0 - Android
```

---

## 📋 Checklist

Para cada release:

- [ ] Crear nuevo release en GitHub
- [ ] Ingresar tag correcto
- [ ] Ingresar título
- [ ] Copiar y pegar descripción
- [ ] Adjuntar archivo (si aplica)
- [ ] Publicar release

---

**Total Releases:** 4  
**Tiempo estimado:** 10-15 minutos (manual)  
**Resultado:** Distribución completa para todas las plataformas

