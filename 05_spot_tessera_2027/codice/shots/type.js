// Sistema visivo eSports FITP: palette ufficiale (da esports.fitp.it) e gerarchia dei testi in Glancyr.
// Livello 1 = titolo (messaggio principale, uno per schermata), livello 2 = secondario, livello 3 = supporto.
// Gamification e CTA hanno stili propri. Tutti i testi entrano con la stessa grammatica di movimento.
import { W, H } from '../engine/r.js';
import { clamp, lerp, seg, E, rgba, deg } from '../engine/math.js';

export const BR = {
  violet: '#a406f9', lilac: '#c84cf0', magenta: '#f608be', cyan: '#00ffff',
  night: '#10091e', deep: '#311a60', deep2: '#1a0a2e', muted: '#ada3bf', white: '#ffffff',
};

// entrata dal basso dentro una maschera, uscita verso l'alto con dissolvenza
function motion(t, tin, tout, i = 0) {
  const d = 0.07 * i;
  const u = E.outExpo(seg(t, tin + d, tin + d + 0.5));
  const o = seg(t, tout, tout + 0.25);
  return { u, o, a: seg(t, tin + d, tin + d + 0.08) * (1 - o) };
}

// titolo: righe (stringhe o [testo, colore]); align 'left'|'center'
export function h1(R, lines, x, y, t, tin, tout = 1e9, o = {}) {
  const size = o.size || 92, lh = size * 1.08, al = o.align || 'left';
  R.hud(() => lines.forEach((ln, i) => {
    const [str, col] = Array.isArray(ln) ? ln : [ln, BR.white];
    const m = motion(t, tin, tout, i);
    if (m.a <= 0) return;
    const yy = y + i * lh;
    R.clipRect(0, yy - size * 0.95 - m.o * 40, W, size * 1.57); // include i discendenti (y = metà altezza maiuscole)
    R.text(str, x, yy + (1 - m.u) * size * 1.1 - m.o * 40, { font: 'glyB', size, align: al, v: 'cap', fill: col, alpha: m.a, tracking: -0.01, maxW: o.maxW || W - 160, shadow: ['rgba(8,4,24,0.55)', 30, 0, 8] });
    R.unclip();
  }));
}

// secondario: una riga, peso minore
export function h2(R, str, x, y, t, tin, tout = 1e9, o = {}) {
  const m = motion(t, tin, tout, 0);
  if (m.a <= 0) return;
  R.hud(() => R.text(str, x, y + (1 - m.u) * 26 - m.o * 20, { font: 'glyM', size: o.size || 36, align: o.align || 'left', v: 'cap', fill: o.fill || BR.lilac, alpha: m.a, tracking: 0.01, maxW: o.maxW || W - 160 }));
}

// supporto: discreto
export function sup(R, str, x, y, t, tin, tout = 1e9, o = {}) {
  const a = seg(t, tin, tin + 0.3) * (1 - seg(t, tout, tout + 0.25));
  if (a <= 0) return;
  R.hud(() => R.text(str, x, y, { font: 'glyR', size: o.size || 22, align: o.align || 'left', v: 'cap', fill: o.fill || BR.muted, alpha: a * (o.alpha ?? 1), tracking: 0.02, maxW: o.maxW || W - 120 }));
}

// etichetta/chip (es. nome dell'evento su una card): contorno sottile, testo piccolo
export function chip(R, str, x, y, a, o = {}) {
  if (a <= 0) return;
  const size = o.size || 20, w = R.measure(str, 'glySB', size, 0.08) + 36, h = size * 2;
  const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  R.rrect(x0, y - h / 2, w, h, h / 2, { fill: o.fill || 'rgba(16,9,30,0.72)', alpha: a });
  R.rrect(x0, y - h / 2, w, h, h / 2, { stroke: o.col || BR.cyan, lw: 1.5, alpha: a * 0.9 });
  ptext(R, str, x0 + w / 2, y, { font: 'glySB', size, align: 'center', v: 'cap', fill: o.ink || BR.white, alpha: a, tracking: 0.08 });
}

// testo con «+» leggibile: nel Glancyr il più è piccolo e basso, a corpi piccoli sembra un trattino
export function ptext(R, str, x, y, o) {
  if (!str.includes('+')) return R.text(str, x, y, o);
  const parts = str.split(/(\+)/).filter(Boolean), tr = o.tracking || 0;
  const sz = (p) => (p === '+' ? o.size * 1.6 : o.size);
  const ws = parts.map((p) => R.measure(p, o.font, sz(p), tr));
  const tot = ws.reduce((a, b) => a + b, 0);
  let cx = o.align === 'center' ? x - tot / 2 : o.align === 'right' ? x - tot : x;
  parts.forEach((p, i) => {
    const s2 = sz(p);
    R.text(p, cx, p === '+' ? y - 0.082 * s2 : y, { ...o, size: s2, align: 'left' });
    cx += ws[i];
  });
}

// pulsante CTA: pieno, gradiente magenta → viola, testo bianco grande
export function ctaButton(R, str, cx, cy, a, k = 1, o = {}) {
  if (a <= 0) return;
  const size = o.size || 52, w = R.measure(str, 'glyB', size, 0.02) + size * 2.2, h = size * 2.1;
  R.with([k, 0, 0, cx, 0, k, 0, cy, 0, 0, 1, 0], () => {
    R.rrect(-w / 2, -h / 2, w, h, h / 2, { stroke: BR.magenta, lw: 6, alpha: a, glow: 1.1, glowOnly: true });
    R.rrect(-w / 2, -h / 2, w, h, h / 2, { fill: { lin: [-w / 2, 0, w / 2, 0], stops: [[0, BR.magenta], [1, BR.violet]] }, alpha: a, shadow: ['rgba(0,0,0,0.45)', 30, 0, 10], knock: true });
    R.text(str, 0, 0, { font: 'glyB', size, align: 'center', v: 'cap', fill: BR.white, alpha: a, tracking: 0.02 });
  });
}

// sfondo di brand: notte viola con luci che respirano
export function brandBg(R, t, o = {}) {
  R.bg(o.top || BR.deep2, o.bottom || BR.night, [
    [W * (0.2 + 0.05 * Math.sin(t * 0.4)), H * 0.15, 900, BR.violet, 0.35 * (o.a ?? 1)],
    [W * (0.85 + 0.04 * Math.cos(t * 0.33)), H * 0.35, 700, BR.magenta, 0.16 * (o.a ?? 1)],
    [W * 0.55, H * 1.05, 900, BR.deep, 0.5 * (o.a ?? 1)],
  ]);
}

// ---------------------------------------------------------------- motion typography
// Righe che si costruiscono lettera per lettera: ogni glifo sale dalla maschera ruotando in prospettiva e si posa
// (scala 1,3 → 1). Uscita: le righe salgono fuori dalla maschera, una dopo l'altra.
// lines: [{ s, size, col, hl: [da, a] (caratteri evidenziati), hlCol, glow }]; y = centro della prima riga.
export function kin(R, lines, x, y, t, tin, tout = 1e9, o = {}) {
  const al = o.align || 'left', gap = o.lineGap ?? 0.26, st = o.stagger ?? 0.022;
  let yy = y;
  R.hud(() => lines.forEach((L, i) => {
    const size = L.size || o.size || 100;
    if (i > 0) yy += ((lines[i - 1].size || o.size || 100) * 0.5 + size * 0.5) * (o.lead ?? 1.12);
    const d0 = tin + (L.delay ?? i * gap);
    const ex = seg(t, tout + i * 0.06, tout + i * 0.06 + 0.32);
    if (t < d0 || ex >= 1) return;
    const exU = E.inCubic(ex);
    R.clipRect(0, yy - size * 0.98 - exU * size * 1.2, W, size * 1.62);
    R.text(L.s, x, yy - exU * size * 1.15, {
      font: L.font || 'glyB', size, align: al, v: 'cap', fill: L.col || BR.white, tracking: L.tracking ?? -0.012,
      alpha: 1 - ex * 0.6, glow: L.glow || 0, glowColor: L.glowColor, shadow: ['rgba(8,4,24,0.55)', 30, 0, 8],
      per: (g) => {
        const u = E.outExpo(seg(t, d0 + g * st, d0 + g * st + 0.55));
        const hl = L.hl && g >= L.hl[0] && g < L.hl[1];
        return { y: (1 - u) * size * 1.05, rx: (1 - u) * deg(-70), s: lerp(1.3, 1, u), a: seg(t, d0 + g * st, d0 + g * st + 0.1), fill: hl ? L.hlCol || BR.lilac : undefined };
      },
    });
    R.unclip();
  }));
  return yy;
}

// testo con punti centrali disegnati (Glancyr non ha il carattere «·»): parts = ['GAME', 'SET', 'MATCH']
// o: opzioni di R.text (centrato su x); o.per(i) riceve l'indice del carattere nella frase intera
export function dotText(R, parts, x, y, o) {
  const size = o.size || 100, gap = size * (o.dotGap ?? 0.75), tr = o.tracking || 0;
  const ws = parts.map((p) => R.measure(p, o.font, size, tr));
  let cx = x - (ws.reduce((a, b) => a + b, 0) + gap * (parts.length - 1)) / 2, off = 0;
  parts.forEach((p, k) => {
    const o0 = off;
    R.text(p, cx, y, { ...o, align: 'left', per: o.per ? (i, n, ch, G) => o.per(i + o0, n, ch, G) : undefined });
    off += p.length + 3;
    if (k < parts.length - 1) {
      const pa = o.per ? o.per(off - 2).a ?? 1 : 1;
      R.circle(cx + ws[k] + gap / 2, y, size * 0.075, { fill: o.dotFill || o.fill || '#fff', alpha: (o.alpha ?? 1) * pa, glow: o.glow || 0 }, 20);
    }
    cx += ws[k] + gap;
  });
}
