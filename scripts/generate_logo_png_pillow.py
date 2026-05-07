from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W = H = 400
out = Path(__file__).resolve().parents[1] / 'public' / 'logo-dark-pillow.png'

# Create gradient background
base = Image.new('RGB', (W, H), '#0b1220')
draw = ImageDraw.Draw(base)

# Vertical gradient
for i in range(H):
    r1, g1, b1 = (11, 18, 32)
    r2, g2, b2 = (15, 23, 36)
    t = i / (H - 1)
    r = int(r1 + (r2 - r1) * t)
    g = int(g1 + (g2 - g1) * t)
    b = int(b1 + (b2 - b1) * t)
    draw.line([(0, i), (W, i)], fill=(r, g, b))

# Rounded rect mask
mask = Image.new('L', (W, H), 0)
md = ImageDraw.Draw(mask)
md.rounded_rectangle([0, 0, W, H], radius=40, fill=255)
base.putalpha(mask)

# Create final RGBA with rounded background
final = Image.new('RGBA', (W, H), (0, 0, 0, 0))
final.paste(base, (0, 0), mask)
d = ImageDraw.Draw(final)

# Draw stylized 'A' as polygons
# Coordinates approximate to SVG design
poly_outer = [(110,300),(170,120),(230,120),(290,300),(250,300),(234,250),(166,250),(150,300)]
d.polygon(poly_outer, fill=(15,23,36,240))
poly_acc = [(150,220),(190,140),(210,140),(250,220)]
d.polygon(poly_acc, fill=(125,211,252,255))
# small triangle cut
tri = [(175,175),(225,175),(200,230)]
d.polygon(tri, fill=(7,17,38,220))

# Add text label
try:
    font = ImageFont.truetype('arial.ttf', 26)
except Exception:
    font = ImageFont.load_default()

text = 'Aevum AI'
# Use textbbox for accurate sizing across Pillow versions
bbox = d.textbbox((0,0), text, font=font)
text_w = bbox[2] - bbox[0]
text_h = bbox[3] - bbox[1]
d.text(((W-text_w)/2, 0.82*H), text, font=font, fill=(219,234,254,255))

final.save(out, format='PNG')
print('Wrote PNG:', out)
