// 05 · TESSERA ESPORTS FITP e vantaggi
// 05a: la tessera è l'unico elemento in scena, trattata come una carta da gioco rara: sale dal basso girando su sé stessa,
//      si posa fluttuando con riflesso olografico, alone e raggi alle spalle; la pallina la colpisce e la accende.
//      Sotto: «RICHIEDI LA TESSERA E-SPORTS» e, in seconda gerarchia, «IL PASS PER ACCEDERE AI TORNEI UFFICIALI».
// 05b: «SCOPRI TUTTI I VANTAGGI» e quattro riquadri illustrati, testi centrati. Nel riquadro degli oggetti
//      esclusivi ci sono gli oggetti veri di Tennis Clash (racchetta e corda eSports FITP): mostrano cosa si ottiene.
//      La pallina tocca i riquadri uno dopo l'altro: ogni riquadro compare quando viene toccato.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, TRS, T, rgba } from '../engine/math.js';
import { BR, brandBg, kin, ptext } from './type.js';
import { stage } from './mondo.js';
import { card } from './card.js';
import { icon } from './mfui.js';
import { flyBall, impact, segPath } from './ball.js';

export const CAM = { eye: [0, 0, -1600], f: 1600 };
const LEGAL = 'Sconti fino al 10% sui biglietti e fino al 5% sugli abbonamenti, validi per chi ha partecipato ad almeno un torneo eSports FITP.';
const TILES = [
  { lines: ['SCONTI SUI', 'GRANDI EVENTI'], vis: 'discount' },
  { lines: ['OGGETTI', 'ESCLUSIVI SU', 'TENNIS CLASH'], vis: 'items' },
  { lines: ['LOYALTY', 'PROGRAM'], vis: 'star' },
  { lines: ['ACCESSO A', 'SUPERTENNIS+'], vis: 'play' },
];
const TW = 430, TH = 540, TG = 24, TX0 = (W - (4 * TW + 3 * TG)) / 2, TY = 280;
const tileX = (i) => TX0 + i * (TW + TG);

// icone dei vantaggi (tratto pieno, colori del brand)
function bicon(R, kind, x, y, s, c, a) {
  const st = { stroke: c, lw: s * 0.09, alpha: a };
  if (kind === 'star') return icon(R, 'star', x, y, s, c, a);
  if (kind === 'discount') {
    R.poly([x - s * 0.5, y - s * 0.2, x - s * 0.2, y - s * 0.5, x + s * 0.5, y - s * 0.5, x + s * 0.5, y + s * 0.5, x - s * 0.2, y + s * 0.5, x - s * 0.5, y + s * 0.2], { fill: c, alpha: a });
    R.circle(x - s * 0.22, y, s * 0.07, { fill: BR.night, alpha: a }, 12);
    R.line([x + s * 0.32, y - s * 0.3, x + s * 0.02, y + s * 0.3], { stroke: BR.night, lw: s * 0.08, alpha: a });
    R.circle(x + s * 0.06, y - s * 0.2, s * 0.08, { stroke: BR.night, lw: s * 0.06, alpha: a }, 12);
    R.circle(x + s * 0.28, y + s * 0.2, s * 0.08, { stroke: BR.night, lw: s * 0.06, alpha: a }, 12);
    return;
  }
  if (kind === 'play') {
    R.rrect(x - s * 0.5, y - s * 0.36, s, s * 0.72, s * 0.14, st);
    R.poly([x - s * 0.12, y - s * 0.18, x + s * 0.2, y, x - s * 0.12, y + s * 0.18], { fill: c, alpha: a });
  }
}

export function vantaggi(S, TL) {
  const f = S.f, t0 = f.t0, t1 = f.t1;
  const tIn = t0, tLand = t0 + 0.6;             // la carta sale e si posa
  const tHit = t0 + 0.62;                        // la pallina la accende
  const tUp = t0 + 2.1;                          // la carta esce, arrivano i vantaggi
  const tB = t0 + 2.35;
  const HITS = [0, 1, 2, 3].map((i) => tB + 0.4 + i * 0.22);
  const topC = (i) => [tileX(i) + TW / 2, TY + 6, 26];
  const path = segPath([
    [tHit - 0.3, tHit, [W / 2 + 420, -120, 18], [W / 2, 440, 40], 0, E.inQuad],
    [HITS[0] - 0.25, HITS[0], [-120, 120, 20], topC(0), 60, E.lin],
    [HITS[0], HITS[1], topC(0), topC(1), 110, E.lin],
    [HITS[1], HITS[2], topC(1), topC(2), 110, E.lin],
    [HITS[2], HITS[3], topC(2), topC(3), 110, E.lin],
    [HITS[3], HITS[3] + 0.4, topC(3), [W + 140, 120, 22], 100, E.lin],
  ]);

  // la tessera come carta da gioco: entra dal basso con un giro completo, si posa e fluttua; poi esce verso l'alto
  function gcard(R, t) {
    const u = E.outBack(seg(t, tIn, tLand), 1.3), o = E.inBack(seg(t, tUp, tUp + 0.35), 1.4);
    const idle = seg(t, tLand, tLand + 0.4);
    const y = lerp(700, -100, u) - o * 900 + Math.sin(t * 1.6) * 8 * idle;
    const spin = (1 - E.outCubic(seg(t, tIn, tLand))) * Math.PI * 2;
    R.push(TRS([0, y, lerp(500, 0, u)], [deg(-6 * Math.sin(t * 1.1)) * idle, deg(10 * Math.sin(t * 0.8)) * idle + spin, deg(-2 * Math.sin(t * 0.7)) * idle], 1.9 * lerp(0.6, 1, u)));
    // alone della carta
    R.with(T(0, 0, 20), () => R.rrect(-190, -130, 380, 260, 30, { fill: BR.violet, alpha: 0.35 * idle * (1 - o), blur: 50, glow: 0.8 }));
    card(R, t, { flash: env(t, tHit - 0.02, tHit, tHit, tHit + 0.45) });
    R.pop();
  }

  function tileVisual(R, t, i, cx, cy, a) {
    R.circle(cx, cy, 120, { fill: { rad: [cx, cy, 120], stops: [[0, rgba(i % 2 ? BR.magenta : BR.violet, 0.35)], [1, 'rgba(0,0,0,0)']] }, alpha: a }, 48);
    const k = TILES[i].vis, bob = Math.sin(t * 1.4 + i) * 4;
    if (k === 'items') {
      // gli oggetti esclusivi veri: racchetta e corda eSports FITP di Tennis Clash
      const rh = 270, rw = rh * (625 / 808);
      R.with(TRS([cx - 30, cy + bob, 0], [0, 0, deg(-6)], 1), () => {
        R.rrect(-rw / 2 - 4, -rh / 2 - 4, rw + 8, rh + 8, 22, { stroke: { screenLin: [cx - rw / 2, 0, cx + rw / 2, 0], stops: [[0, BR.cyan], [1, BR.magenta]] }, lw: 3, alpha: a, glow: 0.5 });
        R.clipPoly(R.rrPts(-rw / 2, -rh / 2, rw, rh, 18));
        R.image(R.img.tc_racket, -rw / 2, -rh / 2, rw, rh, { sub: 4, alpha: a });
        R.unclip();
      });
      R.image(R.img.tc_string, cx + 36, cy + 14 - bob, 138, 138, { sub: 3, alpha: a });
    } else bicon(R, k, cx, cy + bob, 150, BR.cyan, a);
  }

  function draw(R, t) {
    brandBg(R, t);
    stage(R, t, 0.5);
    const cam = new Cam();
    cam.look(CAM.eye, [0, 0, 0], 0, CAM.f);
    R.setCam(cam);
    // raggi alle spalle della carta (rivelazione), solo finché la carta è in scena
    const ra = seg(t, tLand - 0.1, tLand + 0.3) * (1 - seg(t, tUp, tUp + 0.3));
    if (ra > 0) R.hud(() => {
      for (let i = 0; i < 18; i++) {
        const ang = (i / 18) * Math.PI * 2 + t * 0.15, w = 0.05;
        R.poly([W / 2, 440, W / 2 + Math.cos(ang - w) * 1200, 440 + Math.sin(ang - w) * 1200, W / 2 + Math.cos(ang + w) * 1200, 440 + Math.sin(ang + w) * 1200], { fill: { rad: [W / 2, 440, 900], stops: [[0, rgba(i % 2 ? BR.magenta : BR.cyan, 0.22 * ra)], [1, 'rgba(0,0,0,0)']] }, blend: 'lighter' });
      }
    });
    if (t < tB + 0.2) gcard(R, t);
    impact(R, W / 2, 440, seg(t, tHit, tHit + 0.7), { scale: 2.2, col: BR.magenta });
    // 05a: messaggio sotto il pass
    kin(R, [{ s: 'RICHIEDI LA TESSERA E-SPORTS', size: 84 }], W / 2, 790, t, tLand - 0.2, tUp - 0.1, { align: 'center', stagger: 0.014 });
    kin(R, [{ s: 'IL PASS PER ACCEDERE AI TORNEI UFFICIALI', size: 40, font: 'glySB', col: BR.cyan, tracking: 0.03 }], W / 2, 890, t, tHit + 0.1, tUp - 0.1, { align: 'center', stagger: 0.008 });
    // 05b: vantaggi
    kin(R, [{ s: 'SCOPRI TUTTI I VANTAGGI', size: 84 }], W / 2, 170, t, tB, t1 - 0.3, { align: 'center', stagger: 0.014 });
    R.hud(() => {
      // corpo del testo uguale per tutti i riquadri: il più grande che sta in ogni riquadro
      const inner = TW - 56;
      const fs = Math.min(40, ...TILES.flatMap((T_) => T_.lines.map((l) => (40 * inner) / R.measure(l, 'glyB', 40, 0))));
      TILES.forEach((T_, i) => {
        const th = HITS[i];
        const u = E.outBack(seg(t, th - 0.02, th + 0.3), 1.7), a = seg(t, th - 0.02, th + 0.08) * (1 - seg(t, t1 - 0.3, t1));
        if (a <= 0) return;
        const x = tileX(i), cx = x + TW / 2, cy = TY + TH / 2, k = lerp(0.7, 1, u);
        const lit = env(t, th, th + 0.05, th + 0.1, th + 0.6);
        R.with([k, 0, 0, cx * (1 - k), 0, k, 0, cy * (1 - k), 0, 0, 1, 0], () => {
          R.rrect(x, TY, TW, TH, 30, { fill: 'rgba(20,12,48,0.92)', alpha: a, knock: true, shadow: ['rgba(0,0,0,0.45)', 30, 0, 12] });
          R.rrect(x, TY, TW, TH, 30, { stroke: { screenLin: [x, 0, x + TW, 0], stops: [[0, BR.cyan], [1, BR.magenta]] }, lw: 2.5 + lit * 2, alpha: a, glow: 0.5 + lit });
          tileVisual(R, t, i, cx, TY + 165, a);
          R.band(x + 60, TY + 330, x + TW - 60, TY + 330, 1.5, { fill: '#ffffff', alpha: a * 0.15 });
          const n = T_.lines.length, lh = fs * 1.24, y0 = TY + 435 - ((n - 1) * lh) / 2;
          T_.lines.forEach((ln, j) => ptext(R, ln, cx, y0 + j * lh, { font: 'glyB', size: fs, align: 'center', v: 'cap', fill: BR.white, alpha: a }));
        });
      });
      const na = seg(t, HITS[3], HITS[3] + 0.3) * (1 - seg(t, t1 - 0.3, t1));
      if (na > 0) R.text(LEGAL, W / 2, H - 44, { font: 'glyR', size: 20, align: 'center', v: 'cap', fill: BR.muted, alpha: na * 0.9, maxW: W - 140 });
    });
    HITS.forEach((th, i) => { const [x, y] = topC(i); impact(R, x, y, seg(t, th, th + 0.45), { scale: 0.7, col: i % 2 ? BR.magenta : BR.cyan, sparks: 8, seed: i }); });
    flyBall(R, (tt) => (tt > tHit - 0.01 && tt < HITS[0] - 0.3 ? null : path(tt)), t, { trail: 0.14 });
  }

  function fx(t) {
    const g = { grain: 0.04 };
    if (t < tLand + 0.1 || (t > tUp && t < tB + 0.4)) g.mb = 7;
    if (t >= tHit && t < tHit + 0.25) { const u = (t - tHit) / 0.25; g.flash = [BR.magenta, 0.3 * (1 - u)]; }
    return g;
  }

  return { t0, t1, draw, fx };
}
