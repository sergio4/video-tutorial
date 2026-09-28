// SCENA 7 · «In più, approfitta degli sconti esclusivi dedicati ai tesserati.»
// Un coriandolo si gira verso di noi e diventa il biglietto GRANDI EVENTI sopra uno stadio notturno;
// alla fine il tagliando si strappa e la fessura di luce ci porta dentro lo stadio.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T } from '../engine/math.js';
import { PAL } from '../engine/kit.js';
import { camTrack, shake } from './common.js';
import { M, P, court, crowd, towers, sky } from './arena.js';

const TW = 760, TH = 300, CUT = 250; // biglietto: larghezza, altezza, x della perforazione (dal centro)

function ticketShape(R, x0, x1, notchL, notchR) {
  // rettangolo arrotondato; sul lato della perforazione gli angoli sono mezzelune intagliate
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
  const tear = t1 - 0.55;

  const camKeys = [
    { t: t0, eye: [0, -300, -1050], tgt: [0, -300, 600], f: 1300, roll: deg(3) },
    { t: t1, eye: [110, -320, -930], tgt: [40, -310, 600], f: 1300, roll: deg(-2) },
  ];
  const camAt = (t) => camTrack(camKeys, t, shake(t, [[t0 + 0.35, 10, 0.4], [tear, 8, 0.3]]));

  function pose(t) {
    const a = E.outExpo(seg(t, t0, t0 + 0.6));
    const flip = (1 - E.outCubic(seg(t, t0, t0 + 0.7))) * Math.PI * 3;
    return TRS([lerp(-260, 0, a), lerp(-760, -300, a), lerp(2600, 0, a)], [deg(8 * Math.sin(t * 1.1)) + flip * 0.3, deg(-14 + 10 * Math.sin(t * 0.8)) + flip, deg(-6 + 2 * Math.sin(t))], lerp(0.2, 1, a));
  }

  function mainPart(R, t) {
    const x0 = -TW / 2, x1 = CUT;
    R.poly(ticketShape(R, x0, x1, false, true), { fill: { lin: [x0, -TH / 2, x1, TH / 2], stops: [[0, '#2456e8'], [0.55, '#6a2cff'], [1, '#c01aa8']] } });
    R.text('eSPORTS FITP · PASS', x0 + 44, -TH / 2 + 50, { font: 'mono800', size: 16, v: 'cap', fill: '#ffffff', alpha: 0.8, tracking: 0.2 });
    const k = (i) => E.outExpo(seg(t, t0 + 0.45 + i * 0.08, t0 + 0.8 + i * 0.08));
    R.clipRect(x0, -TH / 2, x1 - x0, TH);
    R.text('GRANDI', x0 + 44, -18 + (1 - k(0)) * 90, { font: 'unb900', size: 78, v: 'cap', fill: '#ffffff', tracking: -0.03 });
    R.text('EVENTI', x0 + 44, 74 + (1 - k(1)) * 90, { font: 'unb900', size: 78, v: 'cap', fill: '#ffffff', tracking: -0.03 });
    R.unclip();
    // riflesso olografico
    const sw = ((t - t0) * 0.7) % 1.4 - 0.2, sx = x0 + sw * (x1 - x0) * 1.5;
    R.clipPoly(ticketShape(R, x0, x1, false, true));
    R.poly([sx - 90, -TH / 2, sx - 30, -TH / 2, sx - 140, TH / 2, sx - 200, TH / 2], { fill: '#ffffff', alpha: 0.35, blend: 'screen' });
    R.unclip();
    R.poly(ticketShape(R, x0, x1, false, true), { stroke: '#ffffff', lw: 2.5, alpha: 0.85, glow: 0.8, glowColor: PAL.cyan });
  }

  function stub(R, t) {
    const x0 = CUT, x1 = TW / 2;
    R.poly(ticketShape(R, x0, x1, true, false), { fill: { lin: [x0, -TH / 2, x1, TH / 2], stops: [[0, '#f408bc'], [1, '#ff5ad8']] } });
    for (let i = 0; i < 14; i++) R.band(x0 + 30 + i * 11 + (i % 3) * 2, TH / 2 - 90, x0 + 30 + i * 11 + (i % 3) * 2, TH / 2 - 40, 2 + (i % 4), { fill: '#1b0f45', alpha: 0.8 });
    R.text('SCONTI', (x0 + x1) / 2, -TH / 2 + 70, { font: 'unb900', size: 22, align: 'center', v: 'cap', fill: '#ffffff' });
    R.text('TESSERATI', (x0 + x1) / 2, -TH / 2 + 104, { font: 'mono800', size: 14, align: 'center', v: 'cap', fill: '#1b0f45', tracking: 0.14, knock: true });
    R.poly(ticketShape(R, x0, x1, true, false), { stroke: '#ffffff', lw: 2.5, alpha: 0.85, glow: 0.8, glowColor: PAL.magenta });
    // perforazione
    for (let y = -TH / 2 + 30; y < TH / 2 - 26; y += 16) R.circle(x0, y, 3, { fill: '#ffffff', alpha: 0.8 }, 10);
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    sky(R, 0.9);
    towers(R, cam.eye[0], 1);
    crowd(R, t, cam.eye[0], 1, { z0: 14, rows: 8 });
    court(R, 0, 0, 0.9);
    // coriandoli che continuano a cadere dalla scena precedente
    R.hud(() => {
      const u = t - t0 + 1.2;
      for (let i = 0; i < 70; i++) {
        const x = hash(i * 3.3) * W + Math.sin(u * 2 + i) * 30, y = ((hash(i * 7.7) * H + u * (160 + hash(i) * 200)) % (H + 80)) - 40;
        const flip = Math.cos(u * (4 + hash(i) * 8) + i), ang = u * 3 + i, L = 8 + hash(i * 2) * 7;
        R.with([Math.cos(ang) * flip, -Math.sin(ang), 0, x, Math.sin(ang) * flip, Math.cos(ang), 0, y, 0, 0, 1, 0], () => R.rect(-L, -L * 0.45, 2 * L, L * 0.9, { fill: [PAL.cyan, PAL.magenta, PAL.ball, '#8a6bff', '#ffffff'][i % 5], alpha: 0.8 * (1 - seg(t, t0 + 1, t0 + 2.2)), glow: 0.3 }));
      }
    });
    // biglietto
    R.push(pose(t));
    R.with(T(0, 0, 30), () => R.rrect(-TW / 2, -TH / 2, TW, TH, 26, { fill: '#000', alpha: 0.35, blur: 30 }));
    mainPart(R, t);
    // il tagliando si stacca: ruota e cade
    const tu = seg(t, tear, t1);
    R.with(TRS([CUT + tu * 120, tu * tu * 260, -tu * 80], [0, deg(-40 * tu), deg(25 * tu)], 1), () => R.with(T(-CUT, 0, 0), () => stub(R, t)));
    // fessura di luce lungo la perforazione
    if (tu > 0) R.band(CUT, -TH / 2 - 400, CUT, TH / 2 + 400, lerp(4, 60, E.inCubic(tu)), { fill: '#ffffff', alpha: tu, glow: 1.5 });
    R.pop();
    const wh = E.inCubic(seg(t, t1 - 0.2, t1));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: '#ffffff', alpha: wh }));
  }

  function fx(t) {
    const f = {};
    if (t < t0 + 0.7) f.mb = 7;
    if (t >= tear && t < t1) { f.mb = 6; f.ca = 0.01 * seg(t, tear, t1); }
    return f;
  }

  return { t0, t1, draw, fx };
}
