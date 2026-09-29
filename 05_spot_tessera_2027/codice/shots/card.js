// TESSERA ESPORTS FITP 2027: fronte (arte ufficiale) e retro «ATTIVA». Coordinate della carta: centro 0,0, 340 × 226.
import { seg, E, rgba } from '../engine/math.js';
import { PAL, checkMark } from '../engine/kit.js';

export const CW = 340, CH = 226;

// vero se la faccia anteriore è rivolta alla camera (nel piano corrente)
export function facing(R) {
  const a0 = R.proj(-170, -113), b0 = R.proj(170, -113), d0 = R.proj(-170, 113);
  return a0 && b0 && d0 ? (b0[0] - a0[0]) * (d0[1] - a0[1]) - (b0[1] - a0[1]) * (d0[0] - a0[0]) > 0 : true;
}

export function cardFront(R, t, a = 1) {
  R.rrect(-CW / 2, -CH / 2, CW, CH, 16, { fill: '#0b0624', alpha: a, knock: true }); // il bagliore dello sfondo non passa attraverso la carta
  R.clipPoly(R.rrPts(-CW / 2, -CH / 2, CW, CH, 16));
  R.image(R.img.tessera, -CW / 2, -CH / 2, CW, CH, { sub: 6, alpha: a });
  const sw = ((t * 0.6) % 1.6) - 0.3, sx = -CW / 2 + sw * CW * 1.4;
  R.poly([sx - CW * 0.25, -CH / 2, sx - CW * 0.1, -CH / 2, sx - CW * 0.35, CH / 2, sx - CW * 0.5, CH / 2], { fill: { lin: [sx - CW * 0.5, 0, sx - CW * 0.1, 0], stops: [[0, 'rgba(0,252,252,0)'], [0.5, 'rgba(255,255,255,0.5)'], [1, 'rgba(244,8,188,0)']] }, alpha: a, blend: 'screen' });
  R.unclip();
  R.rrect(-CW / 2, -CH / 2, CW, CH, 16, { stroke: { lin: [-CW / 2, -CH / 2, CW / 2, CH / 2], stops: [[0, PAL.cyan], [1, PAL.magenta]] }, lw: 2.4, alpha: a, glow: 0.8 });
}

// retro: tessera attiva (disegnato specchiato, così si legge quando la carta è girata)
export function cardBack(R, t, a = 1, act = 1) {
  R.with([-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0], () => {
    R.rrect(-CW / 2, -CH / 2, CW, CH, 16, { fill: { lin: [-CW / 2, -CH / 2, CW / 2, CH / 2], stops: [[0, '#241266'], [1, '#0b0624']] }, alpha: a, knock: true });
    const lw = 92, lh = lw * (717 / 1278);
    R.image(R.img.logo, -CW / 2 + 18, -CH / 2 + 14, lw, lh, { sub: 2, alpha: a });
    R.text('TESSERA ESPORTS FITP', CW / 2 - 20, -CH / 2 + 32, { maxW: 190, font: 'glySB', size: 12, align: 'right', v: 'cap', fill: '#ffffff', alpha: a * 0.85, tracking: 0.12 });
    R.text('2027', CW / 2 - 20, -CH / 2 + 58, { font: 'glyB', size: 24, align: 'right', v: 'cap', fill: '#ffffff', alpha: a });
    const k = E.outBack(act, 1.8);
    if (act > 0) {
      R.circle(-92, 22, 30 * k, { stroke: PAL.cyan, lw: 3, alpha: a, glow: 0.9, glowOnly: true }, 32);
      R.circle(-92, 22, 26 * k, { fill: PAL.cyan, alpha: a }, 32);
      checkMark(R, -92, 22, 26 * k, seg(act, 0.3, 1), { stroke: '#0b0624', lw: 5 });
      R.text('ATTIVA', -52, 22, { maxW: CW / 2 + 52 - 22, font: 'glyB', size: 39, v: 'cap', fill: PAL.cyan, alpha: a * seg(act, 0.1, 0.5), glow: 0.4 });
    }
    R.text('MARCO', -CW / 2 + 20, CH / 2 - 26, { maxW: CW - 40, font: 'glySB', size: 11, v: 'cap', fill: '#b9b3ff', alpha: a, tracking: 0.1 });
    R.rrect(-CW / 2, -CH / 2, CW, CH, 16, { stroke: { lin: [-CW / 2, -CH / 2, CW / 2, CH / 2], stops: [[0, PAL.cyan], [1, PAL.magenta]] }, lw: 2.4, alpha: a, glow: 0.8 });
  });
}

export function card(R, t, o = {}) {
  const a = o.alpha ?? 1;
  R.rrect(-CW / 2, -CH / 2, CW, CH, 16, { fill: '#000', alpha: 0.35 * a, blur: 24 });
  if (facing(R)) cardFront(R, t, a);
  else cardBack(R, t, a, o.act ?? 0);
  if (o.flash > 0) R.rrect(-CW / 2, -CH / 2, CW, CH, 16, { fill: PAL.magenta, alpha: o.flash * a, glow: 1 });
}
