"""Strumenti ed effetti sintetizzati (numpy + numba). Tutto a 48 kHz, mono salvo dove indicato."""
import numpy as np
from numba import njit
from scipy.signal import butter, fftconvolve, lfilter

SR = 48000
rng = np.random.default_rng(11)


def T(sec):
    return np.arange(max(1, int(sec * SR))) / SR


def midi(m):
    return 440.0 * 2 ** ((np.asarray(m) - 69) / 12)


def lp(x, fc, order=2):
    b, a = butter(order, min(fc, SR / 2 - 200) / (SR / 2), 'low')
    return lfilter(b, a, x, axis=0)


def hp(x, fc, order=2):
    b, a = butter(order, max(fc, 10) / (SR / 2), 'high')
    return lfilter(b, a, x, axis=0)


def bp(x, lo, hi, order=2):
    b, a = butter(order, [max(lo, 10) / (SR / 2), min(hi, SR / 2 - 200) / (SR / 2)], 'band')
    return lfilter(b, a, x, axis=0)


def noise(n):
    return rng.standard_normal(n)


# filtro a variabili di stato con cutoff che cambia nel tempo (passa-basso risonante)
@njit(cache=True)
def _svf(x, fc, q, mode):
    y = np.empty_like(x)
    ic1 = 0.0
    ic2 = 0.0
    k = 1.0 / q
    for i in range(len(x)):
        g = np.tan(np.pi * min(fc[i], 20000.0) / 48000.0)
        a1 = 1.0 / (1.0 + g * (g + k))
        a2 = g * a1
        a3 = g * a2
        v3 = x[i] - ic2
        v1 = a1 * ic1 + a2 * v3
        v2 = ic2 + a2 * ic1 + a3 * v3
        ic1 = 2 * v1 - ic1
        ic2 = 2 * v2 - ic2
        if mode == 0:
            y[i] = v2
        elif mode == 1:
            y[i] = v1
        else:
            y[i] = x[i] - k * v1 - v2
    return y


def svf(x, fc, q=0.8, mode='lp'):
    fc = np.broadcast_to(np.asarray(fc, dtype=np.float64), x.shape).copy()
    return _svf(x.astype(np.float64), fc, float(q), {'lp': 0, 'bp': 1, 'hp': 2}[mode])


def saw(f, n, phase=None):
    """Dente di sega band-limited (PolyBLEP). f scalare o array."""
    f = np.broadcast_to(np.asarray(f, dtype=np.float64), (n,))
    dt = f / SR
    ph = ((phase if phase is not None else rng.uniform()) + np.cumsum(dt)) % 1.0
    y = 2 * ph - 1
    m = ph < dt
    x = ph[m] / dt[m]
    y[m] -= 2 * x - x * x - 1
    m = ph > 1 - dt
    x = (ph[m] - 1) / dt[m]
    y[m] -= x * x + 2 * x + 1
    return y


def supersaw(freqs, n, detune=0.011, voices=7, stereo=True):
    """Accordo di dente di sega desintonizzati, allargato in stereo."""
    out = np.zeros((n, 2))
    dets = np.linspace(-1, 1, voices)
    for f in np.atleast_1d(freqs):
        for j, d in enumerate(dets):
            s = saw(f * (1 + d * detune), n)
            pan = d * 0.8 if stereo else 0
            out[:, 0] += s * np.cos((pan + 1) * np.pi / 4)
            out[:, 1] += s * np.sin((pan + 1) * np.pi / 4)
    return out / (voices * len(np.atleast_1d(freqs))) * 1.6


def env_adsr(n, a=0.005, d=0.1, s=0.7, r=0.1, hold=None):
    t = np.arange(n) / SR
    hold = hold if hold is not None else n / SR - r
    e = np.where(t < a, t / max(a, 1e-6), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-6), s))
    e = np.where(t > hold, e * np.clip(1 - (t - hold) / max(r, 1e-6), 0, 1), e)
    return e


def stereo(x, pan=0.0):
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    return np.stack([x * l, x * r], 1) * np.sqrt(2)


def reverb_ir(secs=2.2, tone=6500, predelay=0.012):
    n = int(secs * SR)
    t = np.arange(n) / SR
    ir = np.stack([lp(noise(n), tone), lp(noise(n), tone)], 1) * np.exp(-t * 6.9 / secs)[:, None]
    pd = int(predelay * SR)
    ir = np.concatenate([np.zeros((pd, 2)), ir])
    return ir / np.sqrt((ir ** 2).sum(0))


def convolve(x, ir):
    return np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)


def delay(x, secs, fb=0.35, taps=6, pingpong=True):
    d = int(secs * SR)
    out = x.copy()
    for k in range(1, taps + 1):
        g = fb ** k
        sh = np.zeros_like(x)
        sh[d * k:] = x[: len(x) - d * k] * g
        if pingpong and x.ndim == 2 and k % 2:
            sh = sh[:, ::-1]
        out += sh
    return out


# ---------------------------------------------------------------- batteria
def kick(g=1.0, dur=0.42, punch=1.0):
    t = T(dur)
    f = 46 + 110 * np.exp(-t * 32) + 30 * np.exp(-t * 180) * punch
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    s = np.tanh(s * 1.8) / np.tanh(1.8)
    click = hp(noise(len(t)), 2500) * np.exp(-t * 700) * 0.35 * punch
    return (s + click) * g


def clap(g=1.0):
    t = T(0.35)
    n = bp(noise(len(t)), 1000, 5500)
    env = np.zeros(len(t))
    for k, o in enumerate((0.0, 0.009, 0.018, 0.027)):
        env += np.where(t >= o, np.exp(-(t - o) * (160 if k < 3 else 17)), 0) * (0.8 if k < 3 else 1.0)
    return n * env * 0.55 * g


def snare(g=1.0, pitch=1.0):
    t = T(0.22)
    body = np.sin(2 * np.pi * np.cumsum(190 * pitch + 60 * np.exp(-t * 60)) / SR) * np.exp(-t * 28)
    n = bp(noise(len(t)), 1800, 8000) * np.exp(-t * 22)
    return (body * 0.5 + n * 0.8) * g


def hat(g=1.0, open_=False):
    t = T(0.3 if open_ else 0.06)
    n = hp(noise(len(t)), 7500)
    return n * np.exp(-t * (13 if open_ else 70)) * 0.22 * g


def crash(g=1.0, dur=2.2):
    t = T(dur)
    n = hp(noise(len(t)), 4200) * np.exp(-t * 2.4)
    return (n + 0.3 * bp(noise(len(t)), 3000, 9000) * np.exp(-t * 6)) * 0.45 * g


# ---------------------------------------------------------------- effetti
def pock(g=1.0, pitch=1.0):
    """Colpo di racchetta: schiocco secco + corde."""
    t = T(0.22)
    f = (520 + 900 * np.exp(-t * 90)) * pitch
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 42)
    s += 0.35 * np.sin(2 * np.pi * 1850 * pitch * t) * np.exp(-t * 70)
    s += 0.6 * hp(noise(len(t)), 2200) * np.exp(-t * 520)
    s += 0.5 * np.sin(2 * np.pi * np.cumsum(150 + 80 * np.exp(-t * 40)) / SR) * np.exp(-t * 30)
    return s * g


def bounce(g=1.0):
    t = T(0.16)
    s = np.sin(2 * np.pi * np.cumsum(260 + 180 * np.exp(-t * 60)) / SR) * np.exp(-t * 40)
    return (s + 0.3 * lp(noise(len(t)), 1200) * np.exp(-t * 120)) * g


def whoosh(dur, lo=250, hi=4000, g=1.0, up=True, q=1.4):
    t = T(dur)
    u = t / dur
    fc = lo * (hi / lo) ** (u if up else 1 - u)
    s = svf(noise(len(t)), fc, q, 'bp')
    return s * np.sin(np.pi * np.clip(u, 0, 1)) ** 1.6 * g


def swish(dur=0.18, g=1.0, f0=1200, f1=5000):
    t = T(dur)
    s = svf(noise(len(t)), f0 * (f1 / f0) ** (t / dur), 2.0, 'bp')
    return s * np.sin(np.pi * t / dur) ** 2 * g


def riser(dur, g=1.0, f0=300, f1=7000):
    t = T(dur)
    u = t / dur
    n = svf(noise(len(t)), f0 * (f1 / f0) ** u, 1.8, 'bp') * u ** 2
    tone = saw(200 * 2 ** (3 * u ** 1.6), len(t)) * u ** 2.5 * 0.12
    return (n + svf(tone, 1500 + 6000 * u, 0.9, 'lp')) * g


def downlifter(dur, g=1.0):
    t = T(dur)
    u = t / dur
    return svf(noise(len(t)), 6000 * (80 / 6000) ** u, 1.4, 'bp') * (1 - u) ** 1.5 * g


def revcym(dur=1.0, g=1.0):
    t = T(dur)
    n = hp(noise(len(t)), 4000)
    return n * (t / dur) ** 3 * 0.6 * g


def impact(g=1.0, dur=2.4, low=55):
    t = T(dur)
    boom = np.sin(2 * np.pi * np.cumsum(low * 0.55 + low * 1.3 * np.exp(-t * 9)) / SR) * np.exp(-t * 2.2)
    boom = np.tanh(boom * 1.6)
    hit = lp(noise(len(t)), 5000) * np.exp(-t * 18) * 0.7
    tail = hp(noise(len(t)), 3000) * np.exp(-t * 3.2) * 0.25
    return (boom * 1.0 + hit + tail) * g


def zap(dur=0.35, g=1.0, up=True):
    t = T(dur)
    u = t / dur
    f = (300 + 4200 * (u if up else 1 - u) ** 1.3)
    s = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.5 * np.sin(2 * np.pi * 70 * t))) / SR)
    return (s * 0.6 + hp(noise(len(t)), 5000) * 0.2) * np.exp(-t * 6) * np.minimum(1, t / 0.004) * g


def blip(f=1800, g=1.0, dur=0.09):
    t = T(dur)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t)
    return s * np.exp(-t * 45) * np.minimum(1, t / 0.002) * 0.5 * g


def tap(g=1.0):
    t = T(0.06)
    c = hp(noise(len(t)), 2500) * np.exp(-t * 320)
    b = np.sin(2 * np.pi * 900 * t) * np.exp(-t * 90) * 0.5
    return (c + b) * 0.7 * g


def typing(n, cps, g=1.0):
    step = 1 / cps
    out = np.zeros(int((n * step + 0.1) * SR))
    for i in range(n):
        c = tap(0.5 * (0.7 + 0.3 * rng.uniform())) * 0.8
        j = int(i * step * SR)
        out[j:j + len(c)] += c[: len(out) - j]
    return out * g


def chime(notes, step=0.09, g=1.0, dur=1.4):
    out = np.zeros(int((step * len(notes) + dur) * SR))
    for i, m in enumerate(notes):
        t = T(dur)
        f = float(midi(m))
        s = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 5) + 0.15 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 9)) * np.exp(-t * 3.2)
        j = int(i * step * SR)
        out[j:j + len(s)] += s * np.minimum(1, t / 0.002)
    return out * 0.45 * g


def shimmer(dur=1.2, g=1.0, base=84):
    t = T(dur)
    s = np.zeros(len(t))
    for k, m in enumerate((base, base + 7, base + 12, base + 16, base + 19)):
        s += np.sin(2 * np.pi * float(midi(m)) * t + k) * (0.5 + 0.5 * np.sin(2 * np.pi * (5 + k) * t + k))
    return s / 5 * np.sin(np.pi * t / dur) ** 1.5 * 0.5 * g


def glitch(dur=0.25, g=1.0):
    n = int(dur * SR)
    out = np.zeros(n)
    i = 0
    while i < n:
        L = int(rng.uniform(0.004, 0.03) * SR)
        kind = rng.integers(0, 3)
        tt = np.arange(L) / SR
        if kind == 0:
            seg_ = np.sign(np.sin(2 * np.pi * rng.uniform(80, 1400) * tt))
        elif kind == 1:
            seg_ = np.repeat(rng.uniform(-1, 1, L // 40 + 1), 40)[:L]
        else:
            seg_ = np.zeros(L)
        out[i:i + L] = seg_[: n - i] * rng.uniform(0.3, 1)
        i += L
    return hp(out, 200) * 0.5 * g


def spin(dur, g=1.0, r0=18, r1=60):
    """Rulli del countdown: ticchettio che accelera."""
    out = np.zeros(int(dur * SR))
    t = 0.0
    while t < dur:
        u = t / dur
        rate = r0 + (r1 - r0) * u
        c = blip(2400 + 800 * u, 0.35, 0.03)
        j = int(t * SR)
        out[j:j + len(c)] += c[: len(out) - j]
        t += 1 / rate
    return out * g


def neon(dur=0.5, g=1.0):
    t = T(dur)
    s = np.sign(np.sin(2 * np.pi * 100 * t)) * 0.3 + np.sin(2 * np.pi * 200 * t) * 0.2
    flick = (rng.uniform(size=len(t) // 480 + 1) > 0.35).repeat(480)[: len(t)]
    return lp(s, 3000) * flick * np.exp(-t * 3) * g


def crowd(dur, g=1.0, swell=None):
    """Folla: tante «voci» di rumore filtrato attorno alle formanti, con ondate."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(10):
        f = rng.uniform(350, 1800)
        mod = 0.6 + 0.4 * np.sin(2 * np.pi * rng.uniform(0.1, 0.7) * t + rng.uniform(0, 6))
        out += bp(noise(n), f * 0.8, f * 1.25) * mod
    out /= 10
    if swell is not None:
        out *= swell
    return out * 1.6 * g


def cheer(dur=2.6, g=1.0):
    t = T(dur)
    env = np.minimum(1, t / 0.18) * np.exp(-np.maximum(0, t - 0.7) * 1.3)
    body = crowd(dur, 1.0) * env * 1.4
    claps = np.zeros(len(t))
    for _ in range(140):
        j = int(rng.uniform(0.05, dur - 0.1) * SR)
        c = clap(rng.uniform(0.15, 0.5))[: int(0.05 * SR)]
        claps[j:j + len(c)] += c[: len(claps) - j]
    whistle = np.zeros(len(t))
    for _ in range(3):
        j = int(rng.uniform(0.1, 1.0) * SR)
        w = T(0.5)
        s = np.sin(2 * np.pi * np.cumsum(2400 + 400 * np.sin(2 * np.pi * 3 * w)) / SR) * np.sin(np.pi * w / 0.5) * 0.12
        whistle[j:j + len(s)] += s[: len(whistle) - j]
    return (body + claps * env + whistle) * g


# ---------------------------------------------------------------- strumenti melodici
def pluck(f, dur=0.5, bright=1.0, g=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = saw(f, n) * 0.6 + saw(f * 2.0, n) * 0.25 + np.sign(np.sin(2 * np.pi * f * 0.5 * t)) * 0.15
    fc = 300 + (4500 * bright) * np.exp(-t * 16)
    return svf(s, fc, 1.1, 'lp') * np.exp(-t * 6) * np.minimum(1, t / 0.002) * g


def bassline(f, dur, g=1.0, growl=0.0, lfo_hz=4.27):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * f * t)
    if growl > 0:
        body = saw(f * 2, n) * 0.7 + saw(f * 2.01, n) * 0.5
        fc = 200 + 1600 * growl * (0.5 + 0.5 * np.sin(2 * np.pi * lfo_hz * t - np.pi / 2)) ** 2
        body = np.tanh(svf(body, fc, 3.0, 'lp') * 2.2) * 0.45
    else:
        body = np.tanh(svf(saw(f * 2, n), 500, 1.0, 'lp') * 1.5) * 0.25
    e = np.minimum(1, t / 0.004) * np.clip((dur - t) / 0.02, 0, 1)
    return (sub * 0.8 + body) * e * g
