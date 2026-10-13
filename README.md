# Xability's website

Static bilingual (EN/AR) site for GitHub Pages, with an edit dashboard.

## Publish (one time)
1. Create a GitHub repo, upload everything in this folder (keep `.github` and `.nojekyll`).
2. Repo → **Settings → Pages → Source: GitHub Actions**. Tick **Enforce HTTPS**.
3. Open `content.json`, set `site.url` to your real address (`https://USER.github.io/REPO/`, or your custom domain), commit. The Action builds and deploys.
4. Custom domain (optional): Settings → Pages → Custom domain, then update `site.url`.

## Edit with the dashboard
Open `https://USER.github.io/REPO/admin/`. Create a fine-grained token for this repo only (Contents: Read and write; optionally Actions: Read, Pages: Read). Edit texts / SEO, press Save; the site rebuilds in about a minute. The token lives only in the browser tab.

## Google indexing
1. Search Console → add property → verify (paste the meta code in the dashboard's SEO tab, or use DNS).
2. Submit `sitemap.xml`; use URL Inspection → Request indexing for the home page.
3. Keep title 30–60 and description 70–160 characters (dashboard checks this).

## Files
- `content.json` all text, Arabic and SEO settings (the only file you normally edit)
- `index.template.html`, `assets/` layout, styles, scripts, images
- `build.py` generates `index.html`, `assets/js/i18n.js`, `sitemap.xml`, `robots.txt`, `404.html`
- `tools/check.py` security/SEO gate run by the deploy workflow
- Local preview: `python3 build.py && python3 -m http.server`

## Security notes
CSP via meta tag, no inline scripts, `/admin/` is noindex and blocked in robots.txt. The admin page is public but useless without your token. GitHub Pages cannot send custom headers (HSTS etc.); use Cloudflare in front of a custom domain if you need them.
