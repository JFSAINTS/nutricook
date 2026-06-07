# 📚 Guía Paso a Paso: GitHub Setup, APK y Release

## 🚀 PASO 1: Crear Repositorio en GitHub

### 1.1 Crear el repositorio

1. Ir a: https://github.com/new
2. **Repository name**: `nutricook`
3. **Description**: `Meal planner with weight control and AI recipes`
4. **Visibility**: `Public` (necesario para PWA)
5. **Initialize this repository with**:
   - ❌ Add a README file (ya lo tenemos)
   - ❌ Add .gitignore (ya lo tenemos)
   - ❌ Choose a license (ya lo tenemos)
6. Hacer clic en **Create repository**

### 1.2 Conectar repo local a GitHub

En PowerShell:

```powershell
cd D:\NUTRICOOK

# Ver configuración actual
git remote -v

# Si NO hay remote, agregar:
git remote add origin https://github.com/JFSAINTS/nutricook.git

# Cambiar branch a main (si GitHub lo requiere)
git branch -M main

# Hacer push inicial
git push -u origin main
git push origin --tags
```

**Si pide autenticación:**
- Usar GitHub CLI: `gh auth login`
- O usar token de acceso personal desde Settings → Developer settings → Personal access tokens

---

## 🔨 PASO 2: Compilar APK para Android

### 2.1 Verificar requisitos

En PowerShell:

```powershell
# Verificar Java
java -version

# Debe mostrar: java version "21.0.x" o similar
```

Si Java no está instalado:
1. Descargar: https://www.oracle.com/java/technologies/downloads/
2. Instalar JDK 21+
3. Configurar `JAVA_HOME`:
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
   ```

### 2.2 Descargar Android SDK

1. Descargar Android Studio: https://developer.android.com/studio
2. Instalar (incluye Android SDK automáticamente)
3. Abrir Android Studio → Settings → Languages & Frameworks → Android SDK
4. Instalar:
   - Android SDK 34 (API Level)
   - Build Tools 34.x
5. Anotar la ruta (típicamente: `C:\Users\[USER]\AppData\Local\Android\Sdk`)

### 2.3 Compilar APK

```powershell
# Configurar variables
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:ANDROID_HOME = "C:\Users\[TU_USUARIO]\AppData\Local\Android\Sdk"

# Ir al directorio
cd D:\NUTRICOOK\android-twa

# Compilar (primera vez descarga dependencias)
.\gradlew.bat assembleRelease

# Esto toma 3-5 minutos
```

### 2.4 Ubicar el APK

El APK compilado estará en:
```
D:\NUTRICOOK\android-twa\app\build\outputs\apk\release\app-release.apk
```

Copiar a carpeta dist:
```powershell
Copy-Item `
  "D:\NUTRICOOK\android-twa\app\build\outputs\apk\release\app-release.apk" `
  "D:\NUTRICOOK\dist\Nutricook-0.2.0-android.apk" `
  -Force
```

### 2.5 Probar en dispositivo Android

```powershell
# Conectar dispositivo Android por USB
# Habilitar: Settings → Developer options → USB Debugging

# Verificar dispositivo
adb devices

# Instalar APK
adb install "D:\NUTRICOOK\dist\Nutricook-0.2.0-android.apk"

# La app debe:
✓ Abrirse en pantalla completa
✓ Mostrar modal de disclaimer (primera vez)
✓ Permitir cambiar idioma
✓ Funcionar offline
```

---

## 📦 PASO 3: Crear Release en GitHub

### 3.1 Mediante GitHub Web

1. Ir a: https://github.com/JFSAINTS/nutricook/releases
2. Hacer clic en **Create a new release**
3. Rellenar información:

**Tag version**: `v0.2.0`

**Release title**:
```
NutriCook v0.2.0 - Weight Control & Multi-Language
```

**Description** (copiar y pegar):
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

- **Android APK** (v0.2.0): `Nutricook-0.2.0-android.apk`
- **Web App**: https://jfsaints.github.io/nutricook
- **View on GitHub**: https://github.com/JFSAINTS/nutricook

### ⚖️ Important Legal Notice

**NutriCook does NOT substitute for medical or nutritional advice.**

This application:
- ✅ Helps plan daily meals
- ✅ Tracks calorie intake
- ✅ Provides recipe suggestions
- ✅ Assists with weight goals

This application does NOT:
- ❌ Provide medical diagnoses
- ❌ Replace doctor/nutritionist consultation
- ❌ Treat any medical conditions
- ❌ Provide professional medical advice

**Before making significant dietary changes, consult with:**
- Your physician
- A registered dietitian
- Healthcare specialists

See [DISCLAIMER.md](https://github.com/JFSAINTS/nutricook/blob/main/DISCLAIMER.md) for complete legal information.

### 🎯 What's New in v0.2.0

- Complete weight management system with scientific calculations
- Full bilingual support (Spanish/English)
- Legal disclaimers and user responsibility messaging
- Android APK for mobile distribution
- Responsive design verified for mobile devices
- 8 test suites all passing ✓

### 🔗 Documentation

- [README.md](README.md) - User guide
- [DISCLAIMER.md](DISCLAIMER.md) - Full legal document
- [ANDROID.md](ANDROID.md) - APK compilation guide
- [RELEASES.md](RELEASES.md) - Release procedures
- [CLAUDE.md](CLAUDE.md) - Technical documentation

### 👨‍💻 Development

- Lines of code: ~4000
- Translation keys: 123 (100% coverage)
- Supported LLMs: 4 (Anthropic, OpenAI, Gemini, Groq)
- Test coverage: 8 passing tests ✓

### 📝 License

MIT License - See [LICENSE](LICENSE) file

### 🙏 Credits

Developed by [@JFSAINTS](https://github.com/JFSAINTS)  
Powered by [Claude AI](https://claude.ai)

---

**Status**: Production Ready ✅  
**Release Date**: June 7, 2026  
**Version**: 0.2.0
```

### 3.2 Adjuntar Assets (APK)

1. En la sección **Attach binaries**, hacer clic
2. Seleccionar: `D:\NUTRICOOK\dist\Nutricook-0.2.0-android.apk`
3. Esperar a que se suba

### 3.3 Publicar Release

1. Seleccionar: `This is a pre-release` ❌ (dejar sin marcar para release definitivo)
2. Hacer clic: **Publish release**

---

## ✅ Verificación Final

Después de publicar:

```
🔍 CHECKLIST POST-RELEASE:

[ ] Release visible en GitHub
[ ] APK descargable desde release
[ ] README links actualizado
[ ] Web app accesible (GitHub Pages)
[ ] Disclaimer modal aparece al abrir
[ ] Idioma cambia correctamente
[ ] Control de peso funciona
[ ] APK instala en Android sin errores
```

---

## 🆘 Troubleshooting

### "gradle no encontrado"
```powershell
# Descargar gradle wrapper manualmente
cd D:\NUTRICOOK\android-twa
$env:GRADLE_USER_HOME = "$env:USERPROFILE\.gradle"

# Usar gradle directo si está instalado
gradle assembleRelease
```

### "Android SDK no encontrado"
```powershell
$env:ANDROID_HOME = "C:\Users\[TU_USUARIO]\AppData\Local\Android\Sdk"
```

### "APK no se instala"
```powershell
# Desinstalar versión anterior
adb uninstall com.nutricook.app

# Instalar de nuevo
adb install Nutricook-0.2.0-android.apk
```

### "GitHub auth falla"
```powershell
# Autenticar con GitHub CLI
gh auth login

# Seguir instrucciones
# - Select HTTPS
# - Authenticate with web browser
```

---

## 📞 Ayuda Adicional

- GitHub Docs: https://docs.github.com
- Android Docs: https://developer.android.com/docs
- Gradle Docs: https://docs.gradle.org
- Git Docs: https://git-scm.com/doc

---

**¡Listo para publicar!** 🚀

Una vez completados estos pasos, NutriCook estará:
- ✅ En GitHub público
- ✅ Con APK compilado para Android
- ✅ Con release oficial en GitHub
- ✅ Disponible para descargar y instalar

