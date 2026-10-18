#!/usr/bin/env python3
"""
Copia el material de estudio de BGM324 a la carpeta BGM324/ del sitio y agrega
a cada clase una barra superior para volver al índice del curso.

Uso (desde la carpeta Webpage):
    python3 scripts/sync_bgm324.py
    python3 scripts/sync_bgm324.py "/ruta/a/Material_Estudio"   # otra ubicación

Cada subcarpeta del material (01_Sequence_Alignment, 02_..., etc.) se copia tal
cual, con sus figuras. Los originales NO se modifican: la barra se agrega solo a
la copia publicada. Si agregas una clase nueva, súmala también a la lista UNITS
de BGM324/index.html para que aparezca en el índice del curso.
"""
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "BGM324"
DEFAULT_SRC = Path.home() / "Documents/Bioinformatica_BGM324/Bioinformatica_BGM324/Material_Estudio"

MARK = "<!-- bgm324-backbar -->"
BAR = MARK + """
<nav class="bgm324-backbar" aria-label="BGM324" style="position:sticky;top:0;z-index:1000;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:8px 16px;background:#0f6f8c;color:#fff;font:600 14px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif">
  <a href="../" style="color:#fff;text-decoration:none">&larr; BGM324 &middot; Bioinform&aacute;tica</a>
  <a href="../../" style="color:#fff;text-decoration:none;opacity:.85;font-weight:500">Daniel Bustos &middot; LBQC-UCM</a>
</nav>
"""

SKIP = {".DS_Store", "Thumbs.db"}


def inject(html_text):
    if MARK in html_text:
        return html_text
    m = re.search(r"<body[^>]*>", html_text, flags=re.I)
    if not m:
        return BAR + html_text
    return html_text[: m.end()] + "\n" + BAR + html_text[m.end():]


def main():
    src = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else DEFAULT_SRC
    if not src.is_dir():
        sys.exit(f"No encuentro la carpeta de material: {src}")

    units = sorted(p for p in src.iterdir() if p.is_dir() and (p / "index.html").exists())
    if not units:
        sys.exit(f"No hay subcarpetas con index.html en {src}")

    DEST.mkdir(exist_ok=True)
    for unit in units:
        out = DEST / unit.name
        if out.exists():
            shutil.rmtree(out)
        shutil.copytree(unit, out, ignore=shutil.ignore_patterns(*SKIP))
        page = out / "index.html"
        page.write_text(inject(page.read_text(encoding="utf-8")), encoding="utf-8")
        n = sum(1 for f in out.rglob("*") if f.is_file())
        print(f"  {unit.name}: {n} archivos")

    print(f"\nListo: {len(units)} clases copiadas a {DEST.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
