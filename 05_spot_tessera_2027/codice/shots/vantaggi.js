// E · La TESSERA eSPORTS FITP e i suoi vantaggi.
// La tessera entra con il titolo; poi il titolo lascia il posto ai due vantaggi principali (tornei ufficiali con
// montepremi, sconti sui grandi eventi FITP) e, più piccoli, agli altri. Nota legale discreta in basso.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, TRS, T } from '../engine/math.js';
import { BR, brandBg, h1, sup, chip } from './type.js';
import { stage } from './mondo.js';
import { card } from './card.js';
import { icon } from './mfui.js';

export const TES = { pos: [-470, -10, 0], sc: 1.75 }; // posa della tessera (ripresa da myfitp.js)
export const CAM = { eye: [0, 0, -1600], f: 1600 };
const LEGAL = '*Fino al 10% sui biglietti e fino al 5% sugli abbonamenti. Valido per chi ha partecipato ad almeno un torneo eSports FITP.';

export function vantaggi(S, TL) {
  const e = S.e, t0 = e.t0, t1 = e.t1;
  const tB = t0 + 1.7;           // arrivano i vantaggi
  const tOut = t1 - 0.3;

  function tesPose(t) {
    const u = E.outExpo(seg(t, t0, t0 + 0.55));
    const idle = seg(t, t0 + 0.4, t0 + 0.9);
    return TRS([lerp(-1400, TES.pos[0], u), lerp(120, TES.pos[1], u), lerp(600, 0, u)], [deg(6 * Math.sin(t * 1.1)) * idle, deg(-12 + 8 * Math.sin(t * 0.8)) * idle + (1 - u) * Math.PI * 2, deg(-3) * idle], lerp(0.6, TES.sc, u));
  }

  // cartello di un vantaggio principale
  function mainCard(R, y, ic, title, sub, a, k) {
    if (a <= 0) return;
    const x = 900, w = 900, h = 150;
    R.with([1, 0, 0, (1 - k) * 80, 0, 1, 0, 0, 0, 0, 1, 0], () => {
      R.rrect(x, y - h / 2, w, h, 28, { fill: 'rgba(20,32,68,0.92)', alpha: a, knock: true, shadow: ['rgba(0,0,0,0.4)', 30, 0, 10] });
      R.rrect(x, y - h / 2, w, h, 28, { stroke: { screenLin: [x, 0, x + w, 0], stops: [[0, BR.cyan], [1, BR.magenta]] }, lw: 2.5, alpha: a, glow: 0.5 });
      R.circle(x + 80, y, 46, { fill: 'rgba(164,6,249,0.25)', alpha: a }, 40);
      if (ic === 'ticket') {
        R.rrect(x + 52, y - 22, 56, 44, 8, { stroke: BR.cyan, lw: 4, alpha: a });
        R.band(x + 90, y - 20, x + 90, y + 20, 2, { fill: BR.cyan, alpha: a });
      } else icon(R, ic, x + 80, y, 48, BR.cyan, a);
      R.text(title, x + 150, y - 20, { font: 'glyB', size: 46, v: 'cap', fill: BR.white, alpha: a, tracking: -0.01, maxW: w - 180 });
      R.text(sub, x + 152, y + 32, { font: 'glyM', size: 28, v: 'cap', fill: BR.lilac, alpha: a, maxW: w - 180 });
    });
  }

  function draw(R, t) {
    brandBg(R, t);
    stage(R, t, 0.5);
    const cam = new Cam();
    cam.look(CAM.eye, [0, 0, 0], 0, CAM.f);
    R.setCam(cam);
    R.push(tesPose(t));
    card(R, t, { flash: 1 - seg(t, t0 + 0.2, t0 + 0.6) });
    R.pop();
    // titolo, poi vantaggi
    h1(R, ['OTTIENI LA', ['TESSERA', BR.white], ['eSPORTS FITP', BR.lilac]], 900, 330, t, t0 + 0.3, tB - 0.25, { size: 84, maxW: 940 });
    sup(R, 'CON LA TESSERA eSPORTS FITP', 902, 280, t, tB, tOut, { size: 24, fill: BR.cyan });
    R.hud(() => {
      const m = (d) => ({ a: seg(t, tB + d, tB + d + 0.2) * (1 - seg(t, tOut, tOut + 0.2)), k: E.outExpo(seg(t, tB + d, tB + d + 0.45)) });
      const m1 = m(0.05), m2 = m(0.3);
      mainCard(R, 410, 'trophy', 'TORNEI UFFICIALI', 'con montepremi', m1.a, m1.k);
      mainCard(R, 590, 'ticket', 'FINO AL -10%*', 'sui grandi eventi FITP', m2.a, m2.k);
      // vantaggi minori: chip in fila, larghezza misurata, allineati alle card
      let cx = 900;
      ['Loyalty program FITP', 'Sconti dai partner', 'SuperTennis+ gratis'].forEach((s, i) => {
        const mm = m(0.75 + i * 0.12);
        chip(R, s, cx, 750, mm.a, { size: 22, col: BR.lilac });
        cx += R.measure(s, 'glySB', 22, 0.08) + 36 + 18;
      });
    });
    sup(R, LEGAL, W / 2, H - 42, t, tB + 0.3, tOut, { size: 18, align: 'center', alpha: 0.8, maxW: W - 140 });
  }

  function fx(t) {
    const f = { grain: 0.04 };
    if (t < t0 + 0.55) f.mb = 7;
    return f;
  }

  return { t0, t1, draw, fx };
}
