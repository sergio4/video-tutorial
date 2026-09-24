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
| `02_animatic/` | Animatic v1 renderizzato: versione con note di regia e versione pulita |

## Codice

| File | Cosa fa |
|---|---|
| `ciuffo.js` | Rig vettoriale del personaggio: 4 viste, 8 espressioni, braccia e gambe ad angoli |
| `sheet.html` | Genera i model sheet (salvataggio via `server.py`) |
| `anim.html` | Test di animazione di 6,4 s; `?fmt=9x16` per la versione verticale |
| `animatic.js` + `animatic.html` | Animatic completo 52 s, 8 scene e 8 transizioni dello storyboard; `?clean=1` toglie barra e note |
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
python render.py animatic.html ../../02_animatic/animatic_v1_9x16_note.mp4
python render.py "animatic.html?clean=1" ../../02_animatic/animatic_v1_9x16_pulito.mp4
python render.py "anim.html?fmt=9x16" ../ciuffo_test-animazione_v1_9x16.mp4
python render.py animatic.html --still 30.6 fotogramma.png
```
Circa 2 minuti e mezzo per i 52 secondi. `--png cartella` salva anche i fotogrammi.

## Cosa è segnaposto nell'animatic

Tutto ciò che è tratteggiato va sostituito con materiale reale, mai ridisegnato: schermate myFITP (Bitkit), grafica della tessera, gameplay Tennis Clash (WildLife), loghi, font Glancyr (al suo posto un bastoni di sistema). Il blu e il magenta di myFITP sono approssimati. Etichetta del tasto di iscrizione da verificare con Bitkit.
