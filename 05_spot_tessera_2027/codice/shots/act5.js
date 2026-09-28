// SCENA 10 · «Scendi in campo da atleta federale.»
// Usciamo dal tunnel nella luce dei fari: il protagonista, di spalle con il logo eSports sulla maglia,
// avanza verso gli avversari schierati; sopra lo stadio brilla FITP. In chiusura la camera entra nel logo.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T } from '../engine/math.js';
import { PAL } from '../engine/kit.js';
import { shake } from './common.js';
import { figure, POSE, mixPose } from './figure.js';
import { M, P, court, towers, sky } from './arena.js';

const SC = (1.86 * M) / 180;

export function act5(S, TL) {
  const s10 = S.s10, t0 = s10.t0, t1 = s10.t1;
  const push0 = t1 - 0.45; // la camera entra nel logo sulla schiena

  const OPP = [
    { z: -3.3, pose: 'standR', o: { racket: 'A', kind: 'padel' }, rimA: PAL.magenta, rimB: '#8a6bff' },
    { z: -1.3, pose: 'stand', o: { racket: 'A', skirt: true, pony: true, cap: true }, rimA: PAL.cyan, rimB: PAL.magenta },
    { z: 1.5, pose: 'standR', o: { racket: 'A', cap: true }, rimA: PAL.magenta, rimB: PAL.cyan },
    { z: 3.4, pose: 'stand', o: { racket: 'A', band: PAL.cyan }, rimA: PAL.cyan, rimB: '#8a6bff' },
  ];
  const heroX = (t) => lerp(-15.2, -13.8, seg(t, t0, t1)); // il protagonista avanza

  function camAt(t) {
    const u = seg(t, t0, t1);
    const hx = heroX(t);
    const cam = new Cam();
    const sh = shake(t, [[t0, 14, 0.5]]);
    // dietro la spalla del protagonista, poi dentro il logo sulla schiena
    const pz = E.inExpo(seg(t, push0, t1));
    const back = P(hx - lerp(4.4, 3.6, u), 0.9, lerp(1.35, 1.5, u));
    const logo = P(hx - 0.35, 0.02, 1.33);
    const eye = [lerp(back[0], logo[0], pz), lerp(back[1], logo[1], pz), lerp(back[2], logo[2], pz)];
    const tgt0 = P(hx + 8, 0.2, 2.0), tgt1 = P(hx + 2, 0.02, 1.33);
    cam.look(eye, [lerp(tgt0[0], tgt1[0], pz), lerp(tgt0[1], tgt1[1], pz), lerp(tgt0[2], tgt1[2], pz)], deg(lerp(-2, 1, u)) * (1 - pz), 1250);
    cam.cx += sh[0]; cam.cy += sh[1];
    return cam;
  }

  function stands(R, t) {
    // gradinate con le luci del pubblico su tre lati
    for (const side of [-1, 1]) for (let r = 0; r < 7; r++) for (let k = 0; k < 44; k++) {
      const i = k * 17 + r * 131 + (side > 0 ? 7 : 3);
      const x = -18 + k * 1.1, z = side * (12 + r * 1.4);
      const blink = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * (2 + hash(i) * 6) + i));
      R.dot(P(x, z, 1.2 + r * 1.1), 0.08 * M, { fill: hash(i * 5) > 0.86 ? PAL.magenta : hash(i * 7) > 0.82 ? PAL.cyan : '#fff1d0', alpha: blink * 0.9, glow: 0.8, maxR: 5 });
    }
    for (let r = 0; r < 8; r++) for (let k = 0; k < 40; k++) {
      const i = k * 13 + r * 97;
      R.dot(P(22 + r * 1.3, -20 + k * 1.0, 1.4 + r * 1.2), 0.09 * M, { fill: hash(i * 5) > 0.86 ? PAL.magenta : '#fff1d0', alpha: (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 3 + i))) * 0.9, glow: 0.8, maxR: 5 });
    }
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    sky(R, 0.8);
    stands(R, t);
    towers(R, 0, 1);
    court(R, 0, 0, 1);
    // FITP gigante sopra lo stadio, che si accende
    const on = seg(t, t0 + 0.25, t0 + 0.5);
    R.with(TRS(P(28, 0, 9.5), [0, deg(90), 0], M), () => {
      R.text('FITP', 0, 0, { font: 'unb900', size: 7.5, align: 'center', v: 'cap', skew: 0.2, fill: '#ffffff', stroke: PAL.cyan, lw: 0.08, alpha: on * (0.85 + 0.15 * Math.sin(t * 40) ** 2), glow: 0.9, glowColor: '#9fd4ff', tracking: -0.02 });
    });
    // fasci dei fari che si incrociano
    R.hud(() => {
      for (let i = 0; i < 6; i++) {
        const x = W * (0.1 + i * 0.16) + Math.sin(t * 0.7 + i) * 60;
        R.poly([x - 8, 0, x + 8, 0, x + 260 * (i % 2 ? 1 : -1) + 120, H * 0.8, x + 260 * (i % 2 ? 1 : -1) - 120, H * 0.8], { fill: { screenLin: [0, 0, 0, H * 0.8], stops: [[0, 'rgba(200,230,255,0.16)'], [1, 'rgba(200,230,255,0)']] }, blend: 'lighter' });
      }
    });
    // avversari schierati, rivolti verso di noi
    for (const O of OPP) R.with(TRS(P(-7.2, O.z, 0), [0, deg(90), 0], SC), () => {
      R.with(TRS([0, 0, 0], [deg(-90), 0, 0], 1), () => R.circle(0, 0, 38, { fill: '#000', alpha: 0.35 }, 24));
      figure(R, POSE[O.pose], O.o, { rimA: O.rimA, rimB: O.rimB, rim: 2.0, glow: 0.6 });
    });
    // protagonista di spalle che cammina, logo eSports sulla maglia
    const hx = heroX(t);
    const step = Math.sin((t - t0) * 7.2);
    const pose = { ...POSE.back, hA: 6 + step * 10, kA: -Math.max(0, step) * 12, hB: 6 - step * 10, kB: -Math.max(0, -step) * 12, sA: 9 - step * 8, sB: 9 + step * 8 };
    R.with(TRS(P(hx, 0.02, 0), [0, deg(90), 0], SC), () => {
      figure(R, pose, { racket: 'A', band: PAL.ball }, { rimA: PAL.ball, rimB: PAL.magenta, rim: 2.2, glow: 0.8 });
      const lw = 44, lh = lw * (717 / 1278);
      R.image(R.img.logo, -lw / 2, -128 - lh / 2, lw, lh, { sub: 2 });
    });
    // uscita dal tunnel: bianco dei fari che si apre
    const wh = 1 - E.outCubic(seg(t, t0, t0 + 0.4));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: '#ffffff', alpha: wh }));
  }

  function fx(t) {
    const f = {};
    if (t < t0 + 0.4) f.mb = 5;
    if (t >= push0) { f.mb = 10; f.ca = 0.012 * seg(t, push0, t1); }
    return f;
  }

  return { t0, t1, draw, fx };
}
