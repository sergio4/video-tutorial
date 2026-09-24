// myFITP ridisegnato in stile cartoon, fedele a layout, etichette e colori
// delle registrazioni reali (assets/riferimenti/myfitp). Nomi e numeri sono di prova.
// Tutto è in «unità app»: larghezza schermo 400, altezza variabile; chi lo usa
// lo posiziona con transform="translate(x y) scale(larghezza/400)".
import { A } from './assets.js';

export const UW = 400;
export const COL = {
  blue: '#0958AA', navy: '#05325F', mag: '#E01FB4', tag: '#E0249A', title: '#123C78',
  gray: '#8A8FA0', light: '#E9ECF3', tile: '#2F6FC4', ink: '#1C1438', ok: '#1E5BB8', ko: '#E8605A', warn: '#F2A33A',
};
const SANS = "Arial, 'Liberation Sans', Helvetica, sans-serif";
const f = n => (Math.round(n * 10) / 10).toString();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function t(x, y, s, size, fill, o = {}) {
  const { anchor = 'start', weight = 700, ls = 0, italic = false, op = 1 } = o;
  return `<text x="${f(x)}" y="${f(y)}" font-family="${SANS}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"` +
    `${ls ? ` letter-spacing="${ls}"` : ''}${italic ? ' font-style="italic"' : ''}${op < 1 ? ` opacity="${op}"` : ''}>${esc(s)}</text>`;
}
const rr = (x, y, w, h, r, fill, o = {}) =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${fill}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 2}"` : ''}${o.op ? ` opacity="${o.op}"` : ''}/>`;
const pill = (x, y, w, label, bg, fg = '#fff', o = {}) => rr(x, y, w, 18, 9, bg, o) + t(x + w / 2, y + 12.5, label, 9, fg, { anchor: 'middle' });

// ---------- icone (linea bianca) ----------
const ic = (d, x, y, s = 1, col = '#fff', sw = 2) => `<path d="${d}" transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
const I = {
  home: 'M-9 1 L0 -8 L9 1 M-6 -1 L-6 9 L6 9 L6 -1',
  cal: 'M-8 -6 L8 -6 L8 8 L-8 8 Z M-8 -1 L8 -1 M-4 -9 L-4 -4 M4 -9 L4 -4',
  search: 'M-2 -2 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M3 3 L9 9',
  card: 'M-10 -7 L10 -7 L10 7 L-10 7 Z M-10 -2 L10 -2 M-6 3 L-1 3',
  trophy: 'M-6 -7 L6 -7 L5 1 Q0 6 -5 1 Z M-6 -5 Q-10 -5 -9 -1 Q-8 1 -5 1 M6 -5 Q10 -5 9 -1 Q8 1 5 1 M0 4 L0 7 M-4 8 L4 8',
  people: 'M-3 -3 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M-10 7 Q-9 0 -3 0 Q3 0 4 7 M5 -4 m-2.5 0 a2.5 2.5 0 1 0 5 0 a2.5 2.5 0 1 0 -5 0 M4 1 Q9 1 10 7',
  doc: 'M-6 -8 L4 -8 L7 -5 L7 8 L-6 8 Z M-3 -3 L4 -3 M-3 1 L4 1 M-3 5 L2 5',
  clock: 'M0 0 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M0 -3 L0 0 L2.5 1.5',
  bell: 'M-6 4 L-6 -1 Q-6 -7 0 -7 Q6 -7 6 -1 L6 4 L8 6 L-8 6 Z M-2 8 Q0 10 2 8',
  user: 'M0 0 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 M0 -3 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M-5.5 6 Q0 1 5.5 6',
  chart: 'M-9 7 L9 7 M-8 4 L-3 -2 L1 1 L7 -6',
  star: 'M0 -8 L2.4 -2.6 L8 -2.2 L3.7 1.4 L5 7 L0 4 L-5 7 L-3.7 1.4 L-8 -2.2 L-2.4 -2.6 Z',
};
function esportsIcon(x, y) { // icona centrale della barra: righe + pallina
  return ic('M-18 -5 L-8 -5 M-20 0 L-8 0 M-18 5 L-8 5', x, y) +
    `<circle cx="${x + 3}" cy="${y}" r="9" fill="#fff"/>` + ic('M-5 -7 Q1 0 -5 7 M5 -7 Q-1 0 5 7', x + 3, y, 1, COL.navy, 1.6);
}

// ---------- blocchi ----------
export function header(o = {}) {
  const { name = 'CIUFFO', pts = 'pt. 12', glow = 0 } = o;
  let s = rr(0, 0, UW, 70, 0, COL.blue);
  s += ic(I.user, 24, 36, 1);
  s += t(42, 33, name, 10, '#fff') + t(42, 45, pts, 8, '#fff', { weight: 400 });
  s += `<text x="200" y="45" font-family="${SANS}" font-weight="900" font-style="italic" fill="#fff" text-anchor="middle"><tspan font-size="14">my</tspan><tspan font-size="21">FITP</tspan></text>`;
  s += rr(318, 28, 28, 15, 3, 'none', { stroke: '#fff', sw: 1.4 }) + t(332, 39, 'GOLD', 7.5, '#fff', { anchor: 'middle' });
  s += ic(I.bell, 368, 35, 1, '#FFD84A');
  if (glow > 0) s += rr(0, 0, UW, 70, 0, '#00FFFF', { op: f(glow * 0.35) });
  return s;
}
export function nav(y) {
  let s = rr(0, y, UW, 56, 0, COL.navy);
  s += ic(I.home, 40, y + 27) + ic(I.cal, 120, y + 27) + esportsIcon(200, y + 27) + ic(I.search, 280, y + 27) + ic(I.card, 360, y + 27);
  return s;
}
// schermo: fondo bianco, bordo inchiostro, angoli arrotondati; id serve per il clipPath
export function screen(id, h, inner) {
  return `<clipPath id="${id}"><rect width="${UW}" height="${h}" rx="22"/></clipPath>` +
    `<g clip-path="url(#${id})">${rr(0, 0, UW, h, 0, '#FFFFFF')}${inner}</g>` +
    rr(0, 0, UW, h, 22, 'none', { stroke: COL.ink, sw: 3 });
}

// Splash: blu con il logo FITP in bianco (le «porte» della scena 02)
export function splash(h) {
  return rr(0, 0, UW, h, 0, COL.blue) +
    `<image href="${A.fitp}" x="110" y="${f(h / 2 - 45)}" width="180" height="90" filter="url(#toWhite)"/>`;
}

// Home: menu rapido e «LE TUE ISCRIZIONI»
export function home(h, o = {}) {
  let s = header(o);
  s += t(16, 102, 'Menu ↔', 15, COL.blue, { weight: 800 });
  [['chart', 'Statistiche'], ['card', 'Le Mie Tessere'], ['star', 'Benefit Tesserati'], ['trophy', 'Classifiche']].forEach(([k, l], i) => {
    const x = 50 + i * 100;
    s += ic(I[k], x, 132, 1.5, COL.blue, 1.8) + t(x, 162, l, 8.5, COL.title, { anchor: 'middle', weight: 400 });
  });
  s += rr(0, 184, UW, 130, 18, COL.blue) + t(16, 212, 'LE TUE ISCRIZIONI', 13, '#fff', { weight: 800 });
  s += rr(16, 226, 150, 70, 6, '#FFFFFF', { op: 0.18 }) + rr(176, 226, 150, 70, 6, '#FFFFFF', { op: 0.18 });
  s += rr(0, 324, UW, 52, 0, '#0B2A66') + `<text x="20" y="356" font-family="${SANS}" font-weight="900" font-style="italic" fill="#fff" font-size="20">FITP<tspan font-size="11">eSERIES</tspan></text>`;
  return s + nav(h - 56);
}

// ---------- lista tornei ----------
function thumb(x, y) { // miniatura cartoon del campo
  return rr(x, y, 60, 54, 6, '#2D2F8F') + `<path d="M${x + 16} ${y + 14} L${x + 44} ${y + 14} L${x + 54} ${y + 50} L${x + 6} ${y + 50} Z" fill="#1463E0" stroke="#fff" stroke-width="1.4"/>` +
    `<path d="M${x + 11} ${y + 30} L${x + 49} ${y + 30}" stroke="#fff" stroke-width="1.6"/>` + `<circle cx="${x + 36}" cy="${y + 22}" r="2.6" fill="#E8F55A"/>`;
}
export function card(x, y, w, d, o = {}) {
  const { hl = 0, badge = 1 } = o;
  let s = '';
  if (hl) s += rr(x - 4, y - 4, w + 8, 108, 12, 'none', { stroke: COL.tag, sw: 3, op: f(hl) });
  s += rr(x, y, w, 100, 10, COL.blue, { stroke: COL.ink, sw: 2 });
  s += rr(x + w - 76, y - 1, 70, 14, 5, COL.tag) + t(x + w - 41, y + 9, d.state || 'Disponibile', 7.5, '#fff', { anchor: 'middle', italic: true });
  s += thumb(x + 10, y + 14);
  s += t(x + 80, y + 34, d.title, 10.5, '#fff');
  const lv = `<g transform="translate(${x + 80} ${y + 40}) scale(${f(badge)})">${rr(0, 0, 50, 14, 4, COL.tag)}${t(25, 10, 'Livello ' + d.level, 8, '#fff', { anchor: 'middle', italic: true })}</g>`;
  s += lv;
  [['19:00', 42], ['1v1', 36], [d.seats || '11/256', 52], [d.pts || '20 PTS', 46]].forEach(([l, pw], i, a) => {
    const px = x + 10 + a.slice(0, i).reduce((acc, v) => acc + v[1] + 6, 0);
    s += rr(px, y + 74, pw, 16, 8, 'none', { stroke: '#fff', sw: 1.2 }) + t(px + pw / 2, y + 85.5, l, 8, '#fff', { anchor: 'middle' });
  });
  return s;
}
export const TOURNEYS = [
  { title: 'Open Cup', level: 2, seats: '48/256', pts: '0 PTS' },
  { title: 'Road to NATPF eSeries', level: 10, seats: '17/256', pts: '500 PTS' },
  { title: 'Road to NATPF eSeries', level: 10, seats: '8/256', pts: '500 PTS' },
  { title: 'Open Cup', level: 2, seats: '112/256', pts: '0 PTS' },
  { title: 'FITP eSeries by BMW', level: 4, seats: '11/256', pts: '20 PTS' },
  { title: 'Road to NATPF eSeries', level: 10, seats: '21/256', pts: '500 PTS' },
];
export const CARD_Y0 = 222, CARD_STEP = 112;
// la lista: intestazione fissa, card che scorrono (scroll in unità app); skip = indice da non disegnare
export function list(h, scroll, o = {}) {
  const { skip = -1, hl = -1, hlAmt = 0 } = o;
  let cards = '';
  for (let i = 0; i < 14; i++) {
    const y = CARD_Y0 + i * CARD_STEP - scroll;
    if (i === skip || y > h || y + 100 < 190) continue;
    cards += card(12, y, UW - 24, TOURNEYS[i % TOURNEYS.length], { hl: i === hl ? hlAmt : 0 });
  }
  let s = `<clipPath id="listClip"><rect x="0" y="190" width="${UW}" height="${h - 190}"/></clipPath><g clip-path="url(#listClip)">${cards}</g>`;
  s += rr(0, 60, UW, 80, 0, COL.blue) + header();
  s += rr(14, 84, 138, 36, 6, '#fff') + ic(I.trophy, 50, 102, 1, COL.blue, 1.8) + t(92, 106, 'TORNEI', 10, COL.blue, { anchor: 'middle' });
  s += rr(160, 84, 138, 36, 6, '#2D6FC0') + ic(I.chart, 196, 102, 0.9, '#6E9BD8', 1.8) + t(244, 106, 'LEADERBOARD', 10, '#6E9BD8', { anchor: 'middle' });
  s += rr(0, 140, UW, 50, 0, '#FFFFFF');
  s += rr(12, 150, 92, 28, 5, COL.blue) + t(58, 168, 'Disponibili', 9, '#fff', { anchor: 'middle' }) + `<circle cx="102" cy="151" r="7" fill="${COL.tag}"/>` + t(102, 154.5, '6', 8, '#fff', { anchor: 'middle' });
  s += rr(112, 150, 88, 28, 5, COL.light) + t(156, 168, 'In corso', 9, COL.blue, { anchor: 'middle', weight: 400 });
  s += rr(208, 150, 92, 28, 5, COL.blue) + t(254, 168, 'Completati', 9, '#fff', { anchor: 'middle' });
  s += t(16, 204, 'OGGI · 27 SETTEMBRE', 8.5, COL.title, { ls: 1.5 }) + `<path d="M140 201 L384 201" stroke="${COL.title}" stroke-width="0.8" opacity="0.5"/>`;
  return s + nav(h - 56);
}

// ---------- scheda torneo ----------
export const SHEET_BTN = h => ({ x: 14, y: h - 96, w: 372, h: 36 });
export function sheet(h, o = {}) {
  const { seats = 11, label = 'REGISTRATI', btnFill = COL.mag, press = 0, glow = 0, countdown = 'IL TORNEO INIZIERÀ TRA 0g 2o 14m 30s' } = o;
  const d = TOURNEYS[4];
  let s = header();
  s += ic('M8 0 L-8 0 M-3 -5 L-8 0 L-3 5', 26, 92, 1, COL.blue) + t(38, 96, 'TORNEO', 11, COL.blue);
  s += rr(318, 82, 68, 18, 3, COL.tag) + t(352, 95, 'Disponibile', 8.5, '#fff', { anchor: 'middle', italic: true, ls: 0.5 });
  // testata: campo cartoon notturno con il nome dell'evento
  s += `<clipPath id="bannerClip"><rect x="16" y="108" width="368" height="118" rx="8"/></clipPath><g clip-path="url(#bannerClip)">` +
    rr(16, 108, 368, 118, 0, '#1A1F7A') + `<path d="M120 150 L280 150 L340 230 L60 230 Z" fill="#1463E0" stroke="#fff" stroke-width="2"/><path d="M92 190 L308 190" stroke="#fff" stroke-width="2.5"/>` +
    `<text x="200" y="150" font-family="${SANS}" font-weight="900" font-style="italic" fill="#fff" font-size="30" text-anchor="middle">FITP<tspan font-size="14"> eSERIES</tspan></text></g>` +
    rr(16, 108, 368, 118, 8, 'none', { stroke: COL.ink, sw: 2 });
  s += t(16, 250, `${d.title} · Livello ${d.level}`, 14, COL.title);
  s += t(16, 266, 'domenica 27 settembre', 10, COL.gray, { weight: 400 });
  s += pill(16, 276, 44, '19:00', COL.blue) + pill(66, 276, 34, '1v1', COL.blue);
  const sp = o.seatsPop || 1;
  s += `<g transform="translate(142 285) scale(${f(sp)}) translate(-142 -285)">${pill(106, 276, 72, `${seats} / 256`, COL.blue)}</g>`;
  s += pill(184, 276, 64, 'LIVELLO 4', COL.tag);
  s += rr(16, 304, 368, 32, 6, COL.mag) + t(200, 324, 'COME GIOCARE', 11, '#fff', { anchor: 'middle' });
  s += rr(16, 346, 368, 50, 6, COL.blue) + t(28, 363, 'INFORMAZIONI', 9, '#fff') + `<path d="M28 370 L372 370" stroke="#fff" stroke-width="0.8" opacity="0.6"/>` + ic(I.trophy, 34, 384, 0.8) + t(46, 388, '20', 11, '#fff');
  [['people', 'Partecipanti'], ['trophy', 'Round'], ['doc', 'Regolamento']].forEach(([k, l], i) => {
    const x = 16 + i * 126;
    s += rr(x, 404, 116, 54, 8, COL.tile, { stroke: COL.ink, sw: 1.5 }) + ic(I[k], x + 58, 424, 1.1) + t(x + 58, 450, l, 9, '#fff', { anchor: 'middle', weight: 400 });
  });
  // barra fissa in basso: conto alla rovescia + tasto principale + navigazione
  const b = SHEET_BTN(h);
  s += rr(0, h - 124, UW, 124, 16, COL.navy);
  s += t(200, h - 106, countdown, 9, '#fff', { anchor: 'middle' });
  if (glow > 0) s += rr(b.x - 5, b.y - 5, b.w + 10, b.h + 10, 22, btnFill, { op: f(glow * 0.5) });
  s += rr(b.x, b.y + press * 3, b.w, b.h, 18, btnFill, { stroke: COL.ink, sw: 2 }) + t(200, b.y + 23 + press * 3, label, 12, '#fff', { anchor: 'middle' });
  return s + nav(h - 56);
}

// Popup di conferma iscrizione, testo reale dell'app
export function confirm(h, u, pressed = '') {
  if (u <= 0) return '';
  const cy = h / 2, k = u < 1 ? 0.6 + 0.4 * u : 1;
  let c = rr(40, cy - 90, 320, 180, 12, '#fff', { stroke: COL.ink, sw: 2.5 });
  c += `<circle cx="200" cy="${cy - 44}" r="26" fill="none" stroke="${COL.warn}" stroke-width="3"/>` + t(200, cy - 32, '!', 34, COL.warn, { anchor: 'middle' });
  c += t(200, cy + 16, 'Sei sicuro di volerti iscrivere al torneo?', 11, '#333', { anchor: 'middle', weight: 400 });
  c += rr(112, cy + 34, 80, 26, 3, COL.ok, pressed === 'conferma' ? { stroke: '#00FFFF', sw: 3 } : {}) + t(152, cy + 51, 'Conferma', 10, '#fff', { anchor: 'middle', weight: 400 });
  c += rr(208, cy + 34, 80, 26, 3, COL.ko) + t(248, cy + 51, 'Annulla', 10, '#fff', { anchor: 'middle', weight: 400 });
  return rr(0, 0, UW, h, 0, '#000', { op: f(0.45 * Math.min(1, u)) }) + `<g transform="translate(200 ${cy}) scale(${f(k)}) translate(-200 ${-cy})">${c}</g>`;
}

// Schermata di fine incontro (riferimento: treatment, registrazione TEST 06/02)
export function vittoria(h) {
  let s = header();
  s += rr(0, 70, UW, h - 70, 0, COL.blue);
  const cy = h * 0.4;
  s += `<g transform="translate(200 ${f(cy - 40)}) scale(4)">${`<path d="${I.trophy}" fill="#FFD84A" stroke="${COL.ink}" stroke-width="1.4" stroke-linejoin="round"/>`}</g>`;
  s += `<text x="200" y="${f(cy + 40)}" font-family="${SANS}" font-weight="900" font-size="40" fill="#fff" text-anchor="middle" stroke="${COL.ink}" stroke-width="1.5" paint-order="stroke">VITTORIA</text>`;
  s += t(200, cy + 72, 'CIUFFO  7 – 4  RIVALE', 13, '#fff', { anchor: 'middle' });
  s += rr(24, h - 150, 352, 38, 19, COL.mag, { stroke: COL.ink, sw: 2 }) + t(200, h - 126, 'VAI ALLA PROSSIMA PARTITA', 11, '#fff', { anchor: 'middle' });
  return s + nav(h - 56);
}
