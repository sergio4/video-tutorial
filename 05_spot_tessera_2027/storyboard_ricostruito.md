# Spot Tessera eSports FITP 2027 · storyboard ricostruito e regia

BOZZA · 16:9 · 30 s · versione visiva senza audio, pronta per il voice over.

Fonte del contenuto: storyboard «Spot Tesseramento eSports 2027» di Next Different (PDF, 10 scene numerate 1-7 e 10-12: **le scene 8 e 9 non sono nel documento**). Fonte dello stile: la v4 motion (`04_motion/`). Il PDF non è nel repository: è materiale dell'agenzia.

## Struttura narrativa

Tre movimenti: **ambizione** (tutti vogliono vincere, solo i migliori salgono di livello) → **percorso** (tessera, tornei ufficiali, vittoria, vantaggi) → **identità** (atleta federale, richiedi la tessera, «vivi il gaming da protagonista»).

## Scene, messaggio, resa

| # | Storyboard | V.O. | Resa cinematografica | Raccordo con la scena dopo |
|---|---|---|---|---|
| 1 | Personaggi di Tennis Clash che si preparano al servizio | Tutti i giocatori puntano alla vittoria | Carrellata laterale veloce su una fila di campi notturni: quattro giocatori (sagome in controluce con luce di bordo neon) palleggiano e lanciano; la camera sosta su ciascuno e frusta al successivo | La camera arriva sul protagonista mentre lancia la palla |
| 2 | Focus sul protagonista, barra di caricamento che si riempie | ma solo i migliori passano al livello successivo | Bullet-time: il tempo si ferma sul lancio, la camera gira attorno al protagonista, linee di velocità; LEVEL UP e barra a 8 segmenti che scattano fino al 100% | Il colpo di servizio: lampo, la barra piena… |
| 3 | Compare la tessera FITP | Diventa un atleta FITP | …si apre nella Tessera eSports FITP (arte ufficiale), cornice neon sfalsata, «2027» gigante dietro | La tessera gira su se stessa… |
| 4 | Interfaccia myFITP: come iscriversi a un torneo | Partecipa ai tornei ufficiali eSports | …e diventa il tablet con il sito del circuito: «Partecipa ai FITP eSeries by BMW», Tesserati ora | La pagina scorre |
| 5 | Le schermate continuano | e mettiti alla prova | Tornei GP365 #3 e #4, tap su «Iscriviti ora su myFITP» → ISCRITTO ✓ | La camera entra nel pulsante |
| 6 | Il protagonista solleva una coppa | per diventare il migliore | Una scia disegna al neon la coppa con le racchette incrociate; la camera arretra: la coppa è tra le mani del protagonista, in controluce davanti all'insegna WIN, skyline e coriandoli | Un coriandolo diventa… |
| 7 | Biglietto: sconti sui grandi eventi | In più, approfitta degli sconti esclusivi dedicati ai tesserati | …il biglietto GRANDI EVENTI (tagliando «Sconti tesserati») sopra uno stadio notturno | Il tagliando si strappa: fessura di luce |
| 10 | Il protagonista entra nello stadio verso gli avversari | Scendi in campo da atleta federale | Uscita dal tunnel nella luce dei fari: protagonista di spalle con il logo eSports sulla maglia, quattro avversari schierati (tennis e padel), FITP gigante sopra lo stadio | La camera entra nel logo sulla schiena… |
| 11 | Cartello finale con la tessera fisica | Richiedi ora la tessera eSports FITP | …che diventa lo stesso logo sulla tessera: la carta arretra fino al cartello, con le cornici neon | Il cartello resta |
| 12 | Super con keyvisual e logo FITP | SUPER e V.O.: e vivi il gaming da vero protagonista | Super «Vivi il gaming da protagonista» sulla tessera, pennellata ciano-magenta, logo FITP | Fine |

## Voice over: dove entra

Tempi sulla timeline attuale (30 s, griglia 128 BPM). Le durate delle frasi sono stime a ritmo sostenuto.

| Scena | Inizio | Fine | V.O. entra | V.O. (stima) | Testo |
|---|---|---|---|---|---|
| 1 | 0.00 | 3.75 | 0.35 | 2.3 s | Tutti i giocatori puntano alla vittoria, |
| 2 | 3.75 | 7.50 | 3.90 | 2.8 s | ma solo i migliori passano al livello successivo. |
| 3 | 7.50 | 9.38 | 7.60 | 1.5 s | Diventa un atleta FITP. |
| 4 | 9.38 | 12.18 | 9.53 | 2.2 s | Partecipa ai tornei ufficiali eSports |
| 5 | 12.18 | 14.08 | 12.28 | 1.3 s | e mettiti alla prova |
| 6 | 14.08 | 17.78 | 14.18 | 1.5 s | per diventare il migliore. |
| 7 | 17.78 | 21.53 | 17.98 | 3.4 s | In più, approfitta degli sconti esclusivi dedicati ai tesserati. |
| 10 | 21.53 | 24.83 | 21.83 | 2.2 s | Scendi in campo da atleta federale. |
| 11 | 24.83 | 27.23 | 24.93 | 2.2 s | Richiedi ora la tessera eSports FITP |
| 12 | 27.23 | 30.00 | 27.28 | 2.3 s | e vivi il gaming da vero protagonista. |

Pause volute: dopo la scena 6 (circa 2 s di coppa e coriandoli senza voce, il momento emotivo) e prima del super finale.

**Sincronie da rispettare:** «livello successivo» con la barra che arriva al 100%; «Diventa un atleta FITP» con la tessera che si apre; «mettiti alla prova» con il tap; «il migliore» con la coppa; «Richiedi ora la tessera» con il cartello; il super con «vivi il gaming».

## Adattarlo alla voce registrata

Ogni scena ha una durata in `codice/timeline.json` e tutte le animazioni interne sono agganciate all'inizio e alla fine della propria scena: cambiando le durate il video si riallinea da solo.

1. Mettere una frase per file in una cartella: `s1.wav`, `s2.wav` … `s12.wav` (anche m4a o mp3).
2. `python retime.py cartella/` mostra le durate nuove, `python retime.py cartella/ --scrivi` le applica (minimo per ogni scena, arrotondamento al mezzo beat).
3. Rifare il render e unire l'audio (`render.py --audio`).

Se la voce arriva in un file unico, la divido io sulle pause.

## Da decidere

- **Scene 8 e 9 mancanti nel PDF**: se esistono vanno aggiunte (la timeline accetta scene nuove).
- **Personaggi**: lo storyboard mostra personaggi 3D di Tennis Clash; qui sono sagome in controluce coerenti con la v4 (nessun asset di gioco disponibile). Con i render ufficiali dei personaggi forniti da WildLife si possono sostituire le sagome mantenendo camera e tempi.
- **Nomi sul sito**: «FITP eSeries by BMW» e «Torneo GP365 #3/#4» sono presi dallo storyboard.
- **Super finale**: lo storyboard scrive «da protagonista» nel super e «da vero protagonista» nel V.O.; ho seguito lo storyboard.
