// Smartphone integrato nello spazio: spessore (mfui.phone), ombra a terra, riflesso sul pavimento lucido,
// riflesso speculare che scorre sul vetro quando il telefono ruota, luce di bordo. Stesso oggetto in apertura e in myFITP.
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, E, deg, rgba, TRS, T, S, mmul } from '../engine/math.js';
import { phone, PH, SW, SH, HX, HY } from './mfui.js';
import { BR } from './type.js';

export const FLOOR_Y = 420; // quota del pavimento (mondo, y verso il basso)

// pavimento lucido: piano orizzontale scuro con un leggero gradiente viola verso la camera
export function floor(R, a = 1) {
  R.with(TRS([0, FLOOR_Y, 0], [deg(90), 0, 0], 1), () => {
    R.rect(-4000, -3000, 8000, 5000, { fill: { lin: [0, -3000, 0, 2000], stops: [[0, rgba(BR.night, 0)], [0.55, rgba(BR.deep2, 0.55 * a)], [1, rgba(BR.night, 0.9 * a)]] } });
  });
}

// pose = matrice mondo del telefono (centro); screen(R) disegna lo schermo (coordinate SW × SH centrate)
export function phone3D(R, t, pose, screen, o = {}) {
  const ry = o.ry ?? 0;
  // riflesso sul pavimento: il telefono specchiato rispetto al piano, attenuato e sfocato
  if (o.reflect !== false) {
    const M = mmul(mmul(T(0, 2 * FLOOR_Y, 0), S(1, -1, 1)), pose);
    R.layer({ alpha: 0.2 * (o.alpha ?? 1), blur: 3, glow: 0.3 }, () => { R.pushAbs(M); phone(R, t, screen, { rimGlow: 0.3 }); R.pop(); });
  }
  // ombra morbida a terra, sotto il telefono
  const base = [pose[3], FLOOR_Y, pose[11]];
  R.with(TRS(base, [deg(90), 0, 0], 1), () => {
    R.with(S(260, 60, 1), () => R.circle(0, 0, 1, { fill: '#000', alpha: 0.55 * (o.alpha ?? 1), blur: 30 }, 48));
  });
  R.pushAbs(mmul(R.top(), pose));
  // luce di contorno che respira dietro al telefono (stacca il telefono dallo sfondo)
  R.with(T(0, 0, 30), () => R.rrect(-PH.w / 2 - 20, -PH.h / 2 - 20, PH.w + 40, PH.h + 40, PH.r + 20, { fill: BR.violet, alpha: 0.18 * (o.alpha ?? 1), blur: 60, glow: 0.4 }));
  phone(R, t, (RR) => {
    screen(RR);
    // riflesso speculare: una lama di luce attraversa il vetro al variare della rotazione
    const sx = lerp(-HX * 2.2, HX * 2.2, clamp(0.5 + ry * 1.6 + (o.sheen ?? 0)));
    RR.poly([sx - 60, -HY, sx + 40, -HY, sx - 140, HY, sx - 240, HY], { fill: '#ffffff', alpha: 0.1, blend: 'screen' });
    RR.poly([sx + 70, -HY, sx + 95, -HY, sx - 85, HY, sx - 110, HY], { fill: '#ffffff', alpha: 0.07, blend: 'screen' });
  }, { rimGlow: o.rimGlow ?? 0.8 });
  // spigolo metallico illuminato (lato verso la luce)
  R.rrect(-PH.w / 2 - 2, -PH.h / 2 - 2, PH.w + 4, PH.h + 4, PH.r + 2, { stroke: { lin: [-PH.w / 2, -PH.h / 2, PH.w / 2, PH.h / 2], stops: [[0, 'rgba(255,255,255,0.55)'], [0.4, 'rgba(255,255,255,0.05)'], [1, 'rgba(200,76,240,0.5)']] }, lw: 2 });
  R.pop();
}
