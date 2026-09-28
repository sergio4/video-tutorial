# Spot Tessera eSports FITP 2027 · piano v3

BOZZA · 16:9 · master 45 s · versione visiva senza audio, pronta per il voice over.

**Obiettivo:** far capire cosa sono gli eSports FITP e portare a fare la tessera eSports FITP.
**Percorso:** Scopri gli eSports FITP → Level up → Fai la tessera → Entra in myFITP → Scopri cosa puoi fare → CTA.
**Equazione da fissare prima della tessera:** eSports FITP = gaming + competizioni ufficiali + community + vantaggi FITP.

Fonte di partenza: storyboard «Spot Tesseramento eSports 2027» di Next Different (il PDF non è nel repository). Il piano v3 riprende parti del copione dell'agenzia ma cambia l'apertura e la struttura: va condiviso con Next Different / Giovanni.

## Blocchi

| # | Tempo | Cosa succede | Testi a schermo | V.O. (bozza) | Ruolo |
|---|---|---|---|---|---|
| A | 0,00–3,75 | Smartphone nel buio con una partita di tennis in corso, MARCO contro LUNA.SPIN; punto vinto | punteggio, barra LV 29, «+120 XP» | Giochi a Tennis Clash? | Aggancio: chi gioca si riconosce |
| B | 3,75–6,09 | La barra XP si riempie di colpo, LEVEL UP, la camera si tuffa nello schermo; MARCO si materializza nell'arena eSports FITP | LEVEL UP, «MARCO · LV 30» | Con gli eSports FITP il tuo gioco sale di livello. | Ingresso in un mondo nuovo |
| C | 6,09–11,72 | C1 si accende il tabellone FITP eSeries by BMW; C2 arriva LUNA.SPIN, chat «Ti aspetto in finale!» / «Ci vediamo lì.», VS; C3 classifica, MARCO sale al 3° posto | 01 TORNEI UFFICIALI · 02 COMMUNITY · 03 CLASSIFICHE; super «eSports FITP · il circuito ufficiale della Federazione Italiana Tennis e Padel» | Tornei ufficiali, sfide con la community, classifiche: è il circuito eSports della Federazione Italiana Tennis e Padel. | Cosa sono gli eSports FITP |
| D | 11,72–15,00 | Portale TORNEO UFFICIALE chiuso da un lucchetto; la tessera si rivela, entra nel lucchetto, il portale si apre | SERVE LA TESSERA eSPORTS FITP; TESSERA eSPORTS FITP 2027 · IL TUO PASS PER I TORNEI UFFICIALI | Per entrare in gara ti serve la tessera eSports FITP. | La tessera come chiave: il primo passo |
| E | 15,00–16,88 | La tessera si gira: ATTIVA; vola nello smartphone | TESSERAMENTO COMPLETATO | Fatta la tessera, entri in myFITP: | Decisione completata |
| F | 16,88–23,44 | myFITP reale (dati inventati): tessera aggiunta → Tornei → FITP eSeries by BMW → REGISTRATI → conferma → SEI ISCRITTO → notifica del match. Dito visibile, un tocco ogni ~1,3 s | didascalie 01 LA TUA TESSERA · 02 SCEGLI IL TORNEO · 03 ISCRIVITI · 04 SEI IN GARA | ti iscrivi ai tornei ufficiali e ti metti alla prova | Cosa fai con la tessera |
| G | 23,44–27,19 | Match (scia di luce, tabellone MARCO – LUNA.SPIN), GAME · SET · MATCH, coppa al neon, MARCO esulta sotto WIN | GAME · SET · MATCH, WIN | per diventare il migliore. | Payoff della competizione |
| H | 27,19–36,56 | myFITP: «Benefit Tesserati sbloccati dopo il tuo primo torneo»; tocco → pass GRANDI EVENTI FITP protagonista con sconti ed eventi; poi i quattro riquadri degli altri vantaggi | FINO AL -10% sui biglietti* · -5% sugli abbonamenti* · Internazionali BNL d'Italia · BNL Italy Major Premier Padel · Davis Cup Final 8 · Nitto ATP Finals; E CON LA TESSERA ANCHE… Competizioni ufficiali · Loyalty program FITP · Sconti partner · SuperTennis+ gratis; nota legale | In più, approfitta degli sconti sui grandi eventi FITP, del loyalty program, dei vantaggi dei partner e di SuperTennis+ gratis. | Ecosistema di vantaggi, grandi eventi al primo posto |
| I | 36,56–45,00 | I vantaggi rientrano nella tessera; CTA grande; cartello finale: tessera a sinistra, claim a destra, loghi piccoli centrati | FAI LA TUA TESSERA eSPORTS FITP; Vivi il gaming da protagonista; loghi eSports FITP + FITP | Fai la tua tessera eSports FITP e vivi il gaming da vero protagonista. | CTA |

Nota legale (blocco H): «*Fino al 10% sui biglietti e fino al 5% sugli abbonamenti. Valido per chi ha partecipato ad almeno un torneo eSports FITP.»

## Gerarchia dei benefit

1. **Grandi eventi FITP** (pass grande, cifre, i quattro eventi): circa 3 s da protagonista.
2. **Competizioni ufficiali, loyalty program, sconti partner, SuperTennis+**: quattro riquadri grandi circa la metà del pass, insieme per circa 4 s.

## Voice over

Tempi e frasi in `codice/timeline.json` (blocchi `a`…`i`, campi `vo_in`, `vo_est`, `vo`). Con la voce registrata, un file per blocco (`a.wav` … `i.wav`) e `python retime.py cartella/ --scrivi`: le animazioni si riallineano da sole. Se la voce arriva in un file unico, la divido io sulle pause.

**Sincronie:** «sale di livello» con LEVEL UP; «Tornei ufficiali / community / classifiche» con le tre etichette; «ti serve la tessera» con il lucchetto; «entri in myFITP» con la tessera nel telefono; «ti iscrivi» con REGISTRATI; «il migliore» con la coppa; «grandi eventi» con il pass; «Fai la tua tessera» con la CTA.

## Materiali usati

- Personaggi ufficiali Tennis Clash: MARCO (uomo, pugno chiuso) e LUNA.SPIN (donna, racchetta in spalla), con luce di bordo neon (`codice/media/tc_*`).
- Interfaccia myFITP ricostruita dalle schermate reali (`assets/riferimenti/myfitp`), font Roboto.
- Logo eSports FITP (`esports_fitp.png`, trasparente) e logo FITP in negativo **ricavato dall'SVG** (`fitp_logo_neg.png`): da sostituire con il file ufficiale in negativo se esiste.

## Da verificare

- **Voce:** bozza da validare con Next Different / Giovanni. «Tennis Clash» nella prima frase richiede l'ok di WildLife (alternativa: «Giochi a tennis sul telefono?»).
- **Dove si fa la tessera:** serve per completare la CTA (ora solo «Fai la tua tessera eSports FITP»).
- **Condizione del torneo:** vale solo per gli sconti sui grandi eventi o per tutti i benefit?
- **Partita nel blocco A:** è una resa grafica nostra; con una clip reale del gioco l'aggancio sarebbe più forte.
- **Flusso myFITP:** finestra di conferma, «SEI ISCRITTO» e toast «Tessera eSports 2027 aggiunta» sono ricostruiti in modo plausibile, da confermare con chi gestisce l'app.
- **Loghi:** file FITP ufficiale in negativo; logo SuperTennis+ (ora solo testo).
- **Eventi 2027:** confermare che i quattro grandi eventi e le percentuali siano validi per il 2027.
