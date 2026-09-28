// Interfaccia myFITP ricostruita fedelmente dalle schermate reali (assets/riferimenti/myfitp): tema chiaro,
// intestazione blu, pulsanti magenta, pannelli blu notte. Dati inventati (utente, torneo, date).
// Coordinate dello schermo: origine al centro, 392 × 850 (le misure verticali ricalcano le schermate 1:1).
import { clamp, lerp, seg, env, E, rgba, mixc, deg, T, TRS } from '../engine/math.js';
import { checkMark } from '../engine/kit.js';

export const SW = 392, SH = 850, HX = SW / 2, HY = SH / 2;
export const MF = {
  blue: '#0858a8', blueHi: '#1466bf', card: '#2756a5', navy: '#063d80', navy2: '#0a4a93', tab: '#346bb3',
  mag: '#e02ebb', pill: '#edf1f9', badge: '#0c53aa', title: '#1b5fb0', grey: '#5f7aa6', line: '#bdc5d5', white: '#ffffff',
};
export const USER = { name: 'MARCO', pts: 'pt. 75' };
export const TOUR = { name: 'FITP eSeries by BMW - GENNAIO #1', date: 'martedì 12 gennaio', ora: '19:00', posti: '15 / 256', livello: 'LIVELLO 10' };

// ---------------------------------------------------------------- icone semplici (centro x,y, lato s)
export function icon(R, kind, x, y, s, c, a = 1) {
  const st = { stroke: c, lw: s * 0.13, alpha: a };
  if (kind === 'clock') {
    R.circle(x, y, s * 0.45, st, 24);
    R.line([x, y - s * 0.28, x, y, x + s * 0.2, y + s * 0.1], st);
  } else if (kind === 'trophy') {
    R.poly([x - s * 0.36, y - s * 0.42, x + s * 0.36, y - s * 0.42, x + s * 0.28, y - s * 0.02, x + s * 0.08, y + s * 0.14, x + s * 0.08, y + s * 0.3, x + s * 0.26, y + s * 0.3, x + s * 0.26, y + s * 0.44, x - s * 0.26, y + s * 0.44, x - s * 0.26, y + s * 0.3, x - s * 0.08, y + s * 0.3, x - s * 0.08, y + s * 0.14, x - s * 0.28, y - s * 0.02], { fill: c, alpha: a });
  } else if (kind === 'people') {
    R.circle(x - s * 0.18, y - s * 0.16, s * 0.15, { fill: c, alpha: a }, 16);
    R.circle(x + s * 0.2, y - s * 0.16, s * 0.15, { fill: c, alpha: a }, 16);
    R.rrect(x - s * 0.44, y + s * 0.04, s * 0.5, s * 0.34, s * 0.14, { fill: c, alpha: a });
    R.rrect(x - s * 0.04, y + s * 0.04, s * 0.5, s * 0.34, s * 0.14, { fill: c, alpha: a });
  } else if (kind === 'star') {
    const p = [];
    for (let i = 0; i < 10; i++) { const r = i % 2 ? s * 0.22 : s * 0.5, an = -Math.PI / 2 + (i * Math.PI) / 5; p.push(x + Math.cos(an) * r, y + Math.sin(an) * r); }
    R.poly(p, { fill: c, alpha: a });
  } else if (kind === 'user') {
    R.circle(x, y, s * 0.5, st, 28);
    R.circle(x, y - s * 0.1, s * 0.17, st, 16);
    R.arc(x, y + s * 0.42, s * 0.3, Math.PI * 1.15, Math.PI * 1.85, st, 16);
  } else if (kind === 'bell') {
    R.poly([x - s * 0.34, y + s * 0.26, x - s * 0.26, y + s * 0.12, x - s * 0.26, y - s * 0.1, x - s * 0.14, y - s * 0.34, x, y - s * 0.4, x + s * 0.14, y - s * 0.34, x + s * 0.26, y - s * 0.1, x + s * 0.26, y + s * 0.12, x + s * 0.34, y + s * 0.26], { stroke: c, lw: s * 0.1, alpha: a });
    R.arc(x, y + s * 0.32, s * 0.1, 0, Math.PI, { stroke: c, lw: s * 0.1, alpha: a }, 10);
  } else if (kind === 'lock') {
    R.rrect(x - s * 0.34, y - s * 0.05, s * 0.68, s * 0.5, s * 0.08, { fill: c, alpha: a });
    R.arc(x, y - s * 0.05, s * 0.22, Math.PI, Math.PI * 2, { stroke: c, lw: s * 0.12, alpha: a }, 16);
  }
}

function pill(R, x, y, w, h, fill, label, o = {}) {
  const a = o.alpha ?? 1;
  R.rrect(x, y, w, h, h / 2, { fill, alpha: a, stroke: o.stroke, lw: o.lw || 0 });
  let tx = x + w / 2;
  if (o.icon) { icon(R, o.icon, x + h * 0.62, y + h / 2, h * 0.62, o.ink || '#fff', a); tx = x + h * 0.95 + (w - h * 0.95) / 2; }
  if (label) R.text(label, tx, y + h / 2, { maxW: o.icon ? w - h * 0.95 - 8 : w - 12, font: o.font || 'rob500', size: o.size || h * 0.55, align: 'center', v: 'cap', fill: o.ink || '#fff', alpha: a, tracking: o.tracking || 0 });
}

// ---------------------------------------------------------------- intestazione (blu, con utente, logo, GOLD, campanella)
export function header(R, h = 150) {
  R.rrect(-HX, -HY - 30, SW, h + 30, 22, { fill: MF.blue });
  R.text('19:00', -HX + 14, -HY + 22, { font: 'rob500', size: 15, v: 'cap', fill: '#fff' });
  R.rrect(HX - 40, -HY + 14, 26, 14, 5, { fill: '#fff', alpha: 0.9 });
  R.text('87', HX - 27, -HY + 21, { font: 'rob700', size: 9, align: 'center', v: 'cap', fill: MF.blue });
  for (let i = 0; i < 4; i++) R.rect(HX - 70 + i * 5, -HY + 26 - i * 3, 3, 3 + i * 3, { fill: '#fff' });
  const y = -HY + 97;
  icon(R, 'user', -HX + 30, y, 26, '#fff');
  R.text(USER.name, -HX + 60, y - 6, { font: 'rob500', size: 15, v: 'cap', fill: '#fff' });
  R.text(USER.pts, -HX + 60, y + 12, { font: 'rob400', size: 11, v: 'cap', fill: '#fff', alpha: 0.9 });
  const lw = 112, lh = lw * (34 / 112);
  R.image(R.img.mf_logo, -lw / 2 + 4, y - lh / 2, lw, lh, { sub: 2 });
  R.rrect(HX - 88, y - 10, 34, 20, 3, { stroke: '#fff', lw: 1.6 });
  R.text('GOLD', HX - 71, y, { font: 'rob700', size: 9, align: 'center', v: 'cap', fill: '#fff' });
  icon(R, 'bell', HX - 30, y, 26, '#ffd23a');
}

export function navBar(R) {
  R.image(R.img.mf_nav, -HX, HY - 65, SW, 65, { sub: 2 });
}

// ---------------------------------------------------------------- MENU (con «Le Mie Tessere» e «Benefit Tesserati»)
// st: { hot: indice icona evidenziata, hotA, lock: 0..1 lucchetto su Benefit (1 = chiuso), unlock: 0..1 apertura }
export const MENU_ICON = (i) => [-136 + i * 90.7, -178];
export function scrMenu(R, t, st = {}) {
  R.rect(-HX, -HY, SW, SH, { fill: '#ffffff' });
  header(R);
  R.text('Menu', -HX + 30, -235, { font: 'rob500', size: 21, v: 'cap', fill: MF.title });
  R.band(-HX + 88, -236, -HX + 108, -236, 2, { fill: MF.title });
  R.image(R.img.mf_menu, -HX + 15, -208, 362, 78, { sub: 3 });
  if (st.hotA > 0) {
    const [x, y] = MENU_ICON(st.hot);
    R.circle(x, y + 2, 44, { fill: MF.mag, alpha: 0.16 * st.hotA, blur: 6 }, 40);
  }
  if (st.lock > 0) {
    // lucchetto sull'icona Benefit: si apre quando il benefit si sblocca
    const [x, y] = MENU_ICON(2);
    const u = st.unlock || 0;
    R.with(T(x + 22, y - 14 - u * 10, 0), () => {
      R.circle(0, 0, 13, { fill: u > 0.5 ? MF.mag : '#8a97ad', alpha: st.lock }, 24);
      R.rrect(-6, -1, 12, 9, 2, { fill: '#fff', alpha: st.lock });
      R.with(T(u * 6, -u * 4, 0), () => R.arc(0, -1, 4.2, Math.PI, Math.PI * 2, { stroke: '#fff', lw: 2, alpha: st.lock }, 12));
    });
  }
  // LE TUE ISCRIZIONI
  R.rrect(-HX, -83, SW, 300, 22, { fill: { lin: [0, -83, 0, 217], stops: [[0, '#0a4f9c'], [1, '#063d80']] } });
  R.text('LE TUE ISCRIZIONI', -HX + 28, -49, { font: 'rob500', size: 20, v: 'cap', fill: '#fff' });
  iscrizione(R, -HX + 16, -19, st.iscr ?? 1);
  iscrizione(R, -HX + 300, -19, 1, true);
  R.text('VEDI TUTTE', -HX + 30, 140, { font: 'rob500', size: 11, v: 'cap', fill: '#fff' });
  R.image(R.img.mf_promo, -HX, 212, SW, SW * (106 / 416), { sub: 3 });
  navBar(R);
}

function iscrizione(R, x, y, a, cut) {
  if (a <= 0) return;
  const w = 266, h = 128;
  R.rrect(x, y, w, h, 6, { fill: 'rgba(255,255,255,0.08)', stroke: 'rgba(255,255,255,0.55)', lw: 1.2, alpha: a });
  R.rrect(x, y, 104, h, 6, { fill: '#ffffff', alpha: a });
  R.rrect(x + 16, y + 20, 14, 24, 3, { stroke: MF.blue, lw: 1.6, alpha: a });
  R.text('12', x + 88, y + 30, { font: 'rob700', size: 28, align: 'right', v: 'cap', fill: MF.blue, alpha: a });
  R.text('Gennaio', x + 52, y + 56, { font: 'rob500', size: 14, align: 'center', v: 'cap', fill: MF.blue, alpha: a });
  const lw = 76, lh = lw * (717 / 1278);
  R.image(R.img.logo, x + 14, y + 72, lw, lh, { alpha: a, sub: 2 });
  if (cut) return;
  R.text('FITP eSeries by BMW', x + 116, y + 30, { maxW: 140, font: 'rob700', size: 13, v: 'cap', fill: '#fff', alpha: a });
  R.text('GENNAIO #1', x + 116, y + 48, { maxW: 140, font: 'rob700', size: 13, v: 'cap', fill: '#fff', alpha: a });
  R.text('Tennis Clash', x + 116, y + 72, { maxW: 140, font: 'rob400', size: 12, v: 'cap', fill: '#fff', alpha: a * 0.6 });
}

// ---------------------------------------------------------------- TORNEI (lista)
const LIST = [
  { name: 'FITP eSeries by BMW - GENNAIO #1', lv: 'Livello 10', badges: ['19:00', '1v1', '15/256', '20'] },
  { name: 'FITP eSeries by BMW - GENNAIO #2', lv: 'Livello 4', badges: ['21:00', '1v1', '42/256', '20'] },
  { name: 'FITP eSeries by BMW - OPEN #1', lv: 'Livello 1', badges: ['18:30', '1v1', '88/256', '10'] },
];
export const LIST_CARD = (i) => ({ x: -HX + 18, y: -80 + i * 150, w: 354, h: 137 });
// st: { press: indice card premuta, pressA, lift: sollevamento della card premuta (disegnato a parte), appear }
export function scrTornei(R, t, st = {}) {
  R.rect(-HX, -HY, SW, SH, { fill: '#ffffff' });
  header(R, 218);
  R.rrect(-177, -282, 169, 49, 4, { fill: '#ffffff' });
  icon(R, 'trophy', -134, -257, 20, MF.blue);
  R.text('TORNEI', -118, -257, { font: 'rob500', size: 14, v: 'cap', fill: MF.blue });
  R.rrect(8, -282, 169, 49, 4, { fill: MF.tab });
  R.text('LEADERBOARD', 104, -257, { font: 'rob500', size: 13, align: 'center', v: 'cap', fill: '#ffffff', alpha: 0.35 });
  pill(R, -182, -190, 116, 40, MF.blue, 'Disponibili', { size: 13, font: 'rob500' });
  R.circle(-72, -181, 10, { fill: MF.mag }, 20);
  R.text('3', -72, -181, { font: 'rob700', size: 11, align: 'center', v: 'cap', fill: '#fff' });
  R.rrect(-57, -190, 114, 40, 6, { fill: MF.pill });
  R.text('In corso', 0, -170, { font: 'rob500', size: 13, align: 'center', v: 'cap', fill: MF.blue });
  R.rrect(66, -190, 116, 40, 6, { fill: MF.blue });
  R.text('Completati', 124, -170, { font: 'rob500', size: 13, align: 'center', v: 'cap', fill: '#fff' });
  R.text('OGGI - 12 GENNAIO', -174, -103, { font: 'rob500', size: 13, v: 'cap', fill: MF.blue, tracking: 0.16 });
  R.band(-10, -103, 175, -103, 1.2, { fill: MF.line });
  LIST.forEach((c, i) => {
    const a = st.appear ? seg(st.appear, i * 0.12, i * 0.12 + 0.35) : 1;
    if (a <= 0) return;
    const L = LIST_CARD(i);
    R.with(T((1 - E.outCubic(a)) * 60, 0, 0), () => listCard(R, L, c, { alpha: a, press: st.press === i ? st.pressA : 0, hidden: st.press === i && st.lift > 0.02 }));
  });
  navBar(R);
}

export function listCard(R, L, c = LIST[0], o = {}) {
  const a = o.alpha ?? 1;
  if (o.hidden) { R.rrect(L.x, L.y, L.w, L.h, 10, { fill: '#e6ebf5', alpha: a }); return; }
  if (o.press > 0) R.rrect(L.x - 4, L.y - 4, L.w + 8, L.h + 8, 13, { fill: '#ffc6ee', alpha: a * o.press });
  R.rrect(L.x, L.y, L.w, L.h, 10, { fill: MF.card, alpha: a, shadow: o.shadow });
  R.clipPoly(R.rrPts(L.x + 14, L.y + 13, 80, 80, 8));
  R.image(R.img.mf_thumb, L.x + 14, L.y + 13, 80, 80, { alpha: a, sub: 2 });
  R.unclip();
  R.rrect(L.x + L.w - 92, L.y, 92, 18, 8, { fill: MF.mag, alpha: a });
  R.text('Disponibile', L.x + L.w - 46, L.y + 9, { maxW: 82, font: 'rob700i', size: 11, align: 'center', v: 'cap', fill: '#fff', alpha: a });
  R.text(c.name, L.x + 104, L.y + 50, { maxW: L.w - 116, font: 'rob400', size: 13.5, v: 'cap', fill: '#fff', alpha: a });
  R.rrect(L.x + 104, L.y + 62, 62, 17, 3, { fill: MF.mag, alpha: a });
  R.text(c.lv, L.x + 135, L.y + 70.5, { maxW: 56, font: 'rob700i', size: 10.5, align: 'center', v: 'cap', fill: '#fff', alpha: a });
  const B = [[15, 68, 'clock'], [89, 58, 'trophy'], [153, 82, 'people'], [241, 76, 'star']];
  B.forEach(([bx, bw, ic], j) => {
    pill(R, L.x + bx, L.y + 106, bw, 19, '#ffffff', j === 3 ? `${c.badges[j]} PTS` : c.badges[j], { ink: MF.card, icon: ic, size: 11.5, font: 'rob400', alpha: a });
  });
}

// ---------------------------------------------------------------- TORNEO (dettaglio)
// st: { reg: 0..1 pressione REGISTRATI, done: 0..1 iscritto, count: secondi al via }
export const REG_BTN = { x: 0, y: 322, w: 360, h: 55 };
export function scrTorneo(R, t, st = {}) {
  R.rect(-HX, -HY, SW, SH, { fill: '#ffffff' });
  header(R);
  R.line([-HX + 26, -238, -HX + 36, -246, -HX + 26, -238, -HX + 36, -230], { stroke: MF.title, lw: 2 });
  R.band(-HX + 26, -238, -HX + 44, -238, 2, { fill: MF.title });
  R.text('TORNEO', -HX + 52, -238, { font: 'rob500', size: 16, v: 'cap', fill: MF.title });
  R.rrect(HX - 106, -252, 88, 28, 3, { fill: MF.mag });
  R.text('Disponibile', HX - 62, -238, { maxW: 80, font: 'rob500', size: 12, align: 'center', v: 'cap', fill: '#fff', tracking: 0.12 });
  R.clipPoly(R.rrPts(-HX + 16, -203, SW - 32, 204, 8));
  R.image(R.img.mf_banner, -HX + 16, -203, SW - 32, 204, { sub: 4 });
  R.unclip();
  R.text(TOUR.name, -HX + 18, 32, { maxW: SW - 36, font: 'rob500', size: 19.5, v: 'cap', fill: MF.title });
  R.text(TOUR.date, -HX + 18, 62, { font: 'rob400', size: 15, v: 'cap', fill: MF.grey });
  pill(R, -HX + 18, 94, 78, 25, MF.badge, TOUR.ora, { icon: 'clock', size: 13, font: 'rob400' });
  pill(R, -HX + 104, 94, 60, 25, MF.badge, '1v1', { icon: 'trophy', size: 13, font: 'rob400' });
  pill(R, -HX + 172, 94, 96, 25, MF.badge, TOUR.posti, { icon: 'people', size: 13, font: 'rob400' });
  pill(R, -HX + 18, 127, 120, 25, MF.mag, TOUR.livello, { icon: 'star', size: 13, font: 'rob400' });
  R.rrect(-HX + 16, 173, SW - 32, 58, 5, { fill: MF.mag });
  R.text('COME GIOCARE', 0, 202, { font: 'rob500', size: 17, align: 'center', v: 'cap', fill: '#fff' });
  // pannello in basso: conto alla rovescia e REGISTRATI
  R.rrect(-HX, 250, SW, 200, 26, { fill: { lin: [0, 250, 0, 425], stops: [[0, MF.navy2], [1, MF.navy]] } });
  const c = Math.max(0, st.count ?? 27);
  R.text(`IL TORNEO INIZIERÀ TRA 3g 23h 59m ${String(Math.floor(c)).padStart(2, '0')}s`, 0, 277, { maxW: SW - 30, font: 'rob500', size: 12.5, align: 'center', v: 'cap', fill: '#fff' });
  const pr = st.reg || 0, dn = st.done || 0;
  const sc = 1 - 0.05 * pr;
  R.with([sc, 0, 0, REG_BTN.x, 0, sc, 0, REG_BTN.y, 0, 0, 1, 0], () => {
    R.rrect(-REG_BTN.w / 2, -REG_BTN.h / 2, REG_BTN.w, REG_BTN.h, REG_BTN.h / 2, { fill: rgba(mixc(MF.mag, '#ffffff', dn), 1) });
    R.clipRect(-REG_BTN.w / 2, -REG_BTN.h / 2, REG_BTN.w, REG_BTN.h);
    R.text('REGISTRATI', 0, -dn * 40, { font: 'rob500', size: 18, align: 'center', v: 'cap', fill: '#fff' });
    if (dn > 0) {
      R.text('SEI ISCRITTO', -14, (1 - dn) * 40, { font: 'rob700', size: 18, align: 'center', v: 'cap', fill: MF.mag });
      checkMark(R, 72, (1 - dn) * 40, 22, dn, { stroke: MF.mag, lw: 3.5 });
    }
    R.unclip();
  });
  navBar(R);
}

// finestra di conferma (come quella reale: icona arancione, domanda, pulsanti)
// st: { a: comparsa, press: pressione Conferma, spin: 0..1 caricamento }
export const DLG_OK = { x: 70, y: 96 };
export function dialog(R, t, st) {
  const a = st.a;
  if (a <= 0) return;
  R.rect(-HX, -HY + 150, SW, SH - 150, { fill: 'rgba(40,40,48,0.55)', alpha: a });
  const k = lerp(0.85, 1, E.outBack(a));
  R.with([k, 0, 0, 0, 0, k, 0, 30, 0, 0, 1, 0], () => {
    R.rect(-HX + 18, -130, SW - 36, 300, { fill: '#ffffff', alpha: a });
    R.circle(0, -62, 46, { stroke: '#f5a13a', lw: 3, alpha: a }, 48);
    R.band(0, -86, 0, -52, 5, { fill: '#f5a13a', alpha: a });
    R.circle(0, -38, 3.5, { fill: '#f5a13a', alpha: a }, 12);
    R.text('Sei sicuro di volerti iscrivere al torneo?', 0, 20, { maxW: SW - 76, font: 'rob400', size: 14.5, align: 'center', v: 'cap', fill: '#222', alpha: a });
    if (st.spin > 0 && st.spin < 1) {
      R.arc(-70, 66, 14, t * 9, t * 9 + 4.2, { stroke: MF.blue, lw: 3, alpha: a }, 24);
    } else {
      R.rrect(-120, 48, 100, 36, 3, { fill: '#e9ecf2', alpha: a });
      R.text('Annulla', -70, 66, { font: 'rob500', size: 14, align: 'center', v: 'cap', fill: '#444', alpha: a });
    }
    const pk = 1 - 0.06 * (st.press || 0);
    R.with([pk, 0, 0, DLG_OK.x, 0, pk, 0, 66, 0, 0, 1, 0], () => {
      R.rrect(-50, -18, 100, 36, 3, { fill: MF.blue, alpha: a });
      R.text('Conferma', 0, 0, { font: 'rob500', size: 14, align: 'center', v: 'cap', fill: '#fff', alpha: a });
    });
  });
}

// notifica di sistema in alto (come quella reale di myFITP)
export function notification(R, t, a, o = {}) {
  if (a <= 0) return;
  const w = 372, h = 44, y = -HY + 40;
  R.rrect(-w / 2, y - h / 2, w, h, h / 2, { fill: '#3f3c44', alpha: a * 0.97, shadow: ['rgba(0,0,0,0.35)', 18, 0, 6] });
  R.circle(-w / 2 + 24, y, 14, { fill: '#ffffff', alpha: a }, 24);
  R.text('FITP', -w / 2 + 24, y, { font: 'rob900i', size: 8, align: 'center', v: 'cap', fill: MF.blue, alpha: a });
  R.text('Notifica da eSports', -w / 2 + 46, y, { maxW: 126, font: 'rob700', size: 13, v: 'cap', fill: '#fff', alpha: a });
  R.text('Hai un nuovo match nel torneo', -w / 2 + 180, y, { maxW: w - 196, font: 'rob400', size: 12.5, v: 'cap', fill: '#fff', alpha: a * 0.92 });
  if (o.press > 0) R.rrect(-w / 2, y - h / 2, w, h, h / 2, { fill: '#ffffff', alpha: a * 0.18 * o.press });
}

// tocco del dito: cerchio che si allarga
export function tap(R, x, y, dt, a = 1) {
  if (dt < 0 || dt > 0.5) return;
  const u = dt / 0.5;
  R.circle(x, y, lerp(16, 60, E.outCubic(u)), { stroke: '#ffffff', lw: 3, alpha: a * (1 - u), glow: 0.3 }, 40);
  R.circle(x, y, 18, { fill: '#ffffff', alpha: a * 0.45 * (1 - u) }, 28);
}

// ---------------------------------------------------------------- smartphone
// disegna il telefono nel piano corrente (centro 0,0) e il contenuto dello schermo con fn(R)
export const PH = { w: 424, h: 884, r: 58 };
export function phone(R, t, fn, o = {}) {
  for (let k = 6; k >= 1; k--) R.with(T(0, 0, k * 3.5), () => R.rrect(-PH.w / 2, -PH.h / 2, PH.w, PH.h, PH.r, { fill: mixc('#0c0c16', '#2a2550', k / 6) }));
  R.rrect(-PH.w / 2, -PH.h / 2, PH.w, PH.h, PH.r, { fill: '#050508', knock: true });
  R.rrect(-PH.w / 2 + 1, -PH.h / 2 + 1, PH.w - 2, PH.h - 2, PH.r, { stroke: { lin: [-PH.w / 2, -PH.h / 2, PH.w / 2, PH.h / 2], stops: [[0, '#00fcfc'], [0.5, '#8a6bff'], [1, '#f408bc']] }, lw: 3, glow: o.rimGlow ?? 0.7 });
  R.clipPoly(R.rrPts(-HX, -HY, SW, SH, 44));
  fn(R);
  R.unclip();
  // riflesso sul vetro
  R.poly([-HX, -HY, -HX + 150, -HY, -HX + 20, HY, -HX, HY], { fill: '#ffffff', alpha: 0.04, blend: 'screen' });
  R.rrect(-46, -HY + 14, 92, 26, 13, { fill: '#000' });
}

// indicatore del tocco (come nelle registrazioni dello schermo): cerchio che arriva, preme, rilascia
// p: posizione nello schermo del telefono; press: 0..1; a: visibilità
export function finger(R, x, y, press = 0, a = 1) {
  if (a <= 0.003) return;
  const r = 26 - 6 * press;
  R.circle(x + 3, y + 5, r + 2, { fill: '#000', alpha: a * 0.22, blur: 6 }, 32);
  R.circle(x, y, r, { fill: '#ffffff', alpha: a * (0.55 + 0.25 * press) }, 32);
  R.circle(x, y, r, { stroke: '#ffffff', lw: 2.5, alpha: a * 0.95 }, 32);
}

// traccia del dito: elenco di tocchi {t, x, y}. Per ogni tocco il dito compare poco prima, arriva sul bersaglio,
// preme e sparisce: non resta mai sospeso su elementi che non ci sono più.
export function fingerTrack(R, t, taps, o = {}) {
  for (const T0 of taps) {
    const a = seg(t, T0.t - 0.55, T0.t - 0.4) * (1 - seg(t, T0.t + 0.3, T0.t + 0.45));
    if (a > 0) {
      const u = E.outCubic(seg(t, T0.t - 0.55, T0.t - 0.08));
      const x = lerp(T0.x + 50, T0.x, u), y = lerp(T0.y + 150, T0.y, u);
      const press = env(t, T0.t - 0.06, T0.t, T0.t + 0.1, T0.t + 0.22);
      finger(R, x, y, press, a * (o.alpha ?? 1));
    }
    tap(R, T0.x, T0.y, t - T0.t, 1);
  }
}
