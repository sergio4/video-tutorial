// Strumenti condivisi dagli atti: tracce di camera, scossoni, sfondi, righe di testo cinetico.
import { Cam, W, H } from '../engine/r.js';
import { clamp, lerp, seg, E, hash, noise1, rgba, deg } from '../engine/math.js';
import { PAL } from '../engine/kit.js';

// interpolazione di Hermite (tangenti Catmull-Rom) su chiavi {t, ...valori}; hold:true ferma la velocità sulla chiave
export function track(keys, t, field) {
  const n = keys.length;
  if (t <= keys[0].t) return keys[0][field];
  if (t >= keys[n - 1].t) return keys[n - 1][field];
  let i = 0;
  while (i < n - 2 && t > keys[i + 1].t) i++;
  const k0 = keys[i], k1 = keys[i + 1];
  const h = k1.t - k0.t;
  let u = (t - k0.t) / h;
  const tan = (k) => {
    const K = keys[k];
    if (K.hold || k === 0 || k === n - 1) return null;
    const a = keys[k - 1], b = keys[k + 1];
    return { a, b, dt: b.t - a.t };
  };
  const t0 = tan(i), t1 = tan(i + 1);
  if (k1.ease) u = E[k1.ease](u);
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  const v0 = k0[field], v1 = k1[field];
  if (v0 === undefined) return undefined;
  if (Array.isArray(v0)) {
    return v0.map((a, j) => {
      const m0 = t0 ? ((t0.b[field][j] - t0.a[field][j]) / t0.dt) * h : 0;
      const m1 = t1 ? ((t1.b[field][j] - t1.a[field][j]) / t1.dt) * h : 0;
      return h00 * a + h10 * m0 + h01 * v1[j] + h11 * m1;
    });
  }
  const m0 = t0 ? ((t0.b[field] - t0.a[field]) / t0.dt) * h : 0;
  const m1 = t1 ? ((t1.b[field] - t1.a[field]) / t1.dt) * h : 0;
  return h00 * v0 + h10 * m0 + h01 * v1 + h11 * m1;
}

// scossone di camera dopo un impatto: [dx, dy, rollio]
export function shake(t, hits) {
  let x = 0, y = 0, r = 0;
  for (const [t0, amp, dur = 0.5] of hits) {
    const u = t - t0;
    if (u < 0 || u > dur) continue;
    const k = amp * (1 - u / dur) ** 2;
    x += noise1(u * 38 + t0 * 11) * k;
    y += noise1(u * 41 + t0 * 7 + 50) * k;
    r += noise1(u * 33 + t0 * 3 + 90) * k * 0.0009;
  }
  return [x, y, r];
}

// camera da una traccia di chiavi {t, eye, tgt, f, roll}
export function camTrack(keys, t, sh = [0, 0, 0]) {
  const eye = track(keys, t, 'eye'), tgt = track(keys, t, 'tgt');
  const f = track(keys, t, 'f') ?? 1400, roll = (track(keys, t, 'roll') ?? 0) + sh[2];
  const c = new Cam();
  c.look(eye, tgt, roll, f);
  c.cx += sh[0]; c.cy += sh[1];
  return c;
}

// sfondo notte con luci di brand che respirano
export function bgNight(R, t, o = {}) {
  const a = o.a ?? 1;
  R.bg(o.top || '#0d0626', o.bottom || '#05030f', [
    [W * (0.18 + 0.05 * Math.sin(t * 0.4)), H * 0.12, 820, o.c1 || PAL.purple2, 0.55 * a],
    [W * (0.86 + 0.04 * Math.cos(t * 0.33)), H * 0.3, 620, o.c2 || PAL.magenta, 0.16 * a],
    [W * 0.55, H * 1.05, 900, o.c3 || '#1b2cff', 0.22 * a],
  ]);
}

// polvere luminosa in profondità (particelle deterministiche nello spazio mondo)
export function dust(R, t, box, n = 90, seed = 1, o = {}) {
  const [x0, y0, z0, x1, y1, z1] = box;
  for (let i = 0; i < n; i++) {
    const h1 = hash(i * 13.1 + seed), h2 = hash(i * 7.7 + seed * 3), h3 = hash(i * 3.3 + seed * 5), h4 = hash(i * 1.9 + seed * 7);
    const p = [
      lerp(x0, x1, h1) + Math.sin(t * 0.3 + i) * 20,
      lerp(y0, y1, (h2 + t * (o.rise ?? 0.02) * (0.5 + h4)) % 1),
      lerp(z0, z1, h3),
    ];
    const tw = 0.5 + 0.5 * Math.sin(t * (1 + h4 * 3) + i);
    R.dot(p, (o.r ?? 2.2) * (0.5 + h4), { fill: h4 > 0.8 ? PAL.cyan : h4 > 0.6 ? PAL.magenta : '#ffffff', alpha: (o.a ?? 0.55) * tw, glow: 0.8 });
  }
}

// righe di testo cinetico (sfondo tipografico) in pixel schermo
export function textRows(R, word, t, o = {}) {
  const rows = o.rows ?? 3, size = o.size ?? 220, gap = o.gap ?? size * 1.02;
  const y0 = o.y ?? H / 2 - ((rows - 1) * gap) / 2;
  const L = R.fonts.layout(word + ' ', o.font || 'unb900', size, o.tracking ?? -0.02);
  const unit = L.width;
  for (let r = 0; r < rows; r++) {
    const dir = r % 2 ? 1 : -1, sp = (o.speed ?? 90) * (1 + r * 0.15);
    const off = ((t * sp * dir) % unit + unit) % unit;
    const y = y0 + r * gap + (o.dy ? o.dy(r) : 0);
    for (let x = -unit + off - (r % 2) * unit * 0.37; x < W + unit; x += unit) {
      const st = o.style ? o.style(r) : { stroke: 'rgba(255,255,255,0.18)', lw: 1.6 };
      R.text(word, x, y, { font: o.font || 'unb900', size, v: 'cap', tracking: o.tracking ?? -0.02, ...st, alpha: (st.alpha ?? 1) * (o.alpha ?? 1) });
    }
  }
}
