// D · «Per entrare in gara ti serve la tessera eSports FITP.»
// La camera entra nel posto libero del tabellone, chiuso dal lucchetto: «Serve la tessera eSports FITP».
// La tessera si rivela come oggetto raro, vola nel lucchetto, il lucchetto si apre e il posto diventa
// «ISCRIZIONI APERTE», di fronte a LUNA.SPIN. Poi un lampo porta alla scena E (tessera attiva → myFITP, in app.js).
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T } from '../engine/math.js';
import { PAL } from '../engine/kit.js';
import { camTrack, shake } from './common.js';
import { M, P } from './arena.js';
import { drawWorld, HERO0, SLOT, SLOT_PAIR, BD } from './mondo.js';
import { card } from './card.js';

export function tessera(S, TL) {
  const d = S.d, t0 = d.t0, t1 = d.t1;
  const tMsg = t0 + 0.4;
  const tCard = t0 + 1.0;                    // la tessera si rivela
  const fly0 = t0 + 1.95, fly1 = t0 + 2.35;  // vola nel lucchetto
  const tUn = fly1, tOpen = t0 + 2.5;        // si apre: iscrizioni aperte
  const LOOT = [SLOT_PAIR[0] - 0.2 * M, SLOT_PAIR[1] + 0.1 * M, BD.z * M - 3.6 * M];

  const camKeys = [
    { t: t0, eye: P(0.6, -3.2, 3.3), tgt: P(0.8, 6.8, 3.4), f: 1350 },
    { t: t0 + 0.5, eye: [SLOT_PAIR[0], SLOT_PAIR[1] - 0.15 * M, BD.z * M - 6.6 * M], tgt: SLOT_PAIR, f: 1350, ease: 'inOutCubic' },
    { t: fly0, eye: [SLOT_PAIR[0] + 0.2 * M, SLOT_PAIR[1] - 0.15 * M, BD.z * M - 6.9 * M], tgt: SLOT_PAIR, f: 1350 },
    { t: tOpen + 0.2, eye: [SLOT_PAIR[0] - 0.4 * M, SLOT_PAIR[1] - 0.1 * M, BD.z * M - 5.4 * M], tgt: [SLOT_PAIR[0] - 0.5 * M, SLOT_PAIR[1], SLOT_PAIR[2]], f: 1350, ease: 'inOutCubic' },
    { t: t1, eye: [SLOT_PAIR[0] - 0.5 * M, SLOT_PAIR[1] - 0.1 * M, BD.z * M - 4.8 * M], tgt: [SLOT_PAIR[0] - 0.6 * M, SLOT_PAIR[1], SLOT_PAIR[2]], f: 1350 },
  ];
  const camAt = (t) => camTrack(camKeys, t, shake(t, [[tMsg, 6, 0.3], [tUn, 14, 0.45]]));

  function cardPose(t) {
    const a = E.outExpo(seg(t, tCard, tCard + 0.45));
    const f = E.inOutCubic(seg(t, fly0, fly1));
    const idle = seg(t, tCard + 0.3, tCard + 0.8);
    const pos = LOOT.map((v, i) => lerp(v, SLOT[i], f));
    pos[1] -= Math.sin(f * Math.PI) * 0.5 * M;
    const sc = lerp(0.02, 0.2, a) * lerp(1, 0.05, E.inCubic(f));
    const rot = [deg(5 * Math.sin(t * 1.3)) * idle, deg(-10 + 8 * Math.sin(t * 0.9)) * idle * (1 - f) + (1 - a) * Math.PI * 2, 0];
    return TRS(pos, rot, sc);
  }

  function lootRays(R, t) {
    const a = seg(t, tCard + 0.05, tCard + 0.35) * (1 - seg(t, fly0 - 0.1, fly0 + 0.15));
    if (a <= 0) return;
    const pc = R.camW(LOOT);
    if (pc[2] < 1) return;
    const [cx, cy] = R.projC(pc);
    R.hud(() => {
      R.rect(0, 0, W, H, { fill: 'rgba(5,3,16,0.55)', alpha: a });
      for (let i = 0; i < 18; i++) {
        const a0 = (i / 18) * Math.PI * 2 + t * 0.35, a1 = a0 + 0.07;
        R.poly([cx, cy, cx + Math.cos(a0) * 1500, cy + Math.sin(a0) * 1500, cx + Math.cos(a1) * 1500, cy + Math.sin(a1) * 1500],
          { fill: { screenLin: [cx, cy, cx + Math.cos(a0) * 900, cy + Math.sin(a0) * 900], stops: [[0, rgba(i % 2 ? PAL.magenta : '#ffffff', 0.24 * a)], [1, 'rgba(0,0,0,0)']] }, blend: 'lighter' });
      }
    });
  }

  function texts(R, t) {
    R.hud(() => {
      const box = (txt, col, a0, a1, sub) => {
        const a = seg(t, a0, a0 + 0.15) * (1 - seg(t, a1, a1 + 0.15));
        if (a <= 0) return;
        const u = E.outExpo(seg(t, a0, a0 + 0.35));
        const w = R.measure(txt, 'unb900', 40, -0.01) + 120;
        R.rrect(W / 2 - w / 2, H - 200 + (1 - u) * 30, w, 100, 50, { fill: 'rgba(8,5,26,0.88)', alpha: a });
        R.rrect(W / 2 - w / 2, H - 200 + (1 - u) * 30, w, 100, 50, { stroke: col, lw: 3, alpha: a, glow: 0.7 });
        R.text(txt, W / 2, H - 150 + (1 - u) * 30, { font: 'unb900', size: 40, align: 'center', v: 'cap', fill: '#ffffff', alpha: a, tracking: -0.01 });
        if (sub) R.text(sub, W / 2, H - 70, { font: 'mono800', size: 22, align: 'center', v: 'cap', fill: col, alpha: a, tracking: 0.2 });
      };
      box('SERVE LA TESSERA eSPORTS FITP', '#ff4f8b', tMsg, tCard - 0.05);
      box('TESSERA eSPORTS FITP 2027', PAL.cyan, tCard + 0.35, fly0 - 0.05, null);
      box('IL TUO POSTO È SBLOCCATO', PAL.ball, tOpen + 0.1, t1 + 1);
    });
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    drawWorld(R, t, { hero: HERO0, board: { fill: 1, lock: 1, lockPop: 1, unlock: E.outBack(seg(t, tUn, tUn + 0.2), 2), open: E.outCubic(seg(t, tOpen, tOpen + 0.25)) } });
    lootRays(R, t);
    if (t >= tCard && t < fly1 + 0.02) {
      R.push(cardPose(t));
      card(R, t, { flash: 1 - seg(t, tCard, tCard + 0.3) });
      R.pop();
    }
    const lf = env(t, fly1 - 0.02, fly1, fly1, fly1 + 0.35);
    if (lf > 0) {
      const pc = R.camW(SLOT);
      if (pc[2] > 1) { const [x, y] = R.projC(pc); R.hud(() => R.circle(x, y, lerp(30, 480, 1 - lf), { stroke: PAL.ball, lw: 10 * lf, alpha: lf, glow: 1.2 }, 48)); }
    }
    texts(R, t);
    const wh = E.inCubic(seg(t, t1 - 0.25, t1));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: '#ffffff', alpha: wh }));
  }

  function fx(t) {
    const f = {};
    if (t < t0 + 0.5) f.mb = 8;
    if (t >= tCard && t < tCard + 0.45) f.mb = 6;
    if (t >= fly0 && t < fly1) f.mb = 7;
    if (t >= tUn && t < tUn + 0.3) { const u = (t - tUn) / 0.3; f.flash = [PAL.ball, 0.3 * (1 - u)]; f.ca = 0.01 * (1 - u); }
    return f;
  }

  return { t0, t1, draw, fx };
}
