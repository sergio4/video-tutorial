# Spot TESSERA ESPORTS FITP 2027 · piano v8

BOZZA · 16:9 · **30 s** (64 battute a 128 BPM) · musica originale continua, voce da registrare.
Le modifiche della v7 sono descritte in `REPORT_MODIFICHE_v7.md`; la v8 ne mantiene tutte le scene, con un ritmo più serrato.

## Scene

| # | Tempo | Cosa succede | Testi a schermo |
|---|---|---|---|
| 01 | 0,00–4,22 | Smartphone 3D quasi frontale con il gameplay reale (il punto vinto cade a 4,0 s); testo insieme al telefono | «SEI PRONTO / A DIVENTARE / IL PROSSIMO / CAMPIONE / ESPORTS?» |
| 02 | 4,22–5,63 | La pallina esce dallo schermo: impatto, LEVEL UP | LEVEL UP |
| 03 | 5,63–7,03 | Transizione: rimbalzo, nasce il logo | «ENTRA NEL MONDO / ESPORTS FITP» · logo eSports FITP sotto |
| 04 | 7,03–12,19 | Tre card; la pallina le colpisce; passaggio fra le card di 0,28 s | «TORNEI ONLINE, / SETTIMANALI E MENSILI» · «QUALIFICATI ALLE / FINALI LIVE / DURANTE I GRANDI EVENTI» · «OLTRE / 20.000 EURO / DI MONTEPREMI IN PALIO» |
| 05a | 12,19–14,54 | La tessera come carta da gioco: sale dal basso girando, si posa fluttuando con riflesso olografico, alone e raggi; la pallina la accende | «RICHIEDI LA TESSERA E-SPORTS» · «IL PASS PER ACCEDERE AI TORNEI UFFICIALI» |
| 05b | 14,54–17,81 | Quattro riquadri illustrati toccati dalla pallina | «SCOPRI TUTTI I VANTAGGI» · SCONTI SUI GRANDI EVENTI · OGGETTI ESCLUSIVI SU TENNIS CLASH · LOYALTY PROGRAM · ACCESSO A SUPERTENNIS+ · nota legale |
| 06 | 17,81–22,03 | myFITP scorre veloce: download → home → menu → elenco tornei → torneo → REGISTRATI → SEI ISCRITTO | «Scarica myFITP / e iscriviti ai / prossimi tornei» |
| 07 | 22,03–25,31 | VS, scambio, GAME · SET · MATCH, coppa, WIN | VS · GAME · SET · MATCH · WIN |
| 08 | 25,31–30,00 | Tessera a sinistra, colonna centrata a destra; la pallina colpisce il pulsante | «Vivi il gaming / da protagonista» · «RICHIEDI ORA LA TESSERA ESPORTS FITP» · esports.fitp.it · loghi |

## Musica (`codice/audio/build.py` → `out/musica_v8.wav`)
- **Intro (0–4,2 s):** ostinato che si apre, con kick smorzato dal primo battere.
- **Groove (dal level up alla fine):** un solo groove continuo, senza pause e senza abbassamenti automatici. L'energia sale con filtro e strati, c'è un colpo sul pulsante della CTA e l'accordo finale occupa l'ultima battuta.
- Il livello resta costante fra −15 e −14 dB per tutto il groove; il mix è a −14 LUFS.
- La musica non si abbassa sotto la voce: il ducking si farà nel mix finale con la voce registrata.

## Da verificare
- **Titolo a 0:12**, «RICHIEDI LA TESSERA E-SPORTS»: grafia diversa da TESSERA ESPORTS FITP.
- **Montepremi e sconti 2027.**
- **Oggetti esclusivi su Tennis Clash:** ok di WildLife.
- **Sezione eSports di myFITP:** da confermare.
- **Diritti** su foto, personaggi e gameplay; licenza Glancyr.
