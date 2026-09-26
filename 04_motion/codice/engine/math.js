// Matematica di base: interpolazioni, easing, rumore, vettori e matrici affini 3D.

export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const remap = (t, a, b, c, d) => lerp(c, d, seg(t, a, b));
export const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const smoother = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
// 0→1 tra a e b, 1 fino a c, 1→0 tra c e d
export const env = (t, a, b, c, d) => (t < a || t > d ? 0 : t < b ? seg(t, a, b) : t <= c ? 1 : 1 - seg(t, c, d));

export const E = {
  lin: (x) => clamp(x),
  inQuad: (x) => clamp(x) ** 2,
  outQuad: (x) => 1 - (1 - clamp(x)) ** 2,
  inOutQuad: (x) => { x = clamp(x); return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2; },
  inCubic: (x) => clamp(x) ** 3,
  outCubic: (x) => 1 - (1 - clamp(x)) ** 3,
  inOutCubic: (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2; },
  inQuart: (x) => clamp(x) ** 4,
  outQuart: (x) => 1 - (1 - clamp(x)) ** 4,
  inOutQuart: (x) => { x = clamp(x); return x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2; },
  inQuint: (x) => clamp(x) ** 5,
  outQuint: (x) => 1 - (1 - clamp(x)) ** 5,
  inOutQuint: (x) => { x = clamp(x); return x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2; },
  inExpo: (x) => { x = clamp(x); return x === 0 ? 0 : 2 ** (10 * x - 10); },
  outExpo: (x) => { x = clamp(x); return x === 1 ? 1 : 1 - 2 ** (-10 * x); },
  inOutExpo: (x) => {
    x = clamp(x);
    if (x === 0 || x === 1) return x;
    return x < 0.5 ? 2 ** (20 * x - 10) / 2 : (2 - 2 ** (-20 * x + 10)) / 2;
  },
  outBack: (x, s = 1.70158) => { x = clamp(x) - 1; return 1 + (s + 1) * x ** 3 + s * x ** 2; },
  inBack: (x, s = 1.70158) => { x = clamp(x); return (s + 1) * x ** 3 - s * x * x; },
  inOutBack: (x, s = 1.70158 * 1.525) => {
    x = clamp(x);
    return x < 0.5 ? ((2 * x) ** 2 * ((s + 1) * 2 * x - s)) / 2 : ((2 * x - 2) ** 2 * ((s + 1) * (x * 2 - 2) + s) + 2) / 2;
  },
  outElastic: (x) => {
    x = clamp(x);
    if (x === 0 || x === 1) return x;
    return 2 ** (-10 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  },
};

// molla smorzata: 0→1 con overshoot, t in secondi
export function spring(t, freq = 4, damp = 0.35) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * freq;
  return 1 - Math.exp(-damp * w * t) * Math.cos(w * Math.sqrt(1 - damp * damp) * t);
}

// PRNG deterministico
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hash(n) {
  let x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}
export function hash2(a, b) { return hash(a * 57.31 + b * 113.97); }

// rumore 1D liscio (value noise)
export function noise1(x) {
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i), hash(i + 1), u) * 2 - 1;
}
export function noise2(x, y) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(i, j), b = hash2(i + 1, j), c = hash2(i, j + 1), d = hash2(i + 1, j + 1);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
}
export const fbm1 = (x) => noise1(x) * 0.6 + noise1(x * 2.13 + 7) * 0.3 + noise1(x * 4.7 + 13) * 0.1;

// vettori
export const v3 = (x = 0, y = 0, z = 0) => [x, y, z];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// catmull-rom su una lista di punti 3D, u in [0,1]
export function spline3(pts, u) {
  const n = pts.length - 1;
  const x = clamp(u) * n;
  const i = Math.min(Math.floor(x), n - 1), f = x - i;
  const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, n)];
  const out = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    const a = p0[k], b = p1[k], c = p2[k], d = p3[k];
    out[k] = 0.5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
  }
  return out;
}

// Matrici affini 3x4 in riga: [a b c tx; d e f ty; g h i tz]
export const I = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];
export function mmul(A, B) {
  return [
    A[0] * B[0] + A[1] * B[4] + A[2] * B[8], A[0] * B[1] + A[1] * B[5] + A[2] * B[9], A[0] * B[2] + A[1] * B[6] + A[2] * B[10], A[0] * B[3] + A[1] * B[7] + A[2] * B[11] + A[3],
    A[4] * B[0] + A[5] * B[4] + A[6] * B[8], A[4] * B[1] + A[5] * B[5] + A[6] * B[9], A[4] * B[2] + A[5] * B[6] + A[6] * B[10], A[4] * B[3] + A[5] * B[7] + A[6] * B[11] + A[7],
    A[8] * B[0] + A[9] * B[4] + A[10] * B[8], A[8] * B[1] + A[9] * B[5] + A[10] * B[9], A[8] * B[2] + A[9] * B[6] + A[10] * B[10], A[8] * B[3] + A[9] * B[7] + A[10] * B[11] + A[11],
  ];
}
export const T = (x = 0, y = 0, z = 0) => [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z];
export const S = (x = 1, y = x, z = x) => [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0];
export function RX(a) { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0]; }
export function RY(a) { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0]; }
export function RZ(a) { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0]; }
// composizione stile After Effects: posizione, rotazione X→Y→Z (radianti), scala
export function TRS(pos = [0, 0, 0], rot = [0, 0, 0], sc = 1) {
  let M = T(pos[0], pos[1], pos[2]);
  if (rot[2]) M = mmul(M, RZ(rot[2]));
  if (rot[1]) M = mmul(M, RY(rot[1]));
  if (rot[0]) M = mmul(M, RX(rot[0]));
  if (sc !== 1) M = mmul(M, Array.isArray(sc) ? S(sc[0], sc[1], sc[2] ?? 1) : S(sc));
  return M;
}
export const apply = (M, x, y, z = 0) => [
  M[0] * x + M[1] * y + M[2] * z + M[3],
  M[4] * x + M[5] * y + M[6] * z + M[7],
  M[8] * x + M[9] * y + M[10] * z + M[11],
];
export const deg = (d) => (d * Math.PI) / 180;

// colori
export function hex(c) {
  const n = parseInt(c.slice(1), 16);
  return c.length === 7 ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [((n >> 8) & 15) * 17, ((n >> 4) & 15) * 17, (n & 15) * 17];
}
export function rgba(c, a = 1) {
  const [r, g, b] = Array.isArray(c) ? c : hex(c);
  return `rgba(${r | 0},${g | 0},${b | 0},${clamp(a)})`;
}
export function mixc(c1, c2, t) {
  const a = Array.isArray(c1) ? c1 : hex(c1), b = Array.isArray(c2) ? c2 : hex(c2);
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}
