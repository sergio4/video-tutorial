// SCENE 3-4-5 · «Diventa un atleta FITP. Partecipa ai tornei ufficiali eSports e mettiti alla prova.»
// La barra piena si apre nella Tessera eSports FITP; la tessera gira su se stessa e diventa il tablet
// con il sito del circuito; la pagina scorre fino ai tornei e il tap su «Iscriviti» accende la scena della coppa.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T, RY, RX } from '../engine/math.js';
import { PAL, ballScreen, checkMark } from '../engine/kit.js';
import { track, camTrack, shake, bgNight, dust, textRows } from './common.js';
import { button, ripple } from './ui.js';

const CARD = { w: 340, h: 226 };
const TAB = { w: 1040, h: 700, r: 44, sw: 980, sh: 640 };

export function act2(S, TL) {
  const s3 = S.s3, s4 = S.s4, s5 = S.s5;
  const flip0 = s4.t0 - 0.3, flip1 = s4.t0 + 0.35; // la tessera gira e diventa tablet
  const scroll0 = s5.t0 - 0.15, scroll1 = s5.t0 + 0.35; // la pagina scorre ai tornei
  const tap = s5.t0 + 0.85, ok = tap + 0.18;
  const zoom0 = s5.t1 - 0.32;

  const camKeys = [
    { t: s3.t0, eye: [0, 0, -1600], tgt: [0, 0, 0], f: 1600 },
    { t: s3.t0 + 0.6, eye: [0, -20, -1500], tgt: [0, -10, 0], f: 1600, ease: 'outCubic' },
    { t: flip0, eye: [40, -30, -1450], tgt: [0, -10, 0], f: 1600 },
    { t: s4.t0 + 0.6, eye: [-260, -120, -1750], tgt: [0, 0, 0], f: 1600, ease: 'inOutCubic' },
    { t: s5.t0, eye: [-160, -90, -1600], tgt: [20, 10, 0], f: 1600 },
    { t: tap - 0.05, eye: [-40, 60, -1150], tgt: [-60, 110, 0], f: 1600, ease: 'inOutCubic' },
    { t: zoom0, eye: [-60, 90, -1050], tgt: [-100, 130, 0], f: 1600 },
    { t: s5.t1, eye: [-150, 150, -380], tgt: [-150, 150, 0], f: 1600, ease: 'inCubic' },
  ];
  const camAt = (t) => camTrack(camKeys, t, shake(t, [[s3.t0, 10, 0.4], [tap, 5, 0.3]]));

  // posa dell'oggetto centrale: tessera, poi (a metà giro) tablet
  function objPose(t) {
    const a = E.outExpo(seg(t, s3.t0, s3.t0 + 0.45));
    const pos = [lerp(510, 0, a), lerp(205, -10, a), lerp(0, -60, a)];
    let sx = lerp(1.706, 2.7, a), sy = lerp(0.221, 2.7, E.outBack(seg(t, s3.t0 + 0.05, s3.t0 + 0.5), 1.3));
    const idle = seg(t, s3.t0 + 0.3, s3.t0 + 0.8);
    let rx = deg(6 * Math.sin(t * 1.3)) * idle, ry = deg(-10 + 12 * Math.sin(t * 0.9)) * idle, rz = deg(-2) * idle;
    // giro di 180° che scambia la tessera con il tablet
    const f = E.inOutCubic(seg(t, flip0, flip1));
    ry = lerp(ry, deg(-18), seg(t, flip1, flip1 + 0.3)) + f * Math.PI;
    rx = lerp(rx, deg(8), f);
    const tabletSc = 1.0;
    if (f > 0.5) { sx = lerp(sx, tabletSc, (f - 0.5) * 2); sy = sx; }
    return { pos, rot: [rx, ry, rz], sc: [sx, sy, 1], tablet: f > 0.5, f };
  }

  // ---------------------------------------------------------------- tessera
  function cardFace(R, t, a = 1) {
    const w = CARD.w, h = CARD.h;
    R.clipPoly(R.rrPts(-w / 2, -h / 2, w, h, 16));
    R.image(R.img.tessera, -w / 2, -h / 2, w, h, { alpha: a, sub: 6 });
    const sweep = ((t * 0.6) % 1.6) - 0.3, sx = -w / 2 + sweep * w * 1.4;
    R.poly([sx - w * 0.25, -h / 2, sx - w * 0.1, -h / 2, sx - w * 0.35, h / 2, sx - w * 0.5, h / 2], { fill: { lin: [sx - w * 0.5, 0, sx - w * 0.1, 0], stops: [[0, 'rgba(0,252,252,0)'], [0.5, 'rgba(255,255,255,0.5)'], [1, 'rgba(244,8,188,0)']] }, alpha: a, blend: 'screen' });
    R.unclip();
    R.rrect(-w / 2, -h / 2, w, h, 16, { stroke: { lin: [-w / 2, -h / 2, w / 2, h / 2], stops: [[0, PAL.cyan], [1, PAL.magenta]] }, lw: 2.4, alpha: a, glow: 0.8 });
  }

  // ---------------------------------------------------------------- tablet e sito eSports
  function tablet(R, t) {
    const { w, h, r, sw, sh } = TAB;
    for (let k = 5; k >= 1; k--) R.with(T(0, 0, k * 4), () => R.rrect(-w / 2, -h / 2, w, h, r, { fill: mixc('#15102e', '#2b2160', k / 5) }));
    R.rrect(-w / 2, -h / 2, w, h, r, { fill: '#07050f' });
    R.rrect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, r, { stroke: { lin: [-w / 2, -h / 2, w / 2, h / 2], stops: [[0, PAL.cyan], [0.5, '#8a6bff'], [1, PAL.magenta]] }, lw: 3.5, glow: 0.9 });
    R.clipPoly(R.rrPts(-sw / 2, -sh / 2, sw, sh, 18));
    site(R, t);
    R.unclip();
    R.poly([-sw / 2, -sh / 2, -sw / 2 + 260, -sh / 2, -sw / 2 + 60, sh / 2, -sw / 2, sh / 2], { fill: '#ffffff', alpha: 0.05, blend: 'screen' });
  }

  function site(R, t) {
    const { sw, sh } = TAB, x0 = -sw / 2, y0 = -sh / 2;
    R.rect(x0, y0, sw, sh, { fill: { lin: [0, y0, 0, y0 + sh], stops: [[0, '#1c0d4a'], [1, '#2a1260']] } });
    // barra di navigazione
    R.rect(x0, y0, sw, 64, { fill: '#130836' });
    const lw = 92, lh = lw * (717 / 1278);
    R.image(R.img.logo, x0 + 28, y0 + 32 - lh / 2, lw, lh, { sub: 2 });
    const nav = ['IL CIRCUITO', 'COME SI GIOCA', 'TORNEI', 'LEADERBOARD'];
    let nx = x0 + 300;
    const onT = seg(t, scroll0 - 0.25, scroll0);
    nav.forEach((n, i) => {
      const hot = i === 2 ? onT : 0;
      R.text(n, nx, y0 + 33, { font: 'mono800', size: 13, v: 'cap', fill: rgba(mixc('#b9b3ff', PAL.magenta, hot), 1), tracking: 0.08 });
      if (hot > 0) R.rect(nx, y0 + 46, R.measure(n, 'mono800', 13, 0.08) * hot, 3, { fill: PAL.magenta, glow: 0.6 });
      nx += R.measure(n, 'mono800', 13, 0.08) + 34;
    });
    R.rrect(x0 + sw - 190, y0 + 17, 120, 30, 15, { fill: PAL.cyan });
    R.text('TESSERATI', x0 + sw - 130, y0 + 32, { font: 'mono800', size: 12, align: 'center', v: 'cap', fill: '#0b0824', tracking: 0.1, knock: true });
    R.circle(x0 + sw - 44, y0 + 32, 14, { stroke: '#b9b3ff', lw: 2 });
    // contenuto che scorre: pagina hero sopra, tornei sotto
    const sc = E.inOutQuart(seg(t, scroll0, scroll1)) * (sh - 64);
    R.clipRect(x0, y0 + 64, sw, sh - 64);
    R.with(T(0, -sc, 0), () => { hero(R, t, x0, y0 + 64); tornei(R, t, x0, y0 + sh); });
    R.unclip();
  }

  function hero(R, t, x0, y0) {
    const k = (i) => seg(t, flip0 + 0.3 + i * 0.07, flip0 + 0.6 + i * 0.07);
    R.text('IL CIRCUITO eSPORTS DELLA FEDERAZIONE ITALIANA TENNIS E PADEL', x0 + 60, y0 + 90, { font: 'mono800', size: 11, v: 'cap', fill: '#b9b3ff', tracking: 0.08, alpha: k(0) });
    const lines = [['PARTECIPA AI', '#ffffff'], ['FITP ESERIES', PAL.magenta], ['BY BMW', PAL.magenta]];
    lines.forEach(([s, c], i) => {
      const u = E.outExpo(k(i + 1));
      R.clipRect(x0 + 50, y0 + 110 + i * 62, 560, 62);
      R.text(s, x0 + 58, y0 + 150 + i * 62 + (1 - u) * 60, { font: 'unb900', size: 48, v: 'cap', fill: c, tracking: -0.02, glow: c === PAL.magenta ? 0.25 : 0 });
      R.unclip();
    });
    for (let i = 0; i < 3; i++) R.rrect(x0 + 60, y0 + 330 + i * 20, [380, 340, 250][i] * k(4), 8, 4, { fill: 'rgba(255,255,255,0.18)' });
    button(R, x0 + 150, y0 + 440, 180, 48, 'TESSERATI ORA', { fill: PAL.cyan, ink: '#0b0824', r: 24, size: 14, font: 'unb900', alpha: k(5), glow: 0.4, glowColor: PAL.cyan });
    R.rrect(x0 + 260, y0 + 416, 180, 48, 24, { stroke: '#ffffff', lw: 2, alpha: k(5) });
    R.text('COME GIOCARE', x0 + 350, y0 + 440, { font: 'unb900', size: 14, align: 'center', v: 'cap', fill: '#fff', alpha: k(5) });
    // immagine: l'arte della campagna in una cornice luminosa
    const iw = 330, ih = 420, ix = x0 + TAB.sw - iw - 70, iy = y0 + 60;
    R.clipPoly(R.rrPts(ix, iy, iw, ih, 26));
    R.image(R.img.tessera, ix - 120, iy, ih * 1.507, ih, { src: [260, 0, 750, 670], sub: 4, alpha: k(2) });
    R.unclip();
    R.rrect(ix, iy, iw, ih, 26, { stroke: { lin: [ix, iy, ix + iw, iy + ih], stops: [[0, PAL.cyan], [1, PAL.magenta]] }, lw: 3, alpha: k(2), glow: 0.8 });
  }

  function tornei(R, t, x0, y0) {
    R.text('TORNEI', x0 + 60, y0 + 56, { font: 'unb900', size: 34, v: 'cap', fill: '#ffffff', tracking: -0.01 });
    R.text('APERTI ALLE ISCRIZIONI', x0 + 220, y0 + 56, { font: 'mono800', size: 12, v: 'cap', fill: PAL.cyan, tracking: 0.16 });
    ['TORNEO GP365 #3', 'TORNEO GP365 #4'].forEach((name, i) => {
      const cy = y0 + 110 + i * 230, cx = x0 + 60, cw = TAB.sw - 120, ch = 200;
      R.rrect(cx, cy, cw, ch, 22, { fill: '#14093a', stroke: 'rgba(255,255,255,0.12)', lw: 1.5 });
      R.rrect(cx + 26, cy + 24, 86, 24, 12, { fill: PAL.magenta });
      R.text('APERTO', cx + 69, cy + 36, { font: 'mono800', size: 11, align: 'center', v: 'cap', fill: '#fff', tracking: 0.1 });
      R.text(name, cx + 26, cy + 80, { font: 'unb900', size: 26, v: 'cap', fill: '#fff' });
      const meta = [['DATA', i ? '12 OTT' : '5 OTT'], ['ORA', '17:00'], ['POSTI', '256 disponibili']];
      meta.forEach(([k, v], j) => {
        R.circle(cx + 40 + j * 260, cy + 120, 12, { stroke: PAL.cyan, lw: 2 });
        R.text(k, cx + 62 + j * 260, cy + 113, { font: 'mono800', size: 10, v: 'cap', fill: '#8ea2ff', tracking: 0.1 });
        R.text(v, cx + 62 + j * 260, cy + 131, { font: 'unb700', size: 14, v: 'cap', fill: '#fff' });
      });
      const mine = i === 0;
      const pr = mine ? env(t, tap - 0.05, tap, tap + 0.08, tap + 0.22) : 0;
      const done = mine ? E.outCubic(seg(t, ok, ok + 0.2)) : 0;
      button(R, cx + cw / 2, cy + 168, cw - 52, 42, '', { press: pr, fill: rgba(mixc(PAL.cyan, PAL.ball, done), 1), r: 21, glow: 0.4 + 0.6 * done, glowColor: done > 0.5 ? PAL.ball : PAL.cyan });
      R.clipRect(cx, cy + 147, cw, 42);
      R.text('ISCRIVITI ORA SU MYFITP', cx + cw / 2, cy + 168 - done * 40, { font: 'unb900', size: 15, align: 'center', v: 'cap', fill: '#0b0824', tracking: 0.04, knock: true });
      if (done > 0) {
        R.text('ISCRITTO', cx + cw / 2 - 18, cy + 168 + (1 - done) * 40, { font: 'unb900', size: 15, align: 'center', v: 'cap', fill: '#0b0824', knock: true });
        checkMark(R, cx + cw / 2 + 62, cy + 168 + (1 - done) * 40, 22, seg(t, ok + 0.05, ok + 0.3), { stroke: '#0b0824', lw: 4, knock: true });
      }
      R.unclip();
      if (mine) ripple(R, cx + cw / 2 + 40, cy + 168, t - tap, 1);
    });
  }

  // ---------------------------------------------------------------- disegno
  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    bgNight(R, t, { c1: '#3b1f7a', c2: PAL.magenta });
    dust(R, t, [-1400, -900, -600, 1400, 900, 1400], 80, 5, { a: 0.5 });
    // 2027 gigante dietro alla tessera, poi TORNEI dietro al tablet
    const y27 = seg(t, s3.t0 + 0.1, s3.t0 + 0.4) * (1 - seg(t, flip0, flip1));
    if (y27 > 0) R.with(T(0, 0, 900), () => R.text('2027', 0, 0, { font: 'unb900', size: 820, align: 'center', v: 'cap', stroke: 'rgba(255,255,255,0.35)', lw: 2.4, alpha: y27, tracking: -0.04,
      per: (i) => ({ y: (1 - E.outExpo(seg(t, s3.t0 + 0.1 + i * 0.05, s3.t0 + 0.5 + i * 0.05))) * 300 }) }));
    const tr = seg(t, flip1, flip1 + 0.4) * (1 - seg(t, zoom0, s5.t1));
    if (tr > 0) R.hud(() => textRows(R, 'TORNEI UFFICIALI', t, { rows: 3, size: 200, alpha: tr * 0.7, style: (r) => (r === 1 ? { fill: 'rgba(244,8,188,0.10)' } : { stroke: 'rgba(255,255,255,0.14)', lw: 1.6 }) }));
    const P = objPose(t);
    // cornice luminosa sfalsata dietro alla tessera (come nello storyboard)
    if (!P.tablet) {
      R.with(TRS([P.pos[0] + 26, P.pos[1] - 18, P.pos[2] + 40], P.rot, P.sc), () => R.rrect(-CARD.w / 2 - 14, -CARD.h / 2 - 14, CARD.w + 28, CARD.h + 28, 22, { stroke: PAL.magenta, lw: 2.2, glow: 1, alpha: seg(t, s3.t0 + 0.2, s3.t0 + 0.5) }));
      R.with(TRS(P.pos, P.rot, P.sc), () => {
        const a0 = R.proj(-170, -113), b0 = R.proj(170, -113), d0 = R.proj(-170, 113);
        const front = a0 && b0 && d0 ? (b0[0] - a0[0]) * (d0[1] - a0[1]) - (b0[1] - a0[1]) * (d0[0] - a0[0]) > 0 : true;
        R.rrect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 16, { fill: '#000', alpha: 0.35, blur: 24 });
        if (front) cardFace(R, t, 1);
        else R.rrect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 16, { fill: '#1b0f45', stroke: PAL.magenta, lw: 2.4, glow: 0.8 });
        // lampo d'apertura dalla barra
        const fl = 1 - seg(t, s3.t0, s3.t0 + 0.35);
        if (fl > 0) R.rrect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 16, { fill: PAL.magenta, alpha: fl, glow: 1 });
      });
    } else {
      R.with(TRS(P.pos, [P.rot[0], P.rot[1] - Math.PI, P.rot[2]], P.sc), () => tablet(R, t));
    }
    // etichetta della tessera
    const lb = seg(t, s3.t0 + 0.45, s3.t0 + 0.75) * (1 - seg(t, flip0 - 0.1, flip0 + 0.1));
    if (lb > 0) R.hud(() => R.text('TESSERA eSPORTS FITP · 2027', W / 2, H - 150, { font: 'mono800', size: 24, align: 'center', v: 'cap', fill: '#ffffff', tracking: 0.3, alpha: lb,
      per: (i) => ({ a: seg(t, s3.t0 + 0.45 + i * 0.012, s3.t0 + 0.55 + i * 0.012) }) }));
  }

  function fx(t) {
    const f = {};
    if (t < s3.t0 + 0.5) f.mb = 6;
    if (t >= flip0 && t < flip1 + 0.2) f.mb = 6;
    if (t >= scroll0 && t < scroll1) f.mb = 6;
    if (t >= zoom0) { f.mb = 10; f.ca = 0.01 * seg(t, zoom0, s5.t1); }
    return f;
  }

  return { t0: s3.t0, t1: s5.t1, draw, fx };
}
