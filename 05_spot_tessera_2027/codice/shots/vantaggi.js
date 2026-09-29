// 06 · TESSERA E-SPORTS FITP e vantaggi
// 06a: la pallina cade al centro e «accende» la tessera, che entra ruotando ed è il punto focale della scena.
//      Titolo «TESSERA E-SPORTS FITP» sopra; accanto, collegati alla tessera da fasci di luce, i due vantaggi principali:
//      «Tornei eSports ufficiali» e «Grandi eventi» con icona sconto e «fino al 10%*». Nota legale in basso.
// 06b: (disposizione della v4) la tessera si sposta a sinistra, a destra la griglia 2×2 degli altri vantaggi sotto
//      «E con la tessera anche…». La pallina esce dalla tessera e rimbalza sulle quattro card nell'ordine di lettura:
//      ogni card compare quando viene toccata.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, TRS, T, rgba } from '../engine/math.js';
import { BR, brandBg, kin, ptext } from './type.js';
import { stage } from './mondo.js';
import { card } from './card.js';
import { icon } from './mfui.js';
import { flyBall, impact, segPath, arc } from './ball.js';

export const CAM = { eye: [0, 0, -1600], f: 1600 };
const LEGAL = '*Fino al 10% sui biglietti e fino al 5% sugli abbonamenti. Valido per chi ha partecipato ad almeno un torneo eSports FITP.';
const GRID = [
  { lines: ['Loyalty Program', 'FITP'], ic: 'star' },
  { lines: ['Sconti dai', 'partner'], ic: 'tag' },
  { lines: ['SuperTennis+'], ic: 'play' },
  { lines: ['Oggetti esclusivi', 'su Tennis Clash'], ic: 'gift' },
];
const GX = 980, GY = 320, CWD = 420, CHT = 246, GG = 26;
const cellXY = (i) => [GX + (i % 2) * (CWD + GG), GY + Math.floor(i / 2) * (CHT + GG)];

// icone dei vantaggi (tratto pieno, colori del brand)
function bicon(R, kind, x, y, s, c, a) {
  const st = { stroke: c, lw: s * 0.1, alpha: a };
  if (kind === 'trophy' || kind === 'star') return icon(R, kind, x, y, s, c, a);
  if (kind === 'discount') {
    // cartellino con il simbolo di percentuale
    R.poly([x - s * 0.5, y - s * 0.2, x - s * 0.2, y - s * 0.5, x + s * 0.5, y - s * 0.5, x + s * 0.5, y + s * 0.5, x - s * 0.2, y + s * 0.5, x - s * 0.5, y + s * 0.2], { fill: c, alpha: a });
    R.circle(x - s * 0.22, y, s * 0.07, { fill: BR.night, alpha: a }, 12);
    R.line([x + s * 0.32, y - s * 0.3, x + s * 0.02, y + s * 0.3], { stroke: BR.night, lw: s * 0.08, alpha: a });
    R.circle(x + s * 0.06, y - s * 0.2, s * 0.08, { stroke: BR.night, lw: s * 0.06, alpha: a }, 12);
    R.circle(x + s * 0.28, y + s * 0.2, s * 0.08, { stroke: BR.night, lw: s * 0.06, alpha: a }, 12);
    return;
  }
  if (kind === 'tag') {
    R.poly([x - s * 0.45, y - s * 0.45, x + s * 0.05, y - s * 0.45, x + s * 0.5, y, x + s * 0.05, y + s * 0.45, x - s * 0.45, y + s * 0.45], st);
    R.circle(x - s * 0.2, y - s * 0.2, s * 0.08, { fill: c, alpha: a }, 12);
    return;
  }
  if (kind === 'play') {
    R.rrect(x - s * 0.5, y - s * 0.36, s, s * 0.72, s * 0.14, st);
    R.poly([x - s * 0.12, y - s * 0.18, x + s * 0.2, y, x - s * 0.12, y + s * 0.18], { fill: c, alpha: a });
    return;
  }
  if (kind === 'gift') {
    R.rrect(x - s * 0.42, y - s * 0.12, s * 0.84, s * 0.56, s * 0.06, st);
    R.rrect(x - s * 0.48, y - s * 0.3, s * 0.96, s * 0.2, s * 0.05, st);
    R.band(x, y - s * 0.3, x, y + s * 0.44, s * 0.1, { fill: c, alpha: a });
    R.arc(x - s * 0.14, y - s * 0.36, s * 0.13, Math.PI * 0.2, Math.PI * 1.9, st, 14);
    R.arc(x + s * 0.14, y - s * 0.36, s * 0.13, Math.PI * 1.1, Math.PI * 2.8, st, 14);
  }
}

export function vantaggi(S, TL) {
  const f = S.f, t0 = f.t0, t1 = f.t1;
  const tHit = t0 + 0.35;          // la pallina accende la tessera
  const tL = t0 + 1.0, tR = t0 + 1.25;   // vantaggi principali
  const tB = t0 + 3.35;            // 06b: la tessera va a sinistra, arriva la griglia
  const tBall = tB + 0.55;         // la pallina esce dalla tessera e tocca le card
  const HITS = [0, 1, 2, 3].map((i) => tBall + 0.3 + i * 0.3);
  const cellC = (i) => { const [x, y] = cellXY(i); return [x + CWD / 2, y + 40, 26]; };
  const path = segPath([
    [t0 - 0.05, tHit, [W / 2 + 30, -120, 16], [W / 2, 540, 40], 0, E.inQuad],
    [tBall, HITS[0], [720, 560, 20], cellC(0), 140, E.lin],
    [HITS[0], HITS[1], cellC(0), cellC(1), 110, E.lin],
    [HITS[1], HITS[2], cellC(1), cellC(2), 90, E.lin],
    [HITS[2], HITS[3], cellC(2), cellC(3), 110, E.lin],
    [HITS[3], HITS[3] + 0.45, cellC(3), [W + 140, 960, 30], 120, E.inQuad],
  ]);

  function tesPose(t) {
    const u = E.outBack(seg(t, tHit, tHit + 0.6), 1.3);
    const m = E.inOutCubic(seg(t, tB, tB + 0.55));
    const idle = seg(t, tHit + 0.5, tHit + 1.0);
    return TRS([lerp(0, -470, m), lerp(20, 30, m), 0], [deg(5 * Math.sin(t * 1.1)) * idle, deg(8 * Math.sin(t * 0.8)) * idle + (1 - E.outCubic(seg(t, tHit, tHit + 0.6))) * Math.PI * 3, deg(-2) * idle], Math.max(0.01, u) * lerp(1.75, 1.45, m));
  }

  // pannello di un vantaggio principale (vetro scuro, bordo ciano→magenta), cresce dalla tessera
  function panel(R, t, cx, tin, draw) {
    const u = E.outExpo(seg(t, tin, tin + 0.5)), a = seg(t, tin, tin + 0.15) * (1 - seg(t, tB - 0.1, tB + 0.2));
    if (a <= 0) return;
    const x = lerp(W / 2, cx, u), w = 470, h = 330, y = 560;
    R.with([lerp(0.4, 1, u), 0, 0, x * (1 - lerp(0.4, 1, u)), 0, lerp(0.4, 1, u), 0, y * (1 - lerp(0.4, 1, u)), 0, 0, 1, 0], () => {
      R.rrect(x - w / 2, y - h / 2, w, h, 30, { fill: 'rgba(20,12,48,0.9)', alpha: a, knock: true, shadow: ['rgba(0,0,0,0.45)', 30, 0, 12] });
      R.rrect(x - w / 2, y - h / 2, w, h, 30, { stroke: { screenLin: [x - w / 2, 0, x + w / 2, 0], stops: [[0, BR.cyan], [1, BR.magenta]] }, lw: 2.5, alpha: a, glow: 0.6 });
      draw(x, y, a);
    });
  }

  function draw(R, t) {
    brandBg(R, t);
    stage(R, t, 0.5);
    // fasci di luce tessera → vantaggi (06a)
    const beam = seg(t, tL + 0.2, tR + 0.5) * (1 - seg(t, tB - 0.1, tB + 0.2));
    if (beam > 0) R.hud(() => {
      for (const [x0, x1] of [[660, 565], [1260, 1355]]) {
        R.band(x0, 560, x1, 560, 3, { fill: '#ffffff', alpha: beam * 0.7, glow: 1, glowColor: BR.cyan });
        const p = ((t * 1.6) % 1);
        R.circle(lerp(x0, x1, p), 560, 6, { fill: '#ffffff', alpha: beam, glow: 1.4 }, 16);
      }
    });
    const cam = new Cam();
    cam.look(CAM.eye, [0, 0, 0], 0, CAM.f);
    R.setCam(cam);
    if (t >= tHit) {
      R.push(tesPose(t));
      card(R, t, { flash: 1 - seg(t, tHit, tHit + 0.5) });
      R.pop();
    }
    impact(R, W / 2, 540, seg(t, tHit, tHit + 0.7), { scale: 2.4, col: BR.magenta });
    // titolo: il nome esatto della tessera
    kin(R, [{ s: 'TESSERA E-SPORTS FITP', size: 92 }], W / 2, 190, t, tHit + 0.15, tB - 0.15, { align: 'center', stagger: 0.018 });
    R.hud(() => {
      panel(R, t, 330, tL, (x, y, a) => {
        R.circle(x, y - 80, 50, { fill: rgba(BR.violet, 0.3), alpha: a }, 40);
        bicon(R, 'trophy', x, y - 80, 58, BR.cyan, a);
        R.text('Tornei eSports', x, y + 30, { font: 'glyB', size: 50, align: 'center', v: 'cap', fill: BR.white, alpha: a, maxW: 430 });
        R.text('ufficiali', x, y + 92, { font: 'glyB', size: 50, align: 'center', v: 'cap', fill: BR.white, alpha: a, maxW: 430 });
      });
      panel(R, t, 1590, tR, (x, y, a) => {
        R.circle(x, y - 90, 50, { fill: rgba(BR.magenta, 0.25), alpha: a }, 40);
        bicon(R, 'discount', x, y - 90, 56, BR.cyan, a);
        R.text('Grandi eventi', x, y + 10, { font: 'glyB', size: 50, align: 'center', v: 'cap', fill: BR.white, alpha: a, maxW: 430 });
        R.text('fino al 10%*', x, y + 88, { font: 'glyB', size: 66, align: 'center', v: 'cap', fill: BR.cyan, alpha: a, glow: 0.35, maxW: 430 });
      });
      // 06b: griglia 2×2 dei vantaggi (disposizione della v4)
      const ha = seg(t, tB + 0.3, tB + 0.6) * (1 - seg(t, t1 - 0.3, t1));
      if (ha > 0) R.text('E con la tessera anche...', GX, GY - 50, { font: 'glySB', size: 32, v: 'cap', fill: BR.cyan, alpha: ha, tracking: 0.02 });
      // didascalia sotto la tessera, quando si sposta a sinistra
      if (ha > 0) R.text('TESSERA E-SPORTS FITP', 490, 860, { font: 'glyB', size: 40, align: 'center', v: 'cap', fill: BR.white, alpha: ha, maxW: 620 });
      // fascio tessera → griglia
      if (ha > 0) R.band(760, 572, GX - 20, 572, 3, { fill: '#ffffff', alpha: ha * 0.5 * seg(t, tBall, tBall + 0.3), glow: 1, glowColor: BR.magenta });
      GRID.forEach((g, i) => {
        const th = HITS[i];
        const u = E.outBack(seg(t, th - 0.02, th + 0.35), 1.8), a = seg(t, th - 0.02, th + 0.08) * (1 - seg(t, t1 - 0.3, t1));
        if (a <= 0) return;
        const [x, y] = cellXY(i), k = lerp(0.6, 1, u), cx = x + CWD / 2, cy = y + CHT / 2;
        const lit = env(t, th, th + 0.05, th + 0.1, th + 0.6);
        R.with([k, 0, 0, cx * (1 - k), 0, k, 0, cy * (1 - k), 0, 0, 1, 0], () => {
          R.rrect(x, y, CWD, CHT, 24, { fill: 'rgba(20,12,48,0.9)', alpha: a, knock: true, shadow: ['rgba(0,0,0,0.4)', 24, 0, 10] });
          R.rrect(x, y, CWD, CHT, 24, { stroke: i % 3 === 0 ? BR.cyan : BR.magenta, lw: 2 + lit * 2, alpha: a, glow: 0.5 + lit });
          R.circle(x + 62, y + 62, 36, { fill: rgba(i % 3 === 0 ? BR.violet : BR.magenta, 0.28), alpha: a }, 32);
          bicon(R, g.ic, x + 62, y + 62, 40, BR.cyan, a);
          g.lines.forEach((ln, j) => ptext(R, ln, x + 32, y + 146 + j * 48 - (g.lines.length === 1 ? 22 : 0), { font: 'glyB', size: 37, v: 'cap', fill: BR.white, alpha: a, maxW: CWD - 56 }));
        });
      });
      // nota legale (riferita a «fino al 10%*»)
      const na = seg(t, tR + 0.3, tR + 0.6) * (1 - seg(t, tB - 0.1, tB + 0.2));
      if (na > 0) R.text(LEGAL, W / 2, H - 42, { font: 'glyR', size: 20, align: 'center', v: 'cap', fill: BR.muted, alpha: na * 0.9, maxW: W - 140 });
    });
    HITS.forEach((th, i) => { const [x, y] = cellC(i); impact(R, x, y, seg(t, th, th + 0.45), { scale: 0.7, col: i % 3 === 0 ? BR.cyan : BR.magenta, sparks: 8, seed: i }); });
    // la pallina che cade si «spegne» dentro la tessera; quella della griglia esce dalla tessera
    flyBall(R, (tt) => (tt > tHit - 0.01 && tt < tBall ? null : path(tt)), t, { trail: 0.14 });
  }

  function fx(t) {
    const g = { grain: 0.04 };
    if (t < tHit + 0.5) g.mb = 7;
    if (t > tB && t < tB + 0.6) g.mb = 7;
    if (t >= tHit && t < tHit + 0.25) { const u = (t - tHit) / 0.25; g.flash = [BR.magenta, 0.3 * (1 - u)]; }
    return g;
  }

  return { t0, t1, draw, fx };
}
