// SCENA 7 · «In più, approfitta degli sconti esclusivi dedicati ai tesserati.»
// Dopo il primo torneo, in myFITP si sblocca «Benefit Tesserati» (i benefit della tessera eSports si attivano
// partecipando ad almeno un torneo). Tocco sull'icona: il pass GRANDI EVENTI esce dal telefono verso di noi.
// In chiusura il pass gira di taglio e diventa la tessera fisica del cartello finale (scena 11).
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T, apply } from '../engine/math.js';
import { PAL } from '../engine/kit.js';
import { camTrack, shake, bgNight, dust, bokeh } from './common.js';
import { HX, HY, MF, phone, scrMenu, tap, MENU_ICON } from './mfui.js';

const TW = 760, TH = 300, CUT = 250; // pass: larghezza, altezza, x della perforazione (dal centro)
export const PASS_END = { pos: [0, -40, 0], sc: 1.15 }; // posa finale, ripresa dalla scena 11

function ticketShape(x0, x1, notchL, notchR) {
  const pts = [], r = 26, h = TH / 2, q = 22, n = 8;
  const arc = (cx, cy, rad, a0, a1) => { for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; pts.push(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); } };
  if (notchL) arc(x0, -h, q, Math.PI / 2, 0); else arc(x0 + r, -h + r, r, Math.PI, Math.PI * 1.5);
  if (notchR) arc(x1, -h, q, Math.PI, Math.PI / 2); else arc(x1 - r, -h + r, r, -Math.PI / 2, 0);
  if (notchR) arc(x1, h, q, -Math.PI / 2, -Math.PI); else arc(x1 - r, h - r, r, 0, Math.PI / 2);
  if (notchL) arc(x0, h, q, 0, -Math.PI / 2); else arc(x0 + r, h - r, r, Math.PI / 2, Math.PI);
  return pts;
}

export function act4(S, TL) {
  const s7 = S.s7, t0 = s7.t0, t1 = s7.t1;
  const tUnlock = t0 + 0.4;      // il lucchetto si apre
  const tTap = t0 + 0.95;        // tocco su Benefit Tesserati
  const out0 = tTap + 0.05, out1 = tTap + 0.75; // il pass esce dal telefono
  const flip0 = t1 - 0.3;        // il pass gira di taglio

  const camKeys = [
    { t: t0, eye: [120, -10, -1500], tgt: [150, -10, 0], f: 1600 },
    { t: tTap, eye: [90, -20, -1450], tgt: [140, -20, 0], f: 1600 },
    { t: out1 + 0.3, eye: [10, -20, -1620], tgt: [0, -20, 0], f: 1600, ease: 'inOutCubic' },
    { t: t1, eye: [0, -20, -1600], tgt: [0, -20, 0], f: 1600 },
  ];
  const camAt = (t) => camTrack(camKeys, t, shake(t, [[out0 + 0.25, 8, 0.4]]));

  function phonePose(t) {
    const a = E.outCubic(seg(t, t0, t0 + 0.45));
    const ex = E.inCubic(seg(t, out1 - 0.1, out1 + 0.5));
    return TRS([lerp(330, 1250, ex), lerp(30, 240, ex), lerp(220, 0, a)], [deg(3), deg(-15 - ex * 30), deg(ex * 12)], 1);
  }

  function passPose(t) {
    const u = E.outExpo(seg(t, out0, out1));
    const [ix, iy] = MENU_ICON(2);
    const st = apply(phonePose(Math.min(t, out0)), ix, iy, -15);
    const idle = seg(t, out1 - 0.1, out1 + 0.4);
    let pos = [lerp(st[0], PASS_END.pos[0] - 40, u), lerp(st[1], PASS_END.pos[1], u) - Math.sin(u * Math.PI) * 120, lerp(st[2], -80, u)];
    let rot = [deg(lerp(3, 6 * Math.sin(t * 1.1) * idle, u)), deg(-15) * (1 - u) + (1 - u) * Math.PI * 2 + deg(-12 + 8 * Math.sin(t * 0.8)) * idle, deg(-4 + 2 * Math.sin(t)) * idle];
    let sc = lerp(0.1, PASS_END.sc, u);
    // chiusura: torna al centro esatto e gira di taglio (a 90° diventa la tessera)
    const f = E.inCubic(seg(t, flip0, t1));
    if (f > 0) {
      pos = pos.map((v, i) => lerp(v, PASS_END.pos[i], E.outCubic(seg(t, flip0 - 0.3, t1))));
      rot = [lerp(rot[0], 0, f), lerp(rot[1], deg(90), f), lerp(rot[2], 0, f)];
    }
    return TRS(pos, rot, sc);
  }

  function mainPart(R, t) {
    const x0 = -TW / 2, x1 = CUT;
    R.poly(ticketShape(x0, x1, false, true), { fill: { lin: [x0, -TH / 2, x1, TH / 2], stops: [[0, '#2456e8'], [0.55, '#6a2cff'], [1, '#c01aa8']] } });
    R.text('eSPORTS FITP · PASS TESSERATI', x0 + 44, -TH / 2 + 50, { font: 'mono800', size: 16, v: 'cap', fill: '#ffffff', alpha: 0.8, tracking: 0.2 });
    const k = (i) => E.outExpo(seg(t, out0 + 0.35 + i * 0.08, out0 + 0.7 + i * 0.08));
    R.clipRect(x0, -TH / 2, x1 - x0, TH);
    R.text('GRANDI', x0 + 44, -18 + (1 - k(0)) * 90, { font: 'unb900', size: 78, v: 'cap', fill: '#ffffff', tracking: -0.03 });
    R.text('EVENTI', x0 + 44, 74 + (1 - k(1)) * 90, { font: 'unb900', size: 78, v: 'cap', fill: '#ffffff', tracking: -0.03 });
    R.unclip();
    const sw = ((t - t0) * 0.7) % 1.4 - 0.2, sx = x0 + sw * (x1 - x0) * 1.5;
    R.clipPoly(ticketShape(x0, x1, false, true));
    R.poly([sx - 90, -TH / 2, sx - 30, -TH / 2, sx - 140, TH / 2, sx - 200, TH / 2], { fill: '#ffffff', alpha: 0.35, blend: 'screen' });
    R.unclip();
    R.poly(ticketShape(x0, x1, false, true), { stroke: '#ffffff', lw: 2.5, alpha: 0.85, glow: 0.8, glowColor: PAL.cyan });
  }

  function stub(R, t) {
    const x0 = CUT, x1 = TW / 2;
    R.poly(ticketShape(x0, x1, true, false), { fill: { lin: [x0, -TH / 2, x1, TH / 2], stops: [[0, '#f408bc'], [1, '#ff5ad8']] } });
    for (let i = 0; i < 14; i++) R.band(x0 + 30 + i * 6.5 + (i % 3), TH / 2 - 90, x0 + 30 + i * 6.5 + (i % 3), TH / 2 - 40, 1.5 + (i % 3), { fill: '#1b0f45', alpha: 0.8 });
    R.text('SCONTI', (x0 + x1) / 2, -TH / 2 + 70, { font: 'unb900', size: 22, align: 'center', v: 'cap', fill: '#ffffff' });
    R.text('TESSERATI', (x0 + x1) / 2, -TH / 2 + 104, { font: 'mono800', size: 14, align: 'center', v: 'cap', fill: '#1b0f45', tracking: 0.14, knock: true });
    R.poly(ticketShape(x0, x1, true, false), { stroke: '#ffffff', lw: 2.5, alpha: 0.85, glow: 0.8, glowColor: PAL.magenta });
    for (let y = -TH / 2 + 30; y < TH / 2 - 26; y += 16) R.circle(x0, y, 3, { fill: '#ffffff', alpha: 0.8 }, 10);
  }

  function screen(R, t) {
    const unlock = E.outBack(seg(t, tUnlock, tUnlock + 0.25), 1.6);
    scrMenu(R, t, { hot: 2, hotA: env(t, tUnlock + 0.1, tUnlock + 0.2, tTap + 0.1, tTap + 0.3), lock: 1 - seg(t, tTap + 0.1, tTap + 0.3), unlock });
    // avviso in alto: benefit sbloccati
    const na = env(t, tUnlock - 0.1, tUnlock + 0.05, out1, out1 + 0.2);
    if (na > 0) {
      const y = -HY + 40 + (1 - E.outBack(seg(t, tUnlock - 0.1, tUnlock + 0.12), 1.6)) * -70;
      R.rrect(-186, y - 22, 372, 44, 22, { fill: '#3f3c44', alpha: na * 0.97, shadow: ['rgba(0,0,0,0.35)', 18, 0, 6] });
      R.circle(-162, y, 14, { fill: MF.mag, alpha: na }, 24);
      R.text('✓', -162, y, { font: 'rob700', size: 14, align: 'center', v: 'cap', fill: '#fff', alpha: na });
      R.text('Benefit Tesserati sbloccati', -140, y, { font: 'rob700', size: 13, v: 'cap', fill: '#fff', alpha: na });
      R.text('dopo il tuo primo torneo', 42, y, { font: 'rob400', size: 12, v: 'cap', fill: '#fff', alpha: na * 0.85 });
    }
    const [ix, iy] = MENU_ICON(2);
    tap(R, ix, iy + 4, t - tTap);
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    bgNight(R, t, { c1: '#3b1f7a', c2: PAL.magenta, c3: '#1b2cff' });
    bokeh(R, t, 0.9, (t - t0) * 40, 3);
    dust(R, t, [-1400, -900, -600, 1400, 900, 1400], 70, 9, { a: 0.5 });
    // telefono con myFITP
    if (t < out1 + 0.6) {
      R.push(phonePose(t));
      R.with(T(30, 40, 60), () => R.rrect(-230, -460, 460, 920, 60, { fill: '#000', alpha: 0.45, blur: 40 }));
      phone(R, t, () => screen(R, t));
      R.pop();
    }
    // pass GRANDI EVENTI
    if (t >= out0) {
      R.push(passPose(t));
      R.with(T(0, 0, 30), () => R.rrect(-TW / 2, -TH / 2, TW, TH, 26, { fill: '#000', alpha: 0.35, blur: 30 }));
      mainPart(R, t);
      stub(R, t);
      R.pop();
    }
    // nota legale (bozza da validare)
    const la = seg(t, out1, out1 + 0.3) * (1 - seg(t, flip0 - 0.1, flip0 + 0.1));
    if (la > 0) R.hud(() => R.text('Benefit attivi dopo la partecipazione ad almeno un torneo eSports FITP. Si applicano condizioni.', W / 2, H - 70, { font: 'mono500', size: 17, align: 'center', v: 'cap', fill: '#ffffff', alpha: la * 0.7, tracking: 0.02 }));
    const wh = 1 - E.outCubic(seg(t, t0, t0 + 0.35));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: '#ffffff', alpha: wh }));
  }

  function fx(t) {
    const f = {};
    if (t < t0 + 0.4) f.mb = 5;
    if (t >= out0 && t < out1) f.mb = 7;
    if (t >= flip0) f.mb = 7;
    return f;
  }

  return { t0, t1, draw, fx };
}
