// Motore di rendering 2.5D vettoriale su Canvas2D.
// Tutto ciò che si disegna vive su un piano locale (x, y, z=0) con una matrice modello;
// la camera proietta in prospettiva vera, con clipping sul piano vicino.
// Ogni fotogramma è la media di più sottofotogrammi (motion blur), poi passa in post.

import { I, mmul, apply, T, RX, RY, RZ, S, clamp, lerp, rng, rgba, hex } from './math.js';

export const W = 1920, H = 1080, FPS = 25;

const mk = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
};

// ---------------------------------------------------------------- camera
export class Cam {
  constructor() {
    this.f = 1600; this.cx = W / 2; this.cy = H / 2; this.near = 1;
    this.look([0, 0, -1600], [0, 0, 0], 0);
  }
  // occhio, bersaglio, rollio (radianti), focale opzionale
  look(eye, target, roll = 0, f) {
    if (f) this.f = f;
    this.eye = eye;
    let fw = [target[0] - eye[0], target[1] - eye[1], target[2] - eye[2]];
    const l = Math.hypot(...fw) || 1;
    fw = fw.map((v) => v / l);
    // "su" del mondo = -y (y va verso il basso). Se guardo in verticale uso z come riferimento.
    let up = Math.abs(fw[1]) > 0.999 ? [0, 0, fw[1] > 0 ? 1 : -1] : [0, -1, 0];
    let rt = [fw[1] * up[2] - fw[2] * up[1], fw[2] * up[0] - fw[0] * up[2], fw[0] * up[1] - fw[1] * up[0]];
    const lr = Math.hypot(...rt) || 1;
    rt = rt.map((v) => v / lr);
    let dn = [fw[1] * rt[2] - fw[2] * rt[1], fw[2] * rt[0] - fw[0] * rt[2], fw[0] * rt[1] - fw[1] * rt[0]];
    if (roll) {
      const c = Math.cos(roll), s = Math.sin(roll);
      const r2 = rt.map((v, i) => v * c + dn[i] * s);
      const d2 = dn.map((v, i) => v * c - rt[i] * s);
      rt = r2; dn = d2;
    }
    this.fw = fw; this.rt = rt; this.dn = dn;
    return this;
  }
  view() {
    const { rt, dn, fw, eye } = this;
    return [
      rt[0], rt[1], rt[2], -(rt[0] * eye[0] + rt[1] * eye[1] + rt[2] * eye[2]),
      dn[0], dn[1], dn[2], -(dn[0] * eye[0] + dn[1] * eye[1] + dn[2] * eye[2]),
      fw[0], fw[1], fw[2], -(fw[0] * eye[0] + fw[1] * eye[1] + fw[2] * eye[2]),
    ];
  }
}

// camera "piatta": il piano z=0 coincide con lo schermo, origine in alto a sinistra
export function flatCam(f = 1600) {
  const c = new Cam();
  c.f = f;
  c.look([W / 2, H / 2, -f], [W / 2, H / 2, 0]);
  return c;
}

// ---------------------------------------------------------------- clipping
function clipPoly(c, near) {
  const n = c.length / 3;
  let inside = true;
  for (let i = 0; i < n; i++) if (c[3 * i + 2] < near) { inside = false; break; }
  if (inside) return c;
  const out = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const az = c[3 * i + 2], bz = c[3 * j + 2];
    const ain = az >= near, bin = bz >= near;
    if (ain) out.push(c[3 * i], c[3 * i + 1], az);
    if (ain !== bin) {
      const t = (near - az) / (bz - az);
      out.push(c[3 * i] + (c[3 * j] - c[3 * i]) * t, c[3 * i + 1] + (c[3 * j + 1] - c[3 * i + 1]) * t, near);
    }
  }
  return out.length >= 9 ? out : null;
}
function clipLine(c, near) {
  const n = c.length / 3, runs = [];
  let cur = [];
  for (let i = 0; i < n; i++) {
    const z = c[3 * i + 2], ins = z >= near;
    if (i > 0) {
      const pz = c[3 * i - 1], pin = pz >= near;
      if (pin !== ins) {
        const t = (near - pz) / (z - pz);
        const x = c[3 * i - 3] + (c[3 * i] - c[3 * i - 3]) * t, y = c[3 * i - 2] + (c[3 * i + 1] - c[3 * i - 2]) * t;
        cur.push(x, y, near);
        if (!ins) { runs.push(cur); cur = []; }
      }
    }
    if (ins) cur.push(c[3 * i], c[3 * i + 1], z);
  }
  if (cur.length >= 6) runs.push(cur);
  return runs.filter((r) => r.length >= 6);
}

// ---------------------------------------------------------------- renderer
export class Renderer {
  constructor(outCanvas, fonts, images) {
    this.out = outCanvas;
    this.o = outCanvas.getContext('2d');
    this.fonts = fonts;
    this.img = images;
    this.base = mk(W, H); this.b = this.base.getContext('2d');
    this.glowC = mk(W / 2, H / 2); this.g = this.glowC.getContext('2d');
    this.accB = mk(W, H); this.ab = this.accB.getContext('2d');
    this.accG = mk(W / 2, H / 2); this.ag = this.accG.getContext('2d');
    this.bl1 = mk(W / 4, H / 4); this.b1 = this.bl1.getContext('2d');
    this.bl2 = mk(W / 8, H / 8); this.b2 = this.bl2.getContext('2d');
    this.bl3 = mk(W / 16, H / 16); this.b3 = this.bl3.getContext('2d');
    this.tmpC = mk(W, H); this.tc = this.tmpC.getContext('2d');
    this.chC = mk(W, H); this.cc = this.chC.getContext('2d');
    this.layC = mk(W, H); this.lc = this.layC.getContext('2d');
    this.layG = mk(W / 2, H / 2); this.lg = this.layG.getContext('2d');
    this.grain = [0, 1, 2].map((k) => {
      const c = mk(256, 256), x = c.getContext('2d'), d = x.createImageData(256, 256), r = rng(99 + k);
      for (let i = 0; i < 256 * 256; i++) {
        const v = 128 + (r() + r() + r() - 1.5) * 120;
        d.data[4 * i] = d.data[4 * i + 1] = d.data[4 * i + 2] = v; d.data[4 * i + 3] = 255;
      }
      x.putImageData(d, 0, 0);
      return c;
    });
    this.cam = flatCam();
    this.stack = [I()];
    this._upd();
    this.gs = 0.5; // scala del buffer glow
  }

  // ---------------- trasformazioni
  setCam(c) { this.cam = c; this._upd(); }
  top() { return this.stack[this.stack.length - 1]; }
  push(M) { this.stack.push(mmul(this.top(), M)); this._upd(); }
  pushAbs(M) { this.stack.push(M); this._upd(); }
  pop() { this.stack.pop(); this._upd(); }
  with(M, fn) { this.push(M); try { fn(); } finally { this.pop(); } }
  _upd() { this.VM = mmul(this.cam.view(), this.top()); }
  // disegno in pixel schermo (origine in alto a sinistra), senza prospettiva
  hud(fn) {
    const c = this.cam, st = this.stack;
    this.cam = flatCam(); this.stack = [I()]; this._upd();
    try { fn(); } finally { this.cam = c; this.stack = st; this._upd(); }
  }

  // punto locale → camera
  camPt(x, y, z = 0) { return apply(this.VM, x, y, z); }
  // punto mondo → camera
  camW(p) { return apply(this.cam.view(), p[0], p[1], p[2]); }
  projC(pc) { const f = this.cam.f; return [this.cam.cx + (f * pc[0]) / pc[2], this.cam.cy + (f * pc[1]) / pc[2]]; }
  // proiezione di un punto locale (null se dietro la camera)
  proj(x, y, z = 0) {
    const pc = this.camPt(x, y, z);
    if (pc[2] < this.cam.near) return null;
    return this.projC(pc);
  }
  // fattore di scala locale→schermo a una certa profondità
  scaleAt(x = 0, y = 0) {
    const M = this.VM, pc = this.camPt(x, y);
    const s = Math.hypot(M[0], M[4], M[8]);
    return pc[2] > this.cam.near ? (this.cam.f * s) / pc[2] : 0;
  }

  _toCam(pts, M = this.VM) {
    const n = pts.length / 2, o = new Array(n * 3);
    for (let i = 0; i < n; i++) {
      const x = pts[2 * i], y = pts[2 * i + 1];
      o[3 * i] = M[0] * x + M[1] * y + M[3];
      o[3 * i + 1] = M[4] * x + M[5] * y + M[7];
      o[3 * i + 2] = M[8] * x + M[9] * y + M[11];
    }
    return o;
  }
  _proj(c) {
    const f = this.cam.f, cx = this.cam.cx, cy = this.cam.cy, n = c.length / 3, o = new Array(n * 2);
    for (let i = 0; i < n; i++) {
      const z = c[3 * i + 2];
      o[2 * i] = cx + (f * c[3 * i]) / z;
      o[2 * i + 1] = cy + (f * c[3 * i + 1]) / z;
    }
    return o;
  }
  // contorni locali (array di array piatti) → poligoni schermo; zs = profondità media
  _projContours(contours, closed, M = this.VM) {
    const out = [];
    let zs = 0, zn = 0;
    for (const pts of contours) {
      const c = this._toCam(pts, M);
      const parts = closed ? [clipPoly(c, this.cam.near)] : clipLine(c, this.cam.near);
      for (const p of parts) {
        if (!p) continue;
        for (let i = 2; i < p.length; i += 3) { zs += p[i]; zn++; }
        out.push(this._proj(p));
      }
    }
    return { polys: out, z: zn ? zs / zn : 1e9 };
  }

  // ---------------- stile
  _style(ctx, spec, s) {
    if (typeof spec === 'string') return spec;
    if (Array.isArray(spec)) return rgba(spec, 1);
    if (spec.lin) {
      const [x0, y0, x1, y1] = spec.lin;
      const a = this.proj(x0, y0), b = this.proj(x1, y1);
      if (!a || !b) return spec.stops[0][1];
      const g = ctx.createLinearGradient(a[0] * s, a[1] * s, b[0] * s, b[1] * s);
      for (const [o, c] of spec.stops) g.addColorStop(clamp(o), c);
      return g;
    }
    if (spec.rad) {
      const [x, y, r] = spec.rad;
      const a = this.proj(x, y), b = this.proj(x + r, y);
      if (!a || !b) return spec.stops[spec.stops.length - 1][1];
      const rr = Math.max(0.5, Math.hypot(b[0] - a[0], b[1] - a[1]));
      const g = ctx.createRadialGradient(a[0] * s, a[1] * s, 0, a[0] * s, a[1] * s, rr * s);
      for (const [o, c] of spec.stops) g.addColorStop(clamp(o), c);
      return g;
    }
    if (spec.screenLin) {
      const [x0, y0, x1, y1] = spec.screenLin;
      const g = ctx.createLinearGradient(x0 * s, y0 * s, x1 * s, y1 * s);
      for (const [o, c] of spec.stops) g.addColorStop(clamp(o), c);
      return g;
    }
    return '#f0f';
  }

  // disegna poligoni schermo con uno stile
  _paint(polys, closed, st, z) {
    const a = st.alpha ?? 1;
    if (a <= 0.003 || !polys.length) return;
    const lwScr = st.lw ? (st.lwAbs ? st.lw : st.lw * this._lwK(z)) : 0;
    const draw = (ctx, s, glow) => {
      ctx.save();
      ctx.globalAlpha = glow ? a * st.glow : a;
      if (glow) ctx.globalCompositeOperation = 'lighter';
      else if (st.blend) ctx.globalCompositeOperation = st.blend;
      if (st.blur && !glow) ctx.filter = `blur(${st.blur}px)`;
      if (st.shadow && !glow) { ctx.shadowColor = st.shadow[0]; ctx.shadowBlur = st.shadow[1]; ctx.shadowOffsetX = st.shadow[2] || 0; ctx.shadowOffsetY = st.shadow[3] || 0; }
      ctx.beginPath();
      for (const p of polys) {
        ctx.moveTo(p[0] * s, p[1] * s);
        for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i] * s, p[i + 1] * s);
        if (closed) ctx.closePath();
      }
      const gcol = glow && st.glowColor;
      if (st.fill && closed) { ctx.fillStyle = gcol || this._style(ctx, st.fill, s); ctx.fill(st.rule || 'nonzero'); }
      if (st.stroke && lwScr > 0) {
        ctx.lineWidth = lwScr * s * (glow ? st.glowWidth || 1 : 1);
        ctx.lineJoin = st.join || 'round'; ctx.lineCap = st.cap || 'round';
        if (st.dash) ctx.setLineDash(st.dash.map((d) => d * s * (st.lwAbs ? 1 : this._lwK(z))));
        ctx.strokeStyle = gcol || this._style(ctx, st.stroke, s);
        ctx.stroke();
      }
      ctx.restore();
    };
    if (!st.glowOnly) draw(this.b, 1, false);
    if (st.glow) draw(this.g, this.gs, true);
    if (st.knock) {
      const g = this.g, s = this.gs;
      g.save();
      g.globalAlpha = a; g.globalCompositeOperation = 'source-over';
      g.beginPath();
      for (const p of polys) { g.moveTo(p[0] * s, p[1] * s); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i] * s, p[i + 1] * s); if (closed) g.closePath(); }
      g.fillStyle = '#000'; g.strokeStyle = '#000';
      if (st.fill && closed) g.fill(st.rule || 'nonzero');
      if (st.stroke && lwScr > 0) { g.lineWidth = lwScr * s * 1.6; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
      g.restore();
    }
  }
  _lwK(z) {
    const M = this.VM;
    return (this.cam.f * Math.hypot(M[0], M[4], M[8])) / Math.max(z, this.cam.near);
  }

  // ---------------- primitive su piano locale
  shape(contours, st) { const { polys, z } = this._projContours(contours, true); this._paint(polys, true, st, z); }
  poly(pts, st) { this.shape([pts.flat ? pts.flat() : pts], st); }
  line(pts, st) {
    const flat = pts.flat ? pts.flat() : pts;
    const { polys, z } = this._projContours([flat], false);
    this._paint(polys, false, { ...st, stroke: st.stroke || st.color || '#fff' }, z);
  }
  rect(x, y, w, h, st) { this.shape([[x, y, x + w, y, x + w, y + h, x, y + h]], st); }
  rrPts(x, y, w, h, r, n = 8) {
    r = Math.min(r, w / 2, h / 2);
    const p = [];
    const corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); p.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } };
    corner(x + w - r, y + r, -Math.PI / 2);
    corner(x + w - r, y + h - r, 0);
    corner(x + r, y + h - r, Math.PI / 2);
    corner(x + r, y + r, Math.PI);
    return p;
  }
  rrect(x, y, w, h, r, st) { this.shape([this.rrPts(x, y, w, h, r)], st); }
  circPts(x, y, r, n = 64, a0 = 0, a1 = Math.PI * 2) {
    const p = [];
    for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; p.push(x + Math.cos(a) * r, y + Math.sin(a) * r); }
    return p;
  }
  circle(x, y, r, st, n = 64) { this.shape([this.circPts(x, y, r, n)], st); }
  ring(x, y, r0, r1, st, n = 72) {
    const a = this.circPts(x, y, r1, n), b = this.circPts(x, y, r0, n, Math.PI * 2, 0);
    this.shape([a, b], { ...st, rule: 'evenodd' });
  }
  arc(x, y, r, a0, a1, st, n = 48) { this.line(this.circPts(x, y, r, n, a0, a1), st); }
  // linea spessa come poligono (prospettiva corretta dello spessore)
  band(x0, y0, x1, y1, w, st) {
    const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = (-dy / l) * (w / 2), ny = (dx / l) * (w / 2);
    this.shape([[x0 + nx, y0 + ny, x1 + nx, y1 + ny, x1 - nx, y1 - ny, x0 - nx, y0 - ny]], st);
  }

  // ---------------- clip
  clipPoly(pts) {
    const { polys } = this._projContours([pts], true);
    for (const [ctx, s] of [[this.b, 1], [this.g, this.gs]]) {
      ctx.save();
      ctx.beginPath();
      for (const p of polys) { ctx.moveTo(p[0] * s, p[1] * s); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i] * s, p[i + 1] * s); ctx.closePath(); }
      if (!polys.length) ctx.rect(0, 0, 0, 0);
      ctx.clip();
    }
  }
  clipRect(x, y, w, h) { this.clipPoly([x, y, x + w, y, x + w, y + h, x, y + h]); }
  unclip() { this.b.restore(); this.g.restore(); }

  // ---------------- livello separato (per sfocatura di profondità, opacità di gruppo)
  layer(opt, fn) {
    const sb = this.b, sg = this.g;
    this.lc.setTransform(1, 0, 0, 1, 0, 0); this.lc.clearRect(0, 0, W, H);
    this.lg.setTransform(1, 0, 0, 1, 0, 0); this.lg.globalCompositeOperation = 'source-over'; this.lg.fillStyle = '#000'; this.lg.fillRect(0, 0, W / 2, H / 2);
    this.b = this.lc; this.g = this.lg;
    try { fn(); } finally { this.b = sb; this.g = sg; }
    const a = opt.alpha ?? 1;
    if (a <= 0.003) return;
    sb.save();
    sb.globalAlpha = a;
    if (opt.blend) sb.globalCompositeOperation = opt.blend;
    if (opt.blur > 0.3) sb.filter = `blur(${opt.blur}px)`;
    sb.drawImage(this.layC, 0, 0);
    sb.restore();
    sg.save();
    sg.globalAlpha = a * (opt.glow ?? 1);
    sg.globalCompositeOperation = 'lighter';
    if (opt.blur > 0.3) sg.filter = `blur(${opt.blur * this.gs}px)`;
    sg.drawImage(this.layG, 0, 0);
    sg.restore();
  }

  // ---------------- immagini su piano (texture mapping a triangoli)
  image(img, x, y, w, h, st = {}) {
    const a = st.alpha ?? 1;
    if (a <= 0.003 || !img) return;
    const n = st.sub ?? 8, iw = img.width, ih = img.height;
    const sx0 = st.src ? st.src[0] : 0, sy0 = st.src ? st.src[1] : 0, sw = st.src ? st.src[2] : iw, sh = st.src ? st.src[3] : ih;
    const G = [];
    let behind = false;
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
      const pc = this.camPt(x + (w * i) / n, y + (h * j) / n);
      if (pc[2] < this.cam.near) behind = true;
      G.push(pc);
    }
    if (behind) return;
    const P = G.map((pc) => this.projC(pc));
    const ctx = this.b;
    ctx.save();
    ctx.globalAlpha = a;
    if (st.blend) ctx.globalCompositeOperation = st.blend;
    if (st.filter) ctx.filter = st.filter;
    const tri = (s0, s1, s2, d0, d1, d2) => {
      // espando leggermente il triangolo per nascondere le cuciture
      const cx = (d0[0] + d1[0] + d2[0]) / 3, cy = (d0[1] + d1[1] + d2[1]) / 3;
      const ex = (p) => { const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1; return [p[0] + (dx / l) * 0.7, p[1] + (dy / l) * 0.7]; };
      const e0 = ex(d0), e1 = ex(d1), e2 = ex(d2);
      ctx.save();
      ctx.beginPath(); ctx.moveTo(e0[0], e0[1]); ctx.lineTo(e1[0], e1[1]); ctx.lineTo(e2[0], e2[1]); ctx.closePath(); ctx.clip();
      const den = (s1[0] - s0[0]) * (s2[1] - s0[1]) - (s2[0] - s0[0]) * (s1[1] - s0[1]);
      if (Math.abs(den) < 1e-9) { ctx.restore(); return; }
      const A = ((d1[0] - d0[0]) * (s2[1] - s0[1]) - (d2[0] - d0[0]) * (s1[1] - s0[1])) / den;
      const C = ((d2[0] - d0[0]) * (s1[0] - s0[0]) - (d1[0] - d0[0]) * (s2[0] - s0[0])) / den;
      const B = ((d1[1] - d0[1]) * (s2[1] - s0[1]) - (d2[1] - d0[1]) * (s1[1] - s0[1])) / den;
      const D = ((d2[1] - d0[1]) * (s1[0] - s0[0]) - (d1[1] - d0[1]) * (s2[0] - s0[0])) / den;
      const Ex = d0[0] - A * s0[0] - C * s0[1], F = d0[1] - B * s0[0] - D * s0[1];
      ctx.setTransform(A, B, C, D, Ex, F);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    };
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const k = j * (n + 1) + i;
      const s00 = [sx0 + (sw * i) / n, sy0 + (sh * j) / n], s10 = [sx0 + (sw * (i + 1)) / n, sy0 + (sh * j) / n];
      const s01 = [sx0 + (sw * i) / n, sy0 + (sh * (j + 1)) / n], s11 = [sx0 + (sw * (i + 1)) / n, sy0 + (sh * (j + 1)) / n];
      tri(s00, s10, s11, P[k], P[k + 1], P[k + n + 2]);
      tri(s00, s11, s01, P[k], P[k + n + 2], P[k + n + 1]);
    }
    ctx.restore();
    if (st.glow) {
      const c = [P[0], P[n], P[(n + 1) * (n + 1) - 1], P[n * (n + 1)]];
      this.g.save();
      this.g.globalAlpha = a * st.glow; this.g.globalCompositeOperation = 'lighter';
      this.g.fillStyle = st.glowColor || '#fff';
      this.g.beginPath(); c.forEach((p, i) => (i ? this.g.lineTo(p[0] * this.gs, p[1] * this.gs) : this.g.moveTo(p[0] * this.gs, p[1] * this.gs))); this.g.closePath(); this.g.fill();
      this.g.restore();
    }
  }

  // ---------------- testo da contorni dei glifi
  measure(str, font, size, tracking = 0) { return this.fonts.layout(str, font, size, tracking).width; }
  // opt: font, size, align ('left'|'center'|'right'), v ('base'|'cap'|'top'), tracking (em), per(i,n,ch,info) → {x,y,z,rx,ry,rz,s,sx,sy,a,skew}
  // stile: fill, stroke, lw, glow, glowColor, alpha, depth (estrusione), side (colore fianchi)
  text(str, x, y, opt) {
    const L = this.fonts.layout(str, opt.font || 'unb900', opt.size || 100, opt.tracking || 0);
    const al = opt.align || 'left';
    let ox = al === 'center' ? -L.width / 2 : al === 'right' ? -L.width : 0;
    let oy = 0;
    if (opt.v === 'cap') oy = L.capH / 2;
    else if (opt.v === 'top') oy = L.capH;
    const n = L.glyphs.length, per = opt.per, k = L.k, skew = opt.skew || 0;
    const aBase = opt.alpha ?? 1;
    const items = [];
    for (let i = 0; i < n; i++) {
      const G = L.glyphs[i];
      if (!G.contours.length) continue;
      const p = per ? per(i, n, G.ch, G) || {} : {};
      const ga = aBase * (p.a ?? 1);
      if (ga <= 0.003) continue;
      // perno: centro del glifo, oppure la baseline (p.base) per le lettere che si alzano dal pavimento
      const pcx = (G.bbox[0] + G.bbox[2]) / 2 * k, pcy = p.base || opt.base ? 0 : -L.capH / 2;
      const s = p.s ?? 1, sx = s * (p.sx ?? 1), sy = s * (p.sy ?? 1), sk = skew + (p.skew || 0);
      // matrice del glifo: T(pos) · Rz·Ry·Rx · S · T(-pivot) · skew · S(k)
      let M = T(x + ox + G.x + pcx + (p.x || 0), y + oy + pcy + (p.y || 0), p.z || 0);
      if (p.rz) M = mmul(M, RZ(p.rz));
      if (p.ry) M = mmul(M, RY(p.ry));
      if (p.rx) M = mmul(M, RX(p.rx));
      M = mmul(M, S(sx, sy, 1));
      M = mmul(M, T(-pcx, -pcy, 0));
      M = mmul(M, [k, -sk * k, 0, 0, 0, k, 0, 0, 0, 0, 1, 0]);
      items.push({ G, M, p, ga });
    }
    const st0 = { fill: opt.fill, stroke: opt.stroke, lw: opt.lw, glow: opt.glow, glowColor: opt.glowColor, blend: opt.blend, glowOnly: opt.glowOnly, glowWidth: opt.glowWidth, blur: opt.blur, rule: 'nonzero', shadow: opt.shadow, knock: opt.knock };
    // estrusione: copie arretrate lungo la z locale del glifo
    if (opt.depth) {
      const steps = opt.depthSteps || 10;
      for (let d = steps; d >= 1; d--) {
        for (const it of items) {
          const Md = mmul(mmul(this.VM, it.M), T(0, 0, (opt.depth * d) / steps / k));
          const { polys, z } = this._projContours(it.G.contours, true, Md);
          const col = typeof opt.side === 'function' ? opt.side(d / steps, it) : opt.side || '#000';
          this._paint(polys, true, { fill: col, alpha: it.ga * (it.p.da ?? 1) }, z);
        }
      }
    }
    for (const it of items) {
      const Mg = mmul(this.VM, it.M);
      const { polys, z } = this._projContours(it.G.contours, true, Mg);
      const st = { ...st0, alpha: it.ga };
      if (it.p.fill) st.fill = it.p.fill;
      if (it.p.stroke) st.stroke = it.p.stroke;
      if (it.p.glow !== undefined) st.glow = it.p.glow;
      if (st.stroke && st.lw) {
        // lo spessore del contorno è in unità del testo: converto in pixel alla profondità del glifo
        st.lwAbs = true;
        st.lw = (opt.lw * this.cam.f * Math.hypot(Mg[0], Mg[4], Mg[8])) / k / Math.max(z, this.cam.near);
      }
      this._paint(polys, true, st, z);
    }
    return L;
  }

  // ---------------- primitive nello spazio mondo
  worldLine(pts, st) {
    const V = this.cam.view(), c = [];
    for (const p of pts) c.push(...apply(V, p[0], p[1], p[2]));
    const runs = clipLine(c, this.cam.near);
    let zs = 0, zn = 0;
    const polys = runs.map((r) => { for (let i = 2; i < r.length; i += 3) { zs += r[i]; zn++; } return this._proj(r); });
    const z = zn ? zs / zn : 1;
    this._paint(polys, false, { ...st, stroke: st.stroke || '#fff', lwAbs: true, lw: st.lwPx ?? (st.lw * this.cam.f) / z }, z);
  }
  worldPoly(pts, st) {
    const V = this.cam.view(), c = [];
    for (const p of pts) c.push(...apply(V, p[0], p[1], p[2]));
    const q = clipPoly(c, this.cam.near);
    if (!q) return;
    let zs = 0;
    for (let i = 2; i < q.length; i += 3) zs += q[i];
    this._paint([this._proj(q)], true, st, zs / (q.length / 3));
  }
  // scia a nastro: pts mondo, larghezza e alpha interpolate dalla coda (0) alla testa (1)
  trail(pts, st) {
    const V = this.cam.view(), f = this.cam.f;
    const P = pts.map((p) => apply(V, p[0], p[1], p[2]));
    const n = P.length;
    if (n < 2) return;
    const w0 = st.w0 ?? 0, w1 = st.w1 ?? 10, a0 = st.a0 ?? 0, a1 = st.a1 ?? 1;
    const scr = P.map((pc) => (pc[2] > this.cam.near ? [this.cam.cx + (f * pc[0]) / pc[2], this.cam.cy + (f * pc[1]) / pc[2], pc[2]] : null));
    for (let i = 0; i < n - 1; i++) {
      const A = scr[i], B = scr[i + 1];
      if (!A || !B) continue;
      const u0 = i / (n - 1), u1 = (i + 1) / (n - 1);
      const mw = st.maxW ?? 1e9;
      const wa = Math.min(mw, (lerp(w0, w1, u0) * f) / A[2]), wb = Math.min(mw, (lerp(w0, w1, u1) * f) / B[2]);
      const dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy) || 1e-6;
      const nx = -dy / l, ny = dx / l;
      const quad = [A[0] + (nx * wa) / 2, A[1] + (ny * wa) / 2, B[0] + (nx * wb) / 2, B[1] + (ny * wb) / 2, B[0] - (nx * wb) / 2, B[1] - (ny * wb) / 2, A[0] - (nx * wa) / 2, A[1] - (ny * wa) / 2];
      const col = typeof st.color === 'function' ? st.color((u0 + u1) / 2) : st.color || '#fff';
      this._paint([quad], true, { fill: col, alpha: lerp(a0, a1, (u0 + u1) / 2) * (st.alpha ?? 1), glow: st.glow, blend: st.blend || 'lighter', glowColor: st.glowColor }, 1);
      // tappo tondo per evitare fessure tra i segmenti
      if (wb > 1.5) this._paint([this._circScr(B[0], B[1], wb / 2)], true, { fill: col, alpha: lerp(a0, a1, u1) * (st.alpha ?? 1) * 0.5, blend: st.blend || 'lighter' }, 1);
    }
  }
  _circScr(x, y, r, n = 18) { const p = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; p.push(x + Math.cos(a) * r, y + Math.sin(a) * r); } return p; }
  // punto luminoso nello spazio mondo, raggio in unità mondo
  dot(p, r, st) {
    const pc = this.camW(p);
    if (pc[2] < this.cam.near) return null;
    const s = this.projC(pc);
    let rr = (r * this.cam.f) / pc[2];
    if (rr < 0.05) return s;
    if (st.maxR && rr > st.maxR) return s;
    this._paint([this._circScr(s[0], s[1], Math.max(rr, 0.4), rr > 12 ? 40 : 18)], true, st, pc[2]);
    return s;
  }
  // bagliore morbido (sprite radiale) nello spazio mondo
  flare(p, r, color, a = 1, toGlow = true) {
    const pc = this.camW(p);
    if (pc[2] < this.cam.near) return;
    const s = this.projC(pc), rr = (r * this.cam.f) / pc[2];
    if (rr < 0.5) return;
    const paint = (ctx, sc) => {
      const g = ctx.createRadialGradient(s[0] * sc, s[1] * sc, 0, s[0] * sc, s[1] * sc, rr * sc);
      g.addColorStop(0, rgba(color, a)); g.addColorStop(0.25, rgba(color, a * 0.35)); g.addColorStop(1, rgba(color, 0));
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g;
      ctx.fillRect((s[0] - rr) * sc, (s[1] - rr) * sc, 2 * rr * sc, 2 * rr * sc); ctx.restore();
    };
    paint(this.b, 1);
    if (toGlow) paint(this.g, this.gs);
  }

  // ---------------- sfondo
  bg(top, bottom, blobs = []) {
    const b = this.b;
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.globalCompositeOperation = 'source-over'; b.globalAlpha = 1; b.filter = 'none';
    const g = b.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top); g.addColorStop(1, bottom);
    b.fillStyle = g; b.fillRect(0, 0, W, H);
    for (const bl of blobs) {
      const r = b.createRadialGradient(bl[0], bl[1], 0, bl[0], bl[1], bl[2]);
      r.addColorStop(0, rgba(bl[3], bl[4])); r.addColorStop(1, rgba(bl[3], 0));
      b.globalCompositeOperation = bl[5] || 'lighter';
      b.fillStyle = r; b.fillRect(bl[0] - bl[2], bl[1] - bl[2], bl[2] * 2, bl[2] * 2);
    }
    b.globalCompositeOperation = 'source-over';
  }
  // velo a tutto schermo (dissolvenze, lampi)
  wash(color, a, blend = 'source-over', toGlow = false) {
    if (a <= 0.003) return;
    for (const [ctx, s, on] of [[this.b, 1, true], [this.g, this.gs, toGlow]]) {
      if (!on) continue;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(a); ctx.globalCompositeOperation = blend;
      ctx.fillStyle = color; ctx.fillRect(0, 0, W * s, H * s); ctx.restore();
    }
  }

  // ---------------- ciclo del fotogramma
  beginSub() {
    for (const [ctx, w, h] of [[this.b, W, H], [this.g, W / 2, H / 2]]) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    }
    this.stack = [I()];
    this.cam = flatCam();
    this._upd();
  }
  accumulate(i) {
    const a = 1 / (i + 1);
    for (const [ctx, src] of [[this.ab, this.base], [this.ag, this.glowC]]) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = a; ctx.filter = 'none';
      ctx.drawImage(src, 0, 0);
    }
  }
  // fx: bloom, ca, glitch, seed, grain, vignette, flash [colore, a], fade
  compose(fx = {}) {
    const o = this.o;
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.globalCompositeOperation = 'copy'; o.globalAlpha = 1; o.filter = 'none';
    o.drawImage(this.accB, 0, 0);
    // bloom multi-scala dal buffer emissivo
    const bloom = fx.bloom ?? 1;
    if (bloom > 0) {
      this.b1.globalCompositeOperation = 'copy'; this.b1.filter = 'blur(2px)'; this.b1.drawImage(this.accG, 0, 0, W / 4, H / 4); this.b1.filter = 'none';
      this.b2.globalCompositeOperation = 'copy'; this.b2.filter = 'blur(3px)'; this.b2.drawImage(this.bl1, 0, 0, W / 8, H / 8); this.b2.filter = 'none';
      this.b3.globalCompositeOperation = 'copy'; this.b3.filter = 'blur(4px)'; this.b3.drawImage(this.bl2, 0, 0, W / 16, H / 16); this.b3.filter = 'none';
      o.globalCompositeOperation = 'lighter';
      o.globalAlpha = 0.5 * bloom; o.drawImage(this.accG, 0, 0, W, H);
      o.globalAlpha = 0.7 * bloom; o.drawImage(this.bl1, 0, 0, W, H);
      o.globalAlpha = 0.8 * bloom; o.drawImage(this.bl2, 0, 0, W, H);
      o.globalAlpha = 0.9 * bloom; o.drawImage(this.bl3, 0, 0, W, H);
    }
    o.globalAlpha = 1;
    if (fx.flash && fx.flash[1] > 0.003) { o.globalCompositeOperation = 'lighter'; o.globalAlpha = clamp(fx.flash[1]); o.fillStyle = fx.flash[0]; o.fillRect(0, 0, W, H); o.globalAlpha = 1; }
    // aberrazione cromatica radiale
    const ca = fx.ca ?? 0;
    if (ca > 0.0004) {
      this.tc.globalCompositeOperation = 'copy'; this.tc.drawImage(this.out, 0, 0);
      const chans = [['#f00', ca], ['#0f0', 0], ['#00f', -ca]];
      chans.forEach(([col, k], i) => {
        const cc = this.cc;
        cc.globalCompositeOperation = 'copy';
        cc.drawImage(this.tmpC, (-W * k) / 2, (-H * k) / 2, W * (1 + k), H * (1 + k));
        cc.globalCompositeOperation = 'multiply'; cc.fillStyle = col; cc.fillRect(0, 0, W, H);
        o.globalCompositeOperation = i === 0 ? 'copy' : 'lighter';
        o.drawImage(this.chC, 0, 0);
      });
    }
    // glitch: fasce spostate e blocchi pixelati
    const gl = fx.glitch ?? 0;
    if (gl > 0.01) {
      const r = rng(fx.seed || 1);
      this.tc.globalCompositeOperation = 'copy'; this.tc.drawImage(this.out, 0, 0);
      o.globalCompositeOperation = 'source-over';
      const nS = Math.round(4 + 14 * gl);
      for (let i = 0; i < nS; i++) {
        const y = r() * H, h = 3 + r() * 70 * gl, dx = (r() - 0.5) * 260 * gl;
        o.drawImage(this.tmpC, 0, y, W, h, dx, y, W, h);
        if (r() < 0.5) {
          o.globalCompositeOperation = 'lighter';
          o.globalAlpha = 0.35 * gl;
          o.fillStyle = r() < 0.5 ? '#ff1fc0' : '#19f6ff';
          o.fillRect(0, y, W, h);
          o.globalAlpha = 1; o.globalCompositeOperation = 'source-over';
        }
      }
      o.imageSmoothingEnabled = false;
      const nB = Math.round(1 + 3 * gl);
      for (let i = 0; i < nB; i++) {
        const bw = 60 + r() * 360 * gl, bh = 20 + r() * 120 * gl, bx = r() * (W - bw), by = r() * (H - bh);
        this.cc.globalCompositeOperation = 'copy';
        this.cc.drawImage(this.tmpC, bx, by, bw, bh, 0, 0, bw / 12, bh / 12);
        o.drawImage(this.chC, 0, 0, bw / 12, bh / 12, bx + (r() - 0.5) * 60 * gl, by, bw, bh);
      }
      o.imageSmoothingEnabled = true;
    }
    // vignetta
    const vg = fx.vignette ?? 0.45;
    if (vg > 0) {
      const g = o.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.72);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${vg})`);
      o.globalCompositeOperation = 'source-over'; o.fillStyle = g; o.fillRect(0, 0, W, H);
    }
    // grana
    const gr = fx.grain ?? 0.07;
    if (gr > 0) {
      const r = rng((fx.seed || 1) * 7 + 3);
      const pat = o.createPattern(this.grain[Math.floor(r() * 3)], 'repeat');
      const dx = Math.floor(r() * 256), dy = Math.floor(r() * 256);
      o.save(); o.globalCompositeOperation = 'overlay'; o.globalAlpha = gr; o.translate(dx, dy); o.fillStyle = pat; o.fillRect(-dx, -dy, W, H); o.restore();
    }
    if (fx.fade > 0.003) { o.globalCompositeOperation = 'source-over'; o.globalAlpha = clamp(fx.fade); o.fillStyle = '#000'; o.fillRect(0, 0, W, H); o.globalAlpha = 1; }
    o.globalCompositeOperation = 'source-over';
  }
}
