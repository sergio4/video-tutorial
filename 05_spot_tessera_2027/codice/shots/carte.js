// D · La competizione: tre card editoriali in un carosello 3D, ognuna con un'immagine vera e un solo messaggio.
// 1 gameplay reale (tornei online) · 2 palco degli Internazionali BNL d'Italia eSeries (finali live)
// 3 vincitore delle Nitto ATP Finals eSeries con l'assegno (montepremi).
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, TRS, T } from '../engine/math.js';
import { BR, brandBg, chip } from './type.js';
import { stage } from './mondo.js';

const CW = 1240, CH = 700, GAP = 1420;
const CARDS = [
  { kind: 'gp', label: null, title: ['TORNEI ONLINE', 'DAL TUO SMARTPHONE'] },
  { kind: 'img', img: 'ev_ibi', label: "INTERNAZIONALI BNL D'ITALIA", title: ['FINALI LIVE', 'AI GRANDI EVENTI'], focus: [0.5, 0.42] },
  { kind: 'img', img: 'ev_win', label: 'NITTO ATP FINALS eSERIES', title: ['MONTEPREMI', 'IN PALIO'], focus: [0.55, 0.45] },
];

export function carte(S, TL) {
  const d = S.d, t0 = d.t0, t1 = d.t1, step = (t1 - t0) / 3;
  // posizione del carosello: indice della card attiva, con passaggi rapidi (0,4 s) sul battere
  const pos = (t) => {
    let p = -1 + E.outExpo(seg(t, t0, t0 + 0.45)); // la prima card entra da destra
    for (let k = 1; k < 3; k++) p += E.inOutCubic(seg(t, t0 + k * step - 0.4, t0 + k * step));
    return p;
  };

  function cover(R, img, fx, fy, zoom) {
    // immagine a riempimento della card, con zoom lento (Ken Burns) attorno al punto d'interesse
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
    const local = t - (t0 + i * step);
    if (C.kind === 'gp') {
      const fi = clamp(Math.floor(Math.max(0, local + 0.4) * 25), 0, 79);
      R.image(R.img.gpBBlur[fi], -CW / 2, -CW * (850 / 392) / 2 + 60, CW, CW * (850 / 392), { sub: 2 });
      R.rect(-CW / 2, -CH / 2, CW, CH, { fill: 'rgba(16,9,30,0.2)' });
      const gh = CH, gw = gh * (392 / 850);
      R.image(R.img.gpB[fi], CW / 2 - gw - 80, -gh / 2, gw, gh, { sub: 4 });
      R.band(CW / 2 - gw - 80, -CH / 2, CW / 2 - gw - 80, CH / 2, 3, { fill: BR.cyan, alpha: 0.6, glow: 0.6 });
      R.band(CW / 2 - 80, -CH / 2, CW / 2 - 80, CH / 2, 3, { fill: BR.magenta, alpha: 0.6, glow: 0.6 });
      // il circuito: logo ufficiale FITP eSeries by BMW
      const la = seg(act, 0.5, 0.9), lw = 620 * lerp(0.92, 1, E.outExpo(seg(local, 0, 0.6)));
      R.image(R.img.eseries, -CW / 2 + 60, -CH / 2 + 70, lw, lw * (228 / 1536), { sub: 1, alpha: la });
    } else {
      cover(R, R.img[C.img], C.focus[0], C.focus[1], lerp(1.0, 1.1, seg(local, -0.4, step + 0.4)));
    }
    // velatura per la leggibilità del titolo (in basso a sinistra)
    R.rect(-CW / 2, -CH / 2, CW, CH, { fill: { lin: [0, -CH / 2, 0, CH / 2], stops: [[0, 'rgba(16,9,30,0)'], [0.45, 'rgba(16,9,30,0.1)'], [1, 'rgba(16,9,30,0.92)']] } });
    R.rect(-CW / 2, -CH / 2, CW, CH, { fill: { lin: [-CW / 2, 0, CW / 2, 0], stops: [[0, 'rgba(16,9,30,0.55)'], [0.6, 'rgba(16,9,30,0)']] } });
    // etichetta dell'evento e titolo, animati quando la card diventa attiva
    const a = seg(act, 0.55, 0.9);
    if (C.label) chip(R, C.label, -CW / 2 + 60, -CH / 2 + 66, a, { size: 24, col: i === 0 ? BR.cyan : BR.magenta });
    C.title.forEach((ln, j) => {
      const u = E.outExpo(seg(local, 0.05 + j * 0.08, 0.55 + j * 0.08)) * a;
      const y = CH / 2 - 150 + j * 84;
      R.clipRect(-CW / 2, y - 80, CW, 104);
      R.text(ln, -CW / 2 + 60, y + (1 - u) * 90, { font: 'glyB', size: 78, v: 'cap', fill: j === C.title.length - 1 ? BR.white : BR.lilac, alpha: a, tracking: -0.01, maxW: CW - 120 });
      R.unclip();
    });
    R.unclip();
    R.rrect(-CW / 2, -CH / 2, CW, CH, 34, { stroke: { lin: [-CW / 2, -CH / 2, CW / 2, CH / 2], stops: [[0, BR.cyan], [1, BR.magenta]] }, lw: 2.5, alpha: 0.9, glow: 0.6 * act });
  }

  function draw(R, t) {
    brandBg(R, t);
    stage(R, t, 0.7);
    const cam = new Cam();
    cam.look([0, 0, -1560], [0, 0, 0], 0, 1600);
    R.setCam(cam);
    const p = pos(t);
    // disegno prima le card lontane
    const order = [0, 1, 2].sort((x, y) => Math.abs(y - p) - Math.abs(x - p));
    for (const i of order) {
      const o = i - p; // scostamento dalla posizione attiva
      if (Math.abs(o) > 1.6) continue;
      const act = clamp(1 - Math.abs(o));
      R.with(TRS([o * GAP, 0, Math.abs(o) * 520], [0, deg(-o * 24), 0], 1), () => card(R, t, i, act));
    }
  }

  function fx(t) {
    const f = { grain: 0.04 };
    const u = ((t - t0) / step) % 1;
    if (u > 1 - 0.4 / step) f.mb = 7;
    return f;
  }

  return { t0, t1, draw, fx };
}
