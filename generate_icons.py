#!/usr/bin/env python3
"""Generate NutriCook app icons with nutrition theme."""

from PIL import Image, ImageDraw
import os

# Create icons directory
os.makedirs('icons', exist_ok=True)

# Define NutriCook colors
BG_COLOR = (16, 185, 129)      # Verde #10b981
BG_DARK = (14, 14, 18)         # Dark background
WHITE = (232, 232, 240)        # Text/accent

# Icon sizes
SIZES = [16, 32, 48, 128, 192, 256, 512]

def create_icon(size):
    """Create icon for given size."""
    # Create image with dark background
    img = Image.new('RGB', (size, size), BG_DARK)
    draw = ImageDraw.Draw(img)

    # Draw main green circle (plate)
    margin = size // 8
    circle_bbox = [margin, margin, size - margin, size - margin]
    draw.ellipse(circle_bbox, fill=BG_COLOR)

    # Draw white circle border (plate rim)
    inner_margin = size // 4
    inner_bbox = [inner_margin, inner_margin, size - inner_margin, size - inner_margin]
    draw.ellipse(inner_bbox, outline=WHITE, width=max(1, size // 32))

    # Draw 3 food items (vegetables/fruits) on the plate
    dot_size = size // 12
    positions = [
        (size // 3, size // 3),
        (2 * size // 3, size // 3),
        (size // 2, 2 * size // 3)
    ]

    for x, y in positions:
        bbox = [
            x - dot_size // 2,
            y - dot_size // 2,
            x + dot_size // 2,
            y + dot_size // 2
        ]
        draw.ellipse(bbox, fill=WHITE)

    return img

# Generate all icons
for size in SIZES:
    img = create_icon(size)
    filename = f'icons/icon-{size}.png'
    img.save(filename)
    print(f'✓ Generated {filename}')

print('\n✓ All icons generated successfully')
