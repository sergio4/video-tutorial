// Personaggi ufficiali Tennis Clash (pose statiche fornite da FITP): immagini scontornate con luce di bordo neon
// e alone già applicati (media/tc_*_lit.png, tc_*_glow.png). Origine ai piedi, y verso il basso.
export const CHAR = {
  hero: { img: 'tc_hero_lit', glow: 'tc_hero_glow', w: 633, h: 1320, feet: 1254, body: 1188 }, // MARCO, pugno chiuso
  opp: { img: 'tc_opp_lit', glow: 'tc_opp_glow', w: 557, h: 1320, feet: 1254, body: 1188 },    // LUNA.SPIN, racchetta in spalla
};

// disegna il personaggio nel piano corrente, alto hgt unità (dai piedi alla testa)
export function charCard(R, key, hgt, o = {}) {
  const C = CHAR[key], k = hgt / C.body;
  const w = C.w * k, h = C.h * k, x = -w / 2 + (o.dx || 0), y = -C.feet * k;
  const a = o.alpha ?? 1;
  if (a <= 0.003) return;
  if (o.glow !== 0) R.image(R.img[C.glow], x, y, w, h, { sub: o.sub ?? 6, alpha: a * (o.glow ?? 0.85), blend: 'lighter' });
  R.image(R.img[C.img], x, y, w, h, { sub: o.sub ?? 6, alpha: a });
}
