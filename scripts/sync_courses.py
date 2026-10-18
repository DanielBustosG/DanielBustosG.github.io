#!/usr/bin/env python3
"""
Copia el material de estudio de los cursos al sitio y lo deja listo para publicar.

Uso (desde la carpeta Webpage):
    python3 scripts/sync_courses.py            # todos los cursos
    python3 scripts/sync_courses.py BGM411     # solo uno
    python3 scripts/sync_courses.py BGM324 "/otra/ruta/Material_Estudio"

Qué hace con cada curso:
  - Copia cada subcarpeta que tenga index.html (una por clase/unidad), con sus
    figuras y notebooks. Las carpetas de código fuente (common/, nb_src/) y los
    README no se publican.
  - Agrega a cada clase una barra superior para volver al índice del curso.
  - Aplica los reemplazos de enlaces definidos para el curso (por ejemplo, los
    botones "Open in Colab" de BGM411 apuntan al repositorio publicado).
  - En BGM411 genera BGM411_notebooks.zip con todos los notebooks.

Los originales NO se modifican. El índice de cada curso (BGM324/index.html,
BGM411/index.html) se mantiene a mano: si agregas una unidad, súmale su tarjeta.
"""
import re
import shutil
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = Path.home() / "Documents/Bioinformatica_BGM324"
REPO = "DanielBustosG/DanielBustosG.github.io"

COURSES = {
    "BGM324": {
        "src": DOCS / "Bioinformatica_BGM324/Material_Estudio",
        "label": "BGM324 &middot; Bioinform&aacute;tica",
        "replace": [],
    },
    "BGM411": {
        "src": DOCS / "IA_BGM411/Material_Estudio_IA",
        "label": "BGM411 &middot; Inteligencia Artificial",
        # Un .zip con todos los notebooks, enlazado desde BGM411/index.html.
        "zip": "BGM411_notebooks.zip",
        "replace": [
            # Botones "Open in Colab" / "View on GitHub": del marcador del build al repo real.
            ("USER/REPO/blob/main/IA/Material_Estudio_IA/", f"{REPO}/blob/main/BGM411/"),
            # Enlaces cruzados al material de bioinformática (estructura local de carpetas).
            ("../../Material_Estudio/", "../../BGM324/"),
            ("../Material_Estudio/", "../BGM324/"),
        ],
    },
    # Material de apoyo (no son cursos formales).
    "Cheminformatics": {
        "src": DOCS / "ChemInformatics/Material",
        "label": "Quimioinform&aacute;tica &middot; Material de apoyo",
        "zip": "Cheminformatics_notebooks.zip",
        "replace": [
            ("USER/REPO/blob/main/ChemInformatics/Material/", f"{REPO}/blob/main/Cheminformatics/"),
        ],
    },
    "Caso_Ureasa": {
        "src": DOCS / "Example_Paperjavier",
        "label": "Caso de estudio &middot; Paper ureasa (IJMS 2026)",
        "zip": "Caso_Ureasa_notebooks.zip",
        "replace": [
            # Los datos se siguen leyendo del repositorio del paper; solo cambian los botones Colab/GitHub.
            ("DanielBustosG/Urease-provenance-audit/blob/main/teaching/Example_Paperjavier/",
             f"{REPO}/blob/main/Caso_Ureasa/"),
        ],
    },
}

MARK = "<!-- course-backbar -->"
OLD_MARK = "<!-- bgm324-backbar -->"
SKIP = shutil.ignore_patterns(".DS_Store", "Thumbs.db", "__pycache__", ".ipynb_checkpoints")


def backbar(label):
    return MARK + f"""
<nav class="course-backbar" aria-label="Curso" style="position:sticky;top:0;z-index:1000;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:8px 16px;background:#0f6f8c;color:#fff;font:600 14px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif">
  <a href="../" style="color:#fff;text-decoration:none">&larr; {label}</a>
  <a href="../../" style="color:#fff;text-decoration:none;opacity:.85;font-weight:500">Daniel Bustos &middot; LBQC-UCM</a>
</nav>
"""


def inject(text, label):
    if MARK in text or OLD_MARK in text:
        return text
    m = re.search(r"<body[^>]*>", text, flags=re.I)
    bar = backbar(label)
    return (text[: m.end()] + "\n" + bar + text[m.end():]) if m else bar + text


def sync(code, src):
    cfg = COURSES[code]
    if not src.is_dir():
        print(f"[{code}] no encuentro la carpeta: {src} (se omite)")
        return
    units = sorted(p for p in src.iterdir() if p.is_dir() and (p / "index.html").exists())
    dest = ROOT / code
    dest.mkdir(exist_ok=True)
    print(f"[{code}] {src}")
    for unit in units:
        out = dest / unit.name
        if out.exists():
            shutil.rmtree(out)
        shutil.copytree(unit, out, ignore=SKIP)
        for f in list(out.rglob("*.html")) + list(out.rglob("*.ipynb")):
            text = f.read_text(encoding="utf-8")
            new = text
            for old, rep in cfg["replace"]:
                new = new.replace(old, rep)
            if f.suffix == ".html" and f.name == "index.html" and f.parent == out:
                new = inject(new, cfg["label"])
            if new != text:
                f.write_text(new, encoding="utf-8")
        print(f"   {unit.name}: {sum(1 for x in out.rglob('*') if x.is_file())} archivos")
    if cfg.get("zip"):
        zpath = dest / cfg["zip"]
        folder = Path(cfg["zip"]).stem
        nbs = sorted(dest.glob("*/*.ipynb"))
        with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
            for nb in nbs:
                z.write(nb, f"{folder}/{nb.name}")
        print(f"   {zpath.name}: {len(nbs)} notebooks, {zpath.stat().st_size / 1e6:.1f} MB")
    print(f"   {len(units)} unidades → {code}/\n")


def main():
    args = sys.argv[1:]
    names = {k.lower(): k for k in COURSES}
    if args and args[0].lower() in names:
        code = names[args[0].lower()]
        src = Path(args[1]).expanduser() if len(args) > 1 else COURSES[code]["src"]
        sync(code, src)
    else:
        for code, cfg in COURSES.items():
            sync(code, cfg["src"])


if __name__ == "__main__":
    main()
