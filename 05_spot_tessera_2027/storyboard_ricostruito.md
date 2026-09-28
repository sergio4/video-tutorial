# Spot Tessera eSports FITP 2027 · piano v4

BOZZA · 16:9 · master 45 s · versione visiva senza audio, pronta per il voice over.

**Obiettivo:** far capire cosa sono gli eSports FITP e portare a fare la tessera eSports FITP.
**Percorso:** Scopri gli eSports FITP → Level up → Fai la tessera → Entra in myFITP → Scopri cosa puoi fare → CTA.
**Equazione da fissare prima della tessera:** eSports FITP = gaming + competizioni ufficiali + community + vantaggi FITP.

Fonte di partenza: storyboard «Spot Tesseramento eSports 2027» di Next Different (il PDF non è nel repository). Il piano v3 riprende parti del copione dell'agenzia ma cambia l'apertura e la struttura: va condiviso con Next Different / Giovanni.

## Blocchi

| # | Tempo | Cosa succede | Testi a schermo | V.O. (bozza) |
|---|---|---|---|---|
| A | 0,00–3,75 | Smartphone con una partita di tennis, MARCO contro LUNA.SPIN; punto vinto | GIOCHI A TENNIS CLASH? · +120 XP | Giochi a Tennis Clash? |
| B | 3,75–6,09 | La barra XP si riempie, LEVEL UP, tuffo nello schermo; MARCO si materializza nell'arena eSports FITP | LEVEL UP | Con gli eSports FITP il tuo gioco sale di livello. |
| C | 6,09–10,78 | L'arena con il logo eSports FITP; il tabellone FITP eSeries by BMW si riempie di giocatori da tutta Italia; resta un posto chiuso, «IL TUO POSTO», contro LUNA.SPIN | IL CIRCUITO UFFICIALE DELLA FEDERAZIONE ITALIANA TENNIS E PADEL · TORNEI UFFICIALI · SFIDE IN TUTTA ITALIA | Il circuito ufficiale FITP: tornei e sfide con giocatori da tutta Italia. |
| D | 10,78–14,06 | Il posto ha un lucchetto; la tessera lo apre: ISCRIZIONI APERTE | SERVE LA TESSERA eSPORTS FITP · TESSERA eSPORTS FITP 2027 · IL TUO POSTO È SBLOCCATO | Per entrare in gara ti serve la tessera eSports FITP. |
| E | 14,06–15,94 | La tessera si gira: ATTIVA; vola nello smartphone | TESSERAMENTO COMPLETATO | Fatta la tessera, entri in myFITP: |
| F | 15,94–24,84 | myFITP: tessera aggiunta → Tornei → FITP eSeries by BMW → REGISTRATI → conferma → SEI ISCRITTO → notifica del match; un tocco ogni ~1,7 s | 01 LA TUA TESSERA · 02 SCEGLI IL TORNEO · 03 ISCRIVITI · 04 SEI IN GARA | scegli il torneo, iscriviti e mettiti alla prova |
| G | 24,84–29,06 | VS MARCO contro LUNA.SPIN (la sfida del tabellone), scambio, GAME · SET · MATCH, coppa, MARCO esulta | VS · GAME · SET · MATCH · WIN | per diventare il migliore. |
| H | 29,06–37,03 | Benefit Tesserati sbloccati dopo il primo torneo; pass GRANDI EVENTI FITP con sconti ed eventi; poi i quattro riquadri degli altri vantaggi | FINO AL -10% sui biglietti* · -5% sugli abbonamenti* · Internazionali BNL d'Italia · BNL Italy Major Premier Padel · Davis Cup Final 8 · Nitto ATP Finals · Competizioni ufficiali · Loyalty program FITP · Sconti partner · SuperTennis+ gratis; nota legale | In più, sconti sui grandi eventi FITP, loyalty program, vantaggi dei partner e SuperTennis+ gratis. |
| I | 37,03–45,00 | I vantaggi rientrano nella tessera; tessera a sinistra, claim a destra, poi la CTA; loghi piccoli centrati | Vivi il gaming da protagonista · RICHIEDI ORA LA TESSERA eSPORTS FITP | Vivi il gaming da vero protagonista. Richiedi ora la tessera eSports FITP. |

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
