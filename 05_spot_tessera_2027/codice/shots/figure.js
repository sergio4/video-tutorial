// Sagome di giocatori in controluce: rig 2D a capsule, pose interpolabili, luce di bordo nei colori del brand.
// Coordinate locali: origine a terra tra i piedi, y verso il basso, altezza ~180.
import { lerp, clamp, deg, T, rgba } from '../engine/math.js';
import { PAL } from '../engine/kit.js';

const L = { torso: 49, neck: 9, head: 10.5, ua: 29, fa: 27, th: 47, sh: 46, foot: 16 };

// direzione di un segmento: angolo 0 = verso il basso, 90 = avanti (destra), 180 = su
const dir = (a) => [Math.sin(deg(a)), Math.cos(deg(a))];
const add = (p, a, l) => { const d = dir(a); return [p[0] + d[0] * l, p[1] + d[1] * l]; };

function capsule(a, b, ra, rb, n = 10) {
  const dx = b[0] - a[0], dy = b[1] - a[1], ang = Math.atan2(dy, dx);
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = ang - Math.PI / 2 + (Math.PI * i) / n; pts.push(b[0] + Math.cos(t) * rb, b[1] + Math.sin(t) * rb); }
  for (let i = 0; i <= n; i++) { const t = ang + Math.PI / 2 + (Math.PI * i) / n; pts.push(a[0] + Math.cos(t) * ra, a[1] + Math.sin(t) * ra); }
  return pts;
}
function ellipse(c, rx, ry, rot = 0, n = 28) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, x = Math.cos(t) * rx, y = Math.sin(t) * ry;
    pts.push(c[0] + x * Math.cos(rot) - y * Math.sin(rot), c[1] + x * Math.sin(rot) + y * Math.cos(rot));
  }
  return pts;
}

// pose: angoli in gradi. Vista 'side' (profilo verso destra), 'front' o 'back'.
export const POSE = {
  ready: { view: 'side', lean: 12, neck: 4, sA: 38, eA: 48, sB: 10, eB: 38, hA: 14, kA: -20, hB: -16, kB: -10, crouch: 6, rk: 60 },
  bounce: { view: 'side', lean: 16, neck: 10, sA: 20, eA: 25, sB: 14, eB: 60, hA: 14, kA: -22, hB: -12, kB: -16, crouch: 7, rk: 75 },
  toss: { view: 'side', lean: -12, neck: -18, sA: 172, eA: 4, sB: -125, eB: 95, hA: 22, kA: -42, hB: -6, kB: -38, crouch: 10, rk: 140 },
  low: { view: 'side', lean: 28, neck: -14, sA: 58, eA: 38, sB: 48, eB: 46, hA: 34, kA: -58, hB: -24, kB: -44, crouch: 26, rk: 105 },
  stand: { view: 'front', lean: 0, neck: 0, sA: 8, eA: -4, sB: 8, eB: -4, hA: 6, kA: -1, hB: 6, kB: -1, crouch: 0, rk: 10 },
  standR: { view: 'front', lean: 0, neck: 2, sA: 20, eA: 70, sB: 8, eB: -4, hA: 8, kA: -2, hB: 5, kB: 0, crouch: 0, rk: -60 },
  hit: { view: 'side', lean: 22, neck: -6, sA: 70, eA: 30, sB: 178, eB: 4, hA: 8, kA: -8, hB: -34, kB: -18, crouch: 2, rk: 0 },
  lift: { view: 'front', lean: 0, neck: -8, sA: 160, eA: 28, sB: 160, eB: 28, hA: 9, kA: 0, hB: 9, kB: 0, crouch: 0, rk: 0 },
  back: { view: 'back', lean: 0, neck: 0, sA: 9, eA: -3, sB: 9, eB: -3, hA: 6, kA: 0, hB: 6, kB: 0, crouch: 0, rk: 170 },
};

export function mixPose(a, b, u) {
  const o = { view: u < 0.5 ? a.view : b.view };
  for (const k in a) if (typeof a[k] === 'number') o[k] = lerp(a[k], b[k] ?? a[k], u);
  return o;
}

// scheletro → punti
function joints(p) {
  const front = p.view !== 'side';
  const pelvis = [0, -98 + p.crouch];
  const chest = add(pelvis, 180 - p.lean, L.torso);
  const neckTop = add(chest, 180 - p.lean - p.neck, L.neck);
  const head = add(neckTop, 180 - p.lean - p.neck, L.head * 0.9);
  const shW = front ? 19 : 3, hipW = front ? 10 : 2;
  const perp = [Math.cos(deg(p.lean)), Math.sin(deg(p.lean))];
  const shA = [chest[0] + perp[0] * shW, chest[1] + perp[1] * shW], shB = [chest[0] - perp[0] * shW, chest[1] - perp[1] * shW];
  const hpA = [pelvis[0] + hipW, pelvis[1]], hpB = [pelvis[0] - hipW, pelvis[1]];
  // in vista frontale/retro il lato B è specchiato
  const m = front ? -1 : 1;
  const elA = add(shA, p.sA, L.ua), hdA = add(elA, p.sA + p.eA, L.fa);
  const elB = add(shB, m * p.sB, L.ua), hdB = add(elB, m * (p.sB + p.eB), L.fa);
  const knA = add(hpA, p.hA, L.th), ftA = add(knA, p.hA + p.kA, L.sh);
  const knB = add(hpB, m * p.hB, L.th), ftB = add(knB, m * (p.hB + p.kB), L.sh);
  return { pelvis, chest, neckTop, head, shA, shB, hpA, hpB, elA, hdA, elB, hdB, knA, ftA, knB, ftB, front };
}

export const jointsOf = (p) => joints(p);

// forme della sagoma; o: { racket:'A'|'B'|null, kind:'tennis'|'padel', cap, band, pony, skirt, ball }
function shapes(p, o) {
  const J = joints(p), S = [];
  const W = J.front ? 1.12 : 0.92;
  S.push(capsule(J.pelvis, J.chest, 11.5 * W, 15 * W, 12));
  S.push(capsule(J.chest, J.neckTop, 4.6, 4.2, 6));
  if (J.front) S.push(capsule([J.shA[0] - 2, J.shA[1] + 3], [J.shB[0] + 2, J.shB[1] + 3], 6.5, 6.5, 8));
  S.push(ellipse(J.head, L.head * 0.92, L.head, deg(-p.lean * 0.3)));
  for (const [sh, el, hd] of [[J.shA, J.elA, J.hdA], [J.shB, J.elB, J.hdB]]) {
    S.push(capsule(sh, el, 5.2, 4.2)); S.push(capsule(el, hd, 4, 3.1)); S.push(ellipse(hd, 4, 4));
  }
  for (const [hp, kn, ft] of [[J.hpA, J.knA, J.ftA], [J.hpB, J.knB, J.ftB]]) {
    S.push(capsule(hp, kn, 8.2, 5.6)); S.push(capsule(kn, ft, 5.4, 3.6));
    const fwd = J.front ? 0 : 1;
    S.push(capsule([ft[0] - 3, ft[1] + 2], [ft[0] + (fwd ? L.foot : 4), ft[1] + 3], 4, 3.2, 6));
  }
  if (o.skirt) S.push([J.pelvis[0] - 17, J.pelvis[1] - 6, J.pelvis[0] + 17, J.pelvis[1] - 6, J.pelvis[0] + 22, J.pelvis[1] + 16, J.pelvis[0] - 22, J.pelvis[1] + 16]);
  if (o.pony) S.push(capsule([J.head[0] - 8, J.head[1] - 2], [J.head[0] - 16, J.head[1] + 12], 4, 2.5, 6));
  if (o.cap) S.push(capsule([J.head[0] - 4, J.head[1] - 8], [J.head[0] + (J.front ? 4 : 17), J.head[1] - 7], 5, 3, 6));
  let rk = null;
  if (o.racket) {
    const el = o.racket === 'A' ? J.elA : J.elB, hd = o.racket === 'A' ? J.hdA : J.hdB;
    const fa = Math.atan2(hd[1] - el[1], hd[0] - el[0]);
    const a = fa + deg(p.rk) * (o.racket === 'B' && J.front ? -1 : 1);
    const d = [Math.cos(a), Math.sin(a)];
    const handleEnd = [hd[0] + d[0] * 20, hd[1] + d[1] * 20];
    S.push(capsule(hd, handleEnd, 2, 2.4, 4));
    const hc = [handleEnd[0] + d[0] * (o.kind === 'padel' ? 14 : 17), handleEnd[1] + d[1] * (o.kind === 'padel' ? 14 : 17)];
    rk = { c: hc, rot: a + Math.PI / 2, rx: o.kind === 'padel' ? 13 : 12.5, ry: o.kind === 'padel' ? 15 : 17.5, kind: o.kind || 'tennis' };
    if (rk.kind === 'padel') S.push(ellipse(hc, rk.rx, rk.ry, rk.rot, 24));
  }
  return { S, J, rk };
}

// disegna la sagoma nel piano corrente. st: { rimA, rimB, body, rim (spessore), alpha, accent, glow }
export function figure(R, pose, o = {}, st = {}) {
  const { S, J, rk } = shapes(pose, o);
  const a = st.alpha ?? 1;
  const rim = st.rim ?? 2.0;
  const rimA = st.rimA || PAL.cyan, rimB = st.rimB || PAL.magenta;
  // luce di bordo: copie spostate sotto la sagoma
  R.with(T(rim, -rim * 0.4, 0), () => R.shape(S, { fill: rimA, alpha: a * (st.rimAlpha ?? 1), glow: st.glow ?? 0.6, glowColor: rimA }));
  R.with(T(-rim, -rim * 0.3, 0), () => R.shape(S, { fill: rimB, alpha: a * (st.rimAlpha ?? 1), glow: st.glow ?? 0.6, glowColor: rimB }));
  R.shape(S, { fill: st.body || { lin: [0, -180, 0, 0], stops: [[0, '#1d1548'], [1, '#07051a']] }, alpha: a, knock: true });
  // racchetta da tennis: ovale vuoto con corde luminose
  if (rk && rk.kind === 'tennis') {
    const ring = ellipse(rk.c, rk.rx, rk.ry, rk.rot, 32);
    R.line(ring.concat(ring.slice(0, 2)), { stroke: '#07051a', lw: 3.2, alpha: a });
    R.line(ring.concat(ring.slice(0, 2)), { stroke: st.accent || PAL.cyan, lw: 1.1, alpha: a, glow: 0.9 });
    const c = Math.cos(rk.rot), s = Math.sin(rk.rot);
    for (let k = -3; k <= 3; k++) {
      const u = (k / 4) * rk.rx, h = rk.ry * Math.sqrt(Math.max(0, 1 - (u / rk.rx) ** 2)) * 0.92;
      R.line([rk.c[0] + u * c - -h * s, rk.c[1] + u * s + -h * c, rk.c[0] + u * c - h * s, rk.c[1] + u * s + h * c], { stroke: '#ffffff', lw: 0.35, alpha: a * 0.45, glow: 0.3 });
      const v = (k / 4) * rk.ry, w = rk.rx * Math.sqrt(Math.max(0, 1 - (v / rk.ry) ** 2)) * 0.92;
      R.line([rk.c[0] - w * c - v * s, rk.c[1] - w * s + v * c, rk.c[0] + w * c - v * s, rk.c[1] + w * s + v * c], { stroke: '#ffffff', lw: 0.35, alpha: a * 0.45, glow: 0.3 });
    }
  }
  // fascia per capelli, polsini: accento di colore
  if (o.band) {
    const h = J.head;
    R.shape([capsule([h[0] - 11, h[1] - 4], [h[0] + 11, h[1] - 6], 2.2, 2.2, 4)], { fill: o.band, alpha: a, glow: 0.9 });
  }
  if (o.wrist) for (const hd of [J.hdA, J.hdB]) R.circle(hd[0], hd[1] - 5, 3.4, { fill: o.wrist, alpha: a * 0.9, glow: 0.7 }, 12);
  return J;
}

// ombra proiettata a terra della sagoma: nessun corpo visibile, solo la sua presenza.
// Va disegnata dentro una trasformazione che schiaccia il piano della sagoma sul terreno (vedi groundShadow).
export function shadowFig(R, pose, o = {}, st = {}) {
  const { S, rk } = shapes(pose, o);
  const a = st.alpha ?? 0.7;
  if (rk && rk.kind === 'tennis') {
    const ring = ellipse(rk.c, rk.rx, rk.ry, rk.rot, 32);
    const inner = ellipse(rk.c, rk.rx - 2.4, rk.ry - 2.4, rk.rot, 32);
    R.shape([ring, inner], { fill: st.fill || '#05030f', alpha: a * 0.9, blur: st.blur ?? 0, rule: 'evenodd' });
    const c = Math.cos(rk.rot), s = Math.sin(rk.rot);
    for (let k = -3; k <= 3; k++) {
      const u = (k / 4) * rk.rx, h = rk.ry * Math.sqrt(Math.max(0, 1 - (u / rk.rx) ** 2)) * 0.92;
      R.line([rk.c[0] + u * c + h * s, rk.c[1] + u * s - h * c, rk.c[0] + u * c - h * s, rk.c[1] + u * s + h * c], { stroke: st.fill || '#05030f', lw: 0.6, alpha: a * 0.5 });
    }
  }
  R.shape(S, { fill: st.fill || '#05030f', alpha: a, blur: st.blur ?? 0 });
}

// matrice che proietta il piano della sagoma (x avanti, y giù, altezza ~180) sul terreno y=0:
// l'ombra parte dai piedi in p (mondo) e si allunga di len volte l'altezza verso la direzione dir [dx, dz].
export function groundShadow(p, sc, dir, len, yaw = 0) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const [dx, dz] = dir;
  // x locale → di lato rispetto alla direzione dell'ombra; y locale (negativa in alto) → lungo dir
  return [c * sc, -dx * sc * len, 0, p[0], 0, 0, 0, p[1] - 0.5, s * sc, -dz * sc * len, 0, p[2]];
}
