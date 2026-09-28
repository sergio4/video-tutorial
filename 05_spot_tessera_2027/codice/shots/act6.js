// SCENE 11-12 · «Richiedi ora la tessera eSports FITP e vivi il gaming da vero protagonista.»
// Dal logo sulla maglia allo stesso logo sulla tessera fisica, che arretra fino al cartello finale;
// poi il super «Vivi il gaming da protagonista» sul keyvisual e il logo FITP.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, hash, rgba, mixc, TRS, T } from '../engine/math.js';
import { PAL } from '../engine/kit.js';
import { bgNight, dust, shake } from './common.js';

const CW = 340, CH = 226;
// posizione del logo eSports sull'arte della tessera (coordinate della carta, centro = 0)
const LOGO = [-95, -69];

export function act6(S, TL) {
  const s11 = S.s11, s12 = S.s12, t0 = s11.t0, t1 = s12.t1;
  const hero = t0 + 0.75;
  const sup = s12.t0 + 0.1;
  const logoIn = s12.t0 + 1.1;

  function cardPose(t) {
    // parte con il logo della tessera a tutto schermo, poi arretra fino alla posa da cartello
    const u = E.outExpo(seg(t, t0, hero));
    const sc = lerp(16, 2.7, u);
    const lx = lerp(-LOGO[0] * sc, 0, u), ly = lerp(-LOGO[1] * sc, -40, u);
    const idle = seg(t, hero - 0.2, hero + 0.4);
    const s12u = E.inOutCubic(seg(t, s12.t0 - 0.2, s12.t0 + 0.5));
    return TRS([lx, lerp(ly, -70, s12u), lerp(0, -40, s12u)], [deg(6 * Math.sin(t * 1.2)) * idle * (1 - s12u), deg(-12 + 10 * Math.sin(t * 0.9)) * idle * (1 - s12u * 0.8), deg(-2) * idle * (1 - s12u)], sc * lerp(1, 1.08, s12u));
  }

  function card(R, t) {
    R.push(cardPose(t));
    // cornici luminose sfalsate dietro alla carta (come nello storyboard)
    for (const [dx, dy, dz, c] of [[22, -16, 30, PAL.magenta], [-18, 14, 50, PAL.cyan]]) R.with(T(dx, dy, dz), () => R.rrect(-CW / 2 - 12, -CH / 2 - 12, CW + 24, CH + 24, 20, { stroke: c, lw: 1.8, glow: 1, alpha: seg(t, hero - 0.3, hero) }));
    R.rrect(-CW / 2, -CH / 2, CW, CH, 16, { fill: '#000', alpha: 0.4, blur: 26 });
    R.clipPoly(R.rrPts(-CW / 2, -CH / 2, CW, CH, 16));
    R.image(R.img.tessera, -CW / 2, -CH / 2, CW, CH, { sub: 8 });
    const dim = seg(t, s12.t0, s12.t0 + 0.4);
    if (dim > 0) R.rect(-CW / 2, -CH / 2, CW, CH, { fill: { lin: [0, -CH / 2, 0, CH / 2], stops: [[0, 'rgba(11,6,32,0.2)'], [1, 'rgba(11,6,32,0.75)']] }, alpha: dim });
    const sw = ((t - t0) * 0.55) % 1.6 - 0.3, sx = -CW / 2 + sw * CW * 1.4;
    R.poly([sx - 85, -CH / 2, sx - 34, -CH / 2, sx - 119, CH / 2, sx - 170, CH / 2], { fill: { lin: [sx - 170, 0, sx - 34, 0], stops: [[0, 'rgba(0,252,252,0)'], [0.5, 'rgba(255,255,255,0.5)'], [1, 'rgba(244,8,188,0)']] }, blend: 'screen' });
    R.unclip();
    R.rrect(-CW / 2, -CH / 2, CW, CH, 16, { stroke: { lin: [-CW / 2, -CH / 2, CW / 2, CH / 2], stops: [[0, PAL.cyan], [1, PAL.magenta]] }, lw: 2.4, glow: 0.9 });
    R.pop();
  }

  function superText(R, t) {
    const a = seg(t, sup, sup + 0.1);
    if (a <= 0) return;
    R.hud(() => {
      const lines = [['Vivi il gaming', 420, sup], ['da protagonista', 560, sup + 0.22]];
      for (const [s, y, ts] of lines) {
        R.text(s, W / 2, y, { font: 'unb900', size: 104, align: 'center', v: 'cap', fill: '#ffffff', tracking: -0.03, shadow: ['rgba(0,0,0,0.5)', 30, 0, 8],
          per: (i) => { const u = seg(t, ts + i * 0.018, ts + i * 0.018 + 0.28); return { y: (1 - E.outExpo(u)) * 70, a: seg(t, ts + i * 0.018, ts + i * 0.018 + 0.06) }; } });
      }
      // pennellata sotto «protagonista»
      const bw = R.measure('protagonista', 'unb900', 104, -0.03), bx0 = W / 2 - R.measure('da protagonista', 'unb900', 104, -0.03) / 2 + R.measure('da ', 'unb900', 104, -0.03);
      const u = E.inOutCubic(seg(t, sup + 0.45, sup + 0.85));
      if (u > 0) {
        const pts = [], pb = [];
        for (let i = 0; i <= 30; i++) {
          const f = (i / 30) * u, x = bx0 + f * bw, y = 630 + Math.sin(f * 3.2) * 6 - f * 8;
          const w = 16 * Math.sin(Math.PI * Math.min(1, (i / 30) * 1.05)) + 3;
          pts.push(x, y - w / 2); pb.unshift(x, y + w / 2);
        }
        R.poly(pts.concat(pb), { fill: { screenLin: [bx0, 0, bx0 + bw, 0], stops: [[0, PAL.cyan], [1, PAL.magenta]] }, glow: 0.8 });
      }
    });
  }

  function fitpLogo(R, t) {
    const k = E.outBack(seg(t, logoIn, logoIn + 0.35), 1.6);
    if (k <= 0) return;
    R.hud(() => {
      const w = 320 * k, h = 160 * k, x = W / 2, y = 962;
      R.rrect(x - w / 2, y - h / 2, w, h, 26 * k, { fill: '#ffffff', glow: 0.25 });
      const lw = w * 0.82, lh = lw * (689 / 1400);
      R.image(R.img.fitp, x - lw / 2, y - lh / 2, lw, lh, { sub: 1 });
    });
  }

  function draw(R, t) {
    const cam = new Cam();
    const sh = shake(t, [[hero, 6, 0.4], [sup, 4, 0.3]]);
    cam.look([0, -20, -1600], [0, -20, 0], 0, 1600);
    cam.cx += sh[0]; cam.cy += sh[1];
    R.setCam(cam);
    bgNight(R, t, { c1: '#3b1f7a', c2: PAL.magenta, c3: '#1b2cff' });
    // raggi di linee che ruotano dietro al cartello
    R.hud(() => {
      for (let i = 0; i < 28; i++) {
        const ang = (i / 28) * Math.PI * 2 + t * 0.05;
        R.band(W / 2 + Math.cos(ang) * 300, H / 2 + Math.sin(ang) * 300, W / 2 + Math.cos(ang) * 1400, H / 2 + Math.sin(ang) * 1400, 2, { fill: i % 3 ? '#ffffff' : PAL.cyan, alpha: 0.05 });
      }
    });
    dust(R, t, [-1400, -900, -300, 1400, 900, 1500], 80, 21, { a: 0.5 });
    card(R, t);
    superText(R, t);
    fitpLogo(R, t);
  }

  function fx(t) {
    const f = {};
    if (t < hero) f.mb = 8;
    if (t >= sup && t < sup + 0.3) f.mb = 5;
    if (t >= logoIn && t < logoIn + 0.25) { const u = (t - logoIn) / 0.25; f.flash = ['#ffffff', 0.15 * (1 - u)]; }
    return f;
  }

  return { t0, t1: t1 + 0.1, draw, fx };
}
