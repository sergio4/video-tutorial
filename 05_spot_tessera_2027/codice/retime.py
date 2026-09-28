"""Adatta le durate delle scene alla voce registrata.

Uso (dalla cartella codice/):
  python retime.py vo/            cartella con un file per scena: a.wav, b.wav … i.wav (una per scena) (qualsiasi formato audio)
  python retime.py vo/ --scrivi   applica le nuove durate a timeline.json

Per ogni scena: nuova durata = entrata della voce + durata della frase + respiro,
mai meno della durata minima dell'animazione, arrotondata al mezzo beat (128 BPM).
Senza --scrivi mostra solo il confronto. Poi basta rifare il render.
"""
import json, os, subprocess, sys, math

HERE = os.path.dirname(os.path.abspath(__file__))
MIN = {'a': 3.2, 'b': 2.0, 'c': 4.2, 'd': 3.0, 'e': 1.6, 'f': 8.4, 'g': 4.0, 'h': 7.5, 'i': 7.0}
TAIL = 0.35
HALF_BEAT = 60 / 128 / 2


def duration(path):
    import imageio_ffmpeg
    r = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-i', path], capture_output=True, text=True).stderr
    h, m, s = r.split('Duration: ')[1].split(',')[0].split(':')
    return int(h) * 3600 + int(m) * 60 + float(s)


def main():
    folder, write = sys.argv[1], '--scrivi' in sys.argv
    TL = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
    files = {os.path.splitext(f)[0]: os.path.join(folder, f) for f in os.listdir(folder)}
    tot0 = tot1 = 0
    for sc in TL['scenes']:
        old = sc['dur']
        if sc['id'] in files:
            d = duration(files[sc['id']])
            new = max(MIN[sc['id']], sc['vo_in'] + d + TAIL)
            new = math.ceil(new / HALF_BEAT) * HALF_BEAT
            sc['vo_est'] = round(d, 2)
            sc['dur'] = round(new, 4)
        tot0 += old; tot1 += sc['dur']
        print(f"{sc['id']:4s} {old:5.2f} s → {sc['dur']:5.2f} s   {sc['vo']}")
    print(f'totale {tot0:.2f} s → {tot1:.2f} s')
    if write:
        json.dump(TL, open(os.path.join(HERE, 'timeline.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
        print('timeline.json aggiornata')


if __name__ == '__main__':
    main()
