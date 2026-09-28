// D · «Per entrare in gara ti serve la tessera eSports FITP.»
// In fondo all'arena c'è il portale del TORNEO UFFICIALE, chiuso da un lucchetto: «Serve la Tessera eSports FITP».
// MARCO lo guarda; la tessera si rivela come oggetto raro, vola nel lucchetto, il lucchetto si apre e il portale
// si spalanca in una luce bianca che porta alla scena E (tessera attiva → myFITP, in app.js).
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T, apply } from '../engine/math.js';
import { PAL } from '../engine/kit.js';
import { camTrack, shake } from './common.js';
import { M, P } from './arena.js';
import { drawWorld, PORTAL, HERO0, OPP0 } from './mondo.js';
import { card } from './card.js';

export function tessera(S, TL) {
  const d = S.d, t0 = d.t0, t1 = d.t1;
  const tLock = t0 + 0.42, tMsg = t0 + 0.6;
  const tCard = t0 + 1.05;                   // la tessera si rivela
  const fly0 = t0 + 2.0, fly1 = t0 + 2.42;   // vola nel lucchetto
  const tUn = fly1, tOpen = t0 + 2.68;       // si apre
  const HERO = P(18.7, 1.4, 0);
  // centro del lucchetto nel mondo (stessa trasformazione del portale)
  const LOCK = apply(TRS(PORTAL, [0, deg(-10), 0], M), 0, -2.3, -0.05);
  const LOOT = P(19.5, -2.0, 2.05);

  const camKeys = [
    { t: t0, eye: P(8.6, -4.8, 2.5), tgt: P(10.7, 4.2, 2.8), f: 1350 },
    { t: t0 + 0.55, eye: P(18.2, -6.0, 2.1), tgt: P(20.2, 3, 2.7), f: 1350, ease: 'inOutCubic' },
    { t: fly0, eye: P(18.4, -6.3, 2.1), tgt: P(20.2, 3, 2.65), f: 1350 },
    { t: tOpen, eye: P(19.4, -3.2, 2.2), tgt: P(20.9, 3, 2.3), f: 1350, ease: 'inOutCubic' },
    { t: t1, eye: P(20.8, 1.4, 2.3), tgt: P(21, 3, 2.3), f: 1350, ease: 'inExpo' },
  ];
  const camAt = (t) => camTrack(camKeys, t, shake(t, [[tLock, 8, 0.35], [tUn, 14, 0.45]]));

  function cardPose(t) {
    const a = E.outExpo(seg(t, tCard, tCard + 0.45));
    const f = E.inOutCubic(seg(t, fly0, fly1));
    const idle = seg(t, tCard + 0.3, tCard + 0.8);
    const pos = LOOT.map((v, i) => lerp(v, LOCK[i], f));
    pos[1] -= Math.sin(f * Math.PI) * 0.6 * M;
    const sc = lerp(0.02, 0.2, a) * lerp(1, 0.28, f);
    const rot = [deg(5 * Math.sin(t * 1.3)) * idle, deg(-12 + 10 * Math.sin(t * 0.9)) * idle * (1 - f) + (1 - a) * Math.PI * 2, 0];
    return TRS(pos, rot, sc);
  }

  function lootRays(R, t) {
    const a = seg(t, tCard + 0.05, tCard + 0.35) * (1 - seg(t, fly0 - 0.1, fly0 + 0.15));
    if (a <= 0) return;
    const pc = R.camW(LOOT);
    if (pc[2] < 1) return;
    const [cx, cy] = R.projC(pc);
    R.hud(() => {
      for (let i = 0; i < 18; i++) {
        const a0 = (i / 18) * Math.PI * 2 + t * 0.35, a1 = a0 + 0.07;
        R.poly([cx, cy, cx + Math.cos(a0) * 1500, cy + Math.sin(a0) * 1500, cx + Math.cos(a1) * 1500, cy + Math.sin(a1) * 1500],
          { fill: { screenLin: [cx, cy, cx + Math.cos(a0) * 900, cy + Math.sin(a0) * 900], stops: [[0, rgba(i % 2 ? PAL.magenta : '#ffffff', 0.24 * a)], [1, 'rgba(0,0,0,0)']] }, blend: 'lighter' });
      }
    });
  }

  function texts(R, t) {
    R.hud(() => {
      // messaggio del lucchetto
      const ma = seg(t, tMsg, tMsg + 0.15) * (1 - seg(t, tCard + 0.1, tCard + 0.3));
      if (ma > 0) {
        const u = E.outExpo(seg(t, tMsg, tMsg + 0.35));
        R.rrect(W / 2 - 430, H - 190 + (1 - u) * 30, 860, 96, 48, { fill: 'rgba(8,5,26,0.85)', alpha: ma });
        R.rrect(W / 2 - 430, H - 190 + (1 - u) * 30, 860, 96, 48, { stroke: '#ff4f8b', lw: 3, alpha: ma, glow: 0.7 });
        R.text('SERVE LA TESSERA eSPORTS FITP', W / 2, H - 142 + (1 - u) * 30, { font: 'unb900', size: 38, align: 'center', v: 'cap', fill: '#ffffff', alpha: ma, tracking: -0.01 });
      }
      // etichetta della tessera
      const la = seg(t, tCard + 0.35, tCard + 0.6) * (1 - seg(t, fly0 - 0.1, fly0 + 0.05));
      if (la > 0) {
        R.text('TESSERA eSPORTS FITP 2027', W / 2, H - 110, { font: 'unb900', size: 44, align: 'center', v: 'cap', fill: '#ffffff', alpha: la, tracking: -0.01,
          per: (i) => ({ a: seg(t, tCard + 0.35 + i * 0.012, tCard + 0.45 + i * 0.012) }), shadow: ['rgba(0,0,0,0.5)', 24, 0, 8] });
        R.text('IL TUO PASS PER I TORNEI UFFICIALI', W / 2, H - 58, { font: 'mono800', size: 22, align: 'center', v: 'cap', fill: PAL.cyan, alpha: la, tracking: 0.2 });
      }
    });
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    drawWorld(R, t, {
      hero: HERO, opp: OPP0, bracketU: 1, lbU: 1,
      portal: { lock: seg(t, tLock, tLock + 0.05), lockPop: seg(t, tLock, tLock + 0.3), unlock: E.outBack(seg(t, tUn, tUn + 0.2), 2), open: E.inCubic(seg(t, tOpen, tOpen + 0.4)) },
    });
    lootRays(R, t);
    if (t >= tCard && t < fly1 + 0.02) {
      R.push(cardPose(t));
      card(R, t, { flash: 1 - seg(t, tCard, tCard + 0.3) });
      R.pop();
    }
    // lampo quando la tessera entra nel lucchetto
    const lf = env(t, fly1 - 0.02, fly1, fly1, fly1 + 0.3);
    if (lf > 0) {
      const pc = R.camW(LOCK);
      if (pc[2] > 1) { const [x, y] = R.projC(pc); R.hud(() => R.circle(x, y, lerp(40, 420, 1 - lf), { stroke: PAL.ball, lw: 10 * lf, alpha: lf, glow: 1.2 }, 48)); }
    }
    texts(R, t);
    const wh = E.inCubic(seg(t, t1 - 0.3, t1));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: '#ffffff', alpha: wh }));
  }

  function fx(t) {
    const f = {};
    if (t < t0 + 0.55) f.mb = 8;
    if (t >= tCard && t < tCard + 0.45) f.mb = 6;
    if (t >= fly0 && t < fly1) f.mb = 7;
    if (t >= tUn && t < tUn + 0.3) { const u = (t - tUn) / 0.3; f.flash = [PAL.ball, 0.3 * (1 - u)]; f.ca = 0.01 * (1 - u); }
    if (t >= tOpen) { f.mb = 9; f.ca = 0.012 * seg(t, tOpen, t1); }
    return f;
  }

  return { t0, t1, draw, fx };
}
