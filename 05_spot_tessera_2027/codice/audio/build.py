"""Colonna sonora della v5 (30 s): musica originale a 128 BPM e sound design sui cue del video, senza voce.

Uso (dalla cartella 05_spot_tessera_2027/codice):  python audio/build.py
Scrive out/musica_v5.wav (48 kHz stereo, -14 LUFS). La voce non c'è ancora: la musica si abbassa da sola
nelle finestre V.O. della timeline (vo_in, vo_est), così lo speaker ha spazio e il mix finale resta semplice.

Struttura (fa minore · Fm Db Ab Eb):
  A  gioco      ostinato filtrato + kick smorzato; il filtro si apre col titolo, rullata e riser fino al punto
  B  level up   impatto sul punto vinto (5,5 s), drop: supersaw pieno, crash
  C  mondo      respiro: pad e arpeggio, kick in quattro leggero (spazio alla voce)
  D  tornei     groove pieno con basso e clap; whoosh e colpo su ogni card
  E  tessera    lift: pad largo, stab sui vantaggi
  F  myFITP     groove asciutto, tap e conferma
  G  CTA        salita, colpo sul pulsante ISCRIVITI ORA, accordo finale
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

# cue visivi (stessi valori degli shot)
A, B, C, D, E, F, G = (SC[k] for k in 'abcdefg')
HITS = [A['t0'] + x for x in (0.5, 1.2, 2.5, 3.3, 4.25)]
POINT = A['t0'] + 5.5
TITLE_A = A['t0'] + 2.6
DROP = 12 * BEAT                       # primo battere dopo il punto
C2 = C['t0'] + 1.9                     # logo FITP eSeries by BMW
STEP = D['dur'] / 3
CARDS = [D['t0'] + k * STEP for k in (1, 2)]
TB = E['t0'] + 1.7                     # vantaggi
TREG = F['t0'] + 1.75                  # tocco su REGISTRATI
TCTA = G['t0'] + 1.5                   # pulsante ISCRIVITI ORA
TEND = G['t0'] + 2.2                   # loghi, accordo finale


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


def sec(t):
    for k in 'abcdefg':
        if SC[k]['t0'] <= t < SC[k]['t1']:
            return 'b' if k == 'b' or (k == 'a' and t >= DROP) else k
    return 'end'


PROG = [(41, [65, 68, 72]), (37, [65, 68, 73]), (44, [63, 68, 72]), (39, [63, 67, 70])]  # Fm, Db, Ab, Eb


def chord(t):
    return PROG[int(np.floor((t - DROP) / BAR + 1e-6)) % 4]


def pad(t, dur, notes, g, cut, att=0.2):
    n = int((dur + 0.4) * SR)
    s = supersaw(midi(notes), n, 0.012) * env_adsr(n, att, 0.2, 0.8, 0.4, dur)[:, None]
    synth.add(np.stack([svf(s[:, c], cut, 0.7, 'lp') for c in range(2)], 1), t, g)


def stab(t, g=0.35, cut=4200):
    root, notes = chord(t + 0.01)
    n = int(0.6 * SR)
    s = supersaw(midi(notes + [notes[0] + 12]), n, 0.014) * env_adsr(n, 0.003, 0.3, 0.0, 0.2)[:, None]
    synth.add(np.stack([svf(s[:, c], cut, 0.8, 'lp') for c in range(2)], 1), t, g)


def music():
    # accordi per battuta, dal drop in poi
    b = DROP
    while b < TEND:
        name = sec(b + 0.01)
        root, notes = chord(b + 0.01)
        if name == 'b':
            pad(b, BAR, notes + [notes[0] + 12], 0.44, 5200, 0.01)
        elif name == 'c':
            pad(b, BAR, notes, 0.3, 1600, 0.3)
        elif name == 'd':
            pad(b, BAR, notes, 0.2, 2400, 0.05)
        elif name == 'e':
            pad(b, BAR, notes + [notes[0] + 12], 0.32, 3200, 0.2)
        elif name in ('f', 'g'):
            pad(b, BAR, notes, 0.18, 1800 + 1800 * (name == 'g'), 0.1)
        if name in ('b', 'c', 'e'):
            bass.add(np.sin(2 * np.pi * float(midi(root - 12)) * T(BAR)) * env_adsr(int(BAR * SR), 0.03, 0.1, 0.9, 0.15), b, 0.5)
        b += BAR
    # ostinato dell'intro: fa minore, filtro che si apre verso il titolo e il punto
    for s in range(int(DROP / S16)):
        t = s * S16
        if t >= POINT - 0.2:
            break
        m = [65, 72, 68, 72, 65, 75, 68, 72][s % 8] - 12 * (s % 2 == 1 and t < TITLE_A)
        cut = 900 + 3800 * np.clip((t - 0.3) / (POINT - 0.3), 0, 1) ** 1.6
        if s % 2 == 0 or t > TITLE_A:
            synth.add(stereo(lp(pluck(float(midi(m)), 0.28, 0.5, 0.26), cut), 0.25 * np.sin(s * 1.3)), t)
    # sequencer a sedicesimi
    for s in range(int(DUR / S16) + 1):
        t = s * S16
        name = sec(t)
        pos, beat = s % 16, s % 4 == 0
        root, notes = chord(t)
        k = 0
        if name == 'a' and beat and t < POINT - 0.25:
            k = 0.4 if t < TITLE_A else 0.65
        if name in ('b', 'd', 'e') and beat:
            k = 1.0 if name != 'e' else 0.8
        if name == 'c' and beat:
            k = 0.6
        if name == 'f' and beat:
            k = 0.7
        if name == 'g' and beat and t < TEND:
            k = 0.75 + 0.2 * (t > TCTA)
        if k:
            kk = kick(k, punch=0.4 if (name == 'a' and t < TITLE_A) else 1.0)
            if name == 'a' and t < TITLE_A:
                kk = lp(kk, 300)
            drums.add(kk, t)
            if name != 'a':
                kicks.append((t, 0.5 if name in ('b', 'd') else 0.3))
        if name in ('b', 'd', 'e', 'f') and pos in (4, 12):
            drums.add(clap(0.75 if name in ('b', 'd') else 0.5), t)
        if name == 'g' and pos in (4, 12) and TCTA <= t < TEND:
            drums.add(clap(0.7), t)
        # charleston
        if name == 'a' and t > 1.0 and s % 2 == 0 and t < POINT - 0.25:
            drums.add(hat(0.18 + 0.3 * t / POINT), t, 1.0, 0.35)
        if name in ('c', 'f') and s % 4 == 2:
            drums.add(hat(0.45), t, 1.0, 0.25)
        if name in ('b', 'd', 'e') or (name == 'g' and TCTA <= t < TEND):
            if s % 4 == 2:
                drums.add(hat(0.45, True), t, 1.0, -0.2)
            else:
                drums.add(hat(0.26 + 0.1 * (s % 2 == 0)), t, 1.0, 0.3)
        # rullata verso il punto: ottavi, poi sedicesimi
        if name == 'a' and HITS[3] <= t < POINT - 0.2:
            u = (t - HITS[3]) / (POINT - 0.2 - HITS[3])
            if s % (2 if u < 0.5 else 1) == 0:
                drums.add(snare(0.2 + 0.55 * u, 1 + 0.35 * u), t)
        # rullata verso la CTA
        if name == 'g' and TCTA - BEAT * 2 <= t < TCTA:
            u = (t - (TCTA - BEAT * 2)) / (BEAT * 2)
            drums.add(snare(0.25 + 0.5 * u, 1 + 0.3 * u), t)
        # basso
        if name in ('b', 'd') and s % 2 == 0:
            pat = [0, 0, 12, 0, 0, 12, 7, 12][(s // 2) % 8]
            bass.add(bassline(float(midi(root - 12 + pat)), S16 * 1.8, 0.62, growl=0.7 * (name == 'b'), lfo_hz=1 / (S16 * 2)), t)
        if name in ('f', 'g') and s % 2 == 0 and t < TEND:
            pat = [0, 0, 12, 0, 0, 12, 0, 7][(s // 2) % 8]
            bass.add(bassline(float(midi(root - 12 + pat)), S16 * 1.7, 0.5), t)
        if name == 'e' and s % 4 == 0:
            bass.add(bassline(float(midi(root - 12)), S16 * 3.5, 0.5), t)
        # arpeggio: mondo e tessera
        if name in ('c', 'e'):
            seq = notes + [n + 12 for n in notes]
            m = seq[[0, 1, 2, 3, 4, 3, 2, 1][s % 8]] + 12
            synth.add(stereo(pluck(float(midi(m)), 0.32, 0.8, 0.18 if name == 'c' else 0.2), 0.3 * np.sin(s)), t)
        # stab in controtempo nel groove delle card
        if name == 'd' and s % 4 == 2 and (s // 4) % 2 == 1:
            n = int(0.25 * SR)
            st = supersaw(midi(notes), n, 0.01) * env_adsr(n, 0.003, 0.12, 0.0, 0.05)[:, None]
            synth.add(np.stack([svf(st[:, c], 2600, 0.8, 'lp') for c in range(2)], 1), t, 0.2)
    # stab sui cue: card, vantaggi, pulsante
    for tt in CARDS + [TB + 0.05, TB + 0.3]:
        stab(tt, 0.34)
    # accordo finale: la bemolle maggiore con nona
    n = int((DUR - TEND + 0.3) * SR)
    s = supersaw(midi([56, 63, 68, 72, 75, 82]), n, 0.013) * env_adsr(n, 0.01, 0.8, 0.6, 1.4, n / SR - 1.4)[:, None]
    synth.add(np.stack([svf(s[:, c], 5000, 0.7, 'lp') for c in range(2)], 1), TEND, 0.45)
    bass.add(np.sin(2 * np.pi * float(midi(32)) * T(n / SR)) * env_adsr(n, 0.01, 0.5, 0.7, 1.2, n / SR - 1.2), TEND, 0.55)


def sfx():
    # A: i colpi veri della partita, con il segnale dei +XP
    for i, t in enumerate(HITS):
        pan = -0.4 if i % 2 == 0 else 0.4
        fx.add(pock(0.8, 1 + 0.02 * i), t, 1.0, pan)
        fx.add(blip(1500 + 120 * i, 0.3 + 0.15 * (i == 4)), t + 0.05, 1.0, 0.5)
    fx.add(swish(0.3, 0.4, 400, 3000), TITLE_A - 0.05)
    fx.add(riser(POINT - 2.4, 0.5), 2.4)
    fx.add(revcym(1.0, 0.55), POINT - 1.0)
    # B: punto vinto → LEVEL UP
    fx.add(pock(1.1, 0.95), POINT)
    fx.add(impact(1.25), POINT)
    fx.add(crash(0.9), DROP)
    fx.add(chime([77, 81, 84, 89], 0.06, 0.8), POINT + 0.3)
    fx.add(whoosh(0.45, 300, 6000, 0.7), C['t0'] - 0.45)
    # C
    fx.add(impact(0.5, 1.4, 70), C['t0'])
    fx.add(shimmer(1.2, 0.45), C['t0'] + 0.05)
    fx.add(swish(0.35, 0.45, 300, 3000), C2 - 0.15)
    fx.add(impact(0.45, 1.2, 65), C2)
    # D: le card
    fx.add(whoosh(0.5, 200, 3500, 0.6), D['t0'] - 0.1)
    for tt in CARDS:
        fx.add(whoosh(0.4, 250, 4000, 0.6), tt - 0.4)
        fx.add(lp(kick(0.6, 0.25, 0.6), 900), tt)
    # E: la tessera
    fx.add(whoosh(0.55, 200, 5000, 0.65), E['t0'])
    fx.add(shimmer(1.3, 0.5, 88), E['t0'] + 0.5)
    for k, tt in enumerate((TB + 0.05, TB + 0.3)):
        fx.add(swish(0.25, 0.35, 500, 3500), tt, 1.0, 0.3)
    for k in range(3):
        fx.add(blip(2000 + 200 * k, 0.25), TB + 0.75 + 0.12 * k, 1.0, 0.2 * k)
    # F: myFITP
    fx.add(whoosh(0.5, 300, 4500, 0.55), F['t0'])
    fx.add(chime([84, 88], 0.07, 0.5), F['t0'] + 0.6)
    fx.add(tap(1.1), TREG)
    fx.add(chime([72, 79, 84], 0.07, 0.8), TREG + 0.2)
    fx.add(whoosh(0.45, 3000, 300, 0.5, up=False), F['t1'] - 0.45)
    # G: CTA
    fx.add(impact(0.5, 1.2, 70), G['t0'])
    fx.add(riser(TCTA - G['t0'] - 0.2, 0.35, 500, 8000), G['t0'] + 0.2)
    fx.add(impact(1.1, 2.0), TCTA)
    fx.add(crash(0.7, 2.4), TCTA)
    fx.add(shimmer(1.2, 0.4, 91), TCTA + 0.35)
    fx.add(blip(2400, 0.3), TCTA + 0.35)
    fx.add(neon(0.4, 0.25), TEND)


def sidechain(n):
    g = np.ones(n)
    sh = np.arange(int(0.32 * SR)) / SR
    for t, depth in kicks:
        i = int(t * SR)
        seg_ = 1 - depth * np.exp(-sh / 0.085)
        j = min(n, i + len(seg_))
        g[i:j] = np.minimum(g[i:j], seg_[: j - i])
    return g


def vo_duck(n, depth=0.5):
    """Spazio alla voce: la musica scende nelle finestre V.O. stimate (rampe di 0,15 s)."""
    g = np.ones(n)
    tt = np.arange(n) / SR
    for s in SC.values():
        if not s['vo_est']:
            continue
        a, b = s['t0'] + s['vo_in'] - 0.1, s['t0'] + s['vo_in'] + s['vo_est'] + 0.1
        w = np.clip(np.minimum((tt - a) / 0.15, (b - tt) / 0.15), 0, 1)
        g = np.minimum(g, 1 - depth * w)
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
    ir = reverb_ir(2.2)
    sc = sidechain(N)[:, None]
    syn = synth.x * sc
    syn = syn + convolve(syn, ir) * 0.26
    bas = bass.x * np.minimum(1, sc * 1.1)
    fxx = fx.x + convolve(fx.x, ir) * 0.18
    duck = vo_duck(N, 0.45)[:, None]
    mix = (drums.x * 0.5 + bas * 0.6 + syn * 3.0) * duck + fxx * (0.5 + 0.5 * duck) * 0.42
    mix = mix[: int(DUR * SR)]
    import pyloudnorm as pyln
    meter = pyln.Meter(SR)
    mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
    mix = limiter(mix, 0.89)
    fade = int(0.35 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
    out = os.path.join(CODE, 'out', 'musica_v5.wav')
    sf.write(out, mix.astype(np.float32), SR, subtype='PCM_16')
    print(f'{out}  {DUR:.2f} s  {meter.integrated_loudness(mix):.1f} LUFS  picco {np.abs(mix).max():.2f}')


if __name__ == '__main__':
    main()
