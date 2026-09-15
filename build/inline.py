#!/usr/bin/env python3
"""Build a single self-contained HTML file from the repository.

Inlines assets/css/site.css, the three assets/js scripts, and every
image (from <img src> in index.html and url() in the CSS) as data URIs.
The result opens by double-click with no server, which is handy for
emailing a review copy.

    python3 build/inline.py            # writes dist/superpollutant-roadmap.html
    python3 build/inline.py out.html   # custom output path

Google Fonts and the Airtable embed still load from the web.
"""
import base64
import mimetypes
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist" / "superpollutant-roadmap.html"
mimetypes.add_type("image/svg+xml", ".svg")


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def main() -> None:
    html = (ROOT / "index.html").read_text(encoding="utf-8")

    css_path = ROOT / "assets" / "css" / "site.css"
    css = css_path.read_text(encoding="utf-8")
    css = re.sub(
        r'url\("(\.\./img/[^"]+)"\)',
        lambda m: f'url("{data_uri((css_path.parent / m.group(1)).resolve())}")',
        css,
    )
    html = html.replace(
        '<link rel="stylesheet" href="assets/css/site.css">',
        f"<style>\n{css}</style>",
    )

    html = re.sub(
        r'<script src="(assets/js/[^"]+)"></script>',
        lambda m: f"<script>\n{(ROOT / m.group(1)).read_text(encoding='utf-8')}</script>",
        html,
    )

    html = re.sub(
        r'src="(assets/img/[^"]+)"',
        lambda m: f'src="{data_uri(ROOT / m.group(1))}"',
        html,
    )

    leftovers = re.findall(r'(?:href|src)="assets/[^"]+"', html)
    if leftovers:
        sys.exit(f"Not inlined: {leftovers}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
