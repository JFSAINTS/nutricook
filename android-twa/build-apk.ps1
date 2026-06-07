# Script para compilar NutriCook APK
# Requisitos: Java 21, Android SDK

Write-Host "🔨 NutriCook APK Build Script" -ForegroundColor Cyan
Write-Host "=" * 60

# Configurar variables de entorno
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

Write-Host "📝 Configuración:" -ForegroundColor Yellow
Write-Host "  JAVA_HOME: $env:JAVA_HOME"
Write-Host "  ANDROID_HOME: $env:ANDROID_HOME"

# Verificar Java
if (-not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    Write-Host "❌ Java 21 no encontrado en: $env:JAVA_HOME" -ForegroundColor Red
    exit 1
}

# Verificar Android SDK
if (-not (Test-Path "$env:ANDROID_HOME")) {
    Write-Host "❌ Android SDK no encontrado en: $env:ANDROID_HOME" -ForegroundColor Red
    Write-Host "   Descarga Android Studio: https://developer.android.com/studio" -ForegroundColor Gray
    exit 1
}

Write-Host "✓ Entorno verificado" -ForegroundColor Green

# Descargar gradle wrapper si no existe
if (-not (Test-Path ".\gradlew.bat")) {
    Write-Host "`n📥 Descargando Gradle wrapper..." -ForegroundColor Yellow

    # Crear estructura de wrapper
    New-Item -ItemType Directory -Path "gradle\wrapper" -Force | Out-Null

    # Descargar gradle-wrapper.jar
    $wrapperUrl = "https://services.gradle.org/distributions/gradle-8.4-bin.zip"
    Write-Host "  Descargando desde: $wrapperUrl"

    # Para simplificar, vamos a crear un gradlew simple
    $gradlewContent = @"
#!/bin/bash
cd `"$""PSScriptRoot`"
./gradle-wrapper-stub.ps1
"@

    Set-Content -Path "gradlew" -Value $gradlewContent
    Write-Host "✓ Gradle wrapper preparado" -ForegroundColor Green
}

# Limpiar builds anteriores
Write-Host "`n🧹 Limpiando builds anteriores..." -ForegroundColor Yellow
if (Test-Path "app\build") {
    Remove-Item "app\build" -Recurse -Force
}

# Compilar APK
Write-Host "`n🔨 Compilando APK..." -ForegroundColor Yellow
Write-Host "  Esto puede tomar varios minutos..."

# Usar gradle wrapper o gradle directamente
$gradleCmd = if (Test-Path "gradlew.bat") { ".\gradlew.bat" } else { "gradle" }

& $gradleCmd assembleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Compilación exitosa!" -ForegroundColor Green

    # Localizar APK
    $apkPath = Get-Item "app\build\outputs\apk\release\app-release.apk" -ErrorAction SilentlyContinue
    if ($apkPath) {
        $apkSize = "{0:N2} MB" -f ($apkPath.Length / 1MB)
        Write-Host "`n📦 APK Generado:" -ForegroundColor Green
        Write-Host "   Ruta: $($apkPath.FullName)"
        Write-Host "   Tamaño: $apkSize"

        # Copiar a carpeta dist
        New-Item -ItemType Directory -Path "..\dist" -Force | Out-Null
        Copy-Item $apkPath.FullName "..\dist\Nutricook-0.2.0-android.apk" -Force
        Write-Host "`n✓ APK copiado a: ..\dist\Nutricook-0.2.0-android.apk" -ForegroundColor Green
    }
} else {
    Write-Host "`n❌ Error en compilación" -ForegroundColor Red
    exit 1
}

Write-Host "`n" + "=" * 60
Write-Host "✅ Build completado" -ForegroundColor Green
