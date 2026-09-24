# «Tocca a te» · video tutorial eSports FITP

Video animato di 52 secondi che spiega ai nuovi giocatori come entrare nel circuito eSports FITP: account myFITP, Tessera E-Sports FITP, iscrizione a un torneo, match su Tennis Clash. Master verticale 9:16.

**Stato: pre-produzione, tutto in bozza.** Nessun materiale è approvato né pubblicabile.

## Cartelle

| Percorso | Contenuto |
|---|---|
| `2026-09-24_treatment-…_BOZZA.md` | Treatment v1: ricerca, concept, storyboard, personaggio, stile, audio, asset, piano, rischi, decisioni aperte |
| `2026-09-24_video-tutorial_bozze-email-asset_BOZZA.md` | Bozze email (non inviate) a Bitkit/QLASH, WildLife, Valentina Giomi |
| `01_character/` | Ciuffo: esplorazioni, model sheet, test di animazione (16:9 e 9:16) |
| `01_character/codice/` | Tutto il disegno e l'animazione in codice (SVG) |
| `02_animatic/` | Animatic renderizzati (v2 = cartoon completo), versione con note di regia e versione pulita |
| `assets/loghi/` | Loghi e tessera originali: eSports FITP (forniti), FITP e SuperTennis (sito fitp.it), icona Tennis Clash (Play Store) |
| `assets/riferimenti/` | Riferimenti visivi: fotogrammi myFITP, campo SuperTennis Arena, screenshot di gameplay Tennis Clash |
| `assets/font/` | Unbounded (licenza OFL), sostituto libero del Glancyr |

## Codice

| File | Cosa fa |
|---|---|
| `ciuffo.js` | Rig vettoriale del personaggio: 4 viste, 8 espressioni, braccia e gambe ad angoli |
| `sheet.html` | Genera i model sheet (salvataggio via `server.py`) |
| `anim.html` | Test di animazione di 6,4 s; `?fmt=9x16` per la versione verticale |
| `animatic.js` + `animatic.html` | Animatic completo 52 s, 8 scene e 8 transizioni dello storyboard; `?clean=1` toglie barra e note |
| `myfitp.js` | myFITP ridisegnato in cartoon: home, lista tornei, scheda torneo, popup di conferma, VITTORIA |
| `arena.js` | SuperTennis Arena cartoon in vista di gioco, avversario generico, punteggio |
| `assets.js` + `media/` | Carica loghi, tessera e font (copie ridotte di `assets/`) dentro ogni fotogramma |
| `render.py` | Rendering automatico in MP4: browser senza finestra + ffmpeg |
| `server.py`, `export.js` | Server locale e rasterizzazione SVG → PNG |

### Anteprima nel browser

```
cd 01_character/codice
python server.py
```
Poi apri `http://127.0.0.1:8771/animatic.html` (cursore per scorrere il tempo, Play/Pausa).

### Rendering in MP4

Requisiti, una volta sola:
```
pip install playwright imageio-ffmpeg
python -m playwright install chromium
```
Comandi:
```
cd 01_character/codice
python render.py animatic.html ../../02_animatic/animatic_v2_9x16_note.mp4
python render.py "animatic.html?clean=1" ../../02_animatic/animatic_v2_9x16_pulito.mp4
python render.py "anim.html?fmt=9x16" ../ciuffo_test-animazione_v1_9x16.mp4
python render.py animatic.html --still 30.6 fotogramma.png
```
Circa 2 minuti e mezzo per i 52 secondi. `--png cartella` salva anche i fotogrammi.

## Scelte della v2

- Tutto in stile cartoon, anche myFITP e il campo: layout, etichette e colori copiati dalle registrazioni reali (tasto «REGISTRATI», popup «Sei sicuro di volerti iscrivere al torneo?», barra con il conto alla rovescia). Nomi e numeri sono di prova, nessun dato reale.
- In campo gioca Ciuffo, visto da dietro come nella camera di Tennis Clash; l'avversario è generico. Nessun campione di Tennis Clash ridisegnato.
- Da verificare prima della produzione: schermate del giorno del match («SONO PRONTO A GIOCARE», «VAI AL TUO MATCH», «VITTORIA») ricostruite dal treatment, non viste; logo Tennis Clash ufficiale al posto dell'icona dell'app; uso del marchio SuperTennis sul campo dopo il rename SuperTennis+.
