// SCENE 1-2 · «Tutti i giocatori puntano alla vittoria, ma solo i migliori passano al livello successivo.»
// Segnaposto senza personaggi: dei giocatori vediamo solo le ombre lunghe dei fari sul campo e la pallina.
// Carrellata a frusta su quattro campi (cemento, terra, erba, cemento); sul protagonista la camera segue il lancio
// verso il cielo e il tempo si ferma sulla pallina (bullet-time): LEVEL UP e la barra che si riempie, poi il colpo.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T } from '../engine/math.js';
import { PAL, ball as ball3 } from '../engine/kit.js';
import { shake, bokeh } from './common.js';
import { POSE, mixPose, shadowFig, groundShadow } from './figure.js';
import { M, P, court, crowd, towers, sky } from './arena.js';

const DX = 27; // metri tra un campo e l'altro
const SC = (1.86 * M) / 180; // scala della sagoma
const SDIR = [0.34, -0.94]; // direzione delle ombre sul terreno (verso la camera)
const SLEN = 2.4; // lunghezza dell'ombra rispetto all'altezza
const BR = 0.034 * M; // raggio della pallina

export function act1(S, TL) {
  const s1 = S.s1, s2 = S.s2;
  const d = s1.dur / 4; // un giocatore ogni quarto di scena (2 beat a 128 BPM)
  const px = (k) => k * DX - 12.4; // posizione del giocatore k (metri)
  const PLAYERS = [
    { o: { racket: 'B' }, surf: 'hard', tag: 'ACE_MARTI', lv: 14, off: 0.05 },
    { o: { racket: 'B', skirt: true, pony: true, cap: true }, surf: 'clay', tag: 'LUNA.SPIN', lv: 21, off: 0.25 },
    { o: { racket: 'B', cap: true }, surf: 'grass', tag: 'DROPSHOT99', lv: 17, off: 0.4 },
    { o: { racket: 'B' }, surf: 'hard', tag: 'MARCO', lv: 29, hero: true },
  ];
  const tFreeze = s2.t0; // la pallina del protagonista è in cima al lancio
  const tHit = s2.t1 - 0.2;
  const tToss = tFreeze - 0.42;
  const heroX = px(3);
  const BALL_TOP = P(heroX + 0.42, 0.12, 2.55); // pallina congelata

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
      const ph = ((t - s1.t0 + Pk.off) / 0.469) % 1;
      const pose = mixPose(POSE.ready, POSE.bounce, Math.sin(ph * Math.PI));
      return { pose, ball: [30, lerp(-72, -6, Math.sin(ph * Math.PI) ** 0.7)] };
    }
    const tb = s1.t0 + 3 * d;
    if (t < tToss) {
      const ph = clamp((t - tb) / 0.42);
      return { pose: mixPose(POSE.ready, POSE.bounce, Math.sin(ph * Math.PI)), ball: [30, lerp(-72, -6, Math.sin(ph * Math.PI) ** 0.7)] };
    }
    const u = seg(t, tToss, tFreeze);
    return { pose: mixPose(POSE.ready, POSE.toss, E.inOutCubic(u)), ball: null };
  }

  function camAt(t) {
    const sh = shake(t, [[tHit, 18, 0.5]]);
    const cam = new Cam();
    const courtCam = (x, f) => [P(x + 1.3 + f * 0.4, -4.7, 5.0), P(x + 1.5 + f * 0.4, -3.3, 0)];
    if (t < tToss) {
      const u = (t - s1.t0) / d;
      const k = Math.min(3, Math.floor(u)), f = u - k;
      const whip = k < 3 ? E.inOutExpo(seg(f, 0.62, 1)) : 0;
      const x = lerp(px(k), px(Math.min(3, k + 1)), whip);
      const [eye, tgt] = courtCam(x, k < 3 ? f * (1 - whip) : f);
      cam.look(eye, tgt, deg(-2 + whip * 4), 1250);
    } else if (t < tFreeze) {
      // la camera segue la pallina verso il cielo: da sopra il campo a quasi terra, con un tele sempre più stretto
      const u = E.inOutCubic(seg(t, tToss, tFreeze));
      const [e0, g0] = courtCam(heroX, 1);
      const e1 = P(heroX + 0.42 - Math.sin(deg(8)) * 3.0, 0.12 - Math.cos(deg(8)) * 3.0, 0.35);
      const g1 = [BALL_TOP[0] + 0.25 * M, BALL_TOP[1] + 0.12 * M, BALL_TOP[2]];
      const eye = e0.map((v, i) => lerp(v, e1[i], u)), tgt = g0.map((v, i) => lerp(v, g1[i], u));
      cam.look(eye, tgt, deg(lerp(2, -3, u)), lerp(1250, 3400, u));
    } else {
      // bullet-time: giro lento attorno alla pallina sospesa, visto dal basso contro i fari
      const u = seg(t, tFreeze, s2.t1);
      const ang = deg(lerp(-8, 24, E.inOutSine(u)));
      const r = lerp(3.0, 2.6, E.outCubic(u)) * M;
      const eye = [BALL_TOP[0] + Math.sin(ang) * r, -lerp(0.35, 0.6, u) * M, BALL_TOP[2] - Math.cos(ang) * r];
      cam.look(eye, [BALL_TOP[0] + 0.25 * M, BALL_TOP[1] + 0.12 * M, BALL_TOP[2]], deg(lerp(-3, 5, u)), lerp(3400, 3100, u));
    }
    cam.cx += sh[0]; cam.cy += sh[1];
    return cam;
  }

  // ombra del giocatore k, con la pallina reale e la sua ombra
  function drawShadow(R, k, t) {
    const Pk = PLAYERS[k];
    const x = px(k);
    const { pose, ball } = act(k, t);
    const feet = P(x, 0.5, 0);
    R.with(groundShadow(feet, SC, SDIR, SLEN), () => {
      shadowFig(R, pose, Pk.o, { alpha: 0.28, blur: 9 });
      shadowFig(R, pose, Pk.o, { alpha: 0.7, blur: 1.2 });
    });
    if (ball) {
      const hgt = -ball[1] * SC; // altezza in unità
      const bx = feet[0] + ball[0] * SC, bz = feet[2] - 0.35 * M;
      const sp = [bx + SDIR[0] * hgt * SLEN, 0, bz + SDIR[1] * hgt * SLEN];
      R.with(TRS(sp, [deg(-90), 0, 0], 1), () => R.circle(0, 0, BR * 1.1, { fill: '#05030f', alpha: 0.55, blur: 1 }, 16));
      ball3(R, [bx, -hgt - BR, bz], BR, { spin: [t * 9, t * 6, 0.2], glow: 0.8 });
    }
  }

  // pozza di luce del faro attorno al giocatore
  function lightPool(R, k, a) {
    if (a <= 0) return;
    R.with(TRS(P(px(k) + 0.8, -1.2, 0), [deg(-90), 0, 0], M), () => {
      for (let i = 0; i < 14; i++) R.circle(0, 0, 1.0 + i * 0.5, { fill: '#ffffff', alpha: a * 0.014, blend: 'lighter' }, 48);
    });
  }

  function gamerTag(R, t) {
    if (t >= tToss) return;
    const u = (t - s1.t0) / d, k = Math.min(3, Math.floor(u)), f = u - k;
    const Pk = PLAYERS[k];
    const a = seg(f, 0.08, 0.2) * (k < 3 ? 1 - seg(f, 0.55, 0.64) : 1);
    if (a <= 0) return;
    const sl = (1 - E.outExpo(seg(f, 0.08, 0.3))) * -60;
    R.hud(() => {
      const x = 96 + sl, y = H - 190;
      R.rrect(x, y, 380, 88, 16, { fill: 'rgba(8,5,26,0.55)', stroke: 'rgba(255,255,255,0.25)', lw: 1.5, alpha: a });
      R.text(Pk.tag, x + 24, y + 34, { font: 'unb900', size: 26, v: 'cap', fill: '#ffffff', alpha: a, tracking: -0.01 });
      R.text(`LV ${Pk.lv}`, x + 356, y + 34, { font: 'bc900i', size: 34, align: 'right', v: 'cap', fill: PAL.ball, alpha: a });
      R.rrect(x + 24, y + 58, 332, 10, 5, { fill: 'rgba(255,255,255,0.14)', alpha: a });
      R.rrect(x + 24, y + 58, 332 * (0.3 + hash(k * 3 + 1) * 0.5), 10, 5, { fill: PAL.magenta, alpha: a, glow: 0.5 });
    });
  }

  // racchetta che entra nell'inquadratura e colpisce la pallina (solo l'attrezzo, nessun corpo)
  function racket(R, t) {
    const u = seg(t, tHit - 0.12, tHit + 0.1);
    if (u <= 0 || u >= 1) return;
    const e = u < 0.55 ? E.inCubic(u / 0.55) * 0.55 : u;
    const c = [lerp(BALL_TOP[0] - 1.1 * M, BALL_TOP[0] + 0.9 * M, e), lerp(BALL_TOP[1] - 0.9 * M, BALL_TOP[1] + 0.5 * M, e), BALL_TOP[2] + 0.05 * M];
    R.with(TRS(c, [deg(12), deg(-25), deg(lerp(60, -20, e))], M), () => {
      R.band(0, 0.2, 0, 0.72, 0.03, { fill: '#0b0620' });
      R.band(0, 0.2, 0, 0.72, 0.012, { fill: PAL.ball, alpha: 0.9, glow: 0.8 });
      R.ring(0, 0, 0.14, 0.17, { fill: '#0b0620' }, 48);
      R.arc(0, 0, 0.155, 0, Math.PI * 2, { stroke: PAL.ball, lw: 0.01, glow: 1.2 }, 48);
      for (let k = -4; k <= 4; k++) {
        const v = (k / 5) * 0.14, w = 0.14 * Math.sqrt(1 - (v / 0.14) ** 2);
        R.line([-w, v, w, v], { stroke: '#ffffff', lw: 0.003, alpha: 0.6 });
        R.line([v, -w, v, w], { stroke: '#ffffff', lw: 0.003, alpha: 0.6 });
      }
    });
  }

  function screenOf(R, p, fb) { const pc = R.camW(p); return pc[2] > 1 ? R.projC(pc) : fb; }

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    const lv = seg(t, tFreeze - 0.05, tFreeze + 0.35); // passaggio al mondo LEVEL UP
    const up = seg(t, tToss, tFreeze); // quanto guardiamo verso il cielo
    sky(R, 1 - lv * 0.5);
    const camX = cam.eye[0];
    if (up > 0) {
      bokeh(R, t, up * (1 - lv * 0.3), (cam.eye[0] - heroX * M) * 6);
      crowd(R, t, camX, (1 - lv * 0.4) * up, { z0: 14, rows: 9 });
    }
    for (let k = 0; k < 4; k++) if (Math.abs(px(k) * M - camX) < 45 * M) {
      court(R, k * DX, 0, 1 - lv * 0.35, { surf: PLAYERS[k].surf });
      lightPool(R, k, 1 - up);
    }
    for (let k = 0; k < 4; k++) if (Math.abs(px(k) * M - camX) < 40 * M) {
      if (PLAYERS[k].hero && t >= tFreeze) continue;
      drawShadow(R, k, t);
    }
    // bullet-time: controluce e linee di velocità attorno alla pallina
    if (lv > 0) {
      const [cx, cy] = screenOf(R, BALL_TOP, [W * 0.35, H * 0.45]);
      R.hud(() => {
        R.circle(cx, cy, 560, { fill: { rad: [cx, cy, 560], stops: [[0, rgba(PAL.magenta, 0.4 * lv)], [0.5, rgba('#6a3cff', 0.16 * lv)], [1, 'rgba(0,0,0,0)']] } }, 48);
        for (let i = 0; i < 64; i++) {
          const ang = hash(i) * Math.PI * 2, sp = ((t * (0.6 + hash(i * 3)) + hash(i * 7)) % 1);
          const r0 = 150 + sp * 1300, len = 60 + hash(i * 5) * 220;
          R.band(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0, cx + Math.cos(ang) * (r0 + len), cy + Math.sin(ang) * (r0 + len), 2 + hash(i * 9) * 3,
            { fill: i % 3 ? '#ffffff' : PAL.cyan, alpha: lv * 0.25 * Math.sin(sp * Math.PI), glow: 0.4 });
        }
      });
    }
    // pallina del protagonista: sale durante il lancio, poi resta sospesa fino al colpo
    if (t >= tToss && t < tHit) {
      const u = seg(t, tToss, tFreeze);
      const p0 = [heroX * M + 28 * SC, -70 * SC, 0.15 * M];
      const pb = t < tFreeze ? [lerp(p0[0], BALL_TOP[0], u), lerp(p0[1], BALL_TOP[1], E.outCubic(u)), lerp(p0[2], BALL_TOP[2], u)] : BALL_TOP;
      ball3(R, pb, BR, { spin: [t * 2.5, t * 1.5, 0.2], glow: 1.1 });
    }
    racket(R, t);
    // lampo e anelli del colpo finale
    if (t >= tHit - 0.02) {
      const u = seg(t, tHit, s2.t1 + 0.05);
      const bp = screenOf(R, BALL_TOP, null);
      if (bp) R.hud(() => {
        R.circle(bp[0], bp[1], lerp(20, 1000, E.outCubic(u)), { stroke: '#ffffff', lw: lerp(14, 2, u), alpha: 1 - u, glow: 1 }, 64);
        R.circle(bp[0], bp[1], lerp(10, 300, u), { fill: PAL.ball, alpha: (1 - u) * 0.9, glow: 1.2 }, 40);
      });
    }
    gamerTag(R, t);
    levelUp(R, t);
  }

  // testo LEVEL UP e barra di caricamento (estrusione magenta, segmenti che scattano)
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
      R.text('MARCO · LV 29 › 30', bx, by - 40, { font: 'mono800', size: 20, v: 'cap', fill: '#ffffff', alpha: a * 0.8, tracking: 0.16 });
    });
  }

  function fx(t) {
    const f = {};
    if (t < tToss) {
      const u = ((t - s1.t0) / d) % 1;
      if (u > 0.6 && t < s1.t0 + 3 * d) f.mb = 8;
    }
    if (t >= tToss && t < tFreeze) f.mb = 8;
    if (t >= tFreeze - 0.05 && t < tFreeze + 0.25) { const u = (t - tFreeze + 0.05) / 0.3; f.flash = [PAL.magenta, 0.25 * (1 - u)]; f.ca = 0.006 * (1 - u); }
    if (t >= tHit - 0.12 && t < tHit) f.mb = 8;
    if (t >= tHit && t < s2.t1 + 0.1) { const u = (t - tHit) / 0.3; f.flash = ['#ffffff', 0.5 * (1 - u)]; f.ca = 0.015 * (1 - u); f.mb = 6; }
    return f;
  }

  return { t0: s1.t0, t1: s2.t1 + 0.02, draw, fx };
}
