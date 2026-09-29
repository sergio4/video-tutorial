// 03 · Entra nel mondo eSports FITP — transizione breve (1,9 s) fra il level up e le card.
// Gerarchia: in alto «ENTRA NEL MONDO ESPORTS FITP», in basso il logo eSports FITP, che nasce dal rimbalzo della pallina.
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba } from '../engine/math.js';
import { BR, kin, brandBg } from './type.js';
import { flyBall, impact, segPath } from './ball.js';

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
  const tB = t0 + 0.3;            // rimbalzo sotto il logo
  const tOut = t1 - 0.3;
  const FY = 930, LY = 700;       // quota del rimbalzo, centro del logo
  const path = segPath([
    [t0 - 0.05, tB, [W / 2 + 40, -120, 16], [W / 2, FY, 30], 0, E.inQuad],
    [tB, tB + 0.6, [W / 2, FY, 30], [W + 140, 260, 22], 220, E.outQuad],
  ]);

  function draw(R, t) {
    brandBg(R, t);
    stage(R, t, 1);
    const g = env(t, tB - 0.05, tB, tB + 0.2, tB + 1.0);
    if (g > 0) R.hud(() => R.with([1, 0, 0, W / 2, 0, 0.22, 0, FY + 26, 0, 0, 1, 0], () => R.circle(0, 0, 420, { fill: { rad: [0, 0, 420], stops: [[0, rgba(BR.magenta, 0.55 * g)], [1, 'rgba(0,0,0,0)']] }, blend: 'lighter' }, 64)));
    impact(R, W / 2, FY + 26, seg(t, tB, tB + 0.7), { scale: 2.4, flat: 0.25, col: BR.magenta });
    // in alto: il titolo
    kin(R, [
      { s: 'ENTRA NEL MONDO', size: 96 },
      { s: 'ESPORTS FITP', size: 140, col: BR.lilac, glow: 0.25, glowColor: BR.magenta },
    ], W / 2, 230, t, t0 + 0.02, tOut, { align: 'center', lineGap: 0.12, stagger: 0.012 });
    // in basso: il logo eSports FITP, nato dal rimbalzo
    R.hud(() => {
      const la = seg(t, tB, tB + 0.1) * (1 - seg(t, tOut, tOut + 0.25));
      if (la > 0) {
        const k = E.outBack(seg(t, tB, tB + 0.45), 1.6) * lerp(1, 0.85, E.inCubic(seg(t, tOut, tOut + 0.25)));
        const w = 520 * k, h = w * (717 / 1278);
        R.image(R.img.logo, W / 2 - w / 2, LY - h / 2, w, h, { sub: 1, alpha: la });
      }
    });
    flyBall(R, path, t, { trail: 0.14 });
    const wh = 1 - E.outCubic(seg(t, t0, t0 + 0.2));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: BR.deep2, alpha: wh }));
    const out = E.inCubic(seg(t, t1 - 0.18, t1));
    if (out > 0) R.hud(() => R.rect(0, 0, W, H, { fill: BR.deep2, alpha: out }));
  }

  function fx(t) {
    const f = { grain: 0.04 };
    if (t < tB + 0.6 || t > tOut) f.mb = 7;
    if (t >= tB && t < tB + 0.25) { const u = (t - tB) / 0.25; f.flash = [BR.magenta, 0.25 * (1 - u)]; }
    return f;
  }

  return { t0, t1, draw, fx };
}
