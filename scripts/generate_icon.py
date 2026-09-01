"""Generates build/icon.png (1024x1024) — the Finora mark: a white "layers" glyph
(matching lucide-react's Layers icon, used for the sidebar logo) on a near-black
rounded-square backdrop, mirroring the in-app logo mark.
electron-builder auto-converts this single PNG into .icns (macOS) and .ico (Windows)
at package time, so we don't need platform-specific icon tooling in CI or locally.
"""
from PIL import Image, ImageDraw

SIZE = 1024
BG = (23, 23, 23, 255)  # Tailwind neutral-900, matches the sidebar logo mark
WHITE = (255, 255, 255, 255)

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Rounded square backdrop
radius = 220
draw.rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=radius, fill=BG)

# Layers glyph, adapted from lucide-react's 24x24 "Layers" icon path geometry
# (arced corners approximated as straight vertices + round line joins, which reads
# identically at icon scale) — an offset top diamond over two chevron "layers".
GLYPH_UNITS = 24
GLYPH_SIZE = 600  # rendered glyph footprint within the 1024 canvas
SCALE = GLYPH_SIZE / GLYPH_UNITS
OFFSET = (SIZE - GLYPH_SIZE) / 2
STROKE = round(2 * SCALE)


def pt(x, y):
    return (OFFSET + x * SCALE, OFFSET + y * SCALE)


diamond = [pt(12, 2.2), pt(21.4, 7), pt(12, 11.8), pt(2.6, 7), pt(12, 2.2)]
chevron_mid = [pt(2, 12.65), pt(12, 16.85), pt(22, 12.65)]
chevron_bottom = [pt(2, 17.65), pt(12, 21.85), pt(22, 17.65)]

for shape in (diamond, chevron_mid, chevron_bottom):
    draw.line(shape, fill=WHITE, width=STROKE, joint="curve")
    # round line caps at each vertex, matching SVG strokeLinecap="round"
    r = STROKE / 2
    for x, y in shape:
        draw.ellipse([x - r, y - r, x + r, y + r], fill=WHITE)

img.save("build/icon.png")
print("wrote build/icon.png", img.size)
