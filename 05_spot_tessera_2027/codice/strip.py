"""Provino di una finestra temporale di un video: python strip.py video.mp4 t0 t1 n out.jpg"""
import sys, subprocess, os, tempfile
from PIL import Image, ImageDraw
import imageio_ffmpeg
vid, t0, t1, n, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
ff = imageio_ffmpeg.get_ffmpeg_exe()
d = tempfile.mkdtemp()
ims = []
for i in range(n):
    t = t0 + (t1 - t0) * i / max(1, n - 1)
    p = os.path.join(d, f'{i}.png')
    subprocess.run([ff, '-v', 'error', '-ss', f'{t:.3f}', '-i', vid, '-frames:v', '1', '-vf', 'scale=480:-1', p], check=True)
    ims.append((t, Image.open(p).convert('RGB')))
cols = 4
w, h = ims[0][1].size
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (w + 4), rows * (h + 20)), (25, 25, 25))
dr = ImageDraw.Draw(sheet)
for i, (t, im) in enumerate(ims):
    x, y = (i % cols) * (w + 4), (i // cols) * (h + 20)
    sheet.paste(im, (x, y + 20))
    dr.text((x + 4, y + 4), f'{t:.2f}s', fill=(255, 255, 0))
sheet.save(out, quality=85)
print(out)
