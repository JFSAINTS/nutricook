# 🍎 Compilar NutriCook para macOS

Debido a restricciones de electron-builder, **la compilación para macOS debe hacerse en una máquina macOS**.

## Requisitos

- **macOS 10.15+** (Intel o Apple Silicon)
- **Node.js 16+**
- **Xcode Command Line Tools** (o Xcode completo)

## Pasos

### 1. Instalar Xcode Command Line Tools (si no lo tienes)

```bash
xcode-select --install
```

### 2. Clonar/actualizar el repositorio

```bash
git clone https://github.com/JFSAINTS/nutricook.git
cd nutricook
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Compilar para macOS

```bash
npm run build:mac
```

La compilación generará:
- **DMG installer**: `dist/Nutricook-0.2.0-mac.dmg` (para instalación en /Applications)
- **ZIP portable**: `dist/Nutricook-0.2.0-mac.zip` (para distribución)

### 5. Firmar y notarizar (opcional pero recomendado)

Para que macOS confíe en la aplicación sin mostrar advertencias:

```bash
# Requiere certificado de desarrollador Apple
npm run build:mac -- --publish=always
```

## Archivos Generados

| Archivo | Tamaño | Uso |
|---------|--------|-----|
| `Nutricook-0.2.0-mac.dmg` | ~150-180MB | Instalador GUI |
| `Nutricook-0.2.0-mac.zip` | ~150-180MB | Distribución directa |

## Troubleshooting

### "Electron not available"
```bash
npm install
```

### "Command not found: xcode-select"
Instala Xcode Command Line Tools:
```bash
xcode-select --install
```

### "Cannot find module 'electron-builder'"
```bash
npm install --save-dev electron-builder
```

## Notas

- La compilación para macOS crea versiones para **Intel y Apple Silicon** automáticamente (Universal Binary)
- Los archivos se guardan en `dist/`
- El proceso toma 3-5 minutos dependiendo de tu máquina

---

**Para Windows y Android:** Ver [RELEASES.md](RELEASES.md)
