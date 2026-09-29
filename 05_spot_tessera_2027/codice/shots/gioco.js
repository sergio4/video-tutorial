// 01 · Apertura  02 · Level up
// Smartphone vero nello spazio (spessore, ombra, riflesso sul pavimento, lama di luce sul vetro) con il gameplay reale
// di Tennis Clash. La camera avanza e gira attorno al telefono, i fari sfocati scorrono in parallasse.
// La domanda «SEI PRONTO A DIVENTARE IL PROSSIMO CAMPIONE ESPORTS?» entra con il telefono, riga per riga.
// Sul punto vinto la pallina esce dallo schermo verso la camera: impatto, LEVEL UP; poi vola via verso l'alto (→ 03).
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, rgba, TRS, hash } from '../engine/math.js';
import { shake, bokeh } from './common.js';
import { BR, kin } from './type.js';
import { SW, SH, HX, HY } from './mfui.js';
import { phone3D, floor } from './device.js';
import { flyBall, impact } from './ball.js';

export function gioco(S, TL) {
  const a = S.a, b = S.b;
  const t0 = a.t0, tPoint = t0 + 5.5, t1 = b.t1;
  const tHit = tPoint + 0.34;              // la pallina arriva sulla camera: LEVEL UP
  const tAway = t1 - 0.75;                 // la pallina riparte verso l'alto
  const frame = (t) => clamp(Math.floor((t - t0) * 25), 0, 159);

  // camera quasi frontale: il telefono si legge dritto e solido; solo una lenta carrellata in avanti e una
  // leggera deriva laterale (parallasse con fari e pulviscolo)
  function camAt(t) {
    const c = new Cam();
    const u = E.inOutSine(seg(t, t0, tPoint));
    const sh = shake(t, [[tHit, 18, 0.5]]);
    const push = E.outCubic(seg(t, tHit, t1)) * 380;
    c.look([lerp(-60, 40, u), lerp(-120, -100, u), lerp(-1760, -1640, u) + push], [lerp(40, 60, u), -10, 0], 0, 1600);
    c.cx += sh[0]; c.cy += sh[1];
    return c;
  }

  // il telefono arriva dal fondo quasi dritto (rotazione contenuta), poi respira appena
  function pose(t) {
    const inn = E.outExpo(seg(t, t0 + 0.25, t0 + 1.2));
    const away = E.inCubic(seg(t, tHit, t1));
    const ry = deg(lerp(-18, -12, inn) + 2 * Math.sin(t * 0.8));
    return { M: TRS([420 + away * 260, lerp(40, 0, inn) + Math.sin(t * 1.3) * 5 - away * 60, lerp(700, 0, inn) + away * 700], [deg(2), ry, 0], 0.86), ry };
  }

  // punto dello schermo del telefono da cui esce la pallina (in basso al centro, dove gioca il tennista)
  let exitPt = [W * 0.7, H * 0.62];

  const ballPath = (t) => {
    if (t < tPoint - 0.08 || t > t1 + 0.05) return null;
    if (t < tHit) { const u = E.inQuad(seg(t, tPoint - 0.08, tHit)); return [lerp(exitPt[0], W / 2, u), lerp(exitPt[1], H / 2 - 30, u) - Math.sin(u * Math.PI) * 120, lerp(4, 150, u)]; }
    if (t < tAway) { const u = E.outCubic(seg(t, tHit, tHit + 0.5)); return [lerp(W / 2, W / 2 + 330, u), lerp(H / 2 - 30, 250, u) + Math.sin((t - tHit) * 5) * 8, lerp(150, 30, u)]; }
    const u = E.inCubic(seg(t, tAway, t1));
    return [lerp(W / 2 + 330, W / 2 + 40, u), lerp(250, -120, u), lerp(30, 18, u)];
  };

  function draw(R, t) {
    const cam = camAt(t);
    R.setCam(cam);
    const fi = frame(t);
    // sfondo: lo stesso gameplay, sfocato e tinto nel viola del brand; fari sfocati in parallasse
    R.hud(() => {
      const bi = R.img.gpABlur[fi], bh = W * (850 / 392);
      R.image(bi, 0, (H - bh) / 2, W, bh, { sub: 1, alpha: 0.55 });
      R.rect(0, 0, W, H, { fill: { lin: [0, 0, W, 0], stops: [[0, 'rgba(16,9,30,0.94)'], [0.5, 'rgba(49,26,96,0.62)'], [1, 'rgba(16,9,30,0.7)']] } });
    });
    bokeh(R, t, 0.45, cam.eye[0] * 0.6, 2);
    floor(R, 1);
    const P = pose(t);
    phone3D(R, t, P.M, (RR) => {
      RR.image(RR.img.gpA[fi], -HX, -HY, SW, SH, { sub: 4 });
      const fl = env(t, tPoint - 0.03, tPoint, tPoint + 0.05, tPoint + 0.45);
      if (fl > 0) RR.rect(-HX, -HY, SW, SH, { fill: '#ffffff', alpha: fl * 0.6 });
      const lv = E.outCubic(seg(t, tPoint + 0.1, tPoint + 0.6));
      if (lv > 0) RR.rect(-HX, -HY, SW, SH, { fill: { lin: [0, -HY, 0, HY], stops: [[0, rgba(BR.violet, 0.35)], [1, rgba(BR.magenta, 0.85)]] }, alpha: lv });
    }, { ry: P.ry, rimGlow: 0.8 + env(t, tPoint - 0.05, tPoint, tPoint + 0.1, tPoint + 0.6) });
    // posizione a schermo del punto di uscita della pallina
    R.pushAbs(P.M); const q = R.proj(0, 160); R.pop();
    if (q) exitPt = q;
    // pulviscolo in primo piano: si muove più veloce dello sfondo (parallasse)
    R.hud(() => {
      for (let i = 0; i < 26; i++) {
        const x = ((hash(i * 4.1) * W * 1.4 - (cam.eye[0] + 260) * 1.8 - t * 30) % (W * 1.4) + W * 1.4) % (W * 1.4) - W * 0.2;
        const y = hash(i * 6.7) * H + Math.sin(t + i) * 10;
        R.circle(x, y, 2 + hash(i * 2.2) * 3, { fill: i % 4 ? '#ffffff' : BR.cyan, alpha: 0.3 + 0.2 * Math.sin(t * 2 + i), glow: 0.6 }, 10);
      }
    });

    // la domanda, costruita riga per riga (una sola frase, nessun altro testo in scena)
    // entra insieme al telefono, anzi un istante prima
    kin(R, [
      { s: 'SEI PRONTO', size: 90 },
      { s: 'A DIVENTARE', size: 90 },
      { s: 'IL PROSSIMO', size: 90 },
      { s: 'CAMPIONE', size: 124, col: BR.lilac, glow: 0.25, glowColor: BR.magenta },
      { s: 'ESPORTS?', size: 124, col: BR.lilac, glow: 0.25, glowColor: BR.magenta },
    ], 120, 280, t, t0 + 0.05, tPoint - 0.55, { lineGap: 0.3 });

    // LEVEL UP: il punto vinto fa uscire la pallina dal gioco
    const veil = seg(t, tPoint, tHit) * (1 - seg(t, t1 - 0.3, t1));
    if (veil > 0) R.hud(() => R.rect(0, 0, W, H, { fill: BR.night, alpha: veil * 0.55 }));
    const la = seg(t, tHit, tHit + 0.05) * (1 - seg(t, t1 - 0.35, t1 - 0.1));
    if (la > 0) {
      R.hud(() => {
        // raggi di luce dal centro: festeggiano il salto di livello
        const rr = E.outCubic(seg(t, tHit, tHit + 0.6));
        for (let i = 0; i < 14; i++) {
          const ang = (i / 14) * Math.PI * 2 + (t - tHit) * 0.4, w = 0.06;
          R.poly([W / 2, H / 2, W / 2 + Math.cos(ang - w) * 1400 * rr, H / 2 + Math.sin(ang - w) * 1400 * rr, W / 2 + Math.cos(ang + w) * 1400 * rr, H / 2 + Math.sin(ang + w) * 1400 * rr], { fill: { rad: [W / 2, H / 2, 1100], stops: [[0, rgba(i % 2 ? BR.magenta : BR.violet, 0.35 * la)], [1, 'rgba(0,0,0,0)']] }, blend: 'lighter' });
        }
        R.text('LEVEL UP', W / 2, H / 2, { font: 'glyB', size: 210, align: 'center', v: 'cap', fill: BR.white, alpha: la, tracking: 0.02, depth: 22, depthSteps: 8,
          side: (u) => rgba(u < 0.5 ? BR.magenta : BR.deep, 1), shadow: ['rgba(8,4,24,0.6)', 40, 0, 12],
          per: (g) => { const u = E.outExpo(seg(t, tHit + g * 0.03, tHit + g * 0.03 + 0.4)); return { s: lerp(2.6, 1, u), a: seg(t, tHit + g * 0.03, tHit + g * 0.03 + 0.06), rx: (1 - u) * deg(40) }; } });
      });
    }
    impact(R, W / 2, H / 2 - 30, seg(t, tHit, tHit + 0.7), { scale: 2.2, col: BR.magenta });
    flyBall(R, ballPath, t, { trail: 0.14 });
    const wh = E.inCubic(seg(t, t1 - 0.22, t1));
    if (wh > 0) R.hud(() => R.rect(0, 0, W, H, { fill: BR.deep2, alpha: wh }));
  }

  function fx(t) {
    const f = { grain: 0.04 };
    if (t < t0 + 1.1) f.mb = 6;
    if (t >= tPoint - 0.1) f.mb = 8;
    if (t >= tHit && t < tHit + 0.3) { const u = (t - tHit) / 0.3; f.flash = ['#ffffff', 0.4 * (1 - u)]; f.ca = 0.014 * (1 - u); }
    return f;
  }

  return { t0, t1, draw, fx };
}
