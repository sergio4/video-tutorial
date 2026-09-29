// 08 · CTA — disposizione della v4 (tessera a sinistra, colonna a destra) con un crescendo: raggi e particelle che
// convergono sulla tessera, camera che avanza. La colonna destra è una pila centrata su un solo asse (CX):
// claim, pennellata, pulsante «RICHIEDI ORA LA TESSERA ESPORTS FITP», sito, loghi. La tessera è centrata in altezza
// sulla pila. La pallina rimbalza sulla pennellata e colpisce il pulsante, che si accende all'impatto.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, TRS } from '../engine/math.js';
import { shake, dust } from './common.js';
import { BR, brandBg, kin } from './type.js';
import { card } from './card.js';
import { flyBall, impact, segPath } from './ball.js';

export function finale(S, TL) {
  const sc = S.i, t0 = sc.t0, t1 = sc.t1;
  const tIn = t0 + 0.25, tLand = t0 + 0.85;      // la tessera arriva al centro
  const m0 = t0 + 1.0, m1 = t0 + 1.6;             // la tessera va a sinistra
  const tClaim = t0 + 1.35;
  const tBounce = t0 + 2.55, tCta = t0 + 2.95;    // rimbalzo sulla pennellata, impatto sul pulsante
  const tUrl = tCta + 0.4, tLogo = tCta + 0.7;
  const CX = 1340, COLW = 1000;                   // asse e larghezza della colonna destra
  const Y1 = 330, BY = 625, UY = 730, LOGO_Y = 835; // claim (prima riga), pulsante, sito, loghi
  const CTA_TXT = 'RICHIEDI ORA LA TESSERA ESPORTS FITP';
  const CARD_C = { pos: [0, -40, 0], sc: 1.9 }, CARD_E = { pos: [-500, 12, 0], sc: 1.5 };
  let ul = { x0: CX - 300, x1: CX + 300, y: 509 };  // pennellata (calcolata sul claim)

  function cardPose(t) {
    const a = E.outBack(seg(t, tIn, tLand), 1.2);
    const e = E.inOutCubic(seg(t, m0, m1));
    const idle = seg(t, tLand, tLand + 0.5);
    const pos = CARD_C.pos.map((v, i) => lerp(v, CARD_E.pos[i], e));
    return TRS([pos[0], pos[1], lerp(1400, 0, a) + pos[2]], [deg(4 * Math.sin(t * 1.1)) * idle, deg(lerp(0, -10, e) + 6 * Math.sin(t * 0.8)) * idle + (1 - E.outCubic(seg(t, tIn, tLand))) * Math.PI * 4, deg(lerp(0, -2, e))], lerp(CARD_C.sc, CARD_E.sc, e));
  }

  const path = (t) => segPath([
    [tBounce - 0.4, tBounce, [W + 100, 120, 18], [ul.x1 - 60, ul.y, 26], 0, E.inQuad],
    [tBounce, tCta, [ul.x1 - 60, ul.y, 26], [CX - 180, BY, 34], 150, E.lin],
  ])(t);

  function draw(R, t) {
    const cam = new Cam();
    const sh = shake(t, [[tLand, 10, 0.4], [tCta, 12, 0.4]]);
    const push = E.inOutCubic(seg(t, t0, t1)) * 140;
    cam.look([0, -20, -1600 + push], [0, -20, 0], 0, 1600);
    cam.cx += sh[0]; cam.cy += sh[1];
    R.setCam(cam);
    brandBg(R, t, { a: 1 + 0.4 * seg(t, tCta, tCta + 0.5) });
    // crescendo: raggi che si aprono dietro la tessera e crescono fino alla CTA
    const tx = lerp(W / 2, 460, E.inOutCubic(seg(t, m0, m1))), ty = lerp(520, 572, E.inOutCubic(seg(t, m0, m1)));
    const ra = seg(t, t0 + 0.2, tLand) * (0.55 + 0.45 * seg(t, tCta, tCta + 0.6));
    R.hud(() => {
      for (let i = 0; i < 28; i++) {
        const ang = (i / 28) * Math.PI * 2 + t * 0.08, w = 0.035;
        R.poly([tx, ty, tx + Math.cos(ang - w) * 1600, ty + Math.sin(ang - w) * 1600, tx + Math.cos(ang + w) * 1600, ty + Math.sin(ang + w) * 1600], { fill: { rad: [tx, ty, 1300], stops: [[0, rgba(i % 2 ? BR.magenta : BR.violet, 0.3 * ra)], [1, 'rgba(0,0,0,0)']] }, blend: 'lighter' });
      }
      // particelle che convergono sulla tessera mentre arriva
      const pc = seg(t, t0, tLand + 0.2);
      if (pc > 0 && pc < 1) for (let i = 0; i < 60; i++) {
        const ang = hash(i * 3.3) * Math.PI * 2, d = lerp(900 + hash(i) * 500, 40, E.inCubic(pc));
        R.circle(tx + Math.cos(ang) * d, ty + Math.sin(ang) * d * 0.7, 2 + hash(i * 5) * 3, { fill: i % 3 ? '#ffffff' : BR.cyan, alpha: 0.8 * Math.sin(pc * Math.PI), glow: 0.8 }, 10);
      }
    });
    dust(R, t, [-1400, -900, -300, 1400, 900, 1500], 60, 21, { a: 0.4 });
    if (t >= tIn) {
      R.push(cardPose(t));
      card(R, t, { flash: env(t, tLand - 0.1, tLand, tLand, tLand + 0.35) * 0.8 });
      R.pop();
    }
    impact(R, W / 2, 500, seg(t, tLand, tLand + 0.7), { scale: 2.2, col: BR.cyan });

    // claim (testo esatto), centrato sull'asse della colonna
    const cs = Math.min(104, (104 * COLW) / R.measure('da protagonista', 'glyB', 104, -0.012));
    const y2 = kin(R, [{ s: 'Vivi il gaming', size: cs }, { s: 'da protagonista', size: cs, col: BR.white }], CX, Y1, t, tClaim, 1e9, { align: 'center', lineGap: 0.2 });
    R.hud(() => {
      // pennellata ciano→magenta sotto «protagonista» (dalla v4)
      const w2 = R.measure('da protagonista', 'glyB', cs, -0.012);
      const bx0 = CX - w2 / 2 + R.measure('da ', 'glyB', cs, -0.012), bw = R.measure('protagonista', 'glyB', cs, -0.012);
      ul = { x0: bx0, x1: bx0 + bw, y: y2 + cs * 0.36 + 24 };
      const u = E.inOutCubic(seg(t, tClaim + 0.6, tClaim + 1.0));
      if (u > 0) {
        const pts = [], pb = [];
        for (let i = 0; i <= 30; i++) {
          const f = (i / 30) * u, px = bx0 + f * bw, py = ul.y + Math.sin(f * 3.2) * 5 - f * 7 + env(t, tBounce, tBounce + 0.03, tBounce + 0.03, tBounce + 0.25) * 10 * Math.sin(f * Math.PI);
          const w = 16 * Math.sin(Math.PI * Math.min(1, (i / 30) * 1.05)) + 3;
          pts.push(px, py - w / 2); pb.unshift(px, py + w / 2);
        }
        R.poly(pts.concat(pb), { fill: { screenLin: [bx0, 0, bx0 + bw, 0], stops: [[0, BR.cyan], [1, BR.magenta]] }, glow: 0.8 });
      }
      // CTA: il pulsante si accende quando la pallina lo colpisce (centrato sull'asse)
      const pa = seg(t, tCta, tCta + 0.08);
      if (pa > 0) {
        const size = Math.min(36, (36 * (COLW - 110)) / R.measure(CTA_TXT, 'glyB', 36, 0));
        const bw2 = R.measure(CTA_TXT, 'glyB', size, 0) + 100, bh = 92;
        const k = lerp(1.25, 1, E.outBack(seg(t, tCta, tCta + 0.35), 2)) * (1 + 0.02 * Math.sin((t - tCta) * 6) * seg(t, tCta + 0.8, tCta + 1.2));
        R.with([k, 0, 0, CX * (1 - k), 0, k, 0, BY * (1 - k), 0, 0, 1, 0], () => {
          R.rrect(CX - bw2 / 2, BY - bh / 2, bw2, bh, bh / 2, { stroke: BR.magenta, lw: 6, alpha: pa, glow: 1.2, glowOnly: true });
          R.rrect(CX - bw2 / 2, BY - bh / 2, bw2, bh, bh / 2, { fill: { screenLin: [CX - bw2 / 2, 0, CX + bw2 / 2, 0], stops: [[0, BR.magenta], [1, BR.violet]] }, alpha: pa, shadow: ['rgba(0,0,0,0.45)', 30, 0, 10], knock: true });
          R.text(CTA_TXT, CX, BY, { font: 'glyB', size, align: 'center', v: 'cap', fill: BR.white, alpha: pa });
        });
      }
      const ua = seg(t, tUrl, tUrl + 0.3);
      if (ua > 0) R.text('esports.fitp.it', CX, UY + (1 - E.outExpo(seg(t, tUrl, tUrl + 0.4))) * 20, { font: 'glyM', size: 40, align: 'center', v: 'cap', fill: BR.white, alpha: ua, tracking: 0.02 });
      // loghi piccoli, sullo stesso asse della colonna
      const la = seg(t, tLogo, tLogo + 0.35);
      if (la > 0) {
        const y = LOGO_Y, eh = 64, ew = eh * (1278 / 717), fh = 56, fw = fh * (1400 / 689), gap = 42;
        const x0 = CX - (ew + gap + fw) / 2;
        R.image(R.img.logo, x0, y - eh / 2, ew, eh, { sub: 1, alpha: la });
        R.band(x0 + ew + gap / 2, y - 26, x0 + ew + gap / 2, y + 26, 1.5, { fill: '#ffffff', alpha: la * 0.35 });
        R.image(R.img.fitp_neg, x0 + ew + gap, y - fh / 2, fw, fh, { sub: 1, alpha: la });
      }
    });
    impact(R, CX - 180, BY, seg(t, tCta, tCta + 0.7), { scale: 1.6, col: BR.magenta });
    flyBall(R, path, t, { trail: 0.14 });
    const wh = 1 - E.outCubic(seg(t, t0, t0 + 0.3));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: '#ffffff', alpha: wh }));
  }

  function fx(t) {
    const f = { grain: 0.04 };
    if (t < tLand + 0.2) f.mb = 7;
    if (t >= m0 && t < m1) f.mb = 6;
    if (t > tBounce - 0.4 && t < tCta + 0.1) f.mb = 7;
    if (t >= tCta && t < tCta + 0.3) { const u = (t - tCta) / 0.3; f.flash = [BR.magenta, 0.3 * (1 - u)]; f.ca = 0.008 * (1 - u); }
    return f;
  }

  return { t0, t1: t1 + 0.1, draw, fx };
}
