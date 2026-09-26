// Router: costruisce gli atti dalla timeline e li disegna nell'ordine giusto.
import { hookAct } from './hook.js';
import { worldAct } from './world.js';
import { torneiAct } from './tornei.js';
import { campoAct } from './campo.js';
import { finaleAct } from './finale.js';

const FACTORY = { hook: hookAct, world: worldAct, tornei: torneiAct, campo: campoAct, finale: finaleAct };
let built = null, builtFor = null;

function acts(TL) {
  if (builtFor === TL) return built;
  built = TL.acts.filter((a) => FACTORY[a.id]).map((a) => ({ ...a, impl: FACTORY[a.id](a, TL) }));
  builtFor = TL;
  return built;
}

export function drawScene(R, t, TL) {
  const A = acts(TL).filter((a) => t >= a.t0 && t < a.t1);
  for (const a of A) a.impl.draw(R, t);
  for (const a of A) if (a.impl.over) a.impl.over(R, t);
}

export function fxAt(t, TL) {
  const f = { mb: 4, grain: 0.055, vignette: 0.42, ca: 0, bloom: 1 };
  for (const a of acts(TL)) {
    if (t < a.t0 - 0.5 || t >= a.t1 + 0.5 || !a.impl.fx) continue;
    const g = a.impl.fx(t);
    for (const k in g) {
      if (k === 'mb') f.mb = Math.max(f.mb, g.mb);
      else if (k === 'ca' || k === 'glitch') f[k] = Math.max(f[k] || 0, g[k]);
      else f[k] = g[k];
    }
  }
  return f;
}
