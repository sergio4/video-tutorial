// ATTO 3 · COMPETITION: il carosello dei tornei, la scelta, l'iscrizione, il countdown, «Vai al tuo match».
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T, RY, RX, noise1 } from '../engine/math.js';
import { PAL, ballScreen, checkMark } from '../engine/kit.js';
import { track, camTrack, shake, bgNight, dust, textRows } from './common.js';
import { button, ripple, typed } from './ui.js';

const CW = 480, CH = 640, GAP = 560;
// tornei (nomi segnaposto da validare): colori dell'arte, livello, iscritti
const TOURS = [
  { name: 'WEEKEND', sub: 'OPEN', c0: '#00fcfc', c1: '#1b2cff', lvl: 'LIV. 3', n: '128', h: '17:00' },
  { name: 'IBI', sub: 'eSERIES', c0: '#ff6a2a', c1: '#f408bc', lvl: 'LIV. 12', n: '64', h: '18:30' },
  { name: 'ROAD TO', sub: 'FINALS #3', c0: '#2456e8', c1: '#00fcfc', lvl: 'LIV. 8', n: '256', h: '21:00' },
  { name: 'FITP', sub: 'eSERIES #4', c0: '#f408bc', c1: '#4a2a8c', lvl: 'LIV. 10', n: '256', h: '19:00' },
  { name: 'CHALLENGE', sub: 'LIV. 5', c0: '#e2ff2e', c1: '#00a88c', lvl: 'LIV. 5', n: '32', h: '20:00' },
  { name: 'FITP', sub: 'eSERIES #5', c0: '#8a6bff', c1: '#f408bc', lvl: 'LIV. 10', n: '256', h: '19:00' },
  { name: 'NIGHT', sub: 'CUP', c0: '#00fcfc', c1: '#301860', lvl: 'LIV. 6', n: '64', h: '22:00' },
];
const SEL = 3;

export function torneiAct(c, TL) {
  // la camera scorre veloce lungo il carosello e frena sul torneo scelto
  const camX = (t) => {
    const u = seg(t, c.t0, c.select);
    return lerp(-GAP * 5.2, 0, E.outExpo(u) * 0.985 + u * 0.015);
  };
  const camKeys = [
    { t: c.select, eye: [0, 0, -1500], tgt: [0, 0, 0], f: 1350 },
    { t: c.select + 0.5, eye: [-330, 20, -1320], tgt: [-330, 10, 0], f: 1350, ease: 'outCubic' },
    { t: c.cd0, eye: [-300, 10, -1250], tgt: [-300, 0, 0], f: 1350 },
    { t: c.cd0 + 0.5, eye: [0, -95, -990], tgt: [0, -95, 0], f: 1350, ease: 'inOutQuart' },
    { t: c.zero, eye: [0, -95, -940], tgt: [0, -95, 0], f: 1350, hold: true },
    { t: c.zero + 0.4, eye: [0, 30, -1420], tgt: [0, 30, 0], f: 1350, ease: 'outCubic' },
    { t: c.tap, eye: [0, 40, -1400], tgt: [0, 40, 0], f: 1350, hold: true },
    { t: c.t1, eye: [0, 226, -566], tgt: [0, 226, 0], f: 1350, ease: 'inCubic' },
  ];
  const shakes = [[c.tapReg, 5, 0.3], [c.zero, 6, 0.4]];
  const camAt = (t) => {
    const sh = shake(t, shakes);
    const cam = new Cam();
    if (t < c.select) {
      const x = camX(t);
      cam.look([x, 0, -1500], [x + 60, 0, 0], deg(-2) * (1 - seg(t, c.t0, c.select)), 1350);
      cam.cx += sh[0]; cam.cy += sh[1];
      return cam;
    }
    return camTrack(camKeys, t, sh);
  };

  // posa di ogni card: coverflow finché scorre, poi la scelta viene avanti e le altre si spengono
  function cardPose(i, t, cam) {
    const x = (i - SEL) * GAP;
    const rel = (x - cam.eye[0]) / 900;
    const ang = -clamp(rel, -1, 1) * 28;
    const pick = E.outBack(seg(t, c.select, c.select + 0.45), 1.4);
    if (i === SEL) {
      const flip = E.inOutCubic(seg(t, c.flip, c.flip + 0.45));
      return TRS([x, lerp(0, 10, pick), lerp(0, -260, pick)], [0, deg(lerp(ang, 0, pick)) + flip * Math.PI, 0], lerp(1, 1.08, pick));
    }
    const away = E.outCubic(seg(t, c.select, c.select + 0.6));
    return TRS([x + Math.sign(i - SEL) * away * 420, away * 60, away * 1100], [0, deg(ang + Math.sign(i - SEL) * away * 30), 0], 1);
  }

  function front(R, T0, i, t, sel) {
    const hot = sel ? seg(t, c.select, c.select + 0.3) : 0;
    const dim = sel ? 1 : 1 - 0.72 * seg(t, c.select, c.select + 0.5);
    R.rrect(-CW / 2, -CH / 2, CW, CH, 28, { fill: '#000', alpha: 0.4 * dim, blur: 30 });
    R.rrect(-CW / 2, -CH / 2, CW, CH, 28, { fill: { lin: [0, -CH / 2, 0, CH / 2], stops: [[0, '#1e1452'], [1, '#0b0824']] }, alpha: 0.96 * dim });
    // arte del torneo
    R.clipPoly(R.rrPts(-CW / 2 + 12, -CH / 2 + 12, CW - 24, 270, 20));
    R.rect(-CW / 2, -CH / 2, CW, 300, { fill: { lin: [-CW / 2, -CH / 2, CW / 2, -CH / 2 + 290], stops: [[0, T0.c0], [1, T0.c1]] }, alpha: dim });
    for (let k = 0; k < 7; k++) R.band(-CW / 2 + k * 90 - 60, -CH / 2 + 290, -CW / 2 + k * 90 + 120, -CH / 2, 2, { fill: '#fff', alpha: 0.18 * dim });
    R.text(T0.name, -CW / 2 + 34, -CH / 2 + 120, { font: 'unb900', size: 62, v: 'cap', fill: '#fff', alpha: dim, tracking: -0.03 });
    R.text(T0.sub, -CW / 2 + 36, -CH / 2 + 190, { font: 'unb900', size: 38, v: 'cap', stroke: '#fff', lw: 1.6, alpha: dim, tracking: -0.01 });
    const bp = R.proj(CW / 2 - 70, -CH / 2 + 220), bq = R.proj(CW / 2 - 70 + 26, -CH / 2 + 220);
    if (bp && bq) ballScreen(R, bp[0], bp[1], Math.hypot(bq[0] - bp[0], bq[1] - bp[1]), { spin: [1 + i, 0.5 * i, 0.2], alpha: dim, glow: 0.4 });
    R.unclip();
    // stato
    R.rrect(CW / 2 - 150, -CH / 2 + 28, 118, 34, 17, { fill: i === 4 ? '#5c5873' : '#0b0824', alpha: 0.85 * dim });
    R.text(i === 4 ? 'COMPLETO' : 'APERTO', CW / 2 - 91, -CH / 2 + 45, { font: 'mono800', size: 14, align: 'center', v: 'cap', fill: i === 4 ? '#ddd' : PAL.cyan, alpha: dim, tracking: 0.12 });
    // dati
    R.text(`DOM 27 SETT · ${T0.h}`, -CW / 2 + 34, 20, { font: 'mono700', size: 17, v: 'cap', fill: '#b9b3ff', alpha: dim, tracking: 0.06 });
    const chips = ['1v1', `${T0.n} GIOCATORI`, T0.lvl];
    let x = -CW / 2 + 34;
    chips.forEach((ch, k) => {
      const w = R.measure(ch, 'mono800', 15, 0.04) + 30;
      const isLvl = k === 2 && sel;
      R.rrect(x, 50, w, 38, 19, { fill: isLvl ? PAL.cyan : 'rgba(255,255,255,0.08)', stroke: isLvl ? undefined : 'rgba(255,255,255,0.18)', lw: 1.2, alpha: dim });
      if (isLvl) R.rrect(x, 50, w, 38, 19, { stroke: PAL.cyan, lw: 2, alpha: dim * hot, glow: 0.7, glowOnly: true });
      R.text(ch, x + w / 2, 69, { font: 'mono800', size: 15, align: 'center', v: 'cap', fill: isLvl ? '#0b0824' : '#fff', alpha: dim, tracking: 0.04, knock: isLvl });
      x += w + 10;
    });
    if (sel) R.text('IL TUO LIVELLO', x - 6, 116, { font: 'mono800', size: 12, align: 'right', v: 'cap', fill: PAL.cyan, alpha: hot, tracking: 0.14 });
    // pulsante: REGISTRATI → ISCRITTO ✓
    const pr = sel ? env(t, c.tapReg - 0.05, c.tapReg, c.tapReg + 0.08, c.tapReg + 0.22) : 0;
    const done = sel ? E.outCubic(seg(t, c.regOk, c.regOk + 0.25)) : 0;
    button(R, 0, CH / 2 - 90, CW - 68, 78, '', { press: pr, alpha: dim, fill: rgba(mixc(PAL.magenta, PAL.cyan, done), 1), r: 39, glow: 0.3 + 0.4 * hot, glowColor: done > 0.5 ? PAL.cyan : PAL.magenta });
    R.clipRect(-CW / 2, CH / 2 - 129, CW, 78);
    R.text('REGISTRATI', 0, CH / 2 - 90 - done * 60, { font: 'unb900', size: 26, align: 'center', v: 'cap', fill: '#fff', alpha: dim, tracking: 0.04 });
    if (done > 0) {
      R.text('ISCRITTO', -20, CH / 2 - 90 + (1 - done) * 60, { font: 'unb900', size: 26, align: 'center', v: 'cap', fill: '#0b0824', tracking: 0.04, knock: true });
      checkMark(R, 104, CH / 2 - 90 + (1 - done) * 60, 34, seg(t, c.regOk + 0.1, c.regOk + 0.35), { stroke: '#0b0824', lw: 5, knock: true });
    }
    R.unclip();
    if (sel) ripple(R, 60, CH / 2 - 90, t - c.tapReg, 1);
    R.rrect(-CW / 2, -CH / 2, CW, CH, 28, { stroke: { lin: [-CW / 2, -CH / 2, CW / 2, CH / 2], stops: [[0, PAL.cyan], [1, PAL.magenta]] }, lw: sel ? 3 : 1.5, alpha: (sel ? 0.5 + 0.5 * hot : 0.4) * dim, glow: sel ? 0.9 * hot : 0 });
    // popup di conferma, come nell'app (solo nella versione lunga)
    if (sel && c.confirm0) {
      const pa = env(t, c.confirm0, c.confirm0 + 0.2, c.confirmTap + 0.06, c.confirmTap + 0.26);
      if (pa > 0) {
        R.rrect(-CW / 2, -CH / 2, CW, CH, 28, { fill: 'rgba(5,3,15,0.62)', alpha: pa });
        const k = E.outBack(seg(t, c.confirm0, c.confirm0 + 0.3)) * (1 - E.inBack(seg(t, c.confirmTap + 0.08, c.confirmTap + 0.26)) * 0.3);
        R.with([k, 0, 0, 0, 0, k, 0, 90, 0, 0, 1, 0], () => {
          R.rrect(-196, -120, 392, 240, 24, { fill: '#ffffff', alpha: pa });
          R.text('CONFERMI', 0, -64, { font: 'unb900', size: 30, align: 'center', v: 'cap', fill: '#0b0824', alpha: pa, knock: true });
          R.text("L'ISCRIZIONE?", 0, -22, { font: 'unb900', size: 30, align: 'center', v: 'cap', fill: '#0b0824', alpha: pa, knock: true });
          const pr2 = env(t, c.confirmTap - 0.05, c.confirmTap, c.confirmTap + 0.06, c.confirmTap + 0.2);
          button(R, 0, 60, 300, 70, 'CONFERMA', { press: pr2, fill: PAL.cyan, ink: '#0b0824', r: 35, size: 22, font: 'unb900', alpha: pa, glow: 0.4, glowColor: PAL.cyan });
          ripple(R, 40, 60, t - c.confirmTap, pa);
        });
      }
    }
  }

  // retro della card: countdown a rulli che accelera, poi «è il tuo turno» e il pulsante
  const REM0 = 3 * 86400 + 23 * 3600 + 59 * 60 + 27;
  const remAt = (t) => {
    // fase 1: i rulli girano (giorni → 4 secondi); fase 2: gli ultimi secondi scattano ogni 1/8 di battuta
    const t2 = c.zero - 0.5;
    if (t < c.cd1) return REM0;
    if (t < t2) { const u = seg(t, c.cd1, t2); return lerp(REM0, 4, 1 - (1 - u) ** 3.2); }
    if (t < c.zero) return 4 - Math.floor((t - t2) / 0.125);
    return 0;
  };
  // rullo di una cifra: valore continuo v; la cifra n sta a (n - v) altezze dal centro della finestra
  function wheel(R, x, y, v, base, size, col, a) {
    const hgt = size * 0.95;
    R.clipRect(x - size * 0.32, y - hgt * 0.6, size * 0.64, hgt * 1.2);
    const n0 = Math.floor(v);
    for (let k = -1; k <= 2; k++) {
      const n = n0 + k, yy = y + (n - v) * hgt;
      if (Math.abs(yy - y) > hgt * 1.2) continue;
      R.text(String(((n % base) + base) % base), x, yy, { font: 'bc900i', size, align: 'center', v: 'cap', fill: col, alpha: a, glow: 0.12 });
    }
    R.unclip();
  }
  function back(R, t) {
    R.rrect(-CW / 2, -CH / 2, CW, CH, 28, { fill: { lin: [0, -CH / 2, 0, CH / 2], stops: [[0, '#1e1452'], [1, '#0b0824']] } });
    R.rrect(-CW / 2, -CH / 2, CW, CH, 28, { stroke: PAL.magenta, lw: 3, glow: 0.8 });
    const zero = seg(t, c.zero, c.zero + 0.25);
    const nt = E.outBack(seg(t, c.notify, c.notify + 0.35));
    const rem = remAt(t);
    const col = zero > 0 ? PAL.magenta : '#ffffff';
    R.text('IL TORNEO INIZIA TRA', 0, -235, { font: 'mono800', size: 18, align: 'center', v: 'cap', fill: '#b9b3ff', tracking: 0.2, alpha: 1 - nt });
    // valori continui dei rulli
    const S = rem, M = S / 60, Hh = M / 60, D = Hh / 24;
    const groups = [[D, 10, 'G'], [Hh % 24, 24, 'H'], [M % 60, 60, 'M'], [S % 60, 60, 'S']];
    const pop = t >= c.zero - 0.5 ? 1 + 0.08 * Math.max(0, 1 - ((t - (c.zero - 0.5)) % 0.125) / 0.06) : 1;
    groups.forEach(([v, base, l], k) => {
      const x = -168 + k * 112, y = -120;
      const ones = v % 10;
      const tv = Math.floor(v / 10) + Math.max(0, ones - 9); // le decine scattano mentre le unità passano da 9 a 0
      const tb = base === 60 ? 6 : base === 24 ? 3 : 10;
      R.with([pop, 0, 0, x, 0, pop, 0, y, 0, 0, 1, 0], () => {
        wheel(R, -24, 0, tv, tb, 104, col, 1);
        wheel(R, 24, 0, ones, 10, 104, col, 1);
      });
      R.text(l, x, -38, { font: 'mono800', size: 16, align: 'center', v: 'cap', fill: '#8ea2ff', tracking: 0.1, alpha: 1 - nt * 0.6 });
      if (k < 3) R.text(':', x + 56, -128, { font: 'bc900i', size: 70, align: 'center', v: 'cap', fill: col, alpha: 0.5 });
    });
    // barra di avanzamento
    const pr = 1 - rem / REM0;
    R.rrect(-180, 10, 360, 6, 3, { fill: 'rgba(255,255,255,0.12)' });
    R.rrect(-180, 10, 360 * pr, 6, 3, { fill: zero > 0 ? PAL.magenta : PAL.cyan, glow: 0.6 });
    // notifica
    if (nt > 0) R.with(T(0, lerp(-420, -250, nt), 0), () => {
      R.rrect(-205, -44, 410, 88, 22, { fill: 'rgba(255,255,255,0.96)' });
      R.circle(-158, 0, 22, { fill: PAL.magenta });
      R.text('!', -158, 0, { font: 'unb900', size: 26, align: 'center', v: 'cap', fill: '#fff' });
      R.text('È IL TUO TURNO', -120, -12, { font: 'unb900', size: 24, v: 'cap', fill: '#0b0824', knock: true });
      R.text('myFITP · ADESSO', -120, 20, { font: 'mono800', size: 13, v: 'cap', fill: '#5c5873', tracking: 0.1, knock: true });
    });
    // pulsante: nasce, pulsa, poi nello zoom si allarga fino al formato dello schermo
    const bt = E.outBack(seg(t, c.notify + 0.15, c.notify + 0.5));
    const pulse = 1 + 0.035 * Math.sin((t - c.notify) * 16) * (t < c.tap ? 1 : 0);
    const prs = env(t, c.tap - 0.05, c.tap, c.tap + 0.08, c.tap + 0.25);
    const zm = E.inCubic(seg(t, c.tap + 0.05, c.t1));
    const bh = lerp(96, 96 * 2.5, zm);
    if (bt > 0) {
      button(R, 0, 200, (CW - 60) * bt * pulse, bh, bt > 0.8 ? 'VAI AL TUO MATCH' : '', { press: prs, fill: rgba(mixc(PAL.magenta, '#2456e8', zm), 1), r: lerp(48, 6, zm), size: 25, font: 'unb900', glow: 0.8 * (1 - zm), labelA: 1 - zm * 1.4 });
      if (zm > 0) R.rrect(-(CW - 60) * 0.44, 200 - bh * 0.4, (CW - 60) * 0.88, bh * 0.8, lerp(30, 2, zm), { stroke: '#fff', lw: lerp(1, 2.2, zm), alpha: zm, glow: 0.8 });
    }
    if (t < c.tap + 0.22) ripple(R, 30, 200, t - c.tap, 1);
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    bgNight(R, t, { c1: '#3b1f7a', c2: PAL.cyan });
    dust(R, t, [-2600, -700, -600, 2600, 700, 1400], 110, 9, { a: 0.5 });
    // righe tipografiche di sfondo lontane
    R.with(T(0, 0, 2400), () => {
      for (let r = -2; r <= 2; r++) R.text('TORNEI UFFICIALI · TORNEI UFFICIALI · TORNEI UFFICIALI', ((t * 180 * (r % 2 ? 1 : -1)) % 2400) - 2800, r * 380, { font: 'unb900', size: 300, v: 'cap', stroke: 'rgba(255,255,255,0.10)', lw: 3, tracking: -0.02 });
    });
    // card: prima le lontane
    const order = TOURS.map((_, i) => i).sort((a, b) => Math.abs(b - SEL) - Math.abs(a - SEL));
    for (const i of order) {
      R.with(cardPose(i, t, cam), () => {
        // lato visibile
        const a = R.proj(-CW / 2, -CH / 2), b = R.proj(CW / 2, -CH / 2), d = R.proj(-CW / 2, CH / 2);
        let fr = true;
        if (a && b && d) fr = (b[0] - a[0]) * (d[1] - a[1]) - (b[1] - a[1]) * (d[0] - a[0]) > 0;
        if (fr) front(R, TOURS[i], i, t, i === SEL);
        else R.with(RY(Math.PI), () => back(R, t));
      });
    }
    // testo cinetico: SCEGLI / IL TUO TORNEO
    const s1 = seg(t, c.select + 0.15, c.select + 0.5), s0 = 1 - seg(t, c.flip - 0.2, c.flip + 0.1);
    if (s1 > 0 && s0 > 0) R.hud(() => {
      R.clipRect(0, 330, W, 170);
      R.text('SCEGLI', 120, 440 + (1 - E.outExpo(s1)) * 150, { font: 'unb900', size: 132, v: 'base', fill: '#fff', alpha: s0, tracking: -0.03 });
      R.unclip();
      R.text('IL TUO TORNEO', 126, 520, { font: 'unb900', size: 58, v: 'cap', stroke: PAL.cyan, lw: 1.6, glow: 0.6, glowColor: PAL.cyan, alpha: s0,
        per: (i) => ({ a: seg(t, c.select + 0.3 + i * 0.03, c.select + 0.4 + i * 0.03), x: (1 - E.outCubic(seg(t, c.select + 0.3 + i * 0.03, c.select + 0.6 + i * 0.03))) * 40 }) });
    });
    // conferma iscrizione
    const ok = env(t, c.regOk + 0.1, c.regOk + 0.35, c.flip - 0.1, c.flip + 0.2);
    if (ok > 0) R.hud(() => {
      R.text('ISCRIZIONE', 126, 640, { font: 'mono800', size: 26, v: 'cap', fill: PAL.cyan, tracking: 0.3, alpha: ok });
      R.text('CONFERMATA', 126, 680, { font: 'mono800', size: 26, v: 'cap', fill: PAL.cyan, tracking: 0.3, alpha: ok });
    });
  }

  function zoomThrough(R, t) {
    const u = E.inExpo(seg(t, c.zoom, c.t1));
    R.hud(() => {
      const w = lerp(420, W * 2.2, u), h = lerp(96, H * 2.4, u);
      R.rrect(W / 2 - w / 2, H / 2 - h / 2 + lerp(60, 0, u), w, h, lerp(48, 10, u), { fill: rgba(mixc(PAL.magenta, '#2456e8', u), 1), glow: 0.6 });
      R.rrect(W / 2 - w * 0.46, H / 2 - h * 0.44 + lerp(60, 0, u), w * 0.92, h * 0.88, lerp(40, 4, u), { stroke: '#fff', lw: lerp(2, 12, u), alpha: u, glow: 0.8 });
      R.text('VAI AL TUO MATCH', W / 2, H / 2 + lerp(60, 0, u), { font: 'unb900', size: lerp(25, 400, u), align: 'center', v: 'cap', fill: '#fff', alpha: 1 - u * 1.5 });
    });
  }

  function fx(t) {
    const f = {};
    if (t < c.select + 0.3) f.mb = 6;
    if (t >= c.cd0 && t < c.cd0 + 0.6) f.mb = 5;
    if (t >= c.zero && t < c.zero + 0.3) { const u = (t - c.zero) / 0.3; f.flash = [PAL.magenta, 0.14 * (1 - u)]; f.ca = 0.005 * (1 - u); }
    if (t >= c.tap) { f.mb = 10; f.ca = 0.008 * seg(t, c.tap, c.t1); }
    return f;
  }

  return { draw, fx };
}
