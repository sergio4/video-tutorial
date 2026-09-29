// A · Gioco  B · Level up
// Gameplay reale (Tennis Clash, partita nell'arena SuperTennis) in una card verticale; lo stesso gameplay, sfocato,
// riempie il 16:9. La barra XP sale sui colpi veri della partita; i «+XP» sono elementi secondari.
// Il punto vinto riempie la barra: LEVEL UP, e la card si apre sul mondo eSports FITP (mondo.js).
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, rgba, TRS, T } from '../engine/math.js';
import { shake } from './common.js';
import { BR, h1, chip, ptext } from './type.js';

const GP_T0 = 3.0; // secondo del video sorgente che corrisponde all'inizio dello spot

export function gioco(S, TL) {
  const a = S.a, b = S.b;
  const t0 = a.t0, tPoint = t0 + 5.5, t1 = b.t1;
  const tText = t0 + 2.6;
  // colpi reali della partita (tempo dello spot) e avanzamento della barra dopo ciascuno
  const HITS = [[0.5, 0.16, '+20 XP'], [1.2, 0.3, '+20 XP'], [2.5, 0.47, '+30 XP'], [3.3, 0.6, '+20 XP'], [4.25, 0.82, '+120 XP'], [5.5, 1, null]].map(([dt, v, l]) => [t0 + dt, v, l]);
  const CARD = { x: 300, w: 415, h: 900 };

  const frame = (t) => clamp(Math.floor((t - t0) * 25), 0, 159);
  const xp = (t) => { let v = 0.04; for (const [th, val] of HITS) { v = lerp(v, val, E.outCubic(seg(t, th, th + 0.3))); } return v; };

  function camAt(t) {
    const c = new Cam();
    const sh = shake(t, [[tPoint, 14, 0.45]]);
    const z = lerp(-1600, -1500, seg(t, t0, tPoint)) + lerp(0, 1350, E.inExpo(seg(t, tPoint + 0.35, t1)));
    const x = lerp(0, CARD.x, E.inOutCubic(seg(t, tPoint + 0.2, t1)));
    c.look([x, 0, z], [x, 0, 0], 0, 1600);
    c.cx += sh[0]; c.cy += sh[1];
    return c;
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    const fi = frame(t);
    // sfondo: lo stesso gameplay, sfocato e tinto nel viola del brand
    R.hud(() => {
      const bi = R.img.gpABlur[fi], bh = W * (850 / 392);
      R.image(bi, 0, (H - bh) / 2, W, bh, { sub: 1 });
      R.rect(0, 0, W, H, { fill: { lin: [0, 0, W, 0], stops: [[0, 'rgba(16,9,30,0.92)'], [0.45, 'rgba(49,26,96,0.6)'], [1, 'rgba(16,9,30,0.7)']] } });
    });
    // card con il gameplay reale
    const tilt = deg(-7 + 2 * Math.sin(t * 0.8));
    R.push(TRS([CARD.x, 0, 0], [deg(1.5), tilt * (1 - seg(t, tPoint, tPoint + 0.4)), 0], 1));
    R.with(T(24, 30, 40), () => R.rrect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 30, { fill: '#000', alpha: 0.5, blur: 40 }));
    R.rrect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 30, { fill: BR.night, knock: true });
    R.clipPoly(R.rrPts(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 30));
    R.image(R.img.gpA[fi], -CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, { sub: 4 });
    // lampo sul punto vinto
    const fl = env(t, tPoint - 0.03, tPoint, tPoint + 0.05, tPoint + 0.5);
    if (fl > 0) R.rect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, { fill: '#ffffff', alpha: fl * 0.55 });
    const lv = E.outCubic(seg(t, tPoint + 0.1, tPoint + 0.7));
    if (lv > 0) R.rect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, { fill: { lin: [0, -CARD.h / 2, 0, CARD.h / 2], stops: [[0, rgba(BR.violet, 0.4)], [1, rgba(BR.magenta, 0.9)]] }, alpha: lv });
    R.unclip();
    R.rrect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 30, { stroke: { lin: [-CARD.w / 2, -CARD.h / 2, CARD.w / 2, CARD.h / 2], stops: [[0, BR.cyan], [1, BR.magenta]] }, lw: 3, glow: 0.7 + fl });
    R.pop();

    // barra XP (gamification: elemento di supporto, non protagonista)
    const ba = seg(t, t0 + 0.3, t0 + 0.6) * (1 - seg(t, tPoint + 0.5, tPoint + 0.7));
    if (ba > 0) R.hud(() => {
      const x = 150, y = 660, w = 560, v = xp(t), full = v > 0.995;
      R.text(full ? 'LV 30' : 'LV 29', x, y - 34, { font: 'glySB', size: 24, v: 'cap', fill: full ? BR.cyan : BR.white, alpha: ba, tracking: 0.06 });
      R.text('XP', x + w, y - 34, { font: 'glySB', size: 20, align: 'right', v: 'cap', fill: BR.muted, alpha: ba, tracking: 0.12 });
      R.rrect(x, y - 8, w, 16, 8, { fill: 'rgba(255,255,255,0.12)', alpha: ba });
      R.rrect(x, y - 8, Math.max(16, w * v), 16, 8, { fill: { screenLin: [x, 0, x + w, 0], stops: [[0, BR.cyan], [1, BR.magenta]] }, alpha: ba, glow: 0.6 });
      // +XP: piccoli, salgono dalla barra e spariscono
      for (const [th, val, l] of HITS) {
        if (!l) continue;
        const u = seg(t, th, th + 0.8);
        if (u <= 0 || u >= 1) continue;
        const big = l === '+120 XP';
        ptext(R, l, x + w * val, y - 30 - E.outCubic(u) * 50, { font: 'glySB', size: big ? 28 : 22, align: 'center', v: 'cap', fill: big ? BR.cyan : '#ffffff', alpha: (1 - seg(u, 0.6, 1)) * ba, tracking: 0.04 });
      }
    });
    // titolo: entra dopo che il gameplay ha avuto il suo spazio
    h1(R, ['OGNI COLPO', ['CONTA', BR.lilac]], 150, 440, t, tText, tPoint - 0.3, { size: 96 });

    // LEVEL UP: conseguenza del punto vinto
    const la = seg(t, tPoint + 0.02, tPoint + 0.1) * (1 - seg(t, t1 - 0.3, t1));
    if (la > 0) R.hud(() => {
      const u = E.outExpo(seg(t, tPoint + 0.02, tPoint + 0.35)), k = lerp(1.8, 1, u);
      R.with([k, 0, 0, W / 2, 0, k, 0, H / 2, 0, 0, 1, 0], () => {
        R.text('LEVEL UP', 0, 0, { font: 'glyB', size: 190, align: 'center', v: 'cap', fill: BR.white, alpha: la, tracking: 0.02, shadow: ['rgba(8,4,24,0.6)', 40, 0, 10] });
      });
      // il nuovo livello: la progressione resta leggibile anche senza la barra
      const ca = seg(t, tPoint + 0.3, tPoint + 0.45) * la;
      chip(R, 'LIVELLO 30', W / 2, H / 2 + 150 + (1 - E.outExpo(seg(t, tPoint + 0.3, tPoint + 0.7))) * 30, ca, { size: 26, col: BR.cyan, align: 'center', fill: 'rgba(16,9,30,0.85)' });
      const r = seg(t, tPoint, tPoint + 0.5);
      R.circle(W / 2, H / 2, lerp(120, 1300, E.outCubic(r)), { stroke: BR.cyan, lw: lerp(14, 2, r), alpha: (1 - r) * la, glow: 1 }, 80);
      R.circle(W / 2, H / 2, lerp(60, 900, E.outCubic(seg(t, tPoint + 0.08, tPoint + 0.6))), { stroke: BR.magenta, lw: 6, alpha: (1 - seg(t, tPoint + 0.08, tPoint + 0.6)) * la, glow: 1 }, 80);
    });
    // la card si apre: luce che porta al mondo eSports FITP
    const wh = E.inCubic(seg(t, t1 - 0.25, t1));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: BR.magenta, alpha: wh * 0.85 }));
  }

  function fx(t) {
    const f = { grain: 0.04 };
    if (t >= tPoint && t < tPoint + 0.3) { const u = (t - tPoint) / 0.3; f.flash = ['#ffffff', 0.35 * (1 - u)]; f.ca = 0.012 * (1 - u); }
    if (t >= tPoint + 0.35) { f.mb = 8; f.ca = 0.01 * seg(t, tPoint + 0.35, t1); }
    return f;
  }

  return { t0, t1, draw, fx };
}
