// SCENE 3-4-5 · «Diventa protagonista. Partecipa ai tornei ufficiali eSports e mettiti alla prova.»
// La barra piena si apre come un oggetto sbloccato: la Tessera eSports FITP 2027. La tessera vola nello smartphone
// dentro myFITP («Le Mie Tessere»); poi Tornei → FITP eSeries by BMW → REGISTRATI → conferma → notifica del match.
// L'interfaccia è quella reale di myFITP (mfui.js), con dati inventati.
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T, apply } from '../engine/math.js';
import { PAL } from '../engine/kit.js';
import { camTrack, shake, bgNight, dust, textRows } from './common.js';
import { SW, SH, HX, HY, MF, TOUR, phone, scrMenu, scrTornei, scrTorneo, dialog, notification, tap, listCard, LIST_CARD, MENU_ICON, REG_BTN, DLG_OK, icon } from './mfui.js';

const CARD = { w: 340, h: 226 };

export function act2(S, TL) {
  const s3 = S.s3, s4 = S.s4, s5 = S.s5;
  // tempi chiave
  const ph0 = s4.t0 - 0.3, ph1 = s4.t0 + 0.35;     // arriva il telefono
  const fly0 = s4.t0 - 0.12, fly1 = s4.t0 + 0.42;  // la tessera entra in «Le Mie Tessere»
  const tNav = s4.t0 + 0.85;                        // tocco su Tornei (barra in basso)
  const tCard = s4.t0 + 1.5;                        // tocco sul torneo
  const tDet = tCard + 0.38;                        // entra il dettaglio del torneo
  const tReg = s5.t0 + 0.22;                        // tocco su REGISTRATI
  const tOk = s5.t0 + 0.7;                          // tocco su Conferma
  const tNot = s5.t0 + 1.12;                        // arriva la notifica del match
  const tTapN = s5.t0 + 1.45;                       // tocco sulla notifica
  const zoom0 = s5.t1 - 0.34;

  // posa del telefono nel mondo
  function phonePose(t) {
    const a = E.outExpo(seg(t, ph0, ph1));
    const idle = Math.sin(t * 0.9);
    return TRS([lerp(1000, 250, a), lerp(1150, 20, a), lerp(400, 0, a)], [deg(lerp(30, 4 + idle * 1.5, a)), deg(lerp(-50, -13 + idle * 3, a)), deg(lerp(14, 0, a))], 1);
  }
  const phoneAt = (t, x, y, z = 0) => apply(phonePose(t), x, y, z);

  const notifW = () => phoneAt(zoom0, -130, -HY + 40, -40);
  const camKeys = [
    { t: s3.t0, eye: [0, 0, -1600], tgt: [0, 0, 0], f: 1600 },
    { t: s3.t0 + 0.6, eye: [0, -20, -1500], tgt: [0, -10, 0], f: 1600, ease: 'outCubic' },
    { t: s4.t0 - 0.25, eye: [40, -30, -1450], tgt: [0, -10, 0], f: 1600 },
    { t: s4.t0 + 0.5, eye: [90, -10, -1450], tgt: [190, 0, 0], f: 1600, ease: 'inOutCubic' },
    { t: tCard, eye: [150, 30, -1180], tgt: [235, 10, 0], f: 1600 },
    { t: s5.t0, eye: [90, 60, -1300], tgt: [215, 50, 0], f: 1600 },
    { t: tOk - 0.1, eye: [120, 190, -1180], tgt: [220, 170, 0], f: 1600, ease: 'inOutCubic' },
    { t: tTapN - 0.1, eye: [150, -170, -1150], tgt: [230, -300, 0], f: 1600, ease: 'inOutCubic' },
    { t: zoom0, eye: [170, -230, -1080], tgt: [230, -330, 0], f: 1600 },
  ];
  function camAt(t) {
    if (t < zoom0) return camTrack(camKeys, t, shake(t, [[s3.t0, 10, 0.4], [ph1, 6, 0.3]]));
    // tuffo dentro la notifica: porta alla partita
    const u = E.inCubic(seg(t, zoom0, s5.t1));
    const n = notifW();
    const k0 = camKeys[camKeys.length - 1];
    const eye = [lerp(k0.eye[0], n[0], u), lerp(k0.eye[1], n[1], u), lerp(k0.eye[2], n[2] - 160, u)];
    const tgt = [lerp(k0.tgt[0], n[0], u), lerp(k0.tgt[1], n[1], u), 0];
    return camTrack([{ t: 0, eye, tgt, f: 1600 }], 0);
  }

  // ---------------------------------------------------------------- tessera (oggetto sbloccato)
  function cardPose(t) {
    const a = E.outExpo(seg(t, s3.t0, s3.t0 + 0.45));
    let pos = [lerp(510, 0, a), lerp(205, -10, a), lerp(0, -60, a)];
    let sx = lerp(1.706, 2.7, a), sy = lerp(0.221, 2.7, E.outBack(seg(t, s3.t0 + 0.05, s3.t0 + 0.5), 1.3));
    const idle = seg(t, s3.t0 + 0.3, s3.t0 + 0.8);
    let rot = [deg(6 * Math.sin(t * 1.3)) * idle, deg(-10 + 12 * Math.sin(t * 0.9)) * idle, deg(-2) * idle];
    // volo dentro il telefono, sull'icona «Le Mie Tessere»
    const f = seg(t, fly0, fly1);
    if (f > 0) {
      const u = E.inOutCubic(f);
      const [ix, iy] = MENU_ICON(1);
      const dst = phoneAt(t, ix, iy + 4, -12);
      const arc = Math.sin(u * Math.PI) * 180;
      pos = [lerp(pos[0], dst[0], u), lerp(pos[1], dst[1], u) - arc, lerp(pos[2], dst[2], u) - arc * 0.6];
      sx = sy = lerp(2.7, 0.12, E.inCubic(f));
      rot = [lerp(rot[0], deg(4), u), lerp(rot[1], deg(-13) - Math.PI * 2, u), lerp(rot[2], 0, u)];
    }
    return { pos, rot, sc: [sx, sy, 1], gone: f >= 1 };
  }

  function cardFace(R, t) {
    const w = CARD.w, h = CARD.h;
    R.clipPoly(R.rrPts(-w / 2, -h / 2, w, h, 16));
    R.image(R.img.tessera, -w / 2, -h / 2, w, h, { sub: 6 });
    const sweep = ((t * 0.6) % 1.6) - 0.3, sx = -w / 2 + sweep * w * 1.4;
    R.poly([sx - w * 0.25, -h / 2, sx - w * 0.1, -h / 2, sx - w * 0.35, h / 2, sx - w * 0.5, h / 2], { fill: { lin: [sx - w * 0.5, 0, sx - w * 0.1, 0], stops: [[0, 'rgba(0,252,252,0)'], [0.5, 'rgba(255,255,255,0.5)'], [1, 'rgba(244,8,188,0)']] }, blend: 'screen' });
    R.unclip();
    R.rrect(-w / 2, -h / 2, w, h, 16, { stroke: { lin: [-w / 2, -h / 2, w / 2, h / 2], stops: [[0, PAL.cyan], [1, PAL.magenta]] }, lw: 2.4, glow: 0.8 });
  }

  function drawCard(R, t) {
    const P = cardPose(t);
    if (P.gone) return;
    const fr = seg(t, s3.t0 + 0.2, s3.t0 + 0.5) * (1 - seg(t, fly0, fly0 + 0.15));
    if (fr > 0) R.with(TRS([P.pos[0] + 26, P.pos[1] - 18, P.pos[2] + 40], P.rot, P.sc), () => R.rrect(-CARD.w / 2 - 14, -CARD.h / 2 - 14, CARD.w + 28, CARD.h + 28, 22, { stroke: PAL.magenta, lw: 2.2, glow: 1, alpha: fr }));
    R.with(TRS(P.pos, P.rot, P.sc), () => {
      const a0 = R.proj(-170, -113), b0 = R.proj(170, -113), d0 = R.proj(-170, 113);
      const front = a0 && b0 && d0 ? (b0[0] - a0[0]) * (d0[1] - a0[1]) - (b0[1] - a0[1]) * (d0[0] - a0[0]) > 0 : true;
      R.rrect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 16, { fill: '#000', alpha: 0.35, blur: 24 });
      if (front) cardFace(R, t);
      else R.rrect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 16, { fill: '#1b0f45', stroke: PAL.magenta, lw: 2.4, glow: 0.8 });
      const fl = 1 - seg(t, s3.t0, s3.t0 + 0.35);
      if (fl > 0) R.rrect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 16, { fill: PAL.magenta, alpha: fl, glow: 1 });
    });
  }

  // raggi da «oggetto raro» dietro alla tessera
  function lootRays(R, t) {
    const a = seg(t, s3.t0 + 0.1, s3.t0 + 0.4) * (1 - seg(t, fly0 - 0.1, fly0 + 0.15));
    if (a <= 0) return;
    const pc = R.camW([0, -10, -60]);
    const [cx, cy] = R.projC(pc);
    R.hud(() => {
      for (let i = 0; i < 18; i++) {
        const a0 = (i / 18) * Math.PI * 2 + t * 0.35, a1 = a0 + 0.07;
        R.poly([cx, cy, cx + Math.cos(a0) * 1500, cy + Math.sin(a0) * 1500, cx + Math.cos(a1) * 1500, cy + Math.sin(a1) * 1500],
          { fill: { screenLin: [cx, cy, cx + Math.cos(a0) * 900, cy + Math.sin(a0) * 900], stops: [[0, rgba(i % 2 ? PAL.magenta : '#ffffff', 0.22 * a)], [1, 'rgba(0,0,0,0)']] }, blend: 'lighter' });
      }
    });
  }

  // ---------------------------------------------------------------- schermo del telefono
  function screen(R, t) {
    const slideT = E.inOutCubic(seg(t, tNav + 0.05, tNav + 0.35));
    const slideD = E.inOutCubic(seg(t, tDet, tDet + 0.3));
    // MENU (con la tessera appena aggiunta)
    if (slideT < 1) R.with(T(-slideT * SW * 0.3, 0, 0), () => {
      scrMenu(R, t, { hot: 1, hotA: env(t, fly1 - 0.05, fly1 + 0.05, fly1 + 0.3, fly1 + 0.55) });
      const ta = env(t, fly1, fly1 + 0.12, tNav - 0.05, tNav + 0.1);
      if (ta > 0) {
        R.rrect(-150, 272, 300, 40, 20, { fill: MF.navy, alpha: ta * 0.95 });
        R.text('Tessera eSports 2027 aggiunta', 0, 292, { font: 'rob500', size: 13.5, align: 'center', v: 'cap', fill: '#fff', alpha: ta });
      }
      tap(R, 0, HY - 34, t - tNav);
    });
    // TORNEI
    if (slideT > 0 && slideD < 1) R.with(T((1 - slideT) * SW - slideD * SW * 0.3, 0, 0), () => {
      const pr = env(t, tCard - 0.06, tCard, tCard + 0.12, tCard + 0.3);
      scrTornei(R, t, { appear: t - (tNav + 0.18), press: 0, pressA: pr, lift: seg(t, tCard + 0.04, tCard + 0.3) });
      const L = LIST_CARD(0);
      tap(R, L.x + L.w * 0.55, L.y + L.h * 0.45, t - tCard);
    });
    // DETTAGLIO TORNEO
    if (slideD > 0) R.with(T((1 - slideD) * SW, 0, 0), () => {
      const reg = env(t, tReg - 0.06, tReg, tReg + 0.1, tReg + 0.25);
      const done = E.outCubic(seg(t, tOk + 0.36, tOk + 0.58));
      scrTorneo(R, t, { reg, done, count: 27 - (t - tDet) });
      tap(R, REG_BTN.x + 40, REG_BTN.y, t - tReg);
      const da = seg(t, tReg + 0.08, tReg + 0.28) * (1 - seg(t, tOk + 0.3, tOk + 0.42));
      dialog(R, t, { a: da, press: env(t, tOk - 0.05, tOk, tOk + 0.08, tOk + 0.2), spin: seg(t, tOk + 0.04, tOk + 0.3) });
      if (da > 0) tap(R, DLG_OK.x, 30 + 66, t - tOk);
    });
  }

  // la card del torneo toccata si solleva fuori dallo schermo (livello 3D), poi rientra nel dettaglio
  function liftedCard(R, t) {
    const u = seg(t, tCard + 0.04, tCard + 0.3);
    const out = seg(t, tDet + 0.05, tDet + 0.32);
    if (u <= 0 || out >= 1) return;
    const L = LIST_CARD(0);
    const e = E.outBack(u, 1.4);
    const cx = L.x + L.w / 2, cy = L.y + L.h / 2;
    R.with(TRS([cx - e * 60 + out * 40, cy - e * 20 - out * 120, -e * 120 + out * 60], [deg(-6 * e), deg(10 * e), 0], 1 + 0.12 * e - out * 0.2), () => {
      listCard(R, { x: -L.w / 2, y: -L.h / 2, w: L.w, h: L.h }, undefined, { alpha: 1 - out, shadow: ['rgba(0,0,0,0.45)', 40, 0, 20] });
      R.rrect(-L.w / 2, -L.h / 2, L.w, L.h, 10, { stroke: MF.mag, lw: 3, alpha: (1 - out) * 0.9, glow: 0.8, glowColor: PAL.magenta });
    });
  }

  // la notifica esce leggermente dal vetro (livello 3D) e si allarga oltre il bordo del telefono
  function popNotification(R, t) {
    const a = seg(t, tNot, tNot + 0.18);
    if (a <= 0) return;
    const drop = (1 - E.outBack(a, 1.6)) * -70;
    const pop = E.outCubic(seg(t, tNot + 0.1, tNot + 0.35));
    R.with(TRS([0, drop + pop * 6, -pop * 40], [0, 0, 0], 1 + pop * 0.1), () => {
      notification(R, t, a, { press: env(t, tTapN - 0.05, tTapN, tTapN + 0.1, tTapN + 0.25) });
      tap(R, -120, -HY + 40, t - tTapN);
    });
  }

  // etichette galleggianti accanto al telefono (i badge del torneo, fuori dallo schermo)
  function chips(R, t) {
    const a = seg(t, tDet + 0.25, tDet + 0.5) * (1 - seg(t, tOk - 0.25, tOk + 0.05));
    if (a <= 0) return;
    const L = [[TOUR.ora, 'clock', MF.badge, -420, -170, 0], ['1v1', 'trophy', MF.badge, -520, -30, 0.08], [TOUR.posti, 'people', MF.badge, -400, 90, 0.16], [TOUR.livello, 'star', MF.mag, -520, 230, 0.24]];
    for (const [txt, ic, col, x, y, dl] of L) {
      const k = E.outBack(seg(t, tDet + 0.25 + dl, tDet + 0.55 + dl), 1.8);
      if (k <= 0) continue;
      const w = R.measure(txt, 'rob500', 34, 0) + 96;
      R.with(TRS([x + 250 + Math.sin(t * 1.3 + x) * 8, y + Math.cos(t * 1.1 + y) * 8, -120 - dl * 200], [deg(4), deg(-18), deg(-3 + dl * 10)], k), () => {
        R.rrect(-w / 2, -32, w, 64, 32, { fill: col, alpha: a, shadow: ['rgba(0,0,0,0.4)', 30, 0, 12] });
        R.rrect(-w / 2, -32, w, 64, 32, { stroke: '#ffffff', lw: 2, alpha: a * 0.5, glow: 0.5, glowColor: col === MF.mag ? PAL.magenta : PAL.cyan });
        icon(R, ic, -w / 2 + 40, 0, 32, '#fff', a);
        R.text(txt, -w / 2 + 70, 0, { font: 'rob500', size: 34, v: 'cap', fill: '#fff', alpha: a });
      });
    }
  }

  // ---------------------------------------------------------------- disegno
  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    bgNight(R, t, { c1: '#3b1f7a', c2: PAL.magenta });
    dust(R, t, [-1400, -900, -600, 1400, 900, 1400], 80, 5, { a: 0.5 });
    const y27 = seg(t, s3.t0 + 0.1, s3.t0 + 0.4) * (1 - seg(t, fly0, fly1));
    if (y27 > 0) R.with(T(0, 0, 900), () => R.text('2027', 0, 0, { font: 'unb900', size: 820, align: 'center', v: 'cap', stroke: 'rgba(255,255,255,0.35)', lw: 2.4, alpha: y27, tracking: -0.04,
      per: (i) => ({ y: (1 - E.outExpo(seg(t, s3.t0 + 0.1 + i * 0.05, s3.t0 + 0.5 + i * 0.05))) * 300 }) }));
    const tr = seg(t, ph1, ph1 + 0.4) * (1 - seg(t, zoom0, s5.t1));
    if (tr > 0) R.hud(() => textRows(R, 'TORNEI UFFICIALI', t, { rows: 3, size: 200, alpha: tr * 0.6, style: (r) => (r === 1 ? { fill: 'rgba(244,8,188,0.10)' } : { stroke: 'rgba(255,255,255,0.14)', lw: 1.6 }) }));
    lootRays(R, t);
    if (t >= ph0) {
      R.push(phonePose(t));
      R.with(T(30, 40, 60), () => R.rrect(-230, -460, 460, 920, 60, { fill: '#000', alpha: 0.45, blur: 40 }));
      phone(R, t, () => screen(R, t));
      liftedCard(R, t);
      popNotification(R, t);
      R.pop();
    }
    chips(R, t);
    drawCard(R, t);
    // etichette della tessera sbloccata
    const lb = seg(t, s3.t0 + 0.4, s3.t0 + 0.7) * (1 - seg(t, fly0 - 0.15, fly0 + 0.05));
    if (lb > 0) R.hud(() => {
      R.rrect(W / 2 - 150, 80, 300, 50, 25, { fill: PAL.magenta, alpha: lb, glow: 0.5 });
      R.text('OGGETTO SBLOCCATO', W / 2, 105, { font: 'mono800', size: 20, align: 'center', v: 'cap', fill: '#ffffff', tracking: 0.16, alpha: lb });
      R.text('TESSERA eSPORTS FITP · 2027', W / 2, H - 150, { font: 'mono800', size: 24, align: 'center', v: 'cap', fill: '#ffffff', tracking: 0.3, alpha: lb,
        per: (i) => ({ a: seg(t, s3.t0 + 0.45 + i * 0.012, s3.t0 + 0.55 + i * 0.012) }) });
    });
  }

  function fx(t) {
    const f = {};
    if (t < s3.t0 + 0.5) f.mb = 6;
    if (t >= ph0 && t < fly1 + 0.1) f.mb = 7;
    if (t >= tNav && t < tNav + 0.4) f.mb = 5;
    if (t >= tDet && t < tDet + 0.35) f.mb = 5;
    if (t >= zoom0) { f.mb = 10; f.ca = 0.012 * seg(t, zoom0, s5.t1); }
    return f;
  }

  return { t0: s3.t0, t1: s5.t1, draw, fx };
}
