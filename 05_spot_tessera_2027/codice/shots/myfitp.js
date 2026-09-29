// 07 · myFITP: «Scarica myFITP e registrati ai tornei nella sezione eSports».
// Il testo si costruisce a sinistra; sotto, tre tappe (myFITP → eSports → Tornei) si accendono insieme al telefono:
// 1 l'app si scarica e si apre · 2 tocco sull'icona centrale della barra (sezione eSports) → elenco tornei ·
// 3 tocco sul torneo → REGISTRATI → SEI ISCRITTO. Niente tutorial: tre tocchi, un ritmo solo.
// Alla fine la pallina esce dallo schermo verso la camera e porta alla partita (→ 08).
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, TRS, T, rgba } from '../engine/math.js';
import { BR, brandBg, kin, chip } from './type.js';
import { stage } from './mondo.js';
import { MF, SW, SH, HX, HY, header, navBar, scrTornei, scrTorneo, fingerTrack, REG_BTN, LIST_CARD } from './mfui.js';
import { phone3D, floor } from './device.js';
import { checkMark } from '../engine/kit.js';
import { flyBall } from './ball.js';

export function myfitp(S, TL) {
  const g = S.g, t0 = g.t0, t1 = g.t1;
  const ph1 = t0 + 0.55;                  // il telefono è arrivato
  const dl0 = t0 + 0.35, dl1 = t0 + 1.45; // download dell'app
  const tNav = t0 + 2.05;                 // tocco sulla sezione eSports
  const tCard = t0 + 3.3;                 // tocco sul torneo
  const tReg = t0 + 4.4;                  // tocco su REGISTRATI
  const tBall = t1 - 1.0;                 // la pallina esce dallo schermo
  const out0 = t1 - 0.5;
  const NAV = { x: 0, y: HY - 32 };
  const LC = LIST_CARD(0), CARD = { x: LC.x + LC.w / 2, y: LC.y + LC.h / 2 };

  function pose(t) {
    const a = E.outExpo(seg(t, t0, ph1)), o = E.inCubic(seg(t, out0, t1));
    const ry = deg(lerp(-60, -16, a) + 5 * Math.sin((t - t0) * 0.9) - o * 30);
    return { M: TRS([lerp(1100, 430, a) + o * 900, -10 + Math.sin(t * 1.2) * 6, lerp(600, 0, a)], [deg(3), ry, deg(-1.5)], 0.86), ry };
  }

  // schermata 1: l'app si scarica e si apre (home con banner del circuito)
  function scrApp(RR, t) {
    const open = seg(t, dl1 + 0.1, dl1 + 0.4);
    RR.rect(-HX, -HY, SW, SH, { fill: MF.blue });
    if (open < 1) {
      const a = 1 - open;
      const lw = 220, lh = lw * (34 / 112);
      RR.image(RR.img.mf_logo, -lw / 2, -120 - lh / 2, lw, lh, { sub: 2, alpha: a });
      const p = E.inOutCubic(seg(t, dl0, dl1));
      RR.circle(0, 60, 58, { stroke: 'rgba(255,255,255,0.25)', lw: 8, alpha: a }, 48);
      if (p > 0) RR.arc(0, 60, 58, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p, { stroke: '#ffffff', lw: 8, alpha: a }, 64);
      const done = seg(t, dl1 - 0.05, dl1 + 0.1);
      if (done < 1) {
        RR.band(0, 34, 0, 76, 6, { fill: '#ffffff', alpha: a * (1 - done) });
        RR.line([-18, 60, 0, 80, 18, 60], { stroke: '#ffffff', lw: 6, alpha: a * (1 - done) });
      } else checkMark(RR, 0, 60, 34, 1, { stroke: '#ffffff', lw: 6, alpha: a });
    }
    if (open > 0) {
      RR.rect(-HX, -HY, SW, SH, { fill: '#ffffff', alpha: open });
      header(RR);
      RR.image(RR.img.mf_banner, -HX + 16, -200, SW - 32, (SW - 32) * (195 / 348), { sub: 3, alpha: open });
      RR.image(RR.img.mf_promo, -HX, 40, SW, SW * (106 / 416), { sub: 3, alpha: open });
      navBar(RR);
      // l'icona centrale della barra (sezione eSports) chiama il tocco
      const hint = open * (0.5 + 0.5 * Math.sin((t - dl1) * 9)) * (1 - seg(t, tNav, tNav + 0.1));
      RR.circle(NAV.x, NAV.y, 30, { stroke: MF.mag, lw: 3, alpha: hint }, 32);
    }
  }

  function screen(RR, t) {
    if (t < tNav + 0.12) return scrApp(RR, t);
    if (t < tCard + 0.15) {
      scrTornei(RR, t, { appear: t - tNav - 0.12, press: 0, pressA: env(t, tCard - 0.06, tCard, tCard + 0.08, tCard + 0.15) });
      return;
    }
    const done = E.outCubic(seg(t, tReg + 0.18, tReg + 0.42));
    scrTorneo(RR, t, { reg: env(t, tReg - 0.06, tReg, tReg + 0.1, tReg + 0.25), done, count: 27 - (t - t0) });
    const sl = 1 - E.outCubic(seg(t, tCard + 0.15, tCard + 0.4));
    if (sl > 0) RR.rect(-HX, -HY, SW, SH, { fill: '#ffffff', alpha: sl * 0.8 });
  }

  function draw(R, t) {
    brandBg(R, t);
    stage(R, t, 0.45);
    const cam = new Cam();
    const orb = Math.sin((t - t0) * 0.5) * 60;
    cam.look([orb, -150, -1650], [180, 0, 0], 0, 1600);
    R.setCam(cam);
    floor(R, 1);
    const P = pose(t);
    phone3D(R, t, P.M, (RR) => {
      screen(RR, t);
      fingerTrack(RR, t, [{ t: tNav, x: NAV.x, y: NAV.y }, { t: tCard, x: CARD.x + 40, y: CARD.y }, { t: tReg, x: REG_BTN.x + 40, y: REG_BTN.y }]);
    }, { ry: P.ry });
    R.pushAbs(P.M); const q = R.proj(0, 120); R.pop();

    // il messaggio, esatto, in tre righe
    kin(R, [
      { s: 'Scarica myFITP', size: 104, hl: [8, 14], hlCol: BR.lilac },
      { s: 'e registrati ai tornei', size: 72 },
      { s: 'nella sezione eSports', size: 72, hl: [14, 21], hlCol: BR.lilac },
    ], 120, 360, t, t0 + 0.35, out0, { lineGap: 0.45 });
    // tre tappe che si accendono con il telefono: myFITP → eSports → Tornei
    R.hud(() => {
      const steps = [['myFITP', dl0], ['eSports', tNav + 0.1], ['Tornei', tCard + 0.1]];
      let x = 120;
      steps.forEach(([s, ts], i) => {
        const a = seg(t, t0 + 1.4 + i * 0.1, t0 + 1.6 + i * 0.1) * (1 - seg(t, out0, out0 + 0.3));
        const on = seg(t, ts, ts + 0.15), cur = on * (i === 2 ? 1 : 1 - seg(t, steps[i + 1][1], steps[i + 1][1] + 0.15));
        const w = R.measure(s, 'glySB', 30, 0.08) + 36;
        chip(R, s, x, 690, a, { size: 30, col: on > 0.5 ? BR.magenta : 'rgba(255,255,255,0.35)', fill: cur > 0.5 ? BR.magenta : 'rgba(16,9,30,0.72)', ink: on > 0.5 ? BR.white : 'rgba(255,255,255,0.55)' });
        if (cur > 0) R.rrect(x - 4, 690 - 34, w + 8, 68, 34, { stroke: BR.magenta, lw: 2, alpha: a * cur, glow: 1, glowOnly: true });
        x += w + 20;
        if (i < 2) {
          R.line([x, 680, x + 12, 690, x, 700], { stroke: on > 0.5 ? BR.cyan : 'rgba(255,255,255,0.35)', lw: 3, alpha: a });
          x += 32;
        }
      });
    });
    // la pallina esce dallo schermo verso la camera
    const bp = (tt) => {
      if (tt < tBall || !q) return null;
      const u = E.inQuad(seg(tt, tBall, t1));
      return [lerp(q[0], W / 2 - 100, u), lerp(q[1], H / 2, u) - Math.sin(u * Math.PI) * 160, lerp(6, 220, u)];
    };
    flyBall(R, bp, t, { trail: 0.12 });
  }

  function fx(t) {
    const f = { grain: 0.04 };
    if (t < ph1 + 0.1) f.mb = 7;
    if (t > tBall) f.mb = 8;
    return f;
  }

  return { t0, t1, draw, fx };
}
