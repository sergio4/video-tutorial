// Punto d'ingresso: carica font, immagini e timeline, espone renderFrame(t) al driver.
import { Renderer, W, H, FPS } from './engine/r.js';
import { Fonts } from './engine/text.js';
import { drawScene, fxAt } from './shots/index.js';

const FONTS = {
  unb900: 'fonts/unbounded-latin-900-normal.woff',
  unb700: 'fonts/unbounded-latin-700-normal.woff',
  unb600: 'fonts/unbounded-latin-600-normal.woff',
  unb400: 'fonts/unbounded-latin-400-normal.woff',
  mono800: 'fonts/jetbrains-mono-latin-800-normal.woff',
  mono700: 'fonts/jetbrains-mono-latin-700-normal.woff',
  mono500: 'fonts/jetbrains-mono-latin-500-normal.woff',
  bc900i: 'fonts/barlow-condensed-latin-900-italic.woff',
  bc800i: 'fonts/barlow-condensed-latin-800-italic.woff',
  bc700i: 'fonts/barlow-condensed-latin-700-italic.woff',
};
const IMGS = { logo: 'media/esports_fitp.png', tessera: 'media/tessera_fronte.png' };

const loadImg = (u) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = u; });

async function init() {
  const q = new URLSearchParams(location.search);
  const TL = await (await fetch(q.get('tl') || 'timeline_45.json', { cache: 'no-store' })).json();
  const fonts = new Fonts();
  await Promise.all(Object.entries(FONTS).map(([k, u]) => fonts.load(k, u)));
  const imgs = {};
  await Promise.all(Object.entries(IMGS).map(async ([k, u]) => { imgs[k] = await loadImg(u); }));
  const canvas = document.getElementById('c');
  canvas.width = W; canvas.height = H;
  const R = new Renderer(canvas, fonts, imgs);
  const small = document.createElement('canvas');

  window.TL = TL;
  window.R = R;
  window.duration = () => TL.dur;
  // disegna il fotogramma al tempo t (secondi) con motion blur a sottofotogrammi
  window.renderFrame = (t, opt = {}) => {
    const fx = fxAt(t, TL);
    const N = Math.max(1, opt.mb ?? fx.mb ?? 4);
    const shutter = (opt.shutter ?? fx.shutter ?? 0.5) / FPS;
    for (let i = 0; i < N; i++) {
      const ts = N === 1 ? t : t + ((i + 0.5) / N - 0.5) * shutter;
      R.beginSub();
      drawScene(R, ts, TL);
      R.accumulate(i);
    }
    R.compose({ ...fx, seed: Math.round(t * FPS) + 1, ...(opt.fx || {}) });
    return true;
  };
  window.grab = (type = 'image/jpeg', q = 0.95, scale = 1) => {
    if (scale === 1) return canvas.toDataURL(type, q);
    small.width = Math.round(W * scale); small.height = Math.round(H * scale);
    const c = small.getContext('2d');
    c.imageSmoothingQuality = 'high';
    c.drawImage(canvas, 0, 0, small.width, small.height);
    return small.toDataURL(type, q);
  };
  // anteprima nel browser: ?play oppure ?t=12.3
  if (q.has('t')) window.renderFrame(parseFloat(q.get('t')));
  if (q.has('play')) {
    const t0 = performance.now();
    const loop = () => { const t = ((performance.now() - t0) / 1000) % TL.dur; window.renderFrame(t, { mb: 1 }); requestAnimationFrame(loop); };
    loop();
  }
  window.ready = true;
}

init().catch((e) => { window.initError = String(e && e.stack || e); console.error(e); });
