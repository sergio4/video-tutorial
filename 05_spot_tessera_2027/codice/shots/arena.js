// Ambiente stadio notturno condiviso: campi in fila, pubblico di luci, pannelli LED, torri faro.
import { W, H } from '../engine/r.js';
import { clamp, lerp, hash, rgba, TRS, deg, mixc } from '../engine/math.js';
import { PAL, courtLines } from '../engine/kit.js';

export const M = 40; // unità per metro
export const P = (x, z, h = 0) => [x * M, -h * M, z * M];

// campo con la lunghezza lungo x, centrato in (cx, cz) metri
export function court(R, cx, cz, a = 1, o = {}) {
  R.with(TRS(P(cx, cz, 0), [deg(-90), deg(90), 0], M), () => {
    R.rect(-9, -18, 18, 36, { fill: o.out || '#1a2f96', alpha: a });
    R.rect(-6.4, -13.1, 12.8, 26.2, { fill: '#1d45c8', alpha: a });
    R.rect(-5.485, -11.885, 10.97, 23.77, { fill: { lin: [0, -11.885, 0, 11.885], stops: [[0, '#2a60f2'], [1, '#2152e0']] }, alpha: a });
    for (const [u0, v0, u1, v1] of courtLines()) R.band(u0, v0, u1, v1, 0.07, { fill: '#ffffff', alpha: a, glow: 0.45, glowColor: '#cfe8ff' });
  });
  // rete (tra le due metà, lungo z)
  const nw = 6.4;
  const top = [], bot = [];
  for (let k = 0; k <= 16; k++) { const z = cz - nw + (2 * nw * k) / 16; top.push(P(cx, z, 0.95)); bot.push(P(cx, z, 0)); }
  for (let k = 0; k <= 16; k++) R.worldLine([bot[k], top[k]], { stroke: '#ffffff', lwPx: 1, alpha: 0.2 * a });
  R.worldLine(top, { stroke: '#ffffff', lw: 0.05 * M, alpha: a, glow: 0.5 });
}

// pubblico: luci di telefoni su file di gradinate dietro ai campi, ripetute lungo x attorno alla camera
export function crowd(R, t, camX, a = 1, o = {}) {
  const z0 = o.z0 ?? 13, rows = o.rows ?? 6, span = o.span ?? 60;
  const base = Math.floor(camX / M / 1.3);
  for (let r = 0; r < rows; r++) {
    for (let k = -28; k <= 28; k++) {
      const col = base + k, i = col * 7 + r * 131;
      const x = col * 1.3 + (hash(i) - 0.5) * 0.8;
      if (Math.abs(x * M - camX) > span * M) continue;
      const p = P(x, z0 + r * 1.4, 1.2 + r * 1.05 + hash(i * 3) * 0.3);
      const blink = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * (2 + hash(i) * 6) + i));
      const c = hash(i * 5) > 0.86 ? PAL.magenta : hash(i * 7) > 0.82 ? PAL.cyan : '#fff1d0';
      R.dot(p, 0.08 * M, { fill: c, alpha: a * blink * 0.9, glow: 0.8, maxR: 5 });
    }
  }
}

export function boards(R, t, camX, a = 1, z = 9.5) {
  const x0 = camX / M - 40;
  R.with(TRS(P(x0, z, 0), [0, 0, 0], M), () => {
    R.rect(0, -1.1, 80, 1.1, { fill: '#0a0620', alpha: a });
    const off = (t * 3.2) % 26;
    R.clipRect(0, -1.1, 80, 1.1);
    for (let k = -1; k < 5; k++) R.text('eSPORTS FITP · TESSERA 2027 ·', -off + k * 26 - (x0 % 26), -0.55, { font: 'unb900', size: 0.62, v: 'cap', fill: k % 2 ? PAL.magenta : PAL.cyan, alpha: a, glow: 0.5 });
    R.unclip();
    R.band(0, -1.1, 80, -1.1, 0.05, { fill: PAL.magenta, alpha: a, glow: 0.8 });
  });
}

export function towers(R, camX, a = 1) {
  const base = Math.round(camX / M / 30) * 30;
  for (const dx of [-45, -15, 15, 45]) {
    const p = P(base + dx, 24, 16);
    R.flare(p, 5 * M, '#cfe6ff', a * 0.5);
    R.flare(p, 1.2 * M, '#ffffff', a * 0.9);
  }
}

// cielo al tramonto dell'arena
export function sky(R, a = 1) {
  R.bg(rgba(mixc('#0d0626', '#2a0f5e', a), 1), rgba(mixc('#05030f', '#6a1d78', a * 0.6), 1), [
    [W * 0.5, H * 0.8, 900, PAL.magenta, 0.16 * a],
    [W * 0.2, H * 0.1, 800, PAL.purple2, 0.5],
  ]);
}
