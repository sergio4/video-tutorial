// ATTO 2 · DISCOVERY → ENTRY → TESSERA, un unico mondo.
// Il campo che la pallina disegna è lo schermo di un telefono: la camera arretra e lo rivela,
// le linee diventano l'interfaccia myFITP, la tessera si stacca dallo schermo e diventa la chiave.
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T, RX, RY, RZ, S, mmul, apply, spline3, noise1 } from '../engine/math.js';
import { PAL, ball, ballScreen, courtLines, checkMark } from '../engine/kit.js';
import { track, camTrack, shake, bgNight, dust, textRows } from './common.js';
import { SW, SH, HX, HY, BLUE, BLUE2, PANEL, wordmark, header, statusBar, button, ripple, field, avatar, typed } from './ui.js';

const K = 25; // unità schermo per metro di campo
const BODY = { w: 420, h: 880, r: 62, d: 24 };
const SLOT = { x: 0, y: 150, w: 340, h: 226 };

export function worldAct(c, TL) {
  const social = TL.version === '30';

  // ---------------------------------------------------------------- posa del telefono (mondo)
  // piatto a terra (rx -90°) finché è un campo, poi si alza verso la camera
  const phoneKeys = [
    { t: c.t0, pos: [0, 0, 0], rot: [-90, 0, 0] },
    { t: c.rise0, pos: [0, 0, 0], rot: [-90, 0, 0] },
    { t: c.rise1, pos: [150, -40, 0], rot: [-10, -16, 3], ease: 'inOutCubic' },
    { t: c.lift, pos: [170, -30, 0], rot: [-6, -22, 2] },
    { t: c.lift + 0.9, pos: [230, 900, 250], rot: [40, -40, 18], ease: 'inCubic' },
  ];
  const phonePose = (t) => {
    const pos = track(phoneKeys, t, 'pos'), r = track(phoneKeys, t, 'rot');
    // respiro leggero durante l'interfaccia
    const b = seg(t, c.rise1 - 0.3, c.rise1 + 0.3) * (1 - seg(t, c.lift, c.lift + 0.3));
    return { pos, rot: [deg(r[0] + b * Math.sin(t * 1.1) * 2), deg(r[1] + b * Math.sin(t * 0.8) * 4), deg(r[2])] };
  };
  const phoneM = (t) => { const p = phonePose(t); return TRS(p.pos, p.rot, 1); };

  // ---------------------------------------------------------------- camera
  const camKeys = [
    { t: c.t0, eye: [0, -34, -470], tgt: [0, -20, 0], f: 1350, roll: deg(2) },
    { t: c.word1, eye: [15, -100, -560], tgt: [0, -28, 40], f: 1300, roll: 0 },
    { t: c.pull0, eye: [80, -240, -640], tgt: [0, -10, 100], f: 1250, roll: deg(-3) },
    { t: (c.pull0 + c.pull1) / 2, eye: [40, -800, -640], tgt: [0, 0, -10], f: 1300, roll: deg(-2) },
    { t: c.pull1, eye: [0, -1320, -330], tgt: [0, 0, -30], f: 1350, roll: 0 },
    { t: c.rise1, eye: [0, -140, -1850], tgt: [70, -40, 0], f: 1500, roll: 0, ease: 'inOutCubic' },
    // durante l'interfaccia la camera si avvicina ai punti dove succede qualcosa
    { t: c.type1 - 0.15, eye: [70, -70, -1330], tgt: [135, -10, 0], f: 1500, roll: deg(1) },
    { t: c.btn + 0.05, eye: [90, 10, -1300], tgt: [150, 90, 0], f: 1500, roll: deg(0.5) },
    { t: c.profile + 0.25, eye: [-20, -80, -1650], tgt: [110, -30, 0], f: 1500, roll: 0 },
    { t: c.slotTap - 0.05, eye: [90, 40, -1360], tgt: [160, 100, 0], f: 1500, roll: deg(-1) },
    { t: c.lift, eye: [-40, -110, -1780], tgt: [60, -40, 0], f: 1500, roll: 0 },
    { t: c.hero, eye: [0, -40, -1700], tgt: [0, -30, 0], f: 1500, roll: 0, ease: 'outCubic' },
    { t: c.edge, eye: [0, -30, -1650], tgt: [0, -20, 0], f: 1500, roll: 0 },
  ];
  const shakes = [[c.impact, 26, 0.6], [c.lift, 6, 0.4]];
  const camAt = (t) => camTrack(camKeys, t, shake(t, shakes));

  // ---------------------------------------------------------------- pallina dopo l'impatto
  const ballAt = (t) => {
    // coordinate locali del telefono: y verso di noi (+) o il fondo (-), z negativa = sopra lo schermo
    const u = seg(t, c.impact, c.bounce);
    if (t < c.bounce) return [lerp(0, 8, u), lerp(420, -250, E.outQuad(u)), lerp(-24, 0, E.inQuad(u))];
    const v = seg(t, c.bounce, c.bounce + 0.9);
    return [lerp(8, 30, v), lerp(-250, -520, v), -Math.sin(Math.min(v, 1) * Math.PI * 0.55) * 170];
  };

  // ---------------------------------------------------------------- campo sullo schermo
  const ignite = (y) => {
    // istante in cui la pallina passa sopra la coordinata y (in avvicinamento al fondo)
    const f = (tt) => ballAt(tt)[1];
    let lo = c.impact, hi = c.bounce;
    if (y > f(lo)) return lo;
    if (y < f(hi)) return hi;
    for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (f(m) > y) lo = m; else hi = m; }
    return lo;
  };
  const LINES = courtLines().map(([u0, v0, u1, v1]) => [u0 * K, -v0 * K, u1 * K, -v1 * K]);
  // bersagli del morph campo → interfaccia (segmenti nello schermo)
  const UIT = [
    [-HX, -HY + 118, HX, -HY + 118], [-HX + 30, 228, HX - 30, 228],
    [-HX + 30, -84, -HX + 30, -32], [HX - 30, -84, HX - 30, -32],
    [-HX + 30, 16, -HX + 30, 68], [HX - 30, 16, HX - 30, 68],
    [-HX + 30, -84, HX - 30, -84], [-HX + 30, 68, HX - 30, 68],
    [0, -250, 0, -130], [-60, 196, 60, 196], [-60, 264, 60, 264],
  ];

  function court(R, t, part) {
    const m = seg(t, c.morph0, c.morph1);
    const fadeCourt = 1 - seg(t, c.morph0 + 0.1, c.morph1);
    // superficie: blu campo dentro, fuori più scuro
    const sa = seg(t, c.impact, c.impact + 0.35) * fadeCourt;
    const edge = seg(t, c.pull0 + 0.2, c.pull1 - 0.2);
    const hl = 11.885 * K, hd = 5.485 * K;
    const cov = (y) => clamp((t - ignite(y)) / 0.25);
    if (part === 'surface') {
      R.rect(-HX, -HY, SW, SH, { fill: { rad: [0, 0, 400], stops: [[0, '#1a2a96'], [0.5, '#121b70'], [0.8, 'rgba(14,16,64,0.5)'], [1, 'rgba(10,12,48,0)']] }, alpha: sa * (1 - edge) });
      R.rect(-HX, -HY, SW, SH, { fill: { lin: [0, -HY, 0, HY], stops: [[0, '#101a6e'], [1, '#1c2c9a']] }, alpha: sa * edge });
      const surf = seg(t, ignite(hl), ignite(-hl) + 0.3);
      R.rect(-hd - 10, -hl - 10, hd * 2 + 20, hl * 2 + 20, { fill: { lin: [0, -hl, 0, hl], stops: [[0, '#2150e0'], [1, '#2a62f5']] }, alpha: sa * E.outCubic(surf) * 0.95 });
      return;
    }
    const la = 1 - seg(t, c.morph1, c.morph1 + 0.3);
    if (la <= 0) return;
    // linee: le orizzontali si accendono quando passa la pallina, le longitudinali la inseguono
    for (let i = 0; i < LINES.length; i++) {
      let [x0, y0, x1, y1] = LINES[i];
      if (Math.abs(y0 - y1) < 1) {
        const k = E.outExpo(cov(y0));
        if (k <= 0) continue;
        const mx = (x0 + x1) / 2;
        x0 = lerp(mx, x0, k); x1 = lerp(mx, x1, k);
      } else {
        const b = ballAt(Math.min(t, c.bounce))[1];
        const ya = Math.max(y0, y1), yb = Math.min(y0, y1);
        if (b > ya) continue;
        y0 = ya; y1 = Math.max(yb, t >= c.bounce ? yb : b);
      }
      if (m > 0) {
        const [tx0, ty0, tx1, ty1] = UIT[i % UIT.length];
        const e = E.inOutQuart(m);
        x0 = lerp(x0, tx0, e); y0 = lerp(y0, ty0, e); x1 = lerp(x1, tx1, e); y1 = lerp(y1, ty1, e);
      }
      const hot = clamp(1 - (t - ignite(Math.max(y0, y1))) / 0.6);
      R.band(x0, y0, x1, y1, lerp(0.065 * K, 3, m), { fill: mixc('#ffffff', PAL.cyan, m), alpha: la, glow: 0.35 + hot * 0.9 + m * 0.5, glowColor: m > 0 ? PAL.cyan : '#bfe9ff' });
    }
  }

  // rete che si alza quando la pallina la supera
  function net(R, t) {
    const k = E.outBack(seg(t, ignite(0), ignite(0) + 0.45)) * (1 - seg(t, c.pull0 + 0.3, c.pull0 + 0.8));
    if (k <= 0) return;
    const hw = 6.4 * K, hgt = 0.95 * K * 1.25 * k;
    R.with(RX(deg(90)), () => {
      for (let x = -hw; x <= hw + 0.1; x += hw / 16) R.band(x, -hgt, x, 0, 0.9, { fill: '#ffffff', alpha: 0.28 });
      for (let j = 0; j <= 4; j++) R.band(-hw, -hgt * (j / 4), hw, -hgt * (j / 4), 0.9, { fill: '#ffffff', alpha: 0.28 });
      R.band(-hw, -hgt, hw, -hgt, 3, { fill: '#ffffff', alpha: 0.95, glow: 0.6 });
      R.band(-hw - 4, -hgt - 4, -hw - 4, 0, 4, { fill: '#d8d8ff' });
      R.band(hw + 4, -hgt - 4, hw + 4, 0, 4, { fill: '#d8d8ff' });
    });
  }

  // grandi lettere 3D in fondo al campo
  function words(R, t) {
    const out = seg(t, c.pull0 + 0.1, c.pull0 + 0.7);
    if (out >= 1 || t < c.word1) return;
    R.with(mmul(T(0, -372, 0), RX(deg(90))), () => {
      R.text('CIRCUITO', 0, 0, {
        font: 'unb900', size: 74, align: 'center', base: true, tracking: -0.02,
        fill: '#ffffff', depth: 16, depthSteps: 8, side: (u) => rgba(mixc(PAL.magenta, '#3a0a5e', u), 1), glow: 0.22, alpha: 1 - E.inQuad(out),
        per: (i, n) => {
          const k = E.outBack(seg(t, c.word1 + i * 0.045, c.word1 + i * 0.045 + 0.32), 2.2);
          return { rx: deg(-92 * (1 - k)) + deg(25 * E.inCubic(out)), a: seg(t, c.word1 + i * 0.045, c.word1 + i * 0.045 + 0.08) * (1 - E.inQuad(out)) };
        },
      });
      R.text('UFFICIALE', 0, -76, {
        font: 'unb900', size: 40, align: 'center', tracking: 0.16,
        stroke: PAL.cyan, lw: 1.6, glow: 0.9, glowColor: PAL.cyan,
        per: (i, n) => {
          const k = seg(t, c.word2 + i * 0.03, c.word2 + i * 0.03 + 0.12);
          return { a: k * (1 - out) * (0.7 + 0.3 * Math.sin(t * 30 + i * 2) ** 2), y: (1 - E.outCubic(k)) * 10 };
        },
      });
    });
    // etichetta di brand che galleggia sopra
    const tg = seg(t, c.tag, c.tag + 0.3) * (1 - out);
    if (tg > 0) R.with(mmul(T(0, -372, -150), RX(deg(90))), () => {
      R.rrect(-86, -40, 172, 30, 15, { fill: PAL.magenta, alpha: tg, glow: 0.6 });
      R.text('eSPORTS FITP', 0, -25, { font: 'mono800', size: 15, align: 'center', v: 'cap', fill: '#fff', alpha: tg, tracking: 0.14 });
    });
  }

  function crowd(R, t) {
    const a = seg(t, c.impact + 0.3, c.impact + 1.2) * (1 - seg(t, c.pull0, c.pull0 + 0.5));
    if (a <= 0) return;
    for (let i = 0; i < 360; i++) {
      const tier = i % 3, ang = (i / 360) * Math.PI * 2 + tier * 0.07;
      const rx = 330 + tier * 70, ry = 560 + tier * 90;
      if (Math.sin(ang) > 0.62) continue; // niente spalti alle spalle della camera
      const p = apply(R.top(), Math.cos(ang) * rx, Math.sin(ang) * ry, -30 - tier * 42 - hash(i) * 20);
      const blink = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (2 + hash(i * 3) * 5) + i));
      const col = hash(i * 7) > 0.85 ? PAL.magenta : hash(i * 5) > 0.8 ? PAL.cyan : '#fff4d6';
      R.dot(p, 1.6 + hash(i * 11) * 1.4, { fill: col, alpha: a * blink, glow: 0.9, maxR: 6 });
    }
  }

  function flares(R, t) {
    const a = seg(t, c.impact + 0.2, c.impact + 0.8) * (1 - seg(t, c.pull0, c.pull0 + 0.6));
    if (a <= 0) return;
    const P = [[-250, -470, -240], [250, -470, -240], [-250, 460, -240], [250, 460, -240]];
    for (let i = 0; i < 4; i++) {
      const p = apply(R.top(), P[i][0], P[i][1], P[i][2]);
      const fl = a * (0.8 + 0.2 * Math.sin(t * 7 + i));
      R.flare(p, 70, '#bfe9ff', fl);
      R.flare(p, 16, '#ffffff', fl);
      // riflesso orizzontale anamorfico
      const s = R.camW(p);
      if (s[2] > 1) {
        const q = R.projC(s);
        R.hud(() => R.band(q[0] - 160, q[1], q[0] + 160, q[1], 2, { fill: PAL.cyan, alpha: fl * 0.5, glow: 0.8, blend: 'lighter' }));
      }
    }
  }

  // ---------------------------------------------------------------- telefono
  function phone(R, t, screen) {
    const rev = seg(t, c.pull0 + 0.2, c.pull1);
    // fianchi (spessore) e scocca: invisibili finché è un campo
    if (rev > 0) {
      for (let k = 6; k >= 1; k--) R.with(T(0, 0, (BODY.d * k) / 6), () => R.rrect(-BODY.w / 2, -BODY.h / 2, BODY.w, BODY.h, BODY.r, { fill: mixc('#15102e', '#2b2160', k / 6), alpha: rev }));
      R.rrect(-BODY.w / 2, -BODY.h / 2, BODY.w, BODY.h, BODY.r, { fill: '#07050f', alpha: rev });
    }
    // luce di contorno: si accende durante il pull-back
    R.rrect(-BODY.w / 2 + 1, -BODY.h / 2 + 1, BODY.w - 2, BODY.h - 2, BODY.r, {
      stroke: { lin: [-BODY.w / 2, -BODY.h / 2, BODY.w / 2, BODY.h / 2], stops: [[0, PAL.cyan], [0.5, '#8a6bff'], [1, PAL.magenta]] },
      lw: 3, alpha: rev, glow: 0.8 * rev,
    });
    R.clipPoly(R.rrPts(-HX, -HY, SW, SH, 50));
    screen(R);
    R.unclip();
    // riflesso del vetro
    const g = 0.10 * rev;
    if (g > 0.003) R.poly([-HX, -HY, -HX + 170, -HY, -HX + 20, HY, -HX, HY], { fill: '#ffffff', alpha: g * 0.5, blend: 'screen' });
  }

  // ---------------------------------------------------------------- schermate
  function screenUI(R, t) {
    const ui = seg(t, c.morph0 + 0.05, c.morph0 + 0.3);
    if (ui <= 0) return;
    // splash
    const sp = env(t, c.morph0 + 0.05, c.morph0 + 0.35, c.acct - 0.15, c.acct + 0.1);
    if (sp > 0) {
      R.rect(-HX, -HY, SW, SH, { fill: { lin: [0, -HY, 0, HY], stops: [[0, '#2f6bff'], [1, '#1230a8']] }, alpha: sp });
      const k = E.outBack(seg(t, c.morph1, c.morph1 + 0.45));
      R.with([0.6 + 0.4 * k, 0, 0, 0, 0, 0.6 + 0.4 * k, 0, -20, 0, 0, 1, 0], () => wordmark(R, 0, 0, 58, { alpha: sp * seg(t, c.morph1, c.morph1 + 0.2), glow: 0.3 }));
      const a0 = t * 7;
      R.arc(0, 150, 18, a0, a0 + 4.2, { stroke: '#fff', lw: 3, alpha: sp * 0.8 }, 30);
    }
    // account
    const ac = seg(t, c.acct - 0.1, c.acct + 0.15) * (1 - seg(t, c.profile, c.profile + 0.35));
    const slide = E.inOutCubic(seg(t, c.profile, c.profile + 0.45));
    if (ac > 0 || slide < 1) R.with(T(-SW * slide, 0, 0), () => {
      const a = seg(t, c.acct - 0.1, c.acct + 0.15);
      if (a <= 0) return;
      R.rect(-HX, -HY, SW, SH, { fill: PANEL, alpha: a });
      header(R, a);
      R.text('CREA IL TUO', -HX + 30, -HY + 170, { font: 'unb900', size: 26, v: 'cap', fill: '#fff', alpha: a * seg(t, c.acct, c.acct + 0.2) });
      R.text('ACCOUNT', -HX + 30, -HY + 206, { font: 'unb900', size: 26, v: 'cap', fill: PAL.cyan, alpha: a * seg(t, c.acct + 0.08, c.acct + 0.28) });
      avatar(R, HX - 76, -HY + 186, 38, seg(t, c.acct + 0.1, c.acct + 0.6), seg(t, c.check, c.check + 0.4), a);
      const nick = typed('TU', t, c.type1, 8);
      field(R, -40, 'NICKNAME', nick, { alpha: a * seg(t, c.acct + 0.15, c.acct + 0.35), focus: t >= c.type1 && t < c.type2, caret: t >= c.type1 - 0.3 && t < c.type2 ? (Math.sin(t * 18) > 0 ? 1 : 0) : 0 });
      const mail = typed('tu@esports.it', t, c.type2, 26);
      field(R, 70, 'EMAIL', mail, { alpha: a * seg(t, c.acct + 0.22, c.acct + 0.42), focus: t >= c.type2 && t < c.btn, caret: t >= c.type2 && t < c.btn ? (Math.sin(t * 18) > 0 ? 1 : 0) : 0 });
      // pulsante che si trasforma in conferma
      const pr = env(t, c.btn - 0.05, c.btn, c.btn + 0.08, c.btn + 0.2);
      const mo = E.inOutCubic(seg(t, c.btn + 0.12, c.check));
      const bw = lerp(SW - 60, 64, mo);
      button(R, 0, 228, bw, 64, mo < 0.3 ? 'CREA ACCOUNT' : '', { press: pr, alpha: a * seg(t, c.acct + 0.3, c.acct + 0.5), fill: mo > 0.95 ? PAL.cyan : PAL.magenta, r: 32, labelA: 1 - mo * 3, glowColor: mo > 0.95 ? PAL.cyan : undefined });
      if (t >= c.check) checkMark(R, 0, 228, 36, seg(t, c.check, c.check + 0.25), { stroke: PANEL, lw: 5, cap: 'round' });
      R.text('ACCOUNT CREATO', 0, 300, { font: 'mono800', size: 14, align: 'center', v: 'cap', fill: PAL.cyan, tracking: 0.16, alpha: a * seg(t, c.check + 0.1, c.check + 0.3) });
      ripple(R, 40, 228, t - c.btn, a);
    });
    // profilo con lo slot della tessera
    if (slide > 0) R.with(T(SW * (1 - slide), 0, 0), () => {
      R.rect(-HX, -HY, SW, SH, { fill: PANEL });
      header(R, 1);
      avatar(R, -HX + 70, -HY + 190, 40, 1, 1, 1);
      R.text('TU', -HX + 128, -HY + 176, { font: 'unb900', size: 40, v: 'cap', fill: '#fff' });
      R.text('LIV. 1 · CIRCUITO eSPORTS', -HX + 130, -HY + 214, { font: 'mono700', size: 12.5, v: 'cap', fill: '#8ea2ff', tracking: 0.08 });
      R.text('LE MIE TESSERE', -HX + 30, SLOT.y - SLOT.h / 2 - 34, { font: 'mono800', size: 13, v: 'cap', fill: '#ffffff', alpha: 0.75, tracking: 0.16 });
      const filled = seg(t, c.fill, c.fill + 0.35);
      const lifted = t >= c.lift;
      R.rrect(SLOT.x - SLOT.w / 2, SLOT.y - SLOT.h / 2, SLOT.w, SLOT.h, 18, { stroke: 'rgba(255,255,255,0.4)', lw: 2, dash: [10, 8], alpha: 1 - filled * 0.6 });
      if (filled < 1) {
        const pulse = 1 + 0.08 * Math.sin(t * 9);
        R.circle(SLOT.x, SLOT.y - 14, 26 * pulse, { fill: PAL.magenta, alpha: 1 - filled, glow: 0.6 });
        R.band(SLOT.x - 10, SLOT.y - 14, SLOT.x + 10, SLOT.y - 14, 3.5, { fill: '#fff', alpha: 1 - filled });
        R.band(SLOT.x, SLOT.y - 24, SLOT.x, SLOT.y - 4, 3.5, { fill: '#fff', alpha: 1 - filled });
        R.text('TESSERA eSPORTS FITP', SLOT.x, SLOT.y + 44, { font: 'mono800', size: 13, align: 'center', v: 'cap', fill: '#fff', alpha: (1 - filled) * 0.9, tracking: 0.1 });
      }
      if (!lifted && filled > 0) cardFace(R, SLOT.x, SLOT.y, SLOT.w, filled, t);
      ripple(R, SLOT.x, SLOT.y - 14, t - c.slotTap, 1);
      // riga sotto: i tornei che si sbloccano (anticipo del passo successivo)
      R.rrect(-HX + 30, 300, SW - 60, 64, 14, { fill: 'rgba(255,255,255,0.05)', stroke: 'rgba(255,255,255,0.12)', lw: 1.2 });
      R.text('TORNEI UFFICIALI', -HX + 50, 332, { font: 'mono800', size: 13, v: 'cap', fill: '#fff', alpha: 0.5, tracking: 0.12 });
      R.text(filled > 0.5 ? 'SBLOCCATI' : 'BLOCCATI', HX - 50, 332, { font: 'mono800', size: 13, align: 'right', v: 'cap', fill: filled > 0.5 ? PAL.cyan : '#ff5aa5', tracking: 0.12 });
    });
  }

  // faccia della tessera (arte ufficiale) in un rettangolo centrato
  function cardFace(R, x, y, w, a, t) {
    const h = w / 1.507;
    R.clipPoly(R.rrPts(x - w / 2, y - h / 2, w, h, w * 0.045));
    R.image(R.img.tessera, x - w / 2, y - h / 2, w, h, { alpha: a, sub: 6 });
    // riflesso olografico che scorre
    const sweep = ((t * 0.55) % 1.6) - 0.3;
    const sx = x - w / 2 + sweep * w * 1.4;
    R.poly([sx - w * 0.25, y - h / 2, sx - w * 0.1, y - h / 2, sx - w * 0.35, y + h / 2, sx - w * 0.5, y + h / 2], { fill: { lin: [sx - w * 0.5, y, sx - w * 0.1, y], stops: [[0, 'rgba(0,252,252,0)'], [0.5, 'rgba(255,255,255,0.55)'], [1, 'rgba(244,8,188,0)']] }, alpha: a, blend: 'screen' });
    R.unclip();
    R.rrect(x - w / 2, y - h / 2, w, h, w * 0.045, { stroke: { lin: [x - w / 2, y - h / 2, x + w / 2, y + h / 2], stops: [[0, PAL.cyan], [1, PAL.magenta]] }, lw: 2.5, alpha: a, glow: 0.7 });
  }
  function cardBack(R, x, y, w, a) {
    const h = w / 1.507;
    R.rrect(x - w / 2, y - h / 2, w, h, w * 0.045, { fill: { lin: [x - w / 2, y - h / 2, x + w / 2, y + h / 2], stops: [[0, '#2a1260'], [1, '#12082e']] }, alpha: a });
    R.rect(x - w / 2, y - h / 2 + h * 0.16, w, h * 0.14, { fill: '#05030c', alpha: a * 0.9 });
    R.image(R.img.logo, x - w * 0.22, y - h * 0.02, w * 0.44, w * 0.44 * (717 / 1278), { alpha: a, sub: 2 });
    R.text('TESSERA eSPORTS FITP · 2026', x, y + h * 0.36, { font: 'mono800', size: w * 0.036, align: 'center', v: 'cap', fill: '#fff', alpha: a * 0.8, tracking: 0.12 });
    R.rrect(x - w / 2, y - h / 2, w, h, w * 0.045, { stroke: PAL.magenta, lw: 2.5, alpha: a, glow: 0.7 });
  }

  // ---------------------------------------------------------------- tessera in 3D
  const heroPos = [0, -21, -150];
  function cardPose(t) {
    // dallo slot sullo schermo del telefono fino alla posa da protagonista
    const P = phonePose(Math.min(t, c.lift));
    const Mp = TRS(P.pos, P.rot, 1);
    const on = apply(Mp, SLOT.x, SLOT.y, -2);
    const u = E.inOutCubic(seg(t, c.lift, c.hero));
    const pos = [lerp(on[0], heroPos[0], u), lerp(on[1], heroPos[1], u), lerp(on[2], heroPos[2], u) - Math.sin(u * Math.PI) * 260];
    const spin = E.inOutQuart(seg(t, c.lift + 0.05, c.hero)) * Math.PI * 2;
    // oscillazione lenta da protagonista, poi giro di taglio (la chiave)
    const hv = seg(t, c.hero - 0.2, c.hero + 0.4);
    const eg = E.inOutCubic(seg(t, c.edge, c.edge1));
    const r0 = [
      lerp(P.rot[0], deg(8 * Math.sin(t * 1.2)) * hv, u),
      lerp(P.rot[1], deg(-14 + 10 * Math.sin(t * 0.9)) * hv, u) + spin,
      lerp(P.rot[2], deg(-3) * hv, u),
    ];
    const rot = [lerp(r0[0], deg(90), eg), lerp(r0[1], 0, eg), lerp(r0[2], 0, eg)];
    const sc = lerp(SLOT.w / 340, 2.6, u);
    return TRS(pos, rot, sc);
  }
  function card3D(R, t) {
    R.with(cardPose(t), () => {
      // lato visibile: segno dell'area proiettata
      const a = R.proj(-170, -113), b = R.proj(170, -113), d = R.proj(-170, 113);
      let front = true;
      if (a && b && d) front = (b[0] - a[0]) * (d[1] - a[1]) - (b[1] - a[1]) * (d[0] - a[0]) > 0;
      // ombra morbida
      R.rrect(-170, -113, 340, 226, 16, { fill: '#000', alpha: 0.35, blur: 24 });
      if (front) cardFace(R, 0, 0, 340, 1, t);
      else R.with(RY(Math.PI), () => cardBack(R, 0, 0, 340, 1));
    });
  }

  // ---------------------------------------------------------------- disegno
  function draw(R, t) {
    if (t >= c.split0) return;
    const cam = camAt(t);
    R.setCam(cam);
    const inUI = seg(t, c.rise1 - 0.5, c.rise1);
    bgNight(R, t, { a: 1 });
    // parola gigante dietro al telefono
    const wm = seg(t, c.rise1 - 0.4, c.rise1 + 0.4) * (1 - seg(t, c.lift, c.lift + 0.4));
    if (wm > 0) R.with(TRS([-260 + (t - c.rise1) * -18, -30, 900], [0, deg(8), 0], 1), () => {
      R.text('my', -40, 0, { font: 'unb600', size: 330, align: 'right', v: 'cap', skew: 0.2, stroke: 'rgba(255,255,255,0.5)', lw: 2, alpha: wm * 0.5 });
      R.text('FITP', -20, 0, { font: 'unb900', size: 430, v: 'cap', skew: 0.2, fill: 'rgba(255,255,255,0.07)', stroke: PAL.cyan, lw: 2, alpha: wm, glow: 0.2 });
    });
    const hr = seg(t, c.lift + 0.2, c.hero) * (1 - seg(t, c.split0 - 0.1, c.split0));
    if (hr > 0) R.hud(() => textRows(R, 'TESSERA', t, { rows: 3, size: 250, alpha: hr * (1 - seg(t, c.edge, c.edge1) * 0.5), style: (r) => (r === 1 ? { fill: 'rgba(244,8,188,0.10)' } : { stroke: 'rgba(255,255,255,0.16)', lw: 1.6 }) }));
    // polvere
    dust(R, t, [-900, -700, -500, 900, 400, 1200], 70, 3, { a: 0.45 });
    // telefono / campo
    if (t < c.lift + 1.0) {
      R.push(phoneM(t));
      phone(R, t, (R2) => {
        court(R, t, 'surface');
        screenUI(R, t);
        court(R, t, 'lines');
      });
      if (t < c.pull1) {
        crowd(R, t);
        net(R, t);
        words(R, t);
        flares(R, t);
        // pallina e scia
        if (t >= c.impact && t < c.bounce + 0.9) {
          const pts = [];
          for (let i = 0; i <= 20; i++) pts.push(apply(R.top(), ...ballAt(Math.max(c.impact, t - 0.35 + (i / 20) * 0.35))));
          R.trail(pts, { w0: 0, w1: 7, a0: 0, a1: 0.9, color: (u) => (u > 0.7 ? PAL.ball : PAL.cyan), glow: 1, maxW: 26 });
          ball(R, apply(R.top(), ...ballAt(t)), 4.2, { spin: [t * 14, t * 9, 0.2], rim: PAL.magenta });
        }
      }
      R.pop();
    }
    // tessera staccata
    if (t >= c.lift && t < c.edge1 + 0.05) card3D(R, t);
    // brillii attorno alla tessera da protagonista
    const sp = seg(t, c.hero - 0.1, c.hero + 0.4) * (1 - seg(t, c.edge, c.edge + 0.3));
    if (sp > 0) R.hud(() => {
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2 + t * 0.25 + hash(i) * 0.4;
        const rx = 560 + hash(i * 3) * 120, ry = 330 + hash(i * 5) * 80;
        const x = W / 2 + Math.cos(ang) * rx, y = H / 2 - 20 + Math.sin(ang) * ry;
        const tw = Math.max(0, Math.sin(t * (2.5 + hash(i * 7) * 3) + i * 1.7)) ** 3;
        const L = (10 + hash(i * 11) * 16) * tw;
        if (L < 1) continue;
        const col = i % 3 === 0 ? PAL.cyan : i % 3 === 1 ? PAL.magenta : '#ffffff';
        R.band(x - L, y, x + L, y, 2.2, { fill: col, alpha: sp * tw, glow: 1 });
        R.band(x, y - L, x, y + L, 2.2, { fill: col, alpha: sp * tw, glow: 1 });
      }
    });
    // etichetta sotto la tessera
    const lb = seg(t, c.hero, c.hero + 0.3) * (1 - seg(t, c.edge, c.edge + 0.2));
    if (lb > 0) R.hud(() => {
      R.text('TESSERA', W / 2, H - 150, { font: 'unb900', size: 44, align: 'center', v: 'cap', fill: '#fff', alpha: lb, tracking: 0.02 });
      R.text('eSPORTS FITP', W / 2, H - 102, { font: 'mono800', size: 20, align: 'center', v: 'cap', fill: PAL.magenta, alpha: lb, tracking: 0.3, glow: 0.4 });
    });
    // linea laser: la tessera di taglio diventa il taglio dello schermo
    laser(R, t);
  }

  const laserY = () => H / 2 - 30 * 0.0 + 0;
  function laser(R, t) {
    const k = seg(t, c.edge1 - 0.12, c.edge1 + 0.15);
    if (k <= 0 || t >= c.split0) return;
    R.hud(() => {
      const y = H / 2;
      const hw = lerp(290, W * 0.75, E.outExpo(seg(t, c.edge1, c.edge1 + 0.3)));
      R.band(W / 2 - hw, y, W / 2 + hw, y, 4, { fill: '#ffffff', alpha: k, glow: 1.4, glowColor: PAL.magenta });
      R.band(W / 2 - hw * 1.1, y, W / 2 + hw * 1.1, y, 14, { fill: PAL.cyan, alpha: k * 0.35, blend: 'lighter', glow: 0.8 });
      for (let j = 0; j < 2; j++) {
        const ph = ((t - c.edge1) * 1.6 + j * 0.5) % 1;
        const sx = lerp(W / 2 - hw, W / 2 + hw, E.inOutSine ? ph : ph);
        R.band(sx - 90, y, sx, y, 6, { fill: '#ffffff', alpha: k * 0.9 * Math.sin(ph * Math.PI), glow: 1.2, glowColor: PAL.cyan });
      }
      const la = seg(t, c.edge1 + 0.05, c.edge1 + 0.12);
      const jit = la < 1 || Math.sin(t * 90) > 0.93 ? (hash(Math.floor(t * 50)) - 0.5) * 14 : 0;
      R.text('ACCESSO', W / 2 + jit, y - 58, { font: 'unb900', size: 40, align: 'center', v: 'cap', fill: '#fff', tracking: 0.06, alpha: k * la });
      R.text('TORNEI UFFICIALI', W / 2 - jit, y + 52, { font: 'mono800', size: 24, align: 'center', v: 'cap', fill: PAL.cyan, tracking: 0.34, alpha: k * la, glow: 0.4 });
    });
  }

  // ---------------------------------------------------------------- apertura: lo schermo si divide lungo il laser
  function over(R, t) {
    if (t < c.split0 || t >= c.split1) return;
    const u = E.inOutQuart(seg(t, c.split0, c.split1));
    const y = H / 2, gap = u * (H + 80);
    R.hud(() => {
      for (const s of [-1, 1]) {
        const off = (s * gap) / 2;
        R.b.save(); R.g.save();
        R.b.beginPath(); R.g.beginPath();
        if (s < 0) { R.b.rect(0, 0, W, y + off); R.g.rect(0, 0, W / 2, (y + off) / 2); }
        else { R.b.rect(0, y + off, W, H); R.g.rect(0, (y + off) / 2, W / 2, H / 2); }
        R.b.clip(); R.g.clip();
        R.b.translate(0, off); R.g.translate(0, off / 2);
        R.b.fillStyle = '#0a0520'; R.b.fillRect(0, -H, W, 3 * H);
        const gr = R.b.createLinearGradient(0, y - 300, 0, y + 300);
        gr.addColorStop(0, 'rgba(48,24,96,0)'); gr.addColorStop(0.5, 'rgba(48,24,96,0.9)'); gr.addColorStop(1, 'rgba(48,24,96,0)');
        R.b.fillStyle = gr; R.b.fillRect(0, y - 300, W, 600);
        textRows(R, 'TESSERA', t, { rows: 3, size: 250, alpha: 0.5, style: (r) => (r === 1 ? { fill: 'rgba(244,8,188,0.10)' } : { stroke: 'rgba(255,255,255,0.16)', lw: 1.6 }) });
        R.b.restore(); R.g.restore();
        // bordo luminoso della lastra
        const ey = y + off;
        R.band(0, ey, W, ey, 3, { fill: s < 0 ? PAL.cyan : PAL.magenta, alpha: 1 - u * 0.5, glow: 1.2 });
      }
    });
  }

  function fx(t) {
    const f = {};
    if (t >= c.impact && t < c.impact + 1.2) f.mb = 5;
    if (t >= c.pull0 && t < c.rise1) f.mb = 5;
    if (t >= c.lift && t < c.hero + 0.2) f.mb = 6;
    if (t >= c.edge1 && t < c.edge1 + 0.25) { const u = (t - c.edge1) / 0.25; f.ca = 0.008 * (1 - u); f.flash = [PAL.cyan, 0.25 * (1 - u)]; }
    if (t >= c.split0 && t < c.split1) f.mb = 6;
    return f;
  }

  return { draw, over, fx };
}
