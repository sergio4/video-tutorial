import { Renderer, W, H, FPS } from './engine/r.js';
import { Fonts } from './engine/text.js';
import { drawScene, fxAt } from './shots/index.js';
const FONTS = { unb900: 'fonts/unbounded-latin-900-normal.woff', unb700: 'fonts/unbounded-latin-700-normal.woff', unb600: 'fonts/unbounded-latin-600-normal.woff', unb400: 'fonts/unbounded-latin-400-normal.woff', mono800: 'fonts/jetbrains-mono-latin-800-normal.woff', mono700: 'fonts/jetbrains-mono-latin-700-normal.woff', mono500: 'fonts/jetbrains-mono-latin-500-normal.woff', bc900i: 'fonts/barlow-condensed-latin-900-italic.woff', bc800i: 'fonts/barlow-condensed-latin-800-italic.woff', bc700i: 'fonts/barlow-condensed-latin-700-italic.woff', rob400: 'fonts/roboto-latin-400-normal.woff', rob500: 'fonts/roboto-latin-500-normal.woff', rob700: 'fonts/roboto-latin-700-normal.woff', rob900: 'fonts/roboto-latin-900-normal.woff', rob700i: 'fonts/roboto-latin-700-italic.woff', rob900i: 'fonts/roboto-latin-900-italic.woff' };
const IMGS = { logo: 'media/esports_fitp.png', tessera: 'media/tessera_fronte.png', fitp: 'media/fitp_logo.png', mf_banner: 'media/mf_banner.png', mf_thumb: 'media/mf_thumb.png', mf_promo: 'media/mf_promo.png', mf_nav: 'media/mf_nav.png', mf_logo: 'media/mf_logo.png', mf_menu: 'media/mf_menu.png', tc_hero_lit: 'media/tc_hero_lit.png', tc_hero_glow: 'media/tc_hero_glow.png', tc_opp_lit: 'media/tc_opp_lit.png', tc_opp_glow: 'media/tc_opp_glow.png' };
const loadImg = (u) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = u; });
// la timeline elenca le scene con la loro durata: i tempi assoluti si calcolano qui, così basta cambiare le durate per adattarsi alla voce
function layout(TL) {
  let t = 0; const S = {};
  for (const s of TL.scenes) { S[s.id] = { ...s, t0: t, t1: t + s.dur }; t += s.dur; }
  TL.S = S; TL.dur = t; return TL;
}
async function init() {
  const q = new URLSearchParams(location.search);
  const TL = layout(await (await fetch(q.get('tl') || 'timeline.json', { cache: 'no-store' })).json());
  TL.guide = q.has('guide');
  const fonts = new Fonts();
  await Promise.all(Object.entries(FONTS).map(([k, u]) => fonts.load(k, u)));
  const imgs = {};
  await Promise.all(Object.entries(IMGS).map(async ([k, u]) => { imgs[k] = await loadImg(u); }));
  const canvas = document.getElementById('c');
  const R = new Renderer(canvas, fonts, imgs);
  const small = document.createElement('canvas');
  window.TL = TL; window.R = R;
  window.renderFrame = (t, opt = {}) => {
    const fx = fxAt(t, TL);
    const N = Math.max(1, opt.mb ?? fx.mb ?? 4);
    const shutter = 0.5 / FPS;
    for (let i = 0; i < N; i++) {
      const ts = N === 1 ? t : t + ((i + 0.5) / N - 0.5) * shutter;
      R.beginSub(); drawScene(R, ts, TL); R.accumulate(i);
    }
    R.compose({ ...fx, seed: Math.round(t * FPS) + 1 });
    return true;
  };
  window.grab = (type = 'image/jpeg', qq = 0.95, scale = 1) => {
    if (scale === 1) return canvas.toDataURL(type, qq);
    small.width = Math.round(W * scale); small.height = Math.round(H * scale);
    const c = small.getContext('2d'); c.imageSmoothingQuality = 'high'; c.drawImage(canvas, 0, 0, small.width, small.height);
    return small.toDataURL(type, qq);
  };
  window.ready = true;
}
init().catch((e) => { window.initError = String((e && e.stack) || e); console.error(e); });
