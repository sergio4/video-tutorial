// I · «Vivi il gaming da vero protagonista. Richiedi ora la tessera eSports FITP.»
// I vantaggi rientrano nella tessera (la tessera contiene tutto). La tessera va nel terzo sinistro; a destra il claim
// «Vivi il gaming da protagonista», poi la CTA «Richiedi ora la tessera eSports FITP»; loghi piccoli centrati in basso.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T } from '../engine/math.js';
import { PAL } from '../engine/kit.js';
import { bgNight, dust, shake } from './common.js';
import { card, CW, CH } from './card.js';
import { pass, tile, TILES, PASS_GRID } from './benefit.js';

export function finale(S, TL) {
  const sc = S.i, t0 = sc.t0, t1 = sc.t1;
  const col1 = t0 + 1.0;                 // fine del risucchio dei vantaggi
  const end0 = t0 + 1.0, end1 = t0 + 1.8; // la tessera va a sinistra
  const claim = t0 + 1.55, cta = t0 + 2.6, logos = t0 + 3.0;
  const CARD_C = { pos: [0, -95, 0], sc: 1.85 }, CARD_E = { pos: [-455, -30, 0], sc: 1.6 };

  function cardPose(t) {
    const a = E.outBack(seg(t, t0 + 0.45, col1), 1.3);
    const e = E.inOutCubic(seg(t, end0, end1));
    const idle = seg(t, col1, col1 + 0.5);
    const pos = CARD_C.pos.map((v, i) => lerp(v, CARD_E.pos[i], e));
    return TRS(pos, [deg(4 * Math.sin(t * 1.1)) * idle, deg(lerp(0, -10, e) + 6 * Math.sin(t * 0.8)) * idle, deg(lerp(0, -2, e))], lerp(0.3, 1, a) * lerp(CARD_C.sc, CARD_E.sc, e));
  }

  // i vantaggi volano dentro la tessera
  function collapse(R, t) {
    const u = seg(t, t0, col1);
    if (u >= 1) return;
    const v = E.inCubic(u);
    TILES.forEach((Tt, i) => {
      const k = E.inCubic(seg(t, t0 + i * 0.06, col1 - 0.1 + i * 0.03));
      if (k >= 1) return;
      R.with(TRS([lerp(Tt.pos[0], CARD_C.pos[0], k), lerp(Tt.pos[1], CARD_C.pos[1], k), 0], [0, 0, deg(k * 20)], lerp(1, 0.1, k)), () => tile(R, i, 1 - k * 0.6));
    });
    R.with(TRS([lerp(PASS_GRID.pos[0], CARD_C.pos[0], v), lerp(PASS_GRID.pos[1], CARD_C.pos[1], v), 0], [0, 0, 0], lerp(PASS_GRID.sc, 0.1, v)), () => pass(R, t, { alpha: 1 - v * 0.6 }));
  }

  function texts(R, t) {
    R.hud(() => {
      // cartello finale: CTA piccola, claim, pennellata
      const ea = seg(t, claim - 0.2, claim);
      if (ea > 0) {
        const x = 930;
        const cs = Math.min(92, (92 * (W - x - 70)) / R.measure('da protagonista', 'unb900', 92, -0.03)); // corpo del claim: sta sempre nel quadro
        const lines = [['Vivi il gaming', 420, claim], ['da protagonista', 540, claim + 0.18]];
        for (const [s, y, ts] of lines) R.text(s, x, y, { font: 'unb900', size: cs, v: 'cap', fill: '#ffffff', tracking: -0.03, shadow: ['rgba(0,0,0,0.5)', 26, 0, 8],
          per: (i) => { const u = seg(t, ts + i * 0.018, ts + i * 0.018 + 0.28); return { y: (1 - E.outExpo(u)) * 60, a: seg(t, ts + i * 0.018, ts + i * 0.018 + 0.06) }; } });
        const bx0 = x + R.measure('da ', 'unb900', cs, -0.03), bw = R.measure('protagonista', 'unb900', cs, -0.03);
        const u = E.inOutCubic(seg(t, claim + 0.45, claim + 0.85));
        if (u > 0) {
          const pts = [], pb = [];
          for (let i = 0; i <= 30; i++) {
            const f = (i / 30) * u, px = bx0 + f * bw, py = 606 + Math.sin(f * 3.2) * 5 - f * 7;
            const w = 14 * Math.sin(Math.PI * Math.min(1, (i / 30) * 1.05)) + 3;
            pts.push(px, py - w / 2); pb.unshift(px, py + w / 2);
          }
          R.poly(pts.concat(pb), { fill: { screenLin: [bx0, 0, bx0 + bw, 0], stops: [[0, PAL.cyan], [1, PAL.magenta]] }, glow: 0.7 });
        }
      }
      // CTA: richiedi ora la tessera, come un pulsante
      const pa = seg(t, cta, cta + 0.2);
      if (pa > 0) {
        const k = E.outBack(seg(t, cta, cta + 0.35), 1.6), x = 930;
        const txt = 'RICHIEDI ORA LA TESSERA eSPORTS FITP', w = R.measure(txt, 'unb900', 30, -0.01) + 84, y = 730;
        R.with([k, 0, 0, x, 0, k, 0, y, 0, 0, 1, 0], () => {
          R.rrect(0, -40, w, 80, 40, { fill: PAL.ball, alpha: pa, shadow: ['rgba(0,0,0,0.4)', 24, 0, 8] });
          R.rrect(0, -40, w, 80, 40, { stroke: PAL.ball, lw: 3, alpha: pa, glow: 0.6, glowOnly: true });
          R.text(txt, 42, 0, { font: 'unb900', size: 30, v: 'cap', fill: '#0b0624', alpha: pa, tracking: -0.01 });
        });
      }
      // loghi piccoli e centrati, senza fondi
      const la = seg(t, logos, logos + 0.35);
      if (la > 0) {
        const y = 975, eh = 74, ew = eh * (1278 / 717), fh = 66, fw = fh * (1400 / 689), gap = 46;
        const tot = ew + gap + fw, x0 = W / 2 - tot / 2;
        R.image(R.img.logo, x0, y - eh / 2, ew, eh, { sub: 1, alpha: la });
        R.band(x0 + ew + gap / 2, y - 30, x0 + ew + gap / 2, y + 30, 1.5, { fill: '#ffffff', alpha: la * 0.35 });
        R.image(R.img.fitp_neg, x0 + ew + gap, y - fh / 2, fw, fh, { sub: 1, alpha: la });
      }
    });
  }

  function draw(R, t) {
    const cam = new Cam();
    const sh = shake(t, [[col1, 8, 0.4]]);
    cam.look([0, -20, -1600], [0, -20, 0], 0, 1600);
    cam.cx += sh[0]; cam.cy += sh[1];
    R.setCam(cam);
    bgNight(R, t, { c1: '#3b1f7a', c2: PAL.magenta, c3: '#1b2cff' });
    // raggi lenti dietro alla tessera (solo nella fase centrale)
    const ra = seg(t, t0 + 0.4, col1) * (1 - seg(t, end0, end1));
    if (ra > 0) R.hud(() => {
      for (let i = 0; i < 24; i++) {
        const ang = (i / 24) * Math.PI * 2 + t * 0.06;
        R.band(W / 2 + Math.cos(ang) * 300, 465 + Math.sin(ang) * 300, W / 2 + Math.cos(ang) * 1400, 465 + Math.sin(ang) * 1400, 2, { fill: i % 3 ? '#ffffff' : PAL.cyan, alpha: 0.06 * ra });
      }
    });
    dust(R, t, [-1400, -900, -300, 1400, 900, 1500], 60, 21, { a: 0.4 });
    collapse(R, t);
    if (t >= t0 + 0.45) {
      R.push(cardPose(t));
      card(R, t, { flash: env(t, col1 - 0.1, col1, col1, col1 + 0.3) * 0.8 });
      R.pop();
    }
    texts(R, t);
  }

  function fx(t) {
    const f = {};
    if (t < col1) f.mb = 7;
    if (t >= end0 && t < end1) f.mb = 6;
    if (t >= col1 && t < col1 + 0.25) { const u = (t - col1) / 0.25; f.flash = ['#ffffff', 0.25 * (1 - u)]; }
    return f;
  }

  return { t0, t1: t1 + 0.1, draw, fx };
}
