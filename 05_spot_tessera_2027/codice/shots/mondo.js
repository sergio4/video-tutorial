// C · Il mondo eSports FITP
// C1: dal lampo del level up emerge il logo eSports FITP con il titolo «ENTRA NEL MONDO eSPORTS FITP».
// C2: il logo ufficiale FITP eSeries by BMW, con il secondario «Il circuito ufficiale FITP»: non è solo un gioco,
// è un circuito federale. Poi le card editoriali (carte.js).
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba } from '../engine/math.js';
import { BR, h1, h2, brandBg } from './type.js';

// fasci di luce e griglia prospettica: profondità discreta, mai protagonista
export function stage(R, t, a = 1) {
  R.hud(() => {
    for (let i = 0; i < 7; i++) {
      const x = W * (0.08 + i * 0.14) + Math.sin(t * 0.6 + i) * 40;
      R.poly([x - 6, 0, x + 6, 0, x + 220, H, x - 220, H], { fill: { screenLin: [0, 0, 0, H], stops: [[0, rgba(i % 2 ? BR.violet : BR.magenta, 0.16 * a)], [1, 'rgba(0,0,0,0)']] }, blend: 'lighter' });
    }
    const hy = H * 0.72;
    for (let i = -12; i <= 12; i++) R.line([W / 2 + i * 30, hy, W / 2 + i * 260, H + 40], { stroke: BR.violet, lw: 1.2, alpha: 0.28 * a });
    for (let j = 0; j < 7; j++) { const y = hy + Math.pow(j / 6, 1.8) * (H - hy + 40) + ((t * 60) % 30) * (j / 6); R.line([0, y, W, y], { stroke: BR.violet, lw: 1, alpha: 0.2 * a * (j / 6) }); }
    for (let i = 0; i < 40; i++) {
      const x = hash(i * 3.1) * W, y = (hash(i * 7.3) * H - t * (20 + hash(i) * 40)) % H;
      R.circle(x, (y + H) % H, 1.5 + hash(i * 2) * 2, { fill: i % 3 ? '#ffffff' : BR.cyan, alpha: a * 0.4 * (0.5 + 0.5 * Math.sin(t * 2 + i)) }, 8);
    }
  });
}

export function mondo(S, TL) {
  const c = S.c, t0 = c.t0, t1 = c.t1;
  const c2 = t0 + 1.9; // seconda metà: il circuito

  function draw(R, t) {
    brandBg(R, t);
    stage(R, t, 1);
    R.hud(() => {
      // C1: logo eSports FITP
      const la = seg(t, t0 + 0.05, t0 + 0.35) * (1 - seg(t, c2 - 0.15, c2 + 0.1));
      if (la > 0) {
        const k = E.outBack(seg(t, t0 + 0.05, t0 + 0.5), 1.4) * lerp(1, 1.25, seg(t, c2 - 0.15, c2 + 0.1));
        const w = 560 * k, h = w * (717 / 1278);
        R.image(R.img.logo, W / 2 - w / 2, 385 - h / 2, w, h, { sub: 1, alpha: la });
      }
      // C2: logo FITP eSeries by BMW
      const ea = seg(t, c2, c2 + 0.3) * (1 - seg(t, t1 - 0.2, t1));
      if (ea > 0) {
        const k = lerp(0.85, 1, E.outExpo(seg(t, c2, c2 + 0.5)));
        const w = 1100 * k, h = w * (228 / 1536);
        R.image(R.img.eseries, W / 2 - w / 2, 480 - h / 2, w, h, { sub: 1, alpha: ea });
      }
    });
    h1(R, ['ENTRA NEL MONDO', ['eSPORTS FITP', BR.lilac]], W / 2, 695, t, t0 + 0.3, c2 - 0.25, { size: 88, align: 'center' });
    h2(R, 'Il circuito ufficiale della Federazione Italiana Tennis e Padel', W / 2, 655, t, c2 + 0.35, t1 - 0.2, { align: 'center', size: 40, fill: BR.white });
    // ingresso: il lampo magenta del level up si dissolve
    const wh = 1 - E.outCubic(seg(t, t0, t0 + 0.35));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: BR.magenta, alpha: wh * 0.85 }));
  }

  function fx(t) {
    const f = { grain: 0.04 };
    if (t < t0 + 0.3) f.mb = 6;
    return f;
  }

  return { t0, t1, draw, fx };
}
