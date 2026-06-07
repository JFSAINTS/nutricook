# ⚡ Quick Start - NutriCook v0.2.0 to Production

**Documento rápido para publicar NutriCook en GitHub**

---

## 🎯 Lo Que Necesitas Hacer (3 Pasos)

### PASO 1: Crear GitHub Repo (5 minutos)

```
1. Ir a: https://github.com/new
2. Nombre: nutricook
3. Público
4. Crear repo
5. Copiar la URL (ej: https://github.com/JFSAINTS/nutricook.git)
```

### PASO 2: Push a GitHub (2 minutos)

En PowerShell:

```powershell
cd D:\NUTRICOOK

# Reemplazar USUARIO con tu usuario de GitHub
git remote set-url origin https://github.com/USUARIO/nutricook.git

git push -u origin main
git push origin --tags
```

**Si pide password**: Usar Personal Access Token desde GitHub → Settings → Developer Settings

### PASO 3: Crear Release (5 minutos)

```
1. Ir a: https://github.com/USUARIO/nutricook/releases
2. Click: "Create a new release"
3. Tag: v0.2.0
4. Title: "NutriCook v0.2.0 - Weight Control & Multi-Language"
5. Description: Ver RELEASE_SUMMARY.md
6. Adjuntar APK (si lo tienes compilado)
7. Click: "Publish release"
```

---

## 📱 Compilar APK (Opcional Ahora)

Puedes compilarlo después si lo prefieres:

```powershell
# 1. Instalar Java 21:
# https://www.oracle.com/java/technologies/downloads/

# 2. Instalar Android Studio:
# https://developer.android.com/studio

# 3. Compilar:
cd D:\NUTRICOOK\android-twa
gradle assembleRelease

# APK en: app/build/outputs/apk/release/app-release.apk
```

Para instrucciones detalladas, ver: **GITHUB_SETUP.md**

---

## 📋 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| **GITHUB_SETUP.md** | Guía completa paso a paso |
| **RELEASE_SUMMARY.md** | Resumen técnico para release |
| **ANDROID.md** | Guía detallada de Android |
| **DISCLAIMER.md** | Aviso legal (incluir en release) |
| **README.md** | Documentación para usuarios |

---

## ✅ Verificación Post-Publish

Una vez publicado, verifica:

```
[ ] GitHub repo accesible: https://github.com/USUARIO/nutricook
[ ] Commits visibles en GitHub
[ ] Tags pusheados (v0.2.0)
[ ] Release creado en GitHub
[ ] Descripción clara en release
[ ] APK adjunto (si aplica)
```

---

## 🌐 Publicar Web App (Opcional)

Para que la app funcione en Android TWA, necesita estar en GitHub Pages:

```
1. En GitHub repo → Settings → Pages
2. Build and deployment: Deploy from a branch
3. Branch: main, folder: / (root)
4. URL será: https://github.com.io/nutricook

⚠️ Nota: Actualmente funciona desde GitHub Pages
```

---

## 🎉 ¡Listo!

Con estos 3 pasos:
- ✅ Tu código está en GitHub
- ✅ Tendrás una release oficial
- ✅ APK disponible para descargar
- ✅ Disclaimer legal incluido
- ✅ Proyecto listofor production

**Tiempo total: ~15 minutos**

---

## 📞 Si Algo No Funciona

1. Leer **GITHUB_SETUP.md** (sección Troubleshooting)
2. Verificar credenciales de GitHub
3. Verificar que tienes permisos de push
4. Si el repo no existe, crearlo en GitHub.com primero

---

**Última actualización**: 2026-06-07  
**Versión**: 0.2.0
