// Interfaccia myFITP ridisegnata (dark mode, colori dell'app: blu intestazione, magenta pulsanti).
// Coordinate dello schermo del telefono: origine al centro, 392 × 852.
import { clamp, lerp, seg, E, rgba, mixc, deg } from '../engine/math.js';
import { PAL, ballScreen, checkMark } from '../engine/kit.js';

export const SW = 392, SH = 852, HX = SW / 2, HY = SH / 2;
export const BLUE = '#2456e8', BLUE2 = '#1737b5', PANEL = '#0e1235';

export function wordmark(R, x, y, size, o = {}) {
  const a = o.alpha ?? 1;
  const w1 = R.measure('my', 'unb600', size * 0.78, -0.02), w2 = R.measure('FITP', 'unb900', size, -0.03);
  const x0 = x - (w1 + w2 + size * 0.06) / 2;
  R.text('my', x0, y, { font: 'unb600', size: size * 0.78, v: 'cap', skew: 0.2, fill: o.fill || '#fff', alpha: a, tracking: -0.02 });
  R.text('FITP', x0 + w1 + size * 0.06, y, { font: 'unb900', size, v: 'cap', skew: 0.2, fill: o.fill || '#fff', alpha: a, tracking: -0.03, glow: o.glow });
}

export function statusBar(R, a = 1) {
  R.text('19:00', -HX + 34, -HY + 34, { font: 'mono700', size: 15, v: 'cap', fill: '#fff', alpha: a });
  R.rrect(HX - 62, -HY + 27, 26, 13, 3, { stroke: '#fff', lw: 1.5, alpha: a * 0.9 });
  R.rect(HX - 59, -HY + 30, 17, 7, { fill: '#fff', alpha: a * 0.9 });
  R.rrect(-46, -HY + 18, 92, 26, 13, { fill: '#000', alpha: a });
}

export function header(R, a = 1, o = {}) {
  R.rect(-HX, -HY, SW, 118, { fill: { lin: [0, -HY, 0, -HY + 118], stops: [[0, '#2a64ff'], [1, BLUE2]] }, alpha: a });
  statusBar(R, a);
  wordmark(R, 0, -HY + 84, 26, { alpha: a });
  R.circle(-HX + 36, -HY + 84, 14, { stroke: 'rgba(255,255,255,0.85)', lw: 2, alpha: a });
  R.circle(HX - 36, -HY + 84, 5, { fill: PAL.magenta, alpha: a });
}

export function button(R, x, y, w, h, label, o = {}) {
  const a = o.alpha ?? 1;
  if (a <= 0.003) return;
  const press = o.press ?? 0;
  const sc = 1 - 0.06 * press;
  R.with([sc, 0, 0, x, 0, sc, 0, y, 0, 0, 1, 0], () => {
    // bagliore sul bordo, non sul riempimento (un'area grande che brilla slaverebbe il testo)
    R.rrect(-w / 2, -h / 2, w, h, Math.min(h / 2, o.r ?? 14), { fill: o.fill || PAL.magenta, alpha: a, glow: (o.glow ?? 0.35) * 0.25, glowColor: o.glowColor });
    R.rrect(-w / 2, -h / 2, w, h, Math.min(h / 2, o.r ?? 14), { stroke: o.glowColor || o.fill || PAL.magenta, lw: 3, alpha: a, glow: o.glow ?? 0.35, glowColor: o.glowColor, glowOnly: true });
    if (label) R.text(label, 0, 0, { font: o.font || 'unb700', size: o.size || 17, align: 'center', v: 'cap', fill: o.ink || '#fff', alpha: a * (o.labelA ?? 1), tracking: 0.02, knock: !!o.ink });
  });
}

export function ripple(R, x, y, t, a = 1) {
  if (t < 0 || t > 0.6) return;
  const u = t / 0.6;
  R.circle(x, y, lerp(8, 70, E.outCubic(u)), { stroke: '#fff', lw: 2.5, alpha: a * (1 - u) * 0.9, glow: 0.4 }, 40);
  R.circle(x, y, lerp(22, 12, E.outCubic(u / 0.4)), { fill: '#fff', alpha: a * 0.5 * clamp(1 - u * 1.6) }, 32);
}

export function field(R, y, label, value, o = {}) {
  const a = o.alpha ?? 1;
  R.text(label, -HX + 36, y - 38, { font: 'mono700', size: 13, v: 'cap', fill: '#8ea2ff', alpha: a, tracking: 0.12 });
  R.rrect(-HX + 30, y - 24, SW - 60, 52, 12, { fill: 'rgba(255,255,255,0.06)', stroke: o.focus ? PAL.cyan : 'rgba(255,255,255,0.22)', lw: o.focus ? 2 : 1.4, alpha: a, glow: o.focus ? 0.4 : 0 });
  const w = value ? R.measure(value, 'unb700', 20, 0) : 0;
  if (value) R.text(value, -HX + 48, y + 2, { font: 'unb700', size: 20, v: 'cap', fill: '#fff', alpha: a });
  if (o.caret) R.rect(-HX + 50 + w + 3, y - 12, 2.5, 28, { fill: PAL.cyan, alpha: a * o.caret });
}

// avatar: anello che si disegna, poi la pallina come immagine profilo
export function avatar(R, x, y, r, prog, fill, a = 1) {
  R.circle(x, y, r, { fill: 'rgba(255,255,255,0.05)', alpha: a });
  if (prog > 0) R.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(prog), { stroke: PAL.cyan, lw: 3, alpha: a, glow: 0.6 }, 64);
  if (fill > 0) {
    const p = R.proj(x, y), q = R.proj(x + r, y);
    if (p && q) {
      const rr = Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.62 * E.outBack(fill);
      ballScreen(R, p[0], p[1], rr, { alpha: a, spin: [0.5, 1.1, 0.3], glow: 0.5 });
    }
  } else if (prog >= 1) {
    R.band(x - r * 0.3, y, x + r * 0.3, y, 3, { fill: '#fff', alpha: a * 0.7 });
    R.band(x, y - r * 0.3, x, y + r * 0.3, 3, { fill: '#fff', alpha: a * 0.7 });
  }
}

export function typed(str, t, t0, cps = 14) {
  if (t < t0) return '';
  return [...str].slice(0, Math.floor((t - t0) * cps) + 1).join('');
}
