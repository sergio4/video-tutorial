"""Ritaglia le frasi della v4 dalla voce registrata da Sergio (assets/voce/voce_master_registrata.mp3).

Uso (dalla cartella 04_motion/codice):  python audio/vo_cut.py
I tagli sono approssimati sulle parole (trascrizione con tempi per parola) e vengono spostati
sul punto più silenzioso entro ±0,25 s; ogni frase viene ripulita e normalizzata in audio/vo/<id>.wav.
Per usare una nuova registrazione basta cambiare FILE e CLIPS.
"""
import os
import subprocess

import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', '..', '..')
FILE = os.path.join(ROOT, 'assets', 'voce', 'voce_master_registrata.mp3')
SR = 48000

# id: (inizio, fine) in secondi nella registrazione
CLIPS = {
    'A': (0.0, 2.45),    # Sempre le solite amichevoli, su Tennis Clash?
    'B': (2.55, 5.35),   # C'è un circuito ufficiale, che ti aspetta.
    'C': (5.35, 7.55),   # E si entra proprio, dal tuo telefono.
    'D': (8.55, 11.85),  # Scarica l'app myFITP, e crea il tuo account.
    'F': (15.8, 17.9),   # Fai la Tessera eSports FITP.
    'G': (17.9, 19.8),   # È la chiave, dei tornei ufficiali.
    'H': (22.3, 24.2),   # Scegli un torneo del tuo livello.
    'I': (24.2, 26.35),  # Tocca «Registrati», e conferma.
    'K': (29.2, 30.9),   # Premi, «Vai al tuo match».
    'L': (30.9, 33.75),  # E ti ritrovi in campo, dentro Tennis Clash.
    'L2': (30.9, 32.28), # E ti ritrovi in campo.
    'N': (37.0, 40.7),   # Entra nel mondo eSports FITP, iscriviti e gioca.
    'O': (40.7, 41.85),  # Adesso, tocca a te!
}


def load(path):
    import imageio_ffmpeg
    raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def quietest(a, t, span=0.25):
    w = int(0.02 * SR)
    lo, hi = max(0, int((t - span) * SR)), min(len(a) - w, int((t + span) * SR))
    if hi <= lo:
        return int(t * SR)
    rms = [np.sqrt((a[i:i + w] ** 2).mean()) for i in range(lo, hi, w // 2)]
    return lo + int(np.argmin(rms)) * (w // 2) + w // 2


def clean(a):
    b, c = butter(2, 80 / (SR / 2), 'high')
    a = lfilter(b, c, a)
    nz = np.nonzero(np.abs(a) > np.abs(a).max() * 0.02)[0]
    a = a[max(0, nz[0] - int(0.02 * SR)): nz[-1] + int(0.08 * SR)]
    speech = a[np.abs(a) > 0.02 * np.abs(a).max()]
    a = a * (0.12 / (np.sqrt((speech ** 2).mean()) + 1e-9))
    fade = int(0.008 * SR)
    a[:fade] *= np.linspace(0, 1, fade)
    a[-fade:] *= np.linspace(1, 0, fade)
    return np.clip(a, -0.98, 0.98)


def main():
    a = load(FILE)
    out = os.path.join(HERE, 'vo')
    os.makedirs(out, exist_ok=True)
    for cid, (t0, t1) in CLIPS.items():
        i0 = 0 if t0 <= 0.05 else quietest(a, t0)
        i1 = len(a) if t1 >= len(a) / SR - 0.05 else quietest(a, t1)
        clip = clean(a[i0:i1].copy())
        sf.write(os.path.join(out, cid + '.wav'), clip, SR)
        print(f'{cid:3s} {i0 / SR:6.2f}–{i1 / SR:6.2f}  → {len(clip) / SR:.2f} s')


if __name__ == '__main__':
    main()
