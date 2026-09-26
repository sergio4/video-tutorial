"""Spettrogramma e volume di un mix, con gli atti e la voce segnati: python audio/spec.py mix.wav timeline.json out.png"""
import sys, json
import numpy as np, soundfile as sf
from scipy.signal import spectrogram
from PIL import Image, ImageDraw
x, sr = sf.read(sys.argv[1]); m = x.mean(1) if x.ndim == 2 else x
TL = json.load(open(sys.argv[2]))
f, t, S = spectrogram(m, sr, nperseg=2048, noverlap=1536)
S = 10 * np.log10(S + 1e-12)
keep = f < 12000
S = S[keep][::-1]
S = np.clip((S + 110) / 80, 0, 1)
Wpx = 1800; Hs = 300
img = Image.fromarray((S * 255).astype(np.uint8)).resize((Wpx, Hs))
img = img.convert('RGB')
out = Image.new('RGB', (Wpx, Hs + 160), (20, 20, 20)); out.paste(img, (0, 0))
d = ImageDraw.Draw(out)
dur = len(m) / sr
hop = int(0.02 * sr)
rms = np.array([np.sqrt((m[i:i + hop] ** 2).mean()) for i in range(0, len(m) - hop, hop)])
db = 20 * np.log10(rms + 1e-9)
pts = [(i * 0.02 / dur * Wpx, Hs + 150 - (max(-50, v) + 50) * 2.8) for i, v in enumerate(db)]
d.line(pts, fill=(80, 220, 255), width=1)
for v in TL['vo']:
    x0 = v['t'] / dur * Wpx
    d.rectangle([x0, Hs + 2, x0 + 40, Hs + 8], fill=(60, 200, 60))
for a in TL['acts']:
    X = a['t0'] / dur * Wpx
    d.line([(X, 0), (X, Hs + 160)], fill=(255, 0, 200), width=1)
    d.text((X + 3, 3), a['id'], fill=(255, 255, 0))
for s in range(int(dur) + 1):
    d.text((s / dur * Wpx, Hs + 10), str(s), fill=(150, 150, 150))
out.save(sys.argv[3])
