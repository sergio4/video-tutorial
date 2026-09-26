"""Colonna sonora della v4: musica elettronica a 128 BPM, sound design e voce, tutto sui cue della timeline.

Uso (dalla cartella 04_motion/codice, dopo audio/vo_cut.py):
  python audio/build.py timeline_45.json
  python audio/build.py timeline_30.json
Scrive il mix (48 kHz stereo, -14 LUFS) e i sottotitoli indicati nella timeline.
La musica è in fa minore (Fm · Db · Ab · Eb), costruita a sezioni che seguono gli atti del video.
"""
import json
import os
import sys

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import *  # noqa: F401,F403
from synth import SR, rng

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, '..')
TL_NAME = sys.argv[1] if len(sys.argv) > 1 else 'timeline_45.json'
TL = json.load(open(os.path.join(CODE, TL_NAME), encoding='utf-8'))
DUR = TL['dur']
N = int((DUR + 0.5) * SR)
BEAT = 60 / TL['bpm']
S16 = BEAT / 4
BAR = 4 * BEAT
A = {a['id']: a for a in TL['acts']}
HK, WD, TR, CA, FI = A['hook'], A['world'], A['tornei'], A['campo'], A['finale']
LONG = TL['version'] == '45'


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


drums, bass, synth, fx, vo = Bus(), Bus(), Bus(), Bus(), Bus()
kicks = []  # istanti dei kick, per il sidechain

# ---------------------------------------------------------------- sezioni
SEC = [
    ('hook', 0, HK['impact'] - BEAT / 2),
    ('gap', HK['impact'] - BEAT / 2, HK['impact']),
    ('disc', HK['impact'], WD['pull0']),
    ('groove1', WD['pull0'], WD['lift']),
    ('lift', WD['lift'], WD['split1']),
    ('groove2', WD['split1'], TR['cd0']),
    ('build', TR['cd0'], TR['zero']),
    ('tension', TR['zero'], TR['tap']),
    ('gap2', TR['tap'], CA['t0']),
    ('drop', CA['t0'], CA['crane1']),
    ('bracket', CA['crane1'], FI['t0']),
    ('payoff', FI['t0'], FI['out0']),
    ('cta', FI['out0'], FI['lock0']),
    ('lock', FI['lock0'], FI['tocca']),
    ('end', FI['tocca'], DUR + 5),
]


def sec(t):
    for name, a, b in SEC:
        if a <= t < b:
            return name
    return 'end'


PROG = [(41, [65, 68, 72]), (37, [65, 68, 73]), (44, [63, 68, 72]), (39, [63, 67, 70])]  # Fm, Db, Ab, Eb
ANCHOR = int(CA['t0'] / BAR + 0.01)


def chord(t):
    return PROG[(int(t / BAR + 1e-6) - ANCHOR) % 4]


# ---------------------------------------------------------------- musica
def music():
    nsteps = int(DUR / S16) + 1
    # accordi tenuti: un pad per battuta nelle sezioni aperte, supersaw pompato nel drop
    for b in range(int(DUR / BAR) + 1):
        t = b * BAR
        name = sec(t + 0.01)
        root, notes = chord(t + 0.01)
        f = midi(notes)
        if name in ('disc', 'lift', 'payoff', 'lock'):
            n = int((BAR + 0.6) * SR)
            s = supersaw(f, n, 0.012) * env_adsr(n, 0.35, 0.3, 0.8, 0.6, BAR)[:, None]
            s = np.stack([svf(s[:, c], 1800 + 1400 * (name == 'lift'), 0.7, 'lp') for c in range(2)], 1)
            synth.add(s, t, 0.34)
            bass.add(np.sin(2 * np.pi * float(midi(root - 12)) * T(BAR)) * env_adsr(int(BAR * SR), 0.05, 0.1, 0.9, 0.15), t, 0.5)
        if name in ('drop', 'bracket'):
            n = int((BAR + 0.1) * SR)
            s = supersaw(np.concatenate([f, f * 2]), n, 0.014) * env_adsr(n, 0.01, 0.2, 0.85, 0.1, BAR)[:, None]
            s = np.stack([svf(s[:, c], 5200, 0.7, 'lp') for c in range(2)], 1)
            synth.add(s, t, 0.42 if name == 'drop' else 0.32)
        if name in ('groove1', 'groove2', 'cta'):
            n = int((BAR + 0.4) * SR)
            s = supersaw(f, n, 0.01) * env_adsr(n, 0.2, 0.2, 0.7, 0.4, BAR)[:, None]
            s = np.stack([svf(s[:, c], 1300, 0.7, 'lp') for c in range(2)], 1)
            synth.add(s, t, 0.16)
    # sequencer a sedicesimi
    for s in range(nsteps):
        t = s * S16
        name = sec(t)
        pos = s % 16
        beat = s % 4 == 0
        root, notes = chord(t)
        # kick
        k = 0
        if name == 'hook' and beat:
            k = 0.35
        if name == 'disc' and pos == 0:
            k = 0.8
        if name in ('groove1', 'groove2', 'cta') and beat:
            k = 0.72
        if name == 'build' and (beat or (t > TR['zero'] - BAR / 2 and s % 2 == 0)):
            k = 0.8
        if name in ('drop', 'bracket') and beat:
            k = 1.0
        if name == 'lock' and beat and t > FI['tocca'] - BAR:
            k = 0.7
        if k:
            kk = kick(k, punch=1.0 if name != 'hook' else 0.3)
            if name == 'hook':
                kk = lp(kk, 260)
            drums.add(kk, t, 1.0)
            if name != 'hook':
                kicks.append((t, 0.55 if name in ('drop', 'bracket') else 0.35))
        # clap sul 2 e sul 4
        if name in ('groove1', 'groove2', 'drop', 'bracket', 'cta') and pos in (4, 12):
            drums.add(clap(0.8 if name in ('drop', 'bracket') else 0.55), t, 1.0)
        if name == 'disc' and pos == 8:
            drums.add(snare(0.6), t, 1.0)
        # charleston
        if name in ('groove1', 'groove2', 'cta') and s % 4 == 2:
            drums.add(hat(0.55), t, 1.0, 0.25)
        if name in ('drop', 'bracket'):
            if s % 4 == 2:
                drums.add(hat(0.5, True), t, 1.0, -0.2)
            else:
                drums.add(hat(0.32 + 0.12 * (s % 2 == 0)), t, 1.0, 0.3)
        if name == 'hook' and t > BAR:
            drums.add(hat(0.25 + 0.35 * (t - BAR) / BAR), t, 1.0, 0.4)
        # rullata del build: ottavi, poi sedicesimi, poi trentaduesimi
        if name == 'build':
            u = (t - TR['cd0']) / (TR['zero'] - TR['cd0'])
            step = 2 if u < 0.5 else 1
            if s % step == 0:
                drums.add(snare(0.25 + 0.6 * u, 1 + 0.3 * u), t, 1.0)
                if u > 0.8:
                    drums.add(snare(0.3 + 0.5 * u, 1.3), t + S16 / 2, 1.0)
        if name == 'lift' and t >= WD['split1'] - BEAT:
            drums.add(snare(0.5 + 0.4 * (t - (WD['split1'] - BEAT)) / BEAT), t, 1.0)
        # basso
        if name in ('groove1', 'groove2', 'cta') and s % 2 == 0:
            pat = [0, 0, 12, 0, 0, 12, 0, 7][(s // 2) % 8]
            bass.add(bassline(float(midi(root - 12 + pat)), S16 * 1.8, 0.55), t)
        if name == 'drop' and s % 2 == 0:
            pat = [0, 0, 0, 12, 0, 0, 7, 12][(s // 2) % 8]
            bass.add(bassline(float(midi(root - 12 + pat)), S16 * 1.9, 0.7, growl=0.9, lfo_hz=1 / (S16 * 2)), t)
        if name == 'bracket' and s % 2 == 0:
            bass.add(bassline(float(midi(root - 12)), S16 * 1.8, 0.6), t)
        # stab sui controtempi nei groove
        if name in ('groove1', 'groove2') and s % 4 == 2 and (s // 4) % 2 == 1:
            n = int(0.25 * SR)
            st = supersaw(midi(notes), n, 0.01) * env_adsr(n, 0.003, 0.12, 0.0, 0.05)[:, None]
            synth.add(np.stack([svf(st[:, c], 2600, 0.8, 'lp') for c in range(2)], 1), t, 0.22)
        # arpeggio in sedicesimi (discovery e tessera), ostinato filtrato nell'hook
        if name in ('disc', 'lift'):
            seq = notes + [notes[0] + 12, notes[1] + 12, notes[2] + 12]
            m = seq[[0, 1, 2, 3, 4, 3, 2, 1][s % 8]] + 12
            synth.add(stereo(pluck(float(midi(m)), 0.35, 0.8, 0.22), 0.3 * np.sin(s)), t)
        if name == 'hook' and s % 2 == 0:
            m = [65, 72, 68, 72][(s // 2) % 4]
            synth.add(stereo(lp(pluck(float(midi(m)), 0.3, 0.2, 0.32), 1400), 0), t)
    # note dei nodi della CTA: melodia che sale
    for i, tn in enumerate(FI['nodes']):
        m = [77, 80, 84, 87, 89][i]
        synth.add(stereo(pluck(float(midi(m)), 0.8, 1.0, 0.35), -0.4 + 0.2 * i), tn)
        synth.add(stereo(pluck(float(midi(m + 12)), 0.5, 1.0, 0.12), 0.4 - 0.2 * i), tn)
    # stab sugli avanzamenti del tabellone e sulle parole del payoff
    for tt in list(CA['rounds']) + [FI['w1'], FI['w2']]:
        n = int(0.6 * SR)
        root, notes = chord(tt)
        st = supersaw(midi(notes + [notes[0] + 12]), n, 0.014) * env_adsr(n, 0.003, 0.3, 0.0, 0.2)[:, None]
        synth.add(np.stack([svf(st[:, c], 4200, 0.8, 'lp') for c in range(2)], 1), tt, 0.4)
        drums.add(kick(0.9), tt)
    # tensione del countdown: nota alta che si apre
    n = int((TR['tap'] - TR['zero']) * SR)
    if n > 0:
        s = supersaw(midi([77, 84]), n, 0.015)
        u = np.arange(n) / n
        s = np.stack([svf(s[:, c], 600 + 3000 * u ** 2, 1.2, 'lp') for c in range(2)], 1) * u[:, None] ** 0.5
        synth.add(s, TR['zero'], 0.25)
        bass.add(np.sin(2 * np.pi * float(midi(29)) * T(n / SR)) * (0.6 + 0.4 * np.sin(2 * np.pi * (1 / BEAT) * T(n / SR)) ** 2), TR['zero'], 0.45)
    # accordo finale: La bemolle maggiore con nona, lungo
    n = int((DUR - FI['tocca'] + 0.4) * SR)
    s = supersaw(midi([56, 63, 68, 72, 75, 82]), n, 0.013) * env_adsr(n, 0.005, 0.8, 0.6, 1.2, n / SR - 1.2)[:, None]
    synth.add(np.stack([svf(s[:, c], 5000, 0.7, 'lp') for c in range(2)], 1), FI['tocca'], 0.5)
    bass.add(np.sin(2 * np.pi * float(midi(32)) * T(n / SR)) * env_adsr(n, 0.005, 0.5, 0.7, 1.0, n / SR - 1.0), FI['tocca'], 0.6)


# ---------------------------------------------------------------- effetti sui cue
def sfx():
    # HOOK
    for i, t in enumerate(HK['hits']):
        pan = -0.55 if i % 2 == 0 else 0.55
        fx.add(pock(0.75, 1 + 0.02 * i), t, 1.0, pan)
        fx.add(lp(kick(0.5, 0.2, 0.2), 900), t, 0.6)  # il timbro che si stampa
        fx.add(blip(1500 + 90 * i, 0.4), t + 0.02, 1.0, 0.7)
    fx.add(pock(1.1, 0.9), HK['smash'], 1.0)
    gap0 = HK['impact'] - BEAT / 2
    fx.add(whoosh(gap0 - HK['smash'], 200, 5000, 0.9), HK['smash'])
    fx.add(riser(gap0 - 2.2, 0.55), 2.2)
    fx.add(revcym(gap0 - (HK['impact'] - 1.1), 0.6), HK['impact'] - 1.1)
    fx.add(lp(noise(int(BEAT / 2 * SR)), 90) * 0.25, gap0)  # respiro grave nel vuoto
    fx.add(impact(1.25), HK['impact'])
    fx.add(crash(0.9), HK['impact'])
    fx.add(glitch(0.22, 0.7), HK['impact'])
    # WORLD
    w = WD
    fx.add(whoosh(w['bounce'] - w['impact'], 3500, 300, 0.55, up=False), w['impact'])
    for k, dt in enumerate((0.1, 0.28, 0.45, 0.62, 0.95)):
        fx.add(zap(0.14, 0.28, True), w['impact'] + dt, 1.0, (-0.3, 0.3)[k % 2])
    fx.add(swish(0.35, 0.5, 200, 900), w['impact'] + 0.45)
    fx.add(bounce(0.6), w['bounce'])
    for i in range(8):
        fx.add(lp(kick(0.35, 0.18, 0.4), 1500), w['word1'] + i * 0.045, 1.0, -0.4 + 0.1 * i)
    fx.add(impact(0.5, 1.6, 70), w['word1'] + 0.3)
    fx.add(neon(0.45, 0.35), w['word2'])
    fx.add(blip(2200, 0.5), w['tag'])
    fx.add(whoosh(w['pull1'] - w['pull0'] + 0.3, 150, 3000, 0.75), w['pull0'])
    fx.add(shimmer(1.2, 0.5), w['pull1'] - 0.2)
    fx.add(swish(0.5, 0.45, 300, 2500), w['rise0'] + 0.2)
    fx.add(glitch(0.3, 0.3), w['morph0'])
    fx.add(chime([77, 84, 89], 0.07, 0.8), w['morph1'])
    fx.add(swish(0.25, 0.4), w['acct'])
    fx.add(typing(2, 8, 0.8), w['type1'])
    fx.add(typing(13, 26, 0.6), w['type2'])
    fx.add(tap(1.0), w['btn'])
    fx.add(chime([72, 76, 79, 84], 0.06, 0.8), w['check'])
    fx.add(swish(0.3, 0.45, 500, 4000), w['profile'])
    fx.add(tap(1.0), w['slotTap'])
    fx.add(shimmer(0.9, 0.55, 88), w['fill'])
    fx.add(whoosh(w['hero'] - w['lift'], 200, 4500, 0.8), w['lift'])
    fx.add(swish(0.12, 0.3), w['lift'] + 0.35)
    fx.add(swish(0.12, 0.3), w['lift'] + 0.6)
    fx.add(impact(0.35, 1.2, 80), w['hero'])
    fx.add(shimmer(1.4, 0.4), w['hero'])
    fx.add(riser(w['edge1'] - w['edge'], 0.45, 600, 9000), w['edge'])
    fx.add(zap(0.5, 0.8, True), w['edge1'])
    fx.add(blip(2600, 0.5), w['edge1'] + 0.08)
    fx.add(glitch(0.12, 0.3), w['edge1'] + 0.06)
    fx.add(whoosh(w['split1'] - w['split0'], 100, 2500, 0.9), w['split0'])
    fx.add(impact(0.6, 1.4, 60), w['split1'])
    # TORNEI
    tr = TR
    for k, dt in enumerate((0.05, 0.3, 0.55, 0.85, 1.2)):
        if tr['t0'] + dt < tr['select']:
            fx.add(whoosh(0.35, 400, 3000, 0.35 * (1 - 0.12 * k)), tr['t0'] + dt, 1.0, 0.6 - 0.3 * k)
    fx.add(tap(0.9), tr['select'])
    fx.add(lp(kick(0.6, 0.3, 0.5), 700), tr['select'])
    fx.add(swish(0.3, 0.4, 300, 3000), tr['select'] + 0.15)
    fx.add(tap(1.0), tr['tapReg'])
    if 'confirm0' in tr:
        fx.add(blip(1300, 0.5), tr['confirm0'])
        fx.add(tap(1.0), tr['confirmTap'])
    fx.add(chime([72, 79, 84], 0.07, 0.9), tr['regOk'])
    fx.add(whoosh(0.45, 300, 3500, 0.5), tr['flip'])
    t2 = tr['zero'] - 0.5
    fx.add(spin(t2 - tr['cd1'], 0.8), tr['cd1'])
    for k in range(4):
        fx.add(blip(1200 * 2 ** (k / 12 * 2), 0.9, 0.12), t2 + k * 0.125)
    fx.add(impact(0.8, 1.6, 65), tr['zero'])
    fx.add(chime([96, 91], 0.05, 0.6), tr['zero'])
    fx.add(chime([88, 93], 0.08, 0.8), tr['notify'])
    fx.add(swish(0.3, 0.35), tr['notify'] + 0.15)
    fx.add(tap(1.3), tr['tap'])
    zt = max(tr['tap'] + 0.08, CA['t0'] - 0.26)
    fx.add(revcym(CA['t0'] - zt, 0.55), zt)
    fx.add(whoosh(CA['t0'] - zt, 300, 6000, 0.5), zt)
    # CAMPO
    ca = CA
    hits = ca['hits']
    fx.add(impact(1.2), ca['t0'])
    fx.add(crash(1.0), ca['t0'])
    fx.add(whoosh(0.6, 200, 3000, 0.6), ca['t0'])
    fx.add(swish(0.3, 0.3, 600, 2000), hits[0] - 0.45)
    tend = lambda i: hits[i + 1] if i + 1 < len(hits) else ca['game'] + 0.45
    for i, t in enumerate(hits):
        pan = -0.15 if i % 2 == 0 else 0.25
        fx.add(swish(0.14, 0.45, 900, 4500), t - 0.1, 1.0, pan)
        fx.add(pock(1.05, 1.0 - 0.04 * i), t, 1.0, pan)
        tb = ca['game'] - 0.06 if i == len(hits) - 1 else hits[i] + (tend(i) - hits[i]) * 0.46
        fx.add(bounce(0.7), tb, 1.0, -pan)
        if i == len(hits) - 1:
            fx.add(blip(2000, 0.6, 0.12), tb + 0.05)
    fx.add(impact(1.1), ca['game'])
    fx.add(cheer(3.2, 1.0), ca['game'] + 0.05)
    n = int((ca['crane1'] - ca['t0']) * SR)
    sw = np.interp(np.arange(n) / SR, [0, 0.5, ca['game'] - ca['t0'], ca['game'] - ca['t0'] + 1.5, n / SR], [0.2, 0.45, 0.5, 0.9, 0.3])
    fx.add(crowd(n / SR, 0.35, sw), ca['t0'])
    fx.add(whoosh(ca['crane1'] - ca['crane0'], 150, 2500, 0.6), ca['crane0'])
    for tt in ca['rounds']:
        fx.add(zap(0.32, 0.45, True), tt)
        fx.add(blip(1800, 0.5), tt + 0.3)
    fx.add(whoosh(ca['t1'] - ca['dive0'], 300, 6000, 0.8), ca['dive0'])
    # FINALE
    fi = FI
    fx.add(impact(1.0), fi['t0'])
    fx.add(glitch(0.1, 0.3), fi['t0'])
    fx.add(swish(0.35, 0.5, 300, 3000), fi['anche'])
    for tt in (fi['w1'], fi['w2']):
        fx.add(impact(0.55, 1.0, 70), tt)
    land = fi['drop'] + 0.22
    tt_ = T(0.22)
    fx.add(np.sin(2 * np.pi * np.cumsum(2200 - 1500 * tt_ / 0.22) / SR) * 0.12 * np.sin(np.pi * tt_ / 0.22), fi['drop'])
    fx.add(pock(1.1), land)
    fx.add(impact(1.1), land)
    fx.add(crash(0.8), land)
    fx.add(cheer(2.6, 0.8), land + 0.03)
    fx.add(shimmer(1.4, 0.4, 91), land)
    fx.add(whoosh(0.4, 400, 4000, 0.45), fi['out0'])
    for i, tn in enumerate(fi['nodes']):
        fx.add(pock(0.7, 1.05 + 0.03 * i), tn, 1.0, -0.6 + 0.3 * i)
        fx.add(blip(2400 + 200 * i, 0.3), tn + 0.03, 1.0, -0.6 + 0.3 * i)
    fx.add(whoosh(0.4, 3000, 200, 0.6, up=False), fi['lock0'])
    fx.add(impact(0.6, 1.8, 60), fi['lock0'] + 0.35)
    fx.add(shimmer(1.6, 0.5), fi['lock0'] + 0.4)
    fx.add(swish(0.5, 0.3, 800, 6000), fi['lock0'] + 0.5)
    fx.add(riser(fi['tocca'] - fi['lock0'] - 0.6, 0.35), fi['lock0'] + 0.6)
    fx.add(impact(1.3, 3.0), fi['tocca'])
    fx.add(crash(1.0, 3.0), fi['tocca'])
    fx.add(pock(1.0), fi['tocca'])
    fx.add(bounce(0.5), fi['tocca'] + 0.2)
    fx.add(bounce(0.3), fi['tocca'] + 0.33)
    fx.add(cheer(2.2, 0.55), fi['tocca'] + 0.05)


# ---------------------------------------------------------------- voce e sottotitoli
def voice():
    cues = []
    for v in TL['vo']:
        a, sr = sf.read(os.path.join(HERE, 'vo', v['id'] + '.wav'))
        assert sr == SR
        vo.add(stereo(a, 0), v['t'], 1.0)
        cues.append((v['t'], v['t'] + len(a) / SR, v['text']))
    return cues


def srt(cues, path):
    def ts(x):
        ms = int(round(x * 1000))
        return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'
    with open(path, 'w', encoding='utf-8') as fh:
        for i, (a, b, txt) in enumerate(cues, 1):
            end = b + 0.15
            if i < len(cues):
                end = min(end, cues[i][0] - 0.05)
            fh.write(f'{i}\n{ts(a)} --> {ts(end)}\n{txt}\n\n')


def sidechain(n):
    g = np.ones(n)
    shape_t = np.arange(int(0.32 * SR)) / SR
    for t, depth in kicks:
        i = int(t * SR)
        seg_ = 1 - depth * np.exp(-shape_t / 0.085)
        j = min(n, i + len(seg_))
        g[i:j] = np.minimum(g[i:j], seg_[: j - i])
    return g


def envelope(x, win=0.05):
    m = np.abs(x).max(1) if x.ndim == 2 else np.abs(x)
    k = int(win * SR)
    c = np.convolve(m, np.ones(k) / k, mode='same')
    return c


def limiter(x, ceil=0.89, release=0.08):
    peak = np.abs(x).max(1)
    k = int(0.004 * SR)
    # picco anticipato (lookahead) e rilascio morbido
    look = np.maximum.accumulate(peak[::-1])[::-1]
    from scipy.ndimage import maximum_filter1d
    pk = maximum_filter1d(peak, size=k * 2 + 1)
    g = np.minimum(1, ceil / np.maximum(pk, 1e-9))
    # rilascio: la guadagno risale lentamente
    from scipy.signal import lfilter as _lf
    a = np.exp(-1 / (release * SR))
    g2 = -_lf([1 - a], [1, -a], -g)
    g = np.minimum(g, g2)
    return x * g[:, None]


def main():
    music()
    sfx()
    cues = voice()
    ir = reverb_ir(2.4)
    sc = sidechain(N)[:, None]
    syn = synth.x * sc
    bas = bass.x * np.minimum(1, sc * 1.1)
    # mandata di riverbero su synth ed effetti
    syn = syn + convolve(syn, ir) * 0.28
    fxx = fx.x + convolve(fx.x, ir) * 0.18
    music_bus = drums.x * 0.5 + bas * 0.6 + syn * 3.0
    # ducking sotto la voce
    ve = envelope(vo.x, 0.08)
    duck = 1 - 0.74 * np.clip(ve / 0.04, 0, 1)
    duck = np.convolve(duck, np.ones(int(0.06 * SR)) / int(0.06 * SR), mode='same')[:, None]
    fduck = (1 - 0.35 * np.clip(ve / 0.05, 0, 1))[:, None]
    vox = vo.x + convolve(vo.x, reverb_ir(0.9, 5000)) * 0.07
    mix = music_bus * duck + fxx * fduck * 0.42 + vox * 1.25
    mix = mix[: int(DUR * SR)]
    # volume integrato -14 LUFS, poi limiter
    import pyloudnorm as pyln
    meter = pyln.Meter(SR)
    lufs = meter.integrated_loudness(mix)
    mix *= 10 ** ((-14 - lufs) / 20)
    mix = limiter(mix, 0.89)
    lufs2 = meter.integrated_loudness(mix)
    fade = int(0.02 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
    out = os.path.join(CODE, TL['mix'])
    sf.write(out, mix.astype(np.float32), SR, subtype='PCM_16')
    srt(cues, os.path.join(CODE, TL['srt']))
    print(f'{out}  {DUR:.1f} s  {lufs2:.1f} LUFS  picco {np.abs(mix).max():.2f}')


if __name__ == '__main__':
    main()
