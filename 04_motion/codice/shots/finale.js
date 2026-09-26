// ATTO 5 · PAYOFF + CTA: il tag «TU» diventa il messaggio, la pallina rimbalza sul percorso dei 5 passi,
// il percorso si chiude nel logo e la pallina fa da punto a «TOCCA A TE.»
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T, RX, RY, RZ, noise1 } from '../engine/math.js';
import { PAL, ballScreen, checkMark } from '../engine/kit.js';
import { bgNight, dust, shake } from './common.js';

const NODES = ['ENTRA', 'myFITP', 'TESSERA', 'TORNEI', 'GIOCA'];
const NX = (i) => 280 + i * 340, NY = 520;

export function finaleAct(c, TL) {
  const beats = c.nodes; // istanti in cui la pallina arriva su ogni nodo

  // icone disegnate a linee in un quadrato di lato s centrato
  function icon(R, k, x, y, s, p, a) {
    const st = { stroke: '#fff', lw: 5, alpha: a, glow: 0.4, cap: 'round', join: 'round' };
    const L = (pts) => {
      // disegno progressivo della polilinea
      const flat = pts.flat();
      let tot = 0; const seglen = [];
      for (let i = 2; i < flat.length; i += 2) { const d = Math.hypot(flat[i] - flat[i - 2], flat[i + 1] - flat[i - 1]); seglen.push(d); tot += d; }
      let rem = tot * clamp(p);
      const out = [flat[0], flat[1]];
      for (let i = 0; i < seglen.length && rem > 0; i++) {
        const f = Math.min(1, rem / seglen[i]);
        out.push(lerp(flat[2 * i], flat[2 * i + 2], f), lerp(flat[2 * i + 1], flat[2 * i + 3], f));
        rem -= seglen[i];
      }
      if (out.length >= 4) R.line(out, st);
    };
    const q = (u, v) => [x + (u - 0.5) * s, y + (v - 0.5) * s];
    if (k === 0) { L([q(0.55, 0.12), q(0.85, 0.12), q(0.85, 0.88), q(0.55, 0.88)]); L([q(0.12, 0.5), q(0.62, 0.5)]); L([q(0.45, 0.33), q(0.64, 0.5), q(0.45, 0.67)]); }
    if (k === 1) { const pts = R.rrPts(x - s * 0.24, y - s * 0.42, s * 0.48, s * 0.84, s * 0.1, 4); L([...Array(pts.length / 2).keys()].map((i) => [pts[2 * i], pts[2 * i + 1]]).concat([[pts[0], pts[1]]])); L([q(0.44, 0.78), q(0.56, 0.78)]); }
    if (k === 2) { const pts = R.rrPts(x - s * 0.42, y - s * 0.28, s * 0.84, s * 0.56, s * 0.08, 4); L([...Array(pts.length / 2).keys()].map((i) => [pts[2 * i], pts[2 * i + 1]]).concat([[pts[0], pts[1]]])); L([q(0.08, 0.4), q(0.92, 0.4)]); L([q(0.2, 0.62), q(0.45, 0.62)]); }
    if (k === 3) { L([q(0.1, 0.2), q(0.4, 0.2), q(0.4, 0.8), q(0.1, 0.8)]); L([q(0.4, 0.5), q(0.65, 0.5)]); L([q(0.65, 0.3), q(0.65, 0.7)]); L([q(0.65, 0.5), q(0.9, 0.5)]); }
  }

  // posizione della pallina lungo il percorso: salti da nodo a nodo che atterrano sul beat
  function ballPath(t) {
    if (t < beats[0]) {
      // dal punto di «ANCHE TU.» al primo nodo
      const u = seg(t, c.out0, beats[0]);
      const a = [c.periodX, c.periodY], b = [NX(0), NY - 74];
      return [lerp(a[0], b[0], E.inOutCubic(u)), lerp(a[1], b[1], u) - Math.sin(u * Math.PI) * 220, u];
    }
    for (let i = 0; i < beats.length - 1; i++) {
      if (t < beats[i + 1]) {
        const u = seg(t, beats[i], beats[i + 1]);
        return [lerp(NX(i), NX(i + 1), u), NY - 74 - Math.sin(u * Math.PI) * 170, u];
      }
    }
    return [NX(beats.length - 1), NY - 74, 1];
  }

  // posizioni della frase «PUOI GIOCARE / ANCHE TU.» centrate sullo schermo
  let LAY = null;
  function layout(R) {
    if (LAY) return LAY;
    const wA = R.measure('ANCHE', 'unb900', 190, -0.04), wT = R.measure('TU', 'unb900', 190, -0.03);
    const tagW = wT + 90, gap = 36, ballD = 68;
    const tot = wA + gap + tagW + 24 + ballD;
    const x0 = W / 2 - tot / 2;
    const wP = R.measure('PUOI', 'unb900', 150, -0.03), wG = R.measure('GIOCARE', 'unb900', 150, -0.03);
    const tot1 = wP + 56 + wG, x1 = W / 2 - tot1 / 2;
    const capH = R.fonts.layout('TU', 'unb900', 190, -0.03).capH;
    LAY = { tagW, ancheR: x0 + wA, tagX: x0 + wA + gap + tagW / 2, periodX: x0 + wA + gap + tagW + 24 + ballD / 2, puoiX: x1 + wP / 2, giocX: x1 + wP + 56 + wG / 2 };
    c.periodX = LAY.periodX;
    c.periodY = 640 + capH / 2 - 34;
    return LAY;
  }

  function payoff(R, t) {
    const out = seg(t, c.out0, c.out0 + 0.35);
    const a = 1 - out;
    if (a <= 0) return;
    // il tag TU (lime) arriva a pieno schermo dal tabellone e si ritira nel suo posto nella frase
    const k = E.outExpo(seg(t, c.t0, c.t0 + 0.4));
    const L = layout(R);
    const tagW = L.tagW, tagH = 220, tx = L.tagX, ty = 640;
    const x0 = lerp(-60, tx - tagW / 2, k), y0 = lerp(-60, ty - tagH / 2, k);
    const w = lerp(W + 120, tagW, k), h = lerp(H + 120, tagH, k);
    R.hud(() => {
      R.push(T(0, -out * 120, 0));
      R.rrect(x0, y0, w, h, lerp(0, 30, k), { fill: PAL.ball, alpha: a, glow: 0.25 });
      R.text('TU', x0 + w / 2, y0 + h / 2, { font: 'unb900', size: lerp(760, 190, k), align: 'center', v: 'cap', fill: PAL.night, alpha: a, tracking: -0.03, knock: true });
      // ANCHE
      R.text('ANCHE', L.ancheR, ty, { font: 'unb900', size: 190, align: 'right', v: 'cap', fill: '#fff', alpha: a, tracking: -0.04,
        per: (i, n) => { const u = seg(t, c.anche + i * 0.035, c.anche + i * 0.035 + 0.3); return { x: (1 - E.outExpo(u)) * -260, a: seg(t, c.anche + i * 0.035, c.anche + i * 0.035 + 0.05) }; } });
      // PUOI GIOCARE, a parole sul beat
      const words = [['PUOI', c.w1, L.puoiX], ['GIOCARE', c.w2, L.giocX]];
      for (const [wd, tw, xx] of words) {
        const u = seg(t, tw, tw + 0.22);
        if (u <= 0) continue;
        R.text(wd, xx, 400, { font: 'unb900', size: 150, align: 'center', v: 'cap', fill: '#fff', alpha: a * seg(t, tw, tw + 0.04), tracking: -0.03,
          per: () => ({ s: lerp(1.9, 1, E.outExpo(u)), z: 0 }) });
      }
      R.pop();
    });
  }

  function cta(R, t) {
    const v = seg(t, c.out0 + 0.1, c.out0 + 0.4);
    const gone = seg(t, c.lock0, c.lock0 + 0.35);
    if (v <= 0 || gone >= 1) return;
    const a = v * (1 - gone);
    const squeeze = E.inCubic(gone);
    R.hud(() => {
      // linea del percorso che si disegna davanti alla pallina
      const bp = ballPath(t);
      const x1 = Math.max(NX(0), bp[0]);
      const sx = (x) => lerp(x, W / 2, squeeze);
      R.band(sx(NX(0) - 120), NY, sx(NX(4) + 120), NY, 3, { fill: 'rgba(255,255,255,0.15)', alpha: a });
      R.band(sx(NX(0) - 120), NY, sx(x1), NY, 5, { fill: PAL.ball, alpha: a, glow: 0.9 });
      NODES.forEach((lab, i) => {
        const tb = beats[i];
        const p = E.outBack(seg(t, tb - 0.04, tb + 0.25), 2);
        if (p <= 0) return;
        const x = sx(NX(i));
        const hot = 1 - seg(t, tb, tb + 0.4);
        R.circle(x, NY, 80 * p, { fill: PAL.night, alpha: a });
        R.circle(x, NY, 80 * p, { stroke: i === 4 ? PAL.ball : '#fff', lw: 5, alpha: a, glow: 0.5 + hot });
        R.circle(x, NY, (80 + hot * 70) * p, { stroke: PAL.ball, lw: 3, alpha: a * hot * 0.8, glow: 0.6 });
        if (i < 4) icon(R, i, x, NY, 76, seg(t, tb, tb + 0.35), a);
        const lu = E.outExpo(seg(t, tb + 0.05, tb + 0.4));
        R.clipRect(x - 200, NY + 104, 400, 84);
        R.text(lab, x, NY + 146 + (1 - lu) * 70, { font: 'unb900', size: 46, align: 'center', v: 'cap', fill: i === 4 ? PAL.ball : '#fff', alpha: a, tracking: -0.01, glow: i === 4 ? 0.4 : 0 });
        R.unclip();
        R.text(String(i + 1).padStart(2, '0'), x, NY - 126, { font: 'mono800', size: 20, align: 'center', v: 'cap', fill: '#b9b3ff', alpha: a * lu, tracking: 0.1 });
      });
    });
  }

  function lockup(R, t) {
    const v = seg(t, c.lock0 + 0.15, c.lock0 + 0.5);
    if (v <= 0) return;
    const pop = E.outBack(seg(t, c.lock0 + 0.15, c.lock0 + 0.6), 1.8);
    R.hud(() => {
      // alone e anello che si espande
      const rr = E.outCubic(seg(t, c.lock0 + 0.15, c.lock0 + 0.9));
      R.circle(W / 2, 400, lerp(100, 900, rr), { stroke: PAL.cyan, lw: 3, alpha: (1 - rr) * 0.8, glow: 0.8 }, 96);
      const br = 1 + 0.015 * Math.sin((t - c.lock0) * 2.2);
      const lw = 760 * pop * br, lh = lw * (717 / 1278);
      R.layer({ alpha: v }, () => {
        R.with(TRS([W / 2, 400, 0], [deg(4 * Math.sin(t * 0.9)), deg(8 * Math.sin(t * 0.7)), 0], 1), () => R.image(R.img.logo, -lw / 2, -lh / 2, lw, lh, { sub: 4 }));
        // riflesso che attraversa il logo (solo sui pixel del logo), ripetuto a ogni battuta
        const sw = ((t - (c.lock0 + 0.5)) % 1.875) / 0.7;
        if (t > c.lock0 + 0.5 && sw > 0 && sw < 1) {
          const x = lerp(W / 2 - 500, W / 2 + 560, sw);
          R.poly([x - 60, 150, x + 20, 150, x - 80, 650, x - 160, 650], { fill: 'rgba(255,255,255,0.75)', blend: 'source-atop' });
        }
      });
      // TOCCA A TE.
      const tk = seg(t, c.tocca - 0.02, c.tocca + 0.25);
      if (tk > 0) {
        R.text('TOCCA A TE', W / 2 - 34, 790, { font: 'unb900', size: 128, align: 'center', v: 'cap', fill: '#fff', tracking: -0.03,
          per: (i, n) => { const u = seg(t, c.tocca + i * 0.02, c.tocca + i * 0.02 + 0.22); return { s: lerp(1.7, 1, E.outExpo(u)), a: seg(t, c.tocca + i * 0.02, c.tocca + i * 0.02 + 0.04) }; } });
      }
      const cu = seg(t, c.tocca + 0.45, c.tocca + 0.8);
      if (cu > 0) {
        R.text('SCARICA myFITP', W / 2, 915, { font: 'unb900', size: 34, align: 'center', v: 'cap', fill: PAL.cyan, alpha: cu, tracking: 0.04, per: (i) => ({ y: (1 - E.outCubic(seg(t, c.tocca + 0.45 + i * 0.015, c.tocca + 0.75 + i * 0.015))) * 30 }) });
        R.text('esports.fitp.it', W / 2, 970, { font: 'mono800', size: 28, align: 'center', v: 'cap', fill: '#ffffff', alpha: cu * 0.9, tracking: 0.08 });
      }
    });
  }

  // la pallina: punto di «ANCHE TU.», poi rimbalza sui nodi, poi diventa il punto di «TOCCA A TE.»
  function theBall(R, t) {
    let x, y, r = 30, spin = [t * 8, t * 5, 0.3];
    if (t < c.drop) return;
    if (t < c.out0) {
      // cade e rimbalza fino al posto del punto
      const u = seg(t, c.drop, c.drop + 0.5);
      const land = seg(t, c.drop, c.drop + 0.22);
      x = c.periodX;
      const bounce = u < 0.44 ? lerp(-150, c.periodY, E.inQuad(land)) : c.periodY - Math.abs(Math.sin((u - 0.44) / 0.56 * Math.PI)) * 60 * (1 - u);
      y = bounce;
      r = 34;
    } else if (t < c.lock0) {
      const bp = ballPath(t);
      x = bp[0]; y = bp[1]; r = lerp(34, 30, seg(t, c.out0, beats[0]));
      const gone = E.inCubic(seg(t, c.lock0 - 0.1, c.lock0 + 0.25));
      x = lerp(x, W / 2, gone);
    } else if (t < c.tocca + 0.4) {
      // sale, attraversa il logo e cade nel punto finale
      const u = seg(t, c.lock0, c.tocca);
      const px = W / 2 - 34 + R.measure('TOCCA A TE', 'unb900', 128, -0.03) / 2 + 40, py = 790 + 24;
      if (t < c.tocca) { x = lerp(W / 2, px, E.inOutCubic(u)); y = lerp(NY - 60, py, u) - Math.sin(u * Math.PI) * 420; }
      else { const b = seg(t, c.tocca, c.tocca + 0.4); x = px; y = py - Math.abs(Math.sin(b * Math.PI)) * 50 * (1 - b); }
      r = lerp(30, 26, u);
    } else {
      x = W / 2 - 34 + R.measure('TOCCA A TE', 'unb900', 128, -0.03) / 2 + 40; y = 790 + 24; r = 26;
    }
    ballScreen(R, x, y, r, { spin, glow: 1 });
  }

  function draw(R, t) {
    bgNight(R, t, { c1: '#3b1f7a', c2: PAL.magenta, c3: '#1b2cff' });
    // raggi di linee di campo che ruotano lentamente dietro al messaggio
    R.hud(() => {
      const n = 28;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2 + t * 0.05;
        R.band(W / 2 + Math.cos(ang) * 260, H / 2 + Math.sin(ang) * 260, W / 2 + Math.cos(ang) * 1400, H / 2 + Math.sin(ang) * 1400, 2, { fill: i % 3 ? '#ffffff' : PAL.cyan, alpha: 0.05 });
      }
    });
    dust(R, t, [-1400, -900, -300, 1400, 900, 1500], 80, 21, { a: 0.5 });
    payoff(R, t);
    cta(R, t);
    lockup(R, t);
    // coriandoli di linee al rimbalzo della pallina su «TU.»
    const cf = t - c.drop - 0.22;
    if (cf > 0 && cf < 1.4) R.hud(() => {
      for (let i = 0; i < 60; i++) {
        const ang = hash(i * 3.1) * Math.PI * 2, sp = 300 + hash(i * 7.3) * 900;
        const x = c.periodX + Math.cos(ang) * sp * cf, y = c.periodY + Math.sin(ang) * sp * cf + 500 * cf * cf;
        const L = 16 + hash(i) * 22, rot = ang + cf * (hash(i * 5) - 0.5) * 20;
        R.band(x - Math.cos(rot) * L, y - Math.sin(rot) * L, x + Math.cos(rot) * L, y + Math.sin(rot) * L, 5, { fill: [PAL.ball, PAL.magenta, PAL.cyan, '#fff'][i % 4], alpha: 1 - cf / 1.4, glow: 0.5 });
      }
    });
    theBall(R, t);
  }

  function fx(t) {
    const f = {};
    if (t < c.t0 + 0.4) f.mb = 6;
    const d = c.drop + 0.22;
    if (t >= d && t < d + 0.3) { const u = (t - d) / 0.3; f.flash = ['#ffffff', 0.25 * (1 - u)]; f.ca = 0.008 * (1 - u); }
    for (const b of c.nodes) if (t >= b && t < b + 0.15) f.ca = Math.max(f.ca || 0, 0.003);
    if (t >= c.lock0 - 0.1 && t < c.lock0 + 0.5) f.mb = 6;
    if (t >= c.tocca && t < c.tocca + 0.35) { const u = (t - c.tocca) / 0.35; f.flash = ['#ffffff', 0.3 * (1 - u)]; f.ca = 0.01 * (1 - u); }
    return f;
  }

  return { draw, fx };
}
