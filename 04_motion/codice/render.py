"""Render della v4 motion: Chromium headless disegna ogni fotogramma su canvas, ffmpeg monta.

Uso (dalla cartella 04_motion/codice):
  python render.py --tl timeline_45.json --out ../video/tocca_a_te_45s.mp4 --audio audio/mix_45.wav
  python render.py --tl timeline_45.json --still 3.8 12 26.3 --outdir /tmp/stills      fotogrammi singoli
  python render.py --tl timeline_30.json --from 10 --to 14 --preview                  anteprima veloce

I fotogrammi vanno in una cartella di lavoro (JPEG), divisi tra più processi Chromium in parallelo;
un render interrotto riparte dai fotogrammi mancanti.
"""
import argparse
import base64
import functools
import http.server
import json
import math
import os
import shutil
import socketserver
import subprocess
import sys
import threading
import time
from multiprocessing import Process

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = os.environ.get('CHROME_PATH', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
FPS = 25


def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return 'ffmpeg'


def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

        def end_headers(self):
            self.send_header('Cache-Control', 'no-store')
            super().end_headers()
    h = functools.partial(Q, directory=HERE)
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), h)
    srv.daemon_threads = True
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv.server_address[1]


def open_page(pw, port, tl):
    br = pw.chromium.launch(executable_path=CHROME, args=['--disable-gpu', '--force-color-profile=srgb', '--disable-lcd-text'])
    pg = br.new_page(viewport={'width': 1920, 'height': 1080}, device_scale_factor=1)
    pg.on('console', lambda m: m.type == 'error' and print('[console]', m.text, file=sys.stderr))
    pg.on('pageerror', lambda e: print('[pageerror]', e, file=sys.stderr))
    pg.goto(f'http://127.0.0.1:{port}/index.html?tl={tl}')
    pg.wait_for_function('window.ready === true || window.initError', timeout=120000)
    err = pg.evaluate('window.initError || null')
    if err:
        raise RuntimeError(err)
    return br, pg


def worker(port, tl, frames, outdir, opts):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        br, pg = open_page(pw, port, tl)
        q = opts.get('q', 0.95)
        scale = opts.get('scale', 1)
        mb = opts.get('mb')
        for f in frames:
            path = os.path.join(outdir, f'f{f:05d}.jpg')
            if os.path.exists(path) and not opts.get('force'):
                continue
            t = f / FPS
            arg = {'t': t, 'mb': mb, 'q': q, 's': scale}
            data = pg.evaluate("a => { window.renderFrame(a.t, a.mb ? {mb: a.mb} : {}); return window.grab('image/jpeg', a.q, a.s); }", arg)
            with open(path + '.tmp', 'wb') as fh:
                fh.write(base64.b64decode(data.split(',', 1)[1]))
            os.replace(path + '.tmp', path)
        br.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tl', default='timeline_45.json')
    ap.add_argument('--out')
    ap.add_argument('--audio')
    ap.add_argument('--from', dest='t0', type=float, default=0)
    ap.add_argument('--to', dest='t1', type=float)
    ap.add_argument('--still', type=float, nargs='*')
    ap.add_argument('--outdir')
    ap.add_argument('--work')
    ap.add_argument('--workers', type=int, default=3)
    ap.add_argument('--preview', action='store_true', help='metà risoluzione, senza motion blur')
    ap.add_argument('--mb', type=int)
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--crf', type=int, default=17)
    a = ap.parse_intermixed_args()

    TL = json.load(open(os.path.join(HERE, a.tl), encoding='utf-8'))
    port = serve()
    opts = {'force': a.force}
    if a.preview:
        opts.update(scale=0.5, mb=1, q=0.9)
    if a.mb:
        opts['mb'] = a.mb

    if a.still is not None:
        outdir = a.outdir or os.path.join(HERE, 'out', 'stills')
        os.makedirs(outdir, exist_ok=True)
        from playwright.sync_api import sync_playwright
        with sync_playwright() as pw:
            br, pg = open_page(pw, port, a.tl)
            for t in a.still:
                t0 = time.time()
                arg = {'t': t, 'mb': opts.get('mb'), 's': opts.get('scale', 1)}
                data = pg.evaluate("a => { window.renderFrame(a.t, a.mb ? {mb: a.mb} : {}); return window.grab('image/png', 1, a.s); }", arg)
                p = os.path.join(outdir, f'{os.path.splitext(a.tl)[0]}_{t:06.2f}.png')
                open(p, 'wb').write(base64.b64decode(data.split(',', 1)[1]))
                print(f'{p}  ({time.time() - t0:.2f} s)')
            br.close()
        return

    t1 = a.t1 if a.t1 is not None else TL['dur']
    f0, f1 = int(round(a.t0 * FPS)), int(round(t1 * FPS))
    frames = list(range(f0, f1))
    work = a.work or os.path.join(HERE, 'out', 'frames', os.path.splitext(a.tl)[0] + ('_prev' if a.preview else ''))
    os.makedirs(work, exist_ok=True)
    if a.force:
        for f in frames:
            p = os.path.join(work, f'f{f:05d}.jpg')
            if os.path.exists(p):
                os.remove(p)
    n = max(1, a.workers)
    # fotogrammi alternati a blocchi, così i processi finiscono insieme anche se le scene hanno costi diversi
    chunks = [[] for _ in range(n)]
    for i in range(0, len(frames), 5):
        chunks[(i // 5) % n].extend(frames[i:i + 5])
    t0 = time.time()
    ps = [Process(target=worker, args=(port, a.tl, c, work, opts)) for c in chunks if c]
    for p in ps:
        p.start()
    last = -1
    while any(p.is_alive() for p in ps):
        time.sleep(5)
        done = sum(os.path.exists(os.path.join(work, f'f{f:05d}.jpg')) for f in frames)
        if done != last:
            el = time.time() - t0
            print(f'  {done}/{len(frames)} fotogrammi · {el:5.0f} s', flush=True)
            last = done
    for p in ps:
        p.join()
    missing = [f for f in frames if not os.path.exists(os.path.join(work, f'f{f:05d}.jpg'))]
    if missing:
        sys.exit(f'mancano {len(missing)} fotogrammi, es. {missing[:5]}')
    print(f'render: {time.time() - t0:.0f} s')
    if not a.out:
        return
    lst = os.path.join(work, 'list.txt')
    with open(lst, 'w') as fh:
        for f in frames:
            fh.write(f"file 'f{f:05d}.jpg'\nduration {1 / FPS:.6f}\n")
    cmd = [ffmpeg(), '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-r', str(FPS), '-i', lst]
    if a.audio:
        cmd += ['-ss', f'{f0 / FPS:.3f}', '-t', f'{(f1 - f0) / FPS:.3f}', '-i', os.path.join(HERE, a.audio)]
    cmd += ['-map', '0:v']
    if a.audio:
        cmd += ['-map', '1:a', '-c:a', 'aac', '-b:a', '192k']
    cmd += ['-r', str(FPS), '-c:v', 'libx264', '-preset', 'slow', '-crf', str(a.crf), '-pix_fmt', 'yuv420p',
            '-profile:v', 'high', '-movflags', '+faststart']
    if a.audio:
        cmd += ['-shortest']
    cmd += [a.out]
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    subprocess.run(cmd, check=True)
    print('scritto', a.out)


if __name__ == '__main__':
    main()
