// Kit visivo condiviso: palette, pallina, campo, icone.
import { clamp, lerp, rgba, hex, mixc, TRS, deg } from './math.js';

export const PAL = {
  night: '#0b0620',
  night2: '#150a33',
  purple: '#301860',
  purple2: '#4a2a8c',
  magenta: '#f408bc',
  cyan: '#00fcfc',
  court: '#2456e8',
  court2: '#1a3fb0',
  ball: '#e2ff2e',
  white: '#ffffff',
  grey: '#8a8699',
  ink: '#0b0620',
};

// ---------------------------------------------------------------- pallina
// cucitura della pallina sulla sfera unitaria (a + b = 1)
const SEAM = (() => {
  const a = 0.7, b = 0.3, n = 96, p = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    p.push([a * Math.cos(t) + b * Math.cos(3 * t), a * Math.sin(t) - b * Math.sin(3 * t), 2 * Math.sqrt(a * b) * Math.sin(2 * t)]);
  }
  return p;
})();

function rot3(v, rx, ry, rz) {
  let [x, y, z] = v;
  let c = Math.cos(rx), s = Math.sin(rx);
  [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(ry); s = Math.sin(ry);
  [x, z] = [x * c + z * s, -x * s + z * c];
  c = Math.cos(rz); s = Math.sin(rz);
  [x, y] = [x * c - y * s, x * s + y * c];
  return [x, y, z];
}

// disegna la pallina in coordinate schermo (centro sx,sy, raggio r px)
export function ballScreen(R, sx, sy, r, o = {}) {
  if (r < 0.3) return;
  const a = o.alpha ?? 1;
  const b = R.b, g = R.g, gs = R.gs;
  const spin = o.spin || [0.4, 0.8, 0.2];
  // alone nel buffer emissivo
  if (o.glow !== 0) {
    const gl = (o.glow ?? 0.9) * Math.min(1, 60 / Math.max(r, 1));
    const gr = g.createRadialGradient(sx * gs, sy * gs, 0, sx * gs, sy * gs, r * 2.2 * gs);
    gr.addColorStop(0, rgba(PAL.ball, 0.9 * gl * a)); gr.addColorStop(0.45, rgba(PAL.ball, 0.35 * gl * a)); gr.addColorStop(1, rgba(PAL.ball, 0));
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr;
    g.fillRect((sx - r * 2.2) * gs, (sy - r * 2.2) * gs, r * 4.4 * gs, r * 4.4 * gs); g.restore();
  }
  b.save();
  b.globalAlpha = a;
  if (o.blend) b.globalCompositeOperation = o.blend;
  const hx = sx - r * 0.38, hy = sy - r * 0.42;
  const base = b.createRadialGradient(hx, hy, r * 0.05, sx, sy, r * 1.08);
  base.addColorStop(0, '#fbffc4');
  base.addColorStop(0.28, '#ecff4a');
  base.addColorStop(0.72, '#b8e200');
  base.addColorStop(1, '#5d7600');
  b.fillStyle = base;
  b.beginPath(); b.arc(sx, sy, r, 0, Math.PI * 2); b.fill();
  // luce di bordo (riflesso dell'ambiente)
  if (r > 3) {
    b.save();
    b.beginPath(); b.arc(sx, sy, r, 0, Math.PI * 2); b.clip();
    const rim = b.createLinearGradient(sx - r, sy - r, sx + r, sy + r);
    rim.addColorStop(0, 'rgba(0,0,0,0)'); rim.addColorStop(0.6, 'rgba(0,0,0,0)'); rim.addColorStop(1, rgba(o.rim || PAL.cyan, 0.85));
    b.globalCompositeOperation = 'lighter';
    b.strokeStyle = rim; b.lineWidth = r * 0.22;
    b.beginPath(); b.arc(sx, sy, r * 0.98, 0, Math.PI * 2); b.stroke();
    b.restore();
  }
  // cucitura
  if (r > 2.5) {
    const lw = Math.max(0.6, r * 0.075);
    b.lineCap = 'round';
    let prev = null;
    for (const p of SEAM) {
      const q = rot3(p, spin[0], spin[1], spin[2]);
      const vis = -q[2];
      const pt = [sx + q[0] * r * 0.985, sy + q[1] * r * 0.985, vis];
      if (prev && prev[2] > 0 && vis > 0) {
        b.strokeStyle = `rgba(255,255,236,${clamp(Math.min(prev[2], vis) * 2.2) * 0.92})`;
        b.lineWidth = lw * (0.55 + 0.45 * clamp(vis * 1.5));
        b.beginPath(); b.moveTo(prev[0], prev[1]); b.lineTo(pt[0], pt[1]); b.stroke();
      }
      prev = pt;
    }
  }
  b.restore();
}

// pallina nello spazio mondo (raggio in unità mondo). Restituisce [sx, sy, rpx] o null.
export function ball(R, p, radius, o = {}) {
  const pc = R.camW(p);
  if (pc[2] < R.cam.near * 2) return null;
  const s = R.projC(pc), r = (radius * R.cam.f) / pc[2];
  ballScreen(R, s[0], s[1], r, o);
  return [s[0], s[1], r, pc[2]];
}

// ---------------------------------------------------------------- campo
// misure ITF in metri; origine al centro della rete, u = larghezza, v = lunghezza (v>0 verso il lontano)
export const COURT = { L: 23.77, Wd: 10.97, Ws: 8.23, SV: 6.4 };

// segmenti delle linee: [u0, v0, u1, v1]
export function courtLines() {
  const { L, Wd, Ws, SV } = COURT, hl = L / 2, hd = Wd / 2, hs = Ws / 2;
  return [
    [-hd, -hl, hd, -hl], [-hd, hl, hd, hl], // fondo
    [-hd, -hl, -hd, hl], [hd, -hl, hd, hl], // doppio
    [-hs, -hl, -hs, hl], [hs, -hl, hs, hl], // singolo
    [-hs, -SV, hs, -SV], [-hs, SV, hs, SV], // servizio
    [0, -SV, 0, SV], // centrale
    [0, -hl, 0, -hl + 0.3], [0, hl, 0, hl - 0.3], // tacche
  ];
}

// ---------------------------------------------------------------- icone (in un quadrato 0..1)
export const ICON = {
  check: [[0.18, 0.52], [0.42, 0.75], [0.84, 0.28]],
};

export function checkMark(R, x, y, s, prog, st) {
  const P = ICON.check.map(([u, v]) => [x + (u - 0.5) * s, y + (v - 0.5) * s]);
  const l1 = Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1]), l2 = Math.hypot(P[2][0] - P[1][0], P[2][1] - P[1][1]);
  const d = clamp(prog) * (l1 + l2);
  const pts = [P[0]];
  if (d <= l1) pts.push([lerp(P[0][0], P[1][0], d / l1), lerp(P[0][1], P[1][1], d / l1)]);
  else { pts.push(P[1]); const u = (d - l1) / l2; pts.push([lerp(P[1][0], P[2][0], u), lerp(P[1][1], P[2][1], u)]); }
  if (d > 0.5) R.line(pts.flat(), st);
}
