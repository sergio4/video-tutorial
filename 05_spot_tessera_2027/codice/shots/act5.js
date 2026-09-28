// SCENA 10 · «Scendi in campo da atleta federale.»
// Uscita dal tunnel in soggettiva: siamo noi il protagonista, racchetta in mano, la nostra ombra lunga sul campo,
// l'insegna FITP sulla curva. Scatto in avanti fino a rete: si accendono i fari e parte il faccia a faccia
// MARCO contro LUNA.SPIN (personaggi ufficiali Tennis Clash) con VS in stile gioco. In chiusura i fari sparano bianco.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T } from '../engine/math.js';
import { PAL } from '../engine/kit.js';
import { shake } from './common.js';
import { POSE, shadowFig, groundShadow } from './figure.js';
import { M, P, court, net, crowd, towers, sky } from './arena.js';
import { charCard } from './chars.js';

const SC = (1.86 * M) / 180;
const SLEN = 5.0; // fari alle spalle: ombra lunghissima

export function act5(S, TL) {
  const s10 = S.s10, t0 = s10.t0, t1 = s10.t1;
  const rush0 = t0 + 0.95, rush1 = t0 + 1.22; // scatto dalla soggettiva al faccia a faccia
  const tVs = t0 + 1.42;                       // VS: si accendono i fari
  const flash = t1 - 0.28;

  const heroX = (t) => lerp(-16.8, -14.2, E.outCubic(seg(t, t0, rush0)));
  const HERO = P(-2.1, 1.05, 0), OPP = P(0.7, -2.3, 0);

  function camAt(t) {
    const sh = shake(t, [[t0, 12, 0.5], [tVs, 14, 0.45]]);
    const cam = new Cam();
    const hx = heroX(t);
    const bob = Math.sin((t - t0) * 9.5) * 0.04, sway = Math.sin((t - t0) * 4.75) * 0.06;
    const povE = P(hx, 0.25 + sway, 1.7 + bob), povT = P(hx + 6, 0.25 + sway * 0.5, 0.2);
    const push = seg(t, rush1, t1);
    const vsE = P(lerp(-5.3, -4.8, push), lerp(0.1, -0.1, push), 1.45), vsT = P(0, lerp(-0.05, 0.1, push), 1.5);
    const u = E.inOutExpo(seg(t, rush0, rush1));
    const eye = povE.map((v, i) => lerp(v, vsE[i], u)), tgt = povT.map((v, i) => lerp(v, vsT[i], u));
    cam.look(eye, tgt, deg(lerp(sway * 20, lerp(-1.5, 1, push), u)), lerp(1100, 1250, u));
    cam.cx += sh[0]; cam.cy += sh[1];
    return cam;
  }

  // la nostra ombra in soggettiva: dai piedi (sotto la camera) verso la rete
  function ourShadow(R, t) {
    const a = 1 - seg(t, rush0, rush0 + 0.15);
    if (a <= 0) return;
    const step = Math.sin((t - t0) * 4.75);
    const pose = { ...POSE.back, hA: 6 + step * 12, kA: -Math.max(0, step) * 14, hB: 6 - step * 12, kB: -Math.max(0, -step) * 14, sA: 9 - step * 8, sB: 9 + step * 8 };
    R.with(groundShadow(P(heroX(t), 0.25, 0), SC, [1, 0], SLEN, Math.PI / 2), () => {
      shadowFig(R, pose, { racket: 'A' }, { alpha: 0.3 * a, blur: 10 });
      shadowFig(R, pose, { racket: 'A' }, { alpha: 0.72 * a, blur: 1.5 });
    });
  }

  // personaggio in piedi sul campo, rivolto alla camera, con ombra a terra; entra scivolando di lato
  function player(R, t, key, pos, t_in, from) {
    const u = E.outExpo(seg(t, t_in, t_in + 0.35));
    if (u <= 0) return;
    const p = [pos[0], pos[1], pos[2] + from * (1 - u) * 3 * M];
    R.with(TRS(p, [deg(-90), 0, 0], 1), () => R.circle(0, 0, 0.5 * M, { fill: '#000', alpha: 0.45 * u, blur: 8 }, 32));
    R.with(TRS(p, [0, deg(90), 0], 1), () => charCard(R, key, (key === 'opp' ? 2.0 : 1.86) * M, { alpha: u }));
  }

  // VS in stile gioco: taglio diagonale, VS che sbatte, targhette dei giocatori
  function versus(R, t) {
    const a = seg(t, tVs - 0.05, tVs + 0.05) * (1 - seg(t, flash, flash + 0.1));
    if (a <= 0) return;
    R.hud(() => {
      const k = E.outBack(seg(t, tVs, tVs + 0.3), 2.2);
      const cx = W * 0.5, cy = H * 0.5;
      // taglio diagonale di luce
      const cut = E.outExpo(seg(t, tVs - 0.05, tVs + 0.25));
      R.band(cx + 260 * cut, cy - 700 * cut, cx - 260 * cut, cy + 700 * cut, 10, { fill: '#ffffff', alpha: a * 0.9, glow: 1.2, glowColor: PAL.magenta });
      R.band(cx + 290 * cut, cy - 700 * cut, cx - 230 * cut, cy + 700 * cut, 3, { fill: PAL.cyan, alpha: a * 0.8, glow: 0.8 });
      R.with([k, 0, 0, cx, 0, k, 0, cy, 0, 0, 1, 0], () => {
        R.text('VS', 0, 0, { font: 'unb900', size: 190, align: 'center', v: 'cap', skew: 0.18, fill: '#ffffff', alpha: a, tracking: -0.04, depth: 14, depthSteps: 7,
          side: (u) => rgba(mixc(PAL.magenta, '#2a0a50', u), 1), shadow: ['rgba(0,0,0,0.5)', 30, 0, 10] });
      });
      const plate = (x, name, lv, col, t_in, right) => {
        const u = E.outExpo(seg(t, t_in, t_in + 0.3));
        if (u <= 0) return;
        const w = 380, y = H - 170, xx = right ? x - w + (1 - u) * 120 : x - (1 - u) * 120;
        R.rrect(xx, y, w, 92, 14, { fill: 'rgba(8,5,26,0.78)', alpha: a * u });
        R.rrect(xx, y, w, 92, 14, { stroke: col, lw: 2.5, alpha: a * u, glow: 0.6, glowColor: col });
        R.text(name, xx + 26, y + 36, { font: 'unb900', size: 30, v: 'cap', fill: '#ffffff', alpha: a * u });
        R.text(lv, xx + 26, y + 70, { font: 'mono800', size: 18, v: 'cap', fill: col, alpha: a * u, tracking: 0.14 });
      };
      plate(90, 'MARCO', 'LV 30 · TESSERATO FITP', PAL.ball, tVs + 0.12, false);
      plate(W - 90, 'LUNA.SPIN', 'LV 21', PAL.magenta, tVs + 0.2, true);
    });
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    const vs = seg(t, rush0, rush1);
    const lit = seg(t, tVs, tVs + 0.12);
    sky(R, 0.8 + lit * 0.2);
    crowd(R, t, cam.eye[0], 0.7 + lit * 0.3, { z0: 12, rows: 8, span: 50 });
    crowd(R, t, cam.eye[0], 0.7 + lit * 0.3, { z0: -12 - 8 * 1.4, rows: 8, span: 50 });
    towers(R, cam.eye[0], 0.6 + lit * 0.4);
    // insegna FITP sopra la curva di fronte
    const on = seg(t, t0 + 0.25, t0 + 0.5);
    R.with(TRS(P(34, 0, 12.2), [0, deg(90), 0], M), () => {
      R.text('FITP', 0, 0, { font: 'unb900', size: 5.6, align: 'center', v: 'cap', skew: 0.2, fill: '#e9f3ff', stroke: PAL.cyan, lw: 0.08, alpha: on * (0.85 + 0.15 * Math.sin(t * 40) ** 2), glow: 0.35, glowColor: '#9fd4ff', tracking: -0.02 });
    });
    court(R, 0, 0, 1, { noNet: true });
    ourShadow(R, t);
    // avversaria oltre la rete, poi la rete, poi il protagonista in primo piano
    player(R, t, 'opp', OPP, tVs - 0.12, -1);
    net(R, 0, 0, 1);
    player(R, t, 'hero', HERO, tVs - 0.2, 1);
    // fasci dei fari che si incrociano
    R.hud(() => {
      for (let i = 0; i < 6; i++) {
        const x = W * (0.1 + i * 0.16) + Math.sin(t * 0.7 + i) * 60;
        R.poly([x - 8, 0, x + 8, 0, x + 260 * (i % 2 ? 1 : -1) + 120, H * 0.8, x + 260 * (i % 2 ? 1 : -1) - 120, H * 0.8], { fill: { screenLin: [0, 0, 0, H * 0.8], stops: [[0, rgba('#c8e6ff', 0.12 + 0.08 * lit)], [1, 'rgba(200,230,255,0)']] }, blend: 'lighter' });
      }
    });
    // racchetta in mano (soggettiva): esce durante lo scatto
    const rk = 1 - vs;
    if (rk > 0) R.hud(() => {
      const bob = Math.sin((t - t0) * 9.5) * 10;
      R.with([Math.cos(-0.5), -Math.sin(-0.5), 0, W - 250, Math.sin(-0.5), Math.cos(-0.5), 0, H - 60 + bob + (1 - rk) * 400, 0, 0, 1, 0], () => {
        R.band(0, 60, 0, 420, 34, { fill: '#0b0620' });
        R.band(8, 60, 8, 420, 5, { fill: PAL.ball, alpha: 0.8, glow: 0.6 });
        R.ring(0, -120, 150, 180, { fill: '#0b0620' }, 64);
        R.arc(0, -120, 165, 0, Math.PI * 2, { stroke: PAL.ball, lw: 5, glow: 1 }, 64);
        for (let k = -5; k <= 5; k++) {
          const v = (k / 6) * 150, w = 150 * Math.sqrt(1 - (v / 150) ** 2);
          R.line([-w, -120 + v, w, -120 + v], { stroke: '#ffffff', lw: 1.5, alpha: 0.35 });
          R.line([v, -120 - w, v, -120 + w], { stroke: '#ffffff', lw: 1.5, alpha: 0.35 });
        }
      });
    });
    versus(R, t);
    const wh = 1 - E.outCubic(seg(t, t0, t0 + 0.4));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: '#ffffff', alpha: wh }));
    const fl = E.inCubic(seg(t, flash, t1));
    if (fl > 0) R.hud(() => R.rect(0, 0, W, H, { fill: '#ffffff', alpha: fl }));
  }

  function fx(t) {
    const f = {};
    if (t < t0 + 0.4) f.mb = 5;
    if (t >= rush0 && t < rush1 + 0.1) f.mb = 10;
    if (t >= tVs && t < tVs + 0.3) { const u = (t - tVs) / 0.3; f.flash = ['#ffffff', 0.3 * (1 - u)]; f.ca = 0.01 * (1 - u); }
    if (t >= flash) { f.mb = 6; f.ca = 0.01 * seg(t, flash, t1); }
    return f;
  }

  return { t0, t1, draw, fx };
}
