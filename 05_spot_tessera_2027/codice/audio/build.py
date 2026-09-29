"""Colonna sonora della v8 (30 s): musica originale a 128 BPM, continua e uniforme, con il sound design sui cue.

Uso (dalla cartella 05_spot_tessera_2027/codice):  python audio/build.py
Scrive out/musica_v8.wav (48 kHz stereo, -14 LUFS).

Struttura (fa minore · Fm Db Ab Eb):
  intro (0 – level up)     ostinato che si apre, kick in quattro già dal primo battere, charleston, riser
  groove (level up – fine) un solo groove continuo fino alla fine: kick, clap, charleston, basso in ottavi,
                           accordi, arpeggio. Nessuna pausa e nessun abbassamento automatico: l'energia cresce
                           con filtro e strati, colpo sul pulsante della CTA, accordo finale sull'ultima battuta.
La musica non si abbassa sotto la voce: il ducking si fa nel mix finale, quando la voce registrata c'è davvero.
"""
import json
import os
import sys

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, '..')
sys.path.insert(0, os.path.join(CODE, '..', '..', '04_motion', 'codice', 'audio'))
from synth import *  # noqa: F401,F403
from synth import SR

TL = json.load(open(os.path.join(CODE, 'timeline.json'), encoding='utf-8'))
BEAT = 60 / TL['bpm']
S16, BAR = BEAT / 4, BEAT * 4
SC = {}
t = 0.0
for s in TL['scenes']:
    SC[s['id']] = dict(s, t0=t, t1=t + s['dur'])
    t += s['dur']
DUR = t
N = int((DUR + 0.5) * SR)
A, B, C, E_, F, G, Hm, I = (SC[k] for k in 'abcefghi')

# cue visivi (stessi valori degli shot)
HITS_A = [A['t0'] + x for x in (1.0, 1.8, 2.75)]
POINT = A['t0'] + 4.0
LU = POINT + 0.34
DROP = round(LU / BEAT - 0.3) * BEAT          # primo battere del groove (subito prima dell'impatto)
BOUNCE_C = C['t0'] + 0.22
STEP_E = E_['dur'] / 3
HITS_E = [E_['t0'] + 0.25, E_['t0'] + STEP_E - 0.28, E_['t0'] + 2 * STEP_E - 0.28]
TES = F['t0'] + 0.62
UP_F, GRID_B = F['t0'] + 2.1, F['t0'] + 2.35
GRID = [GRID_B + 0.4 + i * 0.22 for i in range(4)]
SCR_G = [G['t0'] + x for x in (0.72, 1.25, 1.8, 2.45)]
REG = G['t0'] + 2.95
BALL_G = G['t1'] - 0.65
TM = Hm['t0'] + 0.62
RALLY = [TM - 0.1, TM + 0.3, TM + 0.62]
WIN = TM + 0.95
SIGN = WIN + 0.6
LAND_I = I['t0'] + 0.6
BOUNCE_I, CTA = I['t0'] + 1.85, I['t0'] + 2.2
END_CHORD = DUR - BAR                          # l'accordo finale occupa l'ultima battuta


class Bus:
    def __init__(self):
        self.x = np.zeros((N, 2))

    def add(self, sig, t, g=1.0, pan=0.0):
        i = int(round(t * SR))
        if sig.ndim == 1:
            sig = stereo(sig, pan)
        if i >= N or i + len(sig) <= 0:
            return
        a, b = max(0, i), min(N, i + len(sig))
        self.x[a:b] += sig[a - i:b - i] * g


drums, bass, synth, fx = Bus(), Bus(), Bus(), Bus()
kicks = []
PROG = [(41, [65, 68, 72]), (37, [65, 68, 73]), (44, [63, 68, 72]), (39, [63, 67, 70])]  # Fm, Db, Ab, Eb


def chord(t):
    return PROG[int(np.floor((t - DROP) / BAR + 1e-6)) % 4]


def energy(t):
    """0..1: cresce lentamente nel groove, con un gradino sulla CTA (automazione continua, mai a zero)."""
    if t < DROP:
        return 0.0
    return float(np.clip(0.55 + 0.35 * (t - DROP) / (CTA - DROP), 0, 0.9) + 0.1 * (t >= CTA))


def music():
    # accordi: una battuta ciascuno dal groove all'accordo finale, filtro che si apre con l'energia
    b = DROP
    while b < END_CHORD - 1e-6:
        root, notes = chord(b + 0.01)
        dur = min(BAR, END_CHORD - b)
        n = int((dur + 0.3) * SR)
        cut = 1600 + 3600 * energy(b)
        s = supersaw(midi(notes + [notes[0] + 12]), n, 0.012) * env_adsr(n, 0.02, 0.2, 0.8, 0.3, dur)[:, None]
        synth.add(np.stack([svf(s[:, c], cut, 0.7, 'lp') for c in range(2)], 1), b, 0.26)
        b += BAR
    # sequencer a sedicesimi
    for s in range(int(DUR / S16) + 1):
        t = s * S16
        if t >= DUR:
            break
        pos, beat = s % 16, s % 4 == 0
        root, notes = chord(t)
        intro = t < DROP
        end = t >= END_CHORD - 1e-6
        # kick in quattro fino all'accordo finale (smorzato nell'intro)
        if beat and not end:
            k = 0.55 if intro else 0.95
            kk = kick(k, punch=0.5 if intro else 1.0)
            if intro:
                kk = lp(kk, 400 + 1800 * t / DROP)
            drums.add(kk, t)
            if not intro:
                kicks.append((t, 0.42))
        if not intro and not end:
            if pos in (4, 12):
                drums.add(clap(0.62), t)
            drums.add(hat(0.2 + 0.12 * (s % 2 == 0) + 0.08 * energy(t)), t, 1.0, 0.3)
            if s % 4 == 2:
                drums.add(hat(0.34, True), t, 1.0, -0.2)
            if s % 2 == 0:
                pat = [0, 0, 12, 0, 0, 12, 7, 12][(s // 2) % 8]
                bass.add(bassline(float(midi(root - 12 + pat)), S16 * 1.8, 0.58), t)
            seq = notes + [n + 12 for n in notes]
            m = seq[[0, 1, 2, 3, 4, 3, 2, 1][s % 8]] + 12
            synth.add(stereo(lp(pluck(float(midi(m)), 0.3, 0.8, 0.14), 2500 + 4000 * energy(t)), 0.3 * np.sin(s)), t)
        if intro:
            # ostinato che si apre verso il level up
            m = [65, 72, 68, 72, 65, 75, 68, 72][s % 8]
            if s % 2 == 0 or t > 1.0:
                synth.add(stereo(lp(pluck(float(midi(m)), 0.28, 0.5, 0.24), 900 + 4200 * (t / DROP) ** 1.5), 0.25 * np.sin(s * 1.3)), t)
            if t > 0.9 and s % 2 == 0:
                drums.add(hat(0.14 + 0.24 * t / DROP), t, 1.0, 0.35)
            if t > DROP - 1.2:
                u = (t - (DROP - 1.2)) / 1.2
                if s % (2 if u < 0.5 else 1) == 0:
                    drums.add(snare(0.2 + 0.5 * u, 1 + 0.3 * u), t)
    # accordo finale: la bemolle maggiore con nona, sull'ultima battuta, con un colpo di kick e crash
    n = int((DUR - END_CHORD + 0.4) * SR)
    s = supersaw(midi([56, 63, 68, 72, 75, 82]), n, 0.013) * env_adsr(n, 0.01, 0.5, 0.75, 0.9, n / SR - 0.9)[:, None]
    synth.add(np.stack([svf(s[:, c], 5200, 0.7, 'lp') for c in range(2)], 1), END_CHORD, 0.42)
    bass.add(np.sin(2 * np.pi * float(midi(32)) * T(n / SR)) * env_adsr(n, 0.01, 0.4, 0.7, 0.9, n / SR - 0.9), END_CHORD, 0.55)
    drums.add(kick(1.0), END_CHORD)
    drums.add(crash(0.7, 2.0), END_CHORD)


def sfx():
    g = 0.8   # sound design sotto la musica: accompagna, non spezza
    for t in HITS_A:
        fx.add(pock(0.6), t, g)
    fx.add(riser(DROP - 1.4, 0.45), 1.4)
    fx.add(pock(1.0, 0.95), POINT, g)
    fx.add(impact(1.1), LU, g)
    fx.add(crash(0.8), DROP)
    fx.add(pock(0.9, 0.85), BOUNCE_C, g)
    fx.add(impact(0.6, 1.2, 60), BOUNCE_C, g)
    fx.add(whoosh(0.3, 300, 6000, 0.5), C['t1'] - 0.3, g)
    for tt in HITS_E:
        fx.add(pock(0.9, 1.05), tt, g)
        fx.add(whoosh(0.3, 250, 4000, 0.4), tt + 0.03, g)
    fx.add(whoosh(0.28, 300, 6000, 0.5), E_['t1'] - 0.28, g)
    fx.add(whoosh(0.5, 300, 4000, 0.45), F['t0'], g)
    fx.add(pock(0.9, 0.9), TES, g)
    fx.add(impact(0.8, 1.6, 60), TES, g)
    fx.add(shimmer(1.2, 0.4, 88), TES + 0.1, g)
    fx.add(whoosh(0.35, 400, 4000, 0.4), UP_F, g)
    for i, tt in enumerate(GRID):
        fx.add(pock(0.6, 1.05 + 0.04 * i), tt, g, -0.4 + 0.27 * i)
        fx.add(blip(2200 + 180 * i, 0.22), tt + 0.03, g)
    fx.add(whoosh(0.35, 300, 4500, 0.45), G['t0'], g)
    for tt in SCR_G:
        fx.add(swish(0.12, 0.25, 800, 4000), tt, g)
    fx.add(tap(0.9), REG, g)
    fx.add(chime([72, 79, 84], 0.06, 0.6), REG + 0.18, g)
    fx.add(whoosh(G['t1'] - BALL_G, 400, 6000, 0.6), BALL_G, g)
    fx.add(impact(0.7, 1.2, 60), Hm['t0'], g)
    for i, tt in enumerate(RALLY):
        fx.add(pock(0.95, 1.0 - 0.04 * i), tt, g, -0.3 if i % 2 == 0 else 0.3)
    fx.add(pock(1.0, 0.95), WIN, g)
    fx.add(impact(0.9), WIN, g)
    fx.add(cheer(2.2, 0.6), WIN + 0.05, g)
    fx.add(neon(0.4, 0.35), SIGN, g)
    fx.add(impact(0.7, 1.4, 60), LAND_I, g)
    fx.add(pock(0.8, 0.9), BOUNCE_I, g)
    fx.add(pock(1.0, 1.0), CTA, g)
    fx.add(impact(1.1, 2.0), CTA, g)
    fx.add(crash(0.6, 2.0), CTA)


def sidechain(n):
    g = np.ones(n)
    sh = np.arange(int(0.3 * SR)) / SR
    for t, depth in kicks:
        i = int(t * SR)
        seg_ = 1 - depth * np.exp(-sh / 0.08)
        j = min(n, i + len(seg_))
        g[i:j] = np.minimum(g[i:j], seg_[: j - i])
    return g


def limiter(x, ceil=0.89, release=0.08):
    from scipy.ndimage import maximum_filter1d
    from scipy.signal import lfilter as _lf
    peak = np.abs(x).max(1)
    k = int(0.004 * SR)
    pk = maximum_filter1d(peak, size=k * 2 + 1)
    g = np.minimum(1, ceil / np.maximum(pk, 1e-9))
    a = np.exp(-1 / (release * SR))
    g = np.minimum(g, -_lf([1 - a], [1, -a], -g))
    return x * g[:, None]


def main():
    music()
    sfx()
    ir = reverb_ir(2.0)
    sc = sidechain(N)[:, None]
    syn = synth.x * sc
    syn = syn + convolve(syn, ir) * 0.24
    bas = bass.x * np.minimum(1, sc * 1.1)
    fxx = fx.x + convolve(fx.x, ir) * 0.16
    mix = drums.x * 0.5 + bas * 0.6 + syn * 3.0 + fxx * 0.3
    mix = mix[: int(DUR * SR)]
    import pyloudnorm as pyln
    meter = pyln.Meter(SR)
    mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
    mix = limiter(mix, 0.89)
    fade = int(0.5 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.3
    out = os.path.join(CODE, 'out', 'musica_v8.wav')
    sf.write(out, mix.astype(np.float32), SR, subtype='PCM_16')
    print(f'{out}  {DUR:.2f} s  {meter.integrated_loudness(mix):.1f} LUFS  picco {np.abs(mix).max():.2f}  groove da {DROP:.2f} s')


if __name__ == '__main__':
    main()
