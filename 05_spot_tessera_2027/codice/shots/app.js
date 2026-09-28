// E · «Fatta la tessera, entri in myFITP:»  F · «ti iscrivi ai tornei ufficiali e ti metti alla prova»
// Dalla luce del portale torna la tessera e si gira: ATTIVA. Vola nello smartphone, in myFITP («Le Mie Tessere»).
// Poi il percorso di iscrizione a ritmo leggibile: il dito arriva, preme, pausa. Didascalie a sinistra del telefono.
// Interfaccia reale di myFITP (mfui.js), dati inventati.
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T, apply } from '../engine/math.js';
import { PAL } from '../engine/kit.js';
import { camTrack, shake, bgNight, bokeh } from './common.js';
import { SW, SH, HX, HY, MF, phone, scrMenu, scrTornei, scrTorneo, dialog, notification, listCard, LIST_CARD, MENU_ICON, REG_BTN, DLG_OK, fingerTrack } from './mfui.js';
import { card } from './card.js';

export function app(S, TL) {
  const e = S.e, f = S.f;
  const t0 = e.t0, t1 = f.t1, F0 = f.t0;
  const flip0 = t0 + 0.08, flip1 = t0 + 0.45, act0 = t0 + 0.35;   // la tessera si gira: ATTIVA
  const ph0 = t0 + 1.15, ph1 = t0 + 1.65;                         // arriva il telefono
  const fly0 = t0 + 1.35, fly1 = F0 + 0.2;                       // la tessera entra in «Le Mie Tessere»
  const tNav = F0 + 1.6, tCard = F0 + 3.3, tDet = tCard + 0.35;
  const tReg = F0 + 5.2, tOk = F0 + 6.35, tNot = F0 + 7.55, tTapN = F0 + 8.15;
  const zoom0 = F0 + 8.3;
  const PHX = 250;

  function phonePose(t) {
    const a = E.outExpo(seg(t, ph0, ph1));
    const idle = Math.sin(t * 0.8);
    return TRS([lerp(1300, PHX, a), lerp(300, 0, a), lerp(300, 0, a)], [deg(lerp(20, 2 + idle, a)), deg(lerp(-45, -9 + idle * 2, a)), deg(lerp(10, 0, a))], 1);
  }
  const phoneAt = (t, x, y, z = 0) => apply(phonePose(t), x, y, z);

  const camKeys = [
    { t: t0, eye: [0, 0, -1500], tgt: [0, 0, 0], f: 1600 },
    { t: ph1, eye: [-60, 0, -1620], tgt: [-60, 0, 0], f: 1600, ease: 'inOutCubic' },
    { t: tCard - 0.2, eye: [-50, 0, -1560], tgt: [-50, 0, 0], f: 1600, ease: 'inOutCubic' },
    { t: tReg - 0.3, eye: [-50, 20, -1540], tgt: [-50, 20, 0], f: 1600, ease: 'inOutCubic' },
    { t: tReg + 0.4, eye: [-20, 50, -1330], tgt: [-20, 50, 0], f: 1600, ease: 'inOutCubic' },
    { t: tOk + 0.6, eye: [-20, 60, -1330], tgt: [-20, 60, 0], f: 1600 },
    { t: tNot, eye: [-50, -20, -1540], tgt: [-50, -20, 0], f: 1600, ease: 'inOutCubic' },
    { t: zoom0, eye: [-20, -120, -1380], tgt: [0, -150, 0], f: 1600 },
  ];
  const notifW = () => phoneAt(zoom0, -130, -HY + 40, -40);
  function camAt(t) {
    if (t < zoom0) return camTrack(camKeys, t, shake(t, [[ph1, 6, 0.3]]));
    const u = E.inCubic(seg(t, zoom0, t1)), n = notifW(), k0 = camKeys[camKeys.length - 1];
    return camTrack([{ t: 0, eye: [lerp(k0.eye[0], n[0], u), lerp(k0.eye[1], n[1], u), lerp(k0.eye[2], n[2] - 160, u)], tgt: [lerp(k0.tgt[0], n[0], u), lerp(k0.tgt[1], n[1], u), 0], f: 1600 }], 0);
  }

  // tessera: dal centro si gira (ATTIVA) e poi vola nell'icona «Le Mie Tessere»
  function cardPose(t) {
    const fl = E.inOutCubic(seg(t, flip0, flip1));
    const idle = seg(t, flip1, flip1 + 0.3);
    let pos = [0, -20, -80], sc = 2.3;
    let rot = [deg(4 * Math.sin(t * 1.2)) * idle, Math.PI * fl + deg(8 * Math.sin(t)) * idle, 0];
    const u = seg(t, fly0, fly1);
    if (u > 0) {
      const v = E.inOutCubic(u), [ix, iy] = MENU_ICON(1), dst = phoneAt(t, ix, iy + 4, -12);
      pos = [lerp(pos[0], dst[0], v), lerp(pos[1], dst[1], v) - Math.sin(v * Math.PI) * 160, lerp(pos[2], dst[2], v)];
      sc = lerp(2.3, 0.12, E.inCubic(u));
      rot = [lerp(rot[0], deg(2), v), lerp(rot[1], deg(-9) + Math.PI * 2, v), 0];
    }
    return { M: TRS(pos, rot, sc), gone: u >= 1 };
  }

  function screen(R, t) {
    const slideT = E.inOutCubic(seg(t, tNav + 0.1, tNav + 0.5));
    const slideD = E.inOutCubic(seg(t, tDet, tDet + 0.4));
    if (slideT < 1) R.with(T(-slideT * SW * 0.3, 0, 0), () => {
      scrMenu(R, t, { hot: 1, hotA: env(t, fly1 - 0.05, fly1 + 0.05, tNav - 0.3, tNav) });
      const ta = env(t, fly1, fly1 + 0.15, tNav - 0.05, tNav + 0.1);
      if (ta > 0) {
        R.rrect(-160, 268, 320, 46, 23, { fill: MF.navy, alpha: ta * 0.96 });
        R.text('Tessera eSports 2027 aggiunta', 0, 291, { font: 'rob500', size: 15, align: 'center', v: 'cap', fill: '#fff', alpha: ta });
      }
    });
    if (slideT > 0 && slideD < 1) R.with(T((1 - slideT) * SW - slideD * SW * 0.3, 0, 0), () => {
      scrTornei(R, t, { appear: t - (tNav + 0.3), press: 0, pressA: env(t, tCard - 0.06, tCard, tCard + 0.3, tCard + 0.5) });
    });
    if (slideD > 0) R.with(T((1 - slideD) * SW, 0, 0), () => {
      const done = E.outCubic(seg(t, tOk + 0.45, tOk + 0.7));
      scrTorneo(R, t, { reg: env(t, tReg - 0.06, tReg, tReg + 0.1, tReg + 0.25), done, count: 27 - (t - tDet) });
      const da = seg(t, tReg + 0.15, tReg + 0.4) * (1 - seg(t, tOk + 0.35, tOk + 0.48));
      dialog(R, t, { a: da, press: env(t, tOk - 0.05, tOk, tOk + 0.08, tOk + 0.2), spin: seg(t, tOk + 0.05, tOk + 0.35) });
    });
  }

  // didascalie dei passaggi, grandi e leggibili, a sinistra del telefono
  function captions(R, t) {
    const C = [['01', 'LA TUA TESSERA', 'è in myFITP', fly1 - 0.05, tNav + 0.2], ['02', 'SCEGLI IL TORNEO', 'FITP eSeries by BMW', tNav + 0.3, tReg - 0.45], ['03', 'ISCRIVITI', 'REGISTRATI e conferma', tReg - 0.4, tNot - 0.15], ['04', 'SEI IN GARA', 'arriva il tuo match', tNot - 0.1, zoom0 + 0.05]];
    R.hud(() => {
      for (const [n, s, sub, a0, a1] of C) {
        const a = seg(t, a0, a0 + 0.15) * (1 - seg(t, a1, a1 + 0.15));
        if (a <= 0) continue;
        const u = E.outExpo(seg(t, a0, a0 + 0.4));
        R.text(n, 150, 430, { font: 'mono800', size: 28, v: 'cap', fill: PAL.cyan, alpha: a, tracking: 0.2 });
        R.clipRect(140, 455, 900, 110);
        R.text(s, 150, 510 + (1 - u) * 100, { font: 'unb900', size: 70, v: 'cap', fill: '#ffffff', alpha: a, tracking: -0.02 });
        R.unclip();
        R.text(sub, 152, 590, { font: 'unb600', size: 30, v: 'cap', fill: '#c9c3ff', alpha: a * seg(t, a0 + 0.1, a0 + 0.3) });
      }
    });
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    bgNight(R, t, { c1: '#3b1f7a', c2: PAL.magenta, c3: '#1b2cff' });
    bokeh(R, t, 0.7, (t - t0) * 25, 7);
    if (t >= ph0) {
      R.push(phonePose(t));
      R.with(T(30, 40, 60), () => R.rrect(-230, -460, 460, 920, 60, { fill: '#000', alpha: 0.45, blur: 40 }));
      phone(R, t, () => screen(R, t));
      // notifica del match, esce leggermente dal vetro
      const na = seg(t, tNot, tNot + 0.2);
      if (na > 0) {
        R.with(T(0, (1 - E.outBack(na, 1.6)) * -70, 0), () => notification(R, t, na, { press: env(t, tTapN - 0.05, tTapN, tTapN + 0.1, tTapN + 0.25) }));
      }
      // il dito: arriva, preme, rilascia
      const L0 = LIST_CARD(0);
      fingerTrack(R, t, [
        { t: tNav, x: 0, y: HY - 34 },
        { t: tCard, x: L0.x + L0.w * 0.55, y: L0.y + L0.h * 0.45 },
        { t: tReg, x: REG_BTN.x + 40, y: REG_BTN.y },
        { t: tOk, x: DLG_OK.x, y: 96 },
        { t: tTapN, x: -60, y: -HY + 40 },
      ]);
      R.pop();
    }
    const P = cardPose(t);
    if (!P.gone) { R.push(P.M); card(R, t, { act: seg(t, act0, act0 + 0.45) }); R.pop(); }
    // etichetta della tessera attiva
    const la = seg(t, act0 + 0.2, act0 + 0.4) * (1 - seg(t, fly0 - 0.1, fly0 + 0.05));
    if (la > 0) R.hud(() => R.text('TESSERAMENTO COMPLETATO', W / 2, H - 110, { font: 'unb900', size: 44, align: 'center', v: 'cap', fill: '#ffffff', alpha: la, tracking: -0.01, shadow: ['rgba(0,0,0,0.5)', 24, 0, 8] }));
    captions(R, t);
    const wh = 1 - E.outCubic(seg(t, t0, t0 + 0.3));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: '#ffffff', alpha: wh }));
  }

  function fx(t) {
    const f2 = {};
    if (t >= flip0 && t < flip1) f2.mb = 6;
    if (t >= fly0 && t < fly1 + 0.1) f2.mb = 7;
    if (t >= tNav && t < tNav + 0.45) f2.mb = 5;
    if (t >= tDet && t < tDet + 0.4) f2.mb = 5;
    if (t >= zoom0) { f2.mb = 10; f2.ca = 0.012 * seg(t, zoom0, t1); }
    return f2;
  }

  return { t0, t1, draw, fx };
}
