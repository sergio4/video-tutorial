// A · «Giochi a Tennis Clash?»  B (prima metà) · «Con gli eSports FITP il tuo gioco sale di livello.»
// Uno smartphone nel buio: una partita di tennis in corso (resa grafica nostra, in attesa di riprese reali del gioco),
// MARCO contro LUNA.SPIN. Punto vinto: +120 XP. Poi la barra XP si riempie di colpo, LEVEL UP, e la camera si tuffa
// nello schermo: dall'altra parte c'è il mondo eSports FITP (mondo.js).
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T } from '../engine/math.js';
import { PAL, ballScreen } from '../engine/kit.js';
import { camTrack, shake, bgNight, bokeh } from './common.js';
import { SW, SH, HX, HY, phone } from './mfui.js';

export function intro(S, TL) {
  const a = S.a, b = S.b;
  const t0 = a.t0, tEnd = b.t0 + 1.05;
  const tPoint = a.t0 + 2.55;             // punto vinto
  const xp0 = b.t0, xp1 = b.t0 + 0.42;    // la barra XP si riempie
  const tLvl = b.t0 + 0.4;                // LEVEL UP
  const dive0 = b.t0 + 0.55;              // tuffo nello schermo

  const PHX = 330; // il telefono sta a destra, la domanda a sinistra
  const camKeys = [
    { t: t0, eye: [150, -30, -1300], tgt: [120, -20, 0], f: 1600, roll: deg(-1.5) },
    { t: tPoint, eye: [40, -10, -1520], tgt: [60, 0, 0], f: 1600, roll: deg(0.5), ease: 'inOutCubic' },
    { t: dive0, eye: [PHX, 0, -1650], tgt: [PHX, 0, 0], f: 1600, ease: 'inOutCubic' },
    { t: tEnd, eye: [PHX, -60, -120], tgt: [PHX, -60, 0], f: 1600, ease: 'inExpo' },
  ];
  const camAt = (t) => camTrack(camKeys, t, shake(t, [[tPoint, 8, 0.35], [tLvl, 16, 0.45]]));

  // ---------------------------------------------------------------- la partita nello schermo (coordinate dello schermo)
  // campo in prospettiva finta: fondo lontano in alto, fondo vicino in basso
  const FAR = -250, NEAR = 340, NET = -20;
  const cx = (u, v) => { const k = (v - FAR) / (NEAR - FAR); return u * lerp(92, 185, k); }; // u in [-1,1] → x
  const court = (u, v) => [cx(u, v), v];

  // scambio: [t inizio, t fine, da (u,v), a (u,v), arco px]
  const RALLY = [
    [t0 - 0.3, t0 + 0.55, [0.35, 360], [-0.55, -230], 110],
    [t0 + 0.55, t0 + 1.4, [-0.55, -230], [0.2, 300], 90],
    [t0 + 1.4, tPoint, [0.2, 300], [0.9, -238], 120], // vincente nell'angolo
  ];
  function ballAt(t) {
    for (const [s, e, p0, p1, h] of RALLY) if (t >= s && t < e) {
      const u = (t - s) / (e - s);
      const g = court(lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u));
      return { g, y: g[1] - Math.sin(u * Math.PI) * h * lerp(1, 0.55, clamp((g[1] - FAR) / (NEAR - FAR))) , k: lerp(0.55, 1.1, clamp((g[1] - FAR) / (NEAR - FAR))) };
    }
    return null;
  }
  const oppX = (t) => {
    // LUNA.SPIN corre verso la palla, poi resta battuta sul vincente
    if (t < t0 + 0.55) return lerp(0, cx(-0.55, FAR), seg(t, t0, t0 + 0.5));
    if (t < t0 + 1.4) return lerp(cx(-0.55, FAR), cx(0.1, FAR), seg(t, t0 + 0.6, t0 + 1.3));
    return lerp(cx(0.1, FAR), cx(0.55, FAR), E.outCubic(seg(t, t0 + 1.5, tPoint)));
  };

  function game(R, t) {
    // stadio e campo
    R.rect(-HX, -HY, SW, SH, { fill: { lin: [0, -HY, 0, HY], stops: [[0, '#1b1450'], [0.35, '#2a2a8c'], [1, '#101a5a']] } });
    for (let i = 0; i < 90; i++) R.circle(-HX + hash(i) * SW, -HY + 70 + hash(i * 3) * 150, 1.6, { fill: hash(i * 7) > 0.8 ? PAL.magenta : '#fff1d0', alpha: 0.5 + 0.5 * Math.sin(t * 5 + i) }, 6);
    R.poly([cx(-1.35, FAR - 30), FAR - 30, cx(1.35, FAR - 30), FAR - 30, cx(1.35, HY + 40), HY + 40, cx(-1.35, HY + 40), HY + 40].map((v, i) => (i % 2 ? v : v)), { fill: '#1c3fb0' });
    R.poly([...court(-1, FAR), ...court(1, FAR), ...court(1, NEAR), ...court(-1, NEAR)], { fill: { lin: [0, FAR, 0, NEAR], stops: [[0, '#2a5de8'], [1, '#3b73ff']] } });
    const L = (u0, v0, u1, v1) => R.line([...court(u0, v0), ...court(u1, v1)], { stroke: '#ffffff', lw: 2.2, alpha: 0.95 });
    L(-1, FAR, 1, FAR); L(-1, NEAR, 1, NEAR); L(-1, FAR, -1, NEAR); L(1, FAR, 1, NEAR);
    L(-0.75, FAR, -0.75, NEAR); L(0.75, FAR, 0.75, NEAR);
    L(-0.75, -150, 0.75, -150); L(-0.75, 150, 0.75, 150); L(0, -150, 0, 150);
    // avversaria (personaggio ufficiale, piccolo sul fondo campo)
    const ox = oppX(t), oh = 118;
    R.circle(ox, FAR + 4, 22, { fill: '#000', alpha: 0.35, blur: 3 }, 20);
    const C = { w: 557, h: 1320, feet: 1254, body: 1188 }, k = oh / C.body;
    R.image(R.img.tc_opp_lit, ox - (C.w * k) / 2, FAR - C.feet * k, C.w * k, C.h * k, { sub: 2 });
    // rete (davanti all'avversaria)
    R.rect(cx(-1.12, NET), NET - 26, cx(1.12, NET) * 2, 26, { fill: 'rgba(255,255,255,0.10)' });
    R.band(cx(-1.12, NET), NET - 26, cx(1.12, NET), NET - 26, 3, { fill: '#ffffff' });
    // pallina con scia e ombra
    const pts = [];
    for (let i = 0; i <= 12; i++) { const q = ballAt(t - 0.14 + (i / 12) * 0.14); if (q) pts.push(q.g[0], q.y); }
    if (pts.length > 4) R.line(pts, { stroke: PAL.ball, lw: 4, alpha: 0.5, glow: 0.6 });
    const q = ballAt(t);
    if (q) {
      R.circle(q.g[0], q.g[1], 5 * q.k, { fill: '#000', alpha: 0.35 }, 12);
      const p = R.proj(q.g[0], q.y);
      if (p) ballScreen(R, p[0], p[1], 7 * q.k * R.scaleAt(q.g[0], q.y), { spin: [t * 8, t * 5, 0], glow: 0.8 });
    }
    // punto: onda sulla riga
    const pu = seg(t, tPoint, tPoint + 0.5);
    if (pu > 0 && pu < 1) { const g = court(0.9, -238); R.circle(g[0], g[1], lerp(6, 60, E.outCubic(pu)), { stroke: PAL.ball, lw: 3, alpha: 1 - pu, glow: 1 }, 32); }
    // HUD di gioco: punteggio e barra esperienza
    const won = seg(t, tPoint, tPoint + 0.1) > 0;
    R.rrect(-HX + 14, -HY + 62, 176, 40, 8, { fill: '#2456e8' });
    R.text('MARCO', -HX + 28, -HY + 82, { font: 'rob900', size: 16, v: 'cap', fill: '#fff' });
    R.text(won ? '40' : '30', -HX + 172, -HY + 82, { font: 'rob900', size: 20, align: 'right', v: 'cap', fill: won ? PAL.ball : '#fff' });
    R.rrect(HX - 190, -HY + 62, 176, 40, 8, { fill: '#e0602e' });
    R.text('LUNA.SPIN', HX - 176, -HY + 82, { font: 'rob900', size: 16, v: 'cap', fill: '#fff' });
    R.text('30', HX - 28, -HY + 82, { font: 'rob900', size: 20, align: 'right', v: 'cap', fill: '#fff' });
    const xp = t < xp0 ? lerp(0.58, 0.74, E.outCubic(seg(t, tPoint + 0.3, tPoint + 0.8))) : lerp(0.74, 1, E.inQuad(seg(t, xp0, xp1)));
    R.rrect(-HX + 20, HY - 70, SW - 40, 44, 14, { fill: 'rgba(8,5,26,0.7)' });
    R.text(xp >= 1 ? 'LV 30' : 'LV 29', -HX + 38, HY - 48, { font: 'rob900i', size: 18, v: 'cap', fill: xp >= 1 ? PAL.ball : '#fff' });
    R.rrect(-HX + 104, HY - 56, SW - 146, 16, 8, { fill: 'rgba(255,255,255,0.15)' });
    R.rrect(-HX + 104, HY - 56, (SW - 146) * xp, 16, 8, { fill: xp >= 1 ? PAL.ball : PAL.magenta, glow: 0.6 });
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    bgNight(R, t, { c1: '#3b1f7a', c2: PAL.magenta, c3: '#1b2cff' });
    bokeh(R, t, 0.8, (t - t0) * 30, 5);
    const lv = seg(t, tLvl - 0.05, tLvl + 0.1);
    R.push(TRS([PHX, 0, 0], [deg(3 * Math.sin(t * 0.9)) * (1 - seg(t, dive0, tEnd)), deg(-8 + 6 * Math.sin(t * 0.7)) * (1 - seg(t, dive0, tEnd)), 0], 1));
    R.with(T(30, 40, 60), () => R.rrect(-230, -460, 460, 920, 60, { fill: '#000', alpha: 0.45, blur: 40 }));
    phone(R, t, () => {
      game(R, t);
      // lo schermo si accende di luce durante il level up
      if (lv > 0) R.rect(-HX, -HY, SW, SH, { fill: { lin: [0, -HY, 0, HY], stops: [[0, rgba(PAL.magenta, 0.2)], [1, rgba('#ffffff', 0.9)]] }, alpha: lv * seg(t, tLvl, dive0 + 0.3) });
    }, { rimGlow: 0.7 + lv * 0.8 });
    R.pop();
    // +120 XP sul punto vinto
    const xa = env(t, tPoint + 0.05, tPoint + 0.2, tPoint + 0.95, tPoint + 1.15);
    if (xa > 0) R.hud(() => {
      const k = E.outBack(seg(t, tPoint + 0.05, tPoint + 0.3), 2);
      R.with([k, 0, 0, 140, 0, k, 0, 700 - (t - tPoint) * 30, 0, 0, 1, 0], () =>
        R.text('+120 XP', 0, 0, { font: 'unb900', size: 72, align: 'left', v: 'cap', fill: PAL.ball, alpha: xa, glow: 0.6, tracking: -0.02, shadow: ['rgba(0,0,0,0.5)', 20, 0, 6] }));
    });
    // la domanda, grande e leggibile anche senza audio
    const qa = seg(t, a.t0 + 0.7, a.t0 + 0.9) * (1 - seg(t, tLvl - 0.15, tLvl));
    if (qa > 0) R.hud(() => {
      const L = [['GIOCHI A', 470, a.t0 + 0.7, '#ffffff'], ['TENNIS CLASH?', 580, a.t0 + 0.85, PAL.ball]];
      for (const [str, y, ts, col] of L) {
        const u = E.outExpo(seg(t, ts, ts + 0.45));
        R.clipRect(120, y - 80, 900, 110);
        R.text(str, 140, y + (1 - u) * 110, { font: 'unb900', size: 84, v: 'cap', fill: col, alpha: qa, tracking: -0.03, shadow: ['rgba(0,0,0,0.5)', 24, 0, 8], glow: col === PAL.ball ? 0.25 : 0 });
        R.unclip();
      }
    });
    // LEVEL UP: rapido, sbatte e si apre
    const la = seg(t, tLvl, tLvl + 0.06) * (1 - seg(t, dive0 + 0.25, tEnd));
    if (la > 0) R.hud(() => {
      const u = E.outExpo(seg(t, tLvl, tLvl + 0.25));
      R.with([lerp(2.4, 1, u), 0, 0, W / 2, 0, lerp(2.4, 1, u), 0, H / 2, 0, 0, 1, 0], () => {
        R.text('LEVEL UP', 0, 0, { font: 'unb900', size: 190, align: 'center', v: 'cap', fill: '#ffffff', alpha: la, tracking: -0.04, depth: 18, depthSteps: 9,
          side: (v) => rgba(mixc(PAL.magenta, '#2a0a50', v), 1), shadow: ['rgba(0,0,0,0.45)', 40, 0, 12] });
      });
      // anelli d'urto
      const r = seg(t, tLvl, tLvl + 0.45);
      R.circle(W / 2, H / 2, lerp(100, 1300, E.outCubic(r)), { stroke: '#ffffff', lw: lerp(18, 2, r), alpha: (1 - r) * la, glow: 1 }, 72);
    });
    // bianco d'ingresso nel mondo
    const wh = E.inCubic(seg(t, tEnd - 0.22, tEnd));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: '#ffffff', alpha: wh }));
  }

  function fx(t) {
    const f = {};
    if (t >= tLvl && t < tLvl + 0.3) { const u = (t - tLvl) / 0.3; f.flash = [PAL.magenta, 0.35 * (1 - u)]; f.ca = 0.014 * (1 - u); }
    if (t >= dive0) { f.mb = 10; f.ca = 0.012 * seg(t, dive0, tEnd); }
    if (t < tPoint + 0.2 && t > tPoint - 0.3) f.mb = 6;
    return f;
  }

  return { t0, t1: tEnd, draw, fx };
}
