# Spot TESSERA eSPORTS FITP 2027 · testo per il voice over (v5, 30 s)

BOZZA da validare. Tempi sulla versione `video/spot_tessera_2027_v5_30s_16x9_musica.mp4` (musica originale, senza voce).
La voce completa quello che è scritto a schermo e non lo ripete: il testo a schermo dà l'informazione, la voce dà il tono e il perché.
L'unica eccezione voluta è la CTA finale, dove claim e sito vanno detti.

Tono: giovane, energico e naturale, con un sorriso nella voce. Mai urlato e mai "da televendita".

| Entra a | Scena | A schermo | Voce | Durata max |
|---|---|---|---|---|
| 0:00,7 | A · Gioco | gameplay reale, barra XP, «OGNI COLPO CONTA» | Giochi a Tennis Clash? Allora sai cosa vuol dire salire di livello. | 3,4 s |
| 0:05,2 | B · Level up | LEVEL UP · LIVELLO 30 | *(nessuna voce: impatto musicale)* | – |
| 0:07,4 | C · Mondo | «ENTRA NEL MONDO eSPORTS FITP» → logo FITP eSeries by BMW | Il prossimo livello? Quello vero. | 2,0 s |
| 0:11,1 | D · Competizione | card: tornei online · finali live ai grandi eventi · montepremi | Sfidi i migliori player d'Italia, fino al palco dei grandi eventi. | 3,9 s |
| 0:16,7 | E · Tessera | «OTTIENI LA TESSERA eSPORTS FITP» → vantaggi | Il tuo pass è la tessera eSports FITP. Con vantaggi anche fuori dal gioco. | 3,9 s |
| 0:21,6 | F · myFITP | «TUTTO PARTE DA myFITP», tocco su REGISTRATI | Richiedila su myFITP e sei subito in gara. | 2,3 s |
| 0:25,7 | G · CTA | «VIVI IL GAMING DA PROTAGONISTA» · ISCRIVITI ORA · esports.fitp.it | Vivi il gaming da protagonista. Iscriviti ora su esports.fitp.it. | 3,9 s |

Pronuncia: "eSports" si legge *i-sports*, "myFITP" si legge *mai-fitp*, e il sito si legge "esports punto fitp punto it".

Per la registrazione servono un file per scena (`a.wav`, `c.wav` … `g.wav`) oppure un file unico da dividere sulle pause.
`codice/retime.py` riallinea le scene alla voce, ma può solo allungarle: se una frase sfora la durata max, lo spot supera i 30 s.
Con i 30 s fissi, conviene accorciare la frase.
La musica (`codice/audio/build.py`) è già abbassata nelle finestre della voce. Dopo la registrazione basta rifare il mix.

## Da verificare prima della registrazione
- **F**: "Richiedila su myFITP" presuppone che la tessera si richieda da myFITP. Se il flusso reale è un altro (per esempio dal sito), la frase diventa "Poi su myFITP sei subito in gara."
- **D**: "i migliori player d'Italia" è una formula promozionale, non una statistica. Senza anglicismo: "Sfidi i migliori d'Italia, fino al palco dei grandi eventi."
- **A**: nominare Tennis Clash va bene solo se WildLife ha dato l'ok all'uso del marchio nello spot.
