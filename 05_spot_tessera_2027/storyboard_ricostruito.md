# Spot TESSERA eSPORTS FITP 2027 · piano v5

BOZZA · 16:9 · 30 s · 128 BPM · musica originale, voce da registrare (testo in `testo_voiceover.md`).

**Domanda guida:** chi non conosce gli eSports FITP, dopo 30 secondi deve aver capito cosa può fare e perché entrare.
**Percorso:** gioco → XP → level up → mondo eSports FITP → FITP eSeries by BMW → tornei e competizione → TESSERA eSPORTS FITP → myFITP → ISCRIVITI ORA.

## Sistema visivo
- **Palette ufficiale** di esports.fitp.it: viola #a406f9, lilla #c84cf0, magenta #f608be, ciano #00ffff, notte #10091e, deep #311a60. Non c'è né giallo né lime.
- **Testi in Glancyr**, con tre livelli e un solo messaggio principale per schermata:
  - titolo in Glancyr Bold bianco, con la parola chiave in lilla;
  - secondario in Glancyr Medium;
  - supporto in Glancyr Regular grigio lilla.
  - La gamification (+XP, LIVELLO 30) resta piccola e secondaria.
- **Motion:** ogni testo entra dal basso in maschera ed esce verso l'alto. Ogni movimento ha una funzione:
  - la barra XP segue i colpi veri;
  - il level up nasce dal punto vinto;
  - le card scorrono sul battere;
  - la tessera vola nel telefono;
  - la CTA pulsa.

## Scene

| # | Tempo | Cosa succede | A schermo |
|---|---|---|---|
| A | 0,00–5,16 | Gameplay reale di Tennis Clash (clip fornita) in una card verticale, con lo stesso video sfocato a riempire il 16:9. Nei primi 2,6 s c'è solo gameplay. La barra XP sale su ogni colpo vero. | barra LV 29 · +XP piccoli · dal secondo 2,6 «OGNI COLPO / CONTA» |
| B | 5,16–7,03 | Il punto vinto riempie la barra: lampo, anelli, la card si tinge di magenta, tuffo | LEVEL UP · LIVELLO 30 |
| C | 7,03–10,78 | Dal lampo emerge il logo eSports FITP, poi il logo ufficiale FITP eSeries by BMW | «ENTRA NEL MONDO / eSPORTS FITP» → «Il circuito ufficiale della Federazione Italiana Tennis e Padel» |
| D | 10,78–16,41 | Carosello 3D di tre card editoriali con immagini vere: gameplay con logo eSeries, palco degli Internazionali BNL d'Italia eSeries, vincitore delle Nitto ATP Finals eSeries | «TORNEI ONLINE / DAL TUO SMARTPHONE» · «FINALI LIVE / AI GRANDI EVENTI» · «MONTEPREMI / IN PALIO» |
| E | 16,41–21,09 | La tessera entra ruotando, poi arrivano i vantaggi | «OTTIENI LA / TESSERA / eSPORTS FITP» → 2 cartelli grandi (TORNEI UFFICIALI con montepremi · FINO AL -10%* sui grandi eventi FITP) + 3 chip (Loyalty program FITP · Sconti dai partner · SuperTennis+ gratis) + nota legale |
| F | 21,09–25,31 | La tessera vola nello smartphone: il toast dice che la tessera è attiva, il torneo è già aperto, un tocco su REGISTRATI porta a SEI ISCRITTO | «TUTTO PARTE / DA myFITP» · «Ti iscrivi ai tornei in un tocco» |
| G | 25,31–30,00 | Composizione centrata: tessera, claim, pulsante, sito, loghi piccoli | «VIVI IL GAMING / DA PROTAGONISTA» · **ISCRIVITI ORA** · esports.fitp.it · loghi eSports FITP e FITP |

Nota legale (E): «*Fino al 10% sui biglietti e fino al 5% sugli abbonamenti. Valido per chi ha partecipato ad almeno un torneo eSports FITP.»

## Musica
Traccia originale in fa minore a 128 BPM, generata da `codice/audio/build.py`:
- **A:** ostinato filtrato che si apre col titolo, poi rullata e riser.
- **B:** impatto sul punto vinto (5,5 s) e drop pieno.
- **C:** respiro con pad e arpeggio.
- **D:** groove pieno, con un colpo su ogni card.
- **E:** lift.
- **F:** groove asciutto, con tap e conferma.
- **G:** salita, colpo sul pulsante e accordo finale.

Nelle finestre della voce la musica scende di circa 5 dB. Il mix è a −14 LUFS.

## Materiali
- Gameplay: clip WhatsApp fornita (392×850), sezioni 3,0–9,4 s e 12,6–15,8 s (`codice/media/gp_a`, `gp_b`).
- Foto degli eventi, dagli URL forniti:
  - `ev_ibi_fitp.jpg` (fitp.it);
  - `ev_atp_victor.jpg` (nittoatpfinals.com);
  - non usate: `ev_ibi_trixo.jpg` (stesso palco della card 2) e `ev_atp_premiazione.jpg` (i toni azzurri stonano con la palette).
- Loghi:
  - FITP eSeries by BMW, ufficiale (esports.fitp.it);
  - eSports FITP;
  - FITP in negativo, **ricavato da me dall'SVG**.
- Font: Glancyr (`assets/font/glancyr`), preso dal sito eSports FITP.

## Da verificare
- **Licenza Glancyr:** non c'è un file di licenza. Va verificato che FITP abbia i diritti d'uso anche per il video.
- **Diritti sulle foto:** le foto sono scaricate da fitp.it, trixo.gg e nittoatpfinals.com. Servono i diritti e la liberatoria delle persone riconoscibili (il vincitore nella card 3).
- **Tennis Clash:** nome e gameplay richiedono l'ok di WildLife. Nel gameplay compaiono i nickname «imSerghio» e «Insignific».
- **Montepremi e sconti 2027:** confermare le percentuali, gli eventi e la condizione del torneo.
- **Flusso myFITP:** toast e iscrizione sono ricostruiti in modo plausibile, da confermare con chi gestisce l'app.
- **CTA:** a schermo c'è «ISCRIVITI ORA», grammaticalmente corretto. «Iscrivi ora» sarebbe un imperativo senza oggetto.
