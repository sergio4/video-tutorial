"""Genera la voce narrante provvisoria dalla timeline (sintesi Kokoro, voce italiana).

Uso:  python audio/make_vo.py            (dalla cartella codice/)
Scrive audio/vo/<id>.wav (24 kHz mono) e controlla che nessuna frase si sovrapponga alla successiva.
Le frasi già generate con lo stesso testo non vengono rifatte.
Requisiti: pip install kokoro soundfile  +  espeak-ng installato nel sistema.
"""
import hashlib
import json
import os
import sys

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, '..', 'timeline.json'), encoding='utf-8'))
OUT = os.path.join(HERE, 'vo')
SR = 24000


def main():
    os.makedirs(OUT, exist_ok=True)
    cfg = TL['tts']
    pipe = None
    stamp_path = os.path.join(OUT, 'stamp.json')
    stamps = json.load(open(stamp_path)) if os.path.exists(stamp_path) else {}
    for v in TL['vo']:
        say = v.get('say', v['text'])
        key = hashlib.sha1(f"{cfg['voice']}|{cfg['speed']}|{say}".encode()).hexdigest()
        path = os.path.join(OUT, v['id'] + '.wav')
        if stamps.get(v['id']) == key and os.path.exists(path):
            continue
        if pipe is None:
            from kokoro import KPipeline
            pipe = KPipeline(lang_code='i', repo_id=cfg['model'])
        audio = np.concatenate([a for _, _, a in pipe(say, voice=cfg['voice'], speed=cfg['speed'])])
        # toglie il silenzio iniziale e finale, così il tempo in timeline è l'attacco reale della frase
        nz = np.nonzero(np.abs(audio) > 0.01)[0]
        audio = audio[max(0, nz[0] - 240): nz[-1] + 1200]
        sf.write(path, audio, SR)
        stamps[v['id']] = key
        print('generata', v['id'], f'{len(audio) / SR:.2f} s')
    json.dump(stamps, open(stamp_path, 'w'), indent=1)

    # controllo sovrapposizioni
    ok = True
    vos = TL['vo']
    for i, v in enumerate(vos):
        d = sf.info(os.path.join(OUT, v['id'] + '.wav')).duration
        end = v['t'] + d
        nxt = vos[i + 1]['t'] if i + 1 < len(vos) else TL['dur']
        flag = '' if end + 0.25 <= nxt else '  <-- SOVRAPPOSTA'
        ok &= not flag
        print(f"{v['id']}  {v['t']:6.2f} → {end:6.2f}  ({d:.2f} s)  prossima {nxt:6.2f}{flag}  {v['text']}")
    if not ok:
        sys.exit('ci sono frasi sovrapposte: sposta i tempi in timeline.json')


if __name__ == '__main__':
    main()
