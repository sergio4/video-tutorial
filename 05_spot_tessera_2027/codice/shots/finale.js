// G · CTA: composizione centrata e ordinata. Tessera in alto, claim, pulsante ISCRIVITI ORA, sito, loghi piccoli.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, TRS, T } from '../engine/math.js';
import { BR, brandBg, h1, ctaButton } from './type.js';
import { stage } from './mondo.js';
import { card } from './card.js';

export function finale(S, TL) {
  const g = S.g, t0 = g.t0, t1 = g.t1;
  const tClaim = t0 + 0.45, tCta = t0 + 1.5, tUrl = t0 + 1.85, tLogo = t0 + 2.2;

  function tesPose(t) {
    const u = E.outExpo(seg(t, t0, t0 + 0.6));
    const idle = seg(t, t0 + 0.5, t0 + 1.0);
    return TRS([0, lerp(-700, -330, u), 0], [deg(4 * Math.sin(t * 1.1)) * idle, deg(8 * Math.sin(t * 0.8)) * idle + (1 - u) * Math.PI * 2, 0], lerp(0.5, 1.2, u));
  }

  function draw(R, t) {
    brandBg(R, t);
    stage(R, t, 0.45);
    const cam = new Cam();
    cam.look([0, 0, -1600], [0, 0, 0], 0, 1600);
    R.setCam(cam);
    R.push(tesPose(t));
    card(R, t, { flash: 1 - seg(t, t0 + 0.3, t0 + 0.7) });
    R.pop();
    // claim (messaggio principale), poi la CTA
    h1(R, ['VIVI IL GAMING', ['DA PROTAGONISTA', BR.lilac]], W / 2, 510, t, tClaim, 1e9, { size: 84, align: 'center' });
    R.hud(() => {
      const ca = seg(t, tCta, tCta + 0.15);
      const k = E.outBack(seg(t, tCta, tCta + 0.4), 1.7) * (1 + 0.025 * Math.sin((t - tCta) * 6) * seg(t, tCta + 0.6, tCta + 1));
      ctaButton(R, 'ISCRIVITI ORA', W / 2, 770, ca, k, { size: 52 });
      const ua = seg(t, tUrl, tUrl + 0.3);
      if (ua > 0) R.text('esports.fitp.it', W / 2, 880 + (1 - E.outExpo(seg(t, tUrl, tUrl + 0.4))) * 20, { font: 'glyM', size: 38, align: 'center', v: 'cap', fill: BR.white, alpha: ua, tracking: 0.02 });
      // loghi piccoli e centrati, senza fondi
      const la = seg(t, tLogo, tLogo + 0.35);
      if (la > 0) {
        const y = 995, eh = 64, ew = eh * (1278 / 717), fh = 56, fw = fh * (1400 / 689), gap = 42;
        const x0 = W / 2 - (ew + gap + fw) / 2;
        R.image(R.img.logo, x0, y - eh / 2, ew, eh, { sub: 1, alpha: la });
        R.band(x0 + ew + gap / 2, y - 26, x0 + ew + gap / 2, y + 26, 1.5, { fill: '#ffffff', alpha: la * 0.35 });
        R.image(R.img.fitp_neg, x0 + ew + gap, y - fh / 2, fw, fh, { sub: 1, alpha: la });
      }
    });
    const wh = 1 - E.outCubic(seg(t, t0, t0 + 0.3));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: BR.magenta, alpha: wh * 0.5 }));
  }

  function fx(t) {
    const f = { grain: 0.04 };
    if (t < t0 + 0.6) f.mb = 7;
    return f;
  }

  return { t0, t1: t1 + 0.1, draw, fx };
}
