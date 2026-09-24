"""Importa la voce registrata da una persona al posto della sintesi.

Uso (dalla cartella codice/):
  python audio/import_vo.py registrazione.m4a                  master (timeline.json)
  python audio/import_vo.py registrazione.m4a timeline_30.json taglio social
  python audio/import_vo.py cartella_con_file/                 un file per frase (m01.wav, m02.m4a…)

Con un unico file: le frasi vanno lette nell'ordine del copione (03_regia/copione_voce.md),
con almeno un secondo di silenzio tra una e l'altra; il file viene diviso sulle pause.
Ogni frase viene ripulita (taglio dei silenzi, filtro sotto gli 80 Hz, volume uniforme),
salvata in audio/vo/<id>.wav e segnata come «registrata», così make_vo.py non la sovrascrive.
Alla fine ogni frase viene trascritta e confrontata con il testo, e vengono segnalate
le frasi più lunghe dello spazio disponibile in timeline.
"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000


def load(path):
    import imageio_ffmpeg
    raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def split_on_silence(a, min_gap=0.7, thr_db=-40):
    w = int(0.02 * SR)
    rms = np.array([np.sqrt((a[i:i + w] ** 2).mean()) for i in range(0, len(a) - w, w)])
    thr = rms.max() * 10 ** (thr_db / 20)
    voiced = rms > thr
    segs, start, quiet = [], None, 0
    for i, v in enumerate(voiced):
        if v:
            start = i if start is None else start
            quiet = 0
        elif start is not None:
            quiet += 1
            if quiet * 0.02 >= min_gap:
                segs.append((start, i - quiet + 1))
                start, quiet = None, 0
    if start is not None:
        segs.append((start, len(voiced)))
    segs = [(s, e) for s, e in segs if (e - s) * 0.02 > 0.25]   # scarta respiri e rumori brevi
    return [a[max(0, s * w - int(0.05 * SR)): e * w + int(0.12 * SR)] for s, e in segs]


def clean(a):
    b, c = butter(2, 80 / (SR / 2), 'high')
    a = lfilter(b, c, a)
    nz = np.nonzero(np.abs(a) > np.abs(a).max() * 0.02)[0]
    a = a[max(0, nz[0] - int(0.03 * SR)): nz[-1] + int(0.1 * SR)]
    speech = a[np.abs(a) > 0.02 * np.abs(a).max()]
    a = a * (0.12 / (np.sqrt((speech ** 2).mean()) + 1e-9))
    fade = int(0.01 * SR)
    a[:fade] *= np.linspace(0, 1, fade)
    a[-fade:] *= np.linspace(1, 0, fade)
    return np.clip(a, -0.98, 0.98)


def similarity(ref, hyp):
    import difflib
    import re

    def norm(x):
        x = x.lower().replace('myfitp', 'my fitp')
        x = re.sub(r'\be[- ]?sports?\b|\bi[- ]?sports?\b', 'esport', x)
        return re.sub(r'[^a-zàèéìòù ]', ' ', x).split()
    return difflib.SequenceMatcher(None, norm(ref), norm(hyp)).ratio()


def main():
    src = sys.argv[1]
    tl_name = sys.argv[2] if len(sys.argv) > 2 else 'timeline.json'
    TL = json.load(open(os.path.join(HERE, '..', tl_name), encoding='utf-8'))
    ids = [v['id'] for v in TL['vo']]
    if os.path.isdir(src):
        files = {os.path.splitext(n)[0]: os.path.join(src, n) for n in os.listdir(src)}
        missing = [i for i in ids if i not in files]
        if missing:
            sys.exit('mancano i file: ' + ', '.join(missing))
        clips = [load(files[i]) for i in ids]
    else:
        clips = split_on_silence(load(src))
        if len(clips) != len(ids):
            sys.exit(f'ho trovato {len(clips)} frasi, il copione ne ha {len(ids)}: servono pause più lunghe tra le frasi, oppure un file per frase')
    os.makedirs(os.path.join(HERE, 'vo'), exist_ok=True)
    stamp_path = os.path.join(HERE, 'vo', 'stamp.json')
    stamps = json.load(open(stamp_path)) if os.path.exists(stamp_path) else {}
    for i, a in zip(ids, clips):
        sf.write(os.path.join(HERE, 'vo', i + '.wav'), clean(a), SR)
        stamps[i] = 'registrata'
    json.dump(stamps, open(stamp_path, 'w'), indent=1)

    from faster_whisper import WhisperModel
    asr = WhisperModel('small', device='cpu', compute_type='int8')
    vos = TL['vo']
    for k, v in enumerate(vos):
        path = os.path.join(HERE, 'vo', v['id'] + '.wav')
        d = sf.info(path).duration
        segs, _ = asr.transcribe(path, language='it', beam_size=5)
        hyp = ' '.join(x.text for x in segs).strip()
        nxt = vos[k + 1]['t'] if k + 1 < len(vos) else TL['dur']
        room = nxt - v['t'] - 0.2
        flag = '' if d <= room else f'  <-- più lunga di {d - room:.1f} s dello spazio'
        print(f"{v['id']}  {d:4.1f} s / {room:4.1f} s  fedeltà {similarity(v['text'], hyp):.2f}{flag}\n      testo: {v['text']}\n      sentito: {hyp}")


if __name__ == '__main__':
    main()
