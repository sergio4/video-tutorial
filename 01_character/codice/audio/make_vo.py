"""Genera la voce narrante provvisoria dalla timeline.

Uso (dalla cartella codice/):
  python audio/make_vo.py                      master (timeline.json)
  python audio/make_vo.py timeline_30.json     taglio social

Motore: Chatterbox multilingue (licenza MIT), in italiano, con una voce di riferimento
(audio/riferimento_voce.wav: 12 s di una lettura LibriVox, pubblico dominio) che dà timbro
e accento. Il campo "say" di una frase, se presente, è la grafia usata per la sintesi.
Scrive audio/vo/<id>.wav; le frasi già generate con lo stesso testo non vengono rifatte.
Alla fine controlla che nessuna frase si sovrapponga alla successiva.
Requisiti: pip install chatterbox-tts soundfile "setuptools<81"
"""
import hashlib
import json
import os
import sys

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
TL_NAME = sys.argv[1] if len(sys.argv) > 1 else 'timeline.json'
TL = json.load(open(os.path.join(HERE, '..', TL_NAME), encoding='utf-8'))
OUT = os.path.join(HERE, 'vo')
# grafie per la sintesi, valide per tutte le frasi (scelte confrontando le trascrizioni automatiche)
RESPELL = json.load(open(os.path.join(HERE, 'grafie.json'), encoding='utf-8'))


def similarity(ref, hyp):
    import difflib
    import re
    def norm(s):
        s = s.lower().replace('myfitp', 'my fitp')
        s = re.sub(r'\be[- ]?sports?\b|\bi[- ]?sports?\b', 'esport', s)
        return re.sub(r'[^a-zàèéìòù ]', ' ', s).split()
    return difflib.SequenceMatcher(None, norm(ref), norm(hyp)).ratio()


def pacing_penalty(text, audio, sr):
    """Penalizza le letture troppo lente o spezzate da pause lunghe (tipiche delle frasi brevi)."""
    dur = len(audio) / sr
    expected = len(text) / 13 + 0.3
    w = int(0.05 * sr)
    rms = np.array([np.sqrt((audio[i:i + w] ** 2).mean()) for i in range(0, len(audio) - w, w)])
    gap = run = 0
    for x in rms:
        run = run + 1 if x < 0.015 else 0
        gap = max(gap, run)
    return max(0, dur - 1.35 * expected) * 0.25 + max(0, gap * 0.05 - 0.45) * 0.5


def spoken(v):
    s = v.get('say', v['text'])
    for a, b in RESPELL.items():
        s = s.replace(a, b)
    return s.replace('«', '').replace('»', '')


def main():
    os.makedirs(OUT, exist_ok=True)
    cfg = TL['tts']
    ref = os.path.join(HERE, '..', cfg['reference'])
    model = None
    stamp_path = os.path.join(OUT, 'stamp.json')
    stamps = json.load(open(stamp_path)) if os.path.exists(stamp_path) else {}
    for v in TL['vo']:
        say = spoken(v)
        key = hashlib.sha1(f"{cfg['engine']}|{cfg['exaggeration']}|{cfg['cfg_weight']}|{say}".encode()).hexdigest()
        path = os.path.join(OUT, v['id'] + '.wav')
        if (stamps.get(v['id']) == key or stamps.get(v['id']) == 'registrata') and os.path.exists(path):
            continue  # già generata, oppure registrata da una persona (audio/import_vo.py)
        if model is None:
            import torch
            from chatterbox.mtl_tts import ChatterboxMultilingualTTS
            from faster_whisper import WhisperModel
            model = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
            asr = WhisperModel('small', device='cpu', compute_type='int8')
        # la sintesi non è deterministica: si generano più versioni e si tiene quella che
        # un riconoscitore vocale trascrive in modo più fedele al testo (controllo automatico)
        best = None
        for seed in range(6):
            torch.manual_seed(seed)
            wav = model.generate(say, language_id=cfg['language'], audio_prompt_path=ref,
                                 exaggeration=cfg['exaggeration'], cfg_weight=cfg['cfg_weight'])
            audio = wav.squeeze().numpy()
            nz = np.nonzero(np.abs(audio) > 0.01)[0]  # toglie il silenzio iniziale e finale
            audio = audio[max(0, nz[0] - 240): nz[-1] + 1600]
            sf.write(path, audio, model.sr)
            segs, _ = asr.transcribe(path, language='it', beam_size=5)
            hyp = ' '.join(x.text for x in segs)
            extra = max(0, len(hyp.split()) - len(v['text'].split()))  # parole inventate in più (code allucinate)
            score = similarity(v['text'], hyp) - pacing_penalty(v['text'], audio, model.sr) - 0.08 * extra
            if best is None or score > best[0]:
                best = (score, audio, hyp)
            if seed >= 1 and best[0] >= 0.95:
                break
        sf.write(path, best[1], model.sr)
        stamps[v['id']] = key
        json.dump(stamps, open(stamp_path, 'w'), indent=1)
        print('generata', v['id'], f'{len(best[1]) / model.sr:.2f} s', f'fedeltà {best[0]:.2f}', '|', best[2].strip(), flush=True)

    ok = True
    vos = TL['vo']
    for i, v in enumerate(vos):
        d = sf.info(os.path.join(OUT, v['id'] + '.wav')).duration
        end = v['t'] + d
        nxt = vos[i + 1]['t'] if i + 1 < len(vos) else TL['dur']
        flag = '' if end + 0.2 <= nxt else '  <-- SOVRAPPOSTA'
        ok &= not flag
        print(f"{v['id']}  {v['t']:6.2f} → {end:6.2f}  ({d:.2f} s)  prossima {nxt:6.2f}{flag}  {v['text']}")
    if not ok:
        sys.exit('ci sono frasi sovrapposte: sposta i tempi in ' + TL_NAME)


if __name__ == '__main__':
    main()
