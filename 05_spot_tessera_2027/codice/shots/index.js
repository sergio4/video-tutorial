// Router degli atti dello spot (piano v3, 45 s): ogni atto copre uno o più blocchi A-I e disegna i propri raccordi.
import { W, H } from '../engine/r.js';
import { intro } from './intro.js';
import { mondo } from './mondo.js';
import { tessera } from './tessera.js';
import { app } from './app.js';
import { match } from './match.js';
import { benefit } from './benefit.js';
import { finale } from './finale.js';

// percorso: scopri gli eSports FITP → level up → fai la tessera → entra in myFITP → cosa puoi fare → CTA
const FACTORIES = [intro, mondo, tessera, app, match, benefit, finale];
let built = null, builtFor = null;

function acts(TL) {
  if (builtFor === TL) return built;
  built = FACTORIES.map((f) => f(TL.S, TL));
  builtFor = TL;
  return built;
}

// sovrimpressione di servizio: numero di scena dello storyboard, frase della voce, timecode
function guide(R, t, TL) {
  const sc = TL.scenes.map((s) => TL.S[s.id]).find((s) => t >= s.t0 && t < s.t1);
  if (!sc) return;
  R.hud(() => {
    R.rect(0, H - 118, W, 118, { fill: 'rgba(0,0,0,0.55)' });
    R.text(`SCENA ${sc.n}`, 40, H - 76, { font: 'mono800', size: 22, v: 'cap', fill: '#e2ff2e', tracking: 0.1 });
    R.text(`${t.toFixed(2)} s`, 40, H - 36, { font: 'mono700', size: 20, v: 'cap', fill: '#ffffff' });
    const vin = sc.t0 + sc.vo_in, vout = vin + sc.vo_est;
    const on = t >= vin && t < vout;
    R.circle(262, H - 58, 9, on ? { fill: '#ff3b6b', glow: 0.6 } : { stroke: 'rgba(255,255,255,0.5)', lw: 2 }, 20);
    R.text('V.O.  ' + sc.vo, 284, H - 58, { font: 'unb600', size: 26, v: 'cap', fill: on ? '#ffffff' : 'rgba(255,255,255,0.4)' });
    R.rect(250, H - 22, (W - 290) * Math.min(1, Math.max(0, (t - sc.t0) / sc.dur)), 4, { fill: '#e2ff2e' });
  });
}

export function drawScene(R, t, TL) {
  const A = acts(TL).filter((a) => t >= a.t0 && t < a.t1);
  if (!A.length) R.bg('#0b0620', '#05030f');
  for (const a of A) a.draw(R, t);
  for (const a of A) if (a.over) a.over(R, t);
  if (TL.guide) guide(R, t, TL);
}

export function fxAt(t, TL) {
  const f = { mb: 4, grain: 0.055, vignette: 0.42, ca: 0, bloom: 1 };
  for (const a of acts(TL)) {
    if (t < a.t0 - 0.5 || t >= a.t1 + 0.5 || !a.fx) continue;
    const g = a.fx(t);
    for (const k in g) {
      if (k === 'mb') f.mb = Math.max(f.mb, g.mb);
      else if (k === 'ca' || k === 'glitch') f[k] = Math.max(f[k] || 0, g[k]);
      else f[k] = g[k];
    }
  }
  return f;
}
