// 05 · TESSERA ESPORTS FITP e vantaggi
// 05a (0:24): la tessera è l'unico elemento in scena. Scende appesa al suo laccetto come un pass da evento e oscilla;
//      la pallina la colpisce e la accende. Sotto: «RICHIEDI LA TESSERA E-SPORTS» e, in seconda gerarchia,
//      «IL PASS PER ACCEDERE AI TORNEI UFFICIALI». Nessun altro elemento.
// 05b (0:27): «SCOPRI TUTTI I VANTAGGI» e quattro riquadri illustrati, testi centrati. Nel riquadro degli oggetti
//      esclusivi ci sono gli oggetti veri di Tennis Clash (racchetta e corda eSports FITP): mostrano cosa si ottiene.
//      La pallina tocca i riquadri uno dopo l'altro: ogni riquadro compare quando viene toccato.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, TRS, T, RZ, mmul, rgba } from '../engine/math.js';
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
  const tDrop = t0 + 0.05, tHang = t0 + 0.6;   // la tessera scende sul laccetto
  const tHit = t0 + 0.7;                        // la pallina la accende
  const tUp = t0 + 3.0;                         // il pass risale, arrivano i vantaggi
  const tB = t0 + 3.3;
  const HITS = [0, 1, 2, 3].map((i) => tB + 0.55 + i * 0.28);
  const topC = (i) => [tileX(i) + TW / 2, TY + 6, 26];
  const path = segPath([
    [tHit - 0.35, tHit, [W / 2 + 420, -120, 18], [W / 2, 470, 40], 0, E.inQuad],
    [HITS[0] - 0.3, HITS[0], [-120, 120, 20], topC(0), 60, E.lin],
    [HITS[0], HITS[1], topC(0), topC(1), 110, E.lin],
    [HITS[1], HITS[2], topC(1), topC(2), 110, E.lin],
    [HITS[2], HITS[3], topC(2), topC(3), 110, E.lin],
    [HITS[3], HITS[3] + 0.4, topC(3), [W + 140, 120, 22], 100, E.lin],
  ]);

  // pass appeso: tutto (laccetto, gancio, tessera) oscilla attorno al punto d'aggancio sopra il quadro
  const PIV = -900;
  function swing(t) {
    const dt = Math.max(0, t - tHang), dh = Math.max(0, t - tHit);
    return deg(5 * Math.exp(-dt * 1.6) * Math.sin(dt * 5.2) + 3.5 * Math.exp(-dh * 1.4) * Math.sin(dh * 5.6));
  }

  function pass(R, t) {
    const down = E.outBack(seg(t, tDrop, tHang), 1.2), up = E.inBack(seg(t, tUp, tUp + 0.45), 1.4);
    const dy = lerp(-900, 0, down) - up * 1100;
    R.push(mmul(mmul(T(0, PIV + dy, 0), RZ(swing(t))), T(0, -PIV, 0)));
    // laccetto: due nastri che salgono fuori dal quadro
    for (const sgn of [-1, 1]) {
      R.poly([sgn * 150, -1000, sgn * 196, -1000, sgn * 44, -300, sgn * 4, -300], { fill: { lin: [0, -1000, 0, -300], stops: [[0, BR.violet], [1, BR.magenta]] } });
      R.line([sgn * 172, -1000, sgn * 24, -300], { stroke: '#ffffff', lw: 1.5, alpha: 0.25 });
    }
    // gancio metallico
    R.circle(0, -300, 20, { stroke: '#dcd6ee', lw: 6 }, 32);
    R.rrect(-16, -300, 32, 34, 6, { fill: '#bdb6d6' });
    R.push(TRS([0, -70, 0], [deg(3 * Math.sin(t * 1.1)), deg(8 * Math.sin(t * 0.8)), 0], 1.8));
    card(R, t, { flash: 1 - seg(t, tHit, tHit + 0.5) });
    // asola del pass
    R.rrect(-22, -110, 44, 9, 4.5, { fill: '#0b0624' });
    R.pop();
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
    if (t < tB + 0.2) pass(R, t);
    impact(R, W / 2, 470, seg(t, tHit, tHit + 0.7), { scale: 2.2, col: BR.magenta });
    // 05a: messaggio sotto il pass
    kin(R, [{ s: 'RICHIEDI LA TESSERA E-SPORTS', size: 84 }], W / 2, 810, t, tHang - 0.05, tUp - 0.1, { align: 'center', stagger: 0.014 });
    kin(R, [{ s: 'IL PASS PER ACCEDERE AI TORNEI UFFICIALI', size: 40, font: 'glySB', col: BR.cyan, tracking: 0.03 }], W / 2, 910, t, tHit + 0.25, tUp - 0.1, { align: 'center', stagger: 0.008 });
    // 05b: vantaggi
    kin(R, [{ s: 'SCOPRI TUTTI I VANTAGGI', size: 84 }], W / 2, 170, t, tB, t1 - 0.3, { align: 'center', stagger: 0.014 });
    R.hud(() => {
      // corpo del testo uguale per tutti i riquadri: il più grande che sta in ogni riquadro
      const inner = TW - 56;
      const fs = Math.min(40, ...TILES.flatMap((T_) => T_.lines.map((l) => (40 * inner) / R.measure(l, 'glyB', 40, 0))));
      TILES.forEach((T_, i) => {
        const th = HITS[i];
        const u = E.outBack(seg(t, th - 0.02, th + 0.35), 1.7), a = seg(t, th - 0.02, th + 0.08) * (1 - seg(t, t1 - 0.3, t1));
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
    if (t < tHang + 0.1 || (t > tUp && t < tB + 0.4)) g.mb = 7;
    if (t >= tHit && t < tHit + 0.25) { const u = (t - tHit) / 0.25; g.flash = [BR.magenta, 0.3 * (1 - u)]; }
    return g;
  }

  return { t0, t1, draw, fx };
}
