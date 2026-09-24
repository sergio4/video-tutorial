"""Server locale per il progetto «Tocca a te».
Serve i file statici di questa cartella e salva su disco i PNG inviati via POST /save?path=...
Uso: python server.py [porta]
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "out")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_POST(self):
        q = parse_qs(urlparse(self.path).query)
        rel = q.get("path", [""])[0].replace("\\", "/").lstrip("/")
        if not rel or ".." in rel:
            self.send_error(400, "path non valido")
            return
        dest = os.path.join(OUT, rel)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        n = int(self.headers.get("Content-Length", 0))
        with open(dest, "wb") as f:
            f.write(self.rfile.read(n))
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"ok")

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8771
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
