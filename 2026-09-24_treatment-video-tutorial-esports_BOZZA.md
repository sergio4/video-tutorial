# «Tocca a te». Treatment del video tutorial eSports FITP

**BOZZA v1 per Sergio Porcelli · 24/09/2026 · non approvata, nessuna produzione avviata**
Formato di lavoro: video animato 45-55 secondi, master verticale 9:16 con adattamento 16:9.

---

## 1. Research summary

### 1.1 Fonti consultate

| # | Fonte | Autorevolezza | Cosa ha dato |
|---|---|---|---|
| F1 | Regolamento Circuito FITP eSeries by BMW 2026, versione giugno 2026 (`WIKI - Esports FITP\raw\Regolamento_Circuito_FITP_eSeries_2026_giu2026.docx`), artt. 1, 2.1, 3.1, 3.2, 3.3, 6.1 | Alta, prevale su tutto | Requisiti, passi tecnici, procedura di iscrizione e avvio incontro |
| F2 | Sito esports.fitp.it, letto dal vivo il 24/09/2026 (sezione «Inizia a giocare» e FAQ 2, 3, 4, 9) | Alta | I 4 passi ufficiali, regola Livello 2 senza tessera, differenza tra livelli |
| F3 | Sito tesseramento-esports.fitp.it, letto dal vivo il 24/09/2026 | Alta | Obbligo di account myFITP prima della tessera |
| F4 | Email Bitkit 27/07 e 29/07/2026 (wiki: `2026-07-27-bitkit-correzioni-sito-tesseramento-inviate`, `2026-07-29-bitkit-rilasci-...`) | Alta | Registrazione myFITP integrata prima del tesseramento dal 23/07, associazione automatica della tessera, campo «Tennis Clash ID» |
| F5 | Thread Bitkit 04-10/09/2026 (wiki: `2026-09-04-bitkit-bug-sito-tesseramento-supertennis-rename`) | Media | Punti ancora aperti: Player ID automatico, popup Loyalty, localizzazione EN, caricamento lento |
| F6 | Tre registrazioni schermo myFITP 1080x2340 (06/02/2026 build TEST; 12/09/2026 e 18/09/2026 produzione) in `Allegati chat o Microsoft Teams\` e `Microsoft Teams Chat Files\` | Alta per la UI | Etichette reali dei tasti e struttura delle schermate |
| F7 | Wiki: `onboarding-giocatore`, `requisiti-partecipazione`, `player-id`, `tessera-esports-fitp`, `open-cup`, `struttura-circuito`, `myfitp`, `qlash` | Media (sintesi) | Quadro d'insieme e questioni aperte |
| F8 | Wiki: thread rework spot tesseramento BeCloser (20/07, 29/07, 07-09/09/2026) | Media | Decisioni creative già prese e sovrapposizione con questo progetto |
| F9 | Wiki: `stile-grafiche-esports`, `2026-09-18-analisi-visiva-05-brand-media`, `2026-09-16-inventario-asset-06-asset` | Media | Palette, font, loghi, asset disponibili |
| F10 | Post X di @devteamdrew del 22/09/2026, video 32 s, analizzato fotogramma per fotogramma (audio non valutato) | Riferimento creativo | Vedi 1.6 |

### 1.2 Journey reale di un nuovo giocatore

Ricostruito sulle fonti, dall'assenza di qualsiasi account fino al match.

| Passo | Cosa fa il giocatore | Dove | Fonte |
|---|---|---|---|
| **0. Tennis Clash** | Scarica Tennis Clash, fa login, completa il tutorial, gioca da 3 a 5 partite amichevoli, riavvia il gioco. Ottiene così un Player ID. | App Tennis Clash | F1 art. 3.1, F2 |
| **1. Account myFITP** | Scarica l'app myFITP e crea l'account personale. | App myFITP (o fitp.it) | F2, F3 |
| **2. Tessera E-Sports FITP** | Richiede la tessera: € 10/anno, età minima 12 anni, aperta a tutto il mondo. Il sito chiede prima l'accesso a myFITP; dal 23/07 la tessera si associa da sola al profilo. | tesseramento-esports.fitp.it | F3, F4, wiki `tessera-esports-fitp` |
| **3. Collegamento Player ID** | Il Player ID di Tennis Clash va associato al profilo myFITP. Se si arriva da Tennis Clash il GUID passa in automatico nel link; altrimenti si inserisce nel campo «Tennis Clash ID» (accetta GUID o link). | Link da Tennis Clash, oppure modulo tesseramento | F1 art. 2.1c, F4 |
| **4. Sezione eSports** | Apre myFITP, entra nella sezione eSports (icona centrale con la pallina nella barra in basso): schede «Tornei» e «Leaderboard», filtri «Disponibili / In corso / Completati». | App myFITP | F1, F6 |
| **5. Scelta del torneo** | Sceglie un torneo del proprio livello (Livello 4 o Livello 10, secondo il livello massimo di campioni e carte) e apre la scheda: informazioni, «Partecipanti», «Tabellone/Round», «Regolamento», «Come giocare». | App myFITP | F2 FAQ 4, F6 |
| **6. Iscrizione** | Tocca il tasto di iscrizione nella pagina del torneo, entro la scadenza della scheda tecnica. | App myFITP | F1 art. 3.2 |
| **7. Giorno del torneo** | Se richiesto fa il check-in (tasto attivo da un'ora prima dell'inizio), conferma la presenza («SONO PRONTO A GIOCARE», 5 minuti di tempo), poi avvia l'incontro («VAI AL TUO MATCH», altri 5 minuti). Chi non rispetta i tempi perde l'incontro. | App myFITP | F1 art. 3.3, F6 |
| **8. Tennis Clash, il match** | Il tasto apre direttamente Tennis Clash sulla partita del torneo (deeplink). Si gioca. | App Tennis Clash | F1, wiki `2026-09-17-technical-issue-...` |
| **9. Risultato** | Il risultato torna in automatico su myFITP («VITTORIA», «VAI ALLA PROSSIMA PARTITA»), senza nulla da comunicare a mano. | App myFITP | F1 art. 6.1, F6 |

**Passaggi obbligatori:** Tennis Clash con Player ID, account myFITP, Tessera E-Sports FITP (per Livello 4, Livello 10 e per IBI eSeries e Nitto ATP Finals eSeries), Player ID collegato, iscrizione, conferma presenza e avvio match nei tempi.

**Passaggi opzionali o condizionali:** check-in (solo «qualora richiesto» dalla scheda tecnica); inserimento manuale del Tennis Clash ID (solo se il collegamento non è già avvenuto); consultazione di Partecipanti, Tabellone, Regolamento, Leaderboard.

**Passaggi da non mostrare:** prezzo e benefit della tessera (Sergio il 20/07: niente percentuali di sconto, più competizione e meno benefit); dati anagrafici del modulo (codice fiscale, provincia di nascita); popup Loyalty Program; schermate di caricamento; regole di formato (Swiss Round, RR, Bo3); vincolo dei qualificati Livello 10.

### 1.3 Discrepanze tra il journey del brief e la documentazione

| # | Nel brief | Nella documentazione | Proposta |
|---|---|---|---|
| D1 | Tennis Clash è l'ultimo passo | È il **primo**: senza Player ID e senza le 3-5 amichevoli non si gioca nessun torneo (F1 art. 3.1; F2 lo mette al passo 1) | Tennis Clash apre il video e lo chiude. Il protagonista è già un giocatore di Tennis Clash quando lo incontriamo, e il match finale lo riporta lì. Struttura ad anello, la stessa del riferimento. |
| D2 | Prima la tessera, poi myFITP | Il sito tesseramento dice: «Per richiedere la Tessera eSports FITP devi prima accedere al tuo account MyFITP oppure crearne uno» (F3) | Ordine corretto: **myFITP, poi tessera**. Il claim finale cambia di conseguenza (vedi scena 08). |
| D3 | La tessera si fa dentro lo smartphone, in myFITP | La tessera si richiede sul **sito** tesseramento-esports.fitp.it (anche da mobile), non in una schermata dell'app. La home di esports.fitp.it parla ancora di «sezione Tessere di MyFITP», formulazione probabilmente anteriore all'associazione automatica del 23/07. | Nel video la tessera arriva come oggetto fisico e si «aggancia» al profilo, senza mostrare il modulo web. Il dominio compare solo nell'end frame. Da confermare con Bitkit se esiste un percorso interno all'app. |
| D4 | Passaggio assente | **Collegamento del Player ID** a myFITP: requisito formale di partecipazione (F1 art. 2.1c) | Un solo gesto visivo, senza testo: il protagonista stacca il suo cartellino Tennis Clash dallo zaino e lo attacca al profilo. |
| D5 | Dopo l'iscrizione si gioca | Tra iscrizione e gioco ci sono il giorno del torneo, l'eventuale check-in e due tasti a tempo (5+5 minuti) | Salto temporale in un secondo (lancette che girano) e il tasto reale «VAI AL TUO MATCH» diventa la porta verso Tennis Clash. È anche il punto in cui il prodotto funziona davvero così: il tasto apre il gioco. |
| D6 | La tessera serve sempre | I tornei **Livello 2 (Open Cup)** sono aperti a tutti gli utenti myFITP anche senza tessera, senza punti né premi (F2 FAQ 3 e 4) | Il video racconta il percorso completo verso il circuito (Livello 4 e 10) e non cita il Livello 2. Decisione tua: tenerlo fuori (consigliato, messaggio più pulito) o aggiungere un super «Vuoi provare? Open Cup Livello 2, anche senza tessera». |
| D7 | Scegli il torneo e iscriviti come due passi | Nel prodotto sono un unico gesto continuo sulla stessa pagina | Diventano un solo numero a schermo («Iscriviti a un torneo»); la scelta resta come gesto, senza super. |

### 1.4 Criticità

- **Prodotto ancora instabile in alcuni punti.** Bug deeplink con match bloccato dopo il check-in (16/09, caso Samuel Sanin, WildLife senza diagnosi); caricamenti lunghi (registrazione 18/09; sito tesseramento a 13-14 secondi il 09/09); popup Loyalty solo in italiano che blocca chi apre l'app; B2C login in italiano anche per gli stranieri. Un tutorial che promette «è tutto qui» deve uscire quando questi punti sono chiusi, altrimenti genera ticket su esports@fitp.it.
- **Player ID automatico nel tesseramento:** Bitkit ne ha confermato il rilascio il 29/07, ma l'08/09 compare di nuovo tra i punti aperti. Non si sa se oggi funziona end-to-end.
- **Sovrapposizione con lo spot BeCloser.** Il rework dello spot tesseramento ha consegna al 25/09, con la scena di iscrizione da myFITP su smartphone e una proposta di personaggio AI originale (Valentina: no se costa di più). Due video FITP usciti a poche settimane di distanza, entrambi con un personaggio inventato e la stessa scena di iscrizione, rischiano di confondersi. Serve una scelta di ruolo: lo spot vende la voglia, questo video insegna il come.
- **IP Tennis Clash.** Qualunque uso di gameplay e campioni va validato da WildLife (Sergio il 02/07: nessun problema di principio, validazione finale consigliata). Mischiare un personaggio non Tennis Clash dentro il gioco è una novità da far approvare prima di produrre.
- **Privacy nelle registrazioni.** Le registrazioni del 12/09 mostrano nomi reali di giocatori (leaderboard e partecipanti). In produzione servono dati di prova.

### 1.5 Informazioni non verificabili oggi

- Etichetta attuale del tasto di iscrizione in app: il regolamento dice «registrati», il sito usa «ISCRIVITI ORA»; nessuna delle tre registrazioni mostra la schermata.
- Aspetto attuale della schermata di check-in in produzione (visto solo il testo che la spiega).
- Dove si trova, dentro Tennis Clash, il link verso myFITP che passa il Player ID (esiste secondo F4, non l'ho visto).
- Decorrenza della tessera: l'unico caso documentato (20/09) mostra validità fino al 31/12/2026, quindi forse anno solare, ma non è scritto da nessuna parte.
- Se il campo in-game «SuperTennis Arena» sarà aggiornato dopo il cambio di nome in SuperTennis+.
- Obblighi contrattuali di presenza del logo BMW in un video che parla di eSports FITP in generale.

### 1.6 Il riferimento creativo (post X @devteamdrew, 22/09/2026)

Sono riuscito ad aprire il video (32 secondi, 1920x1080, didascalia «Made with @claudeai Opus 5.5») e a campionarlo un fotogramma al secondo. L'audio non l'ho potuto valutare.

Cosa succede:

- **0-6 s, fuori.** Un personaggio minimo (un blocchetto arancione con due puntini per occhi e quattro zampette) cammina su un foglio color carta, con tratteggio a mano e linea che vibra. Raggiunge un microscopio e ci guarda dentro.
- **6-7 s, la lente.** Primo piano dell'oculare: dentro c'è già un altro mondo. La camera ci entra.
- **7-27 s, dentro.** Un'unica discesa senza tagli attraverso le scale: cellula, cubo, reticolo cristallino, atomi, orbitali, particelle, campo di stelle, interferenza della doppia fenditura, curve, nastro di Möbius, ipercubo. Ogni forma nasce dalla precedente, circa un secondo per passaggio, ritmo in crescendo. Il registro cambia di colpo: fondo blu notte e viola, luci al neon rosa, ciano e giallo.
- **27-30 s, ritorno.** La camera torna indietro attraverso il cerchio bianco dell'oculare; da dentro vediamo la sagoma del personaggio disegnata a tratto, che guarda. Poi usciamo dall'oculare.
- **30-32 s, anello chiuso.** Siamo di nuovo nella prima inquadratura. Il personaggio si gira verso di noi e sorride (occhi ad archetto).

Cosa prendere, senza copiarne lo stile:

1. **Un oggetto quotidiano fa da lente.** Lì il microscopio, qui lo smartphone.
2. **Due registri visivi netti**, uno caldo e disegnato fuori, uno scuro e luminoso dentro. Coincidenza utile: il «dentro» del riferimento usa già viola, rosa e ciano, cioè la palette ufficiale eSports FITP (#311A60, #F608BE, #00FFFF).
3. **Il personaggio è l'ancora**: resta identico mentre tutto intorno si trasforma.
4. **Nessun taglio visibile.** Ogni forma è l'inizio della successiva.
5. **Chiusura ad anello** con uno sguardo in camera: il gesto finale restituisce il racconto allo spettatore.
6. **Zero testo.** Il nostro caso ha bisogno di quattro parole a schermo; il riferimento dice di tenerle poche e grafiche.

Una deduzione, non verificata: la didascalia fa pensare a un'animazione scritta in codice con un modello linguistico, più che generata da un modello video. Ha un peso sul piano di produzione (sezione 9).

---

## 2. Creative concept

**Titolo:** «Tocca a te»

In italiano «tocca a te» vuol dire due cose: è il tuo turno (al servizio, in partita) e tocca lo schermo. Il video è fatto di tocchi, e finisce passando il turno a chi guarda. In inglese: «Your serve».

**Idea centrale.** Lo smartphone è la lente. Fuori c'è il tennis di tutti i giorni, disegnato a mano su carta color terra rossa. Dentro c'è il mondo eSports FITP, viola e al neon. Il protagonista entra dallo schermo, attraversa myFITP, prende la tessera, si iscrive, e il tasto del match lo spara dentro Tennis Clash. Quando la camera torna indietro, siamo di nuovo sulla panchina da cui era partito, con il telefono in mano. Solo che adesso sta giocando un torneo ufficiale.

**Logline.** Un piccolo tennista dai capelli rossi, stufo delle amichevoli, segue una pallina al neon dentro lo schermo del telefono e in cinquanta secondi arriva a giocare il suo primo torneo federale.

**Tono.** Sveglio, veloce, un filo ironico. Una cosa che si guarda due volte perché la seconda volta si notano i dettagli (le tre tacche di gesso sulla panchina, il cartellino che si attacca da solo). Mai didascalico, mai infantile.

**Ruolo del protagonista.** È il giocatore che siamo noi, con un vantaggio: non esita. Non spiega niente, fa. La sua unica battuta all'inizio è un invito («Vieni»), e il suo sguardo finale in camera passa il turno.

**Messaggio principale.** Entra in myFITP, tesserati, iscriviti a un torneo, gioca su Tennis Clash. Il sottotesto: il circuito ufficiale sta nel telefono che hai già in tasca.

**Perché funziona come tutorial.**
- L'ordine dei passi è lo stesso del prodotto, e ogni passo è un luogo diverso del viaggio: la memoria spaziale aiuta a ricordare la sequenza meglio di un elenco.
- Quattro numeri a schermo, quattro verbi, niente altro. Il resto lo porta l'azione.
- La UI reale compare nei tre momenti in cui l'utente deve riconoscere dove toccare: la sezione eSports con i tornei, il tasto di iscrizione, «VAI AL TUO MATCH». Il resto è racconto.
- L'anello mostra che si parte e si arriva in Tennis Clash, cioè nel posto dove il target primario sta già.
- Il finale «è tutto qui, tocca a te» risponde alla domanda «cosa devo fare per iniziare?» e restituisce la mossa a chi guarda.

---

## 3. Storyboard

Durata totale 52 secondi. Master 9:16 (1080x1920); ogni inquadratura tiene l'azione dentro un'area centrale 1:1 per ricavare il 16:9 senza perdere nulla. Direzione di movimento costante: sempre in avanti, dentro lo schermo; l'unica uscita è il ritorno finale.

### Scena 01 · Discovery · 00:00-00:05

- **Ambiente:** circolo di tennis disegnato su carta calda. Campo in terra rossa, linee di gesso, rete, una panchina di legno. Tratteggio a mano, linea che vibra leggermente.
- **Protagonista:** seduto sulla panchina, gioca a Tennis Clash sul telefono. Sul bordo della panchina tre tacche di gesso (le amichevoli fatte: dettaglio per chi guarda due volte). Sbuffa, annoiato. Una pallina rosa al neon esce dallo schermo, rimbalza due volte sulla terra rossa e torna verso il telefono. Lui la segue con gli occhi, alza un sopracciglio, guarda in camera.
- **Camera:** campo medio frontale, fermo, poi lieve carrello avanti al rimbalzo della pallina.
- **Animazione:** personaggio a 12 fotogrammi al secondo (disegno a passo due), pallina fluida a 25 con scia luminosa.
- **UI:** sul telefono si intravede Tennis Clash (gameplay reale, piccolo, riconoscibile dai colori del campo).
- **Testo a schermo:** nessuno.
- **Voice-over (versione A):** il protagonista, in camera: «Vuoi giocare sul serio? Vieni.»
- **Sound:** ambiente del circolo (uccelli lontani, un palleggio), il «pock» della pallina amplificato, due note di musica che partono sul secondo rimbalzo.
- **Transizione → 02:** **T1 La lente.** Il protagonista si tuffa verso il telefono; la camera lo segue e attraversa lo schermo. Nel passaggio la carta calda si strappa in diagonale e rivela il viola.

### Scena 02 · Entra in myFITP · 00:05-00:12

- **Ambiente:** dentro lo schermo. Un grande spazio viola notte con bokeh rosa e ciano; al centro, alta come un edificio, la schermata reale di myFITP (header blu con il logo, barra in basso).
- **Protagonista:** atterra in piedi davanti all'app. La pallina guida si infila nel logo myFITP e si accende l'header. Lui «entra» con un passo: la schermata si piega intorno a lui come una porta scorrevole (account creato, senza mostrare il modulo). Poi stacca dallo zaino un cartellino da bagaglio con il suo codice Tennis Clash e lo schiaffa sul profilo: il cartellino si attacca con uno scatto magnetico. Occhiolino.
- **Camera:** carrello laterale che accompagna la camminata, poi piccolo scatto di zoom sul cartellino.
- **UI:** header myFITP reale e barra di navigazione reale. Il profilo è una rappresentazione semplificata dell'avatar utente (in alto a sinistra nell'app reale), non una schermata inventata.
- **Testo a schermo:** «1 · ENTRA IN MYFITP»
- **Voice-over (A):** «Si parte da qui.»
- **Sound:** tap sull'interfaccia = suono di pallina colpita («pock»), la firma sonora del video. Clic metallico del cartellino.
- **Transizione → 03:** **T2 La pallina guida.** La pallina rimbalza fuori dal profilo verso l'alto; seguendola, la camera sale e dall'alto scende la tessera.

### Scena 03 · Tesserati · 00:12-00:19

- **Ambiente:** stesso spazio viola, più profondo. Linee al neon diagonali (grammatica della campagna tesseramento).
- **Protagonista:** la Tessera E-Sports FITP scende ruotando come una carta da gioco. Lui la afferra al volo. Sul fronte c'è il tennista dipinto della tessera reale: il protagonista lo guarda, ne imita la posa di rovescio con aria seria, poi scrolla le spalle (piccola gag, l'artwork resta intatto). Gira la tessera: il retro blu con il circuito stampato si illumina.
- **Camera:** dal basso verso l'alto mentre la tessera scende, poi inquadratura stretta sulla tessera in mano.
- **UI:** grafica reale della tessera (fronte e retro, layout del 20/07/2026). Nessun modulo web, nessun prezzo.
- **Testo a schermo:** «2 · TESSERATI»
- **Voice-over (A):** «Questa apre tutto.»
- **Sound:** fruscio di carta da gioco, «ding» corto di attivazione quando il retro si accende.
- **Transizione → 04:** **T3 Il circuito diventa strada.** Le piste del circuito sul retro della tessera escono dal bordo della carta, si allungano sul pavimento e corrono verso la barra di navigazione di myFITP, fino a illuminare l'icona centrale con la pallina (la sezione eSports). La camera segue le piste.

### Scena 04 · Scegli il torneo · 00:19-00:25

- **Ambiente:** sezione eSports di myFITP, reale, che diventa pavimento. La lista «Disponibili» scorre sotto i piedi del protagonista come un nastro trasportatore; le card dei tornei sono lastre che gli passano accanto.
- **Protagonista:** cammina sul nastro, guarda le card che scorrono, ne scarta una con un gesto annoiato (troppo presto), si ferma su «FITP eSeries by BMW», Livello 4. La tira fuori dal nastro come si sfila un libro da uno scaffale.
- **Camera:** dall'alto con leggera inclinazione, poi scende all'altezza del personaggio quando sceglie.
- **UI:** reale. Schede «TORNEI / LEADERBOARD», filtri «Disponibili / In corso / Completati», card con immagine, badge di livello, data, posti. Dati di prova, nessun nome reale.
- **Testo a schermo:** nessun numero nuovo (la scelta è un gesto). Al massimo il badge «Livello 4» ingrandito per un attimo.
- **Voice-over (A):** «Questo.»
- **Sound:** ronzio del nastro, «swish» delle card, «pock» sulla scelta.
- **Transizione → 05:** **T4 La card si apre.** La card sfilata si allarga fino a riempire l'inquadratura e diventa la scheda del torneo: nessun taglio, è lo stesso oggetto che cresce.

### Scena 05 · Iscriviti · 00:25-00:31

- **Ambiente:** scheda del torneo reale (immagine di testata, informazioni, tre tasti «Partecipanti / Tabellone / Regolamento», tasto magenta in basso).
- **Protagonista:** corre verso il tasto di iscrizione e ci salta sopra a piedi uniti. Micro-animazione di conferma: il suo avatar vola nella lista «Partecipanti», che si aggiorna (per esempio 7/256 diventa 8/256). Poi le lancette di un orologio disegnato girano velocissime sopra la scheda: è il giorno del torneo. Tocca «SONO PRONTO A GIOCARE» con un dito, senza fermarsi.
- **Camera:** stretta sul tasto, poi scatto indietro per vedere la lista che si aggiorna.
- **UI:** reale. Tasto di iscrizione (etichetta da verificare), contatore dei posti, «SONO PRONTO A GIOCARE».
- **Testo a schermo:** «3 · ISCRIVITI A UN TORNEO»
- **Voice-over (A):** «Fatto.»
- **Sound:** «boing» del salto sul tasto, piccolo coro di conferma (tre note ascendenti), ticchettio accelerato dell'orologio.
- **Transizione → 06:** **T5 Il tasto botola.** Compare «VAI AL TUO MATCH». Mezzo secondo di silenzio totale. Il protagonista lo tocca.

### Scena 06 · Ora si gioca · 00:31-00:35

- **Ambiente:** passaggio da myFITP a Tennis Clash.
- **Protagonista:** il tasto magenta si apre come una botola e lo risucchia. Le pareti blu di myFITP si piegano e diventano il tunnel degli spogliatoi di uno stadio; in fondo al tunnel, luce. Il protagonista viene sparato fuori dal tunnel e atterra in piedi a fondo campo, sul campo FITP di Tennis Clash (SuperTennis Arena, tribune piene, cielo al tramonto).
- **Camera:** soggettiva in caduta, poi uscita dal tunnel con la camera che si ribalta per rivelare il campo dall'alto.
- **Animazione:** il personaggio resta disegnato in 2D sopra il mondo 3D di Tennis Clash, come un ritaglio: il contrasto è voluto e dice «sei entrato in un altro gioco».
- **UI:** gameplay reale di Tennis Clash (campo, pubblico, grafica del gioco). Nessun elemento Tennis Clash ridisegnato.
- **Testo a schermo:** «4 · GIOCA SU TENNIS CLASH»
- **Voice-over (A):** «E adesso si gioca.»
- **Sound:** drop della musica all'uscita dal tunnel; boato del pubblico di Tennis Clash (audio del gioco).
- **Transizione → 07:** **T6 Lo swipe diventa colpo.** Il protagonista traccia con il dito un arco rosso nell'aria; l'arco diventa la traiettoria della pallina e parte lo scambio.

### Scena 07 · Gameplay · 00:35-00:45

- **Ambiente:** match reale di Tennis Clash sul campo FITP.
- **Protagonista:** non gioca al posto del campione di Tennis Clash, lo guida. Ogni suo swipe (scia rossa, in primo piano, sopra l'inquadratura) diventa il colpo del campione. Tre colpi, il terzo è un vincente lungolinea. Esultanza.
- **Camera:** la camera di gioco di Tennis Clash, con due tagli ritmati sulla musica; sull'ultimo colpo un rallenty breve con la palla che attraversa lo schermo.
- **UI:** gameplay reale, eventualmente l'HUD del punteggio di Tennis Clash.
- **Testo a schermo:** nessuno.
- **Voice-over (A):** nessuno, parla il gioco.
- **Sound:** suoni reali di Tennis Clash per i colpi, pubblico, whoosh sulle scie.
- **Transizione:** **T7 Anello.** Sul vincente la camera arretra a velocità crescente: il campo si rimpicciolisce, diventa lo schermo di un telefono, il telefono è nelle mani del protagonista, seduto sulla stessa panchina della scena 01. Stessa inquadratura dell'apertura. Il telefono vibra: sullo schermo compare la schermata reale di myFITP «VITTORIA», con il risultato arrivato da solo.

### Scena 08 · End frame · 00:45-00:52

- **Ambiente:** di nuovo la carta calda e la terra rossa, ma la luce adesso ha un riflesso rosa e ciano che viene dal telefono.
- **Protagonista:** guarda lo schermo «VITTORIA», fa girare il telefono sul dito, si alza, ci guarda. Sorriso. Aggiunge una quarta tacca di gesso sulla panchina, poi indica lo spettatore con la racchetta.
- **Camera:** ferma, frontale, come all'inizio. Leggero carrello indietro per fare spazio alla grafica.
- **Testo a schermo (proposta principale):**
  «ENTRA IN MYFITP. TESSERATI. ISCRIVITI. GIOCA.»
  poi, grande: «Tocca a te.»
  sotto: esports.fitp.it
  Loghi: eSports FITP (principale), FITP, Tennis Clash. Logo FITP eSeries by BMW solo se previsto da contratto (da verificare).
  EN: «JOIN MYFITP. GET YOUR CARD. SIGN UP. PLAY.» · «Your serve.»
- **Variante corta:** solo i quattro verbi e il dominio, senza «Tocca a te», se la versione deve stare sotto i 45 secondi.
- **Perché cambio il claim del brief:** «Tesserati. Entra in myFITP» ripete l'ordine sbagliato (discrepanza D2). I quattro verbi nell'ordine giusto fanno da riassunto del tutorial, e «Tocca a te» chiude il gioco di parole del titolo.
- **Voice-over (A):** «È tutto qui. Tocca a te.»
- **Sound:** la musica si chiude su un colpo secco di racchetta; ultimo «pock» sul dominio.
- **Transizione:** la linea di gesso tracciata dal protagonista diventa la pennellata rosa-ciano che sottolinea «Tocca a te» (**T8 Il gesso diventa pennellata**). Fine.

---

## 4. Character design

**Nome di lavoro:** Ciuffo (solo per la produzione; nel video non ha nome).

| Voce | Definizione |
|---|---|
| **Età percepita** | 14-16 anni. Abbastanza grande da stare nel target (tessera da 12 anni), abbastanza giovane da piacere anche ai più piccoli. Mai un bambino. |
| **Proporzioni** | Circa tre teste di altezza: testa grande, busto corto, gambe lunghe e sottili, piedi grandi nelle scarpe. Silhouette leggibile anche a 80 pixel di altezza. |
| **Volto** | Tondo. Occhi a puntino con un sopracciglio a trattino ciascuno (le sopracciglia fanno quasi tutta la recitazione). Naso assente o un piccolo segno. Bocca a una linea che si apre solo per esultare o parlare. Lentiggini leggere, tre per guancia. |
| **Capelli** | Il segno distintivo. Rosso acceso (#E0432B circa), un ciuffo unico e alto a forma di fiamma che fa da indicatore emotivo: dritto quando è carico, piegato quando è deluso, trascinato all'indietro nelle accelerazioni. Nelle scene veloci lascia una scia. |
| **Outfit** | Polo bianca da tennis con colletto, pantaloncini viola notte (#311A60, colore del brand), calzini bianchi, scarpe da tennis grosse e bianche. Polsino bicolore rosa e ciano (#F608BE e #00FFFF), l'unico richiamo esplicito al mondo eSports. Zaino da tennis con il manico della racchetta che spunta. Il cartellino Tennis Clash appeso allo zaino (scena 02). |
| **Palette** | Rosso capelli, bianco, viola notte, pelle chiara neutra, accenti rosa e ciano nel solo polsino. Deve staccare sia sul crema della carta sia sul viola del «dentro». |
| **Linea** | Contorno scuro (#2B2233) di spessore costante, leggermente vibrante (effetto disegnato a mano), ombre a tratteggio incrociato come nel mondo «fuori». Resta 2D e piatto anche dentro myFITP e dentro Tennis Clash. |
| **Animazione** | 12 fotogrammi al secondo (a passo due) per il personaggio, 25 per camera ed effetti. Molto squash and stretch nei salti, anticipazione marcata prima di ogni azione, pose chiare a ogni battuta musicale. Camminata con molleggio, corsa a gambe tese. |
| **Personalità** | Curioso, impaziente, sveglio. Ironico ma mai sbruffone: si prende in giro da solo (la gag della posa sulla tessera). Non esita mai davanti a un tasto: è questo il messaggio che porta. |
| **Espressioni (set minimo)** | 1. annoiato (apertura) · 2. incuriosito, sopracciglio alzato · 3. determinato · 4. furbo con occhiolino · 5. sorpreso a bocca aperta (botola) · 6. esultanza · 7. sorriso in camera (chiusura). |
| **Da evitare** | Somiglianza con i campioni di Tennis Clash (la distanza stilistica protegge l'IP e rende chiaro chi è chi); tratti realistici; occhi grandi da anime; qualunque logo sui vestiti. |

Nota di coerenza: il personaggio deve sopravvivere a un test semplice, cioè essere riconoscibile in silhouette nera. Ciuffo più zaino più racchetta danno una forma unica.

---

## 5. Visual direction

**Stile.** Animazione 2D disegnata, semi-cartoon, dentro un mondo a strati: carta disegnata fuori, neon grafico dentro, 3D reale di Tennis Clash in fondo al viaggio. Il personaggio 2D attraversa tutti e tre i livelli senza cambiare.

**I tre mondi.**

| Mondo | Palette | Luce | Texture | Regola |
|---|---|---|---|---|
| **Fuori** (circolo) | crema carta (#F3EDE2 circa), terra rossa (#C65A2E circa), inchiostro (#2B2233), verde siepe spento | diurna, piatta, calda | grana della carta, tratteggio, gesso | tutto disegnato, niente gradienti |
| **Dentro** (mondo eSports e myFITP) | viola #311A60, rosa #F608BE, ciano #00FFFF, bianco (guideline eSports FITP) più il blu reale di myFITP e il magenta dei suoi tasti | notturna, neon, bokeh | linee diagonali, tratto a pennello, riflessi | la UI reale non si ricolora; il mondo intorno sì |
| **Tennis Clash** | quella del gioco (campo FITP: blu, viola, tramonto) | quella del gioco | quella del gioco | non si ritocca nulla |

**Composizione.** Verticale, personaggio sul terzo inferiore, UI sui due terzi superiori quando serve leggerla. Nei momenti di lettura (scene 04 e 05) la UI occupa almeno il 60% dell'altezza, ferma per almeno 1,2 secondi, perché l'occhio deve riconoscerla.

**Camera.** Una sola camera virtuale per tutto il video. Movimenti sempre motivati da un'azione del personaggio o dalla pallina guida. Profondità in avanti per entrare, arretramento per uscire. Nessuno stacco secco, salvo i due tagli ritmati del gameplay, che sono il linguaggio del gioco.

**Motion language.** Easing marcati (partenza lenta, arrivo con piccolo rimbalzo), anticipazione sulle transizioni, micro-rimbalzi sui tasti quando vengono toccati. Ogni tocco ha un'onda circolare che richiama l'impatto della pallina.

**Tipografia.** Glancyr (font del brand, licenza commerciale da verificare), maiuscolo per i passi numerati, corpo molto grande, un solo super alla volta, massimo cinque parole. Numero in ciano, testo in bianco, pennellata rosa-ciano sotto la parola chiave dell'end frame. Stessa grammatica della campagna tesseramento.

**Trattamento UI.** Schermate reali registrate da myFITP in produzione con un account e un torneo di prova, messe in scena in 2.5D (leggera prospettiva, ombra, profondità) ma mai ridisegnate o modificate nel contenuto. Tre schermate da leggere (lista tornei, scheda torneo con tasto di iscrizione, «VAI AL TUO MATCH»), le altre solo di passaggio.

**Rapporto reale-digitale.** Il personaggio disegnato tocca la UI vera e il gioco vero, come un ritaglio di carta appoggiato su uno schermo. È la metafora del video: una persona qualunque che entra in un sistema ufficiale e ci sta comoda.

---

## 6. Transition system

Una regola per tutte: **ogni transizione è un oggetto che cambia funzione**, mai un effetto applicato sopra l'immagine. L'oggetto ponte è sempre visibile nel fotogramma finale di una scena e nel primo della successiva.

| # | Nome | Da → a | Oggetto ponte | Meccanica |
|---|---|---|---|---|
| T1 | La lente | circolo → mondo eSports | schermo del telefono | la camera entra nello schermo; la carta si strappa in diagonale e rivela il viola |
| T2 | La pallina guida | profilo myFITP → tessera | pallina al neon | la pallina rimbalza e porta lo sguardo; torna in tutto il video come filo conduttore (diventa l'icona eSports nella barra, il punto del badge di livello, il tasto) |
| T3 | Il circuito diventa strada | tessera → sezione eSports | piste del circuito sul retro della tessera | le piste escono dalla carta e diventano il percorso verso l'icona eSports |
| T4 | Il nastro dei tornei / la card che si apre | lista → scheda torneo | card del torneo | la lista diventa pavimento; la card scelta cresce fino a diventare la pagina |
| T5 | Il tasto botola | myFITP → Tennis Clash | tasto «VAI AL TUO MATCH» | il tasto si apre, le pareti blu diventano il tunnel dello stadio; mezzo secondo di silenzio prima |
| T6 | Lo swipe diventa colpo | personaggio → gameplay | scia rossa del dito | il gesto dell'utente vero (lo swipe) diventa la traiettoria della palla |
| T7 | L'anello | Tennis Clash → panchina | schermo del telefono, in senso inverso | la camera arretra, il campo diventa schermo, lo schermo è in mano al protagonista |
| T8 | Il gesso diventa pennellata | panchina → end frame | linea di gesso | la tacca di gesso si allunga e diventa la pennellata del brand sotto «Tocca a te» |

Sei delle otto transizioni lavorano in profondità (avanti per entrare, indietro per uscire); due lavorano in verticale (T2 verso l'alto, T8 in orizzontale). Così l'occhio sa sempre dove sta andando.

---

## 7. Audio direction

**Le due opzioni.**

| | A. Voice-over minimo | B. Narrazione visiva (consigliata) |
|---|---|---|
| Parole | sei battute brevi del protagonista, in tutto circa 20 parole (vedi storyboard) | solo «Vieni» all'inizio, detto dal protagonista, e «Tocca a te» alla fine; il resto sono supers |
| Pro | più calore, il personaggio prende una voce; utile nelle versioni con audio (YouTube, stand, schermi in fiera) | funziona muto (social, dove la maggioranza guarda senza audio), si localizza cambiando solo i supers, non invecchia se cambia un'etichetta |
| Contro | serve una voce giusta (né bambino né adulto), serve una versione per lingua | più carico sui supers, che devono essere perfetti |
| Quando | versione 16:9 per YouTube, sito e stand | master 9:16 e tutte le versioni social |

Proposta: **B come master**, A come variante della versione 16:9. In entrambe la voce è quella del protagonista, mai uno speaker esterno: un narratore che descrive trasformerebbe il racconto in procedura.

**Voce (per A).** Maschile giovane, 15-17 anni percepiti, italiano senza inflessione marcata, tono asciutto e un po' divertito, ritmo rapido. Nessuna enfasi pubblicitaria. Versione inglese con un doppiatore dedicato, non una traduzione letta.

**Musica.** Brano originale o di libreria, 105-110 BPM, elettronica con percussioni leggere e un basso che cresce. Fuori: pochi strumenti, quasi acustico (chitarra pizzicata o marimba). Dentro: entrano synth e percussioni. Drop pieno all'uscita dal tunnel (00:31). Chiusura con un colpo secco.

**Silenzi.**
- 00:30,5-00:31: mezzo secondo di vuoto prima di toccare «VAI AL TUO MATCH». È il momento più importante del video e il silenzio lo segna.
- Alla fine, dopo l'ultimo colpo, un secondo di sola ambiente del circolo prima del «pock» sul dominio.

**Sound design.**
- **Firma sonora:** ogni tocco sulla UI suona come una pallina colpita («pock»). Lega il tennis al telefono e diventa riconoscibile in pochi secondi.
- Tap e conferme: «pock», onda breve, tre note ascendenti per l'iscrizione.
- Transizioni: strappo di carta (T1), whoosh lunghi (T5, T7), scatto magnetico (cartellino), fruscio di carta da gioco (tessera).
- Gameplay: **solo audio reale di Tennis Clash** per colpi e pubblico, per fedeltà al gioco.
- Ambiente del circolo: uccelli lontani, un palleggio su un altro campo, passi sulla terra rossa.

**Ritmo.** Tagli e cambi di stato agganciati ai battiti; ogni passo numerato entra sul primo battito di una battuta.

---

## 8. Asset list

### READY (già in casa)

| Asset | Percorso |
|---|---|
| Logo eSports FITP (POS, NEG, MONO) e guideline con palette e font | `05_BRAND_MEDIA\LOGHI\eSports_FITP25\` (guideline `_eSports-logo-guidelines-ITA-260924-LOW.pdf`) |
| Logo FITP eSeries by BMW (Landscape, Portrait) | `05_BRAND_MEDIA\LOGHI\FITP eSeries by BMW logo\` |
| Logo FITP istituzionale | `05_BRAND_MEDIA\LOGHI\FITP LOGO\` |
| Logo Tennis Clash (SVG in cinque varianti) | `05_BRAND_MEDIA\LOGHI\Tennis_Clash\` |
| Grafica Tessera E-Sports FITP, fronte e retro (20/07/2026) | `05_BRAND_MEDIA\LOGHI\Tesseramento Esports\layout tessera esports*.png` |
| Campo FITP in Tennis Clash (SuperTennis Arena): screenshot e video di 77 s | `01_ESPORTS\06_ASSET\Campi_Virtuali\FITP Court\` e `...\Video footage campi in-game\FITP Court.mp4` |
| 29 screenshot di gameplay Tennis Clash (05/05/2026) | `01_ESPORTS\06_ASSET\Screenshot\` |
| Registrazione myFITP produzione 12/09/2026 (lista tornei, scheda torneo, round, leaderboard) | `Microsoft Teams Chat Files\Screen_Recording_20260912_193133_MyFITP.mp4` |
| Registrazione myFITP build TEST 06/02/2026 («VAI AL TUO MATCH», «SONO PRONTO A GIOCARE», «VITTORIA») | `Allegati chat o Microsoft Teams\Screen_Recording_20260206_165326_MyFITP.mp4` |
| Master campagna tesseramento (claim «Vivi il gaming da protagonista»), riferimento di tono | `05_BRAND_MEDIA\LOGHI\Campagna tesseramento eSports 2026\` |
| Spot esistenti, per non ripetersi | `05_BRAND_MEDIA\SPOT FITP eSports\` |
| Pose dei 13 campioni Tennis Clash (solo se servono, IP WildLife) | `05_BRAND_MEDIA\TENNIS CLASH\FITP - Character poses\` |

### DA CREARE

- Model sheet del protagonista: turnaround a 5 viste, 7 espressioni, 6 pose chiave, silhouette test.
- Ambiente «fuori»: circolo, campo in terra rossa, panchina, cielo, texture carta.
- Ambiente «dentro»: spazio viola con bokeh, linee diagonali, pavimento luminoso.
- Pallina guida al neon (con scia), cartellino Tennis Clash, orologio disegnato, tunnel dello stadio.
- Animatic completo a 52 secondi con musica provvisoria.
- Supers IT ed EN, end frame, versioni 9:16 e 16:9.
- Musica, sound design, eventuale voice-over IT ed EN.

### DA RECUPERARE

| Cosa | Da chi |
|---|---|
| Registrazione pulita in produzione di: scheda torneo con tasto di iscrizione, conferma di iscrizione, check-in, «SONO PRONTO A GIOCARE», «VAI AL TUO MATCH», «VITTORIA». Account e torneo di prova, nessun nome reale, niente etichetta «TEST». | Bitkit (Jason Liberti, Lorenzo Tampella) con QLASH |
| Registrazione del flusso di tesseramento da mobile (anche solo come riferimento, non va in video) | Bitkit |
| Schermata di accesso o registrazione myFITP | Bitkit |
| Logo myFITP vettoriale (in `05_BRAND_MEDIA` c'è solo dentro il master della campagna) | Bitkit o Visual Communication |
| Icona della sezione eSports nella barra di navigazione, in vettoriale | Bitkit |
| Gameplay Tennis Clash in alta qualità (1080p o più, 60 fps, con audio di gioco) sul campo FITP, tre scambi con un vincente | WildLife Studios (Bruno Mendes, Giovanni Piffer) o cattura interna con account FITP |
| Punto esatto di Tennis Clash da cui parte il link verso myFITP | WildLife Studios |
| File del font Glancyr con licenza commerciale | Visual Communication |
| Storyboard e stato dello spot tesseramento BeCloser | Valentina Giomi |

### DA VERIFICARE

- Etichetta attuale del tasto di iscrizione nell'app.
- Se esiste un percorso di tesseramento dentro l'app myFITP o solo sul sito.
- Se il Player ID si collega davvero in automatico nel flusso di tesseramento (29/07 rilasciato, 08/09 di nuovo aperto).
- Via libera di WildLife all'uso di gameplay e campo FITP in un video con un personaggio non Tennis Clash.
- Nome e grafica attuali del campo FITP in Tennis Clash dopo il rename SuperTennis+.
- Obbligo o opportunità del logo BMW nell'end frame.
- Chiusura dei bug che il video darebbe per risolti (deeplink, caricamenti, popup Loyalty, login in inglese).
- Posizionamento rispetto allo spot BeCloser, inclusa la loro proposta di personaggio AI.

---

## 9. Production plan

### Premessa: dove l'AI aiuta e dove no

La tua regola per i video AI è «AI-only, nessun editing manuale». La rispetto, con un'obiezione da discutere. Le prove già fatte (render Comicon Bergamo, creatività SuperTennis+) dicono che i modelli video sbagliano loghi, testi e interfacce, e questo video ha nella UI reale il suo contenuto principale. La proposta è una **pipeline senza montaggio a mano ma a due motori**:

- **Modelli generativi** (Higgsfield: Soul ID, Kling 3.0, Cinema Studio 2.5; Google Veo) per il personaggio, gli ambienti, le trasformazioni organiche e i movimenti di camera.
- **Composizione scritta in codice** (Remotion, oppure FFmpeg con filtri, scritti da Claude) per mettere in scena la UI reale, i loghi e i testi: nessun ritocco a mano, e ogni etichetta resta esattamente quella del prodotto.

Il riferimento stesso dichiara di essere stato fatto con un modello linguistico, il che fa pensare (è una deduzione) a un'animazione generata in codice. Esiste quindi una terza via, più radicale, da valutare per il mondo «dentro»: disegnarlo interamente in vettoriale via codice, con coerenza e precisione totali.

### Fasi

| Fase | Cosa si fa | Strumento | Generato o costruito |
|---|---|---|---|
| **Pre-production** | Verifica del journey con Bitkit e QLASH (etichette, check-in, tessera in app); decisione sul posizionamento rispetto allo spot BeCloser; via libera WildLife; script definitivo; animatic con musica provvisoria | Claude per script e animatic statico; call con partner | Costruito |
| **Character** | Esplorazione (20-30 varianti), scelta, model sheet completo, addestramento dell'identità, test di coerenza su 10 inquadrature diverse | Higgsfield (character sheet, Soul ID) | Generato, **approvazione tua prima di proseguire** |
| **Keyframes** | Per ogni inquadratura un fotogramma iniziale e uno finale. Regola d'oro: l'ultimo fotogramma di un'inquadratura è il primo della successiva, così le transizioni restano continue | Higgsfield immagini con Soul ID | Generato |
| **Animation** | Clip da fotogramma iniziale a finale per le scene del personaggio e le transizioni organiche (T1, T3, T5, T7); personaggio su fondo neutro quando va composto sopra UI o gameplay | Kling 3.0 (start/end frame), Cinema Studio 2.5 per i movimenti di camera, Veo per le trasformazioni più lunghe | Generato |
| **UI** | Registrazione in produzione delle schermate reali con dati di prova; messa in scena 2.5D (prospettiva, profondità, micro-rimbalzi dei tasti) | Remotion o FFmpeg, scritti in codice | Costruito (mai generato) |
| **Tennis Clash** | Cattura del gameplay reale sul campo FITP, scelta dei tre colpi, sincronizzazione con gli swipe del personaggio | Cattura dal dispositivo o materiale WildLife | Reale (mai generato) |
| **Compositing** | Livelli: ambiente, UI, personaggio, gameplay, supers, loghi; correzione colore per unire i mondi; versioni 9:16 e 16:9 | Remotion o FFmpeg | Costruito in codice |
| **Sound** | Musica, sound design con la firma «pock», audio reale di Tennis Clash, eventuale voce IT ed EN | Libreria musicale o generazione audio; ElevenLabs o voce di Higgsfield per il VO | Misto |
| **Final** | Master 9:16 52 s; 16:9 52 s; taglio 20 s (scene 02, 05, 06, 08); bumper 6 s (T5 più end frame); IT ed EN; sottotitoli. Revisione terminologica, controllo UI e loghi, «battesimo» di Gasparini e Di Natale, validazione WildLife | Claude per il controllo, persone per le approvazioni | Approvazione |

**Tempi indicativi**, dal via libera sul treatment: pre-production e character 1 settimana; keyframes e animazione 1-2 settimane; UI, compositing e suono 1 settimana; revisioni e versioni 1 settimana. Totale 4-5 settimane, a condizione che Bitkit e WildLife consegnino le registrazioni nella prima settimana.

---

## 10. Rischi

| Rischio | Cosa può andare storto | Soluzione |
|---|---|---|
| **Coerenza del personaggio** | Il protagonista cambia faccia, capelli o proporzioni da una scena all'altra | Design volutamente semplice (poche forme, colori piatti); Soul ID addestrato su un model sheet approvato; test su 10 inquadrature prima di produrre; start/end frame per ogni clip; in alternativa, personaggio rigato in vettoriale |
| **Accuratezza UI** | Il modello inventa schermate, etichette o colori di myFITP | La UI non si genera mai: solo registrazioni reali composte in codice. Controllo etichetta per etichetta con Bitkit prima della consegna |
| **UI che cambia** | Bitkit o Crionet («StepUp», myFITP 2.0) modificano l'app e il video invecchia | Mostrare solo le tre schermate indispensabili; tenere la UI in un livello separato e sostituibile; versione B senza voce, così un'etichetta nuova non costringe a rifare l'audio |
| **Loghi** | Loghi deformati, colori sbagliati, area di rispetto violata | Loghi solo da file ufficiali, inseriti in composizione; controllo con la guideline (area di rispetto 2/3 X) |
| **Fedeltà Tennis Clash** | Un tennis generico al posto di Tennis Clash, o campioni ridisegnati male | Solo gameplay reale; nessun elemento Tennis Clash generato; validazione WildLife prima della pubblicazione |
| **Testo generato** | Scritte illeggibili o sbagliate dentro le clip AI | Nessun testo nelle clip generate: tutti i supers in composizione, con il font del brand |
| **Continuità** | Salti di luce, di scala o di posizione tra una clip e l'altra | Fotogramma finale uguale al successivo iniziale; una sola camera virtuale pianificata nell'animatic; revisione dell'animatic prima di generare |
| **Coerenza dell'animazione** | Clip con cadenze diverse, alcune fluide, altre a scatti | Regola fissa: personaggio a 12 fps, camera ed effetti a 25; conformità applicata in composizione |
| **Allucinazioni** | Dettagli inventati: una tessera diversa, un tasto che non esiste, un passaggio in più | Il journey è bloccato nello script con le fonti; ogni oggetto «reale» (tessera, UI, loghi, gameplay) entra solo da file; revisione finale contro la tabella 1.2 |
| **Promessa più facile della realtà** | Il video dice «è tutto qui» mentre i bug noti (deeplink, caricamenti, popup Loyalty, login solo in italiano) fermano gli utenti veri | Uscita subordinata alla chiusura dei bug principali; esports@fitp.it e FAQ pronti; niente «in un minuto» o promesse di tempo |
| **Confusione con lo spot BeCloser** | Due personaggi inventati, stessa scena di iscrizione, pubblico confuso | Decidere i ruoli adesso: lo spot per la voglia, questo per il come; allineare con Valentina Giomi prima di disegnare il personaggio |
| **Diritti e minori** | Il pubblico reale è molto giovane (51% under 18 agli stand IBI 2026) | Personaggio inventato, nessuna persona reale, nessun dato reale nelle schermate; età percepita dai 14 anni in su, coerente con la soglia dei 12 |
| **Font** | Glancyr senza licenza commerciale | Verifica prima della composizione; in mancanza, un bastoni geometrico con licenza aperta scelto con Visual Communication |
| **Estetica «da AI»** | Look lucido e generico, pelle di plastica, luce da render | Riferimento 2D disegnato e piatto, texture carta, linea vibrante, niente fotorealismo; scartare ogni clip con luce volumetrica non richiesta |

---

## Decisioni che servono da te prima della produzione

1. Ordine e claim finale: confermi «ENTRA IN MYFITP. TESSERATI. ISCRIVITI. GIOCA.» più «Tocca a te»?
2. Livello 2 senza tessera: fuori dal video (consigliato) o con un super dedicato?
3. Voce: master senza voice-over (consigliato) con variante A per il 16:9?
4. Pipeline: accetti la composizione in codice per UI, loghi e testi, in deroga parziale alla regola AI-only?
5. Rapporto con lo spot BeCloser: produciamo in parallelo o dopo la loro consegna?
6. Tempistica: il video esce solo dopo la chiusura dei bug deeplink e Loyalty?
