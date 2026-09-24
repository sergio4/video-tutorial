// Carica una volta i file reali (loghi, tessera, font, texture) e la timeline,
// e li trasforma in data URL, così possono stare dentro l'SVG di ogni fotogramma.
// Le sorgenti originali sono in /assets; qui ci sono copie ridotte (cartella media/).
export const A = {};
export const TL = { cue: {}, vo: [], dur: 0 };

const FILES = {
  tessera: 'media/tessera_fronte.png',       // grafica reale della tessera, fronte
  esports: 'media/esports_fitp.png',         // logo eSports FITP
  fitp: 'media/fitp_logo.svg',               // logo FITP (dal sito fitp.it)
  supertennis: 'media/supertennis_logo.svg', // logo SuperTennis (dal sito fitp.it)
  tcIcon: 'media/tennis_clash_icona.png',    // icona app Tennis Clash (Play Store), segnaposto del logo ufficiale
  font: 'media/unbounded-900.woff2',         // Unbounded 900, OFL: titoli (al posto del Glancyr)
  hand: 'media/caveat-700.woff2',            // Caveat 700, OFL: sottotitoli e note a mano
  paper: 'media/carta.png',                  // grana della carta, sovrapposta a tutto il film
};

const toDataURL = blob => new Promise((ok, ko) => {
  const r = new FileReader();
  r.onload = () => ok(r.result);
  r.onerror = ko;
  r.readAsDataURL(blob);
});

export async function loadAssets() {
  const tl = await (await fetch('timeline.json')).json();
  Object.assign(TL, tl);
  await Promise.all(Object.entries(FILES).map(async ([k, path]) => {
    const res = await fetch(path);
    if (!res.ok) throw new Error('asset mancante: ' + path);
    A[k] = await toDataURL(await res.blob());
  }));
  return A;
}
