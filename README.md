# «Tocca a te» · video eSports FITP

Video che invita una Gen Z / young audience a entrare nel mondo eSports FITP: myFITP, Tessera eSports FITP, tornei, iscrizione, partita su Tennis Clash, tabellone.

**Versione attuale: v4 motion** (`04_motion/`), 16:9, due durate (45 s e 30 s), motion design senza personaggio. Le versioni precedenti con Ciuffo (9:16) restano in `01_character/` e `02_animatic/`.

**Stato: bozza.** Nessun materiale è approvato né pubblicabile.

## v4 motion (`04_motion/`)

| Percorso | Contenuto |
|---|---|
| `04_motion/concept.md` | Analisi, visual concept, storyboard 45 s e adattamento 30 s, audio, tecnica |
| `04_motion/video/` | `tocca_a_te_45s_16x9.mp4`, `tocca_a_te_30s_16x9.mp4` (1920×1080, 25 fps, audio −14 LUFS) e sottotitoli `.srt` |
| `04_motion/codice/timeline_45.json`, `timeline_30.json` | **Unica fonte dei tempi**: cue di ogni atto e frasi della voce, lette da immagini e audio |
| `04_motion/codice/engine/` | Motore 2.5D scritto apposta: camera 3D, testo dai contorni dei glifi (opentype.js), glow, motion blur a sottofotogrammi, grana, aberrazione, glitch |
| `04_motion/codice/shots/` | I cinque atti: `hook` (il loop delle amichevoli), `world` (campo → telefono → myFITP → tessera), `tornei` (carosello, iscrizione, countdown), `campo` (partita Hawk-Eye e tabellone di campi), `finale` (payoff, 5 passi, logo) |
| `04_motion/codice/audio/` | `vo_cut.py` ritaglia le frasi dalla voce registrata, `synth.py` strumenti ed effetti, `build.py` musica a 128 BPM + effetti sui cue + voce + mix |

### Rigenerare

```
cd 04_motion/codice
python audio/vo_cut.py                         # frasi dalla registrazione (assets/voce/)
python audio/build.py timeline_45.json         # → audio/mix_45.wav + ../video/sottotitoli_45s.srt
python audio/build.py timeline_30.json         # → audio/mix_30.wav + ../video/sottotitoli_30s.srt
python render.py --tl timeline_45.json --out ../video/tocca_a_te_45s_16x9.mp4 --audio audio/mix_45.wav
python render.py --tl timeline_30.json --out ../video/tocca_a_te_30s_16x9.mp4 --audio audio/mix_30.wav
python render.py --tl timeline_45.json --still 12.5 26.3        # fotogrammi singoli in out/stills
python render.py --tl timeline_30.json --preview --out prova.mp4  # anteprima veloce a metà risoluzione
```
Tempi su 4 core: circa 4 minuti per il 45 s, 2,5 per il 30 s. Requisiti: `pip install playwright imageio-ffmpeg numpy scipy soundfile numba pyloudnorm` e Chromium di Playwright.

## Cartelle

| Percorso | Contenuto |
|---|---|
| `2026-09-24_treatment-…_BOZZA.md` | Treatment v1: ricerca, concept, storyboard, personaggio, stile, audio, asset, piano, rischi, decisioni aperte |
| `03_regia/v3_analisi_e_piano.md` | Analisi della v2 e piano di regia della v3 (ritmo, transizioni, audio, gerarchia dei testi) |
| `01_character/` | Ciuffo: esplorazioni, model sheet, test di animazione (16:9 e 9:16) |
| `01_character/codice/` | Tutto il disegno, l'animazione e l'audio in codice |
| `02_animatic/` | Animatic renderizzati: v1, v2, **v3 (con audio)** e sottotitoli `.srt` |
| `assets/loghi/` | Loghi e tessera originali: eSports FITP (forniti), FITP e SuperTennis (sito fitp.it), icona Tennis Clash (Play Store) |
| `assets/riferimenti/` | Riferimenti visivi: fotogrammi myFITP, campo SuperTennis Arena, screenshot di gameplay Tennis Clash |
| `assets/font/` | Unbounded e Caveat (licenza OFL) |

## Codice (`01_character/codice/`)

| File | Cosa fa |
|---|---|
| `timeline.json` | **Unica fonte dei tempi** del master: cue delle azioni e frasi della voce. La leggono immagini e audio |
| `timeline_30.json` | Taglio social da 30 s: stessa animazione con tempi compressi, un colpo solo in campo e cartello finale con strappo di carta |
| `animatic.js` + `animatic.html` | Animatic v3: circolo, teletrasporto, sentiero myFITP continuo, teletrasporto, SuperTennis Arena, ritorno, finale |
| `myfitp.js` | myFITP ridisegnato in cartoon dalle registrazioni reali: home, lista tornei, scheda torneo, popup di conferma, VITTORIA |
| `arena.js` | SuperTennis Arena cartoon in vista di gioco, che si disegna da sola all'arrivo |
| `ciuffo.js` | Rig vettoriale del personaggio: 4 viste, 8 espressioni, racchetta impugnabile |
| `assets.js` + `media/` | Carica timeline, loghi, tessera, font e grana della carta dentro ogni fotogramma |
| `audio/make_vo.py` | Voce narrante provvisoria (Chatterbox multilingue, voce di riferimento LibriVox): per ogni frase genera più versioni e tiene quella trascritta in modo più fedele e con il ritmo più naturale |
| `audio/grafie.json` | Grafie usate solo per la sintesi (myFITP → «mai effe i ti pi», ID → «ai-dì»…) |
| `audio/riferimento_voce.wav` | 12 s di lettura italiana da LibriVox (*Il fu Mattia Pascal*, pubblico dominio): timbro e accento della voce |
| `audio/build_audio.py` | Musica ed effetti sintetizzati sui cue, mix con la voce (musica abbassata sotto la voce), sottotitoli `.srt` |
| `render.py` | Rendering in MP4: browser senza finestra + ffmpeg, con `--audio` unisce il mix |
| `sheet.html`, `anim.html` | Model sheet e test di animazione del personaggio |
| `server.py`, `export.js` | Server locale e rasterizzazione SVG → PNG |

### Rigenerare l'audio

```
cd 01_character/codice
python audio/make_vo.py                     # solo se cambiano le frasi (lento: ~30 s per versione su CPU)
python audio/build_audio.py                 # musica + effetti + mix → audio/mix.wav (circa 15 s)
python audio/make_vo.py timeline_30.json    # taglio social
python audio/build_audio.py timeline_30.json  # → audio/mix_30.wav
```
Le frasi già generate sono in `audio/vo/`, quindi `build_audio.py` basta per cambiare musica, effetti o tempi. Requisiti: `pip install numpy scipy soundfile`; per la voce anche `pip install chatterbox-tts faster-whisper "setuptools<81"`.

### Anteprima e rendering

```
python server.py               # poi apri http://127.0.0.1:8771/animatic.html  (Play suona anche l'audio)
python render.py animatic.html ../../02_animatic/animatic_v3_9x16.mp4 --audio audio/mix.wav
python render.py "animatic.html?tl=timeline_30.json" ../../02_animatic/social_30s_9x16.mp4 --audio audio/mix_30.wav
python render.py "animatic.html?tc=1" prova.mp4 --from 1000 --to 1300 --audio audio/mix.wav   # un pezzo, con timecode
python render.py animatic.html --still 44.4 fotogramma.png
```
Requisiti per il rendering: `pip install playwright imageio-ffmpeg` e `python -m playwright install chromium`. Il film intero richiede circa 20 minuti.

### Cambiare un tempo

Si sposta il cue in `timeline.json` (ad esempio `"card_catch"`), poi si rigenerano audio e video: immagini, effetti sonori e musica restano allineati. Se si spostano le frasi (`"vo"`), `make_vo.py` segnala eventuali sovrapposizioni.

## Cosa è provvisorio

- **Voce:** sintesi vocale (Chatterbox, licenza MIT) con timbro preso da una lettura LibriVox di pubblico dominio. Da sostituire con un doppiatore.
- **Musica ed effetti:** sintetizzati in codice per fissare ritmo e sincronizzazione. Da sostituire con un brano di libreria ed effetti registrati.
- **Schermate del giorno del match** («SONO PRONTO A GIOCARE», «VAI AL TUO MATCH», «VITTORIA»): ricostruite dal treatment, non viste nelle registrazioni.
- **Loghi:** icona dell'app Tennis Clash al posto del logo ufficiale; uso del marchio SuperTennis sul campo da verificare dopo il rename SuperTennis+.
