// ATTO 4 · ACTION: in campo (estetica Hawk-Eye, anelli TU/AVV, score bug), poi la gru verso l'alto:
// il campo diventa un box di un tabellone fatto di campi, e la pallina porta TU sempre più lontano.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T, RX, RY, RZ, apply, noise1 } from '../engine/math.js';
import { PAL, ball, ballScreen, courtLines } from '../engine/kit.js';
import { track, camTrack, shake, bgNight, dust } from './common.js';

const M = 40; // unità per metro
const FLOOR = TRS([0, 0, 0], [deg(-90), 0, 0], M); // locale (u, v) in metri → pavimento; v>0 verso il lontano? (v locale → -z)
// punto sul campo (x di larghezza, z di lunghezza, h altezza) in metri → mondo
const P = (x, z, h = 0) => [x * M, -h * M, z * M];

export function campoAct(c, TL) {
  const hits = c.hits; // istanti dei colpi: TU, AVV, TU...
  // colpi: da [x,z] a rimbalzo [x,z] e contatto successivo
  const SHOTS = [
    { from: [0.4, -12.2], bounce: [-2.1, 5.3], to: [-3.1, 12.7], kmh: 184 },
    { from: [-3.1, 12.7], bounce: [2.7, -7.6], to: [3.3, -12.4], kmh: 147 },
    { from: [3.3, -12.4], bounce: [-3.8, 10.2], to: [-6.2, 17.5], kmh: 196 },
  ].slice(0, hits.length);
  SHOTS[SHOTS.length - 1].winner = true;
  const win = SHOTS.length - 1;
  const tEnd = (i) => (i + 1 < hits.length ? hits[i + 1] : c.game + 0.45);
  const tBounce = (i) => (i === win ? c.game - 0.06 : lerp(hits[i], tEnd(i), 0.46));

  // posizione della pallina (metri) al tempo t
  function ballAt(t) {
    if (t < hits[0]) {
      // lancio del servizio
      const u = seg(t, hits[0] - 0.45, hits[0]);
      return [0.4, -12.2, 1.0 + Math.sin(u * Math.PI) * 1.4];
    }
    let i = 0;
    while (i < SHOTS.length - 1 && t >= hits[i + 1]) i++;
    const S = SHOTS[i], t0 = hits[i], tb = tBounce(i), t1 = tEnd(i);
    if (t < tb) {
      const u = (t - t0) / (tb - t0);
      return [lerp(S.from[0], S.bounce[0], u), lerp(S.from[1], S.bounce[1], u), lerp(i === 0 ? 2.4 : 1.0, 0, u) + 4 * u * (1 - u) * (i === 0 ? 0.5 : 1.3)];
    }
    const u = clamp((t - tb) / (t1 - tb));
    return [lerp(S.bounce[0], S.to[0], u), lerp(S.bounce[1], S.to[1], u), lerp(0, 1.0, u) + 4 * u * (1 - u) * 1.1];
  }

  // giocatori: anello a terra che insegue i punti di contatto
  function playerAt(side, t) {
    // side 0 = TU (colpi pari), 1 = AVV (colpi dispari)
    const pts = [];
    SHOTS.forEach((S, i) => { if (i % 2 === side) pts.push([hits[i], S.from]); else pts.push([tBounce(i) + 0.1, S.to]); });
    if (side === 0) pts.unshift([c.t0, [0.4, -12.2]]);
    else pts.unshift([c.t0, [0, 12.4]]);
    let a = pts[0], b = pts[pts.length - 1];
    for (let k = 0; k < pts.length - 1; k++) if (t >= pts[k][0] && t < pts[k + 1][0]) { a = pts[k]; b = pts[k + 1]; break; }
    if (t >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
    const u = E.inOutCubic(seg(t, a[0], b[0]));
    return [lerp(a[1][0], b[1][0], u), lerp(a[1][1], b[1][1], u)];
  }

  // ---------------------------------------------------------------- camera
  const camKeys = [
    { t: c.t0, eye: [0, -1750, -130], tgt: [0, 0, 0], f: 1100, roll: deg(-90) },
    { t: c.t0 + 0.55, eye: [-60, -200, -780], tgt: [0, -30, 140], f: 1150, roll: deg(-4), ease: 'inOutCubic' },
    { t: hits[hits.length - 1], eye: [90, -215, -740], tgt: [20, -30, 180], f: 1150, roll: deg(-2) },
    { t: c.game, eye: [-120, -210, -520], tgt: [-150, -20, 380], f: 1250, roll: deg(3), ease: 'inOutCubic' },
    { t: c.crane0, eye: [-100, -260, -560], tgt: [-120, -20, 360], f: 1250, roll: deg(2) },
    { t: c.crane1, eye: [0, -2900, -160], tgt: [0, 0, 0], f: 1300, roll: deg(-90), ease: 'inOutCubic' },
  ];
  // nel tabellone la camera segue il percorso di TU (in coordinate del pavimento)
  let PATH = null;
  const pathAt = (t) => {
    if (!PATH) PATH = ROUNDS.map((Rd, r) => [Rd.u, boxV(r, Rd.me)]);
    const r = c.rounds;
    let k = 0;
    for (let i = 0; i < r.length; i++) if (t >= r[i]) k = i + 1;
    if (k === 0) return PATH[0];
    const a = PATH[Math.min(k - 1, 3)], b = PATH[Math.min(k, 3)];
    const u = E.inOutCubic(seg(t, r[k - 1], r[k - 1] + 0.32));
    return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  };
  // percorso continuo della camera sul tabellone: parte dal primo turno e arriva alla finale
  const pathSmooth = (t) => {
    if (!PATH) pathAt(t);
    const r = c.rounds, t0 = c.crane1 - 0.2, t1 = r[2] + 0.4;
    const x = clamp((t - t0) / (t1 - t0)) * 3;
    const i = Math.min(2, Math.floor(x)), f = x - i;
    const e = f * f * (3 - 2 * f);
    const a = PATH[i], b = PATH[i + 1];
    return [lerp(a[0], b[0], lerp(f, e, 0.5)), lerp(a[1], b[1], e)];
  };
  const shakes = () => [[hits[0], 6, 0.3], [c.game - 0.06, 18, 0.5], ...c.rounds.map((r) => [r + 0.3, 7, 0.3])];
  function camAt(t) {
    const sh = shake(t, shakes());
    if (t < c.crane1) {
      // durante lo scambio la camera segue un po' la pallina
      const cam = camTrack(camKeys, t, sh);
      return cam;
    }
    // tabellone: dall'alto, il percorso scorre verso destra
    const p = pathSmooth(t);
    const fin = E.inExpo(seg(t, c.dive0, c.t1));
    const h = lerp(2900, 2300, seg(t, c.crane1, c.rounds[2])) * (1 - fin) + fin * 260;
    // coordinate del tabellone: u lungo la z del mondo, v lungo la x
    const cx = p[1], cz = p[0];
    const cam = new Cam();
    cam.look([cx, -h, cz - 160 * (1 - fin) - 20], [cx, 0, cz], deg(-90) + sh[2], 1300);
    cam.cx += sh[0]; cam.cy += sh[1];
    return cam;
  }

  // ---------------------------------------------------------------- arena
  function arena(R, t, a) {
    // pavimento e fuori campo
    R.push(FLOOR);
    R.rect(-40, -34, 80, 68, { fill: { rad: [0, 0, 36], stops: [[0, '#1b2f9e'], [0.6, '#141e74'], [1, '#0a0826']] }, alpha: a });
    R.rect(-5.485 - 0.9, -11.885 - 1.2, 10.97 + 1.8, 23.77 + 2.4, { fill: '#1d45c8', alpha: a });
    R.rect(-5.485, -11.885, 10.97, 23.77, { fill: { lin: [0, -11.885, 0, 11.885], stops: [[0, '#2a60f2'], [1, '#2152e0']] }, alpha: a });
    for (const [u0, v0, u1, v1] of courtLines()) R.band(u0, v0, u1, v1, 0.07, { fill: '#ffffff', alpha: a, glow: 0.45, glowColor: '#cfe8ff' });
    // scritta sul fondo campo, come il branding dell'arena
    R.with(TRS([0, -14.6, 0], [0, 0, 0], 1), () => R.text('eSPORTS FITP', 0, 0, { font: 'unb900', size: 1.9, align: 'center', v: 'cap', fill: 'rgba(255,255,255,0.20)', alpha: a }));
    R.with(TRS([0, 14.4, 0], [0, 0, 0], 1), () => R.text('CIRCUITO UFFICIALE', 0, 0, { font: 'unb900', size: 1.05, align: 'center', v: 'cap', fill: 'rgba(255,255,255,0.13)', alpha: a }));
    R.pop();
    // rete
    const nw = 6.4;
    const top = [], bot = [];
    for (let k = 0; k <= 24; k++) { const x = -nw + (2 * nw * k) / 24; top.push(P(x, 0, 0.93 + 0.1 * Math.abs(x) / nw)); bot.push(P(x, 0, 0)); }
    for (let k = 0; k <= 24; k += 1) R.worldLine([bot[k], top[k]], { stroke: '#ffffff', lwPx: 1, alpha: 0.22 * a });
    for (let j = 1; j <= 4; j++) R.worldLine(top.map((p, k) => mixP(bot[k], p, j / 5)), { stroke: '#ffffff', lwPx: 1, alpha: 0.2 * a });
    R.worldLine(top, { stroke: '#ffffff', lw: 0.06 * M, alpha: a, glow: 0.5 });
    R.worldLine([P(-nw - 0.3, 0, 0), P(-nw - 0.3, 0, 1.07)], { stroke: '#d8d8ff', lw: 0.1 * M, alpha: a });
    R.worldLine([P(nw + 0.3, 0, 0), P(nw + 0.3, 0, 1.07)], { stroke: '#d8d8ff', lw: 0.1 * M, alpha: a });
    // pannelli LED lungo le pareti con testo che scorre
    const boards = [
      { M: TRS(P(0, 19.5, 0), [0, 0, 0], M), w: 34 },
      { M: TRS(P(-13.5, 0, 0), [0, deg(90), 0], M), w: 38 },
      { M: TRS(P(13.5, 0, 0), [0, deg(-90), 0], M), w: 38 },
    ];
    for (const B of boards) R.with(B.M, () => {
      R.rect(-B.w / 2, -1.1, B.w, 1.1, { fill: '#0a0620', alpha: a });
      R.clipRect(-B.w / 2, -1.1, B.w, 1.1);
      const off = (t * 3.2) % 26;
      for (let k = -1; k < 3; k++) R.text('eSPORTS FITP · TOCCA A TE ·', -B.w / 2 - off + k * 26, -0.55, { font: 'unb900', size: 0.62, v: 'cap', fill: k % 2 ? PAL.magenta : PAL.cyan, alpha: a, glow: 0.5 });
      R.unclip();
      R.band(-B.w / 2, -1.1, B.w / 2, -1.1, 0.05, { fill: PAL.magenta, alpha: a, glow: 0.8 });
    });
    // pubblico: luci sugli spalti
    for (let i = 0; i < 420; i++) {
      const side = i % 3, k = Math.floor(i / 3);
      const row = k % 5, col = Math.floor(k / 5);
      let p;
      if (side === 0) p = P(-17 + col * 1.25, 21 + row * 1.3, 1.6 + row * 1.1);
      else p = P((side === 1 ? -1 : 1) * (15.5 + row * 1.3), -19 + col * 1.4, 1.6 + row * 1.1);
      const blink = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (2 + hash(i) * 6) + i * 1.7));
      const col2 = hash(i * 3) > 0.86 ? PAL.magenta : hash(i * 5) > 0.82 ? PAL.cyan : '#fff1d0';
      R.dot(p, 0.09 * M, { fill: col2, alpha: a * blink * 0.9, glow: 0.8, maxR: 5 });
    }
    // torri faro
    for (const [x, z] of [[-16, -21], [16, -21], [-16, 23], [16, 23]]) {
      const p = P(x, z, 14);
      R.flare(p, 5 * M, '#cfe6ff', a * 0.55);
      R.flare(p, 1.2 * M, '#ffffff', a * 0.9);
    }
  }
  const mixP = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

  // ---------------------------------------------------------------- scambio
  function rally(R, t, a) {
    // anelli dei giocatori e targhette
    for (const side of [0, 1]) {
      const [x, z] = playerAt(side, t);
      const col = side === 0 ? PAL.ball : PAL.magenta;
      R.with(TRS(P(x, z, 0.01), [deg(-90), 0, 0], M), () => {
        R.ring(0, 0, 0.55, 0.68, { fill: col, alpha: a * 0.9, glow: 0.8 });
        R.circle(0, 0, 0.55, { fill: col, alpha: a * 0.12 });
        R.arc(0, 0, 0.95, t * 3, t * 3 + 1.6, { stroke: col, lw: 0.05, alpha: a * 0.6, glow: 0.5 });
      });
      // colonna di luce (sagoma astratta del giocatore)
      R.worldLine([P(x, z, 0), P(x, z, 1.7)], { stroke: col, lw: 0.3 * M, alpha: a * 0.08, glow: 0.25 });
      R.worldLine([P(x, z, 0), P(x, z, 1.7)], { stroke: '#ffffff', lw: 0.04 * M, alpha: a * 0.32, glow: 0.3 });
      const tag = R.camW(P(x, z, 2.5));
      if (tag[2] > 10) {
        const s = R.projC(tag);
        R.hud(() => {
          const lab = side === 0 ? 'TU' : 'AVV';
          const w = R.measure(lab, 'unb900', 26, 0.02) + 28;
          R.rrect(s[0] - w / 2, s[1] - 22, w, 40, 10, { fill: side === 0 ? PAL.ball : PAL.magenta, alpha: a });
          R.text(lab, s[0], s[1] - 2, { font: 'unb900', size: 24, align: 'center', v: 'cap', fill: side === 0 ? '#0b0824' : '#fff', alpha: a, knock: side === 0 });
          R.poly([s[0] - 8, s[1] + 18, s[0] + 8, s[1] + 18, s[0], s[1] + 28], { fill: side === 0 ? PAL.ball : PAL.magenta, alpha: a });
        });
      }
    }
    // traiettorie Hawk-Eye: restano visibili dopo il rimbalzo
    SHOTS.forEach((S, i) => {
      const t0 = hits[i], tb = tBounce(i);
      if (t < t0) return;
      const fade = 1 - seg(t, tb + 0.5, tb + 1.2);
      if (fade <= 0) return;
      const end = Math.min(t, tb);
      const pts = [];
      for (let k = 0; k <= 30; k++) { const tt = lerp(t0, end, k / 30); const b = ballAt(tt); pts.push(P(b[0], b[1], b[2])); }
      R.worldLine(pts, { stroke: i % 2 ? PAL.magenta : PAL.cyan, lwPx: 2.2, alpha: a * 0.8 * fade, glow: 0.8 });
      // segno di rimbalzo
      if (t >= tb) {
        const u = seg(t, tb, tb + 0.6);
        R.with(TRS(P(S.bounce[0], S.bounce[1], 0.01), [deg(-90), 0, 0], M), () => {
          R.ring(0, 0, lerp(0.1, 1.1, E.outCubic(u)), lerp(0.18, 1.2, E.outCubic(u)), { fill: '#ffffff', alpha: a * (1 - u) * fade, glow: 0.8 });
          R.circle(0, 0, 0.22, { fill: i === win ? PAL.ball : '#ffffff', alpha: a * fade * 0.9, glow: 0.6 });
        });
        if (i === win) {
          const s = R.camW(P(S.bounce[0], S.bounce[1], 0.6));
          if (s[2] > 10) {
            const q = R.projC(s);
            const k = E.outBack(seg(t, tb, tb + 0.3));
            R.hud(() => {
              R.rrect(q[0] - 38 * k, q[1] - 70, 76 * k, 40, 8, { fill: '#ffffff', alpha: a * k });
              R.text('IN', q[0], q[1] - 50, { font: 'unb900', size: 24, align: 'center', v: 'cap', fill: '#0b0824', alpha: a * k, knock: true });
            });
          }
        }
      }
    });
    // colpi: arco dello swing, lampo d'impatto, velocità
    SHOTS.forEach((S, i) => {
      const u = t - hits[i];
      if (u < -0.12 || u > 0.7) return;
      const side = i % 2;
      const [px, pz] = playerAt(side, hits[i]);
      const col = side === 0 ? PAL.cyan : PAL.magenta;
      const dir = side === 0 ? 1 : -1;
      // arco dello swing (piano orizzontale a un metro)
      const s0 = clamp((u + 0.12) / 0.16), s1 = clamp((u + 0.02) / 0.16);
      const fade = 1 - seg(u, 0.1, 0.35);
      if (fade > 0 && s0 > s1 + 0.01 || s0 > 0) {
        const pts = [];
        const a0 = deg(200) * dir, sweep = deg(160) * dir;
        for (let k = 0; k <= 20; k++) {
          const ang = a0 + sweep * lerp(s1, s0, k / 20);
          pts.push(P(px + Math.cos(ang) * 1.1, pz + Math.sin(ang) * 0.9, 1.0 + k * 0.012));
        }
        R.worldLine(pts, { stroke: '#ffffff', lw: 0.09 * M, alpha: a * fade, glow: 1.2, glowColor: col });
      }
      // lampo e onda d'urto sul contatto
      if (u >= 0 && u < 0.4) {
        const b = S.from;
        const p = P(b[0], b[1], i === 0 ? 2.4 : 1.0);
        R.flare(p, lerp(0.8, 1.8, u / 0.4) * M, i % 2 ? PAL.magenta : PAL.ball, a * 0.8 * (1 - u / 0.4));
        const s = R.camW(p);
        if (s[2] > 10) {
          const q = R.projC(s);
          R.hud(() => {
            R.ring(q[0], q[1], lerp(8, 110, E.outCubic(u / 0.4)), lerp(10, 113, E.outCubic(u / 0.4)), { fill: '#ffffff', alpha: a * (1 - u / 0.4) * 0.7, glow: 0.5 });
          });
        }
      }
      // velocità del colpo
      if (u >= 0.05 && u < 0.7) {
        const b = ballAt(Math.min(t, hits[i] + 0.25));
        const s = R.camW(P(b[0], b[1], b[2] + 0.8));
        if (s[2] > 10) {
          const q = R.projC(s);
          const k = E.outExpo(seg(u, 0.05, 0.2)), o = 1 - seg(u, 0.5, 0.7);
          R.hud(() => {
            R.text(`${S.kmh}`, q[0] + 40, q[1] - 30, { font: 'bc900i', size: 64, v: 'base', fill: PAL.ball, alpha: a * k * o, glow: 0.5, per: (g) => ({ y: (1 - k) * 30 }) });
            R.text('KM/H', q[0] + 44 + R.measure(`${S.kmh}`, 'bc900i', 64, 0), q[1] - 30, { font: 'mono800', size: 18, v: 'base', fill: '#ffffff', alpha: a * k * o });
          });
        }
      }
    });
    // pallina con scia
    if (t >= hits[0] - 0.45 && t < c.game + 0.5) {
      const pts = [];
      for (let k = 0; k <= 16; k++) { const b = ballAt(Math.max(hits[0] - 0.45, t - 0.22 + (k / 16) * 0.22)); pts.push(P(b[0], b[1], b[2])); }
      R.trail(pts, { w0: 0, w1: 0.2 * M, a0: 0, a1: 0.85, color: PAL.ball, glow: 0.9, maxW: 30 });
      const b = ballAt(t);
      // ombra
      R.with(TRS(P(b[0], b[1], 0.01), [deg(-90), 0, 0], M), () => R.circle(0, 0, 0.12 + b[2] * 0.02, { fill: '#000', alpha: a * 0.45 }));
      ball(R, P(b[0], b[1], b[2]), 0.1 * M, { spin: [t * 30, t * 18, 0.2], rim: PAL.magenta });
    }
  }

  // ---------------------------------------------------------------- score bug
  function scorebug(R, t, a) {
    if (a <= 0) return;
    const game = seg(t, c.game, c.game + 0.25);
    R.hud(() => {
      const x = 64, y = 64;
      R.rrect(x, y, 380, 118, 14, { fill: 'rgba(11,8,36,0.82)', alpha: a });
      R.rect(x, y, 8, 118, { fill: PAL.magenta, alpha: a });
      R.text('● LIVE', x + 26, y + 22, { font: 'mono800', size: 14, v: 'cap', fill: '#ff3b6b', alpha: a * (0.6 + 0.4 * Math.sin(t * 6)), tracking: 0.1 });
      R.text('FITP eSERIES #4 · 1° TURNO', x + 110, y + 22, { font: 'mono700', size: 13, v: 'cap', fill: '#b9b3ff', alpha: a, tracking: 0.06 });
      const rows = [['TU', game > 0 ? 'GAME' : '40', PAL.ball], ['AVV', '30', '#ffffff']];
      rows.forEach(([n, pts, col], k) => {
        const yy = y + 58 + k * 36;
        R.text(n, x + 26, yy, { font: 'unb900', size: 24, v: 'cap', fill: col, alpha: a });
        if (k === 0) R.circle(x + 100, yy, 5, { fill: PAL.ball, alpha: a });
        const w = k === 0 ? lerp(56, 110, game) : 56;
        R.rrect(x + 380 - 14 - w, yy - 16, w, 32, 6, { fill: k === 0 && game > 0 ? PAL.ball : 'rgba(255,255,255,0.1)', alpha: a });
        R.text(pts, x + 380 - 14 - w / 2, yy, { font: 'unb900', size: 20, align: 'center', v: 'cap', fill: k === 0 && game > 0 ? '#0b0824' : '#fff', alpha: a, knock: k === 0 && game > 0 });
      });
    });
  }

  // ---------------------------------------------------------------- tabellone di campi
  // coordinate del tabellone: (u, v) in unità mondo sul pavimento, u = z del mondo, v = x del mondo
  const BP = (u, v, h = 0) => [v, -h, u];
  const ROUNDS = [
    { u: 0, n: 8, gap: 660, label: 'OTTAVI', me: 4 },
    { u: 1700, n: 4, gap: 1320, label: 'QUARTI', me: 2 },
    { u: 3400, n: 2, gap: 2640, label: 'SEMIFINALE', me: 1 },
    { u: 5100, n: 1, gap: 0, label: 'FINALE', me: 0 },
  ];
  const boxV = (r, k) => (k - (ROUNDS[r].n - 1) / 2) * ROUNDS[r].gap - (ROUNDS[0].me - (ROUNDS[0].n - 1) / 2) * ROUNDS[0].gap;
  function miniCourt(R, u, v, s, a, hot, label) {
    // campo visto dall'alto: lunghezza lungo u
    R.with(TRS(BP(u, v, 0), [deg(-90), 0, 0], s), () => {
      R.rect(-5.485, -11.885, 10.97, 23.77, { fill: hot ? '#2456e8' : '#1a1d52', alpha: a * (hot ? 0.95 : 0.7) });
      for (const [u0, v0, u1, v1] of courtLines()) R.band(u0, v0, u1, v1, 0.12, { fill: hot ? '#ffffff' : '#6f6a9a', alpha: a, glow: hot ? 0.5 : 0 });
    });
  }
  function bracket(R, t, a) {
    if (a <= 0) return;
    const lit = (r) => (r === 0 ? 1 : seg(t, c.rounds[r - 1] + 0.25, c.rounds[r - 1] + 0.45));
    // linee di collegamento
    for (let r = 0; r < 3; r++) {
      const R0 = ROUNDS[r], R1 = ROUNDS[r + 1];
      for (let k = 0; k < R0.n; k++) {
        const v0 = boxV(r, k), v1 = boxV(r + 1, Math.floor(k / 2));
        const um = (R0.u + R1.u) / 2;
        const path = [BP(R0.u + 520, v0, 0), BP(um, v0, 0), BP(um, v1, 0), BP(R1.u - 520, v1, 0)];
        const mine = k === R0.me;
        R.worldLine(path, { stroke: mine ? PAL.ball : '#4b4680', lw: mine ? 16 : 7, alpha: a * (mine ? 0.25 + 0.75 * lit(r + 1) : 0.6), glow: mine ? 0.8 * lit(r + 1) : 0 });
      }
    }
    // campi
    ROUNDS.forEach((Rd, r) => {
      for (let k = 0; k < Rd.n; k++) {
        const me = k === Rd.me;
        const on = me && lit(r) > 0.5;
        miniCourt(R, Rd.u, boxV(r, k), r === 3 ? 48 : 40, a, on, '');
        // nomi
        const q = R.camW(BP(Rd.u, boxV(r, k) + 300, 0));
        if (q[2] > 10) {
          const p = R.projC(q);
          R.hud(() => {
            const lab = me ? 'TU' : 'AVV';
            if (me) {
              R.rrect(p[0] - 38, p[1] - 20, 76, 40, 10, { fill: on ? PAL.ball : '#3b3766', alpha: a });
              R.text(lab, p[0], p[1], { font: 'unb900', size: 24, align: 'center', v: 'cap', fill: on ? '#0b0824' : '#9b96c6', alpha: a, knock: on });
            }
          });
        }
      }
      // etichetta del turno
      const q = R.camW(BP(Rd.u, boxV(r, 0) - 700, 0));
      if (q[2] > 10) {
        const p = R.projC(q);
        R.hud(() => R.text(Rd.label, p[0], p[1], { font: 'mono800', size: 20, align: 'center', v: 'cap', fill: r === 3 ? PAL.ball : '#b9b3ff', tracking: 0.3, alpha: a * (r === 0 ? 1 : 0.4 + 0.6 * lit(r)) }));
      }
    });
    // la pallina porta TU al turno successivo
    for (let r = 1; r <= 3; r++) {
      const t0 = c.rounds[r - 1], u = seg(t, t0, t0 + 0.32);
      if (u <= 0 || u >= 1) continue;
      const R0 = ROUNDS[r - 1], R1 = ROUNDS[r];
      const v0 = boxV(r - 1, R0.me), v1 = boxV(r, R1.me), um = (R0.u + R1.u) / 2;
      const pth = [[R0.u + 520, v0], [um, v0], [um, v1], [R1.u - 520, v1]];
      const at = (x) => {
        const L = [0, 1, 2].map((i) => Math.hypot(pth[i + 1][0] - pth[i][0], pth[i + 1][1] - pth[i][1]));
        let d = x * (L[0] + L[1] + L[2]);
        for (let i = 0; i < 3; i++) { if (d <= L[i]) { const f = d / L[i]; return [lerp(pth[i][0], pth[i + 1][0], f), lerp(pth[i][1], pth[i + 1][1], f)]; } d -= L[i]; }
        return pth[3];
      };
      const e = E.inOutCubic(u);
      const pts = [];
      for (let k = 0; k <= 14; k++) { const q = at(Math.max(0, e - 0.25 + (k / 14) * 0.25)); pts.push(BP(q[0], q[1], 30)); }
      R.trail(pts, { w0: 0, w1: 40, a0: 0, a1: 1, color: PAL.ball, glow: 1, maxW: 40 });
      const q = at(e);
      ball(R, BP(q[0], q[1], 30), 28, { spin: [t * 20, t * 9, 0] });
    }
  }

  // ---------------------------------------------------------------- disegno
  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    const arenaA = 1 - seg(t, c.crane0 + 0.3, c.crane1 - 0.2);
    // cielo al tramonto dell'arena (come la SuperTennis Arena), poi notte per il tabellone
    R.bg(rgba(mixc('#0d0626', '#2a0f5e', arenaA), 1), rgba(mixc('#05030f', '#7a1d7a', arenaA * 0.6), 1), [
      [W * 0.5, H * 0.85, 900, PAL.magenta, 0.18 * arenaA],
      [W * 0.2, H * 0.1, 800, PAL.purple2, 0.5],
    ]);
    if (arenaA > 0) arena(R, t, arenaA);
    // passaggio dal pulsante: il rosa del pulsante si scioglie nel blu del campo
    const inA = seg(t, c.t0, c.t0 + 0.18);
    if (inA < 1) R.hud(() => R.rect(0, 0, W, H, { fill: '#2456e8', alpha: (1 - inA) * 0.7 }));
    if (arenaA > 0) rally(R, t, arenaA);
    // il campo diventa il primo box del tabellone
    const br = seg(t, c.crane0 + 0.4, c.crane1);
    if (br > 0) bracket(R, t, br);
    if (arenaA > 0 && t >= c.crane0) {
      // il campo reale resta visibile sotto il box del primo turno
    }
    scorebug(R, t, seg(t, c.t0 + 0.4, c.t0 + 0.7) * (1 - seg(t, c.crane0, c.crane0 + 0.3)));
    diveTag(R, t);
    // GAME
    const g = seg(t, c.game, c.game + 0.2), go = 1 - seg(t, c.game + 0.9, c.game + 1.2);
    if (g > 0 && go > 0) R.hud(() => {
      R.text('GAME', W / 2, H / 2 - 10, { font: 'unb900', size: 260, align: 'center', v: 'cap', fill: '#ffffff', alpha: go, tracking: -0.04, depth: 18, depthSteps: 8, side: (u) => rgba(mixc(PAL.magenta, '#2a0a50', u), 1),
        per: (i, n) => ({ s: lerp(1.8, 1, E.outExpo(seg(t, c.game + i * 0.03, c.game + i * 0.03 + 0.25))), a: seg(t, c.game + i * 0.03, c.game + i * 0.03 + 0.06), y: -Math.sin(i + t * 3) * 4 }) });
      R.text('TU', W / 2, H / 2 + 150, { font: 'unb900', size: 64, align: 'center', v: 'cap', fill: PAL.ball, alpha: go * seg(t, c.game + 0.15, c.game + 0.3), glow: 0.5 });
    });
    // SEMPRE PIÙ LONTANO
    const sp = seg(t, c.rounds[0] + 0.2, c.rounds[0] + 0.5);
    if (sp > 0) R.hud(() => {
      const o = 1 - seg(t, c.dive0, c.dive0 + 0.2);
      R.text('SEMPRE', 120, H - 250, { font: 'unb900', size: 110, v: 'cap', fill: '#fff', alpha: o, tracking: -0.03, per: (i) => ({ x: (1 - E.outExpo(seg(t, c.rounds[0] + 0.2 + i * 0.03, c.rounds[0] + 0.6 + i * 0.03))) * -200, a: seg(t, c.rounds[0] + 0.2 + i * 0.03, c.rounds[0] + 0.3 + i * 0.03) }) });
      R.text('PIÙ LONTANO', 124, H - 140, { font: 'unb900', size: 86, v: 'cap', stroke: PAL.ball, lw: 2, glow: 0.6, glowColor: PAL.ball, alpha: o, tracking: 0.02, skew: 0.12,
        per: (i) => ({ x: (1 - E.outExpo(seg(t, c.rounds[1] + i * 0.02, c.rounds[1] + 0.4 + i * 0.02))) * 400, a: seg(t, c.rounds[1] + i * 0.02, c.rounds[1] + 0.1 + i * 0.02) }) });
    });
  }

  function diveTag(R, t) {
    if (t < c.dive0) return;
    const Rd = ROUNDS[3];
    const q = R.camW(BP(Rd.u, boxV(3, 0) + 300, 0));
    const p = q[2] > 10 ? R.projC(q) : [W / 2, H / 2];
    const g = E.inExpo(seg(t, c.dive0, c.t1));
    R.hud(() => {
      const x0 = lerp(p[0] - 38, -60, g), y0 = lerp(p[1] - 20, -60, g), w = lerp(76, W + 120, g), h = lerp(40, H + 120, g);
      R.rrect(x0, y0, w, h, lerp(10, 0, g), { fill: PAL.ball, glow: 0.25 });
      R.text('TU', x0 + w / 2, y0 + h / 2, { font: 'unb900', size: lerp(24, 760, g), align: 'center', v: 'cap', fill: PAL.night, tracking: -0.03, knock: true });
    });
  }

  function fx(t) {
    const f = {};
    if (t < c.t0 + 0.6) f.mb = 6;
    if (t >= c.game - 0.1 && t < c.game + 0.3) { const u = (t - c.game + 0.1) / 0.4; f.ca = 0.01 * (1 - u); f.flash = [PAL.ball, 0.2 * (1 - u)]; f.mb = 5; }
    if (t >= c.crane0 && t < c.crane1) f.mb = 5;
    for (const r of c.rounds) if (t >= r && t < r + 0.35) f.mb = 5;
    if (t >= c.dive0) f.mb = 6;
    return f;
  }

  return { draw, fx };
}
