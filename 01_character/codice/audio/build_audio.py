"""Colonna sonora provvisoria di «Tocca a te»: musica, effetti e voce, mixati sulla timeline.

Uso:  python audio/build_audio.py        (dalla cartella codice/, dopo audio/make_vo.py)
Scrive audio/mix.wav (48 kHz stereo) e ../../02_animatic/sottotitoli.srt.

Tutto è sintetizzato in codice (numpy/scipy): serve a fissare ritmo e sincronizzazione,
va sostituito con un brano di libreria ed effetti registrati prima della produzione.
Musica in re maggiore, 96 BPM. Sezioni: fuori (chitarra pizzicata) · dentro (pad e marimba,
il battito cresce a ogni tappa) · silenzio prima di «Vai al tuo match» · campo (pieno) ·
ritorno del tema di chitarra · accordo finale su «Tocca a te».
"""
import json
import os

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, lfilter, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, '..', 'timeline.json'), encoding='utf-8'))
Q = TL['cue']
SR = 48000
DUR = TL['dur']
N = int(DUR * SR)
BEAT = 60 / 96
BAR = 4 * BEAT
rng = np.random.default_rng(7)


# ---------- utilità ----------
def T(sec):
    return np.arange(int(sec * SR)) / SR


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, fc, order=2):
    b, a = butter(order, min(fc, SR / 2 - 100) / (SR / 2), 'low')
    return lfilter(b, a, x)


def hp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), 'high')
    return lfilter(b, a, x)


def bp(x, lo, hi, order=2):
    b, a = butter(order, [lo / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], 'band')
    return lfilter(b, a, x)


def curve(keys, n=N):
    """Automazione: lista di (tempo, valore) interpolata linearmente su tutta la durata."""
    ts, vs = zip(*keys)
    return np.interp(np.arange(n) / SR, ts, vs)


class Bus:
    def __init__(self):
        self.x = np.zeros((N, 2))

    def add(self, sig, t, gain=1.0, pan=0.0):
        """Aggiunge un segnale mono (o stereo) al tempo t, con panoramica -1…1."""
        i = int(t * SR)
        if i >= N or i + len(sig) <= 0:
            return
        if sig.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            sig = np.stack([sig * l, sig * r], 1) * np.sqrt(2)
        a, b = max(0, i), min(N, i + len(sig))
        self.x[a:b] += sig[a - i:b - i] * gain


def reverb(x, secs=1.8, wet=0.25, tone=5000):
    n = int(secs * SR)
    t = np.arange(n) / SR
    ir = np.stack([lp(rng.standard_normal(n), tone), lp(rng.standard_normal(n), tone)], 1) * np.exp(-t * 6.9 / secs)[:, None]
    ir /= np.sqrt((ir ** 2).sum(0))
    out = np.stack([fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
    return x * (1 - wet) + out * wet


# ---------- strumenti ----------
def pluck(f, dur=1.6, bright=0.5):
    """Chitarra pizzicata (Karplus-Strong)."""
    n = int(dur * SR)
    p = max(2, int(SR / f))
    x = np.zeros(n)
    x[:p] = lp(rng.uniform(-1, 1, p), 1500 + 5000 * bright) * 0.5
    a = np.zeros(p + 2)
    a[0], a[p], a[p + 1] = 1, -0.498, -0.498  # y[n] = x[n] + 0.498 (y[n-p] + y[n-p-1])
    out = lfilter([1], a, x)
    return out * np.minimum(1, np.arange(n) / 60)


def marimba(f, dur=0.9):
    t = T(dur)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + 0.35 * np.sin(2 * np.pi * f * 3.99 * t) * np.exp(-t * 22)
    s += 0.12 * np.sin(2 * np.pi * f * 9.9 * t) * np.exp(-t * 40)
    return s * np.minimum(1, t / 0.003)


def pad(fs, dur, att=1.2, rel=1.5, cutoff=1400):
    t = T(dur + rel)
    s = np.zeros(len(t))
    for f in fs:
        for det in (-0.006, 0, 0.007):
            ph = 2 * np.pi * f * (1 + det) * t + rng.uniform(0, 6.28)
            s += 2 * ((ph / (2 * np.pi)) % 1) - 1  # dente di sega
    s = lp(s / (3 * len(fs)), cutoff, 2)
    env = np.minimum(1, t / att) * np.clip((dur + rel - t) / rel, 0, 1)
    return s * env


def kick(g=1.0):
    t = T(0.45)
    f = 45 + 75 * np.exp(-t * 28)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    return (s + 0.3 * lp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 90)) * g


def clap():
    t = T(0.3)
    n = bp(rng.standard_normal(len(t)), 900, 5000)
    env = np.exp(-t * 18) + 0.6 * np.exp(-((t - 0.012) % 0.011) * 300) * (t < 0.035)
    return n * env * 0.6


def shaker():
    t = T(0.09)
    return hp(rng.standard_normal(len(t)), 6000) * np.exp(-t * 55) * 0.35


def bass(f, dur):
    t = T(dur)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return lp(s, 600) * np.minimum(1, t / 0.01) * np.exp(-t * 2.2)


def lead(f, dur):
    t = T(dur)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.3)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    s = sum(np.sin(k * ph) / k for k in (1, 3, 5, 7))
    return lp(s, 2600) * np.minimum(1, t / 0.02) * np.exp(-t * 1.6) * 0.5


# ---------- effetti ----------
def pock(g=1.0, pitch=1.0):
    """Pallina colpita: la firma sonora di ogni tocco."""
    t = T(0.18)
    f = (420 + 700 * np.exp(-t * 60)) * pitch
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38)
    s += 0.5 * hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 400)
    return s * g


def whoosh(dur, lo=300, hi=3000, g=1.0, up=True):
    t = T(dur)
    n = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    seg = int(0.02 * SR)
    for i in range(0, len(t), seg):
        u = i / len(t)
        fc = lo * (hi / lo) ** (u if up else 1 - u)
        out[i:i + seg] = bp(n[i:i + seg + 400], fc * 0.7, fc * 1.4)[:len(out[i:i + seg])]
    return out * np.sin(np.pi * t / dur) ** 1.5 * g


def chime(notes, step=0.12, g=0.5):
    out = np.zeros(int((step * len(notes) + 1.6) * SR))
    for i, m in enumerate(notes):
        t = T(1.6)
        f = midi(m)
        s = (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 4)) * np.exp(-t * 3)
        j = int(i * step * SR)
        out[j:j + len(s)] += s
    return out * g


def clicks(n=2, gap=0.03, g=0.6):
    t = T(0.05)
    c = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 250)
    ring = sum(np.sin(2 * np.pi * f * T(0.4)) for f in (2300, 3710, 5120)) * np.exp(-T(0.4) * 14) * 0.15
    out = np.zeros(int((gap * n + 0.4) * SR))
    for i in range(n):
        j = int(i * gap * SR)
        out[j:j + len(c)] += c
    out[:len(ring)] += ring
    return out * g


def paper(dur=0.12, g=0.4):
    t = T(dur)
    return bp(rng.standard_normal(len(t)), 1500, 7000) * np.exp(-t * 30) * g


def step_sfx(g=0.35):
    t = T(0.12)
    return lp(rng.standard_normal(len(t)), 500) * np.exp(-t * 40) * g


def boing(g=0.5):
    t = T(0.5)
    f = 180 + 260 * t / 0.5
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 0.08 * np.sin(2 * np.pi * 18 * t))) / SR) * np.exp(-t * 6) * g


def bird(g=0.18):
    t = T(0.14)
    f = 3200 + 1600 * np.sin(np.pi * t / 0.14)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.14) * g


def tick(g=0.3):
    t = T(0.04)
    return hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 200) * g


def buzz(dur=0.6, g=0.35):
    t = T(dur)
    return np.sign(np.sin(2 * np.pi * 150 * t)) * lp(np.ones(len(t)), 50) * (np.sin(2 * np.pi * 6 * t) > 0) * g * 0.3


def scribble(dur, g=0.25):
    t = T(dur)
    n = bp(rng.standard_normal(len(t)), 2000, 8000)
    return n * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * t) ** 2) * g


def riser(dur, g=0.4):
    t = T(dur)
    return whoosh(dur, 200, 6000, 1.0) * (t / dur) ** 2 * g + np.sin(2 * np.pi * np.cumsum(400 + 1600 * (t / dur) ** 2) / SR) * (t / dur) ** 3 * g * 0.15


def crowd(dur, g=0.3):
    t = T(dur)
    n = bp(rng.standard_normal(len(t)), 300, 2500)
    mod = 0.7 + 0.3 * np.sin(2 * np.pi * 0.23 * t) * np.sin(2 * np.pi * 0.61 * t)
    return n * mod * g


def cheer(dur=3.0, g=0.6):
    t = T(dur)
    n = bp(rng.standard_normal(len(t)), 400, 4000)
    env = np.minimum(1, t / 0.25) * np.exp(-np.maximum(0, t - 0.8) * 1.2)
    claps = np.zeros(len(t))
    for _ in range(90):
        j = int(rng.uniform(0.1, dur - 0.1) * SR)
        c = clap()[: int(0.05 * SR)] * rng.uniform(0.1, 0.4)
        claps[j:j + len(c)] += c[: len(claps) - j]
    return (n * env + claps * env) * g


# ---------- musica ----------
PROG = [(50, [62, 66, 69, 73]), (47, [62, 66, 69, 71]), (43, [59, 62, 67, 71]), (45, [61, 64, 69, 76])]  # D, Bm, G, A (con settime/none)


def chord_at(t):
    return PROG[int(t // (2 * BAR)) % 4]


def music():
    guitar, keys, pads, low, top = Bus(), Bus(), Bus(), Bus(), Bus()
    # chitarra pizzicata: fuori, ritorno, finale
    t = 0.0
    while t < DUR:
        root, notes = chord_at(t)
        for k, m in enumerate([notes[0], notes[2], notes[1], notes[3], notes[2], notes[1]]):
            guitar.add(pluck(midi(m - 12 + 12), 1.6, 0.4), t + k * BEAT / 1.5 * 1.0, 0.22, -0.35)
        guitar.add(pluck(midi(root), 2.0, 0.3), t, 0.25, -0.2)
        t += BAR
    # pad e marimba nel mondo dentro e in campo
    t = 0.0
    while t < DUR:
        root, notes = chord_at(t)
        pads.add(pad([midi(n) for n in notes] + [midi(root)], 2 * BAR, 1.0, 1.6), t, 0.5)
        t += 2 * BAR
    t = 0.0
    arp = [0, 2, 1, 3, 2, 1, 3, 2]
    while t < DUR:
        root, notes = chord_at(t)
        for k in range(8):
            keys.add(marimba(midi(notes[arp[k]] + 12)), t + k * BEAT / 2, 0.16, 0.3 if k % 2 else 0.1)
        t += BAR
    # batteria: battito leggero dalla tappa 2, pieno in campo, di nuovo leggero nel finale
    for b in np.arange(0, DUR, BEAT):
        beat_in_bar = int(round(b / BEAT)) % 4
        if beat_in_bar in (1, 3):
            top.add(clap(), b, 0.35, 0.1)
        for s in range(2):
            top.add(shaker(), b + s * BEAT / 2, 0.5 if s else 0.3, 0.4)
        root, _ = chord_at(b)
        low.add(bass(midi(root - 12 + 12), BEAT * 0.9), b, 0.45)
    # melodia in campo
    mel = [74, 78, 81, 78, 71, 74, 78, 76, 67, 71, 74, 71, 69, 73, 76, 73]
    lead_bus = Bus()
    t = Q['arena'] + 1.6
    i = 0
    while t < Q['t7'] - 0.5:
        lead_bus.add(lead(midi(mel[i % len(mel)]), BEAT * 0.95), t, 0.22, 0.15)
        t += BEAT
        i += 1
    # automazioni per sezione
    A = Q
    silence = curve([(0, 1), (A['silence'] - 0.12, 1), (A['silence'], 0), (A['match_tap'] + 0.05, 0), (A['match_tap'] + 0.6, 1), (DUR, 1)])
    g_guitar = curve([(0, 0), (0.8, 1), (A['tp_in'] + 0.4, 1), (A['tp_in'] + 1.4, 0), (A['t7'] + 0.3, 0), (A['t7'] + 1.8, 0.9), (A['tocca'] - 0.2, 0.9), (A['tocca'], 0), (DUR, 0)])
    g_pad = curve([(0, 0), (A['tp_in'] + 1.0, 0), (A['tp_land'] + 1.0, 0.8), (A['silence'], 0.9), (A['arena'], 0.6), (A['t7'], 0.6), (A['end'], 0.35), (A['tocca'] - 0.2, 0.35), (A['tocca'], 0), (DUR, 0)])
    g_keys = curve([(0, 0), (A['tp_land'], 0), (A['tp_land'] + 1.5, 1), (A['silence'], 1), (A['arena'], 0.5), (A['t7'], 0.5), (A['t7'] + 1.5, 0), (DUR, 0)])
    g_kick_half = curve([(0, 0), (A['p2'], 0), (A['p2'] + 0.1, 1), (A['silence'], 1), (A['arena'], 0), (A['end'] + 1.5, 0), (A['end'] + 2, 0.7), (A['tocca'] - 0.2, 0.7), (A['tocca'], 0), (DUR, 0)])
    g_kick_full = curve([(0, 0), (A['arena'], 0), (A['arena'] + 0.05, 1), (A['shot3'] + 0.5, 1), (A['shot3'] + 0.7, 0), (A['cheer'] - 0.05, 0), (A['cheer'], 1), (A['t7'], 1), (A['t7'] + 0.8, 0), (DUR, 0)])
    g_top = curve([(0, 0), (A['p3'], 0), (A['p3'] + 1, 0.6), (A['silence'], 0.6), (A['arena'], 1), (A['shot3'] + 0.5, 1), (A['shot3'] + 0.7, 0), (A['cheer'], 1), (A['t7'], 1), (A['t7'] + 0.6, 0), (DUR, 0)])
    g_low = curve([(0, 0), (A['p3'], 0), (A['p3'] + 1.5, 0.7), (A['silence'], 0.8), (A['arena'], 1), (A['t7'], 1), (A['t7'] + 1.2, 0), (DUR, 0)])
    g_lead = curve([(0, 1), (DUR, 1)])

    # la batteria usa due tracce: mezzo tempo (1 e 3) e pieno (ogni battuta)
    half, full = Bus(), Bus()
    for b in np.arange(0, DUR, BEAT):
        if int(round(b / BEAT)) % 2 == 0:
            half.add(kick(), b, 0.6)
        full.add(kick(), b, 0.55)
    mix = (guitar.x * g_guitar[:, None] + pads.x * g_pad[:, None] + keys.x * g_keys[:, None] +
           half.x * g_kick_half[:, None] + full.x * g_kick_full[:, None] + top.x * g_top[:, None] +
           low.x * g_low[:, None] + lead_bus.x * g_lead[:, None])
    # rallentatore sul vincente: filtro che si chiude e si riapre con il pubblico
    a, b = int((A['shot3'] + 0.4) * SR), int(A['cheer'] * SR)
    if b > a:
        seg = mix[a:b].copy()
        mix[a:b] = np.stack([lp(seg[:, c], 500) for c in range(2)], 1) * 0.8
    # accordo finale su «Tocca a te»
    fin = Bus()
    fin.add(pad([midi(n) for n in (50, 57, 62, 66, 69, 76)], 3.0, 0.05, 1.8, 2400), A['tocca'], 0.9)
    fin.add(pluck(midi(62), 3.0, 0.6), A['tocca'], 0.4, -0.2)
    fin.add(pluck(midi(69), 3.0, 0.6), A['tocca'] + 0.05, 0.35, 0.2)
    mix = (mix + fin.x) * silence[:, None]
    return reverb(mix, 2.2, 0.22)


def sfx():
    s = Bus()
    A = Q
    # ambiente del circolo: uccelli e palleggi lontani
    for lo, hi in ((0, A['tp_in'] + 0.6), (A['t7'] + 0.8, DUR)):
        t = lo + 0.4
        while t < hi:
            if rng.random() < 0.5:
                s.add(bird(), t, 0.7, rng.uniform(-0.8, 0.8))
                s.add(bird(), t + 0.12, 0.5, rng.uniform(-0.8, 0.8))
            s.add(lp(pock(0.25, 0.8), 1500), t + 1.1, 0.4, -0.7)
            t += 2.6
        s.add(lp(rng.standard_normal(int((hi - lo) * SR)), 400) * 0.03, lo, 1, 0)
    # scena 01: la pallina esce dal telefono e rimbalza
    b0 = A['ball_out']
    s.add(chime([86], g=0.2), b0, 0.6, 0.2)
    for k, dt in enumerate((0.8, 1.6)):
        s.add(pock(0.7, 1.0 - 0.08 * k), b0 + dt, 0.7, 0.3 + 0.2 * k)
    s.add(chime([81, 86], 0.08, 0.2), b0 + 2.6, 0.6, 0.0)
    # teletrasporto 1
    s.add(whoosh(1.3, 200, 2500, 0.5), A['tp_in'], 1, 0)
    for k in range(6):
        s.add(whoosh(0.35, 800, 4000, 0.35), A['tp_in'] + 1.2 + k * 0.2, 1, (-1) ** k * 0.4)
    s.add(riser(1.2, 0.3), A['tp_in'] + 1.0, 1, 0)
    s.add(kick(0.6), A['tp_land'], 1, 0)
    s.add(kick(0.45), A['tp_land'] + 0.5, 1, 0.3)      # Ciuffo atterra davanti alla bacheca
    s.add(chime([74, 78, 81, 86], 0.06, 0.25), A['tp_land'], 1, 0)
    # tappa 1
    s.add(whoosh(0.5, 400, 2000, 0.4, False), A['doors'], 1, 0)
    s.add(chime([79, 83], 0.1, 0.2), A['doors'] + 0.3, 1, 0)
    s.add(whoosh(0.7, 500, 3000, 0.3), A['tag_throw'], 1, 0.3)
    s.add(clicks(2, 0.04, 0.8), A['tag_snap'], 1, -0.3)
    hop = (A['p2'] - A['ball_hop']) / 5  # stessa cadenza dei salti disegnati
    for k in range(1, 6):  # la pallina saltella verso la tappa 2
        s.add(pock(0.45, 1.05), A['ball_hop'] + k * hop, 1, -0.2 + k * 0.2)
    # passi
    for lo, hi in ((A['walk1'], A['p2'] - 0.2), (A['walk2'], A['p3'] - 0.2)):
        for k, t in enumerate(np.arange(lo, hi, 0.4)):
            s.add(step_sfx(), t, 1, (-1) ** k * 0.15)
    # tappa 2: la tessera scende come una foglia, poi si accende
    for k, t in enumerate(np.arange(A['p2'], A['card_catch'], 0.28)):
        s.add(paper(0.1, 0.25), t, 1, np.sin(k) * 0.5)
    s.add(paper(0.2, 0.6), A['card_catch'], 1, 0)
    s.add(whoosh(0.5, 300, 1500, 0.35), A['gag'], 1, -0.3)
    s.add(paper(0.15, 0.5), A['card_flip'], 1, 0)
    s.add(chime([81, 88], 0.1, 0.45), A['card_glow'], 1, 0)
    s.add(chime([74, 78, 81, 86, 90, 93], 0.09, 0.18), A['road'], 1, 0.4)
    # tappa 3
    t, gap = A['p3'], 0.12
    while t < A['list_stop']:
        s.add(tick(0.2), t, 1, 0.2)
        t += gap
        gap *= 1.07
    s.add(pock(0.4, 1.2), A['list_stop'], 1, 0)
    s.add(whoosh(0.5, 600, 3000, 0.35), A['card_pull'], 1, 0.2)
    s.add(whoosh(0.8, 300, 1800, 0.35), A['sheet'], 1, 0)
    s.add(boing(0.35), A['jump_btn'], 1, 0.3)
    s.add(pock(1.0), A['btn_press'], 1, 0.3)
    s.add(pock(0.5, 1.3), A['popup'], 1, 0)
    s.add(pock(0.9, 1.1), A['confirm'], 1, -0.2)
    s.add(chime([74, 78, 81], 0.11, 0.35), A['confirm'] + 0.25, 1, 0)
    s.add(tick(0.4), A['seats'], 1, -0.3)
    t, gap = A['day'], 0.5  # ticchettio che accelera: il tempo che passa
    while t < A['ready_btn']:
        s.add(tick(0.35), t, 1, 0.3)
        t += gap
        gap = max(0.06, gap * 0.82)
    s.add(bird(0.25), A['ready_btn'] - 0.6, 1, -0.5)
    s.add(riser(A['silence'] - A['day'], 0.18), A['day'], 1, 0)
    s.add(pock(0.9), A['ready_tap'], 1, 0.3)
    s.add(chime([81], 0.1, 0.25), A['match_btn'], 1, 0)
    # teletrasporto 2
    s.add(pock(1.2, 0.9), A['match_tap'], 1, 0.3)
    s.add(kick(0.4), A['match_tap'] + 0.12, 1, 0)
    s.add(whoosh(1.2, 2500, 200, 0.5, False), A['match_tap'] + 0.2, 1, 0)
    for k in range(8):
        s.add(whoosh(0.35, 800, 4000, 0.35), A['match_tap'] + 0.8 + k * 0.2, 1, (-1) ** k * 0.4)
    s.add(riser(1.6, 0.35), A['match_tap'] + 1.2, 1, 0)
    s.add(kick(1.0), A['arena'], 1, 0)
    s.add(kick(0.5), A['arena'] + 0.6, 1, 0)           # atterraggio a fondo campo
    # campo
    s.add(crowd(A['t7'] + 1.5 - A['arena'], 0.22), A['arena'], 1, 0)
    s.add(scribble(1.0, 0.18), A['arena'] + 0.1, 1, 0)
    s.add(whoosh(0.4, 500, 2500, 0.3), A['arena'] + 1.4, 1, 0)
    for k, key in enumerate(('shot1', 'shot2', 'shot3')):
        t0 = A[key]
        s.add(whoosh(0.4, 400, 3500, 0.45), t0, 1, 0)
        s.add(pock(1.1), t0 + 0.4, 1, 0.1)
        if k < 2:
            s.add(pock(0.3, 0.8), t0 + 1.22, 1, 0)             # rimbalzo nel campo avversario
            s.add(lp(pock(0.7, 0.9), 2500), t0 + 1.3, 1, -0.1)  # risposta dell'avversario
        else:
            s.add(pock(0.5, 0.8), A['cheer'] - 0.03, 1, 0.4)   # il vincente tocca terra
    s.add(cheer(3.2, 0.6), A['cheer'], 1, 0)
    # ritorno sulla panchina
    s.add(whoosh(1.5, 3000, 300, 0.4, False), A['t7'], 1, 0)
    s.add(buzz(0.7, 0.4), A['vittoria'], 1, 0.3)
    s.add(chime([74, 78, 81, 86], 0.1, 0.3), A['vittoria'] + 0.2, 1, 0.2)
    # finale
    s.add(whoosh(0.6, 500, 2500, 0.3), A['end'] + 0.9, 1, 0.3)       # telefono che gira sul dito
    s.add(paper(0.3, 0.2), A['stand'], 1, 0)
    s.add(scribble(0.4, 0.3), A['tally'], 1, 0.2)
    for key in ('recap1', 'recap2', 'recap3', 'recap4'):
        s.add(tick(0.25), A[key], 1, 0)
    s.add(pock(1.3, 0.95), A['tocca'], 1, 0)
    s.add(chime([86], 0.1, 0.15), A['domain'], 1, 0)
    return reverb(s.x, 1.2, 0.15, 7000)


def voice():
    v = Bus()
    for item in TL['vo']:
        a, sr = sf.read(os.path.join(HERE, 'vo', item['id'] + '.wav'))
        a = resample_poly(a, SR, sr)
        v.add(a, item['t'], 1.0, 0)
    return v.x


def srt(path):
    def ts(x):
        h, m = int(x // 3600), int(x % 3600 // 60)
        return f'{h:02d}:{m:02d}:{int(x % 60):02d},{int(round(x % 1 * 1000)) % 1000:03d}'
    rows = []
    for i, item in enumerate(TL['vo'], 1):
        d = sf.info(os.path.join(HERE, 'vo', item['id'] + '.wav')).duration
        rows.append(f"{i}\n{ts(item['t'])} --> {ts(item['t'] + d + 0.3)}\n{item['text']}\n")
    open(path, 'w', encoding='utf-8').write('\n'.join(rows))


def main():
    mus, fx, vo = music(), sfx(), voice()
    # la musica si abbassa sotto la voce (circa -8 dB), con attacco rapido e rilascio morbido
    env = lp(np.abs(vo.sum(1)), 8, 1)
    duck = 1 - 0.6 * np.clip(env / 0.03, 0, 1)
    duck = lp(duck, 3, 1)
    mix = mus * 0.55 * duck[:, None] + fx * 0.7 + vo * 1.1
    peak = np.abs(mix).max()
    mix = np.tanh(mix / peak * 1.2) / np.tanh(1.2) * 0.89  # limitatore morbido, picco a -1 dBFS
    fade = np.minimum(1, np.minimum(np.arange(N) / (0.05 * SR), (N - np.arange(N)) / (0.8 * SR)))
    mix *= fade[:, None]
    out = os.path.join(HERE, 'mix.wav')
    sf.write(out, mix.astype(np.float32), SR, subtype='PCM_16')
    srt(os.path.join(HERE, '..', '..', '..', '02_animatic', 'sottotitoli_v3.srt'))
    for name, x in (('musica', mus * 0.55), ('effetti', fx * 0.7), ('voce', vo * 1.1)):
        print(f'{name:8s} rms {20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9):6.1f} dBFS')
    print('scritto', out, f'{N / SR:.1f} s')


if __name__ == '__main__':
    main()
