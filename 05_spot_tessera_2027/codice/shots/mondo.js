// 03 · Entra nel mondo eSports FITP   04 · FITP eSeries by BMW
// 03: la pallina ricade dall'alto e rimbalza sul pavimento del palco: il rimbalzo fa comparire il logo eSports FITP
//     e il titolo «Entra nel mondo eSports FITP».
// 04: la pallina attraversa lo schermo da sinistra a destra e la sua scia svela il logo ufficiale FITP eSeries by BMW;
//     sotto, «Il circuito ufficiale della Federazione Italiana Tennis e Padel». Il logo si apre verso la camera (→ 05).
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
  const tB = t0 + 0.45;           // rimbalzo sul palco
  const tOut = t1 - 0.45;
  const FY = 800;                 // quota del rimbalzo (pavimento del palco)
  const path = segPath([
    [t0 - 0.05, tB, [W / 2 + 40, -120, 16], [W / 2, FY, 30], 0, E.inQuad],
    [tB, tB + 0.75, [W / 2, FY, 30], [W + 140, 180, 22], 260, E.outQuad],
  ]);

  function draw(R, t) {
    brandBg(R, t);
    stage(R, t, 1);
    // alone sul pavimento dove rimbalza la pallina
    const g = env(t, tB - 0.05, tB, tB + 0.2, tB + 1.2);
    if (g > 0) R.hud(() => R.with([1, 0, 0, W / 2, 0, 0.22, 0, FY + 26, 0, 0, 1, 0], () => R.circle(0, 0, 420, { fill: { rad: [0, 0, 420], stops: [[0, rgba(BR.magenta, 0.55 * g)], [1, 'rgba(0,0,0,0)']] }, blend: 'lighter' }, 64)));
    impact(R, W / 2, FY + 26, seg(t, tB, tB + 0.8), { scale: 2.6, flat: 0.25, col: BR.magenta });
    // logo eSports FITP: nasce dal rimbalzo
    R.hud(() => {
      const la = seg(t, tB, tB + 0.12) * (1 - seg(t, tOut, tOut + 0.3));
      if (la > 0) {
        const k = E.outBack(seg(t, tB, tB + 0.55), 1.6) * lerp(1, 1.04, seg(t, tB + 0.6, t1)) * lerp(1, 0.85, E.inCubic(seg(t, tOut, tOut + 0.3)));
        const w = 620 * k, h = w * (717 / 1278);
        R.image(R.img.logo, W / 2 - w / 2, 350 - h / 2 - E.inCubic(seg(t, tOut, tOut + 0.3)) * 60, w, h, { sub: 1, alpha: la });
      }
    });
    kin(R, [
      { s: 'Entra nel mondo', size: 104 },
      { s: 'eSports FITP', size: 150, col: BR.lilac, glow: 0.25, glowColor: BR.magenta },
    ], W / 2, 690, t, tB + 0.15, tOut, { align: 'center', lineGap: 0.3 });
    flyBall(R, path, t, { trail: 0.14 });
    // ingresso: il viola del level up si apre
    const wh = 1 - E.outCubic(seg(t, t0, t0 + 0.3));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: BR.deep2, alpha: wh }));
  }

  function fx(t) {
    const f = { grain: 0.04 };
    if (t < tB + 0.8) f.mb = 7;
    if (t >= tB && t < tB + 0.25) { const u = (t - tB) / 0.25; f.flash = [BR.magenta, 0.25 * (1 - u)]; }
    return f;
  }

  return { t0, t1, draw, fx };
}

export function circuito(S, TL) {
  const d = S.d, t0 = d.t0, t1 = d.t1;
  const tA = t0 + 0.05, tZ = t0 + 0.75;  // passaggio della pallina
  const LY = 470, LW = 1250, LH = LW * (228 / 1536);
  const tOut = t1 - 0.4;
  const bx = (t) => lerp(-160, W + 160, E.inOutSine(seg(t, tA, tZ)));
  const path = (t) => (t < tA - 0.02 || t > tZ + 0.02 ? null : [bx(t), LY - Math.sin(seg(t, tA, tZ) * Math.PI) * 30, 26]);

  function draw(R, t) {
    brandBg(R, t);
    stage(R, t, 0.9);
    const zoom = 1 + 0.05 * seg(t, tZ, tOut) + 0.9 * E.inCubic(seg(t, tOut, t1));
    const za = 1 - seg(t, tOut + 0.15, t1);
    R.hud(() => R.with([zoom, 0, 0, (W / 2) * (1 - zoom), 0, zoom, 0, LY * (1 - zoom), 0, 0, 1, 0], () => {
      // logo svelato dalla scia: la parte già attraversata dalla pallina è visibile
      const rx = t < tZ ? bx(t) : W + 200;
      const x0 = W / 2 - LW / 2;
      if (rx > x0) {
        R.clipRect(0, 0, rx, H);
        R.image(R.img.eseries, x0, LY - LH / 2, LW, LH, { sub: 1, alpha: za });
        R.unclip();
      }
      // lama di luce che segue la pallina sul bordo della rivelazione
      if (t < tZ + 0.1) R.band(rx, LY - LH * 0.9, rx, LY + LH * 0.9, 5, { fill: '#ffffff', alpha: 1 - seg(t, tZ, tZ + 0.1), glow: 1.4, glowColor: BR.cyan });
      // riflesso che attraversa il logo quando è completo
      const sw = seg(t, tZ + 0.5, tZ + 1.3);
      if (sw > 0 && sw < 1) {
        const sx = lerp(x0 - 200, x0 + LW + 200, sw);
        R.clipRect(x0, LY - LH / 2, LW, LH);
        R.poly([sx - 60, LY - LH, sx + 20, LY - LH, sx - 60, LY + LH, sx - 140, LY + LH], { fill: '#ffffff', alpha: 0.35 * za, blend: 'screen' });
        R.unclip();
      }
    }));
    kin(R, [{ s: 'Il circuito ufficiale della Federazione Italiana Tennis e Padel', size: 46, font: 'glyM', tracking: 0 }], W / 2, 660, t, tZ + 0.15, tOut - 0.1, { align: 'center', stagger: 0.008 });
    flyBall(R, path, t, { trail: 0.28 });
  }

  function fx(t) {
    const f = { grain: 0.04 };
    if (t < tZ + 0.1 || t > tOut) f.mb = 8;
    return f;
  }

  return { t0, t1, draw, fx };
}
