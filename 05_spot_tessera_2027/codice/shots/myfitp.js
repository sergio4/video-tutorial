// 06 · myFITP: «Scarica myFITP e iscriviti ai prossimi tornei».
// Un solo messaggio a sinistra; nel telefono l'app scorre veloce e mostra più schermate possibili:
// download → home → menu (le tue iscrizioni) → elenco tornei → torneo → REGISTRATI → SEI ISCRITTO.
// Ogni schermata entra dal basso come uno scorrimento; il contenuto scorre anche dentro la schermata.
// Alla fine la pallina esce dallo schermo verso la camera e porta alla partita (→ 07).
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, TRS, T } from '../engine/math.js';
import { BR, brandBg, kin } from './type.js';
import { stage } from './mondo.js';
import { MF, SW, SH, HX, HY, header, navBar, scrMenu, scrTornei, scrTorneo, fingerTrack, tap, REG_BTN, LIST_CARD } from './mfui.js';
import { phone3D, floor } from './device.js';
import { checkMark } from '../engine/kit.js';
import { flyBall } from './ball.js';

export function myfitp(S, TL) {
  const g = S.g, t0 = g.t0, t1 = g.t1;
  const ph1 = t0 + 0.35;                                    // il telefono è arrivato
  const dl0 = t0 + 0.15, dl1 = t0 + 0.6;                    // download
  const SC = [t0 + 0.72, t0 + 1.25, t0 + 1.8, t0 + 2.45];   // home, menu, tornei, torneo
  const tReg = t0 + 2.95;                                   // tocco su REGISTRATI
  const tBall = t1 - 0.65;
  const out0 = t1 - 0.35;
  const NAV = { x: 0, y: HY - 32 };
  const LC = LIST_CARD(0), CARD = { x: LC.x + LC.w / 2, y: LC.y + LC.h / 2 };

  function pose(t) {
    const a = E.outExpo(seg(t, t0, ph1)), o = E.inCubic(seg(t, out0, t1));
    const ry = deg(lerp(-30, -14, a) + 3 * Math.sin((t - t0) * 0.9) - o * 30);
    return { M: TRS([lerp(1000, 430, a) + o * 900, -10 + Math.sin(t * 1.2) * 6, lerp(500, 0, a)], [deg(2), ry, 0], 0.86), ry };
  }

  function splash(RR, t) {
    RR.rect(-HX, -HY, SW, SH, { fill: MF.blue });
    const lw = 220, lh = lw * (34 / 112);
    RR.image(RR.img.mf_logo, -lw / 2, -120 - lh / 2, lw, lh, { sub: 2 });
    const p = E.inOutCubic(seg(t, dl0, dl1));
    RR.circle(0, 60, 58, { stroke: 'rgba(255,255,255,0.25)', lw: 8 }, 48);
    if (p > 0) RR.arc(0, 60, 58, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p, { stroke: '#ffffff', lw: 8 }, 64);
    if (t < dl1) {
      RR.band(0, 34, 0, 76, 6, { fill: '#ffffff' });
      RR.line([-18, 60, 0, 80, 18, 60], { stroke: '#ffffff', lw: 6 });
    } else checkMark(RR, 0, 60, 34, seg(t, dl1, dl1 + 0.1), { stroke: '#ffffff', lw: 6 });
  }

  function home(RR, t) {
    RR.rect(-HX, -HY, SW, SH, { fill: '#ffffff' });
    const sc = E.inOutCubic(seg(t, SC[0] + 0.1, SC[1])) * 150;   // il contenuto scorre verso l'alto
    RR.with(T(0, -sc, 0), () => {
      RR.image(RR.img.mf_banner, -HX + 16, -200, SW - 32, (SW - 32) * (195 / 348), { sub: 3 });
      RR.image(RR.img.mf_promo, -HX, 40, SW, SW * (106 / 416), { sub: 3 });
      RR.image(RR.img.mf_banner, -HX + 16, 170, SW - 32, (SW - 32) * (195 / 348), { sub: 3 });
    });
    header(RR);
    navBar(RR);
  }

  function screenAt(RR, t, k) {
    if (k === -1) return splash(RR, t);
    if (k === 0) return home(RR, t);
    if (k === 1) return RR.with(T(0, -E.inOutCubic(seg(t, SC[1] + 0.1, SC[2])) * 60, 0), () => scrMenu(RR, t, {}));
    if (k === 2) return scrTornei(RR, t, { appear: t - SC[2], press: 0, pressA: env(t, SC[3] - 0.06, SC[3], SC[3] + 0.06, SC[3] + 0.12) });
    const done = E.outCubic(seg(t, tReg + 0.15, tReg + 0.38));
    scrTorneo(RR, t, { reg: env(t, tReg - 0.06, tReg, tReg + 0.1, tReg + 0.22), done, count: 27 - (t - t0) });
  }

  // cambio di schermata: la nuova entra dal basso (0,14 s), la precedente sale e si scurisce
  function screen(RR, t) {
    let k = -1;
    SC.forEach((ts, i) => { if (t >= ts) k = i; });
    const ts = k >= 0 ? SC[k] : 0, u = k >= 0 ? E.outCubic(seg(t, ts, ts + 0.14)) : 1;
    if (u < 1) {
      RR.with(T(0, -u * SH * 0.25, 0), () => screenAt(RR, t, k - 1));
      RR.rect(-HX, -HY, SW, SH, { fill: '#000', alpha: u * 0.35 });
    }
    RR.with(T(0, (1 - u) * SH, 0), () => screenAt(RR, t, k));
  }

  function draw(R, t) {
    brandBg(R, t);
    stage(R, t, 0.45);
    const cam = new Cam();
    const orb = Math.sin((t - t0) * 0.6) * 40;
    cam.look([orb, -150, -1650], [180, 0, 0], 0, 1600);
    R.setCam(cam);
    floor(R, 1);
    const P = pose(t);
    phone3D(R, t, P.M, (RR) => {
      screen(RR, t);
      // tocchi: sezione eSports (dal menu all'elenco), torneo, REGISTRATI
      tap(RR, NAV.x, NAV.y, t - (SC[2] - 0.05), 1);
      tap(RR, CARD.x, CARD.y, t - SC[3], 1);
      fingerTrack(RR, t, [{ t: tReg, x: REG_BTN.x + 40, y: REG_BTN.y }]);
    }, { ry: P.ry });
    R.pushAbs(P.M); const q = R.proj(0, 120); R.pop();

    // un solo messaggio
    kin(R, [
      { s: 'Scarica myFITP', size: 104, hl: [8, 14], hlCol: BR.lilac },
      { s: 'e iscriviti ai', size: 80 },
      { s: 'prossimi tornei', size: 80 },
    ], 120, 400, t, t0 + 0.1, out0, { lineGap: 0.2 });
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
    for (const ts of SC) if (t > ts && t < ts + 0.16) f.mb = 7;
    if (t > tBall) f.mb = 8;
    return f;
  }

  return { t0, t1, draw, fx };
}
