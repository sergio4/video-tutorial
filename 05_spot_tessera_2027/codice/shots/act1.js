// SCENE 1-2 · «Tutti i giocatori puntano alla vittoria, ma solo i migliori passano al livello successivo.»
// Carrellata laterale veloce su una fila di campi: ogni giocatore si prepara al servizio.
// Sull'ultimo, il protagonista, il tempo si ferma al lancio (bullet-time): LEVEL UP e la barra che si riempie.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T, apply } from '../engine/math.js';
import { PAL, ballScreen } from '../engine/kit.js';
import { track, camTrack, shake } from './common.js';
import { figure, POSE, mixPose } from './figure.js';
import { M, P, court, crowd, boards, towers, sky } from './arena.js';

const DX = 27; // metri tra un campo e l'altro
const SC = (1.86 * M) / 180; // scala della sagoma

export function act1(S, TL) {
  const s1 = S.s1, s2 = S.s2;
  const d = s1.dur / 4; // un giocatore ogni quarto di scena (2 beat a 128 BPM)
  const px = (k) => k * DX - 12.4; // posizione del giocatore k (metri)
  const PLAYERS = [
    { o: { racket: 'B', band: PAL.cyan }, rimA: PAL.cyan, rimB: PAL.magenta, off: 0.05 },
    { o: { racket: 'B', skirt: true, pony: true, cap: true }, rimA: '#ff5ad8', rimB: PAL.cyan, off: 0.25 },
    { o: { racket: 'B', cap: true }, rimA: PAL.cyan, rimB: '#8a6bff', off: 0.4 },
    { o: { racket: 'B', band: PAL.ball, wrist: PAL.ball }, rimA: PAL.ball, rimB: PAL.magenta, hero: true },
  ];
  const tFreeze = s2.t0; // il protagonista è in cima al lancio
  const tHit = s2.t1 - 0.2;

  // tempo "di scena" del protagonista: si ferma durante il bullet-time
  const heroTime = (t) => (t < tFreeze ? t : t < tHit - 0.14 ? tFreeze : t - (tHit - 0.14 - tFreeze));

  // posa e pallina (coordinate della sagoma) del giocatore k al tempo t
  function act(k, t) {
    const Pk = PLAYERS[k];
    if (!Pk.hero) {
      if (k === 2) {
        // il terzo lancia e colpisce durante il suo passaggio
        const t0 = s1.t0 + 2 * d + 0.05, u = seg(t, t0, t0 + 0.4), h = seg(t, t0 + 0.55, t0 + 0.68);
        let pose = mixPose(POSE.ready, POSE.toss, E.inOutCubic(u));
        if (h > 0) pose = mixPose(pose, POSE.hit, E.outCubic(h));
        const by = h > 0 ? -250 : lerp(-70, -236, E.outCubic(seg(t, t0 + 0.1, t0 + 0.55)));
        return { pose, ball: h > 0 ? null : [lerp(28, 18, u), by] };
      }
      // palleggio prima del servizio
      const ph = ((t - s1.t0 + Pk.off) / 0.469) % 1;
      const pose = mixPose(POSE.ready, POSE.bounce, Math.sin(ph * Math.PI));
      return { pose, ball: [30, lerp(-72, -6, Math.sin(ph * Math.PI) ** 0.7)] };
    }
    // protagonista: un palleggio, lancio che si ferma in cima, poi il colpo
    const ht = heroTime(t);
    const tb = s1.t0 + 3 * d, tt = tFreeze - 0.42;
    if (ht < tt) {
      const ph = clamp((ht - tb) / 0.42);
      return { pose: mixPose(POSE.ready, POSE.bounce, Math.sin(ph * Math.PI)), ball: [30, lerp(-72, -6, Math.sin(ph * Math.PI) ** 0.7)] };
    }
    const u = seg(ht, tt, tFreeze);
    let pose = mixPose(POSE.ready, POSE.toss, E.inOutCubic(u));
    const h = seg(ht, tFreeze, tFreeze + 0.12);
    if (h > 0) pose = mixPose(POSE.toss, POSE.hit, E.outCubic(h));
    return { pose, ball: h >= 0.99 ? null : [lerp(28, 20, u), lerp(-70, -238, E.outCubic(u))] };
  }

  // camera: sosta su ogni giocatore, poi frusta verso il successivo; sul protagonista entra e ruota
  function camAt(t) {
    const sh = shake(t, [[tHit, 16, 0.5]]);
    const cam = new Cam();
    if (t < tFreeze) {
      const u = (t - s1.t0) / d;
      const k = Math.min(3, Math.floor(u)), f = u - k;
      const whip = k < 3 ? E.inOutExpo(seg(f, 0.62, 1)) : 0;
      const x = lerp(px(k), px(Math.min(3, k + 1)), whip) + 1.7 + (k === 3 ? 0 : f * 0.5);
      const push = k === 3 ? E.inOutCubic(seg(f, 0, 1)) : 0;
      cam.look(P(x - push * 0.3, lerp(-4.6, -4.2, push), lerp(1.05, 1.2, push)), P(x, 1.0, lerp(1.1, 1.25, push)), deg(-2 + whip * 3), 1250);
    } else {
      // bullet-time: la camera gira lentamente attorno al protagonista congelato
      const u = seg(t, tFreeze, s2.t1);
      const ang = lerp(-18, 16, E.inOutSine(u));
      const r = lerp(5.3, 4.0, E.outCubic(u));
      const cx = px(3) + 0.3, cz = 0.5;
      const ex = cx + 1.1 + Math.sin(deg(ang)) * r, ez = cz - Math.cos(deg(ang)) * r;
      cam.look(P(ex, ez, lerp(1.2, 1.0, u)), P(cx + 1.25, cz, lerp(1.25, 1.45, u)), deg(lerp(-3, 4, u)), lerp(1250, 1300, u));
    }
    cam.cx += sh[0]; cam.cy += sh[1];
    return cam;
  }

  function drawPlayer(R, k, t, cam) {
    const Pk = PLAYERS[k];
    const x = px(k), z = 0.5;
    const pw = P(x, z, 0);
    // la sagoma guarda sempre un po' verso la camera
    const yaw = clamp(Math.atan2(cam.eye[0] - pw[0], pw[2] - cam.eye[2]) * 0.6, -0.7, 0.7);
    const { pose, ball } = act(k, t);
    R.with(TRS(pw, [0, -yaw, 0], SC), () => {
      // ombra a terra
      R.with(TRS([0, 0, 0], [deg(-90), 0, 0], 1), () => R.circle(0, 0, 40, { fill: '#000', alpha: 0.35 }, 24));
      figure(R, pose, Pk.o, { rimA: Pk.rimA, rimB: Pk.rimB, rim: Pk.hero ? 2.4 : 2.0, glow: Pk.hero ? 0.9 : 0.6 });
      if (ball) {
        const bp = R.proj(ball[0], ball[1]);
        if (bp) ballScreen(R, bp[0], bp[1], 3.4 * R.scaleAt(ball[0], ball[1]), { spin: [t * 9, t * 6, 0.2], glow: Pk.hero ? 1 : 0.7 });
      }
    });
  }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    const lv = seg(t, tFreeze - 0.05, tFreeze + 0.35); // passaggio al mondo LEVEL UP
    sky(R, 1 - lv * 0.7);
    const camX = cam.eye[0];
    towers(R, camX, 1 - lv * 0.5);
    crowd(R, t, camX, 1 - lv * 0.6);
    boards(R, t, camX, 1 - lv * 0.6);
    for (let k = 0; k < 4; k++) court(R, k * DX, 0, 1 - lv * 0.35);
    // linee di velocità e controluce nel bullet-time
    if (lv > 0) {
      R.hud(() => {
        const cx = W * 0.3, cy = H * 0.45;
        R.circle(cx, cy, 520, { fill: { rad: [cx, cy, 520], stops: [[0, rgba(PAL.magenta, 0.35 * lv)], [0.5, rgba('#6a3cff', 0.15 * lv)], [1, 'rgba(0,0,0,0)']] }, alpha: 1 }, 48);
        for (let i = 0; i < 60; i++) {
          const ang = hash(i) * Math.PI * 2, sp = ((t * (0.6 + hash(i * 3)) + hash(i * 7)) % 1);
          const r0 = 200 + sp * 1300, len = 60 + hash(i * 5) * 220;
          R.band(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0, cx + Math.cos(ang) * (r0 + len), cy + Math.sin(ang) * (r0 + len), 2 + hash(i * 9) * 3,
            { fill: i % 3 ? '#ffffff' : PAL.cyan, alpha: lv * 0.25 * Math.sin(sp * Math.PI), glow: 0.4 });
        }
      });
    }
    // giocatori da destra a sinistra (il più lontano prima non serve: sono in fila lungo x)
    for (let k = 0; k < 4; k++) if (Math.abs(px(k) * M - camX) < 40 * M) drawPlayer(R, k, t, cam);
    // lampo e scia del colpo finale
    if (t >= tHit - 0.02) {
      const u = seg(t, tHit, s2.t1);
      R.with(TRS(P(px(3), 0.5, 0), [0, 0, 0], SC), () => {
        const bp = R.proj(20, -250);
        if (bp) R.hud(() => {
          R.circle(bp[0], bp[1], lerp(20, 900, E.outCubic(u)), { stroke: '#ffffff', lw: lerp(14, 2, u), alpha: 1 - u, glow: 1 }, 64);
          R.circle(bp[0], bp[1], lerp(10, 260, u), { fill: PAL.ball, alpha: (1 - u) * 0.9, glow: 1.2 }, 40);
        });
      });
    }
    levelUp(R, t);
  }

  // testo LEVEL UP e barra di caricamento (in stile v4: estrusione magenta, segmenti che scattano)
  function levelUp(R, t) {
    const a = seg(t, tFreeze + 0.05, tFreeze + 0.3) * (1 - seg(t, s2.t1 - 0.05, s2.t1 + 0.1));
    if (a <= 0) return;
    const x = 1470, words = [['LEVEL', 390, tFreeze + 0.1], ['UP', 580, tFreeze + 0.33]];
    R.hud(() => {
      for (const [wd, y, t0] of words) {
        R.text(wd, x, y, { font: 'unb900', size: 165, align: 'center', v: 'cap', fill: '#ffffff', alpha: a, tracking: -0.04, depth: 16, depthSteps: 8,
          side: (u) => rgba(mixc(PAL.magenta, '#2a0a50', u), 1),
          per: (i) => { const u = seg(t, t0 + i * 0.035, t0 + i * 0.035 + 0.25); return { s: lerp(1.8, 1, E.outExpo(u)), a: seg(t, t0 + i * 0.035, t0 + i * 0.035 + 0.05) }; } });
      }
      // barra a 8 segmenti: si riempie veloce, a scatti sul ritmo
      const bx = x - 290, by = 720, bw = 580, bh = 50;
      const fill0 = tFreeze + 0.5, fill1 = tHit - 0.05;
      const f = clamp((t - fill0) / (fill1 - fill0));
      const n = Math.floor(E.inQuad(f) * 8 + (f >= 1 ? 1 : 0));
      R.rrect(bx - 8, by - 8, bw + 16, bh + 16, (bh + 16) / 2, { stroke: '#ffffff', lw: 3, alpha: a, glow: 0.6 });
      for (let i = 0; i < 8; i++) {
        if (i >= n) break;
        const sx = bx + i * (bw / 8) + 4, pop = E.outBack(clamp((t - (fill0 + (i / 8) * (fill1 - fill0))) / 0.12));
        R.rrect(sx, by + bh * (1 - pop) / 2, bw / 8 - 8, bh * pop, 10, { fill: i === 7 ? PAL.ball : PAL.magenta, alpha: a, glow: 0.7 });
      }
      R.text(`${Math.round(E.inQuad(f) * 100)}%`, bx + bw, by + 110, { font: 'bc900i', size: 64, align: 'right', v: 'cap', fill: n >= 8 ? PAL.ball : '#ffffff', alpha: a, glow: n >= 8 ? 0.6 : 0.1 });
      R.text('LIVELLO SUCCESSIVO', bx, by + 110, { font: 'mono800', size: 22, v: 'cap', fill: '#b9b3ff', alpha: a, tracking: 0.2 });
    });
  }

  function fx(t) {
    const f = {};
    if (t < tFreeze) {
      const u = ((t - s1.t0) / d) % 1;
      if (u > 0.6 && t < s1.t0 + 3 * d) f.mb = 8;
    }
    if (t >= tFreeze - 0.05 && t < tFreeze + 0.25) { const u = (t - tFreeze + 0.05) / 0.3; f.flash = [PAL.magenta, 0.25 * (1 - u)]; f.ca = 0.006 * (1 - u); }
    if (t >= tHit && t < s2.t1 + 0.1) { const u = (t - tHit) / 0.3; f.flash = ['#ffffff', 0.5 * (1 - u)]; f.ca = 0.015 * (1 - u); f.mb = 6; }
    return f;
  }

  return { t0: s1.t0, t1: s2.t1 + 0.02, draw, fx };
}
