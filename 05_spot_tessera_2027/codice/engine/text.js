// Font: caricamento con opentype.js, contorni dei glifi appiattiti in poligoni (unità font, y verso il basso),
// impaginazione con crenatura e spaziatura.

import * as opentype from '../lib/opentype.mjs';

export class Fonts {
  constructor() { this.f = {}; this.cache = new Map(); this.lay = new Map(); }

  async load(name, url) {
    const buf = await (await fetch(url)).arrayBuffer();
    this.f[name] = opentype.parse(buf);
  }

  glyph(name, g) {
    const key = name + ':' + g.index;
    let c = this.cache.get(key);
    if (c) return c;
    const font = this.f[name];
    const cmds = g.getPath(0, 0, font.unitsPerEm).commands;
    const contours = [];
    let cur = null, x = 0, y = 0;
    const segs = (l) => Math.max(3, Math.min(40, Math.ceil(l / 12)));
    for (const k of cmds) {
      if (k.type === 'M') {
        if (cur && cur.length > 4) contours.push(cur);
        cur = [k.x, k.y]; x = k.x; y = k.y;
      } else if (k.type === 'L') {
        cur.push(k.x, k.y); x = k.x; y = k.y;
      } else if (k.type === 'Q') {
        const n = segs(Math.hypot(k.x1 - x, k.y1 - y) + Math.hypot(k.x - k.x1, k.y - k.y1));
        for (let i = 1; i <= n; i++) {
          const t = i / n, u = 1 - t;
          cur.push(u * u * x + 2 * u * t * k.x1 + t * t * k.x, u * u * y + 2 * u * t * k.y1 + t * t * k.y);
        }
        x = k.x; y = k.y;
      } else if (k.type === 'C') {
        const n = segs(Math.hypot(k.x1 - x, k.y1 - y) + Math.hypot(k.x2 - k.x1, k.y2 - k.y1) + Math.hypot(k.x - k.x2, k.y - k.y2));
        for (let i = 1; i <= n; i++) {
          const t = i / n, u = 1 - t;
          cur.push(
            u * u * u * x + 3 * u * u * t * k.x1 + 3 * u * t * t * k.x2 + t * t * t * k.x,
            u * u * u * y + 3 * u * u * t * k.y1 + 3 * u * t * t * k.y2 + t * t * t * k.y,
          );
        }
        x = k.x; y = k.y;
      } else if (k.type === 'Z') {
        if (cur && cur.length > 4) {
          const n = cur.length;
          if (Math.abs(cur[0] - cur[n - 2]) < 0.01 && Math.abs(cur[1] - cur[n - 1]) < 0.01) cur.length = n - 2;
          contours.push(cur);
        }
        cur = null;
      }
    }
    if (cur && cur.length > 4) contours.push(cur);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of contours) for (let i = 0; i < p.length; i += 2) {
      if (p[i] < x0) x0 = p[i]; if (p[i] > x1) x1 = p[i];
      if (p[i + 1] < y0) y0 = p[i + 1]; if (p[i + 1] > y1) y1 = p[i + 1];
    }
    c = { contours, bbox: contours.length ? [x0, y0, x1, y1] : [0, 0, 0, 0], adv: g.advanceWidth };
    this.cache.set(key, c);
    return c;
  }

  // restituisce i glifi posizionati in unità testo (pixel del piano), baseline a y=0
  layout(str, name, size, tracking = 0) {
    const key = name + '|' + size + '|' + tracking + '|' + str;
    let L = this.lay.get(key);
    if (L) return L;
    const font = this.f[name];
    if (!font) throw new Error('font mancante: ' + name);
    const upm = font.unitsPerEm, k = size / upm;
    const chars = [...str];
    const gl = font.stringToGlyphs(str);
    const glyphs = [];
    let pen = 0;
    for (let i = 0; i < gl.length; i++) {
      const g = gl[i];
      const c = this.glyph(name, g);
      glyphs.push({ ch: chars[i] ?? '', x: pen * k, adv: c.adv * k, contours: c.contours, bbox: c.bbox, i });
      let kern = 0;
      if (i < gl.length - 1) {
        try { kern = font.getKerningValue(g, gl[i + 1]) || 0; } catch (e) { kern = 0; }
      }
      pen += c.adv + kern + tracking * upm;
    }
    const last = glyphs[glyphs.length - 1];
    const width = last ? last.x + last.adv : 0;
    const os2 = font.tables.os2 || {};
    const capH = (os2.sCapHeight || font.ascender * 0.72) * k;
    L = { glyphs, width, capH, k, asc: font.ascender * k, desc: font.descender * k, size };
    if (this.lay.size > 4000) this.lay.clear();
    this.lay.set(key, L);
    return L;
  }
}
