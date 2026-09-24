// Animatic v1 del video «Tocca a te»: 52 s, master verticale 1080x1920, 25 fps.
// Segue lo storyboard del treatment (sezione 3). Tutto disegnato in codice:
// UI myFITP, tessera, gameplay Tennis Clash e loghi sono SEGNAPOSTO tratteggiati,
// da sostituire con le registrazioni e i file reali in composizione.
import { ciuffo, shadow, paperBG, C } from './ciuffo.js';

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

const FONT = "Glancyr, 'Arial Black', 'Segoe UI Black', 'Liberation Sans', Arial, sans-serif";
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

const BLUE = '#1D3F8F';   // blu header myFITP (segnaposto, da campionare dalla registrazione reale)
const MAGENTA = '#E0147C'; // magenta dei tasti myFITP (segnaposto)
const CLAY = '#C65A2E';

const DEFS = `<defs>
<radialGradient id="vg" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="#4A2A8A"/><stop offset="0.6" stop-color="#311A60"/><stop offset="1" stop-color="#1C0F3A"/></radialGradient>
<linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B1E6E"/><stop offset="0.45" stop-color="#B8457A"/><stop offset="0.75" stop-color="#F29A4A"/></linearGradient>
<radialGradient id="phoneLight" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.pink}" stop-opacity="0.35"/><stop offset="0.5" stop-color="${C.cyan}" stop-opacity="0.12"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>
<radialGradient id="tunnelLight" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="#FFF4D6" stop-opacity="0.8"/><stop offset="1" stop-color="#FFF4D6" stop-opacity="0"/></radialGradient>
<pattern id="hatch" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="22" height="22" fill="none"/><line x1="0" y1="0" x2="0" y2="22" stroke="#8A8FA8" stroke-width="3" opacity="0.35"/></pattern>
<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${C.cyan}" flood-opacity="0.9"/><feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="${C.pink}" flood-opacity="0.45"/></filter>
<filter id="neon" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
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
// segnaposto per un asset reale (UI, tessera, gameplay, loghi)
function placeholder(x, y, w, h, label, o = {}) {
  const { fill = '#F4F4F8', rx = 28, sub = 'SEGNAPOSTO · da sostituire con asset reale', dark = false, op = 1 } = o;
  const ink = dark ? '#E4DEEC' : '#4A4F6A';
  return g(`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}" fill="${fill}"/>` +
    `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}" fill="url(#hatch)"/>` +
    `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}" fill="none" stroke="${ink}" stroke-width="3" stroke-dasharray="14 10" opacity="0.6"/>` +
    (label ? text(x + w / 2, y + h / 2, label, Math.min(40, w / 14), ink, { weight: 800 }) : '') +
    (sub && h > 120 ? text(x + w / 2, y + h / 2 + 44, sub, Math.min(24, w / 26), ink, { weight: 600, op: 0.8 }) : ''), '', op);
}
// schermata myFITP: header blu, contenuto segnaposto, barra di navigazione con l'icona eSports al centro
function myfitp(x, y, w, h, label, o = {}) {
  const { headerGlow = 0, nav = true, sub, inner = '' } = o;
  const hh = 120, nh = nav ? 120 : 0;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="36" fill="#F4F4F8"/>`;
  s += placeholder(x, y + hh, w, h - hh - nh, label, { rx: 0, sub });
  s += `<path d="M${x} ${y + hh} L${x} ${y + 36} Q${x} ${y} ${x + 36} ${y} L${x + w - 36} ${y} Q${x + w} ${y} ${x + w} ${y + 36} L${x + w} ${y + hh} Z" fill="${BLUE}"/>`;
  s += text(x + w / 2, y + 76, 'myFITP', 44, '#fff', { weight: 800 });
  if (headerGlow > 0) s += `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="36" fill="${C.cyan}" opacity="${f(headerGlow * 35) / 100}"/>`;
  if (nav) {
    const ny = y + h - nh;
    s += `<path d="M${x} ${ny} L${x + w} ${ny} L${x + w} ${y + h - 36} Q${x + w} ${y + h} ${x + w - 36} ${y + h} L${x + 36} ${y + h} Q${x} ${y + h} ${x} ${y + h - 36} Z" fill="#FFFFFF"/>`;
    for (let i = 0; i < 5; i++) {
      const cx = x + w * (i + 0.5) / 5, cy = ny + nh / 2;
      s += i === 2 ? `<circle cx="${cx}" cy="${cy}" r="34" fill="${BLUE}"/><circle cx="${cx}" cy="${cy}" r="16" fill="#D8F23A"/>`
        : `<rect x="${cx - 20}" y="${cy - 20}" width="40" height="40" rx="10" fill="#B9BCCB"/>`;
    }
  }
  return `<g filter="none">${s}${inner}</g>`;
}
function tessera(cx, cy, w, flip, o = {}) {
  // flip: 0 = fronte, 1 = retro; la carta si stringe a metà per girarsi
  const h = w * 0.63, sx = Math.abs(Math.cos(Math.PI * flip));
  const backSide = flip > 0.5;
  const glow = o.glow || 0;
  let face;
  if (!backSide) {
    face = placeholder(-w / 2, -h / 2, w, h, 'TESSERA · FRONTE', { fill: '#2A1552', dark: true, rx: 22, sub: 'grafica reale 20/07/2026' });
  } else {
    let traces = '';
    for (let i = 0; i < 6; i++) {
      const yy = -h / 2 + h * (i + 1) / 7;
      traces += `<path d="M${-w / 2 + 20} ${f(yy)} L${f(-w / 6 + i * 10)} ${f(yy)} L${f(-w / 12 + i * 10)} ${f(yy + 14)} L${w / 2 - 20} ${f(yy + 14)}" fill="none" stroke="${C.cyan}" stroke-width="3" opacity="${f((0.3 + 0.7 * glow) * 100) / 100}"/>` +
        `<circle cx="${w / 2 - 20}" cy="${f(yy + 14)}" r="5" fill="${C.cyan}" opacity="${f((0.3 + 0.7 * glow) * 100) / 100}"/>`;
    }
    face = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="22" fill="${BLUE}"/>` + traces +
      text(0, h / 2 - 22, 'TESSERA · RETRO (segnaposto)', w / 18, '#fff', { weight: 700, op: 0.8 });
  }
  const stroke = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="22" fill="none" stroke="${C.ink}" stroke-width="5"/>`;
  const halo = glow > 0 ? `<rect x="${-w / 2 - 10}" y="${-h / 2 - 10}" width="${w + 20}" height="${h + 20}" rx="30" fill="none" stroke="${C.cyan}" stroke-width="6" opacity="${f(glow * 80) / 100}" filter="url(#neon)"/>` : '';
  return g(halo + face + stroke, `translate(${f(cx)} ${f(cy)}) rotate(${f(o.rot || 0)}) scale(${f(Math.max(sx, 0.02) * 1000) / 1000} 1)`);
}
function tag(x, y, rot = 0, s = 1) {
  return g(`<path d="M-40 -26 L30 -26 L50 0 L30 26 L-40 26 Z" fill="#FFD84A" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>` +
    `<circle cx="30" cy="0" r="7" fill="none" stroke="${C.ink}" stroke-width="4"/>` + text(-6, 9, 'TC ID', 20, C.ink, { weight: 900 }),
    `translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s * 100) / 100})`);
}
function button(cx, cy, w, h, label, o = {}) {
  const { fill = MAGENTA, press = 0, glow = 0, note } = o;
  let s = '';
  if (glow > 0) s += `<rect x="${f(cx - w / 2 - 12)}" y="${f(cy - h / 2 - 12)}" width="${w + 24}" height="${h + 24}" rx="${h / 2 + 12}" fill="${fill}" opacity="${f(glow * 45) / 100}" filter="url(#neon)"/>`;
  s += `<rect x="${f(cx - w / 2)}" y="${f(cy - h / 2 + press * 8)}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/>`;
  s += text(cx, cy + 14 + press * 8, label, 40, '#fff', { weight: 900 });
  if (note) s += text(cx, cy + h / 2 + 40, note, 22, '#E4DEEC', { weight: 600, op: 0.85 });
  return s;
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
  // siepe e recinzione
  let hedge = `M0 1180`;
  for (let x = 0; x <= W; x += 60) hedge += ` Q${x + 30} ${1150 + (x % 120 ? 6 : -4)} ${x + 60} 1180`;
  s += `<path d="${hedge} L${W} 1260 L0 1260 Z" fill="#7C8F63" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>`;
  // campo in terra rossa con linee di gesso
  s += `<rect x="0" y="1260" width="${W}" height="${H - 1260}" fill="${CLAY}"/>`;
  s += `<path d="M0 1262 L${W} 1262" stroke="${C.ink}" stroke-width="5"/>`;
  s += `<path d="M-40 1330 L${W + 40} 1330 M720 1330 L1080 1700 M300 1330 L-80 1760" stroke="#F6EFE4" stroke-width="10" opacity="0.9" fill="none"/>`;
  for (let i = 0; i < 120; i++) { // grana della terra
    const x = (i * 397) % W, y = 1270 + (i * 211) % (H - 1270);
    s += `<circle cx="${x}" cy="${y}" r="${1.5 + (i % 3)}" fill="${C.ink}" opacity="0.08"/>`;
  }
  // panchina
  const bx = BENCH_X, bw = BENCH_W, sy = SEAT_Y;
  s += `<rect x="${bx + 30}" y="${sy}" width="16" height="${G_OUT - sy + 10}" fill="#8A5A3B" stroke="${C.ink}" stroke-width="5"/>`;
  s += `<rect x="${bx + bw - 46}" y="${sy}" width="16" height="${G_OUT - sy + 10}" fill="#8A5A3B" stroke="${C.ink}" stroke-width="5"/>`;
  s += `<rect x="${bx}" y="${sy - 10}" width="${bw}" height="34" rx="6" fill="#B07A4F" stroke="${C.ink}" stroke-width="5"/>`;
  // tacche di gesso sul bordo della panchina (le amichevoli fatte)
  const n = o.tallies ?? 3;
  for (let i = 0; i < 4; i++) {
    if (i >= n) break;
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
function tennisClash(t, o = {}) {
  // segnaposto del gameplay reale: cielo al tramonto, tribune, campo in prospettiva
  let s = `<rect width="${W}" height="${H}" fill="url(#sunset)"/>`;
  for (let r = 0; r < 6; r++) for (let i = 0; i < 26; i++)
    s += `<circle cx="${i * 44 + (r % 2) * 22}" cy="${560 + r * 34}" r="12" fill="${['#5B2A6E', '#7A3A7E', '#3B1E6E'][(i + r) % 3]}" opacity="0.9"/>`;
  s += `<path d="M340 760 L740 760 L1080 ${H} L0 ${H} Z" fill="#2E3FA3"/>`;
  s += `<path d="M380 780 L700 780 L990 1860 L90 1860 Z M540 780 L540 1860 M300 1080 L780 1080 M180 1520 L900 1520" fill="none" stroke="#fff" stroke-width="6" opacity="0.9"/>`;
  s += `<path d="M250 1180 L830 1180" stroke="#1B1B2E" stroke-width="14"/><path d="M250 1150 L830 1150" stroke="#fff" stroke-width="5"/>`;
  s += g(placeholder(90, 110, 900, 180, 'GAMEPLAY REALE TENNIS CLASH', { fill: 'rgba(20,10,40,0.55)', dark: true, sub: 'campo FITP · SuperTennis Arena · materiale WildLife' }), '', o.labelOp ?? 1);
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

// ---------- scene ----------
// Scena 01 · Discovery · 0-5 s
const ballS1 = t => {
  if (t < 1.6 || t > 3.6) return null;
  const P0 = [PHONE.x, PHONE.y], B1 = [760, G_OUT + 90], B2 = [930, G_OUT + 120];
  if (t < 2.2) return arc(P0, B1, 260, span(t, 1.6, 2.2));
  if (t < 2.8) return arc(B1, B2, 200, span(t, 2.2, 2.8));
  return arc(B2, P0, 320, span(t, 2.8, 3.6));
};
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
const dentroMini = t => dentro(t) + ball(W / 2, 700, 60);

// Scena 02 · Entra in myFITP · 5-12 s
const AVATAR = [200, 360];
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

  // schermata: accesso (porte chiuse) che si apre sul profilo
  const px = 90, py = 150, pw = 900, ph = 1000;
  const glow = span(t, 6.3, 6.6) * (1 - span(t, 7.2, 8.0));
  const doors = easeOut(span(t, 7.0, 7.6));
  let ui = myfitp(px, py, pw, ph, 'HOME myFITP · profilo', { headerGlow: glow, sub: 'registrazione produzione 12/09 (Bitkit)' });
  ui += `<circle cx="${AVATAR[0]}" cy="${AVATAR[1]}" r="54" fill="#D9DCE8" stroke="${BLUE}" stroke-width="6"/>` + text(AVATAR[0], AVATAR[1] + 10, 'TU', 30, BLUE);
  if (doors < 1) {
    const d = doors * pw / 2;
    ui += `<clipPath id="panelClip"><rect x="${px}" y="${py + 120}" width="${pw}" height="${ph - 240}"/></clipPath><g clip-path="url(#panelClip)">` +
      placeholder(px - d, py + 120, pw / 2, ph - 240, 'ACCEDI', { rx: 0, sub: '' }) + placeholder(px + pw / 2 + d, py + 120, pw / 2, ph - 240, 'REGISTRATI', { rx: 0, sub: '' }) + '</g>';
  }
  // cartellino Tennis Clash lanciato sul profilo
  let tg = '';
  if (t >= 8.8 && t < 9.4) { const u = span(t, 8.8, 9.4); const q = arc([700, 1250], AVATAR, 300, easeOut(u)); tg = tag(q[0] + 60, q[1] + 40, 720 * u, 1.2); }
  else if (t >= 9.4) { const u = span(t, 9.4, 9.8); tg = tag(AVATAR[0] + 60, AVATAR[1] + 40, -12, 1.2 * (1 + 0.25 * Math.sin(Math.PI * u))); if (u < 1) tg += `<circle cx="${AVATAR[0] + 60}" cy="${AVATAR[1] + 40}" r="${f(40 + 80 * u)}" fill="none" stroke="${C.cyan}" stroke-width="6" opacity="${f((1 - u) * 100) / 100}"/>`; }
  // pallina guida: entra nel logo, poi a fine scena rimbalza fuori verso l'alto (T2)
  const ballP = tt => {
    if (tt >= 5.9 && tt < 6.4) return arc([900, 1300], [540, 225], 400, span(tt, 5.9, 6.4));
    if (tt >= 11.0 && tt < 12.0) return arc([AVATAR[0], AVATAR[1]], [620, -300], 250, span(tt, 11.0, 12.0));
    return null;
  };
  const pan = easeIn(span(t, 11.3, 12.0)) * 900;
  return g(dentro(t) + ui + hero(p, x, G_IN, SC_IN, true) + tg, `translate(0 ${f(pan)})`) + trail(ballP, t);
}

// Scena 03 · Tesserati · 12-19 s
function s03(t) {
  const tp = on2(t);
  const catchT = 13.6;
  let p = { ...STAND, expr: 'incuriosito', tilt: -6 };
  if (tp >= 12.8 && tp < catchT) p = { ...STAND, expr: 'determinato', armA: [-160, 0], armB: [160, 0] };
  if (tp >= catchT && tp < 15.0) { const u = span(tp, catchT, catchT + 0.3); p = { ...STAND, expr: 'incuriosito', squash: 1 - 0.08 * Math.sin(Math.PI * u), armA: [-40, -100], armB: [40, 100] }; }
  if (tp >= 15.0 && tp < 16.0) { const u = ease(span(tp, 15.0, 15.8)); p = { ...STAND, view: 'side', expr: 'determinato', lean: 8, armB: [lerp(-120, 70, u), -20], armA: [lerp(-60, 30, u), 20], legA: [-14, 0], legB: [14, 0], handB: 'fist' }; }
  if (tp >= 16.0 && tp < 16.7) p = { ...STAND, expr: 'neutro', tilt: 8, armA: [-50, -60], armB: [50, 60] }; // scrollata di spalle
  if (tp >= 16.7) p = { ...STAND, expr: tp > 17.2 ? 'sorpreso' : 'incuriosito', armA: [-40, -100], armB: [40, 100] };

  // tessera: scende ruotando, viene presa, poi fluttua durante la gag e si gira
  const held = [540, G_IN - 400 * SC_IN];
  let cx, cy, flip, w = 300, rot = 0;
  if (t < catchT) { const u = span(t, 12.0, catchT); cx = 540 + 80 * Math.sin(u * 5); cy = lerp(-250, G_IN - 560 * SC_IN, easeOut(u)); flip = 3 * (1 - u); rot = 20 * (1 - u); }
  else if (t < 15.0) { const u = easeOut(span(t, catchT, 14.1)); cx = 540; cy = lerp(G_IN - 560 * SC_IN, held[1], u); flip = 0; }
  else if (t < 16.7) { cx = 250; cy = held[1] - 160 + 10 * Math.sin(t * 4); flip = 0; w = 280; }
  else { const u = ease(span(t, 16.7, 17.3)); cx = lerp(250, 540, u); cy = lerp(held[1] - 160, held[1] - 60, u); flip = ease(span(t, 16.9, 17.5)); w = lerp(280, 340, u); }
  const cardGlow = span(t, 17.4, 17.8);
  // T3: le piste del circuito escono dalla carta e corrono fino all'icona eSports nella barra
  let circuit = '', nav = '';
  const u3 = span(t, 17.9, 18.8), navIn = easeOut(span(t, 17.9, 18.3));
  if (u3 > 0) {
    const iy = H - 70;
    for (const [dx, col] of [[-60, C.cyan], [0, C.pink], [60, C.cyan]]) {
      const path = `M${540 + dx} ${f(cy + 110)} L${540 + dx} ${f(cy + 250)} L${540 + dx * 3} ${f(cy + 330)} L${540 + dx * 3} ${iy - 120} L540 ${iy}`;
      circuit += `<path d="${path}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f((1 - u3) * 100) / 100}" filter="url(#neon)"/>`;
    }
  }
  if (navIn > 0) {
    const ny = H - 140 + (1 - navIn) * 160;
    nav = `<rect x="60" y="${f(ny)}" width="${W - 120}" height="130" rx="30" fill="#FFFFFF" opacity="0.95"/>`;
    for (let i = 0; i < 5; i++) {
      const x = 60 + (W - 120) * (i + 0.5) / 5;
      nav += i === 2 ? `<circle cx="${x}" cy="${f(ny + 65)}" r="40" fill="${BLUE}"/><circle cx="${x}" cy="${f(ny + 65)}" r="18" fill="#D8F23A"/>` +
        (u3 >= 1 ? `<circle cx="${x}" cy="${f(ny + 65)}" r="${f(50 + 30 * span(t, 18.8, 19))}" fill="none" stroke="${C.cyan}" stroke-width="6" filter="url(#neon)"/>` : '')
        : `<rect x="${x - 22}" y="${f(ny + 43)}" width="44" height="44" rx="10" fill="#B9BCCB"/>`;
    }
  }
  const zoom = lerp(1, 1.45, ease(span(t, 13.8, 14.6))) - 0.45 * ease(span(t, 14.8, 15.3));
  const card = tessera(cx, cy, w, flip, { rot, glow: cardGlow });
  const intro = (1 - easeOut(span(t, 12.0, 12.6))) * -900; // continua il movimento verso l'alto della T2
  return g(cam(dentro(t, { lines: 4 }) + hero(p, 540, G_IN, SC_IN, true) + card, 540, held[1] + (H / 2 - held[1]) / zoom, zoom) + circuit + nav, `translate(0 ${f(intro)})`);
}

// Scena 04 · Scegli il torneo · 19-25 s
const CARDS = ['Open Cup · Livello 2', 'Torneo · Livello 10', 'FITP eSeries by BMW · Livello 4', 'Torneo · Livello 4'];
// la card scelta è la 7a della lista (indice 6 → CARDS[2])
function s04(t) {
  const tp = on2(t);
  const px = 60, py = 130, pw = 960, ph = 1180;
  // la lista scorre verso l'alto come un nastro e si ferma sulla card scelta
  const stopAt = 22.6, cardH = 250, gap = 30, pick = 6, selY = py + 420;
  const scrollEnd = 260 + pick * (cardH + gap) - (selY - py);
  const u4 = clamp((t - 19) / (stopAt - 19));
  const scroll = scrollEnd * (1 - (1 - u4) * (1 - u4)); // nastro che rallenta fino a fermarsi
  let ui = `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="36" fill="#F4F4F8"/>`;
  ui += `<rect x="${px}" y="${py}" width="${pw}" height="120" rx="36" fill="${BLUE}"/><rect x="${px}" y="${py + 84}" width="${pw}" height="36" fill="${BLUE}"/>`;
  ui += text(px + pw * 0.3, py + 76, 'TORNEI', 38, '#fff') + text(px + pw * 0.72, py + 76, 'LEADERBOARD', 38, '#9FB0E0');
  ui += `<rect x="${px + pw * 0.3 - 90}" y="${py + 100}" width="180" height="8" rx="4" fill="#fff"/>`;
  ['Disponibili', 'In corso', 'Completati'].forEach((l, i) => {
    const x = px + 40 + i * 300;
    ui += `<rect x="${x}" y="${py + 150}" width="270" height="70" rx="35" fill="${i === 0 ? BLUE : '#E1E3EE'}"/>` + text(x + 135, py + 196, l, 30, i === 0 ? '#fff' : '#4A4F6A', { weight: 800 });
  });
  let list = '';
  const chosen = t >= 23.4;
  for (let i = 0; i < 10; i++) {
    const c = CARDS[i % CARDS.length], y = py + 260 + i * (cardH + gap) - scroll;
    if (i === pick && chosen) continue;
    if (y > py + ph || y + cardH < py + 250) continue;
    list += cardPH(px + 40, y, pw - 80, cardH, c);
  }
  ui += `<clipPath id="listClip"><rect x="${px}" y="${py + 250}" width="${pw}" height="${ph - 250}"/></clipPath><g clip-path="url(#listClip)">${list}</g>`;
  // card scelta sfilata dalla lista (T4: cresce fino a diventare la scheda torneo)
  let picked = '';
  if (chosen) {
    const y0 = py + 260 + pick * (cardH + gap) - scroll;
    const u = back(span(t, 23.4, 23.9)), g4 = ease(span(t, 24.2, 25.0));
    const x = lerp(px + 40, 60, g4) + 30 * u * (1 - g4), y = lerp(y0 - 20 * u, 110, g4), w = lerp(pw - 80, 960, g4), h = lerp(cardH, 1400, g4);
    const badge = 1 + 0.6 * Math.sin(Math.PI * span(t, 23.6, 24.4));
    picked = `<rect x="${f(x + 8)}" y="${f(y + 14)}" width="${f(w)}" height="${f(h)}" rx="28" fill="#000" opacity="0.25"/>` + cardPH(x, y, w, h, CARDS[pick % CARDS.length], badge);
  }
  // Ciuffo cammina sul nastro, scarta una card, poi sceglie
  let p;
  if (tp < 21.0) p = walk(tp, { expr: 'neutro' });
  else if (tp < 21.6) p = { ...walk(tp), expr: 'annoiato', armB: [-120, -30] };
  else if (tp < stopAt) p = walk(tp, { expr: 'incuriosito' });
  else if (tp < 23.4) p = { ...STAND, expr: 'determinato', armB: [150, -20], handB: 'point' };
  else p = { ...STAND, expr: 'furbo', armB: [120, -40], handB: 'fist', tilt: 5 };
  let belt = '';
  const beltOff = scroll % 80;
  for (let x = -80; x < W + 80; x += 80) belt += `<path d="M${f(x - beltOff)} ${G_IN + 20} l40 0" stroke="${C.cyan}" stroke-width="6" opacity="0.6"/>`;
  return dentro(t) + ui + belt + hero(p, 540, G_IN, SC_IN, true) + picked;
}
function cardPH(x, y, w, h, label, badge = 1) {
  let s = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="28" fill="#FFFFFF"/>`;
  s += placeholder(x + 16, y + 16, Math.min(w * 0.36, 320), h - 32, 'IMG', { rx: 18, sub: '' });
  const tx = x + Math.min(w * 0.36, 320) + 44;
  s += text(tx, y + 70, label, 32, '#1C1C2E', { anchor: 'start', weight: 800 });
  s += `<rect x="${f(tx)}" y="${f(y + 100)}" width="${f(w * 0.3)}" height="18" rx="9" fill="#D6D8E4"/><rect x="${f(tx)}" y="${f(y + 134)}" width="${f(w * 0.22)}" height="18" rx="9" fill="#D6D8E4"/>`;
  if (/Livello (\d+)/.test(label)) {
    const lv = label.match(/Livello (\d+)/)[1];
    s += g(`<rect x="-80" y="-28" width="160" height="56" rx="28" fill="${C.cyan}"/>` + text(0, 11, 'LIVELLO ' + lv, 26, '#1C0F3A'), `translate(${f(tx + 80)} ${f(y + h - 48)}) scale(${f(badge * 100) / 100})`);
  }
  return s;
}

// Scena 05 · Iscriviti · 25-31 s
const BTN = { x: 540, y: 1380, w: 760, h: 110 };
const SC_SHEET = 0.6, X_ON_BTN = 300; // sul tasto Ciuffo sta a sinistra per non coprire la scheda
function sheet(t) {
  const px = 60, py = 110, pw = 960, ph = 1400;
  let s = `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="28" fill="#FFFFFF"/>`;
  s += placeholder(px + 16, py + 16, pw - 32, 360, 'SCHEDA TORNEO · immagine di testata', { rx: 18, sub: 'registrazione pulita da Bitkit, dati di prova' });
  s += text(px + 50, py + 450, 'FITP eSeries by BMW · Livello 4', 40, '#1C1C2E', { anchor: 'start', weight: 900 });
  for (let i = 0; i < 3; i++) s += `<rect x="${px + 50}" y="${py + 490 + i * 44}" width="${[620, 540, 380][i]}" height="22" rx="11" fill="#D6D8E4"/>`;
  ['PARTECIPANTI', 'TABELLONE', 'REGOLAMENTO'].forEach((l, i) => {
    const x = px + 40 + i * 300;
    s += `<rect x="${x}" y="${py + 660}" width="280" height="80" rx="18" fill="#E1E3EE"/>` + text(x + 140, py + 712, l, 26, BLUE, { weight: 800 });
  });
  const n = t >= 27.6 ? 8 : 7, pop = 1 + 0.3 * Math.sin(Math.PI * span(t, 27.6, 27.9));
  s += g(text(0, 0, `ISCRITTI ${n}/256`, 44, '#1C1C2E', { anchor: 'end' }), `translate(${px + pw - 50} ${py + 850}) scale(${f(pop * 100) / 100})`);
  return s;
}
function s05(t) {
  const tp = on2(t);
  let x = 540, ground = G_IN, p;
  const top = BTN.y - BTN.h / 2;
  if (tp < 25.2) p = { ...STAND, expr: 'determinato' };
  else if (tp < 26.0) { const u = span(tp, 25.2, 26.0); x = lerp(80, 220, u); p = run(tp, { expr: 'determinato' }); }
  else if (tp < 26.6) { const u = span(tp, 26.0, 26.6); x = lerp(220, X_ON_BTN, u); ground = lerp(G_IN, top, u); p = { ...STAND, expr: 'esultanza', planted: false, lift: 260 * Math.sin(Math.PI * u), armA: [-150, -10], armB: [150, 10], legA: [-24, 20], legB: [24, -20] }; }
  else if (tp < 27.0) { const u = span(tp, 26.6, 27.0); x = X_ON_BTN; ground = top; p = { ...STAND, expr: 'sorpreso', squash: 0.84 + 0.16 * u, legA: [-16, 30 * (1 - u)], legB: [16, -30 * (1 - u)], armA: [-60, -20], armB: [60, 20] }; }
  else { x = X_ON_BTN; ground = top; p = { ...STAND, expr: tp < 29.2 ? 'furbo' : 'determinato', tilt: tp < 29.2 ? 5 : 0 }; }
  if (tp >= 29.4 && tp < 29.9) p = { ...p, view: 'q', armB: [120, -30], handB: 'point', expr: 'determinato' };
  if (tp >= 30.8) p = { ...p, view: 'q', armB: [110, -20], handB: 'point', expr: 'determinato' };
  if (tp < 25.2) x = lerp(540, 80, ease(span(tp, 25.0, 25.2)));

  let label = 'ISCRIVITI ORA*', fill = MAGENTA, note = '*etichetta da verificare con Bitkit';
  if (t >= 29.2) { label = 'SONO PRONTO A GIOCARE'; fill = '#1FA37A'; note = ''; }
  if (t >= 29.95) { label = 'VAI AL TUO MATCH'; fill = MAGENTA; }
  const press = t >= 26.6 && t < 27.0 ? 1 : 0;
  const glow = t >= 29.95 ? 0.6 + 0.4 * Math.sin(t * 12) : press;
  let s = dentro(t) + sheet(t) + button(BTN.x, BTN.y, BTN.w, BTN.h, label, { fill, press, glow, note });
  // l'avatar vola nella lista partecipanti
  if (t >= 27.0 && t < 27.6) { const q = arc([X_ON_BTN, top - 300], [860, 940], 200, ease(span(t, 27.0, 27.6))); s += `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="34" fill="#D9DCE8" stroke="${BLUE}" stroke-width="5"/>` + text(q[0], q[1] + 9, 'TU', 22, BLUE); }
  // orologio: salto al giorno del torneo
  const co = span(t, 27.8, 28.1) * (1 - span(t, 28.9, 29.2));
  if (co > 0) s += clock(540, 620, 220, t - 27.8, co);
  // onde dei tocchi
  for (const tt of [29.6, 30.95]) {
    const u = span(t, tt, tt + 0.4);
    if (u > 0 && u < 1) s += `<circle cx="${X_ON_BTN + 130}" cy="${BTN.y}" r="${f(30 + 160 * u)}" fill="none" stroke="#fff" stroke-width="6" opacity="${f((1 - u) * 100) / 100}"/>`;
  }
  const sc = lerp(SC_IN, SC_SHEET, ease(span(tp, 25.6, 26.6)));
  return s + hero(p, x, ground, sc, true);
}

// Scena 06 · Ora si gioca · 31-35 s
function s06(t) {
  const top = BTN.y - BTN.h / 2;
  if (t < 31.5) { // la botola si apre e lo risucchia
    const u = span(t, 31.0, 31.5);
    const hole = `<rect x="${BTN.x - BTN.w / 2}" y="${BTN.y - BTN.h / 2}" width="${BTN.w}" height="${BTN.h}" rx="${BTN.h / 2}" fill="#07030F"/>`;
    const flaps = g(button(0, 0, BTN.w, BTN.h, 'VAI AL TUO MATCH'), `translate(${BTN.x} ${BTN.y}) scale(1 ${f(Math.max(0.02, 1 - easeOut(clamp(u * 2))) * 100) / 100})`);
    const drop = easeIn(u) * 700;
    const p = { ...STAND, expr: 'sorpreso', planted: false, armA: [-160, -10], armB: [160, 10], hair: 22 };
    const zoom = lerp(1, 2.2, easeIn(u));
    return cam(dentro(t) + sheet(t) + hole + flaps + hero(p, X_ON_BTN, top + drop, SC_SHEET, true), lerp(W / 2, X_ON_BTN, clamp(u * 2)), lerp(H / 2, BTN.y, clamp(u * 2)), zoom);
  }
  if (t < 33.4) { // tunnel degli spogliatoi, con la luce in fondo
    const u = span(t, 31.5, 33.4);
    let s = `<rect width="${W}" height="${H}" fill="#07030F"/>`;
    const vx = 540, vy = 900;
    for (let i = 0; i < 12; i++) {
      const k = ((i / 12 + u * 1.6) % 1), sc = Math.pow(k, 2.2) * 3.2;
      const col = lerp(0, 1, span(u, 0.2, 0.7)) > 0.5 ? '#5A5E78' : BLUE;
      s += `<rect x="${f(vx - 420 * sc)}" y="${f(vy - 760 * sc)}" width="${f(840 * sc)}" height="${f(1520 * sc)}" rx="${f(60 * sc)}" fill="none" stroke="${col}" stroke-width="${f(6 + 30 * sc)}" opacity="${f(k * 100) / 100}"/>`;
    }
    const light = easeIn(span(u, 0.35, 1));
    s += `<ellipse cx="${vx}" cy="${vy}" rx="${f(60 + 1400 * light)}" ry="${f(100 + 2400 * light)}" fill="url(#tunnelLight)"/>`;
    const p = { ...STAND, expr: 'sorpreso', planted: false, armA: [-150, -30], armB: [150, 30], legA: [-30, 30], legB: [30, -30], hair: 20, tilt: 10 * Math.sin(u * 12) };
    const sc = lerp(0.9, 0.5, u);
    s += g(hero(p, 0, 0, sc, true), `translate(540 ${f(lerp(1300, 1250, u))}) rotate(${f(u * 25)})`);
    return s;
  }
  // campo di Tennis Clash: atterraggio a fondo campo
  const u = span(t, 33.4, 33.8);
  let p = { ...STAND, expr: 'sorpreso', planted: false, lift: 600 * (1 - u) * (1 - u), armA: [-120, -20], armB: [120, 20] };
  if (t >= 33.8) p = { ...STAND, expr: 'esultanza', squash: t < 34.0 ? 0.86 : 1, armA: [-30, 150], armB: [165, -12], handA: 'fist', handB: 'fist' };
  if (t >= 34.4) p = swipePose(t, 34.4);
  const flash = 1 - span(t, 33.4, 33.7);
  return tennisClash(t) + hero(p, 300, 1760, 0.5, false) + swipe(t, 34.4, [210, 1560], [560, 1260], [900, 1380]) +
    `<rect width="${W}" height="${H}" fill="#fff" opacity="${f(flash * 100) / 100}"/>`;
}
function swipePose(t, t0) {
  const u = ease(span(t, t0, t0 + 0.4));
  return { ...STAND, view: 'q', expr: 'determinato', armB: [lerp(-60, 140, u), -20], armA: [-20, -10], handB: 'point', lean: 6 };
}
// scia rossa del dito: diventa la traiettoria del colpo
function swipe(t, t0, a, b, c) {
  const u = span(t, t0, t0 + 0.4), out = span(t, t0 + 0.6, t0 + 1.0);
  if (u <= 0 || out >= 1) return '';
  return `<path d="M${a[0]} ${a[1]} Q${b[0]} ${b[1]} ${c[0]} ${c[1]}" fill="none" stroke="#FF2A3D" stroke-width="18" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f((1 - u) * 100) / 100}" opacity="${f((1 - out) * 100) / 100}" filter="url(#neon)"/>`;
}

// Scena 07 · Gameplay · 35-45 s
const SHOTS = [
  { t0: 35.2, from: [520, 1620], to: [640, 820], back: [430, 1560], a: [200, 1600], b: [520, 1300], c: [860, 1420] },
  { t0: 37.6, from: [430, 1560], to: [400, 860], back: [640, 1600], a: [880, 1600], b: [560, 1280], c: [220, 1400] },
  { t0: 40.0, from: [640, 1600], to: [860, 800], back: null, a: [180, 1650], b: [520, 1250], c: [940, 1300] },
];
function s07(t) {
  let ballPos = null, sw = '', p = { ...STAND, expr: 'determinato' };
  for (const [i, s] of SHOTS.entries()) {
    if (t >= s.t0) {
      sw = swipe(t, s.t0, s.a, s.b, s.c) || sw;
      p = swipePose(t, s.t0);
      const slow = i === 2 ? 2.0 : 1; // rallenty sul vincente
      const hit = s.t0 + 0.4, u1 = span(t, hit, hit + 0.8 * slow);
      if (t >= hit && u1 < 1) ballPos = arc(s.from, s.to, 260, u1);
      else if (u1 >= 1 && s.back) { const u2 = span(t, hit + 0.8, hit + 1.6); if (u2 < 1) ballPos = arc(s.to, s.back, 200, u2); }
    }
  }
  if (t >= 42.2) { const u = span(t, 42.2, 43.0); p = { ...STAND, expr: 'esultanza', planted: false, lift: 160 * Math.sin(Math.PI * u), armA: [-150, -10], armB: [150, 10] }; }
  if (t >= 43.0) p = { ...STAND, expr: 'esultanza', armA: [-30, 150], armB: [165, -12], handA: 'fist', handB: 'fist' };
  // due tagli ritmati sulla musica
  const cut = t >= 37.6 && t < 40.0 ? 1.12 : t >= 40.0 && t < 42.2 ? 1.22 : 1;
  const scene = tennisClash(t, { labelOp: cut === 1 ? 1 : 0.6 }) + (ballPos ? `<circle cx="${f(ballPos[0])}" cy="${f(ballPos[1])}" r="${f(lerp(14, 26, (ballPos[1] - 700) / 1000))}" fill="#E8F55A" stroke="${C.ink}" stroke-width="3"/>` : '') +
    hero(p, 300, 1760, 0.5, false) + sw;
  return cam(scene, 540, cut === 1 ? H / 2 : 900, cut);
}

// T7 · anello: la camera arretra, il campo diventa lo schermo del telefono in mano a Ciuffo
function t7(t) {
  const u = easeOut(span(t, 43.4, 45.0));
  const s = Math.exp(lerp(Math.log(ZOOM_PHONE), Math.log(FRAME_OUT.s), u));
  const k = clamp((u - 0.6) / 0.4), cx = lerp(PHONE.x, FRAME_OUT.cx, k), cy = lerp(PHONE.y, FRAME_OUT.cy, k);
  const vib = t > 44.5 ? 4 * Math.sin(t * 90) * (1 - span(t, 44.5, 45.0)) : 0;
  const scr = t > 44.5 ? vittoria() : tennisClash(t, { labelOp: 0 }) + hero({ ...STAND, expr: 'esultanza', armA: [-30, 150], armB: [165, -12], handA: 'fist', handB: 'fist' }, 300, 1760, 0.5, false);
  const p = { ...SEAT, expr: 'sorpreso' };
  return cam(fuori(t) + hero(p, CX_SEAT, G_OUT, SC_OUT, false) + phone(PHONE.x + vib, PHONE.y, 0, inScreen(scr)), cx, cy, s);
}
const vittoria = () => `<rect width="${W}" height="${H}" fill="${BLUE}"/>` + placeholder(80, 300, 920, 1300, 'VITTORIA', { fill: '#2A4FA8', dark: true, sub: 'schermata reale myFITP' });

// Scena 08 · End frame · 45-52 s
function s08(t) {
  const tp = on2(t);
  let body, rot = 0;
  const glow = 0.5 + 0.5 * span(t, 45, 46);
  if (tp < 46.8) {
    if (tp >= 46.0) rot = 360 * ease(span(t, 46.0, 46.8));
    body = seatedScene(t, { expr: tp < 45.6 ? 'incuriosito' : 'sorriso' }, { screen: vittoria(), phoneRot: rot, glow });
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
  const verbs = ['ENTRA IN MYFITP.', 'TESSERATI.', 'ISCRIVITI.', 'GIOCA.'];
  verbs.forEach((v, i) => {
    const u = easeOut(span(t, 48.8 + i * 0.25, 49.1 + i * 0.25));
    if (u > 0) gfx += text(W / 2, 230 + i * 76 + (1 - u) * 30, v, 60, C.ink, { op: u });
  });
  const u8 = span(t, 50.0, 50.6);
  if (u8 > 0) {
    gfx += `<path d="M190 690 Q540 650 890 682" fill="none" stroke="${C.pink}" stroke-width="44" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f((1 - u8) * 100) / 100}" opacity="0.9"/>`;
    gfx += `<path d="M210 710 Q540 680 870 700" fill="none" stroke="${C.cyan}" stroke-width="16" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f((1 - span(t, 50.2, 50.8)) * 100) / 100}" opacity="0.9"/>`;
    gfx += g(text(W / 2, 650, 'Tocca a te.', 150, C.ink), `translate(540 610) scale(${f(back(clamp(u8 * 1.5)) * 100) / 100}) translate(-540 -610)`);
  }
  const ud = easeOut(span(t, 50.6, 51.0));
  if (ud > 0) gfx += text(W / 2, 790, 'esports.fitp.it', 52, C.ink, { weight: 700, op: ud });
  const ul = easeOut(span(t, 50.8, 51.2));
  if (ul > 0) ['LOGO eSports FITP', 'LOGO FITP', 'LOGO Tennis Clash'].forEach((l, i) =>
    gfx += placeholder(90 + i * 310, 830, 280, 100, l, { fill: 'rgba(255,255,255,0.7)', sub: '', rx: 18, op: ul }));
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
    s += g(`<rect x="60" y="${f(y - 78)}" width="960" height="112" rx="20" fill="#1C0F3A" opacity="0.72"/>` +
      text(120, y, n, 72, C.cyan, { anchor: 'start' }) + text(185, y - 4, '·', 72, '#fff', { anchor: 'start' }) +
      text(230, y - 8, l, l.length > 16 ? 50 : 60, '#fff', { anchor: 'start' }) +
      `<path d="M230 ${f(y + 14)} L${230 + l.length * (l.length > 16 ? 33 : 40)} ${f(y + 10)}" stroke="${C.pink}" stroke-width="6" stroke-linecap="round"/>`, '', u);
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
  [26.6, 27.8, 'VO (A): «Fatto.»  ·  SFX: «boing» + tre note'],
  [27.8, 29.2, 'SFX: ticchettio accelerato · salto al giorno del torneo'],
  [30.45, 30.95, 'SILENZIO TOTALE 0,5 s'],
  [31.0, 33.4, 'T5 Il tasto botola · whoosh'],
  [33.4, 34.4, 'MUSICA: drop · VO (A): «E adesso si gioca.»'],
  [34.4, 35.0, 'T6 Lo swipe diventa colpo'],
  [35.0, 43.4, 'AUDIO: solo suoni reali di Tennis Clash'],
  [43.4, 45.0, 'T7 L\'anello: si torna alla panchina'],
  [46.0, 49.5, 'VO (A): «È tutto qui. Tocca a te.»'],
  [50.0, 50.8, 'T8 Il gesso diventa pennellata · colpo secco di racchetta'],
];
function overlay(t) {
  const sc = SCENES.find(([a, b]) => t >= a && t < b) || SCENES[SCENES.length - 1];
  const tc = `${String(Math.floor(t)).padStart(2, '0')}:${String(Math.floor((t % 1) * FPS)).padStart(2, '0')}`;
  let s = `<rect width="${W}" height="64" fill="#000" opacity="0.72"/>` +
    text(24, 44, `ANIMATIC v1 · BOZZA`, 28, '#FFD84A', { anchor: 'start', weight: 800, font: 'monospace' }) +
    text(W / 2 + 60, 44, `SC ${sc[2]}`, 28, '#fff', { weight: 700, font: 'monospace' }) +
    text(W - 24, 44, tc, 30, '#fff', { anchor: 'end', weight: 700, font: 'monospace' });
  const note = NOTES.filter(([a, b]) => t >= a && t < b).map(n => n[2]);
  note.forEach((n, i) => {
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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}` +
    `<rect width="${W}" height="${H}" fill="#000"/>${s}${supers(t)}${o.clean ? '' : overlay(t)}</svg>`;
}
