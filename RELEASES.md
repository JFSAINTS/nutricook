# 📦 Guía de Releases y Distribución

## Versionamiento

Usamos **Semantic Versioning**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Cambios incompatibles (nunca en esta app)
- **MINOR**: Nuevas features compatibles (v0.1.0 → v0.2.0)
- **PATCH**: Bug fixes (v0.2.0 → v0.2.1)

---

## Checklist Pre-Release

Antes de cualquier release:

- [ ] Actualizar `APP_VERSION` en `app.js`
  ```js
  const APP_VERSION = 'X.Y.Z';
  ```

- [ ] Actualizar versión en `package.json`
  ```json
  "version": "X.Y.Z"
  ```

- [ ] Actualizar versión en `manifest.json` (descripción)

- [ ] Actualizar `build.gradle` en android-twa
  ```gradle
  versionCode N      // incrementar
  versionName "X.Y.Z"
  ```

- [ ] Crear CHANGELOG.md con cambios principales

- [ ] Commit: `chore: release vX.Y.Z`

- [ ] Git tag: `git tag vX.Y.Z`

- [ ] Push: `git push origin main && git push origin --tags`

---

## Crear Release en GitHub

### Via GitHub Web

1. Ir a: https://github.com/JFSAINTS/nutricook/releases
2. Click "Create a new release"
3. Seleccionar tag: `vX.Y.Z`
4. Título: `NutriCook vX.Y.Z`
5. Descripción:
   ```markdown
   ## 🎉 Cambios Principales

   ### ✨ Features
   - ...

   ### 🐛 Bug Fixes
   - ...

   ### 📚 Docs
   - ...

   ## 📥 Descargas

   - **Windows x64**: `Nutricook-Setup-X.Y.Z.exe`
   - **Android**: `Nutricook-android-X.Y.Z.apk`
   - **Web**: jfsaints.github.io/nutricook

   ## ⚖️ Aviso Legal

   NutriCook NO sustituye consulta médica o nutricional.
   Ver [DISCLAIMER.md](https://github.com/JFSAINTS/nutricook/blob/main/DISCLAIMER.md)
   ```

6. Adjuntar assets:
   - `Nutricook-Setup-X.Y.Z.exe` (Electron Windows)
   - `Nutricook-android-X.Y.Z.apk` (Android APK)

7. Publicar

### Via CLI (gh)

```bash
gh release create vX.Y.Z \
  --title "NutriCook vX.Y.Z" \
  --notes "$(cat CHANGELOG.md)" \
  dist/Nutricook-Setup-X.Y.Z.exe \
  dist/Nutricook-android-X.Y.Z.apk
```

---

## Build para Distribución

### 1. Windows Desktop (Electron)

```powershell
$env:PATH = "C:\Users\jfsai\nodejs;" + $env:PATH
$env:ELECTRON_BUILDER_CACHE = "D:\electron-builder-cache"

cd D:\NUTRICOOK
npm run build:win

# Outputs:
# - dist/Nutricook Setup X.Y.Z.exe (instalador NSIS)
# - dist/Nutricook X.Y.Z.exe (portable)
```

### 2. Android (APK)

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:ANDROID_HOME = $env:LOCALAPPDATA + "\Android\Sdk"

cd D:\NUTRICOOK\android-twa
.\gradlew.bat assembleRelease

# Output:
# app\build\outputs\apk\release\app-release.apk
# → Copiar a dist/Nutricook-android-X.Y.Z.apk
```

### 3. Web (GitHub Pages)

```bash
# El push a main dispara deploy automático
# Disponible en: https://jfsaints.github.io/nutricook
```

---

## CHANGELOG.md

Crear archivo con cambios:

```markdown
# Changelog

## [0.2.0] - 2026-06-07

### Added
- ⚖️ Control de peso con cálculos BMR
- 🌍 Internacionalización (Español/English)
- 📝 Disclaimers legales y modal de aceptación

### Changed
- Actualizar UI para soportar 2 idiomas
- Mejorar responsividad en móviles

### Fixed
- Ajustar altura de modales en pantallas pequeñas

### Security
- Agregar validación de entrada en formularios
- Mejorar manejo de localStorage

---

## [0.1.0] - 2026-05-27

### Added
- Plan semanal básico
- Generación de recetas con Claude API
- PWA offline
- Múltiples proveedores LLM
- ...
```

---

## Comunicar Release

### 1. GitHub

- Crear release con descripción completa
- Adjuntar assets (APK, EXE)
- Notificar en issues relacionadas

### 2. README

Actualizar sección de descargas:

```markdown
## 📥 Descargar

| Plataforma | Versión | Descarga |
|-----------|---------|----------|
| 🌐 Web | 0.2.0 | [Abrir app](https://jfsaints.github.io/nutricook) |
| 🪟 Windows | 0.2.0 | [Descargar](https://github.com/JFSAINTS/nutricook/releases/download/v0.2.0/Nutricook-Setup-0.2.0.exe) |
| 📱 Android | 0.2.0 | [Descargar APK](https://github.com/JFSAINTS/nutricook/releases/download/v0.2.0/Nutricook-android-0.2.0.apk) |
```

### 3. Social Media (Opcional)

Tweet/Post:
```
🎉 NutriCook v0.2.0 está aquí! 🌍
✨ Control de peso con cálculos BMR
🌍 Ahora en Español e Inglés
⚖️ Con disclaimers legales claros

Descarga gratis: https://github.com/JFSAINTS/nutricook/releases

#MealPlanning #NutriTech #PWA #OpenSource
```

---

## Após Release

- [ ] Abrir issues para siguiente versión
- [ ] Recopilar feedback de usuarios
- [ ] Planificar features v0.3.0
- [ ] Actualizar documentación si es necesario
- [ ] Monitorear reportes de bugs

---

## Versionamiento de API

Si hay cambios en API proxy:
- Versión en `api-proxy.js`: comentario al inicio
- Documentar en README
- Mantener backwards compatibility si es posible

---

## Auto-Update Check

La app verifica nuevas versiones:
- Cada 24 horas (rate limit)
- Compara `APP_VERSION` con GitHub Releases API
- Notifica al usuario si hay actualización

**Flujo:**
1. App inicia
2. 5 segundos después, verifica GitHub API
3. Si hay versión nueva, muestra banner
4. Usuario elige actualizar o no

---

## Rollback

Si hay problemas críticos post-release:

```bash
# Tag de la versión anterior:
git tag vX.Y.Z-rollback
git push origin --tags

# Crear hotfix branch:
git checkout -b hotfix/X.Y.Z-1
# Hacer fixes
# Crear nuevo release vX.Y.Z-hotfix o vX.Y.(Z+1)
```

---

## Integración Continua (CI/CD)

### GitHub Actions (Futuro)

Configurar workflows para:
- Tests automáticos al push
- Build desktop automático
- Build APK automático
- Publicar releases automáticas

Archivos:
```
.github/workflows/
├── test.yml         ← Tests en cada push
├── build-desktop.yml ← Build Windows
├── build-android.yml ← Build APK
└── release.yml      ← Crear release automática
```

---

## Checklist Completo de Release

```
PRE-RELEASE:
- [ ] Bump versiones en todos los archivos
- [ ] Crear CHANGELOG.md
- [ ] Commit y push
- [ ] Crear git tag
- [ ] Build Windows EXE
- [ ] Build Android APK
- [ ] Probar ambos builds en dispositivos

RELEASE:
- [ ] Crear GitHub release
- [ ] Adjuntar assets (EXE + APK)
- [ ] Completar descripción

POST-RELEASE:
- [ ] Actualizar README
- [ ] Verificar descargas funcionan
- [ ] Cerrar issues relacionadas
- [ ] Anunciar si es necesario
- [ ] Recopilar feedback

MAINTENANCE:
- [ ] Monitorear reportes de bugs
- [ ] Mantener documentación
- [ ] Planificar próxima versión
```

---

**Última actualización:** 2026-06-07  
**Versión:** v0.2.0
