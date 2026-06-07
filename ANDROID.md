# 📱 Guía de Compilación para Android (APK)

## ¿Qué es?

NutriCook para Android es una **Trusted Web Activity (TWA)** que empaqueta la app web en un APK nativo de Android. Los cambios en la web (app.js, styles.css) se reflejan automáticamente sin recompilar.

---

## Requisitos

- **Java Development Kit (JDK) 21+**
  - Descarga: https://www.oracle.com/java/technologies/downloads/
  - Variable: `JAVA_HOME = C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot`

- **Android SDK**
  - Descarga via Android Studio: https://developer.android.com/studio
  - Variable: `ANDROID_HOME = %LOCALAPPDATA%\Android\Sdk`

- **Gradle** (incluido en android-twa)

- **Git** (para clonar repositorio)

---

## Estructura del Proyecto Android

```
D:\NUTRICOOK\android-twa/
├── app/
│   ├── build/                    ← APK compilado
│   ├── src/
│   │   ├── main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── res/              ← Iconos, strings
│   │   │   └── assets/           ← Contenido estático
│   │   └── ...
│   ├── build.gradle              ← Configuración de build
│   └── ...
├── build.gradle
├── settings.gradle
├── gradlew.bat                   ← Gradle Wrapper (Windows)
├── gradle.properties
└── local.properties              ← Valores locales (NO commitear)
```

---

## Pasos para Compilar el APK

### 1. Preparar el Entorno

```powershell
# Verificar variables de entorno
$env:JAVA_HOME
$env:ANDROID_HOME

# Si no están configuradas, agregarlas:
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:ANDROID_HOME = $env:LOCALAPPDATA + "\Android\Sdk"
```

### 2. Verificar AndroidManifest.xml

El archivo `android-twa/app/src/main/AndroidManifest.xml` debe tener:

```xml
<!-- URL de la app (debe apuntar a GitHub Pages o servidor HTTPS) -->
<intent-data
    android:scheme="https"
    android:host="jfsaints.github.io"
    android:pathPrefix="/nutricook" />
```

**Importante:** La URL debe ser HTTPS y públicamente accesible.

### 3. Compilar el APK en Modo Release

```powershell
cd D:\NUTRICOOK\android-twa

# Limpiar builds anteriores (opcional)
.\gradlew.bat clean

# Compilar APK de producción
.\gradlew.bat assembleRelease

# Tiempo estimado: 2-5 minutos
```

### 4. Firmar el APK (Opcional pero Recomendado)

```powershell
# Si no tienes keystore, crear uno (hacerlo UNA SOLA VEZ):
keytool -genkey -v -keystore D:\NUTRICOOK\nutricook.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias nutricook

# Luego firmar el APK:
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore D:\NUTRICOOK\nutricook.keystore app\build\outputs\apk\release\app-release-unsigned.apk nutricook

# Alinear el APK:
zipalign -v 4 app\build\outputs\apk\release\app-release-unsigned.apk D:\NUTRICOOK\dist\Nutricook-android-signed.apk
```

### 5. Localizar el APK Compilado

```
D:\NUTRICOOK\android-twa\app\build\outputs\apk\release\app-release.apk
```

Copiar a:
```powershell
Copy-Item "D:\NUTRICOOK\android-twa\app\build\outputs\apk\release\app-release.apk" "D:\NUTRICOOK\dist\Nutricook-android.apk" -Force
```

---

## Cuándo Recompilar el APK

### Recompilar (necesario):
- ✅ Cambios en AndroidManifest.xml (permisos, URL)
- ✅ Cambios en iconos o recursos
- ✅ Actualización de versión en build.gradle
- ✅ Cambios en librerias de Android

### NO Necesario Recompilar (carga de GitHub Pages):
- ❌ Cambios en app.js
- ❌ Cambios en styles.css
- ❌ Nuevas recetas
- ❌ Cambios en traducción (i18n.js)
- ❌ Cualquier cambio en archivos HTML/CSS/JS

---

## Testing en Android

### Usando Android Emulator

```powershell
# Iniciar emulator desde Android Studio o:
emulator -avd <nombre-emulador>

# Instalar APK en emulador
adb install -r "D:\NUTRICOOK\android-twa\app\build\outputs\apk\release\app-release.apk"
```

### En Dispositivo Real

```powershell
# Conectar dispositivo por USB (habilitar "Depuración USB")
adb devices

# Instalar APK
adb install -r app-release.apk

# Ver logs (si hay problemas):
adb logcat | findstr "nutricook"
```

---

## Verificar Responsividad en Android

### Checklist de Pantalla Completa:

- ✅ App ocupa 100% de pantalla (sin bordes)
- ✅ Navegación sidebar visible en horizontal
- ✅ Botones accesibles sin scroll horizontal
- ✅ Modales responsivos en pantalla pequeña
- ✅ Teclado no oculta formularios importantes
- ✅ Orientación portrait y landscape funcionan
- ✅ Status bar no superpone contenido

### Pruebas en Navegador (Chrome DevTools):

```
F12 → Device Toolbar (Ctrl+Shift+M)
Seleccionar: Pixel 7, iPhone 15, etc.
Probar todas las vistas y funciones
```

---

## Tamaño del APK

Típicamente:
- APK sin comprimir: ~50-100 MB
- APK comprimido: ~10-20 MB

El tamaño incluye:
- Runtime de Chromium
- Archivos de la app
- Assets (imágenes, fuentes)

---

## Distribución

### Opción 1: Google Play Store
1. Crear cuenta Google Play Developer ($25 USD)
2. Firmar APK con certificado
3. Subir a Google Play Console
4. Completar metadata y screenshots
5. Esperar revisión (~48 horas)

### Opción 2: GitHub Releases
1. Crear release en GitHub
2. Adjuntar APK como asset
3. Usuarios descargan directamente
4. ⚠️ Requiere habilitar "Instalar desde fuentes desconocidas"

### Opción 3: Distribuir Directamente
1. Host APK en servidor
2. QR o link para descargar
3. Usuarios instalan manualmente

---

## Troubleshooting

### Error: "JAVA_HOME not set"
```powershell
# Solución:
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
```

### Error: "Android SDK not found"
```powershell
# Descargar SDK via Android Studio
# Luego:
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
```

### Build falla en Gradle
```powershell
# Limpiar cache:
.\gradlew.bat clean

# Luego reintentar:
.\gradlew.bat assembleRelease
```

### APK no se instala
```powershell
# Desinstalar versión anterior:
adb uninstall com.example.nutricook

# Reintentar:
adb install app-release.apk
```

---

## Información Técnica

### Manifest (AndroidManifest.xml)

Configuraciones importantes:
```xml
<!-- Permisos -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Pantalla completa -->
android:screenOrientation="user"
android:configChanges="orientation|screenSize"

<!-- Icon -->
android:icon="@mipmap/ic_launcher"
android:roundIcon="@mipmap/ic_launcher_round"
```

### Build.gradle (app)

```gradle
android {
    compileSdk 34
    
    defaultConfig {
        applicationId "com.nutricook.app"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName "0.2.0"
    }
}
```

---

## Contacto

Para problemas con compilación o distribución:
- GitHub Issues: https://github.com/JFSAINTS/nutricook/issues
- Contacto: jfsaints@gmail.com

---

**Última actualización:** 2026-06-07  
**Versión:** v0.2.0
