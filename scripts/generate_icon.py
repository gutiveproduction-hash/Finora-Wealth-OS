"""Generates build/icon.png (1024x1024) — a simple rounded-square wallet mark.
electron-builder auto-converts this single PNG into .icns (macOS) and .ico (Windows)
at package time, so we don't need platform-specific icon tooling in CI or locally.
"""
from PIL import Image, ImageDraw

SIZE = 1024
BG = (10, 10, 10, 255)  # matches main.ts backgroundColor
BRAND = (34, 167, 109, 255)  # brand-600 (#22a76d)
BRAND_LIGHT = (176, 238, 204, 255)  # brand-200

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Rounded square backdrop
radius = 220
draw.rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=radius, fill=BRAND)

# Simple wallet glyph: a rounded rect "card" with a circular clasp, in white/near-white
card_margin_x = 190
card_top = 330
card_bottom = 720
draw.rounded_rectangle(
    [card_margin_x, card_top, SIZE - card_margin_x, card_bottom],
    radius=60,
    fill=(255, 255, 255, 255),
)
# Fold flap accent
draw.rounded_rectangle(
    [card_margin_x, card_top, SIZE - card_margin_x, card_top + 140],
    radius=60,
    fill=BRAND_LIGHT,
)
# Clasp circle
clasp_r = 48
clasp_cx = SIZE - card_margin_x - 70
clasp_cy = (card_top + card_bottom) // 2 + 30
draw.ellipse(
    [clasp_cx - clasp_r, clasp_cy - clasp_r, clasp_cx + clasp_r, clasp_cy + clasp_r],
    fill=BRAND,
)

img.save("build/icon.png")
print("wrote build/icon.png", img.size)
