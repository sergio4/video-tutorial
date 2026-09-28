// G · «per diventare il migliore.»
// Dal tocco sulla notifica entriamo nella partita: vista televisiva su un campo notturno, lo scambio è una scia di luce
// e il tabellone MARCO – LUNA.SPIN. Il punto vincente accende GAME · SET · MATCH;
// la pallina schizza in alto e la sua scia disegna al neon la coppa sotto l'insegna WIN; MARCO entra in primo piano ed esulta.
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T } from '../engine/math.js';
import { PAL, ball as ball3 } from '../engine/kit.js';
import { camTrack, shake } from './common.js';
import { M, P, court, crowd, towers, sky } from './arena.js';
import { charCard } from './chars.js';

// profilo della coppa (metà destra), da specchiare: y verso il basso, base a 0
const CUP = [[0, -300], [120, -300], [112, -250], [92, -200], [60, -160], [22, -132], [16, -92], [18, -64], [46, -44], [52, -20], [74, -14], [74, 0], [0, 0]];
const HANDLE = [[112, -262], [168, -258], [176, -214], [140, -180], [84, -176]];
const CS = 0.018 * M; // scala della coppa: 300 unità di profilo ≈ 5,4 m

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

export function match(S, TL) {
  const s6 = S.g;
  const t0 = s6.t0, t1 = s6.t1;
  const tM = t0 + 1.05;                         // dopo il VS inizia la partita
  const tWin = tM + 1.2;                        // punto vincente
  const draw0 = tWin + 0.25, draw1 = tWin + 0.85; // la scia disegna la coppa
  const tSign = tWin + 0.8;                     // si accende WIN

  // scambio: tratti [t inizio, t fine, da (x,z metri), a (x,z), altezza dell'arco]
  const R0 = [
    [tM - 0.1, tM + 0.38, [-11.2, 2.2], [10.2, -2.8], 1.3],
    [tM + 0.38, tM + 0.8, [10.2, -2.8], [-9.8, 3.4], 1.5],
    [tM + 0.8, tWin, [-9.8, 3.4], [9.6, -4.05], 1.1], // vincente sulla riga laterale
  ];
  const CUP_POS = P(15.5, 0, 0.8); // base della coppa: sospesa sopra il fondo campo avversario
  // punto del profilo della coppa in coordinate mondo (piano rivolto alla camera)
  const cupPt = (x, y) => [CUP_POS[0], CUP_POS[1] + y * CS, CUP_POS[2] - x * CS];

  function ballAt(t) {
    for (const [a, b, p0, p1, h] of R0) if (t >= a && t < b) {
      const u = (t - a) / (b - a);
      return P(lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u), 0.15 + Math.sin(u * Math.PI) * h + (1 - u) * 0.9);
    }
    if (t >= tWin) {
      // dopo il rimbalzo la pallina sale verso la coppa e diventa la punta che la disegna
      const u = E.outCubic(seg(t, tWin, draw0));
      const top = cupPt(CUP[0][0], CUP[0][1]), from = P(9.6, -4.05, 0);
      return [lerp(from[0], top[0], u), lerp(0, top[1], u) - Math.sin(u * Math.PI) * 1.5 * M, lerp(from[2], top[2], u)];
    }
    return null;
  }

  const camKeys = [
    { t: tM, eye: P(-20.5, 0.6, 7.2), tgt: P(-1, 0, 0), f: 1350, roll: deg(-2) },
    { t: tWin, eye: P(-19.2, 0.2, 6.6), tgt: P(0, -0.3, 0.2), f: 1350, roll: deg(1) },
    { t: tWin + 0.75, eye: P(-5, 0, 5.0), tgt: P(15.5, 2.6, 6.6), f: 1350, roll: deg(0), ease: 'inOutCubic' },
    { t: t1, eye: P(-3.2, -0.4, 4.8), tgt: P(15.5, 2.9, 6.8), f: 1350, roll: deg(-1.5) },
  ];
  const camAt = (t) => camTrack(camKeys, t, shake(t, [[tWin, 16, 0.5], [tSign, 10, 0.4]]));

  function rally(R, t) {
    if (t >= draw1) return;
    const pts = [];
    for (let i = 0; i <= 24; i++) { const p = ballAt(t - 0.22 + (i / 24) * 0.22); if (p) pts.push(p); }
    if (pts.length > 2) R.trail(pts, { w0: 0, w1: 0.16 * M, a0: 0, a1: 0.9, color: (u) => rgba(mixc(PAL.cyan, PAL.ball, u), 1), glow: 1 });
    const p = ballAt(t);
    if (p && t < draw0) {
      ball3(R, p, 0.05 * M, { spin: [t * 12, t * 7, 0], glow: 1.2 });
      R.with(TRS([p[0], 0, p[2]], [deg(-90), 0, 0], 1), () => R.circle(0, 0, 0.06 * M, { fill: '#000', alpha: 0.5, blur: 2 }, 16));
    }
    // colpi: onde di luce sui due fondi campo
    for (const [a, , p0] of R0) {
      const u = seg(t, a, a + 0.25);
      if (u > 0 && u < 1) R.with(TRS(P(p0[0], p0[1], 0.02), [deg(-90), 0, 0], M), () => R.circle(0, 0, lerp(0.3, 2.2, E.outCubic(u)), { stroke: '#ffffff', lw: 0.06, alpha: 1 - u, glow: 1 }, 40));
    }
  }

  function winSplash(R, t) {
    const u = seg(t, tWin, tWin + 0.6);
    if (u <= 0 || u >= 1) return;
    R.with(TRS(P(9.6, -4.05, 0.02), [deg(-90), 0, 0], M), () => {
      R.circle(0, 0, lerp(0.3, 5, E.outCubic(u)), { stroke: PAL.ball, lw: 0.12 * (1 - u) + 0.02, alpha: 1 - u, glow: 1.3 }, 64);
      R.circle(0, 0, lerp(0.2, 2.2, E.outCubic(u)), { fill: PAL.ball, alpha: (1 - u) * 0.6, glow: 1 }, 40);
    });
  }

  function trophy(R, t) {
    const u = seg(t, draw0, draw1);
    if (u <= 0) return;
    const glowK = 0.9 + 0.3 * Math.sin(t * 12);
    // la coppa si solleva appena finita (segnaposto del personaggio che la alza)
    const lift = E.outBack(seg(t, draw1, draw1 + 0.5), 1.5) * 0.5 * M;
    R.push(TRS([CUP_POS[0], CUP_POS[1] - lift, CUP_POS[2]], [0, deg(90), 0], CS));
    const full = seg(t, draw1 - 0.1, draw1 + 0.3);
    if (full > 0) {
      const poly = CUP.slice(0, -1).concat(CUP.slice(0, -1).reverse().map(([x, y]) => [-x, y]));
      R.poly(poly.flat(), { fill: { lin: [0, -300, 0, 0], stops: [[0, 'rgba(138,107,255,0.55)'], [1, 'rgba(48,24,96,0.35)']] }, alpha: full });
    }
    for (const side of [1, -1]) {
      const cup = partial(CUP.map(([x, y]) => [x * side, y]), u);
      R.line(cup.flat(), { stroke: '#ffffff', lw: 7, glow: 1.2 * glowK, glowColor: side > 0 ? PAL.cyan : PAL.magenta });
      const hu = seg(t, draw0 + 0.3, draw1);
      if (hu > 0) R.line(partial(HANDLE.map(([x, y]) => [x * side, y]), hu).flat(), { stroke: '#ffffff', lw: 6, glow: 1.1 * glowK, glowColor: side > 0 ? PAL.cyan : PAL.magenta });
      if (u < 1) { const p = cup[cup.length - 1]; R.circle(p[0], p[1], 12, { fill: '#ffffff', glow: 2 }, 16); }
    }
    const ru = seg(t, draw1 - 0.2, draw1 + 0.3);
    if (ru > 0) for (const side of [1, -1]) R.with(TRS([0, -222, 0], [0, 0, deg(28 * side)], 1), () => {
      R.band(0, 10, 0, 60 * ru, 5, { fill: '#ffffff', glow: 0.9, glowColor: PAL.magenta });
      R.arc(0, -16, 26, 0, Math.PI * 2 * ru, { stroke: '#ffffff', lw: 5, glow: 1, glowColor: side > 0 ? PAL.cyan : PAL.magenta }, 36);
    });
    R.pop();
  }

  function winSign(R, t) {
    const on = seg(t, tSign - 0.08, tSign);
    const flick = t < tSign + 0.35 ? (Math.sin(t * 70) > -0.2 ? 1 : 0.25) : 1;
    const a = on * flick;
    if (a <= 0) return;
    R.with(TRS(P(30, 0, 11.8), [0, deg(90), 0], 0.8), () => {
      R.rrect(-470, -170, 940, 340, 40, { stroke: PAL.magenta, lw: 10, alpha: a, glow: 1.4 });
      R.rrect(-440, -140, 880, 280, 30, { stroke: '#8a6bff', lw: 4, alpha: a * 0.8, glow: 0.8 });
      R.text('WIN', 0, 0, { font: 'unb900', size: 250, align: 'center', v: 'cap', skew: 0.18, fill: 'rgba(138,107,255,0.25)', stroke: '#ffffff', lw: 5, alpha: a, glow: 1.3, glowColor: '#b38cff', tracking: 0.04 });
    });
  }

  function confetti(R, t) {
    const u = t - tSign;
    if (u < 0) return;
    R.hud(() => {
      for (let i = 0; i < 140; i++) {
        const x0 = hash(i * 3.3) * W, sp = 180 + hash(i * 7.7) * 380;
        const burst = Math.max(0, 1 - u * 1.6) * (hash(i * 9.1) - 0.5) * 900;
        const x = x0 + burst + Math.sin(u * 3 + i) * 30, y = -40 + sp * u + (hash(i * 5.5) * 300) * (1 - Math.exp(-u * 3)) - 200 * Math.exp(-u * 4) + hash(i) * 200;
        const flip = Math.cos(u * (4 + hash(i) * 8) + i);
        const c = [PAL.cyan, PAL.magenta, PAL.ball, '#8a6bff', '#ffffff'][i % 5];
        const L = 9 + hash(i * 2) * 8, ang = u * 3 + i;
        R.with([Math.cos(ang) * flip, -Math.sin(ang), 0, x, Math.sin(ang) * flip, Math.cos(ang), 0, y, 0, 0, 1, 0], () => R.rect(-L, -L * 0.45, 2 * L, L * 0.9, { fill: c, alpha: 0.95, glow: 0.4 }));
      }
    });
  }

  // tabellone in stile gioco (nomi inventati)
  function scoreboard(R, t) {
    const a = seg(t, tM + 0.15, tM + 0.35) * (1 - seg(t, tWin + 0.7, tWin + 0.95));
    if (a > 0) {
      const won = seg(t, tWin, tWin + 0.1);
      R.hud(() => {
        const x = 70, y = 70;
        const rows = [['MARCO', won > 0 ? 'GAME' : '40', true], ['LUNA.SPIN', '30', false]];
        rows.forEach(([n, sc, hero], i) => {
          const yy = y + i * 64;
          R.rrect(x, yy, 420, 56, 10, { fill: hero ? 'rgba(244,8,188,0.85)' : 'rgba(10,8,40,0.8)', alpha: a });
          R.text(n, x + 22, yy + 28, { maxW: 250, font: 'unb900', size: 24, v: 'cap', fill: '#ffffff', alpha: a });
          R.rrect(x + 300, yy + 6, 110, 44, 8, { fill: 'rgba(0,0,0,0.35)', alpha: a });
          R.text(sc, x + 355, yy + 28, { font: 'bc900i', size: 34, align: 'center', v: 'cap', fill: hero && won > 0 ? PAL.ball : '#ffffff', alpha: a, glow: hero && won > 0 ? 0.6 : 0 });
          if (hero) R.circle(x + 272, yy + 28, 7, { fill: PAL.ball, alpha: a, glow: 0.7 }, 16);
        });
      });
    }
    const g = env(t, tWin + 0.02, tWin + 0.12, tWin + 0.6, tWin + 0.8);
    if (g > 0) R.hud(() => R.text('GAME · SET · MATCH', W / 2, H * 0.5, { font: 'unb900', size: 96, align: 'center', v: 'cap', fill: '#ffffff', alpha: g, tracking: -0.02, depth: 10, depthSteps: 6,
      side: (u) => rgba(mixc(PAL.magenta, '#2a0a50', u), 1),
      per: (i) => { const u = seg(t, tWin + 0.02 + i * 0.012, tWin + 0.2 + i * 0.012); return { s: lerp(1.6, 1, E.outExpo(u)), a: seg(t, tWin + 0.02 + i * 0.012, tWin + 0.06 + i * 0.012) }; } }));
  }

  // il protagonista (personaggio ufficiale) entra in primo piano ed esulta mentre si accende WIN
  function hero(R, t) {
    const k = seg(t, tSign - 0.12, tSign + 0.3);
    if (k <= 0) return;
    const u = E.outBack(k, 1.3);
    const drift = (t - tSign) * 12;
    R.hud(() => R.with(T(470 - drift, H + 230 + (1 - u) * 1300, 0), () => charCard(R, 'hero', 1180, { glow: 0.9 })));
  }

  // VS prima della partita: MARCO contro LUNA.SPIN, la sfida del tabellone
  function versus(R, t) {
    if (t >= tM + 0.05) return;
    const a = seg(t, t0, t0 + 0.12);
    R.hud(() => {
      R.rect(0, 0, W, H, { fill: { lin: [0, 0, W, H], stops: [[0, '#1a0b52'], [0.5, '#0b0624'], [1, '#3a0b45']] }, alpha: a });
      const cut = E.outExpo(seg(t, t0, t0 + 0.3));
      R.poly([W * 0.5 + 180, 0, W, 0, W, H, W * 0.5 - 180, H], { fill: 'rgba(244,8,188,0.18)', alpha: a * cut });
      R.band(W / 2 + 180 * cut, -20, W / 2 - 180 * cut, H + 20, 8, { fill: '#ffffff', alpha: a, glow: 1.2, glowColor: PAL.magenta });
      const inL = E.outExpo(seg(t, t0 + 0.05, t0 + 0.4)), inR = E.outExpo(seg(t, t0 + 0.12, t0 + 0.47));
      R.with(T(560 - (1 - inL) * 500, H + 120, 0), () => charCard(R, 'hero', 1050, { glow: 0.8 }));
      R.with(T(1380 + (1 - inR) * 500, H + 120, 0), () => charCard(R, 'opp', 1050, { glow: 0.8 }));
      const k = E.outBack(seg(t, t0 + 0.3, t0 + 0.55), 2.2);
      R.with([k, 0, 0, W / 2, 0, k, 0, H * 0.46, 0, 0, 1, 0], () => R.text('VS', 0, 0, { font: 'unb900', size: 200, align: 'center', v: 'cap', skew: 0.18, fill: '#ffffff', depth: 16, depthSteps: 8,
        side: (u) => rgba(mixc(PAL.magenta, '#2a0a50', u), 1), shadow: ['rgba(0,0,0,0.5)', 30, 0, 10] }));
      const plate = (x, name, lv, col, ts, right) => {
        const u = E.outExpo(seg(t, ts, ts + 0.3));
        if (u <= 0) return;
        const w = 380, y = H - 150, xx = right ? x - w + (1 - u) * 100 : x - (1 - u) * 100;
        R.rrect(xx, y, w, 92, 14, { fill: 'rgba(8,5,26,0.8)', knock: true });
        R.rrect(xx, y, w, 92, 14, { stroke: col, lw: 2.5, glow: 0.6, glowColor: col });
        R.text(name, xx + 26, y + 36, { maxW: w - 52, font: 'unb900', size: 30, v: 'cap', fill: '#ffffff' });
        R.text(lv, xx + 26, y + 70, { maxW: w - 52, font: 'mono800', size: 18, v: 'cap', fill: col, tracking: 0.14 });
      };
      plate(110, 'MARCO', 'LV 30 · TESSERATO', PAL.ball, t0 + 0.4, false);
      plate(W - 110, 'LUNA.SPIN', 'LV 21 · ROMA', PAL.magenta, t0 + 0.45, true);
      R.text('FITP eSERIES BY BMW · PRIMO TURNO', W / 2, 90, { font: 'mono800', size: 24, align: 'center', v: 'cap', fill: PAL.cyan, alpha: seg(t, t0 + 0.35, t0 + 0.55), tracking: 0.2 });
    });
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    sky(R, 0.7);
    towers(R, 0, 1);
    crowd(R, t, 0, 1, { z0: 13, rows: 9, span: 70 });
    crowd(R, t, 0, 1, { z0: -13 - 9 * 1.4, rows: 9, span: 70 });
    court(R, 0, 0, 1, { surf: 'night' });
    winSign(R, t);
    rally(R, t);
    winSplash(R, t);
    trophy(R, t);
    hero(R, t);
    confetti(R, t);
    scoreboard(R, t);
    const inA = 1 - seg(t, tM, tM + 0.22);
    if (inA > 0) R.hud(() => R.rect(0, 0, W, H, { fill: '#ffffff', alpha: inA * 0.9 }));
    versus(R, t);
    const out = E.inCubic(seg(t, t1 - 0.22, t1));
    if (out > 0) R.hud(() => R.rect(0, 0, W, H, { fill: '#ffffff', alpha: out }));
  }

  function fx(t) {
    const f = {};
    if (t < tWin) f.mb = 6;
    if (t >= tWin && t < tWin + 0.8) f.mb = 7;
    if (t >= tWin && t < tWin + 0.3) { const u = (t - tWin) / 0.3; f.flash = [PAL.ball, 0.25 * (1 - u)]; f.ca = 0.01 * (1 - u); }
    if (t >= tSign && t < tSign + 0.3) { const u = (t - tSign) / 0.3; f.flash = [PAL.magenta, 0.3 * (1 - u)]; f.ca = 0.008 * (1 - u); }
    return f;
  }

  return { t0, t1, draw, fx };
}
