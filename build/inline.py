#!/usr/bin/env python3
"""Build self-contained HTML review copies from the repository.

The site is two pages: the landing page (index.html) and the catalogue
page (mitigationmeasures/index.html). Each is written as its own single
file with site.css, its scripts, and every image (from <img src> and
url() in the CSS) inlined as data URIs. Links between the two pages are
rewritten to point at the sibling file, so the pair opens by double-click
with no server, which is handy for emailing a review copy.

    python3 build/inline.py            # writes into dist/
    python3 build/inline.py out/       # custom output folder

Output:
    dist/superpollutant-roadmap.html   landing page
    dist/mitigation-measures.html      catalogue page

Google Fonts and the Airtable embed still load from the web.
"""
import base64
import mimetypes
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist"
mimetypes.add_type("image/svg+xml", ".svg")

HOME_OUT = "superpollutant-roadmap.html"
MEASURES_OUT = "mitigation-measures.html"

# (source page, output file name, asset prefix used in that page,
#  cross-page link rewrites as (href as written, href in the review copy))
PAGES = [
    ("index.html", HOME_OUT, "", [
        ('href="mitigationmeasures/"', f'href="{MEASURES_OUT}"'),
    ]),
    ("mitigationmeasures/index.html", MEASURES_OUT, "../", [
        ('href="../index.html', f'href="{HOME_OUT}'),
        ('href="./"', f'href="{MEASURES_OUT}"'),
    ]),
]


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def inlined_css() -> str:
    css_path = ROOT / "assets" / "css" / "site.css"
    css = css_path.read_text(encoding="utf-8")
    return re.sub(
        r'url\("(\.\./img/[^"]+)"\)',
        lambda m: f'url("{data_uri((css_path.parent / m.group(1)).resolve())}")',
        css,
    )


def build(src: str, out_name: str, prefix: str, links, css: str) -> Path:
    html = (ROOT / src).read_text(encoding="utf-8")
    pre = re.escape(prefix)

    stylesheet = f'<link rel="stylesheet" href="{prefix}assets/css/site.css">'
    if stylesheet not in html:
        sys.exit(f"{src}: stylesheet link not found")
    html = html.replace(stylesheet, f"<style>\n{css}</style>")

    html = re.sub(
        rf'<script src="{pre}(assets/js/[^"]+)"></script>',
        lambda m: f"<script>\n{(ROOT / m.group(1)).read_text(encoding='utf-8')}</script>",
        html,
    )
    html = re.sub(
        rf'src="{pre}(assets/img/[^"]+)"',
        lambda m: f'src="{data_uri(ROOT / m.group(1))}"',
        html,
    )
    for old, new in links:
        html = html.replace(old, new)

    leftovers = re.findall(
        r'(?:href|src)="(?:\.\./)?(?:assets/[^"]+|index\.html[^"]*|mitigationmeasures/[^"]*|\./)"',
        html,
    )
    if leftovers:
        sys.exit(f"{src}: not inlined or rewritten: {leftovers}")

    out = OUT_DIR / out_name
    out.write_text(html, encoding="utf-8")
    print(f"Wrote {out} ({out.stat().st_size / 1024:.0f} KB)")
    return out


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    css = inlined_css()
    for src, out_name, prefix, links in PAGES:
        build(src, out_name, prefix, links, css)


if __name__ == "__main__":
    main()
