"""Create NutriCook app icons for all platforms."""
from PIL import Image, ImageDraw
import os
import subprocess
import sys

def create_icon(size):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Green circle background
    margin = max(2, int(size * 0.05))
    draw.ellipse([margin, margin, size-margin, size-margin], fill=(16, 185, 129, 255))
    # White plate shape
    cx, cy = size // 2, size // 2
    pr = int(size * 0.28)
    draw.ellipse([cx-pr, cy-pr//2, cx+pr, cy+pr//2+int(size*0.05)], fill=(255,255,255,220))
    # Steam lines
    for offset in [-1, 0, 1]:
        x = cx + offset * int(size * 0.1)
        y1 = cy - pr//2 - int(size*0.06)
        y2 = cy - pr//2 - int(size*0.16)
        lw = max(1, int(size*0.025))
        draw.line([(x, y1), (x, y2)], fill=(255,255,255,160), width=lw)
    return img

# Create all sizes
os.makedirs('build', exist_ok=True)
os.makedirs('icons', exist_ok=True)

sizes = [16, 32, 48, 64, 128, 192, 256, 512, 1024]
for s in sizes:
    icon = create_icon(s)
    icon.save(f'build/icon_{s}.png')
    if s <= 512:
        icon.save(f'icons/icon-{s}.png')
    print(f'Created {s}x{s}')

# Create iconset for macOS
iconset_dir = 'build/icon.iconset'
os.makedirs(iconset_dir, exist_ok=True)

iconset_mapping = {
    '16x16': 16, '16x16@2x': 32,
    '32x32': 32, '32x32@2x': 64,
    '128x128': 128, '128x128@2x': 256,
    '256x256': 256, '256x256@2x': 512,
    '512x512': 512, '512x512@2x': 1024,
}

for name, size in iconset_mapping.items():
    src = f'build/icon_{size}.png'
    if os.path.exists(src):
        import shutil
        shutil.copy(src, f'{iconset_dir}/icon_{name}.png')

# Convert to ICNS using iconutil
try:
    result = subprocess.run(
        ['iconutil', '-c', 'icns', iconset_dir, '-o', 'build/icon.icns'],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        print('Created build/icon.icns')
    else:
        print(f'iconutil warning: {result.stderr}')
        # Fallback: copy largest PNG as icns placeholder
        import shutil
        shutil.copy('build/icon_512.png', 'build/icon.icns')
        print('Using PNG fallback for icon.icns')
except FileNotFoundError:
    print('iconutil not available, using PNG fallback')
    import shutil
    shutil.copy('build/icon_512.png', 'build/icon.icns')

# Windows ICO
imgs = [create_icon(s) for s in [16, 32, 48, 256]]
imgs[0].save(
    'build/icon.ico', format='ICO',
    sizes=[(16,16),(32,32),(48,48),(256,256)],
    append_images=imgs[1:]
)
print('Created build/icon.ico')
print('All icons created successfully!')
