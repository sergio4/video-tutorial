// 04 · Tornei, finali live, montepremi: tre card editoriali in un carosello 3D, ognuna con un'immagine vera e un solo messaggio.
// 1 gameplay reale + logo FITP eSeries by BMW (tornei online, settimanali e mensili)
// 2 palco degli Internazionali BNL d'Italia eSeries (qualificati alle finali live durante i grandi eventi)
// 3 vincitore con l'assegno (oltre 20.000 euro di montepremi in palio).
// Testi centrati nell'area libera della card, blocco alzato; il corpo si adatta perché ogni riga stia nella card.
// La pallina arriva da destra e colpisce la card attiva: è il colpo che fa avanzare il carosello.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, TRS, T } from '../engine/math.js';
import { BR, brandBg, chip } from './type.js';
import { stage } from './mondo.js';
import { flyBall, impact, segPath } from './ball.js';

const CW = 1240, CH = 700, GAP = 1420;
const PINK = BR.magenta;
const CARDS = [
  { kind: 'gp', label: null, lines: [{ s: 'TORNEI ONLINE,', size: 84, col: PINK }, { s: 'SETTIMANALI E MENSILI', size: 54 }] },
  { kind: 'img', img: 'ev_ibi', label: "INTERNAZIONALI BNL D'ITALIA", lines: [{ s: 'QUALIFICATI ALLE', size: 84 }, { s: 'FINALI LIVE', size: 84, col: PINK }, { s: 'DURANTE I GRANDI EVENTI', size: 48 }], focus: [0.5, 0.42] },
  { kind: 'img', img: 'ev_win', label: null, lines: [{ s: 'OLTRE', size: 54 }, { s: '20.000 EURO', size: 124, col: PINK }, { s: 'DI MONTEPREMI IN PALIO', size: 54 }], focus: [0.55, 0.45] },
];
// area del testo nella card: la card 1 lascia libera la striscia del gameplay a destra
const GP_W = CH * (392 / 850), GP_X = CW / 2 - GP_W - 80;
const AREA = (i) => (i === 0 ? { x0: -CW / 2 + 64, x1: GP_X - 44 } : { x0: -CW / 2 + 64, x1: CW / 2 - 64 });

export function carte(S, TL) {
  const d = S.e, t0 = d.t0, t1 = d.t1, step = (t1 - t0) / 3;
  const HITS = [t0 + 0.25, t0 + step - 0.28, t0 + 2 * step - 0.28];   // v8: passaggio fra le card 0,28 s
  const HP = [W / 2 + 560, 330, 34];     // punto d'impatto: angolo alto destro della card attiva
  const path = segPath(HITS.flatMap((th) => [
    [th - 0.22, th, [W + 120, -80, 20], HP, 0, E.inQuad],
    [th, th + 0.32, HP, [W + 160, 140, 22], 90, E.outQuad],
  ]));
  // posizione del carosello: la card colpita scivola via (0,28 s) e arriva la successiva
  const pos = (t) => {
    let p = -1 + E.outExpo(seg(t, t0, t0 + 0.45));
    for (let k = 1; k < 3; k++) p += E.inOutCubic(seg(t, HITS[k], HITS[k] + 0.28));
    return p;
  };

  function cover(R, img, fx, fy, zoom) {
    const iw = img.width, ih = img.height, ar = CW / CH;
    let sw = iw, sh = iw / ar;
    if (sh > ih) { sh = ih; sw = ih * ar; }
    sw /= zoom; sh /= zoom;
    const sx = clamp(iw * fx - sw / 2, 0, iw - sw), sy = clamp(ih * fy - sh / 2, 0, ih - sh);
    R.image(img, -CW / 2, -CH / 2, CW, CH, { src: [sx, sy, sw, sh], sub: 6 });
  }

  function card(R, t, i, act) {
    const C = CARDS[i];
    R.with(T(30, 40, 50), () => R.rrect(-CW / 2, -CH / 2, CW, CH, 34, { fill: '#000', alpha: 0.5, blur: 50 }));
    R.rrect(-CW / 2, -CH / 2, CW, CH, 34, { fill: BR.night, knock: true });
    R.clipPoly(R.rrPts(-CW / 2, -CH / 2, CW, CH, 34));
    const local = t - (i === 0 ? t0 : HITS[i] + 0.2);
    if (C.kind === 'gp') {
      const fi = clamp(Math.floor(Math.max(0, t - t0 + 0.4) * 25), 0, 79);
      R.image(R.img.gpBBlur[fi], -CW / 2, -CW * (850 / 392) / 2 + 60, CW, CW * (850 / 392), { sub: 2 });
      R.rect(-CW / 2, -CH / 2, CW, CH, { fill: 'rgba(16,9,30,0.2)' });
      const gh = CH, gw = gh * (392 / 850);
      R.image(R.img.gpB[fi], GP_X, -gh / 2, gw, gh, { sub: 4 });
      R.band(CW / 2 - gw - 80, -CH / 2, CW / 2 - gw - 80, CH / 2, 3, { fill: BR.cyan, alpha: 0.6, glow: 0.6 });
      R.band(CW / 2 - 80, -CH / 2, CW / 2 - 80, CH / 2, 3, { fill: BR.magenta, alpha: 0.6, glow: 0.6 });
    } else {
      cover(R, R.img[C.img], C.focus[0], C.focus[1], lerp(1.0, 1.12, seg(local, -0.4, step + 0.4)));
    }
    // velatura per la leggibilità del testo (metà inferiore della card)
    R.rect(-CW / 2, -CH / 2, CW, CH, { fill: { lin: [0, -CH / 2, 0, CH / 2], stops: [[0, 'rgba(16,9,30,0.1)'], [0.35, 'rgba(16,9,30,0.55)'], [1, 'rgba(16,9,30,0.92)']] } });
    const A = AREA(i), cx = (A.x0 + A.x1) / 2, tw = A.x1 - A.x0;
    const a = seg(act, 0.55, 0.9);
    if (C.kind === 'gp') {
      const la = seg(act, 0.5, 0.9), lw = 560 * lerp(0.92, 1, E.outExpo(seg(local, 0, 0.6)));
      R.image(R.img.eseries, cx - lw / 2, -CH / 2 + 70, lw, lw * (228 / 1536), { sub: 1, alpha: la });
    }
    if (C.label) chip(R, C.label, cx, -CH / 2 + 70, a, { size: 26, col: PINK, align: 'center' });
    // blocco di testo: stesso fattore di scala per tutte le righe (la gerarchia resta), nessuna riga oltre l'area
    const fit = Math.min(1, ...C.lines.map((L) => tw / R.measure(L.s, 'glyB', L.size, -0.01)));
    const sz = C.lines.map((L) => L.size * fit);
    const ys = [0];
    for (let j = 1; j < sz.length; j++) ys.push(ys[j - 1] + (sz[j - 1] + sz[j]) * 0.5 * 1.16);
    const base = 70 - ys[ys.length - 1] / 2;   // blocco centrato poco sotto la metà della card, lontano dal bordo
    C.lines.forEach((L, j) => {
      const y = base + ys[j], size = sz[j];
      const u = E.outExpo(seg(local, 0.03 + j * 0.07, 0.45 + j * 0.07)) * a;
      R.clipRect(-CW / 2, y - size * 0.95, CW, size * 1.7);
      R.text(L.s, cx, y + (1 - u) * size * 1.1, { font: 'glyB', size, align: 'center', v: 'cap', fill: L.col || BR.white, alpha: a, tracking: -0.01, glow: L.col ? 0.25 : 0, glowColor: L.col, shadow: ['rgba(8,4,24,0.8)', 26, 0, 6],
        per: (g) => ({ rx: (1 - E.outExpo(seg(local, 0.03 + j * 0.07 + g * 0.01, 0.45 + j * 0.07 + g * 0.01))) * deg(-60) }) });
      R.unclip();
    });
    R.unclip();
    R.rrect(-CW / 2, -CH / 2, CW, CH, 34, { stroke: { lin: [-CW / 2, -CH / 2, CW / 2, CH / 2], stops: [[0, BR.cyan], [1, BR.magenta]] }, lw: 2.5, alpha: 0.9, glow: 0.6 * act });
  }

  function draw(R, t) {
    brandBg(R, t);
    stage(R, t, 0.7);
    const cam = new Cam();
    const sw = Math.sin((t - t0) * 0.8) * 30;
    const dive = E.inCubic(seg(t, t1 - 0.28, t1)) * 1100; // uscita: la camera entra nella card (→ 05)
    cam.look([sw, 0, -1500 + dive], [0, 0, 0], deg(Math.sin((t - t0) * 0.6) * 0.6), 1600);
    R.setCam(cam);
    const p = pos(t);
    const order = [0, 1, 2].sort((x, y) => Math.abs(y - p) - Math.abs(x - p));
    for (const i of order) {
      const o = i - p;
      if (Math.abs(o) > 1.6) continue;
      const act = clamp(1 - Math.abs(o));
      // rinculo della card colpita dalla pallina
      let kick = 0;
      HITS.forEach((th, k) => { if (k === Math.round(p) && Math.abs(i - p) < 0.5) kick += env(t, th, th + 0.05, th + 0.05, th + 0.3); });
      R.with(TRS([o * GAP - kick * 30, 0, Math.abs(o) * 520 + kick * 60], [0, deg(-o * 24 + kick * 4), 0], 1), () => card(R, t, i, act));
    }
    HITS.forEach((th) => impact(R, HP[0], HP[1], seg(t, th, th + 0.6), { scale: 1.3, col: BR.cyan }));
    flyBall(R, path, t, { trail: 0.14 });
    // ingresso dalla transizione «Entra nel mondo»
    const wh = 1 - E.outCubic(seg(t, t0, t0 + 0.25));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: BR.deep2, alpha: wh * 0.9 }));
    const out = E.inCubic(seg(t, t1 - 0.22, t1));
    if (out > 0) R.hud(() => R.rect(0, 0, W, H, { fill: BR.deep2, alpha: out }));
  }

  function fx(t) {
    const f = { grain: 0.04 };
    for (const th of HITS) if (t > th - 0.25 && t < th + 0.35) f.mb = 7;
    if (t > t1 - 0.28) f.mb = 8;
    return f;
  }

  return { t0, t1, draw, fx };
}
