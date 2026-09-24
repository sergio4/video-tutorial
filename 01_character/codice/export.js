// Rasterizza una stringa SVG su un canvas delle dimensioni indicate.
async function rasterize(svg, w, h) {
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const img = new Image();
  img.width = w; img.height = h;
  img.src = url;
  await img.decode();
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  cv.getContext('2d').drawImage(img, 0, 0, w, h);
  return cv;
}
// Rasterizza una stringa SVG in PNG e la salva su disco tramite server.py (POST /save).
export async function saveSVG(svg, path, w, h) {
  const cv = await rasterize(svg, w, h);
  const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
  const res = await fetch('/save?path=' + encodeURIComponent(path), { method: 'POST', body: blob });
  if (!res.ok) throw new Error('salvataggio fallito: ' + path);
}
export const wrap = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;

// Interfaccia letta da render.py: ogni pagina animata la espone con le sue misure e la funzione frame(t).
export function expose({ W, H, FPS, N, frame }) {
  Object.assign(window, {
    __W: W, __H: H, __FPS: FPS, __N: N,
    __framePNG: async i => (await rasterize(frame(i / FPS), W, H)).toDataURL('image/png'),
  });
}
