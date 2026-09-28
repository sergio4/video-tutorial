"""Controllo dei testi: rende un fotogramma ogni 0,2 s e riporta i testi che non stavano nella loro card
(e di quanto sono stati ridotti). Uso: python audit.py"""
import json, sys
from playwright.sync_api import sync_playwright
from render import serve, open_page

port = serve()
with sync_playwright() as pw:
    br, pg = open_page(pw, port, 'timeline.json')
    dur = pg.evaluate('window.TL.dur')
    found = {}
    t = 0.0
    while t < dur:
        res = pg.evaluate(f'(() => {{ window.R.audit = []; window.renderFrame({t}, {{mb: 1}}); return window.R.audit; }})()')
        for s, k in res:
            if s not in found or k < found[s][0]: found[s] = (k, round(t, 1))
        t += 0.2
    br.close()
for s, (k, t) in sorted(found.items(), key=lambda x: x[1][0]):
    print(f'{k:5.2f}  t={t:5.1f}  {s}')
print('testi ridotti:', len(found))
