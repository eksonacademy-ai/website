#!/usr/bin/env python3
"""Build the static site: content.json + index.template.html -> index.html, i18n.js, sitemap.xml, robots.txt.
Run:  python3 build.py   (GitHub Actions runs it automatically on every push)"""
import json, html, re, pathlib
R = pathlib.Path(__file__).parent
C = json.loads((R/'content.json').read_text(encoding='utf-8'))
S = C['site']
esc = lambda s: html.escape(s, quote=True)
url = S['url'].rstrip('/') + '/'
CSP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
       "font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; "
       "base-uri 'self'; form-action 'none'")
ld = {"@context": "https://schema.org", "@graph": [
  {"@type": "Organization", "@id": url+"#org", "name": S['org_name'], "url": url, "logo": url+"assets/img/logo.png",
   "parentOrganization": {"@type": "Organization", "name": S['org_parent']},
   "email": S['email'], "telephone": S['phone'],
   "address": {"@type": "PostalAddress", "streetAddress": S['address_street'], "addressLocality": S['address_locality'], "addressCountry": S['address_country']},
   "contactPoint": {"@type": "ContactPoint", "telephone": S['phone'], "email": S['email'], "contactType": "customer support", "availableLanguage": ["en", "ar"]}},
  {"@type": "WebSite", "@id": url+"#site", "url": url, "name": S['org_name'], "inLanguage": ["en", "ar"], "publisher": {"@id": url+"#org"}}]}
head = f'''<title>{esc(S['title_en'])}</title>
<meta name="description" content="{esc(S['description_en'])}">
<meta name="keywords" content="{esc(S['keywords'])}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#0b0f14">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en" href="{url}">
<link rel="alternate" hreflang="ar" href="{url}">
<link rel="alternate" hreflang="x-default" href="{url}">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/img/logo.png">
<meta property="og:type" content="website"><meta property="og:site_name" content="{esc(S['org_name'])}">
<meta property="og:title" content="{esc(S['title_en'])}"><meta property="og:description" content="{esc(S['description_en'])}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{url}assets/img/og-image.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US"><meta property="og:locale:alternate" content="ar_AR">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{esc(S['title_en'])}">
<meta name="twitter:description" content="{esc(S['description_en'])}"><meta name="twitter:image" content="{url}assets/img/og-image.jpg">
''' + (f'<meta name="google-site-verification" content="{esc(S["google_verification"])}">\n' if S.get('google_verification') else '') + \
 '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False).replace('</', '<\\/') + '</script>'
page = (R/'index.template.html').read_text(encoding='utf-8').replace('{{HEAD}}', head)
en = {t['id']: t['en'] for t in C['texts']}
page = re.sub(r'\{\{(t\d+)\}\}', lambda m: html.escape(en[m.group(1)], quote=False), page)
left = re.findall(r'\{\{[^}]+\}\}', page)
assert not left, f'unreplaced placeholders: {left}'
(R/'index.html').write_text(page, encoding='utf-8')
ar = {x['en']: x['ar'] for x in C['texts'] + C['ui'] if x.get('ar')}
(R/'assets/js').mkdir(parents=True, exist_ok=True)
(R/'assets/js/i18n.js').write_text('window.AR=' + json.dumps(ar, ensure_ascii=False).replace('</', '<\\/') + ';\n', encoding='utf-8')
(R/'sitemap.xml').write_text(f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<url><loc>{url}</loc><lastmod>{S['last_modified']}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority>
<xhtml:link rel="alternate" hreflang="en" href="{url}"/><xhtml:link rel="alternate" hreflang="ar" href="{url}"/></url>
</urlset>
''', encoding='utf-8')
(R/'robots.txt').write_text(f'User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: {url}sitemap.xml\n', encoding='utf-8')
(R/'404.html').write_text((R/'404.html').read_text(encoding='utf-8').replace('href="/"', f'href="{url}"'), encoding='utf-8')
print('built', len(en), 'texts,', len(ar), 'translations ->', url)
