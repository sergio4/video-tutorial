// SuperTennis Arena in stile cartoon, vista di gioco verticale da dietro il fondo campo
// (come la camera di Tennis Clash). Riferimenti: assets/riferimenti/campo_supertennis e
// tennis_clash. Nessun elemento di Tennis Clash è copiato: niente campioni, HUD reinterpretato.
import { A } from './assets.js';
import { C } from './ciuffo.js';

export const AW = 1080, AH = 1920;
const INK = '#1C1438';
const f = n => (Math.round(n * 10) / 10).toString();
const lerp = (a, b, u) => a + (b - a) * u;

// prospettiva del campo: y dello schermo per una profondità d (0 = fondo vicino, 1 = fondo lontano)
export const COURT = { yNear: 1780, yFar: 760, xNearL: 60, xNearR: 1020, xFarL: 360, xFarR: 720 };
export function courtPt(u, d) { // u: 0 sinistra … 1 destra; d: 0 vicino … 1 lontano
  const k = Math.pow(d, 0.72); // compressione verso il fondo
  const y = lerp(COURT.yNear, COURT.yFar, k);
  const xl = lerp(COURT.xNearL, COURT.xFarL, k), xr = lerp(COURT.xNearR, COURT.xFarR, k);
  return [lerp(xl, xr, u), y, lerp(1, 0.34, k)]; // x, y, scala apparente
}

function crowd(x0, y0, w, h, rows, seed) {
  let s = '', r = seed;
  const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  const cols = ['#F2C09A', '#C98A5E', '#8A5A3B', '#F6D3B3'], shirts = ['#E0432B', '#FFD84A', '#2F5D3A', '#FFFFFF', '#F608BE', '#00B3C8', '#FF8A3D'];
  for (let i = 0; i < rows; i++) {
    const y = y0 + (i + 0.6) * h / rows;
    for (let x = x0 + 10; x < x0 + w - 10; x += 26 + rnd() * 10) {
      if (rnd() < 0.18) continue;
      s += `<rect x="${f(x - 8)}" y="${f(y - 2)}" width="16" height="14" rx="5" fill="${shirts[Math.floor(rnd() * shirts.length)]}"/>` +
        `<circle cx="${f(x)}" cy="${f(y - 8)}" r="7" fill="${cols[Math.floor(rnd() * cols.length)]}"/>`;
    }
  }
  return s;
}
function tree(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-6 0 L-4 -70 Q-30 -90 -20 -100 M-4 -70 L10 -110 M2 -40 L30 -80" stroke="#6B3E24" stroke-width="10" fill="none" stroke-linecap="round"/>` +
    `<circle cx="-30" cy="-110" r="46" fill="#4FBF3A" stroke="${INK}" stroke-width="5"/><circle cx="20" cy="-130" r="54" fill="#7ED63A" stroke="${INK}" stroke-width="5"/><circle cx="48" cy="-92" r="38" fill="#3FA83A" stroke="${INK}" stroke-width="5"/></g>`;
}
const logo = (href, x, y, w, h, extra = '') => `<image href="${href}" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" preserveAspectRatio="xMidYMid meet" ${extra}/>`;

// fondale statico (cielo, città, alberi, muro, tribune, campo); drift anima le nuvole
export function arena(t = 0) {
  let s = `<defs><linearGradient id="arSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A4AA8"/><stop offset="0.55" stop-color="#C77BB0"/><stop offset="1" stop-color="#F4B08A"/></linearGradient></defs>`;
  s += `<rect width="${AW}" height="760" fill="url(#arSky)"/>`;
  for (const [x, y, w] of [[120, 160, 260], [620, 110, 320], [860, 260, 200], [320, 330, 220]]) {
    const dx = (t * 12) % 1300;
    s += `<ellipse cx="${f(((x + dx) % 1300) - 110)}" cy="${y}" rx="${w / 2}" ry="${w / 7}" fill="#F7B6C8" opacity="0.55"/>`;
  }
  // città
  for (const [x, w, h] of [[80, 70, 190], [170, 60, 260], [240, 80, 150], [700, 70, 280], [780, 90, 200], [880, 60, 240], [960, 80, 170]])
    s += `<rect x="${x}" y="${600 - h}" width="${w}" height="${h + 40}" fill="#E9D6EE" stroke="${INK}" stroke-width="3" opacity="0.85"/>` +
      Array.from({ length: Math.floor(h / 40) }, (_, i) => `<rect x="${x + 12}" y="${612 - h + i * 40}" width="${w - 24}" height="10" fill="#B9A6D6" opacity="0.7"/>`).join('');
  s += tree(160, 640, 1.2) + tree(420, 600, 0.9) + tree(880, 630, 1.25) + tree(1040, 650, 0.9);
  // muro di fondo con i loghi
  s += `<rect x="0" y="600" width="${AW}" height="150" fill="#5B35D6" stroke="${INK}" stroke-width="5"/>`;
  s += `<rect x="0" y="600" width="${AW}" height="20" fill="#7B55F0"/>`;
  s += logo(A.supertennis, 330, 628, 420, 90, 'filter="url(#toWhite)"');
  s += logo(A.esports, 70, 630, 200, 100) + logo(A.esports, 810, 630, 200, 100);
  // tribune laterali
  s += `<path d="M0 760 L260 760 L0 1180 Z" fill="#4A2BB8" stroke="${INK}" stroke-width="5"/><path d="M${AW} 760 L${AW - 260} 760 L${AW} 1180 Z" fill="#4A2BB8" stroke="${INK}" stroke-width="5"/>`;
  s += `<clipPath id="stL"><path d="M0 770 L240 770 L0 1160 Z"/></clipPath><g clip-path="url(#stL)">${crowd(0, 770, 250, 390, 9, 11)}</g>`;
  s += `<clipPath id="stR"><path d="M${AW} 770 L${AW - 240} 770 L${AW} 1160 Z"/></clipPath><g clip-path="url(#stR)">${crowd(AW - 250, 770, 250, 390, 9, 29)}</g>`;
  // superficie e campo
  s += `<path d="M260 750 L${AW - 260} 750 L${AW} 1180 L${AW} ${AH} L0 ${AH} L0 1180 Z" fill="#4C8DE8"/>`;
  const P = (u, d) => courtPt(u, d).slice(0, 2).map(f).join(' ');
  s += `<path d="M${P(0, 0)} L${P(1, 0)} L${P(1, 1)} L${P(0, 1)} Z" fill="#1463E0" stroke="#fff" stroke-width="9" stroke-linejoin="round"/>`;
  const L = (a, b) => `<path d="M${P(...a)} L${P(...b)}" stroke="#fff" stroke-width="7"/>`;
  s += L([0.125, 0], [0.125, 1]) + L([0.875, 0], [0.875, 1]) + L([0.125, 0.25], [0.875, 0.25]) + L([0.125, 0.75], [0.875, 0.75]) + L([0.5, 0.25], [0.5, 0.75]);
  // scritta a terra
  s += `<text x="90" y="1860" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="64" fill="#fff" opacity="0.35">SUPERTENNIS ARENA</text>`;
  // seggiolone dell'arbitro
  const [ux, uy] = courtPt(1.08, 0.5);
  s += `<g transform="translate(${f(ux)} ${f(uy)})"><rect x="-6" y="-150" width="12" height="150" fill="#fff" stroke="${INK}" stroke-width="4"/><rect x="-30" y="-190" width="60" height="44" rx="6" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="0" cy="-205" r="14" fill="#C98A5E" stroke="${INK}" stroke-width="4"/></g>`;
  return s;
}
// rete: va disegnata sopra il campo e sopra l'avversario, sotto il giocatore vicino
export function net() {
  const [xl, y] = courtPt(-0.04, 0.5), [xr] = courtPt(1.04, 0.5);
  let mesh = '';
  for (let x = xl; x < xr; x += 16) mesh += `M${f(x)} ${f(y - 70)} L${f(x)} ${f(y)} `;
  return `<rect x="${f(xl)}" y="${f(y - 70)}" width="${f(xr - xl)}" height="70" fill="#0B1F4A" opacity="0.55"/>` +
    `<path d="${mesh}" stroke="#fff" stroke-width="1.2" opacity="0.35"/>` +
    `<rect x="${f(xl)}" y="${f(y - 76)}" width="${f(xr - xl)}" height="10" fill="#fff" stroke="${INK}" stroke-width="3"/>` +
    `<rect x="${f(xl - 8)}" y="${f(y - 84)}" width="14" height="88" fill="#C9CCD6" stroke="${INK}" stroke-width="3"/><rect x="${f(xr - 6)}" y="${f(y - 84)}" width="14" height="88" fill="#C9CCD6" stroke="${INK}" stroke-width="3"/>`;
}
// avversario generico (non è un campione di Tennis Clash)
export function rival(u, d, t = 0, swing = 0) {
  const [x, y, k] = courtPt(u, d), s = 1.7 * k;
  const bob = Math.sin(t * 9) * 3;
  const arm = lerp(-40, 70, swing);
  return `<g transform="translate(${f(x)} ${f(y + bob)}) scale(${f(s)})">` +
    `<ellipse cx="0" cy="4" rx="46" ry="8" fill="${INK}" opacity="0.2"/>` +
    `<path d="M-14 0 L-10 -70 M14 0 L10 -70" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M-14 0 L-10 -70 M14 0 L10 -70" stroke="#8A5A3B" stroke-width="9" stroke-linecap="round"/>` +
    `<rect x="-26" y="-96" width="52" height="34" rx="8" fill="#222A5C" stroke="${INK}" stroke-width="5"/>` +
    `<rect x="-24" y="-160" width="48" height="70" rx="12" fill="#FF8A3D" stroke="${INK}" stroke-width="5"/>` +
    `<g transform="rotate(${f(arm)} 20 -150)"><path d="M20 -150 L52 -110" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M52 -110 L78 -80" stroke="${INK}" stroke-width="7"/><ellipse cx="90" cy="-66" rx="18" ry="24" fill="none" stroke="${INK}" stroke-width="6"/></g>` +
    `<circle cx="0" cy="-190" r="28" fill="#8A5A3B" stroke="${INK}" stroke-width="5"/><path d="M-28 -198 Q0 -232 28 -198 Q16 -214 0 -214 Q-16 -214 -28 -198 Z" fill="#1C1438"/>` +
    `</g>`;
}
// HUD reinterpretato: nomi e punteggio in alto, due pannelli come nel gioco
// (sotto la fascia alta, lasciata libera per le note dell'animatic)
const HUD_Y = 150;
export function hud(me = 4, them = 4) {
  const panel = (x, flip, name, score, col) => {
    const sx = flip ? -1 : 1;
    return `<g transform="translate(${x} ${HUD_Y}) scale(${sx} 1)"><path d="M0 0 L400 0 L380 70 L0 70 Z" fill="${col}" stroke="${INK}" stroke-width="5"/>` +
      `<path d="M300 0 L400 0 L380 70 L280 70 Z" fill="#fff" stroke="${INK}" stroke-width="5"/>` +
      `<rect x="0" y="76" width="360" height="16" rx="8" fill="#123" opacity="0.5"/><rect x="0" y="76" width="${flip ? 250 : 310}" height="16" rx="8" fill="#6BE84A"/></g>` +
      `<text x="${flip ? x - 40 : x + 40}" y="${HUD_Y + 50}" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="38" fill="#fff" text-anchor="${flip ? 'end' : 'start'}">${name}</text>` +
      `<text x="${flip ? x - 335 : x + 335}" y="${HUD_Y + 54}" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="52" fill="${INK}" text-anchor="middle">${score}</text>`;
  };
  return panel(30, false, 'CIUFFO', me, '#2B6BE0') + panel(1050, true, 'RIVALE', them, '#F07A2A');
}
// pallina con ombra e scia; p = [x, y, altezza in px sopra il campo]
export function ball(p, trail = []) {
  if (!p) return '';
  const [x, y, hgt = 0] = p;
  let s = `<ellipse cx="${f(x)}" cy="${f(y)}" rx="14" ry="5" fill="${INK}" opacity="0.25"/>`;
  trail.forEach(([tx, ty, th = 0], i) => s += `<circle cx="${f(tx)}" cy="${f(ty - th)}" r="${f(10 + i)}" fill="#E8F55A" opacity="${f(0.1 + i * 0.07)}"/>`);
  return s + `<circle cx="${f(x)}" cy="${f(y - hgt)}" r="17" fill="#E8F55A" stroke="${INK}" stroke-width="4"/><path d="M${f(x - 12)} ${f(y - hgt - 6)} Q${f(x)} ${f(y - hgt)} ${f(x - 4)} ${f(y - hgt + 14)}" stroke="#fff" stroke-width="3" fill="none"/>`;
}
