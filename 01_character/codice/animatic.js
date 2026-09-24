// Animatic v2 del video «Tocca a te»: 52 s, master verticale 1080x1920, 25 fps.
// Segue lo storyboard del treatment (sezione 3). Tutto disegnato in codice e in stile cartoon:
// myFITP ridisegnato dalle registrazioni reali (myfitp.js), SuperTennis Arena cartoon (arena.js),
// tessera e loghi dai file reali (assets.js).
import { ciuffo, shadow, paperBG, C } from './ciuffo.js';
import { A } from './assets.js';
import * as M from './myfitp.js';
import { arena, net, rival, hud, ball as tBall, courtPt } from './arena.js';

export const W = 1080, H = 1920, FPS = 25, DUR = 52;

// ---------- utilità ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, u) => a + (b - a) * u;
const span = (t, a, b) => clamp((t - a) / (b - a));
const ease = u => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
const easeIn = u => u * u * u;
const easeOut = u => 1 - Math.pow(1 - u, 3);
const back = u => { const s = 1.7; return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); };
const on2 = t => Math.floor(t * FPS / 2) * 2 / FPS; // personaggio a passo due (12,5 pose al secondo)
const f = n => (Math.round(n * 10) / 10).toString();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const arc = (p0, p1, h, u) => [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) - h * 4 * u * (1 - u)];
// interpola due pose (numeri e coppie di angoli); vista ed espressione passano a metà
function mix(p, q, u) {
  const o = { ...(u < 0.5 ? p : q) };
  for (const k of Object.keys(q)) {
    if (typeof p[k] === 'number' && typeof q[k] === 'number') o[k] = lerp(p[k], q[k], u);
    else if (Array.isArray(p[k]) && Array.isArray(q[k])) o[k] = p[k].map((v, i) => lerp(v, q[k][i], u));
  }
  return o;
}

// Unbounded (OFL) al posto del Glancyr, incorporato nell'SVG
const FONT = "Unbounded, 'Arial Black', 'Liberation Sans', Arial, sans-serif";
function text(x, y, s, size, fill, o = {}) {
  const { anchor = 'middle', weight = 900, op = 1, ls = 0, font = FONT } = o;
  return `<text x="${f(x)}" y="${f(y)}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" ` +
    `text-anchor="${anchor}" letter-spacing="${ls}" opacity="${f(op * 100) / 100}">${esc(s)}</text>`;
}
const g = (inner, tr = '', op = 1) => `<g${tr ? ` transform="${tr}"` : ''}${op < 1 ? ` opacity="${f(op * 100) / 100}"` : ''}>${inner}</g>`;
// camera: porta il punto (cx, cy) del mondo al centro dell'inquadratura con zoom s
// con zoom >= 1 il centro viene limitato perché l'inquadratura non esca dal mondo
function cam(inner, cx = W / 2, cy = H / 2, s = 1) {
  if (s >= 1) { cx = clamp(cx, W / 2 / s, W - W / 2 / s); cy = clamp(cy, H / 2 / s, H - H / 2 / s); }
  if (s === 1 && cx === W / 2 && cy === H / 2) return inner;
  return g(inner, `translate(${W / 2} ${H / 2}) scale(${f(s * 1000) / 1000}) translate(${f(-cx)} ${f(-cy)})`);
}
// schermata myFITP (unità app, larghezza 400) posizionata nel mondo
const app = (inner, x, y, w) => g(inner, `translate(${f(x)} ${f(y)}) scale(${f(w / M.UW * 10000) / 10000})`);
const appPt = (x, y, w) => ([ax, ay]) => [x + ax * w / M.UW, y + ay * w / M.UW];

const CLAY = '#C65A2E';
const defs = () => `<defs>
<style>@font-face{font-family:'Unbounded';font-weight:900;src:url(${A.font}) format('woff2');}</style>
<radialGradient id="vg" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="#4A2A8A"/><stop offset="0.6" stop-color="#311A60"/><stop offset="1" stop-color="#1C0F3A"/></radialGradient>
<radialGradient id="phoneLight" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.pink}" stop-opacity="0.35"/><stop offset="0.5" stop-color="${C.cyan}" stop-opacity="0.12"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>
<radialGradient id="tunnelLight" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="#FFE9C6" stop-opacity="0.85"/><stop offset="1" stop-color="#FFE9C6" stop-opacity="0"/></radialGradient>
<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${C.cyan}" flood-opacity="0.9"/><feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="${C.pink}" flood-opacity="0.45"/></filter>
<filter id="neon" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="toWhite"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>
</defs>`;

// ---------- elementi ----------
function ball(x, y, r = 18, color = C.pink) {
  return `<g filter="url(#neon)"><circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${color}"/><circle cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.3)}" r="${f(r * 0.35)}" fill="#fff" opacity="0.8"/></g>`;
}
function trail(path, t, n = 7, dt = 0.03, r = 18) {
  let s = '';
  for (let i = n; i >= 1; i--) {
    const p = path(t - i * dt);
    if (p) s += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r * (1 - i / (n + 2)))}" fill="${C.pink}" opacity="${f((1 - i / (n + 1)) * 40) / 100}"/>`;
  }
  const p = path(t);
  return s + (p ? ball(p[0], p[1], r) : '');
}
function tessera(cx, cy, w, flip, o = {}) {
  // flip: 0 = fronte (grafica reale), 1 = retro (cartoon: circuito e logo); si stringe a metà per girarsi
  const h = w * 0.663, sx = Math.abs(Math.cos(Math.PI * flip));
  const glow = o.glow || 0;
  let face;
  if (flip <= 0.5) {
    face = `<image href="${A.tessera}" x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}"/>`;
  } else {
    let traces = '';
    for (let i = 0; i < 6; i++) {
      const yy = -h / 2 + h * (i + 1) / 7;
      traces += `<path d="M${f(-w / 2 + 20)} ${f(yy)} L${f(-w / 6 + i * 10)} ${f(yy)} L${f(-w / 12 + i * 10)} ${f(yy + 14)} L${f(w / 2 - 20)} ${f(yy + 14)}" fill="none" stroke="${C.cyan}" stroke-width="3" opacity="${f((0.3 + 0.7 * glow) * 100) / 100}"/>` +
        `<circle cx="${f(w / 2 - 20)}" cy="${f(yy + 14)}" r="5" fill="${C.cyan}" opacity="${f((0.3 + 0.7 * glow) * 100) / 100}"/>`;
    }
    face = `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="22" fill="#123C9C"/>` + traces +
      `<image href="${A.esports}" x="${f(-w * 0.22)}" y="${f(-h * 0.3)}" width="${f(w * 0.44)}" height="${f(h * 0.6)}" opacity="${f((0.5 + 0.5 * glow) * 100) / 100}"/>`;
  }
  const stroke = `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="22" fill="none" stroke="${C.ink}" stroke-width="5"/>`;
  const halo = glow > 0 ? `<rect x="${f(-w / 2 - 10)}" y="${f(-h / 2 - 10)}" width="${f(w + 20)}" height="${f(h + 20)}" rx="30" fill="none" stroke="${C.cyan}" stroke-width="6" opacity="${f(glow * 80) / 100}" filter="url(#neon)"/>` : '';
  return g(halo + face + stroke, `translate(${f(cx)} ${f(cy)}) rotate(${f(o.rot || 0)}) scale(${f(Math.max(sx, 0.02) * 1000) / 1000} 1)`);
}
function tag(x, y, rot = 0, s = 1) {
  return g(`<path d="M-40 -26 L30 -26 L50 0 L30 26 L-40 26 Z" fill="#FFD84A" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>` +
    `<circle cx="30" cy="0" r="7" fill="none" stroke="${C.ink}" stroke-width="4"/>` + text(-8, 7, 'TC ID', 17, C.ink),
    `translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s * 100) / 100})`);
}
function clock(cx, cy, r, t, op) {
  const a1 = t * 2400, a2 = t * 200;
  const hand = (a, l, w) => `<path d="M${cx} ${cy} L${f(cx + Math.sin(a * Math.PI / 180) * l)} ${f(cy - Math.cos(a * Math.PI / 180) * l)}" stroke="${C.ink}" stroke-width="${w}" stroke-linecap="round"/>`;
  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    ticks += `<path d="M${f(cx + Math.sin(a) * r * 0.82)} ${f(cy - Math.cos(a) * r * 0.82)} L${f(cx + Math.sin(a) * r * 0.94)} ${f(cy - Math.cos(a) * r * 0.94)}" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`;
  }
  return g(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.paper}" stroke="${C.ink}" stroke-width="8"/>` + ticks + hand(a2, r * 0.5, 12) + hand(a1, r * 0.78, 7) +
    `<circle cx="${cx}" cy="${cy}" r="10" fill="${C.ink}"/>`, '', op);
}
const ripple = (x, y, u, col = '#fff') => u > 0 && u < 1 ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(24 + 130 * u)}" fill="none" stroke="${col}" stroke-width="6" opacity="${f((1 - u) * 100) / 100}"/>` : '';

// ---------- mondi ----------
const G_OUT = 1560, SC_OUT = 0.8;   // circolo: linea di terra e scala del personaggio
const G_IN = 1700, SC_IN = 0.72;    // mondo eSports
const BENCH_X = 180, BENCH_W = 560, SEAT_Y = G_OUT - 117 * SC_OUT;
const CX_SEAT = 360;                 // x del personaggio seduto
// telefono in mano da seduto: posizione del centro dello schermo (coordinate mondo)
const PHONE = { x: CX_SEAT + 150 * SC_OUT, y: G_OUT - 300 * SC_OUT, sw: 37.1, sh: 66 };
const ZOOM_PHONE = H / PHONE.sh; // zoom a cui lo schermo del telefono riempie l'inquadratura
const FRAME_OUT = { cx: 540, cy: 1110, s: 1.2 }; // inquadratura della panchina, uguale in apertura e chiusura (anello)

function fuori(t, o = {}) {
  let s = paperBG(W, H, 1180);
  let hedge = `M0 1180`;
  for (let x = 0; x <= W; x += 60) hedge += ` Q${x + 30} ${1150 + (x % 120 ? 6 : -4)} ${x + 60} 1180`;
  s += `<path d="${hedge} L${W} 1260 L0 1260 Z" fill="#7C8F63" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>`;
  s += `<rect x="0" y="1260" width="${W}" height="${H - 1260}" fill="${CLAY}"/>`;
  s += `<path d="M0 1262 L${W} 1262" stroke="${C.ink}" stroke-width="5"/>`;
  s += `<path d="M-40 1330 L${W + 40} 1330 M720 1330 L1080 1700 M300 1330 L-80 1760" stroke="#F6EFE4" stroke-width="10" opacity="0.9" fill="none"/>`;
  for (let i = 0; i < 120; i++) {
    const x = (i * 397) % W, y = 1270 + (i * 211) % (H - 1270);
    s += `<circle cx="${x}" cy="${y}" r="${1.5 + (i % 3)}" fill="${C.ink}" opacity="0.08"/>`;
  }
  const bx = BENCH_X, bw = BENCH_W, sy = SEAT_Y;
  s += `<rect x="${bx + 30}" y="${sy}" width="16" height="${G_OUT - sy + 10}" fill="#8A5A3B" stroke="${C.ink}" stroke-width="5"/>`;
  s += `<rect x="${bx + bw - 46}" y="${sy}" width="16" height="${G_OUT - sy + 10}" fill="#8A5A3B" stroke="${C.ink}" stroke-width="5"/>`;
  s += `<rect x="${bx}" y="${sy - 10}" width="${bw}" height="34" rx="6" fill="#B07A4F" stroke="${C.ink}" stroke-width="5"/>`;
  // tacche di gesso sul bordo della panchina (le amichevoli fatte)
  const n = o.tallies ?? 3;
  for (let i = 0; i < Math.min(n, 4); i++) {
    const k = i === 3 ? (o.tally4 ?? 1) : 1;
    const x = bx + bw - 180 + i * 26;
    s += `<path d="M${x} ${sy + 18} L${x + 6} ${f(sy + 18 - 22 * k)}" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>`;
  }
  if (o.glow) s += `<ellipse cx="${PHONE.x}" cy="${PHONE.y}" rx="${f(700 * o.glow)}" ry="${f(700 * o.glow)}" fill="url(#phoneLight)"/>`;
  return s;
}
function dentro(t, o = {}) {
  const drift = t * 18;
  let s = `<rect width="${W}" height="${H}" fill="url(#vg)"/>`;
  const lines = o.lines ?? 2;
  const L = [[C.cyan, -200, 1500, 1300, 200], [C.pink, 0, 1950, 1400, 700], [C.cyan, -300, 900, 1200, -300], [C.pink, 200, 2100, 1500, 1100]];
  for (let i = 0; i < lines; i++) {
    const [c, x1, y1, x2, y2] = L[i];
    s += `<path d="M${x1} ${f(y1 - drift % 200)} L${x2} ${f(y2 - drift % 200)}" stroke="${c}" stroke-width="3" opacity="0.45"/>`;
  }
  for (const [cx, cy, r] of [[150, 400, 70], [930, 520, 100], [820, 1350, 60], [240, 1250, 80], [600, 180, 50]])
    s += `<circle cx="${cx}" cy="${f(cy - drift * 0.5)}" r="${r}" fill="${C.pink}" opacity="0.08"/>`;
  s += `<path d="M0 ${G_IN} L${W} ${G_IN}" stroke="${C.cyan}" stroke-width="3" opacity="0.55"/>`;
  return s;
}

// ---------- personaggio ----------
const SEAT = { view: 'side', legA: [88, -88], legB: [94, -94], armA: [24, 74], armB: [30, 80], lean: 3, hair: 0 };
const STAND = { view: 'front', legA: [-3, 0], legB: [3, 0], armA: [-8, -4], armB: [8, 4], lean: 0 };
function walk(t, o = {}) {
  const ph = 2 * Math.PI * 1.25 * t, s = Math.sin(ph), c = Math.cos(ph);
  return { view: 'side', lean: 5, legA: [-26 * s, -40 * Math.max(0, -c)], legB: [26 * s, -40 * Math.max(0, c)],
    armA: [24 * s, 18], armB: [-24 * s, 18], hair: -6 - 5 * Math.sin(2 * ph), ...o };
}
function run(t, o = {}) {
  const ph = 2 * Math.PI * 2.4 * t, s = Math.sin(ph), c = Math.cos(ph);
  return { view: 'side', lean: 14, legA: [-48 * s, -80 * Math.max(0, -c)], legB: [48 * s, -80 * Math.max(0, c)],
    armA: [50 * s, 70], armB: [-50 * s, 70], hair: -16, ...o };
}
function hero(p, x, ground, sc, dark) {
  const ch = ciuffo({ ...p, x, y: ground, scale: sc });
  return shadow(x, ground, p.lift || 0, sc) + (dark ? `<g filter="url(#glow)">${ch}</g>` : ch);
}
function phone(x, y, rot = 0, screen = '') {
  const w = 46, h = 84;
  return g(`<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="${C.ink}"/>` +
    (screen || `<rect x="${-PHONE.sw / 2}" y="${-PHONE.sh / 2}" width="${PHONE.sw}" height="${PHONE.sh}" rx="3" fill="${C.cyan}" opacity="0.85"/>`),
    `translate(${f(x)} ${f(y)}) rotate(${f(rot)})`);
}
// contenuto dello schermo del telefono: un intero fotogramma W x H ridotto alla misura dello schermo
const inScreen = inner => `<svg x="${-PHONE.sw / 2}" y="${-PHONE.sh / 2}" width="${PHONE.sw}" height="${PHONE.sh}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><rect width="${W}" height="${H}" fill="#000"/>${inner}</svg>`;
function seatedScene(t, p, o = {}) {
  const screen = o.screen ? inScreen(o.screen) : '';
  return fuori(t, o) + hero({ ...SEAT, ...p }, CX_SEAT, G_OUT, SC_OUT, false) + phone(PHONE.x, PHONE.y, o.phoneRot || 0, screen);
}
// schermata «VITTORIA» a pieno fotogramma (per il telefono)
const APP_FULL_H = H * M.UW / W;
const vittoriaFull = () => app(M.vittoria(APP_FULL_H), 0, 0, W);

// ---------- Scena 01 · Discovery · 0-5 s ----------
const ballS1 = t => {
  if (t < 1.6 || t > 3.6) return null;
  const P0 = [PHONE.x, PHONE.y], B1 = [760, G_OUT + 90], B2 = [930, G_OUT + 120];
  if (t < 2.2) return arc(P0, B1, 260, span(t, 1.6, 2.2));
  if (t < 2.8) return arc(B1, B2, 200, span(t, 2.2, 2.8));
  return arc(B2, P0, 320, span(t, 2.8, 3.6));
};
const dentroMini = t => dentro(t) + ball(W / 2, 700, 60);
function s01(t) {
  const tp = on2(t);
  let expr = 'annoiato', tilt = 0;
  if (tp > 1.1 && tp < 1.2) expr = 'blink';
  if (tp >= 1.8) { expr = 'incuriosito'; tilt = tp < 3.6 ? 6 : 0; }
  if (tp >= 3.6) expr = 'furbo';
  const scene = seatedScene(t, { expr, tilt, hair: tp > 1.8 ? 4 : -4 }, { screen: t > 3.9 ? dentroMini(t) : '' });
  const u = easeIn(span(t, 4.0, 5.0));
  const s = Math.exp(lerp(Math.log(FRAME_OUT.s), Math.log(ZOOM_PHONE), u));
  const cx = lerp(FRAME_OUT.cx, PHONE.x, clamp(u * 3)), cy = lerp(FRAME_OUT.cy, PHONE.y, clamp(u * 3));
  return cam(scene + trail(ballS1, t), cx, cy, s);
}

// ---------- Scena 02 · Entra in myFITP · 5-12 s ----------
const S2 = { x: 90, y: 150, w: 900, h: 1000 };
const S2H = S2.h * M.UW / S2.w;
const s2pt = appPt(S2.x, S2.y, S2.w);
const AVATAR = s2pt([24, 36]);
function s02(t) {
  const tp = on2(t);
  let p, x = 540;
  if (tp < 5.6) { const u = span(tp, 5.0, 5.6); p = { ...STAND, expr: 'sorpreso', planted: false, lift: 1300 * (1 - u) * (1 - u), armA: [-150, -10], armB: [150, 10], legA: [-20, 20], legB: [20, -20], hair: 20 }; }
  else if (tp < 6.0) { const u = span(tp, 5.6, 6.0); p = { ...STAND, expr: 'sorpreso', squash: 0.82 + 0.18 * u, legA: [-18, 34 * (1 - u)], legB: [18, -34 * (1 - u)], armA: [-60, -20], armB: [60, 20] }; }
  else if (tp < 8.0) p = { ...STAND, expr: tp < 7 ? 'incuriosito' : 'determinato', tilt: tp < 7 ? 5 : 0 };
  else if (tp < 8.4) p = { ...STAND, view: 'q', expr: 'determinato', armB: [-150, 30] };     // mano allo zaino
  else if (tp < 9.2) { const u = ease(span(tp, 8.4, 8.8)); p = { ...STAND, view: 'q', expr: 'determinato', armB: [lerp(-150, 150, u), lerp(30, 10, u)] }; }
  else if (tp < 10.6) p = { ...STAND, expr: tp > 9.8 ? 'furbo' : 'determinato', tilt: tp > 9.8 ? 6 : 0 };
  else p = { ...STAND, expr: 'incuriosito', tilt: -4 };
  if (tp >= 7.0 && tp < 7.5) { const u = span(tp, 7.0, 7.5); p = { ...p, planted: false, lift: 90 * Math.sin(Math.PI * u), legA: [-12, 20], legB: [12, -20] }; }

  // schermata: splash FITP che si apre come una porta scorrevole sulla home
  const glow = span(t, 6.3, 6.6) * (1 - span(t, 7.2, 8.0));
  const doors = easeOut(span(t, 7.0, 7.6));
  let inner = M.home(S2H, { glow });
  if (doors < 1) {
    const d = doors * M.UW / 2;
    inner += `<clipPath id="doorL"><rect x="0" y="0" width="200" height="${f(S2H)}"/></clipPath><clipPath id="doorR"><rect x="200" y="0" width="200" height="${f(S2H)}"/></clipPath>` +
      `<g transform="translate(${f(-d)} 0)"><g clip-path="url(#doorL)">${M.splash(S2H)}</g></g><g transform="translate(${f(d)} 0)"><g clip-path="url(#doorR)">${M.splash(S2H)}</g></g>`;
  }
  const ui = app(M.screen('s2', S2H, inner), S2.x, S2.y, S2.w);
  // cartellino Tennis Clash lanciato sull'avatar del profilo
  let tg = '';
  if (t >= 8.8 && t < 9.4) { const u = span(t, 8.8, 9.4); const q = arc([700, 1250], AVATAR, 300, easeOut(u)); tg = tag(q[0] + 50, q[1] + 36, 720 * u, 1.1); }
  else if (t >= 9.4) { const u = span(t, 9.4, 9.8); tg = tag(AVATAR[0] + 50, AVATAR[1] + 36, -12, 1.1 * (1 + 0.25 * Math.sin(Math.PI * u))); if (u < 1) tg += `<circle cx="${f(AVATAR[0] + 50)}" cy="${f(AVATAR[1] + 36)}" r="${f(40 + 80 * u)}" fill="none" stroke="${C.cyan}" stroke-width="6" opacity="${f((1 - u) * 100) / 100}"/>`; }
  // pallina guida: entra nel logo myFITP, poi a fine scena rimbalza fuori verso l'alto (T2)
  const logo = s2pt([200, 38]);
  const ballP = tt => {
    if (tt >= 5.9 && tt < 6.4) return arc([900, 1300], logo, 400, span(tt, 5.9, 6.4));
    if (tt >= 11.0 && tt < 12.0) return arc(AVATAR, [620, -300], 250, span(tt, 11.0, 12.0));
    return null;
  };
  const pan = easeIn(span(t, 11.3, 12.0)) * 900;
  return g(dentro(t) + ui + hero(p, x, G_IN, SC_IN, true) + tg, `translate(0 ${f(pan)})`) + trail(ballP, t);
}

// ---------- Scena 03 · Tesserati · 12-19 s ----------
function s03(t) {
  const tp = on2(t);
  const catchT = 13.6;
  let p = { ...STAND, expr: 'incuriosito', tilt: -6 };
  if (tp >= 12.8 && tp < catchT) p = { ...STAND, expr: 'determinato', armA: [-160, 0], armB: [160, 0] };
  if (tp >= catchT && tp < 15.0) { const u = span(tp, catchT, catchT + 0.3); p = { ...STAND, expr: 'incuriosito', squash: 1 - 0.08 * Math.sin(Math.PI * u), armA: [-40, -100], armB: [40, 100] }; }
  // gag: imita il rovescio del tennista dipinto sulla tessera, poi scrolla le spalle
  if (tp >= 15.0 && tp < 16.0) { const u = ease(span(tp, 15.0, 15.8)); p = { ...STAND, view: 'side', expr: 'determinato', lean: 8, armB: [lerp(-120, 70, u), -20], armA: [lerp(-60, 30, u), 20], legA: [-14, 0], legB: [14, 0], handB: 'fist' }; }
  if (tp >= 16.0 && tp < 16.7) p = { ...STAND, expr: 'neutro', tilt: 8, armA: [-50, -60], armB: [50, 60] };
  if (tp >= 16.7) p = { ...STAND, expr: tp > 17.2 ? 'sorpreso' : 'incuriosito', armA: [-40, -100], armB: [40, 100] };

  const held = [540, G_IN - 400 * SC_IN];
  let cx, cy, flip, w = 320, rot = 0;
  if (t < catchT) { const u = span(t, 12.0, catchT); cx = 540 + 80 * Math.sin(u * 5); cy = lerp(-250, G_IN - 560 * SC_IN, easeOut(u)); flip = 3 * (1 - u); rot = 20 * (1 - u); }
  else if (t < 15.0) { const u = easeOut(span(t, catchT, 14.1)); cx = 540; cy = lerp(G_IN - 560 * SC_IN, held[1], u); flip = 0; }
  else if (t < 16.7) { cx = 270; cy = held[1] - 170 + 10 * Math.sin(t * 4); flip = 0; w = 300; }
  else { const u = ease(span(t, 16.7, 17.3)); cx = lerp(270, 540, u); cy = lerp(held[1] - 170, held[1] - 60, u); flip = ease(span(t, 16.9, 17.5)); w = lerp(300, 360, u); }
  const cardGlow = span(t, 17.4, 17.8);
  // T3: le piste del circuito escono dalla carta e corrono fino all'icona eSports della barra myFITP
  let circuit = '', navSVG = '';
  const u3 = span(t, 17.9, 18.8), navIn = easeOut(span(t, 17.9, 18.3));
  const navW = 960, navX = 60, navY = H - 150 + (1 - navIn) * 200;
  const iconP = appPt(navX, navY, navW)([200, 27]);
  if (u3 > 0) {
    for (const [dx, col] of [[-60, C.cyan], [0, C.pink], [60, C.cyan]]) {
      const path = `M${540 + dx} ${f(cy + 120)} L${540 + dx} ${f(cy + 250)} L${540 + dx * 3} ${f(cy + 330)} L${540 + dx * 3} ${f(iconP[1] - 120)} L${f(iconP[0])} ${f(iconP[1])}`;
      circuit += `<path d="${path}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f((1 - u3) * 100) / 100}" filter="url(#neon)"/>`;
    }
  }
  if (navIn > 0) {
    navSVG = app(`<clipPath id="navClip"><rect width="400" height="56" rx="14"/></clipPath><g clip-path="url(#navClip)">${M.nav(0)}</g>`, navX, navY, navW);
    if (u3 >= 1) navSVG += `<circle cx="${f(iconP[0] + 7)}" cy="${f(iconP[1])}" r="${f(40 + 30 * span(t, 18.8, 19))}" fill="none" stroke="${C.cyan}" stroke-width="6" filter="url(#neon)"/>`;
  }
  const zoom = lerp(1, 1.45, ease(span(t, 13.8, 14.6))) - 0.45 * ease(span(t, 14.8, 15.3));
  const card = tessera(cx, cy, w, flip, { rot, glow: cardGlow });
  const intro = (1 - easeOut(span(t, 12.0, 12.6))) * -900; // continua il movimento verso l'alto della T2
  return g(cam(dentro(t, { lines: 4 }) + hero(p, 540, G_IN, SC_IN, true) + card, 540, held[1] + (H / 2 - held[1]) / zoom, zoom) + circuit + navSVG, `translate(0 ${f(intro)})`);
}

// ---------- Scena 04 · Scegli il torneo · 19-25 s ----------
const S4 = { x: 60, y: 130, w: 960, h: 1180 };
const S4H = S4.h * M.UW / S4.w;
const S5 = { x: 60, y: 110, w: 960, h: 1400 };
const S5H = S5.h * M.UW / S5.w;
const PICK = 10;                                  // 11a card della lista: TOURNEYS[10 % 6] = FITP eSeries by BMW
const PICK_Y = 232;                               // dove si ferma la card scelta (unità app)
const SCROLL_END = M.CARD_Y0 + PICK * M.CARD_STEP - PICK_Y;
function s04(t) {
  const tp = on2(t);
  const stopAt = 22.6, chosen = t >= 23.4;
  const u4 = clamp((t - 19) / (stopAt - 19));
  const scroll = SCROLL_END * (1 - (1 - u4) * (1 - u4)); // nastro che rallenta fino a fermarsi
  const hlAmt = span(t, 22.4, 22.8);
  const ui = app(M.screen('s4', S4H, M.list(S4H, scroll, { skip: chosen ? PICK : -1, hl: PICK, hlAmt })), S4.x, S4.y, S4.w);
  // card scelta sfilata dalla lista; T4: si allarga e diventa la scheda torneo
  let picked = '';
  if (chosen) {
    const k = S4.w / M.UW;
    const y0 = S4.y + (M.CARD_Y0 + PICK * M.CARD_STEP - scroll) * k;
    const u = back(span(t, 23.4, 23.9)), g4 = ease(span(t, 24.2, 25.0));
    const badge = 1 + 0.6 * Math.sin(Math.PI * span(t, 23.6, 24.4));
    const cardSVG = M.card(0, 0, M.UW - 24, M.TOURNEYS[PICK % M.TOURNEYS.length], { badge });
    const cx = S4.x + 12 * k + 24 * u, cy = y0 - 30 * u;
    picked = g(`<rect x="8" y="12" width="${M.UW - 24}" height="100" rx="10" fill="#000" opacity="0.3"/>` + cardSVG, `translate(${f(cx)} ${f(cy)}) scale(${f(k * (1 + 0.05 * u))})`, 1 - g4);
    if (g4 > 0) {
      const rx = lerp(cx, S5.x, g4), ry = lerp(cy, S5.y, g4), rw = lerp((M.UW - 24) * k, S5.w, g4), rh = lerp(100 * k, S5.h, g4);
      picked += `<clipPath id="growClip"><rect x="${f(rx)}" y="${f(ry)}" width="${f(rw)}" height="${f(rh)}" rx="30"/></clipPath>` +
        `<g clip-path="url(#growClip)">${app(M.screen('s4g', S5H, M.sheet(S5H)), S5.x, S5.y, S5.w)}</g>`;
    }
  }
  let p;
  if (tp < 21.0) p = walk(tp, { expr: 'neutro' });
  else if (tp < 21.6) p = { ...walk(tp), expr: 'annoiato', armB: [-120, -30] };
  else if (tp < stopAt) p = walk(tp, { expr: 'incuriosito' });
  else if (tp < 23.4) p = { ...STAND, expr: 'determinato', armB: [150, -20], handB: 'point' };
  else p = { ...STAND, expr: 'furbo', armB: [120, -40], handB: 'fist', tilt: 5 };
  let belt = '';
  const beltOff = (scroll * 2.4) % 80;
  for (let x = -80; x < W + 80; x += 80) belt += `<path d="M${f(x - beltOff)} ${G_IN + 20} l40 0" stroke="${C.cyan}" stroke-width="6" opacity="0.6"/>`;
  return dentro(t) + ui + belt + hero(p, 540, G_IN, SC_IN, true) + picked;
}

// ---------- Scena 05 · Iscriviti · 25-31 s ----------
const s5pt = appPt(S5.x, S5.y, S5.w);
const BTN = (() => { const b = M.SHEET_BTN(S5H), k = S5.w / M.UW; return { x: S5.x + b.x * k, y: S5.y + b.y * k, w: b.w * k, h: b.h * k }; })();
const SC_SHEET = 0.6, X_ON_BTN = 900; // sul tasto Ciuffo sta a destra per non coprire la scheda
const SEATS = s5pt([142, 285]);
const CONFERMA = s5pt([152, S5H / 2 + 47]);
function sheetState(t) {
  let label = 'REGISTRATI', countdown = 'IL TORNEO INIZIERÀ TRA 0g 2o 14m ' + String(30 - Math.floor(t - 25)).padStart(2, '0') + 's';
  if (t >= 29.2) { label = 'SONO PRONTO A GIOCARE'; countdown = 'IL TORNEO INIZIERÀ TRA 0g 0o 0m ' + String(Math.max(0, 59 - Math.floor((t - 29.2) * 30))).padStart(2, '0') + 's'; }
  if (t >= 29.95) { label = 'VAI AL TUO MATCH'; countdown = ''; }
  const seats = t >= 28.0 ? 12 : 11;
  const seatsPop = 1 + 0.35 * Math.sin(Math.PI * span(t, 28.0, 28.3));
  const press = (t >= 26.6 && t < 27.0) || (t >= 29.6 && t < 29.8) ? 1 : 0;
  const glow = t >= 29.95 ? 0.6 + 0.4 * Math.sin(t * 12) : press;
  return { label, countdown, seats, seatsPop, press, glow };
}
function s05(t) {
  const tp = on2(t);
  let x = X_ON_BTN, ground = G_IN, p;
  const top = BTN.y;
  if (tp < 25.2) { x = 540; p = { ...STAND, expr: 'determinato' }; }
  else if (tp < 26.0) { const u = span(tp, 25.2, 26.0); x = lerp(540, 700, u); p = run(tp, { expr: 'determinato' }); }
  else if (tp < 26.6) { const u = span(tp, 26.0, 26.6); x = lerp(700, X_ON_BTN, u); ground = lerp(G_IN, top, u); p = { ...STAND, expr: 'esultanza', planted: false, lift: 260 * Math.sin(Math.PI * u), armA: [-150, -10], armB: [150, 10], legA: [-24, 20], legB: [24, -20] }; }
  else if (tp < 27.0) { const u = span(tp, 26.6, 27.0); ground = top; p = { ...STAND, expr: 'sorpreso', squash: 0.84 + 0.16 * u, legA: [-16, 30 * (1 - u)], legB: [16, -30 * (1 - u)], armA: [-60, -20], armB: [60, 20] }; }
  else { ground = top; p = { ...STAND, expr: tp < 29.2 ? 'furbo' : 'determinato', tilt: tp < 29.2 ? 5 : 0 }; }
  if (tp >= 27.1 && tp < 27.7) p = { ...p, view: 'q', flip: true, armB: [150, -60], handB: 'point', expr: 'determinato' }; // indica «Conferma»
  if (tp >= 29.4 && tp < 29.9) p = { ...p, view: 'q', flip: true, armB: [60, 40], handB: 'point', expr: 'determinato' };
  if (tp >= 30.8) p = { ...p, view: 'q', flip: true, armB: [50, 40], handB: 'point', expr: 'determinato' };

  const st = sheetState(t);
  const pop = span(t, 26.9, 27.2) * (1 - span(t, 27.7, 27.9));
  const inner = M.sheet(S5H, { seats: st.seats, seatsPop: st.seatsPop, label: st.label, press: st.press, glow: st.glow, countdown: st.countdown }) +
    M.confirm(S5H, pop, t >= 27.5 ? 'conferma' : '');
  let s = dentro(t) + app(M.screen('s5', S5H, inner), S5.x, S5.y, S5.w);
  // l'avatar vola dal tasto al contatore dei partecipanti
  if (t >= 27.8 && t < 28.1) { const q = arc([X_ON_BTN, top - 300], SEATS, 200, ease(span(t, 27.8, 28.1))); s += `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="30" fill="#FFD84A" stroke="${C.ink}" stroke-width="5"/>`; }
  // orologio: salto al giorno del torneo
  const co = span(t, 28.2, 28.4) * (1 - span(t, 29.0, 29.2));
  if (co > 0) s += clock(540, 640, 220, t - 28.2, co);
  s += ripple(CONFERMA[0], CONFERMA[1], span(t, 27.5, 27.9)) + ripple(X_ON_BTN - 160, BTN.y + BTN.h / 2, span(t, 29.6, 30.0)) + ripple(X_ON_BTN - 160, BTN.y + BTN.h / 2, span(t, 30.95, 31.35));
  const sc = lerp(SC_IN, SC_SHEET, ease(span(tp, 25.6, 26.6)));
  return s + hero(p, x, ground, sc, true);
}

// ---------- Scena 06 · Ora si gioca · 31-35 s ----------
const ME = { x: 540, g: 1700, sc: 0.62 };    // Ciuffo a fondo campo, visto da dietro
const READY = { view: 'back', bagRacket: false, handB: 'racket', armB: [60, 50], armA: [-20, -10], legA: [-10, 6], legB: [10, -6], expr: 'determinato' };
function s06(t) {
  if (t < 31.5) { // il tasto si apre come una botola e lo risucchia
    const u = span(t, 31.0, 31.5);
    const st = sheetState(t);
    const k = easeOut(clamp(u * 2));
    const inner = M.sheet(S5H, { seats: 12, label: st.label, countdown: '' });
    const hole = `<rect x="${f(BTN.x)}" y="${f(BTN.y)}" width="${f(BTN.w)}" height="${f(BTN.h)}" rx="${f(BTN.h / 2)}" fill="#07030F"/>` +
      `<rect x="${f(BTN.x)}" y="${f(BTN.y)}" width="${f(BTN.w)}" height="${f(BTN.h / 2 * (1 - k))}" fill="${M.COL.mag}"/><rect x="${f(BTN.x)}" y="${f(BTN.y + BTN.h / 2 + BTN.h / 2 * k)}" width="${f(BTN.w)}" height="${f(BTN.h / 2 * (1 - k))}" fill="${M.COL.mag}"/>`;
    const drop = easeIn(u) * 700;
    const p = { ...STAND, expr: 'sorpreso', planted: false, armA: [-160, -10], armB: [160, 10], hair: 22 };
    const zoom = lerp(1, 2.2, easeIn(u));
    return cam(dentro(t) + app(M.screen('s6', S5H, inner), S5.x, S5.y, S5.w) + hole + hero(p, X_ON_BTN, BTN.y + drop, SC_SHEET, true),
      lerp(W / 2, X_ON_BTN, clamp(u * 2)), lerp(H / 2, BTN.y, clamp(u * 2)), zoom);
  }
  if (t < 33.4) { // tunnel degli spogliatoi, da blu myFITP a viola stadio, con la luce in fondo
    const u = span(t, 31.5, 33.4);
    let s = `<rect width="${W}" height="${H}" fill="#07030F"/>`;
    const vx = 540, vy = 900;
    for (let i = 0; i < 12; i++) {
      const k = ((i / 12 + u * 1.6) % 1), sc = Math.pow(k, 2.2) * 3.2;
      const col = u < 0.45 ? M.COL.blue : '#5B35D6';
      s += `<rect x="${f(vx - 420 * sc)}" y="${f(vy - 760 * sc)}" width="${f(840 * sc)}" height="${f(1520 * sc)}" rx="${f(60 * sc)}" fill="none" stroke="${col}" stroke-width="${f(6 + 30 * sc)}" opacity="${f(k * 100) / 100}"/>`;
    }
    const light = easeIn(span(u, 0.35, 1));
    s += `<ellipse cx="${vx}" cy="${vy}" rx="${f(60 + 1400 * light)}" ry="${f(100 + 2400 * light)}" fill="url(#tunnelLight)"/>`;
    const p = { ...STAND, expr: 'sorpreso', planted: false, armA: [-150, -30], armB: [150, 30], legA: [-30, 30], legB: [30, -30], hair: 20, tilt: 10 * Math.sin(u * 12) };
    s += g(hero(p, 0, 0, lerp(0.9, 0.5, u), true), `translate(540 ${f(lerp(1300, 1250, u))}) rotate(${f(u * 25)})`);
    return s;
  }
  // SuperTennis Arena: atterraggio a fondo campo, di spalle come nella camera di gioco
  const u = span(t, 33.4, 33.8);
  let p = { ...READY, expr: 'sorpreso', planted: false, lift: 600 * (1 - u) * (1 - u), armA: [-120, -20], armB: [120, 20], handB: 'racket' };
  if (t >= 33.8) p = { ...READY, squash: t < 34.0 ? 0.88 : 1 };
  if (t >= 34.4) p = swingPose(t, 34.4);
  const flash = 1 - span(t, 33.4, 33.7);
  const hudIn = easeOut(span(t, 33.9, 34.3));
  return arena(t) + rival(0.5, 0.9, t) + net() + hero(p, ME.x, ME.g, ME.sc, false) + swipe(t, 34.4, [300, 1640], [560, 1380], [860, 1460]) +
    g(hud(6, 4), `translate(0 ${f((1 - hudIn) * -200)})`) + `<rect width="${W}" height="${H}" fill="#fff" opacity="${f(flash * 100) / 100}"/>`;
}
function swingPose(t, t0) {
  const u = ease(span(t, t0, t0 + 0.4));
  return { ...READY, armB: [lerp(110, -70, u), lerp(20, -40, u)], armA: [-30, -20], lean: lerp(6, -8, u), legA: [-14, 8], legB: [14, -8] };
}
// scia rossa del dito: il gesto reale del giocatore, che diventa il colpo
function swipe(t, t0, a, b, c) {
  const u = span(t, t0, t0 + 0.4), out = span(t, t0 + 0.6, t0 + 1.0);
  if (u <= 0 || out >= 1) return '';
  return `<path d="M${a[0]} ${a[1]} Q${b[0]} ${b[1]} ${c[0]} ${c[1]}" fill="none" stroke="#FF2A3D" stroke-width="18" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f((1 - u) * 100) / 100}" opacity="${f((1 - out) * 100) / 100}" filter="url(#neon)"/>`;
}

// ---------- Scena 07 · Gameplay · 35-43,4 s ----------
// ogni colpo: Ciuffo colpisce (hit), la palla va nel campo avversario (to), l'avversario rimanda (back)
const SHOTS = [
  { t0: 35.2, to: [0.3, 0.86], back: [0.62, 0.12], rivalU: 0.32, meU: 0.56, a: [240, 1640], b: [520, 1340], c: [300, 1180] },
  { t0: 37.6, to: [0.72, 0.84], back: [0.4, 0.1], rivalU: 0.7, meU: 0.44, a: [820, 1640], b: [560, 1330], c: [800, 1180] },
  { t0: 40.0, to: [0.93, 0.9], back: null, rivalU: 0.6, meU: 0.5, a: [200, 1680], b: [560, 1360], c: [960, 1200] },
];
const ballAt = (u, d, h) => { const [x, y] = courtPt(u, d); return [x, y, h]; };
function rally(t) {
  // restituisce posizione palla [x,y,altezza], posizione avversario e di Ciuffo
  let pos = null, rU = 0.5, meU = 0.5, rSwing = 0;
  for (const [i, s] of SHOTS.entries()) {
    if (t < s.t0) break;
    const slow = i === 2 ? 2.2 : 1;
    const hit = s.t0 + 0.4, fly = 0.8 * slow;
    const prev = SHOTS[i - 1];
    meU = prev ? lerp(prev.meU, s.meU, ease(span(t, prev.t0 + 1.2, s.t0))) : s.meU;
    const u1 = span(t, hit, hit + fly);
    rU = lerp(prev ? prev.rivalU : 0.5, s.rivalU, ease(span(t, hit, hit + fly * (i === 2 ? 0.9 : 0.8))));
    if (i === 2) rU = lerp(0.5, 0.78, ease(span(t, hit, hit + fly))); // si tuffa ma non ci arriva
    if (t >= hit && u1 < 1) {
      const [x0, y0] = courtPt(s.meU, 0.02), [x1, y1] = courtPt(...s.to);
      pos = [lerp(x0, x1, u1), lerp(y0, y1, u1), 150 + 260 * Math.sin(Math.PI * u1) * (1 - 0.4 * u1)];
    } else if (u1 >= 1 && s.back) {
      const u2 = span(t, hit + fly, hit + fly + 0.8);
      rSwing = 1 - span(t, hit + fly, hit + fly + 0.25);
      if (u2 < 1) { const [x1, y1] = courtPt(...s.to), [x2, y2] = courtPt(...s.back); pos = [lerp(x1, x2, u2), lerp(y1, y2, u2), 60 + 240 * Math.sin(Math.PI * u2)]; }
    } else if (u1 >= 1 && !s.back) {
      const u3 = span(t, hit + fly, hit + fly + 0.6); // vincente: rimbalza e scappa via
      if (u3 < 1) { const [x1, y1] = courtPt(...s.to); pos = [x1 + 160 * u3, y1 - 40 * u3, 90 * Math.sin(Math.PI * u3)]; }
    }
  }
  return { pos, rU, meU, rSwing };
}
function s07(t) {
  const { pos, rU, meU, rSwing } = rally(t);
  let p = READY, sw = '';
  for (const s of SHOTS) if (t >= s.t0) { sw = swipe(t, s.t0, s.a, s.b, s.c) || sw; p = swingPose(t, s.t0); }
  if (t >= 42.2) { const u = span(t, 42.2, 43.0); p = { ...STAND, view: 'back', bagRacket: false, handB: 'racket', expr: 'esultanza', planted: false, lift: 160 * Math.sin(Math.PI * u), armA: [-150, -10], armB: [150, 10] }; }
  if (t >= 43.0) p = { ...STAND, view: 'back', bagRacket: false, handB: 'racket', armA: [-30, 150], armB: [165, -12], handA: 'fist' };
  const meX = courtPt(meU, 0)[0];
  const me = t >= 41.6 ? 7 : 6;
  // due tagli ritmati sulla musica
  const cut = t >= 37.6 && t < 40.0 ? 1.12 : t >= 40.0 && t < 42.2 ? 1.22 : 1;
  const trailPts = [0.12, 0.08, 0.04].map(d => rally(t - d).pos).filter(Boolean);
  const behindNet = pos && pos[1] < courtPt(0.5, 0.5)[1];
  const scene = arena(t) + rival(rU, 0.9, t, rSwing) + (behindNet ? tBall(pos, trailPts) : '') + net() + (behindNet ? '' : tBall(pos, trailPts)) +
    hero(p, meX, ME.g, ME.sc, false);
  return cam(scene, 540, cut === 1 ? H / 2 : 1000, cut) + sw + hud(me, 4);
}

// ---------- T7 · anello: la camera arretra, il campo diventa lo schermo del telefono ----------
function t7(t) {
  const u = easeOut(span(t, 43.4, 45.0));
  const s = Math.exp(lerp(Math.log(ZOOM_PHONE), Math.log(FRAME_OUT.s), u));
  const k = clamp((u - 0.6) / 0.4), cx = lerp(PHONE.x, FRAME_OUT.cx, k), cy = lerp(PHONE.y, FRAME_OUT.cy, k);
  const vib = t > 44.5 ? 4 * Math.sin(t * 90) * (1 - span(t, 44.5, 45.0)) : 0;
  const scr = t > 44.5 ? vittoriaFull() : arena(t) + rival(0.7, 0.9, t) + net() + hero({ ...STAND, view: 'back', bagRacket: false, handB: 'racket', armA: [-30, 150], armB: [165, -12], handA: 'fist' }, 540, ME.g, ME.sc, false) + hud(7, 4);
  const p = { ...SEAT, expr: 'sorpreso' };
  return cam(fuori(t) + hero(p, CX_SEAT, G_OUT, SC_OUT, false) + phone(PHONE.x + vib, PHONE.y, 0, inScreen(scr)), cx, cy, s);
}

// ---------- Scena 08 · End frame · 45-52 s ----------
function s08(t) {
  const tp = on2(t);
  let body, rot = 0;
  const glow = 0.5 + 0.5 * span(t, 45, 46);
  if (tp < 46.8) {
    if (tp >= 46.0) rot = 360 * ease(span(t, 46.0, 46.8));
    body = seatedScene(t, { expr: tp < 45.6 ? 'incuriosito' : 'sorriso' }, { screen: vittoriaFull(), phoneRot: rot, glow });
  } else {
    const u = ease(span(tp, 46.8, 47.4));
    let p = mix({ ...SEAT, expr: 'sorriso' }, { ...STAND, expr: 'sorriso', handB: 'phone', phoneRot: 0 }, u);
    if (tp >= 47.4) p = { ...STAND, expr: 'sorriso', tilt: 4, armB: [30, 50], handB: 'phone' };
    if (tp >= 48.0 && tp < 48.6) p = { ...STAND, view: 'q', expr: 'furbo', armA: [-40, 20], armB: [30, 50], handB: 'phone', lean: -10 };
    if (tp >= 48.6) { const k = ease(span(tp, 48.6, 49.0)); p = { ...STAND, expr: 'furbo', tilt: 6, armB: [lerp(30, 120, k), lerp(50, -60, k)], handB: 'fist', armA: [-8, -4] }; }
    const x = lerp(CX_SEAT, 480, u);
    const tally4 = span(t, 48.2, 48.5);
    body = fuori(t, { glow, tallies: tally4 > 0 ? 4 : 3, tally4 }) + hero(p, x, G_OUT, SC_OUT, false);
  }
  // grafica finale: quattro verbi, poi «Tocca a te.» con la pennellata rosa-ciano (T8), dominio e loghi
  let gfx = '';
  ['ENTRA IN MYFITP.', 'TESSERATI.', 'ISCRIVITI.', 'GIOCA.'].forEach((v, i) => {
    const u = easeOut(span(t, 48.8 + i * 0.25, 49.1 + i * 0.25));
    if (u > 0) gfx += text(W / 2, 230 + i * 76 + (1 - u) * 30, v, 52, C.ink, { op: u });
  });
  const u8 = span(t, 50.0, 50.6);
  if (u8 > 0) {
    gfx += `<path d="M170 690 Q540 650 910 682" fill="none" stroke="${C.pink}" stroke-width="44" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f((1 - u8) * 100) / 100}" opacity="0.9"/>`;
    gfx += `<path d="M190 710 Q540 680 890 700" fill="none" stroke="${C.cyan}" stroke-width="16" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f((1 - span(t, 50.2, 50.8)) * 100) / 100}" opacity="0.9"/>`;
    gfx += g(text(W / 2, 650, 'Tocca a te.', 118, C.ink), `translate(540 610) scale(${f(back(clamp(u8 * 1.5)) * 100) / 100}) translate(-540 -610)`);
  }
  const ud = easeOut(span(t, 50.6, 51.0));
  if (ud > 0) gfx += text(W / 2, 790, 'esports.fitp.it', 40, C.ink, { weight: 900, op: ud });
  const ul = easeOut(span(t, 50.8, 51.2));
  if (ul > 0) gfx += g(`<image href="${A.esports}" x="380" y="810" width="320" height="180"/>` +
    `<image href="${A.fitp}" x="110" y="850" width="210" height="104"/>` +
    `<image href="${A.tcIcon}" x="790" y="846" width="112" height="112" clip-path="inset(0 round 24px)"/>`, '', ul);
  const k = ease(span(t, 48.6, 49.4));
  return cam(body, FRAME_OUT.cx, lerp(FRAME_OUT.cy, H / 2, k), lerp(FRAME_OUT.s, 1, k)) + gfx;
}

// ---------- supers e note dell'animatic ----------
const SUPERS = [
  [5.8, 11.4, '1', 'ENTRA IN MYFITP'],
  [12.8, 18.4, '2', 'TESSERATI'],
  [25.6, 30.2, '3', 'ISCRIVITI A UN TORNEO'],
  [33.5, 35.4, '4', 'GIOCA SU TENNIS CLASH'],
];
function supers(t) {
  let s = '';
  for (const [a, b, n, l] of SUPERS) {
    const u = easeOut(span(t, a, a + 0.3)) * (1 - span(t, b - 0.3, b));
    if (u <= 0) continue;
    const y = 1830 + (1 - u) * 40;
    const size = l.length > 16 ? 40 : 50;
    const icon = n === '4' ? `<image href="${A.tcIcon}" x="${f(1020 - 96)}" y="${f(y - 70)}" width="84" height="84" clip-path="inset(0 round 18px)"/>` : '';
    s += g(`<rect x="60" y="${f(y - 78)}" width="960" height="112" rx="20" fill="#1C0F3A" opacity="0.78"/>` +
      text(110, y, n, 62, C.cyan, { anchor: 'start' }) + text(175, y - 6, '·', 62, '#fff', { anchor: 'start' }) +
      text(215, y - 6, l, size, '#fff', { anchor: 'start' }) +
      `<path d="M215 ${f(y + 14)} L${215 + l.length * size * 0.78} ${f(y + 10)}" stroke="${C.pink}" stroke-width="6" stroke-linecap="round"/>` + icon, '', u);
  }
  return s;
}
const SCENES = [
  [0, 5, '01 Discovery'], [5, 12, '02 Entra in myFITP'], [12, 19, '03 Tesserati'], [19, 25, '04 Scegli il torneo'],
  [25, 31, '05 Iscriviti'], [31, 35, '06 Ora si gioca'], [35, 45, '07 Gameplay'], [45, 52, '08 End frame'],
];
// note di regia visibili solo nell'animatic (voce, silenzi, suoni chiave)
const NOTES = [
  [1.4, 4.0, 'VO (A): «Vuoi giocare sul serio? Vieni.»  ·  SFX: «pock» della pallina'],
  [4.0, 5.0, 'T1 La lente: si entra nello schermo'],
  [6.0, 8.0, 'VO (A): «Si parte da qui.»  ·  SFX: tap = «pock»'],
  [9.2, 9.8, 'SFX: clic magnetico del cartellino'],
  [11.0, 12.0, 'T2 La pallina guida'],
  [13.4, 15.0, 'VO (A): «Questa apre tutto.»  ·  SFX: carta da gioco'],
  [17.3, 17.9, 'SFX: «ding» di attivazione'],
  [17.9, 19.0, 'T3 Il circuito diventa strada'],
  [23.0, 24.2, 'VO (A): «Questo.»'],
  [24.2, 25.0, 'T4 La card si apre'],
  [26.6, 27.8, 'SFX: «boing» · popup di conferma reale dell\'app'],
  [27.8, 28.2, 'VO (A): «Fatto.»  ·  SFX: tre note'],
  [28.2, 29.2, 'SFX: ticchettio accelerato · salto al giorno del torneo'],
  [30.45, 30.95, 'SILENZIO TOTALE 0,5 s'],
  [31.0, 33.4, 'T5 Il tasto botola · whoosh'],
  [33.4, 34.4, 'MUSICA: drop · VO (A): «E adesso si gioca.»'],
  [34.4, 35.0, 'T6 Lo swipe diventa colpo'],
  [35.0, 43.4, 'AUDIO: colpi, pubblico, whoosh sulle scie'],
  [43.4, 45.0, 'T7 L\'anello: si torna alla panchina'],
  [46.0, 49.5, 'VO (A): «È tutto qui. Tocca a te.»'],
  [50.0, 50.8, 'T8 Il gesso diventa pennellata · colpo secco di racchetta'],
];
function overlay(t) {
  const sc = SCENES.find(([a, b]) => t >= a && t < b) || SCENES[SCENES.length - 1];
  const tc = `${String(Math.floor(t)).padStart(2, '0')}:${String(Math.floor((t % 1) * FPS)).padStart(2, '0')}`;
  let s = `<rect width="${W}" height="64" fill="#000" opacity="0.72"/>` +
    text(24, 44, `ANIMATIC v2 · BOZZA`, 28, '#FFD84A', { anchor: 'start', weight: 800, font: 'monospace' }) +
    text(W / 2 + 60, 44, `SC ${sc[2]}`, 28, '#fff', { weight: 700, font: 'monospace' }) +
    text(W - 24, 44, tc, 30, '#fff', { anchor: 'end', weight: 700, font: 'monospace' });
  NOTES.filter(([a, b]) => t >= a && t < b).forEach(([, , n], i) => {
    s += `<rect x="0" y="${64 + i * 48}" width="${W}" height="48" fill="#000" opacity="0.55"/>` + text(24, 97 + i * 48, n, 25, '#fff', { anchor: 'start', weight: 600, font: 'monospace' });
  });
  return s;
}

// ---------- montaggio ----------
export function frame(t, o = {}) {
  let s;
  if (t < 5) s = s01(t);
  else if (t < 12) s = s02(t);
  else if (t < 19) s = s03(t);
  else if (t < 25) s = s04(t);
  else if (t < 31) s = s05(t);
  else if (t < 35) s = s06(t);
  else if (t < 43.4) s = s07(t);
  else if (t < 45) s = t7(t);
  else s = s08(t);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs()}` +
    `<rect width="${W}" height="${H}" fill="#000"/>${s}${supers(t)}${o.clean ? '' : overlay(t)}</svg>`;
}
