// F · myFITP, la piattaforma: la tessera entra nel telefono, il torneo è già lì, un tocco su REGISTRATI → SEI ISCRITTO.
// Poche schermate, ritmo rapido ma leggibile. Interfaccia reale di myFITP (mfui.js), dati inventati.
import { W, H, Cam } from '../engine/r.js';
import { clamp, lerp, seg, env, E, deg, TRS, T, apply } from '../engine/math.js';
import { BR, brandBg, h1, h2 } from './type.js';
import { stage } from './mondo.js';
import { card } from './card.js';
import { TES, CAM } from './vantaggi.js';
import { HY, MF, phone, scrTorneo, fingerTrack, REG_BTN } from './mfui.js';
import { checkMark } from '../engine/kit.js';

export function myfitp(S, TL) {
  const f = S.f, t0 = f.t0, t1 = f.t1;
  const ph0 = t0, ph1 = t0 + 0.5;          // entra il telefono
  const fly0 = t0 + 0.05, fly1 = t0 + 0.6; // la tessera vola nel telefono
  const tReg = t0 + 1.75;                  // tocco su REGISTRATI
  const out0 = t1 - 0.45;                  // uscita verso il finale
  const PHX = 360;

  function phonePose(t) {
    const a = E.outExpo(seg(t, ph0, ph1)), o = E.inCubic(seg(t, out0, t1));
    return TRS([lerp(1300, PHX, a) + o * 900, lerp(200, 0, a), 0], [deg(2), deg(lerp(-40, -8, a) - o * 20), 0], 0.98);
  }

  function tesPose(t) {
    const u = E.inOutCubic(seg(t, fly0, fly1));
    const dst = apply(phonePose(t), 0, -60, -20);
    return TRS([lerp(TES.pos[0], dst[0], u), lerp(TES.pos[1], dst[1], u) - Math.sin(u * Math.PI) * 120, lerp(0, dst[2], u)], [0, deg(-12) * (1 - u) + deg(-8) * u, 0], lerp(TES.sc, 0.25, E.inCubic(u)));
  }

  function screen(R, t) {
    const done = E.outCubic(seg(t, tReg + 0.2, tReg + 0.45));
    scrTorneo(R, t, { reg: env(t, tReg - 0.06, tReg, tReg + 0.1, tReg + 0.25), done, count: 27 - (t - t0) });
    // avviso: la tessera è attiva
    const ta = env(t, fly1 - 0.05, fly1 + 0.1, tReg - 0.35, tReg - 0.15);
    if (ta > 0) {
      R.rrect(-170, -HY + 130, 340, 50, 25, { fill: MF.navy, alpha: ta * 0.96 });
      R.text('TESSERA eSPORTS FITP attiva', -14, -HY + 155, { font: 'rob700', size: 15, align: 'center', v: 'cap', fill: '#fff', alpha: ta, maxW: 270 });
      checkMark(R, 138, -HY + 155, 18, 1, { stroke: '#ffffff', lw: 3, alpha: ta });
    }
  }

  function draw(R, t) {
    brandBg(R, t);
    stage(R, t, 0.5);
    const cam = new Cam();
    cam.look([lerp(0, 120, seg(t, ph1, tReg)), 0, lerp(CAM.eye[2], -1450, E.inOutCubic(seg(t, ph1, tReg)))], [lerp(0, 120, seg(t, ph1, tReg)), 0, 0], 0, CAM.f);
    R.setCam(cam);
    R.push(phonePose(t));
    R.with(T(30, 40, 60), () => R.rrect(-230, -460, 460, 920, 60, { fill: '#000', alpha: 0.45, blur: 40 }));
    phone(R, t, () => screen(R, t));
    fingerTrack(R, t, [{ t: tReg, x: REG_BTN.x + 40, y: REG_BTN.y }]);
    R.pop();
    if (t < fly1) { R.push(tesPose(t)); card(R, t); R.pop(); }
    h1(R, ['TUTTO PARTE', ['DA myFITP', BR.lilac]], 150, 450, t, t0 + 0.4, out0, { size: 88, maxW: 820 });
    h2(R, 'Ti iscrivi ai tornei in un tocco', 152, 640, t, t0 + 0.7, out0, { size: 36, fill: BR.white, maxW: 820 });
  }

  function fx(t) {
    const g = { grain: 0.04 };
    if (t < ph1 + 0.1) g.mb = 7;
    if (t > out0) g.mb = 8;
    return g;
  }

  return { t0, t1, draw, fx };
}
