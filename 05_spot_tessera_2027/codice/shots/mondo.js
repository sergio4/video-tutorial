// B (seconda metà) + C · «…il tuo gioco sale di livello. Il circuito ufficiale FITP: tornei e sfide con giocatori
// da tutta Italia.»
// Il mondo eSports FITP: un'arena con il grande logo eSports FITP, dove MARCO si materializza dopo il level up.
// C1 la camera arretra sull'arena (super: circuito ufficiale FITP); C2 si avvicina al tabellone del torneo FITP eSeries
// by BMW che si riempie di giocatori da tutta Italia: resta un solo posto chiuso, «IL TUO POSTO», contro LUNA.SPIN.
// La scena D (tessera.js) entra in quel posto.
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T, apply } from '../engine/math.js';
import { PAL } from '../engine/kit.js';
import { camTrack, shake, dust } from './common.js';
import { M, P } from './arena.js';
import { charCard } from './chars.js';

export const HERO0 = P(-5.0, -0.8, 0);
// tabellone (metri): angolo in alto a sinistra, larghezza, altezza
export const BD = { x: -7.2, z: 6.8, top: 5.6, w: 14.4, h: 4.5 };
const PAIRS = [
  [['ACE_MARTI', 'Milano'], ['NETRUNNER', 'Napoli']],
  [['DROPSHOT99', 'Bari'], ['VOLLEY.X', 'Torino']],
  [['TOPSPIN.G', 'Firenze'], ['SMASH.IT', 'Palermo']],
  [['K1NG.SERVE', 'Bologna'], ['DRIVE.LU', 'Cagliari']],
  [null, ['LUNA.SPIN', 'Roma']], // il posto libero, contro LUNA.SPIN
  [['MATCHPOINT', 'Trieste'], ['SLICE.RE', 'Pescara']],
  [['ROLAND.K', 'Perugia'], ['LOB.MASTER', 'Ancona']],
  [['NOVA.ACE', 'Genova'], ['BACKSPIN', 'Verona']],
];
const PW = 6.6, PH = 0.8; // riquadro di una sfida (metri)
const pairXY = (i) => [i < 4 ? 0.35 : 7.45, 1.15 + (i % 4) * 0.98]; // angolo del riquadro, coordinate del tabellone
// centro del posto libero (lato sinistro del riquadro 4) e della sfida, in coordinate mondo
const [lx, ly] = pairXY(4);
export const SLOT = P(BD.x + lx + 0.2 + 0.32, BD.z - 0.03, BD.top - (ly + PH / 2));
export const SLOT_PAIR = P(BD.x + lx + PW / 2, BD.z, BD.top - (ly + PH / 2));

// ---------------------------------------------------------------- arena condivisa
function floor(R, t) {
  R.bg('#0a0524', '#040210', [[W * 0.5, H * 0.2, 900, '#3b1f7a', 0.45], [W * 0.85, H * 0.4, 600, PAL.magenta, 0.12]]);
  R.with(TRS(P(0, 0, 0), [deg(-90), 0, 0], M), () => {
    R.rect(-16, -18, 32, 30, { fill: { lin: [0, -18, 0, 12], stops: [[0, '#0c0830'], [1, '#050318']] } });
    for (let x = -16; x <= 16; x += 2) R.band(x, -18, x, 12, 0.02, { fill: x % 6 ? '#3a2a9a' : PAL.cyan, alpha: x % 6 ? 0.35 : 0.5, glow: 0.3 });
    for (let z = -18; z <= 12; z += 2) R.band(-16, z, 16, z, 0.02, { fill: '#3a2a9a', alpha: 0.35, glow: 0.2 });
    R.circle(-5.0, -0.8, 2.2, { fill: '#1a1050', alpha: 0.9 }, 64);
    R.circle(-5.0, -0.8, 2.2, { stroke: PAL.magenta, lw: 0.05, glow: 1 }, 64);
    R.circle(-5.0, -0.8, 1.7, { stroke: PAL.cyan, lw: 0.03, alpha: 0.7, glow: 0.8 }, 64);
  });
}

function backdrop(R, t) {
  // grande logo eSports FITP sopra il tabellone
  const w = 6.4 * M, h = w * (717 / 1278);
  R.with(T(0, -(BD.top + 0.35) * M - h / 2, 7.0 * M), () => R.image(R.img.logo, -w / 2, -h / 2, w, h, { sub: 6 }));
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 3.4 + Math.sin(t * 0.6 + i) * 0.4;
    R.worldPoly([P(x - 0.1, 7, 13), P(x + 0.1, 7, 13), P(x + 1.6, 1, 0), P(x - 1.6, 1, 0)], { fill: i % 2 ? PAL.cyan : PAL.magenta, alpha: 0.05, blend: 'lighter' });
  }
}

// tabellone. st: { fill 0..1 (i nomi compaiono), lock 0..1, lockPop, unlock 0..1, open 0..1 }
function board(R, t, st) {
  const fill = st.fill ?? 1;
  R.with(TRS(P(BD.x, BD.z, BD.top), [0, 0, 0], M), () => {
    R.rrect(0, 0, BD.w, BD.h + 0.2, 0.25, { fill: 'rgba(12,7,44,0.9)' });
    R.rrect(0, 0, BD.w, BD.h + 0.2, 0.25, { stroke: PAL.cyan, lw: 0.04, glow: 0.8 });
    R.text('FITP eSERIES BY BMW · TABELLONE UFFICIALE', 0.4, 0.5, { font: 'unb900', size: 0.3, v: 'cap', fill: '#ffffff' });
    R.text('GIOCATORI DA TUTTA ITALIA', BD.w - 0.4, 0.5, { font: 'mono800', size: 0.2, align: 'right', v: 'cap', fill: PAL.cyan, tracking: 0.2 });
    PAIRS.forEach((pr, i) => {
      const [x, y] = pairXY(i);
      const free = !pr[0];
      R.rrect(x, y, PW, PH, 0.12, { fill: free ? 'rgba(255,79,139,0.08)' : 'rgba(255,255,255,0.05)' });
      R.text('VS', x + PW / 2, y + PH / 2, { font: 'unb900', size: 0.2, align: 'center', v: 'cap', fill: '#6f68a8' });
      pr.forEach((p, s) => {
        const sx = x + (s ? PW / 2 + 0.35 : 0.2), k = seg(fill, (i * 2 + s) / 18, (i * 2 + s) / 18 + 0.12);
        if (!p) return;
        if (k <= 0) { R.rrect(sx, y + 0.14, PW / 2 - 0.55, PH - 0.28, 0.08, { fill: 'rgba(255,255,255,0.04)' }); return; }
        const pop = E.outBack(k, 2);
        R.with([pop, 0, 0, sx + (PW / 2 - 0.55) / 2, 0, pop, 0, y + PH / 2, 0, 0, 1, 0], () => {
          const hot = p[0] === 'LUNA.SPIN';
          R.rrect(-(PW / 2 - 0.55) / 2, -(PH - 0.28) / 2, PW / 2 - 0.55, PH - 0.28, 0.08, { fill: hot ? 'rgba(244,8,188,0.28)' : 'rgba(255,255,255,0.08)' });
          R.text(p[0], -(PW / 2 - 0.55) / 2 + 0.14, -0.06, { font: 'unb700', size: 0.2, v: 'cap', fill: '#ffffff' });
          R.text(p[1], -(PW / 2 - 0.55) / 2 + 0.14, 0.17, { font: 'mono800', size: 0.12, v: 'cap', fill: hot ? '#ff9ae4' : '#8e86c8', tracking: 0.1 });
        });
      });
      if (free) {
        // il posto libero: chiuso dal lucchetto finché non arriva la tessera
        const sx = x + 0.2, w = PW / 2 - 0.55, cy = y + PH / 2;
        const open = st.open || 0, pulse = 0.5 + 0.5 * Math.sin(t * 7);
        R.rrect(sx, y + 0.1, w, PH - 0.2, 0.1, { stroke: open > 0.5 ? PAL.ball : '#ff4f8b', lw: 0.035, alpha: 0.6 + 0.4 * (open > 0.5 ? 1 : pulse * (st.lock || 0.3)), glow: 0.9 });
        if (open > 0) R.rrect(sx, y + 0.1, w, PH - 0.2, 0.1, { fill: rgba(PAL.ball, 0.22 * open) });
        R.text(open > 0.5 ? 'ISCRIZIONI APERTE' : 'IL TUO POSTO', sx + 0.6, cy, { font: 'unb900', size: open > 0.5 ? 0.15 : 0.19, v: 'cap', fill: open > 0.5 ? PAL.ball : '#ffb3cf' });
        const la = (st.lock ?? 1) * (1 - open);
        if (la > 0) {
          const k = E.outBack(Math.min(1, st.lockPop ?? 1), 1.8), up = st.unlock || 0;
          R.with([k, 0, 0, sx + 0.32, 0, k, 0, cy, 0, 0, 1, -0.02], () => {
            R.rrect(-0.13, -0.03, 0.26, 0.2, 0.03, { fill: '#ffffff', alpha: la });
            R.with(T(up * 0.07, -up * 0.08, 0), () => R.arc(0, -0.03, 0.09, Math.PI, Math.PI * 2, { stroke: '#ffffff', lw: 0.035, alpha: la }, 16));
          });
        } else if (open > 0.5) {
          R.circle(sx + 0.32, cy, 0.12, { fill: PAL.ball, glow: 0.6 }, 24);
        }
      }
    });
  });
}

// scena completa dell'arena. st: { hero, heroReveal, heroA, board: {...} }
export function drawWorld(R, t, st) {
  floor(R, t);
  backdrop(R, t);
  board(R, t, st.board || {});
  dust(R, t, [-12 * M, -9 * M, -8 * M, 12 * M, 0, 8 * M], 90, 11, { a: 0.5 });
  if (st.hero && (st.heroA ?? 1) > 0) {
    const pos = st.hero, a = st.heroA ?? 1, rev = st.heroReveal ?? 1, hh = 1.86 * M;
    R.with(TRS(pos, [deg(-90), 0, 0], 1), () => R.circle(0, 0, 0.55 * M, { fill: '#000', alpha: 0.5 * a, blur: 8 }, 32));
    R.with(TRS(pos, [0, 0, 0], 1), () => {
      if (rev < 1) {
        const y = -hh * 1.1 * rev;
        R.clipRect(-2 * M, y, 4 * M, 2 * M - y);
        charCard(R, 'hero', hh, { alpha: a * 0.9 });
        R.unclip();
        R.band(-0.7 * M, y, 0.7 * M, y, 3, { fill: PAL.cyan, alpha: a, glow: 1.5 });
        for (let i = 0; i < 10; i++) R.band(-0.6 * M, y + i * 7, 0.6 * M, y + i * 7, 1, { fill: PAL.cyan, alpha: a * 0.3 * (1 - i / 10) });
      } else charCard(R, 'hero', hh, { alpha: a });
    });
  }
}

// ---------------------------------------------------------------- atto: dal level up al mondo, poi C1-C2
export function mondo(S, TL) {
  const b = S.b, c = S.c;
  const t0 = b.t0 + 1.05, t1 = c.t1;
  const rev0 = t0 + 0.08, rev1 = t0 + 0.7;
  const c2 = c.t0 + 1.75;          // la camera va al tabellone
  const fill0 = c2 - 0.1, fill1 = c.t1 - 0.45;

  const camKeys = [
    { t: t0, eye: P(-4.3, -4.4, 1.2), tgt: P(-3.6, 3, 2.3), f: 1350, roll: deg(-2) },
    { t: rev1 + 0.2, eye: P(-4.1, -5.0, 1.3), tgt: P(-3.2, 3, 2.5), f: 1350, roll: deg(0.5) },
    { t: c.t0 + 0.2, eye: P(0.2, -9.6, 2.4), tgt: P(0, 3, 3.6), f: 1350, ease: 'inOutCubic' },
    { t: c2, eye: P(0.3, -10.2, 2.6), tgt: P(0.1, 3, 3.6), f: 1350 },
    { t: c2 + 0.7, eye: P(0.2, -3.6, 3.2), tgt: P(0.1, 6.8, 3.4), f: 1350, ease: 'inOutCubic' },
    { t: t1, eye: P(0.6, -3.2, 3.3), tgt: P(0.8, 6.8, 3.4), f: 1350 },
  ];
  const camAt = (t) => camTrack(camKeys, t, shake(t, [[rev1, 10, 0.4]]));

  function supers(R, t) {
    R.hud(() => {
      const a1 = seg(t, c.t0, c.t0 + 0.25) * (1 - seg(t, c2 + 0.1, c2 + 0.35));
      if (a1 > 0) {
        const u = E.outExpo(seg(t, c.t0, c.t0 + 0.5));
        R.rect(0, H - 250, W, 250, { fill: { lin: [0, H - 250, 0, H], stops: [[0, 'rgba(5,3,16,0)'], [1, 'rgba(5,3,16,0.9)']] }, alpha: a1 });
        R.text('IL CIRCUITO UFFICIALE', W / 2, H - 150 + (1 - u) * 40, { font: 'unb900', size: 58, align: 'center', v: 'cap', fill: '#ffffff', alpha: a1, tracking: -0.02 });
        R.text('DELLA FEDERAZIONE ITALIANA TENNIS E PADEL', W / 2, H - 80 + (1 - u) * 40, { font: 'unb600', size: 32, align: 'center', v: 'cap', fill: PAL.cyan, alpha: a1 * seg(t, c.t0 + 0.15, c.t0 + 0.4) });
      }
      const a2 = seg(t, c2 + 0.5, c2 + 0.75);
      if (a2 > 0) {
        const u = E.outExpo(seg(t, c2 + 0.5, c2 + 0.95));
        R.rect(0, H - 170, W, 170, { fill: { lin: [0, H - 170, 0, H], stops: [[0, 'rgba(5,3,16,0)'], [1, 'rgba(5,3,16,0.88)']] }, alpha: a2 });
        R.text('TORNEI UFFICIALI · SFIDE IN TUTTA ITALIA', W / 2, H - 70 + (1 - u) * 30, { font: 'unb900', size: 44, align: 'center', v: 'cap', fill: '#ffffff', alpha: a2, tracking: -0.02 });
      }
    });
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    drawWorld(R, t, { hero: HERO0, heroReveal: seg(t, rev0, rev1), board: { fill: seg(t, fill0, fill1), lock: seg(t, fill1 - 0.2, fill1), lockPop: seg(t, fill1 - 0.2, fill1 + 0.1) } });
    const fl = env(t, rev1 - 0.05, rev1, rev1, rev1 + 0.25);
    if (fl > 0) R.hud(() => R.rect(0, 0, W, H, { fill: PAL.cyan, alpha: fl * 0.25 }));
    supers(R, t);
    const wh = 1 - E.outCubic(seg(t, t0, t0 + 0.3));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: '#ffffff', alpha: wh }));
  }

  function fx(t) {
    const f = {};
    if (t < t0 + 0.3) f.mb = 5;
    if (t >= c2 && t < c2 + 0.7) f.mb = 7;
    return f;
  }

  return { t0, t1, draw, fx };
}
