"""Rendering automatico delle animazioni in codice del progetto «Tocca a te».

Apre la pagina in un browser senza finestra, chiede i fotogrammi uno per uno
(window.__framePNG, vedi export.js) e li passa direttamente a ffmpeg.
Nessun PNG intermedio su disco, salvo con --png.

Uso:
  python render.py "animatic.html" ../../02_animatic/animatic_v1_9x16.mp4
  python render.py "anim.html?fmt=9x16" ../ciuffo_test-animazione_v1_9x16.mp4
  python render.py "animatic.html?clean=1" out.mp4 --from 0 --to 125
  python render.py "animatic.html" --still 13.6 still.png

Requisiti (una volta sola):
  pip install playwright imageio-ffmpeg
  python -m playwright install chromium
ffmpeg di sistema, se presente nel PATH, ha la precedenza su quello di imageio-ffmpeg.
Variabile opzionale CHROME_PATH per usare un Chromium già installato.
"""
import argparse
import base64
import os
import shutil
import subprocess
import sys
import threading
import time
from http.server import ThreadingHTTPServer

from playwright.sync_api import sync_playwright

from server import Handler


def ffmpeg_exe():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        sys.exit("ffmpeg non trovato: installa ffmpeg oppure 'pip install imageio-ffmpeg'")


def decode(data_url):
    return base64.b64decode(data_url.split(",", 1)[1])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("page", help="pagina da renderizzare, con eventuali parametri (es. 'anim.html?fmt=9x16')")
    ap.add_argument("out", nargs="?", help="file .mp4 di uscita")
    ap.add_argument("--from", dest="start", type=int, default=0, help="primo fotogramma")
    ap.add_argument("--to", dest="end", type=int, default=None, help="fotogramma finale (escluso)")
    ap.add_argument("--png", help="cartella in cui salvare anche i PNG dei fotogrammi")
    ap.add_argument("--still", type=float, help="salva un solo fotogramma al secondo indicato (out = .png)")
    ap.add_argument("--crf", type=int, default=18, help="qualità H.264, più basso = migliore (default 18)")
    a = ap.parse_intermixed_args()
    if not a.out:
        ap.error("manca il file di uscita")

    httpd = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{httpd.server_address[1]}/{a.page}"

    with sync_playwright() as pw:
        launch = {"executable_path": os.environ["CHROME_PATH"]} if os.environ.get("CHROME_PATH") else {}
        browser = pw.chromium.launch(**launch)
        page = browser.new_page()
        page.on("pageerror", lambda e: print("errore nella pagina:", e, file=sys.stderr))
        page.goto(url)
        page.wait_for_function("window.__framePNG !== undefined", timeout=15000)
        W, H, FPS, N = page.evaluate("[window.__W, window.__H, window.__FPS, window.__N]")

        if a.still is not None:
            i = round(a.still * FPS)
            with open(a.out, "wb") as f:
                f.write(decode(page.evaluate("i => window.__framePNG(i)", i)))
            print(f"fotogramma {i} ({a.still:.2f} s) salvato in {a.out}")
            browser.close()
            return

        start, end = a.start, min(a.end if a.end is not None else N, N)
        if a.png:
            os.makedirs(a.png, exist_ok=True)
        os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
        cmd = [ffmpeg_exe(), "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS),
               "-c:v", "png", "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", str(a.crf),
               "-preset", "medium", "-movflags", "+faststart", a.out]
        ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        t0 = time.time()
        for i in range(start, end):
            png = decode(page.evaluate("i => window.__framePNG(i)", i))
            ff.stdin.write(png)
            if a.png:
                with open(os.path.join(a.png, f"f{i:04d}.png"), "wb") as f:
                    f.write(png)
            done = i - start + 1
            if done % FPS == 0 or i == end - 1:
                print(f"\r{done}/{end - start} fotogrammi ({time.time() - t0:.0f} s)", end="", flush=True)
        print()
        ff.stdin.close()
        if ff.wait() != 0:
            sys.exit("ffmpeg ha restituito un errore")
        browser.close()
    print(f"{a.out}: {W}x{H}, {FPS} fps, {(end - start) / FPS:.2f} s")


if __name__ == "__main__":
    main()
