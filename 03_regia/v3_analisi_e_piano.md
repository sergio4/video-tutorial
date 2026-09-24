# «Tocca a te» · v3: analisi della v2 e piano di regia

BOZZA · 24/09/2026

## 1. Come è costruita la v2 e perché sembra fatta a blocchi

| Aspetto | Come funziona oggi (`animatic.js` v2) | Effetto |
|---|---|---|
| **Scene** | Nove funzioni separate (`s01`…`s08`, `t7`). `frame(t)` sceglie con una catena di `if (t < 5) … else if (t < 12)`: a ogni confine si passa di colpo da un mondo all'altro. Ogni funzione ridisegna da zero sfondo, personaggio e interfaccia. | Nessun elemento sopravvive al confine: posizione, scala e sfondo di Ciuffo cambiano di scatto. È la causa principale dell'effetto «a blocchi». |
| **Spazio** | Ogni scena ha la propria inquadratura fissa, con la schermata myFITP piantata al centro come un pannello. Non esiste un mondo continuo in cui la camera si sposta. | Si ha l'impressione di sfogliare slide, non di fare un viaggio. |
| **Transizioni** | Quasi tutte sono effetti applicati sopra l'immagine: pan verticale di 0,7 s, zoom esponenziale, card che si ingrandisce in 0,8 s, lampo bianco. Solo T1 e T7 (dentro e fuori dal telefono) trasformano davvero un oggetto. | Le transizioni «tagliano» invece di «portare»; durano troppo poco per essere lette. |
| **Ritmo** | 52 s per 8 scene e 9 passi, con un'azione nuova ogni 0,5–1 s (ad esempio in 25–31 s: corsa, salto, popup, avatar, orologio, due tasti). Supers da 5–6 s, entrate in 0,3 s, easing identici ovunque. | Troppa informazione per secondo, nessuna pausa, tutto alla stessa velocità. |
| **Testi** | Un'unica banda in basso con numero e verbo, tutti con lo stesso peso. Nell'end frame i quattro verbi (52 px) arrivano prima del titolo e sono impilati con 76 px di passo. | Manca la gerarchia: non è chiaro cosa leggere prima. La banda in basso cade nella zona coperta dall'interfaccia di Reels e TikTok. |
| **Audio** | Nessuno. Voce, suoni e musica esistono solo come note scritte a video. | Il ritmo non ha un appoggio: le immagini devono fare tutto da sole. |
| **Effetto «digitale»** | Geometrie perfette (rettangoli, gradienti lisci, linee dritte), bagliori neon come filtri, UI a colori piatti ricalcata 1:1, personaggio con contorno liscio e glow ciano, zero texture fuori dal mondo carta. | Il mondo «dentro» sembra un'app e non un disegno; la carta del mondo «fuori» e il resto parlano due lingue diverse. |

## 2. Principi della v3

1. **Un solo foglio.** Tutto il film è disegnato sulla stessa carta: grana, fibre e linea che «vibra» (line boil a passo due) anche nel mondo eSports e sul campo. I colori digitali restano, ma come inchiostri e pastelli su carta scura.
2. **Un solo viaggio.** Il mondo «dentro» diventa un paesaggio continuo che si percorre da sinistra a destra, con la camera che accompagna Ciuffo: la home di myFITP, la tessera e la bacheca dei tornei sono luoghi dello stesso sentiero. I passi del tutorial diventano tappe di un cammino.
3. **Gli oggetti portano da una scena all'altra.** Ogni passaggio è un oggetto che si muove o si trasforma: la pallina guida salta verso la tappa successiva, il circuito della tessera cola a terra e diventa la strada, la card del torneo si sfila e diventa la scheda, il tasto diventa la botola.
4. **Il teletrasporto è un motivo ricorrente.** Lo stesso tunnel di anelli disegnati porta dentro il telefono all'inizio e dentro Tennis Clash dopo «Vai al tuo match»: lo spettatore lo riconosce la seconda volta.
5. **Ritmo narrativo.** Circa 85 s. Ogni tappa ha tre tempi: arrivo (la camera si assesta, il titolo si scrive), azione (una sola cosa importante per volta), respiro (almeno 1 s di tenuta prima di ripartire). La voce guida i tempi: le immagini aspettano la frase, non il contrario.
6. **Gerarchia dei testi a tre livelli.**
   - L1 · Titolo della tappa: numero in un cerchio disegnato + verbo, Unbounded 900, in alto nella zona sicura (y 180–260). Entra per primo.
   - L2 · Sottotitolo: una riga in scrittura a mano (Caveat), più piccola e più chiara, 0,6 s dopo il titolo, con 30 px di respiro.
   - L3 · Annotazioni: note a mano con freccia disegnata, attaccate all'elemento dell'interfaccia di cui parlano («tocca qui»), solo nel momento dell'azione.
   - Nel finale l'ordine si inverte rispetto alla v2: prima i quattro passi, detti dalla voce uno alla volta, poi «Tocca a te.» grande e da solo, infine dominio e loghi piccoli.
7. **Audio come struttura.** La colonna sonora segue i luoghi: chitarra pizzicata e ambiente del circolo fuori, pad caldi e marimba dentro, battito leggero che cresce tappa dopo tappa, silenzio prima di «Vai al tuo match», pieno in campo, ritorno del tema iniziale sulla panchina. La voce narrante accompagna; la musica si abbassa sotto la voce. Gli effetti sonori sono sui gesti (tocco = «pock» di pallina, strappo, clic, whoosh del teletrasporto, pubblico).

## 3. Scaletta v3 (85 s)

| Tempo | Luogo | Voce | Cosa succede |
|---|---|---|---|
| 0–8 | Circolo, panchina | «Giochi a Tennis Clash, ma solo amichevoli?» · «C'è un circuito ufficiale che ti aspetta. E l'ingresso è proprio nel tuo telefono.» | Lenta spinta della camera. La pallina esce dal telefono, rimbalza, rientra. Ciuffo guarda in camera. |
| 8–10,5 | Teletrasporto 1 | – | Dentro lo schermo, poi negli anelli, poi luce. |
| 10,5–21 | Tappa 1, bacheca myFITP | «Primo passo: scarica myFITP e crea il tuo account.» · «Poi collega il tuo ID di Tennis Clash al profilo: così il circuito sa che sei tu.» | Lo splash FITP si apre sulla home. Il cartellino si attacca all'avatar. |
| 21–25 | Sentiero | – | La pallina salta avanti, Ciuffo la segue, la camera accompagna. |
| 25–34 | Tappa 2, la tessera | «Secondo passo: la Tessera eSports FITP.» · «È la chiave dei tornei ufficiali del circuito.» | La tessera scende come una foglia, gag del rovescio, si gira e si accende. |
| 34–38,5 | Strada di circuito | – | Le piste della tessera colano a terra e diventano la strada. |
| 38,5–55,5 | Tappa 3, bacheca tornei | «Terzo passo: nella sezione eSports scegli un torneo del tuo livello.» · «Tocca Registrati e conferma.» · «Il giorno del torneo, quando è il tuo turno…» · «…premi Vai al tuo match.» | Lista che rallenta, card sfilata che diventa scheda, salto su REGISTRATI, popup, conferma. Il cielo passa dalla notte all'alba (giorno del torneo), tasti del check-in. Mezzo secondo di silenzio, tocco. |
| 55,5–58,5 | Teletrasporto 2 | – | Botola, anelli, luce. |
| 58,5–69,5 | Tappa 4, SuperTennis Arena | «E sei in campo, dentro Tennis Clash.» | Il campo si disegna da solo, tre colpi, il vincente al rallentatore, pubblico. |
| 69,5–73 | Ritorno | «Il risultato arriva da solo su myFITP.» | Il campo diventa lo schermo del telefono sulla panchina, arriva VITTORIA. |
| 73–85 | Finale | «Entra in myFITP.» «Tesserati.» «Iscriviti.» «Gioca.» · «Tocca a te.» | Ciuffo si alza, quarta tacca di gesso. I quattro passi compaiono uno per voce, poi «Tocca a te.», poi dominio e loghi. |

## 4. Scelte e limiti da conoscere

- **Durata.** 85 s sono il master narrativo. Per i social servirà un taglio a 30–45 s (tappe 1–4 senza i respiri).
- **Voce provvisoria.** Sintesi vocale locale (Piper, voce italiana «Paola»), unica voce italiana di qualità sufficiente disponibile offline. Va sostituita con una voce vera; è anche da decidere se il narratore resta esterno o diventa Ciuffo (il treatment chiedeva la voce del protagonista).
- **Musica ed effetti provvisori.** Generati in codice (sintesi), servono a fissare ritmo e sincronizzazione; vanno sostituiti con un brano di libreria e con effetti registrati.
- **Sottotitoli.** Nel video non sono impressi, per non sovrapporre un quarto livello di testo; sono in un file `.srt` a parte per le piattaforme.
