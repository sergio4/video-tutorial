"""Provino: affianca più fotogrammi in una griglia (per controllo visivo)."""
import sys, os
from PIL import Image, ImageDraw, ImageFont
files = sys.argv[2:]
out = sys.argv[1]
cols = 3 if len(files) > 4 else 2
w = 640
ims = [Image.open(f).convert('RGB').resize((w, int(w * 9 / 16))) for f in files]
h = ims[0].height
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w + (cols - 1) * 6, rows * (h + 26)), (30, 30, 30))
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * (w + 6), (i // cols) * (h + 26)
    sheet.paste(im, (x, y + 26))
    d.text((x + 6, y + 6), os.path.basename(f), fill=(255, 255, 0))
sheet.save(out, quality=88)
print(out, sheet.size)
