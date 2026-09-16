# Superpollutant Roadmap for Corporate Action — landing page

Phase 1 (MVP) landing page for the Carbon Containment Lab report: Executive
Summary with scrollytelling Figures E1 and E2, a Mitigation Measures intro,
Table of Contents, and Acknowledgments. The Mitigation Measures Catalogue
(Airtable embed, field and maturity definitions) is its own page at
`/mitigationmeasures`.

Plain static HTML, CSS and JavaScript. No framework, no build step, no
dependencies.

## Structure

```
index.html                    landing page
mitigationmeasures/index.html catalogue page, served at /mitigationmeasures
assets/css/site.css           all styles
assets/js/nav.js              sticky top bar, progress line, current section
                              (both pages; pinned open on the catalogue page)
assets/js/scrolly-charts.js   Figures E1 and E2 (data at the top of the file)
assets/js/levers-reveal.js    staggered entrance for the three levers
assets/img/                   logos and report photography
netlify.toml                  Netlify publish settings and headers
build/inline.py               optional: single-file review copies
```

## Preview locally

Serve the folder so the link to `/mitigationmeasures` resolves:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.

## Deploy on Netlify

1. Push this repository to GitHub.
2. In Netlify: **Add new site → Import an existing project → GitHub**, pick the repo.
3. Leave the build command empty and the publish directory as `.`
   (both already set in `netlify.toml`).
4. Deploy. Every push to the main branch redeploys; pull requests get
   their own deploy preview URL.

## Before launch

- **Search indexing:** remove the `X-Robots-Tag` line in `netlify.toml`.
- **PDF link:** every download link points to
  `https://carboncontainmentlab.org/PDF`. Swap in the final PDF URL
  (search for `carboncontainmentlab.org/PDF`: three places in `index.html`,
  three in `mitigationmeasures/index.html`, including the Appendix B
  "download here" link).
- **Chart data:** Figures E1 and E2 use values traced from the report's
  figure exports. Replace the `DATA` object at the top of
  `assets/js/scrolly-charts.js` with CCL's source values.
- **Brand fonts:** the page uses Whyte and Signifier when installed locally
  and falls back to Archivo and Newsreader from Google Fonts. Once CCL has
  webfont licenses, add the `.woff2` files to `assets/fonts/` and follow
  the note at the top of `site.css`.

## Single-file review copies

```
python3 build/inline.py
```

Writes `dist/superpollutant-roadmap.html` and `dist/mitigation-measures.html`
with all CSS, JS and images inlined and the links between them rewritten,
for emailing or opening without a server. Send both files together.
`dist/` is git-ignored.
