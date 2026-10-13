#!/usr/bin/env python3
"""Fails the deploy if the built site breaks basic SEO/security rules."""
import json, re, sys, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
errs, warn = [], []
h = (R/'index.html').read_text(encoding='utf-8')
c = json.loads((R/'content.json').read_text(encoding='utf-8'))
S = c['site']
for p in re.findall(r'<script(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>', h): errs.append('inline <script> found: '+p)
if re.search(r'\son[a-z]+\s*=\s*"', h): errs.append('inline event handler (onclick/onerror...) found')
if 'Content-Security-Policy' not in h: errs.append('CSP meta missing')
if 'unsafe-eval' in h: errs.append('unsafe-eval in CSP')
for u in re.findall(r'(?:src|href)="(http://[^"]+)"', h): errs.append('insecure http:// resource '+u)
for t in re.findall(r'<a [^>]*target="_blank"[^>]*>', h):
    if 'noopener' not in t: errs.append('target=_blank without rel=noopener')
for im in re.findall(r'<img[^>]*>', h):
    if 'alt=' not in im: errs.append('img without alt')
if 'YOUR-USERNAME' in S['url']: warn.append('site.url is still the placeholder - set your real URL in the dashboard')
if not 25 <= len(S['title_en']) <= 65: warn.append('title length %d (aim 30-60)' % len(S['title_en']))
if not 70 <= len(S['description_en']) <= 170: warn.append('description length %d (aim 70-160)' % len(S['description_en']))
miss = [t['id'] for t in c['texts'] if not t.get('ar')]
if miss: warn.append('missing Arabic for: '+', '.join(miss))
for f in ('assets/img/og-image.jpg','favicon.svg','assets/img/logo.png'):
    if not (R/f).exists(): errs.append('missing '+f)
for w in warn: print('WARN', w)
for e in errs: print('FAIL', e)
sys.exit(1 if errs else 0)
