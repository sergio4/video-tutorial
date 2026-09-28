// B (seconda metà) + C · «…il tuo gioco sale di livello. Tornei ufficiali, sfide con la community, classifiche:
// è il circuito eSports della Federazione Italiana Tennis e Padel.»
// Il mondo eSports FITP: un'arena con il logo eSports FITP, dove MARCO si materializza dopo il level up.
// C1 il tabellone ufficiale FITP eSeries by BMW si accende; C2 arriva LUNA.SPIN, scambio di battute e VS;
// C3 la camera scorre sulla classifica, dove MARCO sale. L'arena prosegue verso il portale della scena D (tessera.js).
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T } from '../engine/math.js';
import { PAL } from '../engine/kit.js';
import { camTrack, shake, dust } from './common.js';
import { M, P } from './arena.js';
import { charCard } from './chars.js';

export const HERO0 = P(-1.1, 0, 0), OPP0 = P(2.1, 0.7, 0);
export const PORTAL = P(21, 3, 0);
const BR = { x: -6.6, z: 6.8, top: 4.9, w: 13.2, h: 4.2 }; // tabellone (metri)
const LB = { x: 10.2, z: 4.2, top: 5.2, w: 6.4, h: 4.6 };  // classifica (metri)

// ---------------------------------------------------------------- arena condivisa
function floor(R, t) {
  R.bg('#0a0524', '#040210', [[W * 0.5, H * 0.2, 900, '#3b1f7a', 0.45], [W * 0.85, H * 0.4, 600, PAL.magenta, 0.12]]);
  R.with(TRS(P(0, 0, 0), [deg(-90), 0, 0], M), () => {
    R.rect(-14, -16, 44, 30, { fill: { lin: [0, -16, 0, 14], stops: [[0, '#0c0830'], [1, '#050318']] } });
    for (let x = -14; x <= 30; x += 2) R.band(x, -16, x, 14, 0.02, { fill: x % 6 ? '#3a2a9a' : PAL.cyan, alpha: x % 6 ? 0.35 : 0.5, glow: 0.3 });
    for (let z = -16; z <= 14; z += 2) R.band(-14, z, 30, z, 0.02, { fill: '#3a2a9a', alpha: 0.35, glow: 0.2 });
    // pedana del palco
    R.circle(-0.2, 0.2, 3.2, { fill: '#1a1050', alpha: 0.9 }, 64);
    R.circle(-0.2, 0.2, 3.2, { stroke: PAL.magenta, lw: 0.05, glow: 1 }, 64);
    R.circle(-0.2, 0.2, 2.6, { stroke: PAL.cyan, lw: 0.03, alpha: 0.7, glow: 0.8 }, 64);
  });
}

function backdrop(R, t, logoA) {
  // logo eSports FITP gigante sopra il palco
  const w = 4.6 * M, h = w * (717 / 1278);
  R.with(T(4.3 * M, -7.9 * M + h / 2, 7.4 * M), () => {
    R.image(R.img.logo, -w / 2, -h / 2, w, h, { sub: 6, alpha: logoA });
  });
  // fasci di luce dal soffitto
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 3.2 + Math.sin(t * 0.6 + i) * 0.4;
    R.worldPoly([P(x - 0.1, 7, 12), P(x + 0.1, 7, 12), P(x + 1.6, 1, 0), P(x - 1.6, 1, 0)], { fill: i % 2 ? PAL.cyan : PAL.magenta, alpha: 0.05, blend: 'lighter' });
  }
}

// tabellone: 8 giocatori, quarti → semifinali → finale; u = avanzamento dell'accensione 0..1
const LEFT = ['MARCO', 'ACE_MARTI', 'DROPSHOT99', 'K1NG.SERVE'], RIGHT = ['LUNA.SPIN', 'TOPSPIN.G', 'NETRUNNER', 'VOLLEY.X'];
function bracket(R, t, u, a) {
  if (a <= 0) return;
  R.with(TRS(P(BR.x, BR.z, BR.top), [0, 0, 0], M), () => {
    R.rrect(0, 0, BR.w, BR.h, 0.25, { fill: 'rgba(12,7,44,0.88)', alpha: a });
    R.rrect(0, 0, BR.w, BR.h, 0.25, { stroke: PAL.cyan, lw: 0.04, alpha: a, glow: 0.8 });
    R.text('FITP eSERIES BY BMW', 0.45, 0.45, { font: 'unb900', size: 0.34, v: 'cap', fill: '#ffffff', alpha: a });
    R.text('TABELLONE UFFICIALE', BR.w - 0.45, 0.45, { font: 'mono800', size: 0.2, align: 'right', v: 'cap', fill: PAL.cyan, alpha: a, tracking: 0.2 });
    const col = (side, lvl) => (side < 0 ? 0.45 + lvl * 1.9 : BR.w - 0.45 - lvl * 1.9);
    const slotY = (i) => 1.15 + i * 0.72;
    const semiY = (i) => (slotY(i * 2) + slotY(i * 2 + 1)) / 2;
    const finY = (semiY(0) + semiY(1)) / 2;
    for (const side of [-1, 1]) {
      const names = side < 0 ? LEFT : RIGHT;
      const hot = side < 0 ? PAL.ball : PAL.magenta;
      names.forEach((n, i) => {
        const x = col(side, 0), w = 2.3, bx = side < 0 ? x : x - w;
        const win = i === 0;
        R.rrect(bx, slotY(i) - 0.26, w, 0.52, 0.08, { fill: win ? rgba(hot, 0.22 * seg(u, 0.1, 0.3) + 0.08) : 'rgba(255,255,255,0.06)', alpha: a });
        R.text(n, bx + 0.16, slotY(i), { font: 'unb700', size: 0.22, v: 'cap', fill: win ? '#ffffff' : '#a9a3d8', alpha: a });
        // linea verso la semifinale
        const on = win ? seg(u, 0.1, 0.4) : 0;
        const xs = side < 0 ? bx + w : bx, xm = xs + side * -0.35, sy = semiY(Math.floor(i / 2));
        R.line([xs, slotY(i), xm, slotY(i), xm, sy], { stroke: on > 0 ? hot : 'rgba(255,255,255,0.25)', lw: on > 0 ? 0.05 : 0.025, alpha: a, glow: on * 0.9 });
      });
      // semifinale e linea verso la finale
      for (let s = 0; s < 2; s++) {
        const win = s === 0, on = win ? seg(u, 0.4, 0.7) : 0;
        const x0 = side < 0 ? col(side, 0) + 2.65 : col(side, 0) - 2.65, w = 1.9, bx = side < 0 ? x0 : x0 - w;
        R.rrect(bx, semiY(s) - 0.24, w, 0.48, 0.08, { fill: win && u > 0.4 ? rgba(hot, 0.3) : 'rgba(255,255,255,0.06)', alpha: a });
        if (win && u > 0.4) R.text(names[0], bx + 0.14, semiY(s), { font: 'unb700', size: 0.2, v: 'cap', fill: '#ffffff', alpha: a * seg(u, 0.4, 0.5) });
        const xs = side < 0 ? bx + w : bx, xm = BR.w / 2 + side * -0.95;
        R.line([xs, semiY(s), xm, semiY(s), xm, finY], { stroke: on > 0 ? hot : 'rgba(255,255,255,0.25)', lw: on > 0 ? 0.05 : 0.025, alpha: a, glow: on * 0.9 });
      }
    }
    // finale al centro
    const fo = seg(u, 0.7, 0.95);
    R.rrect(BR.w / 2 - 0.95, finY - 0.55, 1.9, 1.1, 0.14, { fill: 'rgba(255,255,255,0.08)', stroke: fo > 0 ? '#ffffff' : 'rgba(255,255,255,0.3)', lw: 0.04, alpha: a, glow: fo });
    R.text('FINALE', BR.w / 2, finY - 0.22, { font: 'mono800', size: 0.17, align: 'center', v: 'cap', fill: PAL.cyan, alpha: a, tracking: 0.2 });
    R.text('MARCO · LUNA.SPIN', BR.w / 2, finY + 0.18, { font: 'unb700', size: 0.15, align: 'center', v: 'cap', fill: '#ffffff', alpha: a * fo });
  });
}

// classifica: MARCO sale dall'8° al 3° posto (u 0..1)
const ROWS = [['LUNA.SPIN', 2480], ['ACE_MARTI', 2310], ['TOPSPIN.G', 2205], ['NETRUNNER', 2150], ['DROPSHOT99', 2090], ['VOLLEY.X', 1985], ['K1NG.SERVE', 1940]];
function leaderboard(R, t, u, a) {
  if (a <= 0) return;
  R.with(TRS(P(LB.x, LB.z, LB.top), [0, deg(-14), 0], M), () => {
    R.rrect(0, 0, LB.w, LB.h, 0.25, { fill: 'rgba(12,7,44,0.9)', alpha: a });
    R.rrect(0, 0, LB.w, LB.h, 0.25, { stroke: PAL.magenta, lw: 0.04, alpha: a, glow: 0.8 });
    R.text('CLASSIFICA eSPORTS FITP', 0.4, 0.45, { font: 'unb900', size: 0.3, v: 'cap', fill: '#ffffff', alpha: a });
    const pos = lerp(7, 2, E.inOutCubic(u)); // indice (0 = primo) della riga di MARCO
    const rowY = (k) => 1.05 + k * 0.52;
    R.clipRect(0.2, 0.75, LB.w - 0.4, LB.h - 0.95);
    ROWS.forEach(([n, p], i) => {
      const k = i < pos ? i : i + 1; // le righe sotto MARCO scalano di uno
      const kk = i >= 2 ? lerp(i, i + 1, clamp((i + 1 - pos))) : i;
      const y = rowY(i >= Math.floor(pos) ? kk : i);
      R.text(String(Math.round((i >= Math.floor(pos) ? kk : i) + 1)).padStart(2, '0'), 0.45, y, { font: 'mono800', size: 0.2, v: 'cap', fill: '#8e86c8', alpha: a });
      R.text(n, 1.05, y, { font: 'unb700', size: 0.22, v: 'cap', fill: '#d8d4ff', alpha: a });
      R.text(p.toLocaleString('it-IT'), LB.w - 0.45, y, { font: 'mono800', size: 0.2, align: 'right', v: 'cap', fill: '#d8d4ff', alpha: a });
    });
    // riga di MARCO, evidenziata, che sale
    const y = rowY(pos);
    R.rrect(0.25, y - 0.24, LB.w - 0.5, 0.48, 0.1, { fill: rgba(PAL.ball, 0.22), alpha: a });
    R.rrect(0.25, y - 0.24, LB.w - 0.5, 0.48, 0.1, { stroke: PAL.ball, lw: 0.035, alpha: a, glow: 0.8 });
    R.text(String(Math.round(pos + 1)).padStart(2, '0'), 0.45, y, { font: 'mono800', size: 0.2, v: 'cap', fill: PAL.ball, alpha: a });
    R.text('MARCO', 1.05, y, { font: 'unb900', size: 0.24, v: 'cap', fill: '#ffffff', alpha: a });
    R.text(Math.round(lerp(1890, 2190, u)).toLocaleString('it-IT'), LB.w - 0.45, y, { font: 'mono800', size: 0.2, align: 'right', v: 'cap', fill: PAL.ball, alpha: a });
    if (u > 0.05 && u < 1) R.text('▲', LB.w - 1.9, y, { font: 'rob900', size: 0.22, v: 'cap', fill: PAL.ball, alpha: a });
    R.unclip();
  });
}

// portale del torneo ufficiale (serve alla scena D). st: { lock 0..1, open 0..1 }
export function portal(R, t, st = {}) {
  const open = st.open || 0;
  R.with(TRS(PORTAL, [0, deg(-10), 0], M), () => {
    const w = 3.2, h = 4.6;
    // barriera di energia
    const ba = 1 - open;
    if (ba > 0) {
      R.rrect(-w / 2, -h, w, h, 0.4, { fill: { lin: [0, -h, 0, 0], stops: [[0, 'rgba(244,8,188,0.35)'], [1, 'rgba(90,40,255,0.55)']] }, alpha: ba });
      for (let i = 0; i < 18; i++) { const y = -h + ((i / 18 + t * 0.4) % 1) * h; R.band(-w / 2 + 0.1, y, w / 2 - 0.1, y, 0.015, { fill: '#ffffff', alpha: 0.18 * ba }); }
    }
    if (open > 0) R.rrect(-w / 2, -h, w, h, 0.4, { fill: '#ffffff', alpha: Math.min(1, open * 1.4), glow: 1.4 });
    R.rrect(-w / 2, -h, w, h, 0.4, { stroke: PAL.magenta, lw: 0.1, glow: 1.3 });
    R.rrect(-w / 2 - 0.18, -h - 0.18, w + 0.36, h + 0.18, 0.5, { stroke: PAL.cyan, lw: 0.04, alpha: 0.8, glow: 0.8 });
    R.text('TORNEO UFFICIALE', 0, -h - 0.55, { font: 'unb900', size: 0.36, align: 'center', v: 'cap', fill: '#ffffff', glow: 0.5 });
    // lucchetto
    const la = (st.lock || 0) * (1 - open);
    if (la > 0) {
      const k = E.outBack(Math.min(1, st.lockPop ?? 1), 1.8), up = st.unlock || 0;
      R.with([k, 0, 0, 0, 0, k, 0, -2.3, 0, 0, 1, -0.05], () => {
        R.circle(0, 0, 0.9, { fill: 'rgba(8,5,26,0.8)', alpha: la }, 48);
        R.circle(0, 0, 0.9, { stroke: up > 0.5 ? PAL.ball : '#ff4f8b', lw: 0.06, alpha: la, glow: 1 }, 48);
        R.rrect(-0.36, -0.12, 0.72, 0.56, 0.08, { fill: '#ffffff', alpha: la });
        R.with(T(up * 0.18, -up * 0.2, 0), () => R.arc(0, -0.12, 0.24, Math.PI, Math.PI * 2, { stroke: '#ffffff', lw: 0.1, alpha: la }, 20));
        R.circle(0, 0.12, 0.07, { fill: '#1b0f45', alpha: la }, 12);
      });
    }
  });
}

// scena completa dell'arena. st: { hero: pos|null, heroA, heroReveal, opp: pos|null, oppA, bracketU, bracketA, lbU, lbA, portal }
export function drawWorld(R, t, st) {
  floor(R, t);
  backdrop(R, t, st.logoA ?? 1);
  bracket(R, t, st.bracketU ?? 0, st.bracketA ?? 1);
  leaderboard(R, t, st.lbU ?? 0, st.lbA ?? 1);
  if (st.portal) portal(R, t, st.portal);
  dust(R, t, [-12 * M, -8 * M, -6 * M, 28 * M, 0, 12 * M], 90, 11, { a: 0.5 });
  const chars = [];
  if (st.opp) chars.push(['opp', st.opp, st.oppA ?? 1, 1]);
  if (st.hero) chars.push(['hero', st.hero, st.heroA ?? 1, st.heroReveal ?? 1]);
  chars.sort((p, q) => q[1][2] - p[1][2]); // prima il più lontano
  for (const [key, pos, a, rev] of chars) {
    if (a <= 0) continue;
    R.with(TRS(pos, [deg(-90), 0, 0], 1), () => R.circle(0, 0, 0.55 * M, { fill: '#000', alpha: 0.5 * a, blur: 8 }, 32));
    R.with(TRS(pos, [0, 0, 0], 1), () => {
      const hh = 1.86 * M;
      if (rev < 1) {
        // materializzazione: la figura si compone dal basso, bordo di scansione ciano
        const y = -hh * 1.1 * rev;
        R.clipRect(-2 * M, y, 4 * M, 2 * M - y);
        charCard(R, key, hh, { alpha: a * 0.9 });
        R.unclip();
        R.band(-0.7 * M, y, 0.7 * M, y, 3, { fill: PAL.cyan, alpha: a, glow: 1.5 });
        for (let i = 0; i < 10; i++) R.band(-0.6 * M, y + i * 7, 0.6 * M, y + i * 7, 1, { fill: PAL.cyan, alpha: a * 0.3 * (1 - i / 10) });
      } else charCard(R, key, hh, { alpha: a });
    });
  }
}

// fumetto di chat ancorato a un punto del mondo
export function bubble(R, t, world, text, t_in, o = {}) {
  const u = E.outBack(seg(t, t_in, t_in + 0.25), 1.8);
  const out = seg(t, o.until ?? 1e9, (o.until ?? 1e9) + 0.2);
  if (seg(t, t_in, t_in + 0.25) <= 0 || out >= 1) return;
  const pc = R.camW(world);
  if (pc[2] < 1) return;
  const [sx, sy] = R.projC(pc);
  R.hud(() => {
    const w = R.measure(text, 'rob700', 30, 0) + 56, h = 66, right = o.right;
    const x = right ? sx - w + 30 : sx - 30, y = sy - h - 26;
    R.with([u * (1 - out), 0, 0, sx, 0, u * (1 - out), 0, sy, 0, 0, 1, 0], () => R.with(T(-sx, -sy, 0), () => {
      R.rrect(x, y, w, h, 22, { fill: o.fill || '#ffffff', shadow: ['rgba(0,0,0,0.35)', 20, 0, 8] });
      R.poly(right ? [x + w - 60, y + h - 2, x + w - 30, y + h - 2, x + w - 34, y + h + 20] : [x + 30, y + h - 2, x + 60, y + h - 2, x + 34, y + h + 20], { fill: o.fill || '#ffffff' });
      R.text(o.name || '', x + 28, y + 20, { font: 'mono800', size: 14, v: 'cap', fill: o.nameCol || PAL.magenta, tracking: 0.1 });
      R.text(text, x + 28, y + 45, { font: 'rob700', size: 28, v: 'cap', fill: '#16102e' });
    }));
  });
}

// ---------------------------------------------------------------- atto: dal level up al mondo, poi C1-C3
export function mondo(S, TL) {
  const b = S.b, c = S.c;
  const t0 = b.t0 + 1.05, t1 = c.t1;
  const rev0 = t0 + 0.08, rev1 = t0 + 0.7;     // MARCO si materializza
  const c1 = c.t0, c2 = c.t0 + 1.9, c3 = c.t0 + 3.75;
  const oppIn = c2 + 0.05, bL = c2 + 0.35, bM = c2 + 0.95, vs = c2 + 1.45;

  const camKeys = [
    { t: t0, eye: P(-0.6, -3.4, 1.0), tgt: P(-1.1, 0, 1.15), f: 1350, roll: deg(-3) },
    { t: rev1 + 0.2, eye: P(-0.9, -3.8, 1.1), tgt: P(-1.1, 0, 1.2), f: 1350, roll: deg(1) },
    { t: c1 + 0.2, eye: P(-0.4, -6.8, 2.0), tgt: P(-0.2, 3, 2.6), f: 1350, ease: 'inOutCubic' },
    { t: c2 - 0.1, eye: P(0.2, -8.6, 2.4), tgt: P(0.2, 3, 2.9), f: 1350 },
    { t: c2 + 0.35, eye: P(0.6, -7.0, 1.2), tgt: P(0.6, 1, 1.75), f: 1350, ease: 'inOutCubic' },
    { t: c3 - 0.05, eye: P(0.8, -6.6, 1.2), tgt: P(0.8, 1, 1.75), f: 1350 },
    { t: c3 + 0.55, eye: P(8.0, -4.4, 2.4), tgt: P(10.5, 4.2, 2.8), f: 1350, ease: 'inOutCubic' },
    { t: t1, eye: P(8.6, -4.8, 2.5), tgt: P(10.7, 4.2, 2.8), f: 1350 },
  ];
  const camAt = (t) => camTrack(camKeys, t, shake(t, [[rev1, 10, 0.4], [vs, 14, 0.45]]));

  function labels(R, t) {
    const L = [['01', 'TORNEI UFFICIALI', c1 + 0.15, c2 - 0.1], ['02', 'COMMUNITY', c2 + 0.15, c3 - 0.05], ['03', 'CLASSIFICHE', c3 + 0.35, t1 + 1]];
    R.hud(() => {
      for (const [n, s, a0, a1] of L) {
        const a = seg(t, a0, a0 + 0.12) * (1 - seg(t, a1, a1 + 0.12));
        if (a <= 0) continue;
        const u = E.outExpo(seg(t, a0, a0 + 0.35));
        R.text(n, 96, 128, { font: 'mono800', size: 26, v: 'cap', fill: PAL.cyan, alpha: a, tracking: 0.2 });
        R.clipRect(90, 150, 1100, 110);
        R.text(s, 96, 205 + (1 - u) * 100, { font: 'unb900', size: 78, v: 'cap', fill: '#ffffff', alpha: a, tracking: -0.02, shadow: ['rgba(0,0,0,0.5)', 24, 0, 8] });
        R.unclip();
      }
      // super esplicativo
      const sa = seg(t, c1 + 0.3, c1 + 0.6);
      if (sa > 0) {
        R.rect(0, H - 118, W, 118, { fill: { lin: [0, H - 118, 0, H], stops: [[0, 'rgba(5,3,16,0)'], [1, 'rgba(5,3,16,0.85)']] }, alpha: sa });
        R.text('eSports FITP · il circuito ufficiale della Federazione Italiana Tennis e Padel', W / 2, H - 58, { font: 'unb600', size: 30, align: 'center', v: 'cap', fill: '#ffffff', alpha: sa, tracking: -0.01 });
      }
    });
  }

  function heroTag(R, t) {
    const a = seg(t, rev1 + 0.05, rev1 + 0.25) * (1 - seg(t, c1 + 0.1, c1 + 0.3));
    if (a <= 0) return;
    const pc = R.camW(P(-1.1, 0, 1.2));
    if (pc[2] < 1) return;
    const [x, y] = R.projC(pc);
    R.hud(() => {
      R.rrect(x + 90, y - 30, 300, 64, 14, { fill: 'rgba(8,5,26,0.78)', alpha: a });
      R.rrect(x + 90, y - 30, 300, 64, 14, { stroke: PAL.ball, lw: 2.5, alpha: a, glow: 0.6 });
      R.text('MARCO', x + 112, y + 2, { font: 'unb900', size: 28, v: 'cap', fill: '#ffffff', alpha: a });
      R.text('LV 30', x + 368, y + 2, { font: 'bc900i', size: 36, align: 'right', v: 'cap', fill: PAL.ball, alpha: a });
    });
  }

  function versus(R, t) {
    const a = env(t, vs, vs + 0.06, vs + 0.5, vs + 0.7);
    if (a <= 0) return;
    R.hud(() => {
      const k = E.outBack(seg(t, vs, vs + 0.25), 2.2), cx = W * 0.54, cy = H * 0.5;
      const cut = E.outExpo(seg(t, vs - 0.03, vs + 0.2));
      R.band(cx + 260 * cut, cy - 700 * cut, cx - 260 * cut, cy + 700 * cut, 10, { fill: '#ffffff', alpha: a * 0.9, glow: 1.2, glowColor: PAL.magenta });
      R.with([k, 0, 0, cx, 0, k, 0, cy, 0, 0, 1, 0], () => R.text('VS', 0, 0, { font: 'unb900', size: 150, align: 'center', v: 'cap', skew: 0.18, fill: '#ffffff', alpha: a, depth: 12, depthSteps: 6,
        side: (u) => rgba(mixc(PAL.magenta, '#2a0a50', u), 1), shadow: ['rgba(0,0,0,0.5)', 30, 0, 10] }));
    });
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    const oppU = E.outExpo(seg(t, oppIn, oppIn + 0.35));
    drawWorld(R, t, {
      hero: HERO0, heroReveal: seg(t, rev0, rev1),
      opp: oppU > 0 ? [OPP0[0] + (1 - oppU) * 3 * M, OPP0[1], OPP0[2]] : null, oppA: oppU,
      bracketU: seg(t, c1 + 0.2, c2 - 0.2), bracketA: 1,
      lbU: seg(t, c3 + 0.55, c3 + 1.4), lbA: 1,
      portal: { lock: 0 },
    });
    // lampo di materializzazione
    const fl = env(t, rev1 - 0.05, rev1, rev1, rev1 + 0.25);
    if (fl > 0) R.hud(() => R.rect(0, 0, W, H, { fill: PAL.cyan, alpha: fl * 0.25 }));
    heroTag(R, t);
    bubble(R, t, P(OPP0[0] / M + 0.1, OPP0[2] / M, 2.15), 'Ti aspetto in finale!', bL, { name: 'LUNA.SPIN', right: true, until: c3 - 0.1 });
    bubble(R, t, P(-1.1, 0, 2.1), 'Ci vediamo lì.', bM, { name: 'MARCO', nameCol: '#2a8a00', until: c3 - 0.1 });
    versus(R, t);
    labels(R, t);
    const wh = 1 - E.outCubic(seg(t, t0, t0 + 0.3));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: '#ffffff', alpha: wh }));
  }

  function fx(t) {
    const f = {};
    if (t < t0 + 0.3) f.mb = 5;
    if (t >= c1 && t < c1 + 0.3) f.mb = 6;
    if (t >= c3 - 0.05 && t < c3 + 0.6) f.mb = 8;
    if (t >= vs && t < vs + 0.3) { const u = (t - vs) / 0.3; f.flash = ['#ffffff', 0.25 * (1 - u)]; f.ca = 0.01 * (1 - u); }
    return f;
  }

  return { t0, t1, draw, fx };
}
