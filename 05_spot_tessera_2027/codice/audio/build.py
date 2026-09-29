"""Colonna sonora della v6 (45 s): musica originale a 128 BPM e sound design sui cue del video, senza voce.

Uso (dalla cartella 05_spot_tessera_2027/codice):  python audio/build.py
Scrive out/musica_v6.wav (48 kHz stereo, -14 LUFS). La musica si abbassa da sola nelle finestre V.O. della timeline.
Ogni colpo della pallina (filo conduttore) ha il suo suono: esce dal telefono, rimbalza, svela, colpisce le card,
accende la tessera e i vantaggi, gioca la partita, preme la CTA.

Struttura (fa minore · Fm Db Ab Eb):
  01 apertura   ostinato filtrato + kick smorzato; il filtro si apre con la domanda, rullata e riser fino al punto
  02 level up   impatto (la pallina arriva sulla camera), drop pieno
  03-04 mondo   respiro (pad, arpeggio); whoosh della pallina che svela il logo del circuito
  05 card       groove pieno con basso; colpo su ogni card
  06 tessera    lift largo; impatto sulla tessera, quattro note sui vantaggi
  07 myFITP     groove asciutto; download, tap, conferma
  08 match      stab del VS, colpi dello scambio, impatto e folla sul punto vincente
  09 CTA        crescendo e colpo sul pulsante, accordo finale
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
A, B, C, D, E_, F, G, Hm, I = (SC[k] for k in 'abcdefghi')

# cue visivi (stessi valori degli shot)
HITS_A = [A['t0'] + x for x in (0.5, 1.2, 2.5, 3.3, 4.25)]
POINT = A['t0'] + 5.5
LU = POINT + 0.34                      # la pallina arriva sulla camera: LEVEL UP
Q_IN = A['t0'] + 1.3                   # la domanda si costruisce
DROP = 12 * BEAT
BOUNCE_C = C['t0'] + 0.45
PASS_D = (D['t0'] + 0.05, D['t0'] + 0.75)
STEP_E = E_['dur'] / 3
HITS_E = [E_['t0'] + 0.3, E_['t0'] + STEP_E - 0.42, E_['t0'] + 2 * STEP_E - 0.42]
TES = F['t0'] + 0.35
PANELS = [F['t0'] + 1.0, F['t0'] + 1.25]
GRID_B = F['t0'] + 3.35
GRID = [GRID_B + 0.55 + 0.3 + i * 0.3 for i in range(4)]
DL1, NAV, CARD, REG = G['t0'] + 1.45, G['t0'] + 2.05, G['t0'] + 3.3, G['t0'] + 4.4
BALL_G = G['t1'] - 1.0
TM = Hm['t0'] + 1.05
RALLY = [TM - 0.1, TM + 0.38, TM + 0.8]
WIN = TM + 1.2
SIGN = WIN + 0.8
LAND_I = I['t0'] + 0.85
BOUNCE_I, CTA = I['t0'] + 2.55, I['t0'] + 2.95
TEND = CTA + 0.7


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
    if t < DROP:
        return 'a'
    for k in 'bcdefghi':
        if SC[k]['t0'] <= t < SC[k]['t1']:
            return k
    return 'b' if t < SC['b']['t1'] else 'end'


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


PADS = {'b': (0.44, 5200, 0.01, True), 'c': (0.3, 1600, 0.3, False), 'd': (0.3, 2200, 0.2, False), 'e': (0.2, 2400, 0.05, False),
        'f': (0.32, 3200, 0.2, True), 'g': (0.18, 1800, 0.1, False), 'h': (0.2, 3000, 0.05, False), 'i': (0.22, 2600, 0.2, True)}


def music():
    b = DROP
    while b < TEND:
        name = sec(b + 0.01)
        root, notes = chord(b + 0.01)
        if name in PADS:
            g, cut, att, octave = PADS[name]
            if name == 'i':
                cut = 2000 + 3200 * np.clip((b - I['t0']) / (CTA - I['t0']), 0, 1)
            pad(b, BAR, notes + ([notes[0] + 12] if octave else []), g, cut, att)
        if name in ('b', 'c', 'd', 'f', 'i'):
            bass.add(np.sin(2 * np.pi * float(midi(root - 12)) * T(BAR)) * env_adsr(int(BAR * SR), 0.03, 0.1, 0.9, 0.15), b, 0.5)
        b += BAR
    # ostinato dell'apertura: il filtro si apre verso la domanda e il punto
    for s in range(int(DROP / S16)):
        t = s * S16
        if t >= POINT - 0.2:
            break
        m = [65, 72, 68, 72, 65, 75, 68, 72][s % 8] - 12 * (s % 2 == 1 and t < Q_IN)
        cut = 900 + 3800 * np.clip((t - 0.3) / (POINT - 0.3), 0, 1) ** 1.6
        if s % 2 == 0 or t > Q_IN:
            synth.add(stereo(lp(pluck(float(midi(m)), 0.28, 0.5, 0.26), cut), 0.25 * np.sin(s * 1.3)), t)
    for s in range(int(DUR / S16) + 1):
        t = s * S16
        name = sec(t)
        pos, beat = s % 16, s % 4 == 0
        root, notes = chord(t)
        k = 0
        if name == 'a' and beat and t < POINT - 0.25:
            k = 0.4 if t < Q_IN else 0.62
        if name in ('b', 'e') and beat:
            k = 1.0
        if name in ('c', 'd') and beat:
            k = 0.6
        if name == 'f' and beat:
            k = 0.8
        if name == 'g' and beat and t < BALL_G:
            k = 0.7
        if name == 'h' and beat and TM <= t < WIN:
            k = 0.85
        if name == 'i' and beat and t >= CTA - 0.02 and t < TEND + BAR * 2:
            k = 0.9
        if k:
            kk = kick(k, punch=0.4 if (name == 'a' and t < Q_IN) else 1.0)
            if name == 'a' and t < Q_IN:
                kk = lp(kk, 300)
            drums.add(kk, t)
            if name != 'a':
                kicks.append((t, 0.5 if name in ('b', 'e') else 0.3))
        if (name in ('b', 'e', 'f', 'g') or (name == 'h' and TM <= t < WIN) or (name == 'i' and CTA <= t < TEND + BAR * 2)) and pos in (4, 12):
            drums.add(clap(0.75 if name in ('b', 'e') else 0.55), t)
        if name == 'a' and t > 1.0 and s % 2 == 0 and t < POINT - 0.25:
            drums.add(hat(0.18 + 0.3 * t / POINT), t, 1.0, 0.35)
        if name in ('c', 'd', 'g') and s % 4 == 2:
            drums.add(hat(0.45), t, 1.0, 0.25)
        if name in ('b', 'e', 'f') or (name == 'i' and CTA <= t < TEND + BAR * 2):
            if s % 4 == 2:
                drums.add(hat(0.45, True), t, 1.0, -0.2)
            else:
                drums.add(hat(0.26 + 0.1 * (s % 2 == 0)), t, 1.0, 0.3)
        # rullate: verso il punto, verso l'impatto sulla tessera, verso la CTA
        for r0, r1 in ((HITS_A[3], POINT - 0.2), (PASS_D[1] + 1.2, D['t1']), (CTA - BEAT * 3, CTA)):
            if r0 <= t < r1:
                u = (t - r0) / (r1 - r0)
                if s % (2 if u < 0.5 else 1) == 0:
                    drums.add(snare(0.2 + 0.55 * u, 1 + 0.35 * u), t)
        if name in ('b', 'e') and s % 2 == 0:
            pat = [0, 0, 12, 0, 0, 12, 7, 12][(s // 2) % 8]
            bass.add(bassline(float(midi(root - 12 + pat)), S16 * 1.8, 0.62, growl=0.7 * (name == 'b'), lfo_hz=1 / (S16 * 2)), t)
        if name in ('g', 'h') and s % 2 == 0 and not (name == 'g' and t >= BALL_G):
            pat = [0, 0, 12, 0, 0, 12, 0, 7][(s // 2) % 8]
            bass.add(bassline(float(midi(root - 12 + pat)), S16 * 1.7, 0.5), t)
        if name == 'i' and s % 2 == 0 and CTA <= t < TEND + BAR * 2:
            pat = [0, 0, 12, 0, 0, 12, 7, 12][(s // 2) % 8]
            bass.add(bassline(float(midi(root - 12 + pat)), S16 * 1.8, 0.55), t)
        if name in ('c', 'f'):
            seq = notes + [n + 12 for n in notes]
            m = seq[[0, 1, 2, 3, 4, 3, 2, 1][s % 8]] + 12
            synth.add(stereo(pluck(float(midi(m)), 0.32, 0.8, 0.18), 0.3 * np.sin(s)), t)
        if name == 'e' and s % 4 == 2 and (s // 4) % 2 == 1:
            n = int(0.25 * SR)
            st = supersaw(midi(notes), n, 0.01) * env_adsr(n, 0.003, 0.12, 0.0, 0.05)[:, None]
            synth.add(np.stack([svf(st[:, c], 2600, 0.8, 'lp') for c in range(2)], 1), t, 0.2)
    for tt in HITS_E + PANELS + [Hm['t0'] + 0.3, SIGN]:
        stab(tt, 0.34)
    # note dei quattro vantaggi: salgono con i rimbalzi della pallina
    for i, tt in enumerate(GRID):
        synth.add(stereo(pluck(float(midi([77, 80, 84, 87][i])), 0.7, 1.0, 0.32), -0.4 + 0.27 * i), tt)
    # accordo finale: la bemolle maggiore con nona
    n = int((DUR - TEND + 0.3) * SR)
    s = supersaw(midi([56, 63, 68, 72, 75, 82]), n, 0.013) * env_adsr(n, 0.01, 0.8, 0.6, 1.6, n / SR - 1.6)[:, None]
    synth.add(np.stack([svf(s[:, c], 5000, 0.7, 'lp') for c in range(2)], 1), TEND, 0.4)
    bass.add(np.sin(2 * np.pi * float(midi(32)) * T(n / SR)) * env_adsr(n, 0.01, 0.5, 0.7, 1.4, n / SR - 1.4), TEND, 0.5)


def sfx():
    # 01: i colpi veri della partita, la domanda
    for i, t in enumerate(HITS_A):
        fx.add(pock(0.7, 1 + 0.02 * i), t, 1.0, -0.4 if i % 2 == 0 else 0.4)
    fx.add(whoosh(0.9, 200, 3000, 0.5), A['t0'])
    fx.add(swish(0.3, 0.35, 400, 3000), Q_IN)
    fx.add(riser(POINT - 2.4, 0.5), 2.4)
    fx.add(revcym(1.0, 0.55), POINT - 1.0)
    # 02: la pallina esce dal telefono e arriva sulla camera
    fx.add(pock(1.1, 0.95), POINT)
    fx.add(whoosh(LU - POINT + 0.05, 300, 5000, 0.8), POINT - 0.05)
    fx.add(impact(1.25), LU)
    fx.add(crash(0.9), LU)
    fx.add(chime([77, 81, 84, 89], 0.06, 0.8), LU + 0.2)
    fx.add(whoosh(0.7, 3000, 300, 0.55, up=False), B['t1'] - 0.75)
    # 03: rimbalzo sul palco
    fx.add(whoosh(0.45, 5000, 400, 0.5, up=False), C['t0'])
    fx.add(pock(1.1, 0.85), BOUNCE_C)
    fx.add(impact(0.9, 1.6, 60), BOUNCE_C)
    fx.add(shimmer(1.2, 0.45), BOUNCE_C + 0.05)
    fx.add(swish(0.5, 0.4, 300, 3000), BOUNCE_C + 0.1)
    # 04: la pallina svela il logo del circuito
    fx.add(whoosh(PASS_D[1] - PASS_D[0] + 0.1, 200, 6000, 0.85), PASS_D[0] - 0.05)
    fx.add(zap(0.5, 0.6, True), PASS_D[0] + 0.3)
    fx.add(shimmer(1.0, 0.4, 88), PASS_D[1] + 0.5)
    fx.add(riser(1.4, 0.4, 500, 8000), D['t1'] - 1.4)
    fx.add(whoosh(0.4, 300, 5000, 0.7), D['t1'] - 0.4)
    # 05: colpi sulle card
    for tt in HITS_E:
        fx.add(swish(0.25, 0.4, 600, 4000), tt - 0.25)
        fx.add(pock(1.0, 1.05), tt)
        fx.add(lp(kick(0.6, 0.25, 0.6), 900), tt)
        fx.add(whoosh(0.42, 250, 4000, 0.5), tt + 0.05)
    fx.add(whoosh(0.35, 300, 6000, 0.7), E_['t1'] - 0.35)
    # 06: la tessera si accende, i vantaggi
    fx.add(pock(1.0, 0.9), TES)
    fx.add(impact(1.1, 2.0, 60), TES)
    fx.add(shimmer(1.4, 0.5, 88), TES + 0.1)
    for tt in PANELS:
        fx.add(swish(0.3, 0.4, 500, 3500), tt)
    fx.add(whoosh(0.55, 400, 3000, 0.5), GRID_B)
    for i, tt in enumerate(GRID):
        fx.add(pock(0.75, 1.05 + 0.04 * i), tt, 1.0, -0.4 + 0.27 * i)
        fx.add(blip(2200 + 180 * i, 0.3), tt + 0.03, 1.0, -0.4 + 0.27 * i)
    # 07: myFITP
    fx.add(whoosh(0.55, 300, 4500, 0.55), G['t0'])
    fx.add(chime([84, 88, 91], 0.07, 0.6), DL1)
    for tt in (NAV, CARD, REG):
        fx.add(tap(1.1), tt)
    fx.add(chime([72, 79, 84], 0.07, 0.8), REG + 0.2)
    fx.add(whoosh(G['t1'] - BALL_G, 400, 6000, 0.8), BALL_G)
    # 08: match
    fx.add(impact(0.9, 1.4, 60), Hm['t0'])
    fx.add(glitch(0.2, 0.4), Hm['t0'] + 0.3)
    for i, tt in enumerate(RALLY):
        fx.add(pock(1.05, 1.0 - 0.04 * i), tt, 1.0, -0.3 if i % 2 == 0 else 0.3)
    fx.add(pock(1.1, 0.95), WIN)
    fx.add(impact(1.1), WIN)
    fx.add(cheer(3.0, 0.9), WIN + 0.05)
    fx.add(neon(0.45, 0.45), SIGN)
    fx.add(whoosh(0.3, 300, 6000, 0.6), Hm['t1'] - 0.25)
    # 09: CTA
    fx.add(impact(0.9, 1.8, 60), LAND_I)
    fx.add(shimmer(1.4, 0.5, 91), LAND_I + 0.1)
    fx.add(swish(0.5, 0.4, 400, 3000), I['t0'] + 1.0)
    fx.add(riser(CTA - I['t0'] - 1.4, 0.4, 500, 9000), I['t0'] + 1.4)
    fx.add(pock(1.0, 0.9), BOUNCE_I)
    fx.add(pock(1.1, 1.0), CTA)
    fx.add(impact(1.25, 2.6), CTA)
    fx.add(crash(0.8, 2.6), CTA)
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
    duck = vo_duck(N, 0.4)[:, None]
    mix = (drums.x * 0.5 + bas * 0.6 + syn * 3.0) * duck + fxx * (0.5 + 0.5 * duck) * 0.42
    mix = mix[: int(DUR * SR)]
    import pyloudnorm as pyln
    meter = pyln.Meter(SR)
    mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
    mix = limiter(mix, 0.89)
    fade = int(0.4 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
    out = os.path.join(CODE, 'out', 'musica_v6.wav')
    sf.write(out, mix.astype(np.float32), SR, subtype='PCM_16')
    print(f'{out}  {DUR:.2f} s  {meter.integrated_loudness(mix):.1f} LUFS  picco {np.abs(mix).max():.2f}')


if __name__ == '__main__':
    main()
