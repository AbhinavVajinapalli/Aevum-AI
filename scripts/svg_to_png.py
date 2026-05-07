import sys
from pathlib import Path

try:
    import cairosvg
except Exception as e:
    print('CairoSVG not installed:', e)
    sys.exit(2)

svg_path = Path(__file__).resolve().parents[1] / 'public' / 'logo-dark.svg'
png_path = svg_path.with_name('logo-dark.png')

if not svg_path.exists():
    print('SVG source not found:', svg_path)
    sys.exit(1)

# Render 400x400 PNG
cairosvg.svg2png(url=str(svg_path), write_to=str(png_path), output_width=400, output_height=400)
print('Wrote PNG:', png_path)
