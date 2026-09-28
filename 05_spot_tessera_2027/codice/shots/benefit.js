// H · «In più, approfitta degli sconti sui grandi eventi FITP, del loyalty program, dei vantaggi dei partner
// e di SuperTennis+ gratis.»
// In myFITP si sblocca «Benefit Tesserati» dopo il primo torneo. Tocco: esce il pass GRANDI EVENTI (il vantaggio
// principale, con sconti ed eventi). Poi il pass si sposta e attorno compaiono gli altri vantaggi della tessera:
// gerarchia visiva, il pass resta grande il doppio dei riquadri.
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T, apply } from '../engine/math.js';
import { PAL } from '../engine/kit.js';
import { camTrack, shake, bgNight, dust, bokeh } from './common.js';
import { HX, HY, MF, phone, scrMenu, MENU_ICON, fingerTrack, icon } from './mfui.js';

export const TW = 760, TH = 300, CUT = 250;
// posizioni (coordinate mondo con camera [0,-20,-1600], f 1600: 1 unità ≈ 1 px sul piano z = 0)
export const PASS_HERO = { pos: [-400, -30, 0], sc: 0.98 };
export const PASS_GRID = { pos: [-540, -10, 0], sc: 0.8 };
export const TILES = [
  { ic: 'trophy', t1: 'COMPETIZIONI', t2: 'ufficiali eSports FITP', col: PAL.cyan, pos: [170, -170] },
  { ic: 'star', t1: 'LOYALTY PROGRAM', t2: 'FITP', col: PAL.magenta, pos: [610, -170] },
  { ic: 'tag', t1: 'SCONTI PARTNER', t2: 'dalla rete dei partner FITP', col: PAL.magenta, pos: [170, 90] },
  { ic: 'play', t1: 'SUPERTENNIS+', t2: 'accesso gratuito all\'app', col: PAL.cyan, pos: [610, 90] },
];
export const TILE_W = 410, TILE_H = 200;
export const EVENTS = ['Internazionali BNL d\'Italia', 'BNL Italy Major Premier Padel', 'Davis Cup Final 8', 'Nitto ATP Finals'];
export const LEGAL = '*Fino al 10% sui biglietti e fino al 5% sugli abbonamenti. Valido per chi ha partecipato ad almeno un torneo eSports FITP.';

function ticketShape(x0, x1, notchL, notchR) {
  const pts = [], r = 26, h = TH / 2, q = 22, n = 8;
  const arc = (cx, cy, rad, a0, a1) => { for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; pts.push(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); } };
  if (notchL) arc(x0, -h, q, Math.PI / 2, 0); else arc(x0 + r, -h + r, r, Math.PI, Math.PI * 1.5);
  if (notchR) arc(x1, -h, q, Math.PI, Math.PI / 2); else arc(x1 - r, -h + r, r, -Math.PI / 2, 0);
  if (notchR) arc(x1, h, q, -Math.PI / 2, -Math.PI); else arc(x1 - r, h - r, r, 0, Math.PI / 2);
  if (notchL) arc(x0, h, q, 0, -Math.PI / 2); else arc(x0 + r, h - r, r, Math.PI / 2, Math.PI);
  return pts;
}

// pass GRANDI EVENTI nel piano corrente (centro 0,0). o: { reveal 0..1 per le scritte, alpha }
export function pass(R, t, o = {}) {
  const a = o.alpha ?? 1, rv = o.reveal ?? 1;
  R.with(T(0, 0, 30), () => R.rrect(-TW / 2, -TH / 2, TW, TH, 26, { fill: '#000', alpha: 0.35 * a, blur: 30 }));
  const x0 = -TW / 2, x1 = CUT;
  R.poly(ticketShape(x0, x1, false, true), { fill: { lin: [x0, -TH / 2, x1, TH / 2], stops: [[0, '#2456e8'], [0.55, '#6a2cff'], [1, '#c01aa8']] }, alpha: a });
  R.text('eSPORTS FITP · PASS TESSERATI', x0 + 44, -TH / 2 + 50, { font: 'mono800', size: 16, v: 'cap', fill: '#ffffff', alpha: a * 0.8, tracking: 0.2 });
  const k = (i) => E.outExpo(seg(rv, i * 0.2, 0.6 + i * 0.2));
  R.clipRect(x0, -TH / 2, x1 - x0, TH);
  R.text('GRANDI', x0 + 44, -18 + (1 - k(0)) * 90, { font: 'unb900', size: 78, v: 'cap', fill: '#ffffff', tracking: -0.03, alpha: a });
  R.text('EVENTI FITP', x0 + 44, 74 + (1 - k(1)) * 90, { font: 'unb900', size: 62, v: 'cap', fill: '#ffffff', tracking: -0.03, alpha: a });
  R.unclip();
  const sw = ((t * 0.7) % 1.4) - 0.2, sx = x0 + sw * (x1 - x0) * 1.5;
  R.clipPoly(ticketShape(x0, x1, false, true));
  R.poly([sx - 90, -TH / 2, sx - 30, -TH / 2, sx - 140, TH / 2, sx - 200, TH / 2], { fill: '#ffffff', alpha: 0.3 * a, blend: 'screen' });
  R.unclip();
  R.poly(ticketShape(x0, x1, false, true), { stroke: '#ffffff', lw: 2.5, alpha: 0.85 * a, glow: 0.8, glowColor: PAL.cyan });
  // tagliando
  const s0 = CUT, s1 = TW / 2;
  R.poly(ticketShape(s0, s1, true, false), { fill: { lin: [s0, -TH / 2, s1, TH / 2], stops: [[0, '#f408bc'], [1, '#ff5ad8']] }, alpha: a });
  for (let i = 0; i < 14; i++) R.band(s0 + 30 + i * 6.5 + (i % 3), TH / 2 - 90, s0 + 30 + i * 6.5 + (i % 3), TH / 2 - 40, 1.5 + (i % 3), { fill: '#1b0f45', alpha: 0.8 * a });
  R.text('SCONTI', (s0 + s1) / 2, -TH / 2 + 70, { font: 'unb900', size: 22, align: 'center', v: 'cap', fill: '#ffffff', alpha: a });
  R.text('TESSERATI', (s0 + s1) / 2, -TH / 2 + 104, { font: 'mono800', size: 14, align: 'center', v: 'cap', fill: '#1b0f45', tracking: 0.14, alpha: a });
  R.poly(ticketShape(s0, s1, true, false), { stroke: '#ffffff', lw: 2.5, alpha: 0.85 * a, glow: 0.8, glowColor: PAL.magenta });
  for (let y = -TH / 2 + 30; y < TH / 2 - 26; y += 16) R.circle(s0, y, 3, { fill: '#ffffff', alpha: 0.8 * a }, 10);
}

// icone aggiuntive dei riquadri
function tileIcon(R, kind, x, y, s, c, a) {
  if (kind === 'tag') {
    R.poly([x - s * 0.45, y - s * 0.1, x - s * 0.1, y - s * 0.45, x + s * 0.45, y - s * 0.45, x + s * 0.45, y + s * 0.1, x + s * 0.1, y + s * 0.45], { fill: c, alpha: a });
    R.text('%', x + s * 0.12, y - s * 0.02, { font: 'rob900', size: s * 0.5, align: 'center', v: 'cap', fill: '#0b0624', alpha: a });
  } else if (kind === 'play') {
    R.rrect(x - s * 0.48, y - s * 0.34, s * 0.96, s * 0.68, s * 0.12, { stroke: c, lw: s * 0.09, alpha: a });
    R.poly([x - s * 0.12, y - s * 0.18, x + s * 0.2, y, x - s * 0.12, y + s * 0.18], { fill: c, alpha: a });
  } else icon(R, kind, x, y, s, c, a);
}

// riquadro di un vantaggio, centrato in (0,0)
export function tile(R, i, a = 1) {
  const Tt = TILES[i];
  R.rrect(-TILE_W / 2, -TILE_H / 2, TILE_W, TILE_H, 26, { fill: 'rgba(14,8,48,0.9)', alpha: a, shadow: ['rgba(0,0,0,0.4)', 30, 0, 12] });
  R.rrect(-TILE_W / 2, -TILE_H / 2, TILE_W, TILE_H, 26, { stroke: Tt.col, lw: 2.5, alpha: a, glow: 0.7 });
  R.circle(-TILE_W / 2 + 70, 0, 42, { fill: rgba(Tt.col, 0.18), alpha: a }, 40);
  tileIcon(R, Tt.ic, -TILE_W / 2 + 70, 0, 44, Tt.col, a);
  R.text(Tt.t1, -TILE_W / 2 + 132, -18, { font: 'unb900', size: 26, v: 'cap', fill: '#ffffff', alpha: a, tracking: -0.01 });
  R.text(Tt.t2, -TILE_W / 2 + 132, 24, { font: 'rob500', size: 20, v: 'cap', fill: '#c9c3ff', alpha: a });
}

export function legal(R, a) {
  if (a <= 0) return;
  R.hud(() => R.text(LEGAL, W / 2, H - 46, { font: 'mono500', size: 17, align: 'center', v: 'cap', fill: '#ffffff', alpha: a * 0.72, tracking: 0.01 }));
}

export function benefit(S, TL) {
  const h = S.h, t0 = h.t0, t1 = h.t1;
  const tUnlock = t0 + 0.35, tTap = t0 + 1.0;
  const out0 = tTap + 0.08, out1 = tTap + 0.75;      // il pass esce dal telefono
  const grid0 = t0 + 4.75, grid1 = t0 + 5.35;         // il pass si sposta, arrivano i riquadri

  const camKeys = [
    { t: t0, eye: [120, -10, -1500], tgt: [150, -10, 0], f: 1600 },
    { t: tTap, eye: [110, -20, -1440], tgt: [150, -20, 0], f: 1600 },
    { t: out1 + 0.3, eye: [0, -20, -1600], tgt: [0, -20, 0], f: 1600, ease: 'inOutCubic' },
    { t: t1, eye: [0, -20, -1600], tgt: [0, -20, 0], f: 1600 },
  ];
  const camAt = (t) => camTrack(camKeys, t, shake(t, [[out0 + 0.3, 8, 0.4]]));

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
    const g = E.inOutCubic(seg(t, grid0, grid1));
    const end = PASS_HERO.pos.map((v, i) => lerp(v, PASS_GRID.pos[i], g));
    const pos = [lerp(st[0], end[0], u), lerp(st[1], end[1], u) - Math.sin(u * Math.PI) * 120, lerp(st[2], end[2], u)];
    const rot = [deg(lerp(3, 4 * Math.sin(t * 1.1) * idle, u)), deg(-15) * (1 - u) + (1 - u) * Math.PI * 2 + deg(-8 + 5 * Math.sin(t * 0.8)) * idle * (1 - g * 0.6), deg(-3 + 1.5 * Math.sin(t)) * idle];
    return TRS(pos, rot, lerp(0.1, lerp(PASS_HERO.sc, PASS_GRID.sc, g), u));
  }

  function screen(R, t) {
    const unlock = E.outBack(seg(t, tUnlock, tUnlock + 0.25), 1.6);
    scrMenu(R, t, { hot: 2, hotA: env(t, tUnlock + 0.1, tUnlock + 0.2, tTap + 0.1, tTap + 0.3), lock: 1 - seg(t, tTap + 0.1, tTap + 0.3), unlock });
    const na = env(t, tUnlock - 0.15, tUnlock, out1, out1 + 0.2);
    if (na > 0) {
      const y = -HY + 40 + (1 - E.outBack(seg(t, tUnlock - 0.15, tUnlock + 0.1), 1.6)) * -70;
      R.rrect(-186, y - 22, 372, 44, 22, { fill: '#3f3c44', alpha: na * 0.97, shadow: ['rgba(0,0,0,0.35)', 18, 0, 6] });
      R.circle(-162, y, 14, { fill: MF.mag, alpha: na }, 24);
      R.text('✓', -162, y, { font: 'rob700', size: 14, align: 'center', v: 'cap', fill: '#fff', alpha: na });
      R.text('Benefit Tesserati sbloccati', -140, y, { font: 'rob700', size: 13, v: 'cap', fill: '#fff', alpha: na });
      R.text('dopo il tuo primo torneo', 42, y, { font: 'rob400', size: 12, v: 'cap', fill: '#fff', alpha: na * 0.85 });
    }
  }

  // colonna destra: sconti ed eventi (fase del pass protagonista)
  function discounts(R, t) {
    const a = seg(t, out1 + 0.3, out1 + 0.5) * (1 - seg(t, grid0 - 0.2, grid0 + 0.1));
    if (a <= 0) return;
    R.hud(() => {
      const x = 1040;
      const k = (d) => E.outExpo(seg(t, out1 + 0.35 + d, out1 + 0.75 + d));
      R.text('FINO AL', x, 205, { font: 'mono800', size: 26, v: 'cap', fill: PAL.cyan, alpha: a * k(0), tracking: 0.2 });
      R.text('-10%', x - 6, 300 + (1 - k(0.05)) * 40, { font: 'unb900', size: 124, v: 'cap', fill: PAL.ball, alpha: a * k(0.05), glow: 0.35, tracking: -0.03 });
      R.text('sui biglietti*', x + 390, 300, { font: 'unb600', size: 34, v: 'cap', fill: '#ffffff', alpha: a * k(0.15) });
      R.text('-5%', x - 6, 432 + (1 - k(0.25)) * 40, { font: 'unb900', size: 96, v: 'cap', fill: PAL.magenta, alpha: a * k(0.25), glow: 0.35, tracking: -0.03 });
      R.text('sugli abbonamenti*', x + 290, 432, { font: 'unb600', size: 34, v: 'cap', fill: '#ffffff', alpha: a * k(0.35) });
      R.band(x, 520, x + 760, 520, 2, { fill: 'rgba(255,255,255,0.25)', alpha: a * k(0.4) });
      EVENTS.forEach((ev, i) => {
        const u = k(0.5 + i * 0.2);
        R.circle(x + 14, 580 + i * 62, 9, { fill: PAL.ball, alpha: a * u, glow: 0.6 }, 16);
        R.text(ev, x + 42 - (1 - u) * 30, 580 + i * 62, { font: 'unb700', size: 34, v: 'cap', fill: '#ffffff', alpha: a * u });
      });
    });
  }

  function heading(R, t) {
    const a = seg(t, grid0 + 0.2, grid0 + 0.5);
    if (a <= 0) return;
    R.hud(() => R.text('E CON LA TESSERA ANCHE…', W / 2 + 390, 170, { font: 'mono800', size: 26, align: 'center', v: 'cap', fill: PAL.cyan, alpha: a, tracking: 0.2 }));
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    bgNight(R, t, { c1: '#3b1f7a', c2: PAL.magenta, c3: '#1b2cff' });
    bokeh(R, t, 0.8, (t - t0) * 30, 3);
    dust(R, t, [-1400, -900, -600, 1400, 900, 1400], 70, 9, { a: 0.45 });
    if (t < out1 + 0.6) {
      R.push(phonePose(t));
      R.with(T(30, 40, 60), () => R.rrect(-230, -460, 460, 920, 60, { fill: '#000', alpha: 0.45, blur: 40 }));
      phone(R, t, () => screen(R, t));
      const [ix, iy] = MENU_ICON(2);
      fingerTrack(R, t, [{ t: tTap, x: ix, y: iy + 4 }]);
      R.pop();
    }
    // riquadri degli altri vantaggi
    TILES.forEach((Tt, i) => {
      const u = E.outBack(seg(t, grid0 + 0.3 + i * 0.14, grid0 + 0.65 + i * 0.14), 1.5);
      if (seg(t, grid0 + 0.3 + i * 0.14, grid0 + 0.65 + i * 0.14) <= 0) return;
      R.with(TRS([Tt.pos[0], Tt.pos[1] + (1 - u) * 60, (1 - u) * -200], [deg(3 * Math.sin(t + i)), deg(-6 + 3 * Math.sin(t * 0.8 + i)), 0], lerp(0.6, 1, u)), () => tile(R, i, clamp(u)));
    });
    if (t >= out0) { R.push(passPose(t)); pass(R, t, { reveal: seg(t, out0 + 0.3, out0 + 1.0) }); R.pop(); }
    discounts(R, t);
    heading(R, t);
    legal(R, seg(t, out1, out1 + 0.3));
    const wh = 1 - E.outCubic(seg(t, t0, t0 + 0.35));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: '#ffffff', alpha: wh }));
  }

  function fx(t) {
    const f = {};
    if (t < t0 + 0.4) f.mb = 5;
    if (t >= out0 && t < out1) f.mb = 7;
    if (t >= grid0 && t < grid1) f.mb = 6;
    return f;
  }

  return { t0, t1, draw, fx };
}
