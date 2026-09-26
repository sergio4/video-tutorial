// ATTO 1 · HOOK «il loop»: la solita amichevole, sempre uguale, sempre più veloce. Poi la pallina sfonda lo schermo.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, E, deg, rng, hash, rgba, mixc, noise1, T } from '../engine/math.js';
import { PAL, ballScreen, COURT } from '../engine/kit.js';

const CX = W / 2, CY = H / 2 + 20;
const SC = 56; // px per metro
const BX = (COURT.L / 2) * SC; // fondo campo in px (orizzontale)
const WY = (COURT.Wd / 2) * SC;

// segmenti del campo visto dall'alto, lunghezza sull'asse x
function lines() {
  const hl = BX, hd = WY, hs = (COURT.Ws / 2) * SC, sv = COURT.SV * SC;
  return [
    [-hl, -hd, hl, -hd], [-hl, hd, hl, hd], [-hl, -hd, -hl, hd], [hl, -hd, hl, hd],
    [-hl, -hs, hl, -hs], [-hl, hs, hl, hs], [-sv, -hs, -sv, hs], [sv, -hs, sv, hs], [-sv, 0, sv, 0],
  ];
}

// posizioni dei colpi: x alterna i due fondi, y a zig-zag
function hitPos(i) {
  const side = i % 2 === 0 ? -1 : 1;
  const ys = [-0.35, 0.3, -0.1, 0.42, -0.4, 0.18, -0.25, 0.36, -0.3, 0.2, -0.36, 0.28, 0.0];
  return [side * (BX + 30), ys[i % ys.length] * WY * 1.6];
}

// stato della pallina durante il palleggio
function rally(t, c) {
  const hits = c.hits;
  let i = 0;
  while (i < hits.length - 1 && t >= hits[i + 1]) i++;
  const t0 = hits[i], t1 = i + 1 < hits.length ? hits[i + 1] : c.smash;
  const u = clamp((t - t0) / (t1 - t0));
  const a = hitPos(i), b = hitPos(i + 1);
  return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), h: Math.sin(Math.PI * u), i, u };
}

// timbri «AMICHEVOLE»: uno per colpo, stili diversi
const STAMPS = [
  { x: 60, y: 30, s: 300, r: -2, k: 'ghost', z: 420 },
  { x: -420, y: 250, s: 230, r: -3, k: 'out', z: 240 },
  { x: -560, y: -300, s: 150, r: -5, k: 'fill', z: -120 },
  { x: 430, y: 290, s: 190, r: 4, k: 'out', z: 160 },
  { x: 250, y: -330, s: 110, r: 7, k: 'fill', z: -260 },
  { x: 610, y: -140, s: 120, r: -8, k: 'fill', z: -200 },
  { x: -650, y: 60, s: 140, r: 6, k: 'out', z: 90 },
  { x: 150, y: 360, s: 130, r: -6, k: 'fill', z: -320 },
  { x: -180, y: -380, s: 170, r: 3, k: 'out', z: 200 },
  { x: 520, y: 80, s: 150, r: 9, k: 'fill', z: -80 },
  { x: -300, y: -60, s: 210, r: -7, k: 'out', z: 60 },
  { x: 330, y: -40, s: 160, r: 5, k: 'fill', z: -150 },
  { x: -80, y: 330, s: 120, r: -4, k: 'out', z: -40 },
];

// camera: spinta lenta in avanti con un rollio leggero (tensione che cresce)
function hookCam(t, c) {
  const u = clamp(t / c.impact);
  const cam = new Cam();
  const push = 330 * E.inQuad(u);
  cam.look([CX + Math.sin(t * 0.8) * 26, CY + Math.cos(t * 0.6) * 12, -1600 + push], [CX, CY, 0], deg(lerp(-1.5, 1.5, u)), 1600);
  return cam;
}

export function hookAct(c) {
  const impact = c.impact;
  const count = (t) => {
    // contatore: cresce a ogni colpo con passi sempre più grandi
    const steps = [12, 13, 14, 16, 19, 23, 29, 37, 48, 62, 81, 99];
    let n = steps[0];
    for (let i = 0; i < c.hits.length; i++) if (t >= c.hits[i]) n = steps[Math.min(i + 1, steps.length - 1)];
    return n;
  };

  function draw(R, t) {
    if (t >= impact) return;
    R.bg('#0c0b11', '#07070b', [[CX, CY, 900, '#232033', 0.5]]);
    // velocità del mondo: rallenta durante lo smash (time-freeze)
    const frz = t < c.smash ? 0 : 1;
    const sh = (t >= c.smash ? 0 : 1) * 0;
    R.setCam(hookCam(Math.min(t, c.smash + 0.3), c));
    {
      R.push([1, 0, 0, CX, 0, 1, 0, CY, 0, 0, 1, 0]);
      // campo grigio
      const la = 0.4 + 0.06 * Math.sin(t * 9);
      for (const [x0, y0, x1, y1] of lines()) R.band(x0, y0, x1, y1, 3, { fill: '#6d6980', alpha: la });
      R.band(0, -WY - 40, 0, WY + 40, 2, { fill: '#6d6980', alpha: la * 0.8 });
      // timbri
      for (let i = 0; i < STAMPS.length; i++) {
        const st = STAMPS[i];
        const th = i < 3 ? [-0.9, -0.55, -0.12][i] : c.hits[i - 2] ?? 99;
        if (t < th) continue;
        const age = t - th;
        const pop = E.outExpo(age / 0.14);
        const sc = lerp(1.45, 1, pop);
        const hot = clamp(1 - age / 0.35);
        const dim = lerp(0.34, 1, hot);
        const col = st.k === 'ghost' ? rgba('#3a3748', 1) : rgba(mixc('#8f8aa3', '#ffffff', hot), 1);
        R.with([Math.cos(deg(st.r)) * sc, -Math.sin(deg(st.r)) * sc, 0, st.x, Math.sin(deg(st.r)) * sc, Math.cos(deg(st.r)) * sc, 0, st.y, 0, 0, 1, st.z], () => {
          const o = { font: 'unb900', size: st.s, align: 'center', v: 'cap', tracking: -0.02 };
          if (st.k === 'out') R.text('AMICHEVOLE', 0, 0, { ...o, stroke: col, lw: 2.2, alpha: dim });
          else R.text('AMICHEVOLE', 0, 0, { ...o, fill: col, alpha: st.k === 'ghost' ? 0.9 : dim });
        });
      }
      // ultimo timbro, con il punto di domanda, al momento dello smash
      if (t >= c.smash) {
        const age = t - c.smash;
        const sc = lerp(1.6, 1, E.outExpo(age / 0.18));
        R.with([sc, 0, 0, 0, 0, sc, 0, -10, 0, 0, 1, 0], () => {
          R.text('AMICHEVOLE?', 0, 0, { font: 'unb900', size: 176, align: 'center', v: 'cap', tracking: -0.03, fill: '#ffffff', alpha: 1 - 0.35 * seg(t, c.slow0, c.impact) });
        });
      }
      // giocatori «pong» e pallina
      if (t < c.smash + 0.05) {
        const b = rally(t, c);
        for (const side of [-1, 1]) {
          // il giocatore insegue la y della pallina
          const tgt = hitPos(side < 0 ? (b.i % 2 === 0 ? b.i : b.i + 1) : (b.i % 2 === 1 ? b.i : b.i + 1))[1];
          const py = lerp(b.y, tgt, 0.6);
          R.rrect(side * (BX + 58) - 7, py - 34, 14, 68, 7, { fill: '#b7b2c9', alpha: 0.85 });
        }
        // ombra e pallina (l'altezza la leggo nella scala)
        R.circle(b.x + 8 + b.h * 26, b.y + 10 + b.h * 30, 10, { fill: '#000', alpha: 0.5 });
        // scia: dove era la pallina nell'ultimo 1/50 di secondo (riempie i buchi tra i sottofotogrammi)
        const pts = [];
        for (let k = 0; k <= 6; k++) {
          const q = rally(t - 0.028 + (k / 6) * 0.028, c);
          const pp = R.proj(q.x, q.y);
          if (pp) pts.push([pp[0], pp[1], 0]);
        }
        R.hud(() => R.trail(pts.map(([x, y]) => [x, y, 0]), { w0: 4, w1: 24 * (1 + b.h * 0.45), a0: 0, a1: 0.55, color: PAL.ball, glow: 0.4 }));
        const pb = R.proj(b.x, b.y);
        ballScreen(R, pb[0], pb[1], 12 * (1 + b.h * 0.45) * R.scaleAt(b.x, b.y), { spin: [t * 20, t * 13, 0], glow: 0.9 });
      }
      R.pop();
    }
    R.hud(() => {
      // contatore e chip UI
      R.text('TENNIS CLASH · MATCH AMICHEVOLE', 64, 64, { font: 'mono700', size: 22, tracking: 0.06, v: 'top', fill: '#8f8aa3' });
      R.text('AMICHEVOLI GIOCATE', W - 64, 64, { font: 'mono700', size: 22, tracking: 0.06, v: 'top', align: 'right', fill: '#8f8aa3' });
      const n = count(t);
      R.text(n >= 99 ? '99+' : String(n).padStart(3, '0'), W - 60, 108, { font: 'bc900i', size: 120, v: 'top', align: 'right', fill: '#ffffff', tracking: 0.01 });
    });
    // la pallina parte verso la camera
    if (t >= c.smash) {
      const u = t - c.smash;
      // distanza dalla camera: veloce, poi rallenta (slow-mo), poi schianto
      const d0 = 1600;
      let d;
      if (t < c.slow0) d = lerp(d0, 150, E.outCubic(seg(t, c.smash, c.slow0)));
      else if (t < c.slow1) d = lerp(150, 70, seg(t, c.slow0, c.slow1));
      else d = lerp(70, 7, E.inCubic(seg(t, c.slow1, c.impact)));
      const r = (12 * 1600) / d;
      const start = hitPos(c.hits.length);
      const k = E.outCubic(seg(t, c.smash, c.slow0));
      const sx = CX + lerp(start[0], 40, k), sy = CY + lerp(start[1], -30, k);
      const slow = t >= c.slow0 && t < c.slow1;
      ballScreen(R, sx, sy, r, { spin: [u * (slow ? 3 : 18), u * (slow ? 2 : 11), 0.4], glow: 1, rim: PAL.magenta });
    }
  }

  // frammenti dell'esplosione, disegnati sopra al mondo nuovo
  function over(R, t) {
    if (t < impact || t > impact + 1.2) return;
    const u = t - impact;
    const rr = rng(7);
    R.setCam(hookCam(c.smash + 0.3, c));
    {
      R.push([1, 0, 0, CX, 0, 1, 0, CY, 0, 0, 1, 0]);
      // lettere dei timbri che volano oltre la camera
      for (let i = 0; i < STAMPS.length; i++) {
        const st = STAMPS[i];
        const o = { font: 'unb900', size: st.s, align: 'center', v: 'cap', tracking: -0.02 };
        const L = R.fonts.layout('AMICHEVOLE', 'unb900', st.s, -0.02);
        R.with(T(0, 0, st.z), () => R.text('AMICHEVOLE', st.x, st.y, {
          ...o,
          fill: st.k === 'out' ? undefined : '#e9e6f5',
          stroke: st.k === 'out' ? '#e9e6f5' : undefined,
          lw: 2.2,
          per: (g, n, ch, G) => {
            const gx = st.x + G.x - L.width / 2, gy = st.y;
            const dir = Math.atan2(gy + (hash(i * 31 + g) - 0.5) * 200, gx + (hash(i * 17 + g) - 0.5) * 200);
            const sp = 900 + hash(i * 7 + g * 3) * 1600;
            const d = sp * E.outCubic(u / 1.0) * (0.6 + u);
            const z = -(300 + hash(i + g * 11) * 1400) * E.outQuad(u / 0.9);
            return {
              x: Math.cos(dir) * d, y: Math.sin(dir) * d, z,
              rz: (hash(i * 3 + g) - 0.5) * 6 * u, rx: (hash(i + g) - 0.5) * 8 * u, ry: (hash(i * 5 + g) - 0.5) * 8 * u,
              a: clamp(1 - u / 0.7) * (st.k === 'ghost' ? 0.4 : 0.9),
            };
          },
        }));
      }
      R.pop();
    }
  }

  function fx(t) {
    const f = {};
    if (t >= c.smash - 0.05 && t < impact) f.mb = 6;
    if (t >= impact - 0.02 && t < impact + 0.5) {
      const u = (t - impact) / 0.5;
      f.flash = ['#ffffff', clamp(1 - u * 3.2)];
      f.ca = 0.02 * (1 - u) ** 2;
      f.glitch = u < 0.3 ? 0.8 * (1 - u / 0.3) : 0;
      f.mb = 6;
    }
    return f;
  }

  return { draw, over, fx };
}
