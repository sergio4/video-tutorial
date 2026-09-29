// La pallina da tennis: filo conduttore dello spot. Ogni sua apparizione ha un compito (esce dal gioco, apre il mondo,
// svela il logo del circuito, spinge le card, accende la tessera e i vantaggi, porta alla partita e preme la CTA).
// Coordinate schermo: path(t) → [x, y, r] (px) oppure null quando la pallina non c'è.
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, E, hash, rgba, mixc } from '../engine/math.js';
import { ballScreen } from '../engine/kit.js';
import { BR } from './type.js';

// scia a nastro dai campioni passati del percorso, poi la pallina con rotazione
export function flyBall(R, path, t, o = {}) {
  const tr = o.trail ?? 0.16, n = 20;
  const pts = [];
  for (let i = 0; i <= n; i++) { const p = path(t - tr + (tr * i) / n); if (p) pts.push(p); }
  const p = path(t);
  if (!p) return null;
  if (pts.length > 2) R.hud(() => R.trail(pts.map((q) => [q[0], q[1], 0]), { w0: 0, w1: p[2] * 1.5, a0: 0, a1: 0.8 * (o.alpha ?? 1), color: (u) => rgba(mixc(o.c0 || BR.magenta, o.c1 || BR.cyan, u), 1), glow: 1 }));
  ballScreen(R, p[0], p[1], p[2], { spin: [t * 14, t * 9, t * 3], glow: 1.1, rim: BR.cyan, alpha: o.alpha ?? 1 });
  return p;
}

// impatto: anello che si allarga, scintille radiali, bagliore. u = 0..1 (vita dell'effetto). flat < 1 = anello a terra
export function impact(R, x, y, u, o = {}) {
  if (u <= 0 || u >= 1) return;
  const s = o.scale ?? 1, flat = o.flat ?? 1, c = o.col || BR.cyan;
  R.hud(() => {
    const r = lerp(10, 190 * s, E.outCubic(u));
    R.with([1, 0, 0, x, 0, flat, 0, y, 0, 0, 1, 0], () => {
      R.circle(0, 0, r, { stroke: '#ffffff', lw: lerp(10, 1.5, u) * s, alpha: 1 - u, glow: 1.2, glowColor: c }, 72);
      R.circle(0, 0, r * 0.62, { stroke: c, lw: lerp(6, 1, u) * s, alpha: (1 - u) * 0.8, glow: 1 }, 64);
    });
    const k = o.sparks ?? 14;
    for (let i = 0; i < k; i++) {
      const a = (i / k) * Math.PI * 2 + hash(i * 3.7 + (o.seed || 0)) * 0.5;
      const d0 = lerp(12, 150 * s, E.outCubic(u)) * (0.7 + hash(i * 1.9) * 0.6), d1 = d0 + 40 * s * (1 - u);
      R.line([x + Math.cos(a) * d0, y + Math.sin(a) * d0 * flat, x + Math.cos(a) * d1, y + Math.sin(a) * d1 * flat], { stroke: i % 3 ? '#ffffff' : BR.magenta, lw: 3 * s, alpha: (1 - u) * 0.9, glow: 1 });
    }
    if (u < 0.35) R.circle(x, y, 60 * s * (1 - u / 0.35), { fill: '#ffffff', alpha: (1 - u / 0.35) * 0.7, glow: 1.5 }, 40);
  });
}

// arco balistico tra due punti schermo (con rimbalzo morbido): [x0,y0,r0] → [x1,y1,r1], h = altezza dell'arco (px)
export function arc(p0, p1, u, h = 0) {
  return [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) - Math.sin(u * Math.PI) * h, lerp(p0[2], p1[2], u)];
}

// percorso a tratti: segs = [[t0, t1, p0, p1, h, ease]]; fuori dai tratti null
export function segPath(segs) {
  return (t) => {
    for (const [a, b, p0, p1, h, ez] of segs) if (t >= a && t <= b) return arc(p0, p1, (ez || ((x) => x))(clamp((t - a) / (b - a))), h || 0);
    return null;
  };
}
