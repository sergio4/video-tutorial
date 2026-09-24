"""Divide una registrazione continua nelle frasi del copione, secondo assets/voce/tagli.json.

Uso (dalla cartella codice/):  python audio/split_recording.py
Ogni taglio viene spostato sul punto più silenzioso entro ±0,25 s, poi la frase viene
ripulita come in import_vo.py e salvata in audio/vo/<id>.wav, segnata come «registrata».
"""
import json
import os
import sys

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', '..', '..')
sys.path.insert(0, HERE)
from import_vo import SR, clean, load  # noqa: E402


def quietest(a, t, span=0.25):
    w = int(0.02 * SR)
    lo, hi = max(0, int((t - span) * SR)), min(len(a) - w, int((t + span) * SR))
    if hi <= lo:
        return int(t * SR)
    rms = [np.sqrt((a[i:i + w] ** 2).mean()) for i in range(lo, hi, w // 2)]
    return lo + int(np.argmin(rms)) * (w // 2) + w // 2


def main():
    cfg = json.load(open(os.path.join(ROOT, 'assets', 'voce', 'tagli.json'), encoding='utf-8'))
    a = load(os.path.join(ROOT, cfg['file']))
    stamp_path = os.path.join(HERE, 'vo', 'stamp.json')
    stamps = json.load(open(stamp_path)) if os.path.exists(stamp_path) else {}
    for cid, (t0, t1) in cfg['clips'].items():
        i0 = 0 if t0 <= 0.05 else quietest(a, t0)
        i1 = len(a) if t1 >= len(a) / SR - 0.05 else quietest(a, t1)
        clip = clean(a[i0:i1].copy())
        sf.write(os.path.join(HERE, 'vo', cid + '.wav'), clip, SR)
        stamps[cid] = 'registrata'
        print(f'{cid}  {i0 / SR:6.2f}–{i1 / SR:6.2f}  → {len(clip) / SR:.2f} s')
    json.dump(stamps, open(stamp_path, 'w'), indent=1)


if __name__ == '__main__':
    main()
