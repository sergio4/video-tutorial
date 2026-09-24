// Animatic v3 di «Tocca a te»: master verticale 1080x1920, 25 fps, durata dalla timeline (~85 s).
// Regia: 03_regia/v3_analisi_e_piano.md. Un solo foglio (carta e linea che vibra ovunque),
// un solo viaggio (il mondo myFITP è un sentiero continuo percorso da sinistra a destra),
// transizioni fatte da oggetti che si muovono o si trasformano, teletrasporto come motivo ricorrente.
// Tutti i tempi arrivano da timeline.json (TL.cue), la stessa usata per voce, musica ed effetti.
import { ciuffo, shadow, paperBG, racketHead, C } from './ciuffo.js';
import { A, TL } from './assets.js';
import * as M from './myfitp.js';
import { arena, net, rival, rivalRacket, hud, ball as tBall, courtPt } from './arena.js';

export const W = 1080, H = 1920, FPS = 25;
export const duration = () => TL.dur;
let Q = {}; // cue della timeline, assegnati a ogni fotogramma
const O = () => TL.opts || {}; // opzioni del taglio (es. social: true nel taglio da 30 s)

// ---------- utilità ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, u) => a + (b - a) * u;
const span = (t, a, b) => clamp((t - a) / (b - a));
const smooth = u => 0.5 - 0.5 * Math.cos(Math.PI * clamp(u));
const easeIn = u => u * u * u;
const easeOut = u => 1 - Math.pow(1 - u, 3);
const back = u => { const s = 1.5; return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); };
const on2 = t => Math.floor(t * FPS / 2) * 2 / FPS; // personaggio a passo due
const f = n => (Math.round(n * 10) / 10).toString();
const f3 = n => n.toFixed(3);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const arc = (p0, p1, h, u) => [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) - h * 4 * u * (1 - u)];
const hash = (i, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
function mix(p, q, u) { // interpola due pose; vista ed espressione passano a metà
  const o = { ...(u < 0.5 ? p : q) };
  for (const k of Object.keys(q)) {
    if (typeof p[k] === 'number' && typeof q[k] === 'number') o[k] = lerp(p[k], q[k], u);
    else if (Array.isArray(p[k]) && Array.isArray(q[k])) o[k] = p[k].map((v, i) => lerp(v, q[k][i], u));
  }
  return o;
}
const g = (inner, tr = '', op = 1) => `<g${tr ? ` transform="${tr}"` : ''}${op < 1 ? ` opacity="${f3(op)}"` : ''}>${inner}</g>`;

// ---------- tipografia: tre livelli ----------
const F_TITLE = "Unbounded, 'Arial Black', sans-serif";   // L1 titoli
const F_HAND = "Caveat, 'Segoe Print', cursive";           // L2 sottotitoli, L3 note
function text(x, y, s, size, fill, o = {}) {
  const { anchor = 'middle', font = F_TITLE, weight = 900, op = 1, outline, ls = 0 } = o;
  const st = outline ? ` stroke="${outline}" stroke-width="${o.ow || 8}" paint-order="stroke" stroke-linejoin="round"` : '';
  return `<text x="${f(x)}" y="${f(y)}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}${st}${op < 1 ? ` opacity="${f3(op)}"` : ''}>${esc(s)}</text>`;
}
// scrittura progressiva: il testo si rivela da sinistra a destra come se venisse scritto
let clipN = 0;
function written(svg, x0, y0, w, h, u) {
  if (u <= 0) return '';
  if (u >= 1) return svg;
  const id = 'wr' + (clipN++);
  return `<clipPath id="${id}"><rect x="${f(x0)}" y="${f(y0)}" width="${f(w * easeOut(u))}" height="${f(h)}"/></clipPath><g clip-path="url(#${id})">${svg}</g>`;
}

// ---------- disegno a mano ----------
// rettangolo arrotondato con il bordo leggermente irregolare
function wobRect(x, y, w, h, r, seed, amp = 3) {
  const pts = [];
  const side = (x0, y0, x1, y1, nx, ny) => {
    const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 70));
    for (let i = 0; i < n; i++) { const u = i / n, j = (hash(pts.length, seed) - 0.5) * 2 * amp; pts.push([lerp(x0, x1, u) + nx * j, lerp(y0, y1, u) + ny * j]); }
  };
  side(x + r, y, x + w - r, y, 0, 1); side(x + w, y + r, x + w, y + h - r, 1, 0);
  side(x + w - r, y + h, x + r, y + h, 0, 1); side(x, y + h - r, x, y + r, 1, 0);
  const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M${m(pts[pts.length - 1], pts[0]).map(f).join(' ')}`;
  pts.forEach((p, i) => { const q = m(p, pts[(i + 1) % pts.length]); d += ` Q${f(p[0])} ${f(p[1])} ${f(q[0])} ${f(q[1])}`; });
  return d + 'Z';
}
function wobCircle(cx, cy, r, seed, amp = 3, u = 1) {
  const n = 18, pts = [];
  for (let i = 0; i <= n * u; i++) { const a = -Math.PI / 2 + i / n * Math.PI * 2 * 1.04, rr = r + (hash(i, seed) - 0.5) * 2 * amp; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  return pts.length > 1 ? 'M' + pts.map(p => p.map(f).join(' ')).join(' L') : '';
}
function wobLine(pts, seed, amp = 3) {
  return 'M' + pts.map((p, i) => `${f(p[0] + (hash(i, seed) - 0.5) * amp)} ${f(p[1] + (hash(i + 50, seed) - 0.5) * amp)}`).join(' L');
}
function sparkle(x, y, r, col, op = 1) {
  return `<path d="M${f(x)} ${f(y - r)} Q${f(x + r * 0.15)} ${f(y - r * 0.15)} ${f(x + r)} ${f(y)} Q${f(x + r * 0.15)} ${f(y + r * 0.15)} ${f(x)} ${f(y + r)} Q${f(x - r * 0.15)} ${f(y + r * 0.15)} ${f(x - r)} ${f(y)} Q${f(x - r * 0.15)} ${f(y - r * 0.15)} ${f(x)} ${f(y - r)}Z" fill="${col}" opacity="${f3(op)}"/>`;
}

const defs = t => `<defs>
<style>@font-face{font-family:'Unbounded';font-weight:900;src:url(${A.font}) format('woff2');}@font-face{font-family:'Caveat';font-weight:700;src:url(${A.hand}) format('woff2');}</style>
<filter id="boil" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="${Math.floor(t * FPS / 2) % 8}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="neon" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="toWhite"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>
<radialGradient id="phoneLight" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.pink}" stop-opacity="0.35"/><stop offset="0.5" stop-color="${C.cyan}" stop-opacity="0.12"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>
<radialGradient id="tpLight" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.55" stop-color="#FFE9F6" stop-opacity="0.85"/><stop offset="1" stop-color="#FFE9F6" stop-opacity="0"/></radialGradient>
<linearGradient id="titleBand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12072E" stop-opacity="0.85"/><stop offset="0.7" stop-color="#12072E" stop-opacity="0.55"/><stop offset="1" stop-color="#12072E" stop-opacity="0"/></linearGradient>
<radialGradient id="vignette" cx="50%" cy="48%" r="75%"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.32"/></radialGradient>
</defs>`;

// camera: porta il punto (cx, cy) del mondo al centro dell'inquadratura con zoom s
const camT = (cx, cy, s) => `translate(${W / 2} ${H / 2}) scale(${f3(s)}) translate(${f(-cx)} ${f(-cy)})`;
// camera a chiavi: [t, x, y, zoom], interpolazione morbida e un leggero respiro «a mano»
function camKeys(keys, t) {
  let k = keys[0];
  if (t <= keys[0][0]) k = keys[0];
  else if (t >= keys[keys.length - 1][0]) k = keys[keys.length - 1];
  else for (let i = 0; i < keys.length - 1; i++) {
    const [a, b] = [keys[i], keys[i + 1]];
    if (t >= a[0] && t <= b[0]) { const u = smooth((t - a[0]) / (b[0] - a[0])); k = [t, lerp(a[1], b[1], u), lerp(a[2], b[2], u), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u))]; break; }
  }
  return { x: k[1] + 5 * Math.sin(t * 0.7), y: k[2] + 4 * Math.sin(t * 0.9 + 1), s: k[3] };
}

// ---------- personaggio ----------
const STAND = { view: 'front', legA: [-3, 0], legB: [3, 0], armA: [-8, -4], armB: [8, 4], lean: 0 };
const SEAT = { view: 'side', legA: [88, -88], legB: [94, -94], armA: [24, 74], armB: [30, 80], lean: 3, hair: 0 };
function walk(t, o = {}, hz = 1.25) {
  const ph = 2 * Math.PI * hz * t, s = Math.sin(ph), c = Math.cos(ph);
  return { view: 'side', lean: 5, legA: [-26 * s, -40 * Math.max(0, -c)], legB: [26 * s, -40 * Math.max(0, c)],
    armA: [24 * s, 18], armB: [-24 * s, 18], hair: -6 - 5 * Math.sin(2 * ph), ...o };
}
function hero(p, x, ground, sc) { return shadow(x, ground, p.lift || 0, sc) + ciuffo({ ...p, x, y: ground, scale: sc }); }
const breathe = t => ({ squash: 1 + 0.012 * Math.sin(t * 2.6), hair: 3 * Math.sin(t * 1.7) });
const blinkAt = (t, expr, times) => times.some(b => t > b && t < b + 0.12) ? 'blink' : expr;

// ---------- mondo «fuori»: il circolo ----------
const G_OUT = 1560, SC_OUT = 0.8, BENCH_X = 180, BENCH_W = 560, SEAT_Y = G_OUT - 117 * SC_OUT, CX_SEAT = 360;
const PHONE = { x: CX_SEAT + 150 * SC_OUT, y: G_OUT - 300 * SC_OUT, sw: 37.1, sh: 66 };
const ZOOM_PHONE = H / PHONE.sh;
const FRAME_OUT = { x: 540, y: 1110, s: 1.2 };
const FRAME_END = { x: 540, y: 780, s: 1.0 };
function fuori(t, o = {}) {
  let s = `<rect x="-1200" y="-1200" width="${W + 2400}" height="${H + 2400}" fill="${C.paper}"/>` + paperBG(W, H, 1180);
  // cielo del circolo: nuvole disegnate che scorrono, uccelli, lampione e rete di recinzione dietro la siepe
  const calm = 1 - (o.calm || 0);
  if (calm > 0) for (const [x0, y, w] of [[-100, 420, 300], [520, 300, 380], [880, 560, 240], [180, 700, 200]]) {
    const x = ((x0 + t * 14) % 1500) - 250;
    s += `<path d="M${f(x)} ${y} q${f(w * 0.12)} ${f(-w * 0.2)} ${f(w * 0.3)} ${f(-w * 0.08)} q${f(w * 0.14)} ${f(-w * 0.2)} ${f(w * 0.34)} ${f(-w * 0.02)} q${f(w * 0.22)} ${f(-w * 0.04)} ${f(w * 0.36)} ${f(w * 0.1)} Z" fill="#FFFDF7" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round" opacity="${f3(calm)}"/>`;
  }
  if (calm > 0 && !o.bare) for (let i = 0; i < 3; i++) {
    const bx = ((120 + i * 70 + t * 40) % 1400) - 200, by = 520 + i * 26 + 8 * Math.sin(t * 3 + i), w = 4 + 3 * Math.sin(t * 9 + i * 2);
    s += `<path d="M${f(bx - 16)} ${f(by - w)} Q${f(bx - 6)} ${f(by - 2)} ${f(bx)} ${f(by + 2)} Q${f(bx + 6)} ${f(by - 2)} ${f(bx + 16)} ${f(by - w)}" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>`;
  }
  if (!o.bare && calm > 0) s += `<path d="M1010 1180 L1020 600 M984 600 L1056 600 L1050 630 L990 630 Z" fill="#E9E1D2" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round" opacity="${f3(calm)}"/>`;
  let fence = '';
  for (let x = -600; x <= W + 600; x += 90) fence += `M${x} 1180 L${x} 1010 `;
  for (let x = -600; x <= W + 600; x += 30) fence += `M${x} 1030 l30 60 M${x + 30} 1030 l-30 60 M${x} 1090 l30 60 M${x + 30} 1090 l-30 60 `;
  if (!o.bare && calm > 0) s += `<path d="${fence}" stroke="${C.ink}" stroke-width="2.5" opacity="${f3(0.35 * calm)}"/><path d="M-600 1012 L${W + 600} 1012" stroke="${C.ink}" stroke-width="5" opacity="${f3(0.6 * calm)}"/>`;
  let hedge = `M-600 1180`;
  for (let x = -600; x <= W + 600; x += 60) hedge += ` Q${x + 30} ${1150 + (Math.abs(x) % 120 ? 6 : -4)} ${x + 60} 1180`;
  s += `<path d="${hedge} L${W + 600} 1260 L-600 1260 Z" fill="#7C8F63" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>`;
  s += `<rect x="-600" y="1260" width="${W + 1200}" height="${H}" fill="#C65A2E"/><path d="M-600 1262 L${W + 600} 1262" stroke="${C.ink}" stroke-width="5"/>`;
  s += `<path d="${wobLine([[-200, 1330], [W + 200, 1330]], 3, 4)} M${wobLine([[720, 1330], [1200, 1830]], 4, 4).slice(1)} M${wobLine([[300, 1330], [-200, 1850]], 5, 4).slice(1)}" stroke="#F6EFE4" stroke-width="10" opacity="0.9" fill="none" stroke-linecap="round"/>`;
  for (let i = 0; i < 140; i++) s += `<circle cx="${(i * 397) % (W + 400) - 200}" cy="${1270 + (i * 211) % 700}" r="${1.5 + (i % 3)}" fill="${C.ink}" opacity="0.08"/>`;
  const bx = BENCH_X, bw = BENCH_W, sy = SEAT_Y;
  s += `<path d="${wobRect(bx + 30, sy, 16, G_OUT - sy + 10, 2, 11, 1.5)}" fill="#8A5A3B" stroke="${C.ink}" stroke-width="5"/><path d="${wobRect(bx + bw - 46, sy, 16, G_OUT - sy + 10, 2, 12, 1.5)}" fill="#8A5A3B" stroke="${C.ink}" stroke-width="5"/>`;
  s += `<path d="${wobRect(bx, sy - 10, bw, 34, 6, 13, 2)}" fill="#B07A4F" stroke="${C.ink}" stroke-width="5"/>`;
  const n = o.tallies ?? 3; // tacche di gesso: le amichevoli fatte
  for (let i = 0; i < Math.min(n, 4); i++) {
    const k = i === 3 ? (o.tally4 ?? 1) : 1, x = bx + bw - 180 + i * 26;
    s += `<path d="M${x} ${sy + 18} L${f(x + 6 * k)} ${f(sy + 18 - 22 * k)}" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>`;
  }
  if (o.glow) s += `<ellipse cx="${PHONE.x}" cy="${PHONE.y}" rx="${f(700 * o.glow)}" ry="${f(700 * o.glow)}" fill="url(#phoneLight)"/>`;
  return s;
}
function phone(x, y, rot = 0, screen = '') {
  return g(`<rect x="-23" y="-42" width="46" height="84" rx="8" fill="${C.ink}"/>` +
    (screen || `<rect x="${-PHONE.sw / 2}" y="${-PHONE.sh / 2}" width="${PHONE.sw}" height="${PHONE.sh}" rx="3" fill="${C.cyan}" opacity="0.85"/>`),
    `translate(${f(x)} ${f(y)}) rotate(${f(rot)})`);
}
const inScreen = inner => `<svg x="${-PHONE.sw / 2}" y="${-PHONE.sh / 2}" width="${PHONE.sw}" height="${PHONE.sh}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><rect width="${W}" height="${H}" fill="#000"/>${inner}</svg>`;
const vittoriaFull = () => g(M.vittoria(H * M.UW / W), `scale(${f3(W / M.UW)})`);

// ---------- teletrasporto: il motivo ricorrente ----------
// anelli disegnati a mano che corrono verso la camera, scintille, luce in fondo; u 0…1
function teleport(t, u, pal = 0) {
  const cols = pal ? [M.COL.blue, C.pink, '#5B35D6', C.cyan] : ['#5B35D6', C.cyan, C.pink, '#8C6CF0'];
  let s = `<rect width="${W}" height="${H}" fill="#12072E"/>`;
  const vx = 540, vy = 900;
  for (let i = 0; i < 14; i++) {
    const k = (i / 14 + u * 1.5) % 1, sc = Math.pow(k, 2.3) * 3.4;
    if (sc < 0.02) continue;
    s += `<path d="${wobRect(vx - 420 * sc, vy - 760 * sc, 840 * sc, 1520 * sc, 70 * sc, i + Math.floor(t * 12.5) % 3, 6 * sc + 2)}" fill="none" stroke="${cols[i % 4]}" stroke-width="${f(5 + 26 * sc)}" stroke-linejoin="round" opacity="${f3(clamp(k * 1.4))}"/>`;
  }
  for (let i = 0; i < 40; i++) { // scintille che scorrono verso l'esterno
    const a = hash(i, 3) * Math.PI * 2, k = (hash(i, 4) + u * 1.3) % 1, r = 60 + Math.pow(k, 2) * 1300;
    s += sparkle(vx + Math.cos(a) * r, vy + Math.sin(a) * r * 1.6, 6 + 18 * k, i % 2 ? C.cyan : '#FFE45C', clamp(k * 2) * (1 - k));
  }
  const light = easeIn(span(u, 0.45, 1));
  s += `<ellipse cx="${vx}" cy="${vy}" rx="${f(40 + 1500 * light)}" ry="${f(70 + 2600 * light)}" fill="url(#tpLight)"/>`;
  return s;
}
function flyer(t, u, x, y, sc) { // Ciuffo che attraversa il tunnel
  const p = { ...STAND, expr: 'sorpreso', planted: false, armA: [-150, -30], armB: [150, 30], legA: [-30, 30], legB: [30, -30], hair: 22, tilt: 8 * Math.sin(t * 5) };
  return g(ciuffo({ ...p, x: 0, y: 0, scale: sc }), `translate(${f(x)} ${f(y)}) rotate(${f(u * 40 - 10)})`);
}

// ---------- mondo «dentro»: un sentiero continuo ----------
const P = [540, 1640, 2740];                 // tappe 1, 2, 3 (x del mondo)
const BOARD = { w: 760, top: 500, h: 1000 }; // bacheche myFITP piantate nel terreno
const BK = BOARD.w / M.UW, BH = BOARD.h / BK;
const bx0 = px => px - 440;
const groundY = x => 1650 + 28 * Math.sin(x / 400) + 12 * Math.sin(x / 137 + 1);
const SC_IN = 0.7;
const STAND_X = [P[0] + 390, P[1], P[2] + 400];
const toWorld = (px, [ax, ay]) => [bx0(px) + ax * BK, BOARD.top + ay * BK];

function skyColors(t) {
  const night = [[23, 10, 56], [58, 31, 120]], dawn = [[91, 63, 168], [244, 167, 185]], morning = [[46, 42, 143], [122, 111, 214]];
  const u1 = span(t, Q.day + 0.3, Q.day + 1.3), u2 = span(t, Q.day + 1.3, Q.ready_btn);
  const pick = i => [0, 1, 2].map(c => Math.round(lerp(lerp(night[i][c], dawn[i][c], u1), morning[i][c], u2)));
  return [pick(0), pick(1)].map(c => `rgb(${c.join(',')})`);
}
// sfondo con parallasse: cielo, stelle, colline lontane e vicine, cespugli al neon, terreno
function landscape(t, cam) {
  const [top, bot] = skyColors(t);
  const par = p => `translate(${f(cam.x * (1 - p))} ${f((cam.y - 960) * (1 - p))})`;
  let s = `<linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient>`;
  s += g(`<rect x="-800" y="-900" width="${W + 1600}" height="3200" fill="url(#skyG)"/>`, par(0));
  const starOp = 1 - span(t, Q.day, Q.day + 1.0);
  if (starOp > 0) {
    let st = '';
    for (let i = 0; i < 40; i++) st += sparkle(-300 + hash(i, 1) * 1700, 60 + hash(i, 2) * 900, 5 + 7 * hash(i, 5), i % 3 ? '#FFF6D8' : C.cyan, starOp * (0.5 + 0.5 * Math.sin(t * 2 + i)));
    s += g(st, par(0.12));
  }
  // sole che attraversa il cielo nel «giorno del torneo»
  const su = span(t, Q.day, Q.ready_btn + 0.6);
  if (su > 0) {
    const sx = lerp(-80, 820, su), sy = 980 - 620 * Math.sin(Math.PI * Math.min(1, su * 0.9 + 0.1)) * 1.0;
    let rays = '';
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 0.4; rays += `M${f(sx + Math.cos(a) * 110)} ${f(sy + Math.sin(a) * 110)} L${f(sx + Math.cos(a) * 150)} ${f(sy + Math.sin(a) * 150)} `; }
    s += g(`<circle cx="${f(sx)}" cy="${f(sy)}" r="86" fill="#FFD27A" stroke="${C.ink}" stroke-width="6"/><path d="${rays}" stroke="#FFD27A" stroke-width="12" stroke-linecap="round"/>`, `translate(${f(cam.x - W / 2)} ${f(cam.y - 960)})`, clamp(su * 4));
  }
  const hills = (base, a1, a2, p1, col, sw, seed) => {
    let d = `M-800 ${H + 400}`;
    for (let x = -800; x <= 4600; x += 60) d += ` L${x} ${f(base + a1 * Math.sin(x / p1 + seed) + a2 * Math.sin(x / (p1 * 0.47) + seed * 2))}`;
    return `<path d="${d} L4600 ${H + 400} Z" fill="${col}" stroke="${C.ink}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  };
  s += g(hills(1160, 70, 30, 310, '#2B1763', 4, 1), par(0.35));
  s += g(hills(1370, 55, 25, 230, '#3A2280', 5, 2), par(0.6));
  let tufts = '';
  for (let i = 0; i < 46; i++) {
    const x = -600 + i * 110 + hash(i, 7) * 60, y = 1400 + 30 * Math.sin(x / 230 + 2) + 40;
    const col = i % 3 ? C.cyan : C.pink;
    tufts += `<path d="M${f(x - 18)} ${f(y)} Q${f(x - 14)} ${f(y - 40)} ${f(x - 2)} ${f(y - 52)} M${f(x)} ${f(y)} Q${f(x + 4)} ${f(y - 48)} ${f(x + 16)} ${f(y - 60)} M${f(x + 14)} ${f(y)} Q${f(x + 22)} ${f(y - 30)} ${f(x + 34)} ${f(y - 36)}" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7"/>`;
  }
  s += g(tufts, par(0.75));
  let gd = `M-800 ${H + 600}`;
  for (let x = -800; x <= 4600; x += 40) gd += ` L${x} ${f(groundY(x))}`;
  s += `<path d="${gd} L4600 ${H + 600} Z" fill="#1A0B3A" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>`;
  let hatch = '';
  for (let i = 0; i < 120; i++) { const x = -700 + i * 42, y = groundY(x) + 40 + (i % 5) * 36; hatch += `M${x} ${y} l18 -10 `; }
  s += `<path d="${hatch}" stroke="#3A2280" stroke-width="4" stroke-linecap="round"/>`;
  return s;
}
// pali e ombra di una bacheca (parte che vibra)
function boardFrame(px, tilt, seed) {
  const x0 = bx0(px), bot = BOARD.top + BOARD.h;
  let s = '';
  for (const dx of [140, BOARD.w - 170]) s += `<path d="${wobRect(x0 + dx, bot - 30, 30, groundY(x0 + dx) - bot + 50, 4, seed + dx, 2)}" fill="#4A2BB8" stroke="${C.ink}" stroke-width="6"/>`;
  s += g(`<path d="${wobRect(x0 + 14, BOARD.top + 18, BOARD.w, BOARD.h, 30, seed, 3)}" fill="${C.ink}" opacity="0.35"/>`, `rotate(${tilt} ${px - 60} ${BOARD.top + BOARD.h / 2})`);
  return s;
}
function boardOutline(px, tilt, seed) {
  return g(`<path d="${wobRect(bx0(px) - 4, BOARD.top - 4, BOARD.w + 8, BOARD.h + 8, 28, seed, 3.5)}" fill="none" stroke="${C.ink}" stroke-width="9" stroke-linejoin="round"/>`,
    `rotate(${tilt} ${px - 60} ${BOARD.top + BOARD.h / 2})`);
}
function boardContent(px, tilt, inner, id) {
  return g(g(M.screen(id, BH, inner), `translate(${f(bx0(px))} ${BOARD.top}) scale(${f3(BK)})`), `rotate(${tilt} ${px - 60} ${BOARD.top + BOARD.h / 2})`);
}
function neonBall(x, y, r = 20, squash = 1) {
  return `<g filter="url(#neon)"><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r / squash)}" ry="${f(r * squash)}" fill="${C.pink}" stroke="${C.ink}" stroke-width="3"/><circle cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.35)}" r="${f(r * 0.3)}" fill="#fff" opacity="0.8"/></g>`;
}
function tag(x, y, rot = 0, s = 1) {
  return g(`<path d="M-40 -26 L30 -26 L50 0 L30 26 L-40 26 Z" fill="#FFD84A" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>` +
    `<circle cx="30" cy="0" r="7" fill="none" stroke="${C.ink}" stroke-width="4"/>` + text(-8, 7, 'TC ID', 17, C.ink),
    `translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f3(s)})`);
}
function tessera(cx, cy, w, flip, o = {}) {
  const h = w * 0.663, sx = Math.abs(Math.cos(Math.PI * flip)), glow = o.glow || 0;
  let face;
  if (flip <= 0.5) face = `<image href="${A.tessera}" x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}"/>`;
  else {
    let tr = '';
    for (let i = 0; i < 6; i++) {
      const yy = -h / 2 + h * (i + 1) / 7;
      tr += `<path d="M${f(-w / 2 + 20)} ${f(yy)} L${f(-w / 6 + i * 10)} ${f(yy)} L${f(-w / 12 + i * 10)} ${f(yy + 14)} L${f(w / 2 - 20)} ${f(yy + 14)}" fill="none" stroke="${C.cyan}" stroke-width="3" opacity="${f3(0.3 + 0.7 * glow)}"/><circle cx="${f(w / 2 - 20)}" cy="${f(yy + 14)}" r="5" fill="${C.cyan}" opacity="${f3(0.3 + 0.7 * glow)}"/>`;
    }
    face = `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="22" fill="#123C9C"/>` + tr +
      `<image href="${A.esports}" x="${f(-w * 0.22)}" y="${f(-h * 0.3)}" width="${f(w * 0.44)}" height="${f(h * 0.6)}" opacity="${f3(0.5 + 0.5 * glow)}"/>`;
  }
  let sh = '';
  if (o.shine >= 0 && o.shine <= 1 && flip <= 0.5) {
    const id = 'shn' + (clipN++), x = lerp(-w * 0.9, w * 0.9, smooth(o.shine));
    sh = `<clipPath id="${id}"><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(w * 0.045)}"/></clipPath>` +
      `<g clip-path="url(#${id})"><path d="M${f(x - 40)} ${f(-h)} L${f(x + 50)} ${f(-h)} L${f(x - 60)} ${f(h)} L${f(x - 150)} ${f(h)} Z" fill="#fff" opacity="0.45"/><path d="M${f(x + 80)} ${f(-h)} L${f(x + 100)} ${f(-h)} L${f(x - 10)} ${f(h)} L${f(x - 30)} ${f(h)} Z" fill="#fff" opacity="0.35"/></g>`;
  }
  const halo = glow > 0 ? `<rect x="${f(-w / 2 - 12)}" y="${f(-h / 2 - 12)}" width="${f(w + 24)}" height="${f(h + 24)}" rx="30" fill="none" stroke="${C.cyan}" stroke-width="7" opacity="${f3(glow * 0.8)}" filter="url(#neon)"/>` : '';
  const shadowC = `<rect x="${f(-w / 2 + w * 0.03)}" y="${f(-h / 2 + w * 0.04)}" width="${f(w)}" height="${f(h)}" rx="${f(w * 0.045)}" fill="${C.ink}" opacity="0.35"/>`;
  return g(shadowC + halo + face + sh + `<path d="${wobRect(-w / 2, -h / 2, w, h, w * 0.045, 5, 2.5)}" fill="none" stroke="${C.ink}" stroke-width="${f(Math.max(3, w / 60))}"/>`,
    `translate(${f(cx)} ${f(cy)}) rotate(${f(o.rot || 0)}) scale(${f3(Math.max(sx, 0.02) * (o.scale || 1))} ${f3(o.scale || 1)})`);
}
// nota a mano (L3) con freccia disegnata verso l'elemento di cui parla
function note(t, tin, tout, x, y, label, target, o = {}) {
  const u = span(t, tin, tin + 0.5), out = span(t, tout - 0.4, tout);
  if (u <= 0 || out >= 1) return '';
  const col = o.col || '#FFE45C';
  const w = label.length * 22;
  let s = written(text(x, y, label, o.size || 50, col, { font: F_HAND, weight: 700, outline: C.ink, ow: 7, anchor: o.anchor || 'middle' }), x - w - 20, y - 60, w * 2 + 40, 90, u);
  const ua = span(t, tin + 0.35, tin + 0.9);
  if (ua > 0 && target) {
    const sx = o.from ? o.from[0] : x, sy = o.from ? o.from[1] : y + 18;
    const mx = (sx + target[0]) / 2 + (o.bend ?? 60), my = (sy + target[1]) / 2 - 20;
    const d = `M${f(sx)} ${f(sy)} Q${f(mx)} ${f(my)} ${f(target[0])} ${f(target[1])}`;
    const ang = Math.atan2(target[1] - my, target[0] - mx);
    const hd = [ang + 2.6, ang - 2.6].map(a => `M${f(target[0])} ${f(target[1])} L${f(target[0] + Math.cos(a) * 26)} ${f(target[1] + Math.sin(a) * 26)}`).join(' ');
    s += `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="12" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f3(1 - easeOut(ua))}"/>`;
    s += `<path d="${d}" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f3(1 - easeOut(ua))}"/>`;
    if (ua >= 1) s += `<path d="${hd}" stroke="${C.ink}" stroke-width="12" stroke-linecap="round"/><path d="${hd}" stroke="${col}" stroke-width="6" stroke-linecap="round"/>`;
  }
  return g(s, '', 1 - out);
}

// ---------- titoli delle tappe (L1 titolo, L2 sottotitolo) ----------
const STEPS = () => O().social ? [
  { n: 1, title: 'Entra in myFITP', tin: Q.tp_land + 0.5, tout: Q.walk1 + 0.7, px: P[0], subs: [[Q.tp_land + 0.8, 'Scarica l’app e collega il tuo ID']] },
  { n: 2, title: 'Tesserati', tin: Q.p2, tout: Q.walk2 + 0.7, px: P[1], subs: [[Q.p2 + 0.3, 'La chiave dei tornei ufficiali']] },
  { n: 3, title: 'Iscriviti a un torneo', tin: Q.p3, tout: Q.match_btn + 0.3, px: P[2], subs: [[Q.p3 + 0.3, 'Scegli il torneo e «Registrati»'], [Q.day, 'Poi «Vai al tuo match»']] },
] : [
  { n: 1, title: 'Entra in myFITP', tin: Q.tp_land + 0.7, tout: Q.walk1 + 0.9, px: P[0], subs: [[Q.tp_land + 1.0, 'Scarica l’app e crea il tuo account'], [Q.tag_throw - 0.9, 'Collega il tuo ID di Tennis Clash']] },
  { n: 2, title: 'Tesserati', tin: Q.p2 + 0.1, tout: Q.walk2 + 0.9, px: P[1], subs: [[Q.p2 + 0.5, 'La chiave dei tornei ufficiali']] },
  { n: 3, title: 'Iscriviti a un torneo', tin: Q.p3 + 0.1, tout: Q.match_btn + 0.3, px: P[2], subs: [[Q.p3 + 0.4, 'Scegli un torneo del tuo livello'], [Q.sheet + 0.4, 'Tocca «Registrati» e conferma'], [Q.day, 'Il giorno del torneo: «Vai al tuo match»']] },
  { n: 4, title: 'Gioca su Tennis Clash', tin: Q.arena + 0.5, tout: TL.shots[0] - 0.9, px: null, subs: [[Q.arena + 0.9, 'Il match si apre da solo']] },
];
function chapter(t, camX) {
  let s = '';
  for (const st of STEPS()) {
    if (t < st.tin || t > st.tout) continue;
    const drift = st.px == null ? 0 : (st.px - camX) * 0.6;
    const op = 1 - span(t, st.tout - 0.6, st.tout);
    const cx = 540 + drift, cy = 262;
    const uc = span(t, st.tin, st.tin + 0.6);
    let b = `<path d="${wobCircle(cx, cy, 44, st.n, 3, easeOut(uc))}" fill="none" stroke="${C.pink}" stroke-width="9" stroke-linecap="round"/>`;
    if (uc > 0.5) b += text(cx, cy + 16, String(st.n), 44, '#fff', { op: span(uc, 0.5, 1) });
    const size = st.title.length > 16 ? 50 : 58;
    const tw = st.title.length * size * 0.74;
    b += written(text(cx, 386, st.title, size, '#fff', { outline: C.ink, ow: 10 }), cx - tw / 2 - 20, 320, tw + 40, 90, span(t, st.tin + 0.35, st.tin + 1.1));
    // sottotitolo: uno alla volta, il precedente sfuma quando arriva il successivo
    st.subs.forEach(([ts, label], i) => {
      const next = st.subs[i + 1];
      if (t < ts || (next && t > next[0])) return;
      const out = next ? span(t, next[0] - 0.35, next[0]) : 0;
      const sw = label.length * 21;
      b += g(written(text(cx, 452, label, 46, '#A8F6FF', { font: F_HAND, weight: 700, outline: C.ink, ow: 6 }), cx - sw / 2 - 20, 410, sw + 40, 60, span(t, ts, ts + 0.8)), '', 1 - out);
    });
    s += g(b, '', op);
  }
  return s;
}

// ---------- scena 1 · circolo (0 → teletrasporto) ----------
function ballOut(t) {
  const b0 = Q.ball_out;
  if (t < b0 || t > b0 + 2.6) return null;
  const P0 = [PHONE.x, PHONE.y], B1 = [760, G_OUT + 90], B2 = [940, G_OUT + 110];
  if (t < b0 + 0.8) return arc(P0, B1, 280, span(t, b0, b0 + 0.8));
  if (t < b0 + 1.6) return arc(B1, B2, 190, span(t, b0 + 0.8, b0 + 1.6));
  return arc(B2, P0, 330, span(t, b0 + 1.6, b0 + 2.6));
}
function sceneBench(t) {
  const tp = on2(t);
  let expr = blinkAt(tp, 'annoiato', [0.9, 3.9]), tilt = 0, hair = -4;
  if (tp >= Q.ball_out + 0.2) { expr = 'incuriosito'; tilt = 5 * Math.sin((tp - Q.ball_out) * 2.2); hair = 4; }
  if (tp >= Q.look_cam) { expr = 'furbo'; tilt = 4; }
  const lift = tp >= Q.look_cam + 1.2 ? Math.min(1, (tp - Q.look_cam - 1.2) / 0.6) : 0; // alza il telefono
  const p = { ...SEAT, ...breathe(t), expr, tilt, hair, armB: [30 - 20 * lift, 80 + 10 * lift] };
  const screen = t > Q.tp_in - 0.3 ? inScreen(teleport(t, span(t, Q.tp_in - 0.3, Q.tp_in + 2.1))) : '';
  const world = fuori(t) + hero(p, CX_SEAT, G_OUT, SC_OUT) + phone(PHONE.x, PHONE.y - 20 * lift, 0, screen);
  let ball = '';
  for (let i = 5; i >= 0; i--) { const q = ballOut(t - i * 0.035); if (q) ball += i ? `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(18 - i * 2)}" fill="${C.pink}" opacity="${f3(0.35 - i * 0.05)}"/>` : neonBall(q[0], q[1], 18); }
  // lenta spinta della camera, poi dentro lo schermo
  const push = smooth(span(t, 0, Q.tp_in));
  const s0 = lerp(FRAME_OUT.s, 1.32, push), x0 = lerp(FRAME_OUT.x, 500, push), y0 = lerp(FRAME_OUT.y, 1170, push);
  const u = easeIn(span(t, Q.tp_in, Q.tp_in + 1.0));
  const s = Math.exp(lerp(Math.log(s0), Math.log(ZOOM_PHONE), u));
  const cx = lerp(x0, PHONE.x, clamp(u * 2.5)), cy = lerp(y0, PHONE.y - 20 * lift, clamp(u * 2.5));
  return { boil: g(world + ball, camT(cx, cy, s)), flat: '' };
}

// ---------- scena 2 · il sentiero myFITP ----------
const CAM_IN = () => [
  [Q.tp_land, 600, 1000, 1.16], [Q.tp_land + 1.8, 540, 960, 1.0], [Q.walk1 + 0.2, 540, 960, 1.0], [Q.p2 + 0.2, P[1], 960, 1.0],
  [Q.card_catch - 0.2, P[1], 960, 1.0], [Q.present + 0.5, P[1] - 60, 900, 1.08], [Q.card_store, P[1] - 60, 900, 1.08],
  [Q.road + 0.3, P[1], 960, 1.0], [Q.walk2 + 0.2, P[1] + 60, 960, 1.0], [Q.p3, P[2], 960, 1.0], [Q.popup - 0.2, P[2], 960, 1.0],
  [Q.popup + 0.5, P[2] - 20, 900, 1.12], [Q.seats + 0.2, P[2] - 20, 900, 1.12], [Q.day + 0.6, P[2] + 20, 880, 0.94],
  [Q.ready_btn, P[2] + 20, 900, 0.96], [Q.match_btn + 0.4, P[2] + 60, 1000, 1.06], [Q.silence, P[2] + 90, 1080, 1.14], [Q.match_tap, P[2] + 90, 1080, 1.14],
];
let BTN_X = 0, BTN_TOP = 0;
const BTN = () => { const b = M.SHEET_BTN(BH); return { x: bx0(P[2]) + b.x * BK, y: BOARD.top + b.y * BK, w: b.w * BK, h: b.h * BK }; };
// Ciuffo lungo il sentiero: posizione, terreno e posa
function heroPath(t) {
  const tp = on2(t);
  let x = STAND_X[0], p = { ...STAND, ...breathe(t), expr: 'neutro' }, onBtn = 0;
  const L = Q.tp_land;
  if (tp < L + 0.5) { const u = span(tp, L, L + 0.5); p = { ...STAND, expr: 'sorpreso', planted: false, lift: 1400 * Math.pow(1 - u, 2), armA: [-150, -10], armB: [150, 10], legA: [-20, 20], legB: [20, -20], hair: 20 }; }
  else if (tp < L + 0.9) { const u = span(tp, L + 0.5, L + 0.9); p = { ...STAND, expr: 'sorpreso', squash: 0.84 + 0.16 * u, legA: [-18, 30 * (1 - u)], legB: [18, -30 * (1 - u)], armA: [-60, -20], armB: [60, 20] }; }
  else if (tp < Q.doors - 0.2) p = { ...STAND, ...breathe(t), expr: 'incuriosito', tilt: 5 };
  else if (tp < Q.tag_throw - 1.0) p = { ...STAND, ...breathe(t), view: 'q', flip: true, expr: blinkAt(tp, 'neutro', [14.2, 16.4]), tilt: -3 };
  else if (tp < Q.tag_throw - 0.4) p = { ...STAND, view: 'q', flip: true, expr: 'determinato', armB: [-150, 30] };          // mano allo zaino
  else if (tp < Q.tag_snap) { const u = smooth(span(tp, Q.tag_throw - 0.4, Q.tag_throw)); p = { ...STAND, view: 'q', flip: true, expr: 'determinato', armB: [lerp(-150, 150, u), lerp(30, 10, u)] }; }
  else if (tp < Q.ball_hop) p = { ...STAND, ...breathe(t), expr: tp > Q.tag_snap + 0.3 ? 'furbo' : 'determinato', tilt: 6 };
  else if (tp < Q.walk1) p = { ...STAND, view: 'q', expr: 'incuriosito', tilt: 3 };
  else if (tp < Q.p2 - 0.2) { x = lerp(STAND_X[0], STAND_X[1] - 80, smooth(span(tp, Q.walk1, Q.p2 - 0.2))); p = walk(tp, { expr: 'neutro' }, O().walkHz || 1.4); }
  else if (tp < Q.card_catch - 0.6) { x = STAND_X[1] - 80; p = { ...STAND, ...breathe(t), expr: 'incuriosito', tilt: -10 + 6 * Math.sin(tp * 2) }; }
  else if (tp < Q.card_catch) { x = STAND_X[1] - 80; p = { ...STAND, expr: 'determinato', armA: [-160, 0], armB: [160, 0], tilt: -6 }; }
  else if (tp < Q.present) { x = STAND_X[1] - 80; const u = span(tp, Q.card_catch, Q.card_catch + 0.3); p = { ...STAND, expr: 'sorriso', squash: 1 - 0.07 * Math.sin(Math.PI * u), armA: [-165, -5], armB: [165, 5], tilt: -4 }; }
  else if (tp < Q.present + 0.7) { x = STAND_X[1] - 80; p = { ...STAND, expr: 'esultanza', armA: [-150, -10], armB: [150, 10], tilt: -6 }; }   // la solleva come un trofeo
  else if (tp < Q.card_store) { x = STAND_X[1] - 80; p = { ...STAND, ...breathe(t), expr: blinkAt(tp, 'sorriso', [Q.present + 1.6]), tilt: -9, armA: [-20, -30], armB: [20, 30] }; }
  else if (tp < Q.road) { x = STAND_X[1] - 80; const u = smooth(span(tp, Q.card_store, Q.card_store + 0.3)); p = { ...STAND, view: 'q', expr: 'furbo', armB: [lerp(20, -150, u), lerp(30, 30, u)] }; } // la ripone nello zaino
  else if (tp < Q.walk2) { x = STAND_X[1] - 80; p = { ...STAND, ...breathe(t), expr: 'sorriso', tilt: 10 }; }
  else if (tp < Q.p3 - 0.2) { x = lerp(STAND_X[1] - 80, STAND_X[2], smooth(span(tp, Q.walk2, Q.p3 - 0.2))); p = walk(tp, { expr: 'sorriso' }, O().walkHz || 1.5); }
  else if (tp < Q.list_stop) { x = STAND_X[2]; p = { ...STAND, ...breathe(t), view: 'q', flip: true, expr: 'incuriosito', tilt: -3 }; }
  else if (tp < Q.card_pull) { x = STAND_X[2]; p = { ...STAND, view: 'q', flip: true, expr: 'determinato', armB: [150, -40], handB: 'point' }; }
  else if (tp < Q.jump_btn - 0.6) { x = STAND_X[2]; p = { ...STAND, ...breathe(t), view: 'q', flip: true, expr: tp < Q.sheet ? 'sorpreso' : 'furbo' }; }
  else if (tp < Q.jump_btn) { x = STAND_X[2]; const u = span(tp, Q.jump_btn - 0.6, Q.jump_btn); p = { ...STAND, view: 'q', flip: true, expr: 'determinato', squash: 1 - 0.12 * u, legA: [-10, 26 * u], legB: [10, -26 * u], armA: [-8 - 40 * u, -4], armB: [8 + 40 * u, 4] }; }
  else if (tp < Q.btn_press) { const u = span(tp, Q.jump_btn, Q.btn_press); x = lerp(STAND_X[2], BTN_X, u); onBtn = smooth(u); p = { ...STAND, view: 'q', flip: true, expr: 'esultanza', planted: false, lift: 300 * Math.sin(Math.PI * u), armA: [-150, -10], armB: [150, 10], legA: [-24, 20], legB: [24, -20] }; }
  else {
    x = BTN_X; onBtn = 1;
    const press = span(tp, Q.btn_press, Q.btn_press + 0.35);
    p = { ...STAND, ...breathe(t), view: 'q', flip: true, expr: 'furbo', squash: press < 1 ? 0.86 + 0.14 * press : 1 };
    if (tp >= Q.popup + 0.3 && tp < Q.confirm + 0.3) p = { ...p, expr: 'determinato', armB: [140, -70], handB: 'point' };
    if (tp >= Q.seats - 0.1 && tp < Q.day) p = { ...p, view: 'front', flip: false, expr: 'esultanza', armB: [165, -12], handB: 'fist' };
    if (tp >= Q.day) p = { ...STAND, ...breathe(t), view: 'front', expr: blinkAt(tp, tp < Q.day + 1.1 ? 'annoiato' : 'sorpreso', [Q.day + 0.6]), tilt: -12 };
    if (tp >= Q.ready_btn - 0.2 && tp < Q.ready_tap + 0.3) { const u = span(tp, Q.ready_btn - 0.2, Q.ready_tap); p = { ...STAND, expr: 'determinato', planted: false, lift: 90 * Math.sin(Math.PI * u), legA: [-12, 20], legB: [12, -20] }; }
    if (tp >= Q.ready_tap + 0.3) p = { ...STAND, ...breathe(t), expr: 'determinato' };
    if (tp >= Q.match_btn + 0.2) p = { ...STAND, ...breathe(t), expr: 'furbo', tilt: 5, armB: [120, -40], handB: 'fist' };
    if (tp >= Q.silence - 0.6) { const u = span(tp, Q.silence - 0.6, Q.silence); p = { ...STAND, expr: 'determinato', squash: 1 - 0.12 * u, legA: [-10, 26 * u], legB: [10, -26 * u], armA: [-8 - 50 * u, -4], armB: [8 + 50 * u, 4], hair: -6 }; }
  }
  const gy = lerp(groundY(x), BTN_TOP, onBtn);
  return { p, x, gy };
}

// contenuto della bacheca 3: lista che scorre → card sfilata → scheda torneo con i suoi stati
const PICK = 10, PICK_Y = 232, SCROLL_END = M.CARD_Y0 + PICK * M.CARD_STEP - PICK_Y;
function sheetState(t) {
  let label = 'REGISTRATI';
  let countdown = 'IL TORNEO INIZIERÀ TRA 0g 2o 14m ' + String(Math.max(0, 40 - Math.floor(t - Q.p3))).padStart(2, '0') + 's';
  if (t >= Q.day) { const k = span(t, Q.day, Q.ready_btn); countdown = `IL TORNEO INIZIERÀ TRA 0g ${Math.round(lerp(2, 0, k))}o ${String(Math.round(lerp(14, 0, k))).padStart(2, '0')}m ${String(Math.round(lerp(59, 0, k))).padStart(2, '0')}s`; }
  if (t >= Q.ready_btn) { label = 'SONO PRONTO A GIOCARE'; countdown = 'CONFERMA LA TUA PRESENZA'; }
  if (t >= Q.match_btn) { label = 'VAI AL TUO MATCH'; countdown = ''; }
  const press = (t >= Q.btn_press && t < Q.btn_press + 0.3) || (t >= Q.ready_tap && t < Q.ready_tap + 0.25) ? 1 : 0;
  const glow = t >= Q.match_btn ? 0.6 + 0.4 * Math.sin(t * 7) : press;
  return { label, countdown, seats: t >= Q.seats ? 12 : 11, seatsPop: 1 + 0.35 * Math.sin(Math.PI * span(t, Q.seats, Q.seats + 0.3)), press, glow,
    btnFill: t >= Q.ready_btn && t < Q.match_btn ? '#1FA37A' : M.COL.mag };
}
function board3(t) {
  if (t < Q.card_pull + 0.6) {
    const u = clamp((t - Q.p3) / (Q.list_stop - Q.p3));
    const scroll = SCROLL_END * (1 - (1 - u) * (1 - u));
    return { inner: M.list(BH, t < Q.p3 ? 0 : scroll, { skip: t >= Q.card_pull ? PICK : -1, hl: PICK, hlAmt: span(t, Q.list_stop, Q.list_stop + 0.4) }), scroll };
  }
  const st = sheetState(t);
  const pop = span(t, Q.popup, Q.popup + 0.3) * (1 - span(t, Q.confirm + 0.25, Q.confirm + 0.5));
  return { inner: M.sheet(BH, st) + M.confirm(BH, pop, t >= Q.confirm ? 'conferma' : ''), scroll: SCROLL_END };
}
function guideBall(t) {
  const L = Q.tp_land, logo = toWorld(P[0], [200, 38]);
  if (t >= L + 0.9 && t < Q.doors - 0.2) { const u = span(t, L + 0.9, Q.doors - 0.2); return [...arc([STAND_X[0] - 60, groundY(STAND_X[0]) - 120], logo, 420, smooth(u)), 1]; }
  if (t >= Q.ball_hop && t < Q.p2 + 0.4) { // salta verso la tappa 2, poi vola in cielo e chiama la tessera
    const hops = 5, dur = (Q.p2 - Q.ball_hop) / hops;
    if (t >= Q.p2) { const u = span(t, Q.p2, Q.p2 + 0.4); return [lerp(P[1] + 120, P[1], u), lerp(groundY(P[1]) - 40, -200, easeIn(u)), 1]; }
    const k = Math.floor((t - Q.ball_hop) / dur), u = ((t - Q.ball_hop) % dur) / dur;
    const x0 = lerp(P[0] + 250, P[1] + 120, k / hops), x1 = lerp(P[0] + 250, P[1] + 120, (k + 1) / hops);
    const q = arc([x0, groundY(x0) - 30], [x1, groundY(x1) - 30], 180, u);
    return [q[0], q[1], u < 0.08 || u > 0.92 ? 1.25 : 1];
  }
  if (t >= Q.road && t < Q.p3) { // corre lungo la strada e salta nella bacheca 3
    const u = span(t, Q.road, Q.p3 - 0.3);
    const x = lerp(STAND_X[1] + 60, STAND_X[2] - 150, smooth(u));
    if (t < Q.p3 - 0.3) return [x, groundY(x) - 40 - 40 * Math.abs(Math.sin(t * 6)), 1];
    const v = span(t, Q.p3 - 0.3, Q.p3); const q = arc([STAND_X[2] - 150, groundY(STAND_X[2]) - 40], toWorld(P[2], [320, 110]), 200, v); return [q[0], q[1], 1];
  }
  return null;
}
function sceneTrail(t) {
  const cam = camKeys(CAM_IN(), t);
  const B = BTN(); BTN_X = B.x + B.w - 70; BTN_TOP = B.y;
  const { p, x, gy } = heroPath(t);
  // bacheca 1: splash FITP che si apre sulla home
  let in1 = M.home(BH, { glow: span(t, Q.doors - 0.5, Q.doors - 0.2) * (1 - span(t, Q.doors + 0.6, Q.doors + 1.4)) });
  const doors = easeOut(span(t, Q.doors, Q.doors + 0.9));
  if (doors < 1) {
    const d = doors * M.UW / 2;
    in1 += `<clipPath id="dL"><rect width="200" height="${f(BH)}"/></clipPath><clipPath id="dR"><rect x="200" width="200" height="${f(BH)}"/></clipPath>` +
      `<g transform="translate(${f(-d)} 0)"><g clip-path="url(#dL)">${M.splash(BH)}</g></g><g transform="translate(${f(d)} 0)"><g clip-path="url(#dR)">${M.splash(BH)}</g></g>`;
  }
  const b3 = board3(t);
  const bg = landscape(t, cam) + boardFrame(P[0], -1.2, 21) + boardFrame(P[2], 0.8, 23);
  let content = boardContent(P[0], -1.2, in1, 'b1') + boardContent(P[2], 0.8, b3.inner, 'b3');
  // card del torneo sfilata dalla bacheca e allargata fino a diventare la scheda
  if (t >= Q.card_pull && t < Q.card_pull + 1.4) {
    const y0 = BOARD.top + (M.CARD_Y0 + PICK * M.CARD_STEP - b3.scroll) * BK;
    const u = back(span(t, Q.card_pull, Q.card_pull + 0.5)), gu = smooth(span(t, Q.card_pull + 0.6, Q.card_pull + 1.4));
    const cx = bx0(P[2]) + 12 * BK + 30 * u, cy = y0 + 20 * u;
    const rx = lerp(cx, bx0(P[2]), gu), ry = lerp(cy, BOARD.top, gu), rw = lerp((M.UW - 24) * BK, BOARD.w, gu), rh = lerp(100 * BK, BOARD.h, gu);
    content += g(`<rect x="${f(rx + 14)}" y="${f(ry + 18)}" width="${f(rw)}" height="${f(rh)}" rx="24" fill="${C.ink}" opacity="${f3(0.35 * (1 - gu))}"/>` +
      `<rect x="${f(rx)}" y="${f(ry)}" width="${f(rw)}" height="${f(rh)}" rx="24" fill="${M.COL.blue}" fill-opacity="${f3(1 - gu)}" stroke="${C.ink}" stroke-width="6"/>` +
      g(M.card(0, 0, M.UW - 24, M.TOURNEYS[PICK % M.TOURNEYS.length], { badge: 1 + 0.5 * Math.sin(Math.PI * span(t, Q.card_pull, Q.card_pull + 0.6)) }), `translate(${f(rx)} ${f(ry)}) scale(${f3(rw / (M.UW - 24))})`, 1 - gu), `rotate(0.8 ${P[2] - 60} ${BOARD.top + BOARD.h / 2})`, 1 - span(t, Q.card_pull + 1.2, Q.card_pull + 1.4));
  }
  const frames = boardOutline(P[0], -1.2, 31) + boardOutline(P[2], 0.8, 33);
  // tessera: scende dal cielo, Ciuffo la prende e la solleva; la grafica reale si allarga sopra di lui,
  // ben leggibile, attraversata da un riflesso; poi torna piccola e finisce nello zaino
  let card = '';
  const hx = STAND_X[1] - 80, gy1 = groundY(hx), held = [hx, gy1 - 380 * SC_IN];
  const catchP = [hx, gy1 - 470 * SC_IN - 110], showP = [hx - 60, 790], bag = [hx - 40, gy1 - 400 * SC_IN];
  if (t >= Q.p2 - 0.2 && t < Q.card_store + 0.6) {
    let cx, cy, w = 300, rot = 0, sc = 1, shine = -1, glow = 0;
    if (t < Q.card_catch) { const u = span(t, Q.p2 - 0.2, Q.card_catch); cx = catchP[0] + 130 * Math.sin(u * 6) * (1 - u); cy = lerp(-250, catchP[1], smooth(u)); rot = 22 * Math.sin(u * 6) * (1 - u); }
    else if (t < Q.present) { cx = catchP[0]; cy = catchP[1]; }
    else if (t < Q.card_store) {
      const u = back(span(t, Q.present, Q.present + 0.7)), bob = 8 * Math.sin((t - Q.present) * 2.2);
      cx = lerp(catchP[0], showP[0], u); cy = lerp(catchP[1], showP[1], u) + bob; w = lerp(300, 600, u);
      rot = lerp(0, -2, u) + 1.2 * Math.sin((t - Q.present) * 1.7);
      shine = span(t, Q.present + 0.7, Q.present + 1.6); glow = span(t, Q.present + 0.3, Q.present + 0.8);
    } else { const u = smooth(span(t, Q.card_store, Q.card_store + 0.55)); const q = arc(showP, bag, 160, u); cx = q[0]; cy = q[1]; w = lerp(600, 90, u); rot = -2 + 30 * u; sc = 1; glow = 1 - u; }
    card = tessera(cx, cy, w, 0, { rot, glow, scale: sc, shine });
    if (t >= Q.present + 0.3 && t < Q.card_store + 0.4) for (let i = 0; i < 14; i++) { // scintille intorno alla tessera
      const a = hash(i, 9) * 6.28 + (t - Q.present) * 0.8, r = 360 + 60 * Math.sin(t * 3 + i), k = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.7);
      card += sparkle(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.62, 8 + 10 * k, i % 2 ? C.cyan : '#FFE45C', k * (1 - span(t, Q.card_store, Q.card_store + 0.4)));
    }
  }
  // strada di circuito: le piste della tessera colano a terra e corrono verso la tappa 3
  let road = '';
  const ur = span(t, Q.road, Q.walk2 + 1.2);
  if (ur > 0) {
    const pts = []; for (let xx = hx - 40; xx <= STAND_X[2] + 60; xx += 40) pts.push([xx, groundY(xx) + 8]);
    road = [[-14, C.cyan], [14, C.pink]].map(([dy, col], i) =>
      `<path d="${wobLine([[bag[0], bag[1] + 40], [hx - 30, groundY(hx) - 30], ...pts.map(q => [q[0], q[1] + dy])], 40 + i, 3)}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f3(1 - smooth(ur))}" filter="url(#neon)"/>`).join('');
  }
  let ball = '';
  const bp = guideBall(t);
  if (bp) ball = neonBall(bp[0], bp[1], 20, bp[2] || 1);
  // cartellino verso l'avatar del profilo
  let tg = '';
  const AV = toWorld(P[0], [24, 36]);
  if (t >= Q.tag_throw && t < Q.tag_snap) { const u = span(t, Q.tag_throw, Q.tag_snap); const q = arc([STAND_X[0] - 40, groundY(STAND_X[0]) - 300], [AV[0] + 50, AV[1] + 36], 260, easeOut(u)); tg = tag(q[0], q[1], 540 * u, 1.1); }
  else if (t >= Q.tag_snap) { const u = span(t, Q.tag_snap, Q.tag_snap + 0.35); tg = tag(AV[0] + 50, AV[1] + 36, -12, 1.1 * (1 + 0.25 * Math.sin(Math.PI * u))); if (u < 1) tg += `<circle cx="${f(AV[0] + 50)}" cy="${f(AV[1] + 36)}" r="${f(40 + 90 * u)}" fill="none" stroke="${C.cyan}" stroke-width="6" opacity="${f3(1 - u)}"/>`; }
  // note a mano (L3) agganciate agli elementi dell'interfaccia
  const reg = [B.x + B.w * 0.35, B.y + B.h / 2];
  // sotto la bacheca, tra i pali, c'è spazio libero: le note stanno lì e puntano al tasto
  const below = [bx0(P[2]) + 300, BOARD.top + BOARD.h + 110];
  const notes = note(t, Q.sheet + 0.6, Q.jump_btn + 0.4, below[0], below[1], 'tocca qui', [below[0] + 20, reg[1] + 40], { bend: -70, size: 60 }) +
    note(t, Q.match_btn + 0.3, Q.silence - 0.1, below[0], below[1], 'è il tuo turno!', [below[0] + 20, reg[1] + 40], { bend: -70, size: 60 });
  const ch = hero(p, x, gy, SC_IN);
  const tr = camT(cam.x, cam.y, cam.s);
  return { boil: g(bg + road, tr), flat: g(content, tr), boil2: g(frames + card + tg + ch + ball, tr), top: g(notes, tr), cam };
}

// ---------- scena 3 · teletrasporto verso il campo, poi SuperTennis Arena ----------
const ME = { g: 1700, sc: 0.62 };
const READY_ARM = [60, 50];
const READY = { view: 'back', bagRacket: false, handB: 'racket', armB: READY_ARM, armA: [-20, -10], legA: [-10, 6], legB: [10, -6], expr: 'determinato' };
// swing di dritto (visto da dietro) rispetto all'istante d'impatto: racchetta bassa dietro a destra,
// impatto all'altezza dell'anca con il piatto verso la rete, accompagnamento dal basso verso l'alto
// fin sopra la spalla sinistra (angoli oltre 180° = il braccio passa sopra, non sotto), ritorno in posizione
const SWING = [[-0.9, READY_ARM, 4], [-0.34, [35, -10], 7], [0, [40, 50], 2], [0.3, [200, 30], -9], [0.9, READY_ARM, 4]];
function swingPose(t, hit) {
  const dt = t - hit;
  let a = SWING[0], b = SWING[SWING.length - 1];
  for (let i = 0; i < SWING.length - 1; i++) if (dt >= SWING[i][0] && dt <= SWING[i + 1][0]) { a = SWING[i]; b = SWING[i + 1]; break; }
  const u = dt <= SWING[0][0] ? 0 : dt >= b[0] ? 1 : (dt - a[0]) / (b[0] - a[0]);
  const e = a[0] === -0.34 ? easeIn(u) : smooth(u); // il braccio accelera verso l'impatto
  return { ...READY, armB: [lerp(a[1][0], b[1][0], e), lerp(a[1][1], b[1][1], e)], lean: lerp(a[2], b[2], e), legA: [-14, 8], legB: [14, -8], armA: [-30, -20] };
}
// profondità del campo su cui poggia Ciuffo e conversione schermo ↔ campo (u, d, altezza)
const D_ME = Math.pow((1780 - ME.g) / (1780 - 760), 1 / 0.72);
function toCourt([x, y], d) {
  const [xl, gy, k] = courtPt(0, d), xr = courtPt(1, d)[0];
  return [(x - xl) / (xr - xl), d, (gy - y) / k];
}
function toScreen([u, d, h]) { const [x, y, k] = courtPt(u, d); return [x, y, h * k]; }
const ME_U = [0.36, 0.27, 0.33, 0.3], RIV_U = [0.62, 0.36, 0.66, 0.4];
const RIV_CONTACT = smooth(0.3 / 0.45);   // valore dello swing dell'avversario all'impatto
const rivSwingAt = (t, hr) => smooth(span(t, hr - 0.3, hr + 0.15));
// piano dello scambio, calcolato dai soli istanti d'impatto in timeline (TL.shots)
function rallyPlan() {
  if (rallyPlan.cache && rallyPlan.cache.key === TL.shots.join()) return rallyPlan.cache;
  const H = TL.shots, n = H.length, lead = O().serveLead || 1.0;
  const meU = i => ME_U[i % ME_U.length];
  const C = H.map((h, i) => toCourt(racketHead({ ...swingPose(h, h), x: courtPt(meU(i), 0)[0], y: ME.g, scale: ME.sc }), D_ME));
  const rHits = [H[0] - lead, ...H.slice(0, -1).map((h, i) => h + 0.5 * (H[i + 1] - h))];   // servizio + risposte
  const R = rHits.map((hr, i) => toCourt(rivalRacket(RIV_U[i % RIV_U.length], 0.9, hr, RIV_CONTACT), 0.9));
  const segs = [];
  const seg = (t0, t1, p0, p1, apex) => segs.push({ t0, t1, p0, p1, apex });
  for (let i = 0; i < n; i++) {
    // l'avversario colpisce (servizio o risposta), rimbalzo nella metà di Ciuffo, impatto sulla racchetta
    const r = R[i], c = C[i], tr = rHits[i], tc = H[i], tb = tr + 0.62 * (tc - tr);
    const bn = [lerp(r[0], c[0], 0.82), 0.2, 0];
    seg(tr, tb, r, bn, 170); seg(tb, tc, bn, c, 70);
    if (i < n - 1) { // colpo di Ciuffo verso l'avversario, rimbalzo nella sua metà
      const rn = R[i + 1], tb2 = tc + 0.7 * (rHits[i + 1] - tc), bf = [lerp(c[0], rn[0], 0.85), 0.78, 0];
      seg(tc, tb2, c, bf, 230); seg(tb2, rHits[i + 1], bf, rn, 60);
    } else {       // vincente: rimbalza nell'angolo e scappa via
      const bw = [0.93, 0.9, 0], tbw = Q.cheer - 0.08;
      seg(tc, tbw, c, bw, 260); seg(tbw, Q.cheer + 0.7, bw, [1.12, 1.02, 30], 90);
    }
  }
  rallyPlan.cache = { key: TL.shots.join(), H, C, R, rHits, segs, meU };
  return rallyPlan.cache;
}
function rally(t) {
  const P = rallyPlan();
  let pos = null;
  for (const sg of P.segs) if (t >= sg.t0 && t <= sg.t1) {
    const u = (t - sg.t0) / (sg.t1 - sg.t0);
    pos = toScreen([lerp(sg.p0[0], sg.p1[0], u), lerp(sg.p0[1], sg.p1[1], u), lerp(sg.p0[2], sg.p1[2], u) + sg.apex * 4 * u * (1 - u)]);
    break;
  }
  // Ciuffo si sposta verso il punto d'impatto successivo; l'avversario verso il suo
  let meU = P.meU(0), rU = RIV_U[0], rSwing = 0;
  P.H.forEach((h, i) => { if (t > (i ? P.H[i - 1] + 0.3 : -1)) meU = lerp(i ? P.meU(i - 1) : P.meU(0), P.meU(i), smooth(span(t, i ? P.H[i - 1] + 0.3 : 0, h - 0.35))); });
  P.rHits.forEach((hr, i) => {
    const prev = i ? P.rHits[i - 1] : Q.arena;
    if (t > prev) rU = lerp(RIV_U[Math.max(0, i - 1) % RIV_U.length], RIV_U[i % RIV_U.length], smooth(span(t, prev + 0.3, hr - 0.2)));
    rSwing = Math.max(rSwing, t < hr + 0.6 ? rivSwingAt(t, hr) * (1 - span(t, hr + 0.2, hr + 0.6)) : 0);
  });
  const last = P.H[P.H.length - 1];
  if (t > last) rU = lerp(RIV_U[(P.rHits.length - 1) % RIV_U.length], 0.82, smooth(span(t, last, Q.cheer))); // si allunga ma non ci arriva
  return { pos, rU, meU, rSwing };
}
function swipe(t, hit) { // scia rossa del dito: il gesto che diventa il colpo, nella direzione della pallina
  const u = span(t, hit - 0.34, hit), out = span(t, hit + 0.3, hit + 0.8);
  if (u <= 0 || out >= 1) return '';
  const P = rallyPlan(), i = P.H.indexOf(hit), c = toScreen(P.C[i]);
  const a = [c[0] - 170, c[1] - c[2] + 190], b = [c[0] + 60, c[1] - c[2] + 40], e = [c[0] + 20, c[1] - c[2] - 330];
  return `<path d="M${f(a[0])} ${f(a[1])} Q${f(b[0])} ${f(b[1])} ${f(e[0])} ${f(e[1])}" fill="none" stroke="#FF2A3D" stroke-width="18" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f3(1 - u)}" opacity="${f3(1 - out)}" filter="url(#neon)"/>`;
}
function arenaView(t, o = {}) {
  const { pos, rU, meU, rSwing } = rally(t);
  const P = rallyPlan();
  const draw = o.final ? 1 : span(t, Q.arena, Q.arena + 1.6);
  let p = READY;
  const land = span(t, Q.arena + 0.1, Q.arena + 0.6);
  if (t < Q.arena + 0.6) p = { ...READY, expr: 'sorpreso', planted: false, lift: 700 * Math.pow(1 - land, 2), armA: [-120, -20], armB: [120, 20] };
  else if (t < Q.arena + 0.9) p = { ...READY, squash: 0.88 };
  for (const h of P.H) if (t >= h - 0.9) p = swingPose(t, h);
  if (t >= Q.cheer) { const u = span(t, Q.cheer, Q.cheer + 0.8); p = { ...STAND, view: 'back', bagRacket: false, handB: 'racket', expr: 'esultanza', planted: false, lift: 160 * Math.sin(Math.PI * u), armA: [-150, -10], armB: [150, 10] }; }
  if (t >= Q.cheer + 0.8 || o.final) p = { ...STAND, view: 'back', bagRacket: false, handB: 'racket', armA: [-30, 150], armB: [165, -12], handA: 'fist' };
  const meX = courtPt(o.final ? 0.5 : meU, 0)[0];
  const trailPts = [0.09, 0.06, 0.03].map(d => { const q = rally(t - d).pos; return q ? [q[0], q[1], q[2]] : null; }).filter(Boolean);
  const behind = pos && pos[1] < courtPt(0.5, 0.5)[1];
  const rv = draw > 0.35 ? rival(rU, 0.9, t, rSwing) : '';
  return arena(t, draw) + rv + (behind ? tBall(pos, trailPts) : '') + net() + hero(p, meX, ME.g, ME.sc) + (behind ? '' : tBall(pos, trailPts));
}
function sceneArena(t) {
  const P = rallyPlan(), last = P.H[P.H.length - 1];
  // camera: leggera spinta durante lo scambio, poi segue il vincente al rallentatore
  const k = smooth(span(t, last, last + 0.8)) * (1 - smooth(span(t, Q.cheer + 0.2, Q.cheer + 1.2)));
  const s = lerp(1.0, 1.05, smooth(span(t, Q.arena + 1.5, last))) + 0.12 * k;
  const view = g(arenaView(t), camT(540, lerp(960, 900, k), s));
  const hudIn = smooth(span(t, P.H[0] + 0.6, P.H[0] + 1.1));
  let top = hudIn > 0 ? g(hud(t >= Q.cheer ? 7 : 6, 4), `translate(0 ${f((1 - hudIn) * -260)})`) : '';
  for (const h of P.H) top += swipe(t, h);
  if (!O().social) { // la nota sta a sinistra, lontano dal punto d'impatto, e indica l'inizio della scia
    const c = toScreen(P.C[0]);
    top += note(t, P.H[0] - 0.8, P.H[0] + 0.9, 250, 1800, 'swipe per colpire', [c[0] - 200, c[1] - c[2] + 200], { bend: 40 });
  }
  const st4 = STEPS().find(x => x.n === 4);
  if (st4) { const k4 = span(t, st4.tin - 0.3, st4.tin + 0.3) * (1 - span(t, st4.tout - 0.6, st4.tout)); if (k4 > 0) top = `<rect width="${W}" height="620" fill="url(#titleBand)" opacity="${f3(k4)}"/>` + top; }
  const flash = 1 - span(t, Q.arena, Q.arena + 0.5);
  return { boil: view, flat: '', top: top + (flash > 0 ? `<rect width="${W}" height="${H}" fill="#FFF6FB" opacity="${f3(flash)}"/>` : '') };
}
function sceneTeleport2(t) {
  const u0 = span(t, Q.match_tap, Q.match_tap + 0.6);
  if (u0 < 1) { // la botola si apre sotto i piedi: la camera ci entra
    const cam = camKeys(CAM_IN(), Q.match_tap);
    const B = BTN(), k = easeOut(clamp(u0 * 1.6));
    BTN_X = B.x + B.w - 70; BTN_TOP = B.y;
    const hole = `<rect x="${f(B.x)}" y="${f(B.y)}" width="${f(B.w)}" height="${f(B.h)}" rx="${f(B.h / 2)}" fill="#12072E"/>` +
      `<rect x="${f(B.x)}" y="${f(B.y)}" width="${f(B.w)}" height="${f(B.h / 2 * (1 - k))}" fill="${M.COL.mag}"/><rect x="${f(B.x)}" y="${f(B.y + B.h / 2 + B.h / 2 * k)}" width="${f(B.w)}" height="${f(B.h / 2 * (1 - k))}" fill="${M.COL.mag}"/>`;
    const p = { ...STAND, expr: 'sorpreso', planted: false, armA: [-160, -10], armB: [160, 10], hair: 22 };
    const zoom = Math.exp(lerp(Math.log(cam.s), Math.log(5.5), easeIn(u0)));
    const cx = lerp(cam.x, B.x + B.w / 2, smooth(u0)), cy = lerp(cam.y, B.y + B.h / 2, smooth(u0));
    const tr = camT(cx, cy, zoom);
    return { boil: g(landscape(Q.match_tap, cam) + boardFrame(P[2], 0.8, 23), tr), flat: g(boardContent(P[2], 0.8, board3(Q.match_tap).inner, 'b3') + hole, tr),
      boil2: g(hero(p, BTN_X, BTN_TOP + easeIn(u0) * 500, SC_IN), tr), top: '' };
  }
  const u = span(t, Q.match_tap + 0.6, Q.arena);
  return { boil: teleport(t, u, 1) + flyer(t, u, 540, lerp(1150, 1050, u), lerp(0.85, 0.45, u)), flat: '', top: '' };
}

// ---------- scena 4 · ritorno sulla panchina e finale ----------
function sceneReturn(t) {
  const u = smooth(span(t, Q.t7, Q.t7 + 2.5));
  const s = Math.exp(lerp(Math.log(ZOOM_PHONE), Math.log(FRAME_OUT.s), u));
  const k = clamp((u - 0.55) / 0.45), cx = lerp(PHONE.x, FRAME_OUT.x, k), cy = lerp(PHONE.y, FRAME_OUT.y, k);
  const vib = t > Q.vittoria ? 4 * Math.sin(t * 90) * (1 - span(t, Q.vittoria, Q.vittoria + 0.5)) : 0;
  const scr = t > Q.vittoria ? vittoriaFull() : arenaView(t, { final: true }) + hud(7, 4);
  const p = { ...SEAT, ...breathe(t), expr: t > Q.vittoria + 0.3 ? 'sorriso' : 'sorpreso' };
  return { boil: g(fuori(t) + hero(p, CX_SEAT, G_OUT, SC_OUT) + phone(PHONE.x + vib, PHONE.y, 0, inScreen(scr)), camT(cx, cy, s)), flat: '', top: '' };
}
function sceneEnd(t) {
  const tp = on2(t);
  let body, rot = 0;
  const glow = (0.5 + 0.5 * span(t, Q.end, Q.end + 1)) * (1 - smooth(span(t, Q.stand, Q.stand + 1.2)));
  if (tp < Q.stand) {
    if (tp >= Q.end + 0.8) rot = 360 * smooth(span(t, Q.end + 0.8, Q.end + 1.5));
    body = fuori(t, { glow }) + hero({ ...SEAT, ...breathe(t), expr: tp < Q.end + 0.5 ? 'incuriosito' : 'sorriso' }, CX_SEAT, G_OUT, SC_OUT) + phone(PHONE.x, PHONE.y, rot, inScreen(vittoriaFull()));
  } else {
    const u = smooth(span(tp, Q.stand, Q.stand + 0.8));
    let p = mix({ ...SEAT, expr: 'sorriso' }, { ...STAND, expr: 'sorriso', handB: 'phone', phoneRot: 0 }, u);
    if (tp >= Q.stand + 0.8) p = { ...STAND, ...breathe(t), expr: blinkAt(tp, 'sorriso', [Q.stand + 2.2]), tilt: 4, armB: [30, 50], handB: 'phone' };
    if (tp >= Q.tally - 0.3 && tp < Q.tally + 0.5) p = { ...STAND, view: 'q', expr: 'furbo', armA: [-40, 20], armB: [30, 50], handB: 'phone', lean: -10 };
    if (tp >= Q.tocca - 0.2) { const k = smooth(span(tp, Q.tocca - 0.2, Q.tocca + 0.3)); p = { ...STAND, ...breathe(t), expr: 'furbo', tilt: 6, armB: [lerp(30, 120, k), lerp(50, -60, k)], handB: 'fist', armA: [-8, -4] }; }
    const tally4 = span(t, Q.tally, Q.tally + 0.3);
    body = fuori(t, { glow, tallies: tally4 > 0 ? 4 : 3, tally4, calm: smooth(span(t, Q.stand, Q.recap1 + 1)) }) + hero(p, lerp(CX_SEAT, 480, u), G_OUT, SC_OUT);
  }
  const k = smooth(span(t, Q.stand, Q.stand + 2.4));
  const cam = [lerp(FRAME_OUT.x, FRAME_END.x, k), lerp(FRAME_OUT.y, FRAME_END.y, k), lerp(FRAME_OUT.s, FRAME_END.s, k)];
  // gerarchia del finale: prima i quattro passi (L2), poi «Tocca a te.» (L1), infine dominio e loghi (L3)
  let gfx = '';
  const dim = 1 - 0.5 * smooth(span(t, Q.tocca, Q.tocca + 0.6)), lift = -26 * smooth(span(t, Q.tocca, Q.tocca + 0.6));
  ['Entra in myFITP', 'Tesserati', 'Iscriviti a un torneo', 'Gioca su Tennis Clash'].forEach((label, i) => {
    const t0 = Q['recap' + (i + 1)], u = span(t, t0 - 0.1, t0 + 0.5);
    if (u <= 0) return;
    const y = 300 + i * 74 + lift, x0 = 300;
    let row = `<path d="${wobCircle(x0, y - 12, 24, 60 + i, 2, easeOut(u))}" fill="none" stroke="${C.pink}" stroke-width="6" stroke-linecap="round"/>` + text(x0, y - 1, String(i + 1), 26, C.ink, { op: span(u, 0.4, 1) });
    row += written(text(x0 + 46, y, label, 32, C.ink, { anchor: 'start' }), x0 + 40, y - 40, 600, 60, span(u, 0.2, 1));
    gfx += g(row, '', dim);
  });
  const u8 = span(t, Q.tocca, Q.tocca + 0.7);
  if (u8 > 0) {
    gfx += `<path d="${wobLine([[180, 772], [540, 748], [900, 766]], 9, 4)}" fill="none" stroke="${C.pink}" stroke-width="40" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f3(1 - smooth(span(t, Q.tocca + 0.3, Q.tocca + 1.0)))}" opacity="0.9"/>`;
    gfx += `<path d="${wobLine([[200, 792], [540, 772], [880, 786]], 10, 3)}" fill="none" stroke="${C.cyan}" stroke-width="14" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f3(1 - smooth(span(t, Q.tocca + 0.5, Q.tocca + 1.2)))}" opacity="0.9"/>`;
    gfx += written(text(540, 740, 'Tocca a te.', 124, C.ink), 60, 600, 960, 180, u8);
  }
  const ud = smooth(span(t, Q.domain, Q.domain + 0.5));
  if (ud > 0) gfx += text(540, 872, 'esports.fitp.it', 34, C.ink, { op: ud * 0.8 });
  const ul = smooth(span(t, Q.domain + 0.3, Q.domain + 0.8));
  if (ul > 0) gfx += g(`<image href="${A.fitp}" x="190" y="920" width="170" height="84"/><image href="${A.esports}" x="410" y="906" width="200" height="112"/>` +
    `<image href="${A.tcIcon}" x="660" y="922" width="80" height="80" clip-path="inset(0 round 18px)"/>`, '', ul);
  return { boil: g(body, camT(...cam)), flat: '', top: gfx };
}

// ---------- finale del taglio social ----------
function endCard(t, t0) {
  const u = smooth(span(t, t0 + 0.2, t0 + 0.8));
  const p = u < 1 ? mix({ ...STAND, expr: 'sorriso' }, { ...STAND, expr: 'furbo', tilt: 6, armB: [120, -60], handB: 'fist' }, u) : { ...STAND, ...breathe(t), expr: 'furbo', tilt: 6, armB: [120, -60], handB: 'fist' };
  const body = fuori(t, { calm: 1, bare: true, tallies: 4 }) + hero(p, 480, G_OUT, SC_OUT);
  let gfx = '';
  const u8 = span(t, Q.tocca, Q.tocca + 0.6);
  if (u8 > 0) {
    gfx += `<path d="${wobLine([[180, 492], [540, 468], [900, 486]], 9, 4)}" fill="none" stroke="${C.pink}" stroke-width="40" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f3(1 - smooth(span(t, Q.tocca + 0.2, Q.tocca + 0.8)))}" opacity="0.9"/>`;
    gfx += written(text(540, 460, 'Tocca a te.', 124, C.ink), 60, 320, 960, 180, u8);
  }
  const ud = smooth(span(t, Q.domain, Q.domain + 0.4));
  if (ud > 0) gfx += text(540, 600, 'esports.fitp.it', 40, C.ink, { op: ud * 0.85 }) +
    g(`<image href="${A.fitp}" x="120" y="680" width="230" height="114"/><image href="${A.esports}" x="390" y="660" width="290" height="163"/><image href="${A.tcIcon}" x="730" y="684" width="110" height="110" clip-path="inset(0 round 24px)"/>`, '', ud);
  return { boil: g(body, camT(FRAME_END.x, FRAME_END.y, FRAME_END.s)), flat: '', top: gfx };
}
// strappo diagonale: sotto il bordo disegnato compare il foglio del finale
function tearTo(a, b, u) {
  const e = -300 + easeIn(u) * (W + 1500), slope = 0.6 * H;
  const clip = `<clipPath id="tear"><path d="M${f(e)} -10 L${W + 2000} -10 L${W + 2000} ${H + 10} L${f(e - slope)} ${H + 10} Z"/></clipPath>`;
  const edge = `<path d="${wobLine([[e, -10], [e - slope * 0.33, H * 0.33], [e - slope * 0.66, H * 0.66], [e - slope, H + 10]], 77, 30)}" fill="none" stroke="#FFFDF7" stroke-width="22" stroke-linejoin="round"/>`;
  const clipB = `<clipPath id="tearB"><path d="M-400 -10 L${f(e)} -10 L${f(e - slope)} ${H + 10} L-400 ${H + 10} Z"/></clipPath>`; // parte già scoperta
  return { boil: `${b.boil}`, flat: '', top: `<defs>${clip}${clipB}</defs><g clip-path="url(#tearB)">${b.top || ''}</g><g clip-path="url(#tear)"><g filter="url(#boil)">${a.boil}</g>${a.top || ''}</g>` + edge };
}

// ---------- montaggio ----------
const tcode = t => `${String(Math.floor(t)).padStart(2, '0')}:${String(Math.floor((t % 1) * FPS)).padStart(2, '0')}`;
export function frame(t, o = {}) {
  Q = TL.cue;
  clipN = 0;
  let r;
  if (t < Q.tp_in + 1.0) r = sceneBench(t);
  else if (t < Q.tp_land) { const u = span(t, Q.tp_in + 1.0, Q.tp_land); r = { boil: teleport(t, span(t, Q.tp_in - 0.3, Q.tp_in + 2.1)) + flyer(t, u, 540, lerp(1150, 1000, u), lerp(0.4, 0.8, u)), flat: '' }; }
  else if (t < Q.match_tap) r = sceneTrail(t);
  else if (t < Q.arena) r = sceneTeleport2(t);
  else if (O().social && t >= Q.endcard) { const e = endCard(t, Q.endcard); r = t < Q.endcard + 0.6 ? tearTo(sceneArena(t), e, span(t, Q.endcard, Q.endcard + 0.6)) : e; }
  else if (t < Q.t7) r = sceneArena(t);
  else if (t < Q.end) r = sceneReturn(t);
  else r = sceneEnd(t);
  const flash1 = t >= Q.tp_land && t < Q.tp_land + 0.45 ? 1 - span(t, Q.tp_land, Q.tp_land + 0.45) : 0; // arrivo del primo teletrasporto
  const titles = t >= Q.tp_land && t < (O().social ? Q.endcard : Q.t7) ? chapter(t, r.cam ? r.cam.x : 540) : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs(t)}<rect width="${W}" height="${H}" fill="#12072E"/>` +
    `<g filter="url(#boil)">${r.boil}</g>${r.flat || ''}${r.boil2 ? `<g filter="url(#boil)">${r.boil2}</g>` : ''}${r.top || ''}${titles}` +
    (flash1 > 0 ? `<rect width="${W}" height="${H}" fill="#FFF6FB" opacity="${f3(flash1)}"/>` : '') +
    `<image href="${A.paper}" width="${W}" height="${H}" preserveAspectRatio="none" style="mix-blend-mode:multiply" opacity="0.42"/>` +
    `<rect width="${W}" height="${H}" fill="url(#vignette)"/>` + (o.tc ? text(W - 24, 44, tcode(t), 28, '#fff', { anchor: 'end', font: 'monospace', weight: 700, outline: '#000', ow: 5 }) : '') + '</svg>';
}
