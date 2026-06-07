# 🔧 SOLUCIÓN: Compilar APK de Android

## El Problema

El proyecto está usando **Java 21**, pero **Android SDK 34** NO es compatible con Java 21's `jlink`.

Error exacto:
```
Error while executing process C:\...\jdk-21.0.11.10-hotspot\bin\jlink.exe
```

---

## ✅ SOLUCIÓN: Descargar Java 11

### Opción 1: Adoptium Eclipse Temurin (RECOMENDADO)

1. **Descargar Java 11 LTS:**
   - Ir a: https://adoptium.net/temurin/releases/?version=11
   - Descargar: **Windows x64 JDK**
   - Archivo: `OpenJDK11U-jdk_x64_windows_hotspot_11.x.x_x.msi` (~200MB)

2. **Instalar:**
   - Ejecutar `.msi`
   - Siguiente → Siguiente → Finish
   - Por defecto se instala en: `C:\Program Files\Eclipse Adoptium\jdk-11.x.x`

3. **Verificar instalación:**
   ```powershell
   "C:\Program Files\Eclipse Adoptium\jdk-11.0.x\bin\java.exe" -version
   ```

### Opción 2: Oracle JDK 11

- https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html
- Descargar: `jdk-11.x_windows-x64_bin.zip`
- Extraer a: `C:\Program Files\Java\jdk-11.x`

---

## 🚀 COMPILAR APK CON JAVA 11

### Paso 1: Abrir PowerShell en el directorio del proyecto

```powershell
cd D:\NUTRICOOK
```

### Paso 2: Establecer JAVA_HOME

```powershell
# Para Adoptium Temurin:
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.x"

# Para Oracle JDK:
$env:JAVA_HOME = "C:\Program Files\Java\jdk-11.x"

# Para Microsoft OpenJDK:
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-11.0.x-hotspot"

# Verificar:
java -version
```

### Paso 3: Compilar APK Release (Firmado)

```powershell
# Establecer contraseña del keystore
$env:KEYSTORE_PASSWORD = "nutricook123"
$env:KEY_ALIAS = "nutricook"
$env:KEY_PASSWORD = "nutricook123"

# Compilar
cd D:\NUTRICOOK\android-twa
./gradle-8.10/bin/gradle.bat assembleRelease --no-daemon
```

**Salida esperada:**
```
> Task :app:assembleRelease
...
BUILD SUCCESSFUL in 2m 30s
```

**Archivo generado:**
```
D:\NUTRICOOK\android-twa\app\build\outputs\apk\release\app-release.apk
```

### Paso 4: Copiar a `dist/`

```powershell
Copy-Item `
  "D:\NUTRICOOK\android-twa\app\build\outputs\apk\release\app-release.apk" `
  "D:\NUTRICOOK\dist\Nutricook-0.2.0-android.apk" `
  -Force
```

---

## 🧪 COMPILAR APK Debug (SIN FIRMA)

Si solo quieres probar sin compilación formal:

```powershell
cd D:\NUTRICOOK\android-twa
./gradle-8.10/bin/gradle.bat assembleDebug --no-daemon
```

**Salida:**
```
D:\NUTRICOOK\android-twa\app\build\outputs\apk\debug\app-debug.apk
```

---

## ✅ VERIFICAR APK

```powershell
# Verificar que el archivo existe
ls D:\NUTRICOOK\dist\Nutricook-0.2.0-android.apk

# Ver tamaño
(ls D:\NUTRICOOK\dist\Nutricook-0.2.0-android.apk).Length / 1MB # MB
```

---

## 📱 INSTALAR APK EN ANDROID

### Opción 1: Dispositivo físico (USB)

```powershell
# Conectar dispositivo con USB debugging activado
adb install D:\NUTRICOOK\dist\Nutricook-0.2.0-android.apk
```

### Opción 2: Emulador Android

```powershell
adb install D:\NUTRICOOK\dist\Nutricook-0.2.0-android.apk
```

### Opción 3: Enviar a dispositivo

- Copiar APK a una memoria USB
- Transferir a Android
- Ejecutar APK en Android

---

## ⚠️ TROUBLESHOOTING

### Error: "JAVA_HOME not found"

```powershell
# Verificar que la ruta existe
ls "C:\Program Files\Eclipse Adoptium\jdk-11.0.x\bin\java.exe"
```

### Error: "gradle not found"

```powershell
# Navegar al directorio correcto
cd D:\NUTRICOOK\android-twa

# Verificar que gradle existe
ls gradle-8.10\bin\gradle.bat
```

### Error: "SDK not found"

```powershell
# Crear local.properties si no existe
echo "sdk.dir=C:\Users\$env:USERNAME\AppData\Local\Android\Sdk" > local.properties
```

### Error: "Keystore not found"

```powershell
# Verificar que exists
ls D:\NUTRICOOK\android-twa\nutricook.keystore

# Si no existe, crear uno:
$JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.x"
& "$JAVA_HOME\bin\keytool.exe" -genkey `
  -v `
  -keystore "nutricook.keystore" `
  -alias "nutricook" `
  -keyalg "RSA" `
  -keysize 2048 `
  -validity 10950 `
  -storepass "nutricook123" `
  -keypass "nutricook123" `
  -dname "CN=NutriCook, OU=Development, O=JFSAINTS, L=Madrid, ST=Madrid, C=ES"
```

---

## 📋 CHECKLIST

- [ ] Java 11 descargado e instalado
- [ ] JAVA_HOME establecido correctamente
- [ ] Verificado con `java -version`
- [ ] `local.properties` existe en `android-twa/`
- [ ] `nutricook.keystore` existe en `android-twa/`
- [ ] Ejecutado: `gradle assembleRelease`
- [ ] APK generado en `app/build/outputs/apk/release/`
- [ ] APK copiado a `dist/Nutricook-0.2.0-android.apk`

---

## 🎯 RESULTADO FINAL

Una vez completado:

```
dist/
├── Nutricook-0.2.0-windows.exe ✅ (YA COMPLETADO)
└── Nutricook-0.2.0-android.apk ⏳ (DESPUÉS DE ESTOS PASOS)
```

---

## 📞 SOPORTE

Si algo no funciona:
1. Revisar que JAVA_HOME apunta a Java 11
2. Ejecutar `gradle clean` en `android-twa/`
3. Borrar `~/.gradle` y `app/build/`
4. Reintentar compilación

---

**Última actualización:** 2026-06-07 20:03 UTC
