// SCENA 6 · «per diventare il migliore.»
// Dal tap entriamo nella luce: una scia disegna al neon una coppa con le racchette incrociate,
// la camera arretra e la coppa è tra le mani del protagonista, sotto l'insegna WIN, tra i coriandoli.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T, apply } from '../engine/math.js';
import { PAL, ballScreen } from '../engine/kit.js';
import { camTrack, shake, bgNight } from './common.js';
import { figure, POSE, jointsOf } from './figure.js';

const FS = 3.4; // scala della sagoma
const TS = 0.3; // scala della coppa nel sistema della sagoma

// profilo della coppa (metà destra), da specchiare: y verso il basso, base a 0
const CUP = [[0, -300], [120, -300], [112, -250], [92, -200], [60, -160], [22, -132], [16, -92], [18, -64], [46, -44], [52, -20], [74, -14], [74, 0], [0, 0]];
const HANDLE = [[112, -262], [168, -258], [176, -214], [140, -180], [84, -176]];

function pathLen(pts) { let l = 0; for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return l; }
function partial(pts, u) {
  const L = pathLen(pts) * clamp(u), out = [pts[0]];
  let d = 0;
  for (let i = 1; i < pts.length; i++) {
    const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d + s >= L) { const f = (L - d) / s; out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); return out; }
    out.push(pts[i]); d += s;
  }
  return out;
}

export function act3(S, TL) {
  const s6 = S.s6;
  const t0 = s6.t0, t1 = s6.t1;
  const draw0 = t0 + 0.05, draw1 = t0 + 0.95; // la coppa si disegna
  const pull0 = t0 + 0.9, pull1 = t0 + 1.7;   // la camera arretra e rivela il protagonista
  const win = t0 + 1.35;                       // l'insegna WIN si accende

  const liftJ = jointsOf(POSE.lift);
  const cupBase = [0, liftJ.hdA[1] - 6]; // tra le mani (sistema della sagoma)
  const cupWorld = (x, y) => [(cupBase[0] + x * TS) * FS, (cupBase[1] + y * TS) * FS, 0];
  const cupCenter = cupWorld(0, -160);

  const camKeys = [
    { t: t0, eye: [cupCenter[0], cupCenter[1], cupCenter[2] - 420], tgt: cupCenter, f: 1500, roll: deg(-6) },
    { t: pull0, eye: [cupCenter[0] + 20, cupCenter[1] + 20, cupCenter[2] - 560], tgt: cupCenter, f: 1500, roll: deg(-2) },
    { t: pull1, eye: [60, -540, -1780], tgt: [0, -520, 0], f: 1500, roll: deg(1.5), ease: 'inOutCubic' },
    { t: t1, eye: [-40, -520, -1600], tgt: [0, -520, 0], f: 1500, roll: deg(-1) },
  ];
  const camAt = (t) => camTrack(camKeys, t, shake(t, [[win, 12, 0.5]]));

  function trophy(R, t) {
    const u = seg(t, draw0, draw1);
    const glowK = 0.9 + 0.3 * Math.sin(t * 12);
    R.push(TRS(cupWorld(0, 0), [0, 0, 0], FS * TS));
    // riempimento vetroso quando il disegno è completo
    const full = seg(t, draw1 - 0.1, draw1 + 0.3);
    if (full > 0) {
      const poly = CUP.slice(0, -1).concat(CUP.slice(0, -1).reverse().map(([x, y]) => [-x, y]));
      R.poly(poly.flat(), { fill: { lin: [0, -300, 0, 0], stops: [[0, 'rgba(138,107,255,0.55)'], [1, 'rgba(48,24,96,0.35)']] }, alpha: full });
    }
    for (const side of [1, -1]) {
      const cup = partial(CUP.map(([x, y]) => [x * side, y]), u);
      R.line(cup.flat(), { stroke: '#ffffff', lw: 7, glow: 1.2 * glowK, glowColor: side > 0 ? PAL.cyan : PAL.magenta });
      const hu = seg(t, draw0 + 0.35, draw1);
      if (hu > 0) R.line(partial(HANDLE.map(([x, y]) => [x * side, y]), hu).flat(), { stroke: '#ffffff', lw: 6, glow: 1.1 * glowK, glowColor: side > 0 ? PAL.cyan : PAL.magenta });
      // punta luminosa che disegna
      if (u < 1) { const p = cup[cup.length - 1]; R.circle(p[0], p[1], 10, { fill: '#ffffff', glow: 2 }, 16); }
    }
    // racchette incrociate sul corpo della coppa
    const ru = seg(t, draw1 - 0.2, draw1 + 0.3);
    if (ru > 0) for (const side of [1, -1]) R.with(TRS([0, -222, 0], [0, 0, deg(28 * side)], 1), () => {
      R.band(0, 10, 0, 60 * ru, 5, { fill: '#ffffff', glow: 0.9, glowColor: PAL.magenta });
      R.arc(0, -16, 26, 0, Math.PI * 2 * ru, { stroke: '#ffffff', lw: 5, glow: 1, glowColor: side > 0 ? PAL.cyan : PAL.magenta }, 36);
    });
    R.pop();
  }

  function skyline(R, t, a) {
    R.hud(() => {
      for (let i = 0; i < 26; i++) {
        const w = 60 + hash(i) * 90, h = 120 + hash(i * 3) * 300, x = i * 78 - 40;
        R.rect(x, H - h, w, h, { fill: '#0c0726', alpha: a });
        for (let j = 0; j < 14; j++) {
          const wx = x + 10 + (j % 3) * (w / 3.2), wy = H - h + 20 + Math.floor(j / 3) * 28;
          if (wy > H - 10 || hash(i * 31 + j) < 0.45) continue;
          R.rect(wx, wy, 8, 12, { fill: hash(i + j * 7) > 0.8 ? PAL.magenta : '#ffd9a8', alpha: a * 0.7, glow: 0.3 });
        }
      }
    });
  }

  function winSign(R, t) {
    const on = seg(t, win - 0.08, win);
    const flick = t < win + 0.35 ? (Math.sin(t * 70) > -0.2 ? 1 : 0.25) : 1;
    const a = on * flick;
    if (a <= 0) return;
    R.with(TRS([0, -470, 900], [0, 0, 0], 1.55), () => {
      R.rrect(-470, -170, 940, 340, 40, { stroke: PAL.magenta, lw: 10, alpha: a, glow: 1.4 });
      R.rrect(-440, -140, 880, 280, 30, { stroke: '#8a6bff', lw: 4, alpha: a * 0.8, glow: 0.8 });
      R.text('WIN', 0, 0, { font: 'unb900', size: 250, align: 'center', v: 'cap', skew: 0.18, fill: 'rgba(138,107,255,0.25)', stroke: '#ffffff', lw: 5, alpha: a, glow: 1.3, glowColor: '#b38cff', tracking: 0.04 });
    });
  }

  function confetti(R, t) {
    const u = t - win;
    if (u < 0) return;
    R.hud(() => {
      for (let i = 0; i < 140; i++) {
        const x0 = hash(i * 3.3) * W, sp = 180 + hash(i * 7.7) * 380;
        const burst = Math.max(0, 1 - u * 1.6) * (hash(i * 9.1) - 0.5) * 900;
        const x = x0 + burst + Math.sin(u * 3 + i) * 30, y = -40 + sp * u + (hash(i * 5.5) * 300) * (1 - Math.exp(-u * 3)) - 200 * Math.exp(-u * 4) + hash(i) * 200;
        const flip = Math.cos(u * (4 + hash(i) * 8) + i);
        const c = [PAL.cyan, PAL.magenta, PAL.ball, '#8a6bff', '#ffffff'][i % 5];
        const L = 9 + hash(i * 2) * 8;
        const ang = u * 3 + i;
        R.with([Math.cos(ang) * flip, -Math.sin(ang), 0, x, Math.sin(ang) * flip, Math.cos(ang), 0, y, 0, 0, 1, 0], () => R.rect(-L, -L * 0.45, 2 * L, L * 0.9, { fill: c, alpha: 0.95, glow: 0.4 }));
      }
    });
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    // entrata nella luce dal pulsante
    bgNight(R, t, { top: '#140630', bottom: '#050214', c1: '#3b1f7a', c2: PAL.magenta, c3: '#1b2cff' });
    const rev = seg(t, pull0, pull1);
    skyline(R, t, rev);
    // fasci di luce verticali dietro alla coppa
    R.hud(() => {
      for (let i = 0; i < 9; i++) {
        const x = W / 2 + (i - 4) * 210 + Math.sin(t * 0.8 + i) * 30;
        R.poly([x - 6, 0, x + 6, 0, x + 90, H, x - 90, H], { fill: { screenLin: [0, 0, 0, H], stops: [[0, rgba(i % 2 ? PAL.cyan : PAL.magenta, 0.0)], [1, rgba(i % 2 ? PAL.cyan : PAL.magenta, 0.12 * rev)]] }, blend: 'lighter' });
      }
    });
    winSign(R, t);
    // protagonista con la coppa sopra la testa
    R.with(TRS([0, 0, 0], [0, 0, 0], FS), () => figure(R, POSE.lift, { band: PAL.ball, wrist: PAL.ball }, { rimA: PAL.ball, rimB: PAL.magenta, rim: 2.2, glow: 0.9 }));
    trophy(R, t);
    confetti(R, t);
    // lampo d'ingresso (continua lo zoom nel pulsante)
    const inA = 1 - seg(t, t0, t0 + 0.2);
    if (inA > 0) R.hud(() => R.rect(0, 0, W, H, { fill: PAL.ball, alpha: inA * 0.85 }));
  }

  function fx(t) {
    const f = {};
    if (t < t0 + 0.25) f.mb = 6;
    if (t >= pull0 && t < pull1) f.mb = 6;
    if (t >= win && t < win + 0.3) { const u = (t - win) / 0.3; f.flash = [PAL.magenta, 0.3 * (1 - u)]; f.ca = 0.008 * (1 - u); }
    return f;
  }

  return { t0, t1, draw, fx };
}
