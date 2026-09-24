// Rig vettoriale di Ciuffo, protagonista del video «Tocca a te».
// Coordinate personaggio: origine a terra tra i piedi, y verso il basso (a terra y = 0, il corpo sta a y negative).
// Angoli degli arti in gradi: 0 = verso il basso, positivo = verso destra dello schermo.

export const C = {
  ink: '#2B2233', skin: '#F2C09A', skinFar: '#DDA67E', hair: '#E0432B', hairFar: '#C23721',
  white: '#FFFFFF', whiteFar: '#E4DEEC', violet: '#3A2170', violetFar: '#2A1552',
  green: '#2F5D3A', greenFar: '#24482D', pink: '#F608BE', cyan: '#00FFFF',
  freckle: '#C65A2E', mouth: '#4A1E2C', tongue: '#E06A6A', paper: '#F3EDE2',
};
const OL = 6;
const L_UP = 100, L_FORE = 92, L_THIGH = 150, L_SHIN = 145, ANKLE_H = 30;
const HIP_Y = -(L_THIGH + L_SHIN + ANKLE_H); // -325
const SHOULDER_Y = HIP_Y - 170;               // -495

const rad = d => (d * Math.PI) / 180;
const f = n => (Math.round(n * 10) / 10).toString();
const dir = a => [Math.sin(rad(a)), Math.cos(rad(a))];
const seg = (p, a, len) => { const [dx, dy] = dir(a); return [p[0] + dx * len, p[1] + dy * len]; };
const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
const pts = ps => ps.map(p => f(p[0]) + ' ' + f(p[1])).join(' L');

function tube(ps, w, fill, cap = 'round') {
  const d = 'M' + pts(ps);
  return `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="${w + OL * 2}" stroke-linecap="${cap}" stroke-linejoin="round"/>` +
         `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="${cap}" stroke-linejoin="round"/>`;
}
function shape(d, fill, sw = OL) {
  return `<path d="${d}" fill="${fill}" stroke="${C.ink}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
}
function line(d, sw = 4.5) {
  return `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
}
// trapezio lungo un segmento (per pantaloncini e calzini)
function quad(p1, p2, w1, w2, fill) {
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1], l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l, ny = dx / l;
  const a = [p1[0] + nx * w1 / 2, p1[1] + ny * w1 / 2], b = [p2[0] + nx * w2 / 2, p2[1] + ny * w2 / 2];
  const c = [p2[0] - nx * w2 / 2, p2[1] - ny * w2 / 2], d = [p1[0] - nx * w1 / 2, p1[1] - ny * w1 / 2];
  return shape('M' + pts([a, b, c, d]) + ' Z', fill);
}

// ---------- arti ----------
function hand(p, a, type, far, phoneRot) {
  const skin = far ? C.skinFar : C.skin;
  let s = '';
  if (type === 'point') {
    const tip = seg(p, a, 30);
    s += tube([p, tip], 9, skin);
  }
  if (type === 'phone') {
    const r = phoneRot ?? -12;
    s += `<g transform="translate(${f(p[0])} ${f(p[1] - 18)}) rotate(${r})">` +
         `<rect x="-19" y="-34" width="38" height="66" rx="7" fill="${C.ink}" stroke="${C.ink}" stroke-width="${OL}"/>` +
         `<rect x="-14" y="-28" width="28" height="52" rx="3" fill="${C.cyan}" opacity="0.85"/></g>`;
  }
  s += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="17" fill="${skin}" stroke="${C.ink}" stroke-width="${OL}"/>`;
  if (type === 'fist') {
    const [dx, dy] = dir(a + 90);
    s += line(`M${f(p[0] - dx * 8)} ${f(p[1] - dy * 8)} L${f(p[0] + dx * 8)} ${f(p[1] + dy * 8)}`, 3);
  }
  return s;
}
function arm(sh, a1, a2, o = {}) {
  const far = !!o.far;
  const el = seg(sh, a1, L_UP), wr = seg(el, a1 + a2, L_FORE);
  const hp = seg(wr, a1 + a2, 8);
  let s = tube([sh, el, wr], 19, far ? C.skinFar : C.skin);
  if (o.band) {
    const b1 = lerp(el, wr, 0.6), bm = lerp(el, wr, 0.74), b2 = lerp(el, wr, 0.88);
    s += quad(b1, bm, 27, 27, C.pink) + quad(bm, b2, 27, 27, C.cyan);
  }
  s += tube([lerp(sh, el, 0.1), lerp(sh, el, 0.42)], 34, far ? C.whiteFar : C.white);
  s += hand(hp, a1 + a2, o.hand || 'open', far, o.phoneRot);
  return s;
}
function sneaker(an, view, rot = 0, far = false) {
  const w = far ? C.whiteFar : C.white;
  let body, extra;
  if (view === 'front' || view === 'back') {
    body = 'M-34 34 Q-40 -4 0 -8 Q40 -4 34 34 Z';
    extra = line('M-36 34 L36 34', 8) + (view === 'front' ? line('M-12 8 L12 8 M-14 18 L14 18', 3) : '');
  } else {
    const k = view === 'q' ? 0.78 : 1;
    body = `M${-30 * k} 0 Q${-36 * k} 30 ${-24 * k} 34 L${58 * k} 34 Q${66 * k} 34 ${64 * k} 22 Q${60 * k} 6 ${30 * k} 4 L${16 * k} -8 L${-18 * k} -10 Z`;
    extra = line(`M${-26 * k} 34 L${62 * k} 34`, 8) + line(`M${6 * k} 2 L${18 * k} 14 M${16 * k} -2 L${28 * k} 10`, 3);
  }
  return `<g transform="translate(${f(an[0])} ${f(an[1])}) rotate(${f(rot)})">${shape(body, w)}${extra}</g>`;
}
function leg(hp, a1, a2, view, o = {}) {
  const far = !!o.far;
  const kn = seg(hp, a1, L_THIGH), an = seg(kn, a1 + a2, L_SHIN);
  let s = tube([hp, kn, an], 24, far ? C.skinFar : C.skin);
  s += quad(lerp(kn, an, 0.7), an, 30, 30, far ? C.whiteFar : C.white);
  s += quad(hp, lerp(hp, kn, 0.45), 50, 56, far ? C.violetFar : C.violet);
  const footRot = o.footRot ?? ((view === 'side' || view === 'q') ? 0.4 * (a1 + a2) : 0);
  s += sneaker(an, view, footRot, far);
  return s;
}
export function legReach(a1, a2) {
  return L_THIGH * Math.cos(rad(a1)) + L_SHIN * Math.cos(rad(a1 + a2));
}

// ---------- testa ----------
const EXPR = {
  neutro:      { eyes: ['dot', 'dot'],     brows: [[0, -2], [-2, 0]],     mouth: 'smile' },
  annoiato:    { eyes: ['half', 'half'],   brows: [[5, 5], [5, 5]],       mouth: 'flat' },
  incuriosito: { eyes: ['dot', 'wide'],    brows: [[0, -2], [-16, -9]],   mouth: 'smirk' },
  determinato: { eyes: ['dot', 'dot'],     brows: [[-4, 7], [7, -4]],     mouth: 'firm' },
  furbo:       { eyes: ['dot', 'wink'],    brows: [[-7, -9], [7, 5]],     mouth: 'smirk' },
  sorpreso:    { eyes: ['wide', 'wide'],   brows: [[-13, -16], [-16, -13]], mouth: 'O' },
  esultanza:   { eyes: ['happy', 'happy'], brows: [[-11, -8], [-8, -11]], mouth: 'grin' },
  sorriso:     { eyes: ['happy', 'happy'], brows: [[-5, -5], [-5, -5]],   mouth: 'smile' },
  blink:       { eyes: ['closed', 'closed'], brows: [[0, -2], [-2, 0]],   mouth: 'smile' },
};
export const EXPRESSIONS = ['neutro', 'annoiato', 'incuriosito', 'determinato', 'furbo', 'sorpreso', 'esultanza', 'sorriso'];

function eye(x, y, type, k = 1) {
  const r = 6.5 * k;
  switch (type) {
    case 'wide': return `<circle cx="${x}" cy="${y}" r="${8.8 * k}" fill="${C.ink}"/><circle cx="${x + 2.5}" cy="${y - 3}" r="${2.2 * k}" fill="#fff"/>`;
    case 'half': return `<path d="M${x - r} ${y} A${r} ${r} 0 0 0 ${x + r} ${y} Z" fill="${C.ink}"/>` + line(`M${x - 10 * k} ${y - 1} L${x + 10 * k} ${y - 1}`, 4);
    case 'happy': return line(`M${x - 9 * k} ${y + 3} Q${x} ${y - 9} ${x + 9 * k} ${y + 3}`, 4.5);
    case 'wink':
    case 'closed': return line(`M${x - 9 * k} ${y} Q${x} ${y + 6} ${x + 9 * k} ${y}`, 4.5);
    default: return `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.ink}"/>`;
  }
}
function mouth(x, y, type, k = 1) {
  switch (type) {
    case 'flat': return line(`M${x - 14 * k} ${y + 3} L${x + 12 * k} ${y + 1}`);
    case 'firm': return line(`M${x - 15 * k} ${y + 4} Q${x} ${y - 1} ${x + 15 * k} ${y + 4}`);
    case 'smirk': return line(`M${x - 15 * k} ${y + 3} Q${x + 2 * k} ${y + 9} ${x + 20 * k} ${y - 8}`);
    case 'O': return `<ellipse cx="${x}" cy="${y + 4}" rx="${11 * k}" ry="15" fill="${C.mouth}" stroke="${C.ink}" stroke-width="4"/>`;
    case 'grin': return `<path d="M${x - 26 * k} ${y - 6} Q${x} ${y + 42} ${x + 26 * k} ${y - 6} Z" fill="${C.mouth}" stroke="${C.ink}" stroke-width="4.5" stroke-linejoin="round"/>` +
      `<path d="M${x - 22 * k} ${y - 3} L${x + 22 * k} ${y - 3} L${x + 18 * k} ${y + 5} L${x - 18 * k} ${y + 5} Z" fill="#fff"/>` +
      `<ellipse cx="${x}" cy="${y + 20}" rx="${11 * k}" ry="6" fill="${C.tongue}"/>`;
    default: return line(`M${x - 20 * k} ${y - 3} Q${x} ${y + 13} ${x + 21 * k} ${y - 5}`);
  }
}
function brow(x, y, d, k = 1) {
  return line(`M${x - 12 * k} ${y + d[0]} L${x + 12 * k} ${y + d[1]}`, 5);
}
function freckles(list) {
  return `<g fill="${C.freckle}" opacity="0.75">` + list.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6"/>`).join('') + '</g>';
}

function head(view, exprName, hairSway = 0) {
  const e = EXPR[exprName] || EXPR.neutro;
  const hairG = d => `<g transform="rotate(${f(hairSway)} 0 -40)">${shape(d, C.hair)}</g>`;
  let s = '';
  if (view === 'front' || view === 'back') {
    const back = view === 'back';
    s += hairG(back
      ? 'M-70 -14 L-98 -72 L-58 -64 L-72 -128 L-24 -92 L-8 -152 L18 -98 L48 -142 L50 -84 L92 -102 L74 -40 L70 -12 Z'
      : 'M-64 -30 L-86 -86 L-46 -70 L-56 -130 L-16 -92 L-4 -154 L22 -98 L48 -146 L52 -88 L90 -116 L74 -62 L100 -58 L66 -24 Z');
    s += `<ellipse cx="-68" cy="10" rx="14" ry="20" fill="${C.skin}" stroke="${C.ink}" stroke-width="${OL}"/>`;
    s += `<ellipse cx="68" cy="10" rx="14" ry="20" fill="${C.skin}" stroke="${C.ink}" stroke-width="${OL}"/>`;
    s += shape('M-66 -30 Q-66 -82 0 -82 Q66 -82 66 -30 L64 18 Q58 80 0 86 Q-58 80 -64 18 Z', C.skin);
    if (back) {
      s += shape('M-66 -30 Q-66 -90 0 -90 Q66 -90 66 -30 L64 20 L52 34 L40 22 L28 38 L14 24 L0 40 L-14 24 L-28 38 L-40 22 L-52 34 L-64 20 Z', C.hair);
      s += shape('M-70 -62 Q0 -44 70 -62 L72 -34 Q0 -16 -72 -34 Z', C.white);
      s += shape('M52 -44 L78 -8 L66 -4 L48 -36 Z', C.white, 4) + shape('M60 -46 L92 -20 L82 -12 L56 -38 Z', C.white, 4);
    } else {
      s += shape('M-67 -40 Q-67 -90 0 -90 Q67 -90 67 -40 Z', C.hair);
      s += shape('M-70 -58 Q0 -84 70 -58 L72 -28 Q0 -52 -72 -28 Z', C.white);
      s += line('M-52 -58 l0 9 M-32 -64 l0 9 M-12 -67 l0 9 M8 -67 l0 9 M28 -65 l0 9 M48 -60 l0 9', 2);
      s += brow(-24, -14, e.brows[0]) + brow(24, -14, e.brows[1]);
      s += eye(-24, 8, e.eyes[0]) + eye(24, 8, e.eyes[1]);
      s += line('M2 20 L-8 40 L6 40', 4);
      s += freckles([[-44, 30], [-36, 37], [-48, 40], [44, 30], [36, 37], [48, 40]]);
      s += mouth(0, 57, e.mouth);
    }
  } else if (view === 'q') {
    s += hairG('M-70 -20 L-120 -58 L-74 -70 L-106 -120 L-48 -96 L-54 -152 L-6 -104 L18 -152 L32 -96 L64 -118 L54 -62 L64 -28 Z');
    s += `<ellipse cx="-56" cy="10" rx="14" ry="20" fill="${C.skin}" stroke="${C.ink}" stroke-width="${OL}"/>`;
    s += shape('M-60 -30 Q-58 -82 6 -82 Q70 -80 68 -26 L68 22 Q62 80 14 86 Q-42 82 -54 30 Z', C.skin);
    s += shape('M-61 -34 Q-59 -90 6 -90 Q71 -88 69 -30 Z', C.hair);
    s += shape('M-62 -58 Q10 -82 72 -56 L72 -26 Q10 -50 -64 -30 Z', C.white);
    s += line('M-40 -62 l0 9 M-18 -67 l0 9 M4 -69 l0 9 M26 -68 l0 9 M48 -63 l0 9', 2);
    s += brow(-4, -14, e.brows[0], 0.85) + brow(38, -14, e.brows[1], 0.85);
    s += eye(-4, 8, e.eyes[0], 0.95) + eye(38, 8, e.eyes[1]);
    s += line('M46 18 L58 40 L44 40', 4);
    s += freckles([[-26, 32], [-18, 38], [-30, 42], [58, 34]]);
    s += mouth(24, 57, e.mouth, 0.78);
  } else { // side, rivolto a destra
    s += hairG('M-74 -12 L-142 -42 L-88 -66 L-130 -112 L-62 -98 L-72 -150 L-14 -110 L6 -150 L28 -98 L56 -104 L50 -56 L30 -40 Z');
    s += shape('M-70 -20 Q-70 -84 4 -84 Q64 -82 70 -30 L72 -2 L90 14 L72 26 Q68 72 30 84 Q-6 90 -40 70 Q-70 50 -70 -20 Z', C.skin);
    s += shape('M-68 -34 Q-80 4 -60 38 Q-38 22 -42 -36 Z', C.hair);
    s += shape('M-71 -16 Q-71 -92 4 -92 Q66 -90 70 -40 Z', C.hair);
    s += shape('M-74 -40 Q0 -84 66 -62 L70 -34 Q0 -54 -70 -8 Z', C.white);
    s += `<ellipse cx="-10" cy="12" rx="14" ry="20" fill="${C.skin}" stroke="${C.ink}" stroke-width="${OL}"/>` + line('M-14 4 Q-4 12 -12 22', 3);
    s += brow(46, -14, e.brows[1], 0.8);
    s += eye(46, 6, e.eyes[1]);
    s += freckles([[40, 32], [50, 38], [36, 40]]);
    s += mouth(56, 54, e.mouth === 'grin' ? 'grin' : e.mouth, 0.55);
  }
  return s;
}

// ---------- corpo intero ----------
const VIEWS = {
  front: { sh: [[-58, SHOULDER_Y], [58, SHOULDER_Y]], hip: [[-28, HIP_Y], [28, HIP_Y]], headX: 0 },
  back:  { sh: [[-58, SHOULDER_Y], [58, SHOULDER_Y]], hip: [[-28, HIP_Y], [28, HIP_Y]], headX: 0 },
  q:     { sh: [[40, SHOULDER_Y - 2], [-50, SHOULDER_Y]], hip: [[22, HIP_Y], [-24, HIP_Y]], headX: 6 },
  side:  { sh: [[-2, SHOULDER_Y], [4, SHOULDER_Y]], hip: [[-4, HIP_Y], [4, HIP_Y]], headX: 10 },
};
// A e B: in front/back A = sinistra schermo, B = destra; in q/side A = lato lontano, B = lato vicino.
export const DEFAULT_POSE = {
  view: 'front', x: 0, y: 0, lift: 0, squash: 1, lean: 0, tilt: 0, hair: 0, expr: 'neutro',
  armA: [-8, -4], armB: [8, 4], legA: [-3, 0], legB: [3, 0], handA: 'open', handB: 'open',
  planted: true, flip: false, scale: 1, phoneRot: -12,
};

export function ciuffo(p0) {
  const p = { ...DEFAULT_POSE, ...p0 };
  const V = VIEWS[p.view];
  const lower = Math.max(legReach(...p.legA), legReach(...p.legB));
  const drop = p.planted ? (L_THIGH + L_SHIN) - lower : 0;
  const hipDY = drop;
  const hipC = [0, HIP_Y + hipDY];
  const bandA = p.view === 'side' || p.view === 'front';
  const bandB = p.view === 'q' || p.view === 'back';
  const farA = p.view === 'q' || p.view === 'side';

  const legA = leg([V.hip[0][0], V.hip[0][1] + hipDY], ...p.legA, p.view, { far: farA, footRot: p.footA });
  const legB = leg([V.hip[1][0], V.hip[1][1] + hipDY], ...p.legB, p.view, { footRot: p.footB });
  const armA = arm(V.sh[0], ...p.armA, { far: farA, band: bandA, hand: p.handA, phoneRot: p.phoneRot });
  const armB = arm(V.sh[1], ...p.armB, { band: bandB, hand: p.handB, phoneRot: p.phoneRot });

  const S = SHOULDER_Y;
  const pelvis = {
    front: `M-54 ${HIP_Y - 22} L54 ${HIP_Y - 22} L60 ${HIP_Y + 60} L8 ${HIP_Y + 60} L0 ${HIP_Y + 42} L-8 ${HIP_Y + 60} L-60 ${HIP_Y + 60} Z`,
    back:  `M-54 ${HIP_Y - 22} L54 ${HIP_Y - 22} L60 ${HIP_Y + 60} L8 ${HIP_Y + 60} L0 ${HIP_Y + 42} L-8 ${HIP_Y + 60} L-60 ${HIP_Y + 60} Z`,
    q:     `M-50 ${HIP_Y - 22} L46 ${HIP_Y - 22} L50 ${HIP_Y + 58} L-54 ${HIP_Y + 58} Z`,
    side:  `M-34 ${HIP_Y - 22} L32 ${HIP_Y - 22} L36 ${HIP_Y + 58} L-38 ${HIP_Y + 58} Z`,
  }[p.view];
  const torso = {
    front: `M-56 ${S - 10} L56 ${S - 10} L62 ${S + 60} L56 ${HIP_Y + 18} L-56 ${HIP_Y + 18} L-62 ${S + 60} Z`,
    back:  `M-56 ${S - 10} L56 ${S - 10} L62 ${S + 60} L56 ${HIP_Y + 18} L-56 ${HIP_Y + 18} L-62 ${S + 60} Z`,
    q:     `M-54 ${S - 10} L46 ${S - 10} L52 ${S + 60} L46 ${HIP_Y + 18} L-54 ${HIP_Y + 18} L-60 ${S + 60} Z`,
    side:  `M-34 ${S - 8} Q-8 ${S - 18} 22 ${S - 6} Q40 ${S + 26} 34 ${S + 80} L30 ${HIP_Y + 18} L-38 ${HIP_Y + 18} L-40 ${S + 56} Z`,
  }[p.view];

  const neck = tube([[V.headX * 0.4, S + 6], [V.headX * 0.6, S - 40]], 30, C.skin);
  let collar = '';
  if (p.view === 'front') collar = shape(`M-28 ${S - 10} L-2 ${S + 26} L-32 ${S + 18} Z`, C.white, 4.5) + shape(`M28 ${S - 10} L2 ${S + 26} L32 ${S + 18} Z`, C.white, 4.5) + line(`M0 ${S + 26} L0 ${S + 62}`, 3) + `<circle cx="0" cy="${S + 40}" r="3" fill="${C.ink}"/><circle cx="0" cy="${S + 54}" r="3" fill="${C.ink}"/>`;
  if (p.view === 'q') collar = shape(`M-18 ${S - 10} L6 ${S + 24} L-22 ${S + 18} Z`, C.white, 4.5) + shape(`M30 ${S - 10} L8 ${S + 24} L34 ${S + 16} Z`, C.white, 4.5) + line(`M6 ${S + 24} L6 ${S + 58}`, 3);
  if (p.view === 'side') collar = shape(`M4 ${S - 12} L26 ${S + 2} L14 ${S + 12} Z`, C.white, 4.5);
  if (p.view === 'back') collar = shape(`M-24 ${S - 14} Q0 ${S - 4} 24 ${S - 14} L22 ${S - 2} Q0 ${S + 6} -22 ${S - 2} Z`, C.white, 4.5);

  const strapsFront = quad([-40, S - 6], [-36, S + 96], 16, 16, C.green) + quad([40, S - 6], [36, S + 96], 16, 16, C.green);
  const strapsQ = quad([-34, S - 6], [-30, S + 96], 16, 16, C.green) + quad([30, S - 6], [28, S + 60], 14, 14, C.greenFar);
  const strapSide = quad([-4, S - 10], [16, S + 70], 15, 15, C.green);
  const packBack = shape(`M-54 ${S + 4} Q-54 ${S - 14} -30 ${S - 14} L30 ${S - 14} Q54 ${S - 14} 54 ${S + 4} L52 ${S + 140} Q52 ${S + 152} 40 ${S + 152} L-40 ${S + 152} Q-52 ${S + 152} -52 ${S + 140} Z`, C.green) +
    shape(`M-32 ${S + 80} L32 ${S + 80} L30 ${S + 136} L-30 ${S + 136} Z`, C.greenFar, 4.5) + line(`M-40 ${S + 20} Q0 ${S + 12} 40 ${S + 20}`, 3);
  const packSide = shape(`M-30 ${S - 2} L-84 ${S + 6} Q-96 ${S + 70} -84 ${S + 136} L-32 ${S + 140} Z`, C.green) + line(`M-80 ${S + 60} L-40 ${S + 60}`, 3);
  const packQ = shape(`M-52 ${S} L-86 ${S + 8} Q-96 ${S + 70} -86 ${S + 130} L-52 ${S + 136} Z`, C.greenFar);
  const racket = (x1, y1, x2, y2) => tube([[x1, y1], [x2, y2]], 22, C.ink, 'round') + quad(lerp([x1, y1], [x2, y2], 0.84), [x2, y2], 24, 24, C.pink);

  const headSVG = `<g transform="translate(${V.headX} ${S - 112}) rotate(${f(p.tilt)} 0 90)">${head(p.view, p.expr, p.hair)}</g>`;

  let upper = '', lowerSVG = '', pre = '';
  switch (p.view) {
    case 'front':
      pre = racket(64, S + 10, 94, S - 110);
      lowerSVG = legA + legB + shape(pelvis, C.violet);
      upper = neck + shape(torso, C.white) + collar + strapsFront + armA + armB + headSVG;
      break;
    case 'back':
      lowerSVG = legA + legB + shape(pelvis, C.violet);
      upper = neck + shape(torso, C.white) + collar + racket(20, S + 10, 44, S - 106) + packBack + armA + armB + headSVG;
      break;
    case 'q':
      pre = racket(-62, S + 30, -96, S - 96) + packQ;
      lowerSVG = legA + shape(pelvis, C.violet) + legB;
      upper = armA + neck + shape(torso, C.white) + collar + strapsQ + armB + headSVG;
      // le gambe B (vicina) va sopra il bacino: già in ordine
      break;
    case 'side':
      pre = racket(-58, S + 30, -94, S - 92) + packSide;
      lowerSVG = legA + shape(pelvis, C.violet) + legB;
      upper = armA + neck + shape(torso, C.white) + collar + strapSide + armB + headSVG;
      break;
  }
  // il busto si inclina attorno al bacino, le gambe restano a terra
  const hipPivot = `${hipC[0]} ${hipC[1]}`;
  const upperG = `<g transform="translate(0 ${f(hipDY)}) rotate(${f(p.lean)} ${0} ${HIP_Y})">${pre}${'</g>'}` ;
  const body = `${upperG}${lowerSVG}<g transform="translate(0 ${f(hipDY)}) rotate(${f(p.lean)} 0 ${HIP_Y})">${upper}</g>`;
  const sx = p.squash === 1 ? 1 : 1 + (1 - p.squash) * 0.9;
  const flip = p.flip ? -1 : 1;
  return `<g transform="translate(${f(p.x)} ${f(p.y - p.lift)}) scale(${f(p.scale * sx * flip * 1000) / 1000} ${f(p.scale * p.squash * 1000) / 1000})">${body}</g>`;
}

export function shadow(x, groundY, lift, scale = 1) {
  const k = Math.max(0.35, 1 - lift / 400);
  return `<ellipse cx="${f(x)}" cy="${f(groundY + 4 * scale)}" rx="${f(120 * k * scale)}" ry="${f(13 * k * scale)}" fill="${C.ink}" opacity="${f(0.16 * k * 100) / 100}"/>`;
}

// fondo carta con grana e linea di terra disegnata a mano
export function paperBG(w, h, groundY) {
  let dots = '';
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 900; i++) dots += `<circle cx="${f(rnd() * w)}" cy="${f(rnd() * h)}" r="${f(0.6 + rnd() * 1.2)}" fill="${C.ink}" opacity="${f(0.04 + rnd() * 0.06)}"/>`;
  let g = `M-20 ${groundY}`;
  for (let x = 0; x <= w + 40; x += 80) g += ` Q${x + 40} ${f(groundY + (rnd() - 0.5) * 5)} ${x + 80} ${f(groundY + (rnd() - 0.5) * 3)}`;
  return `<rect width="${w}" height="${h}" fill="${C.paper}"/>${dots}` +
         `<path d="${g}" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>`;
}
