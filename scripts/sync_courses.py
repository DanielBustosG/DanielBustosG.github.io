#!/usr/bin/env python3
"""
Copia el material de estudio de los cursos al sitio y lo deja listo para publicar.

Uso (desde la carpeta Webpage):
    python3 scripts/sync_courses.py            # todos los cursos
    python3 scripts/sync_courses.py BGM411     # ambas ediciones de BGM411 (o BGM411-R, BGM411-Python)
    python3 scripts/sync_courses.py BGM324 "/otra/ruta/Material_Estudio"

Qué hace con cada curso:
  - Copia cada subcarpeta que tenga index.html (una por clase/unidad), con sus
    figuras y notebooks. Las carpetas de código fuente (common/, nb_src/) y los
    README no se publican.
  - Agrega a cada clase una barra superior para volver al índice del curso.
  - Aplica los reemplazos de enlaces definidos para el curso (por ejemplo, los
    botones "Open in Colab" de BGM411 apuntan al repositorio publicado).
  - En los materiales con notebooks genera un .zip con todos ellos.
  - BGM411 tiene dos ediciones (Python y R) en BGM411/Python/ y BGM411/R/.

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
    # BGM411 tiene dos ediciones equivalentes, cada una en su subcarpeta.
    # "python3 scripts/sync_courses.py BGM411" sincroniza ambas.
    "BGM411-Python": {
        "src": DOCS / "IA_BGM411/Material_Estudio_IA_Python",
        "dest": "BGM411/Python",
        "home": "../../../",
        "label": "BGM411 &middot; Inteligencia Artificial &middot; Python",
        "zip": "BGM411_Python_notebooks.zip",
        "replace": [
            # Botones "Open in Colab" / "View on GitHub": del marcador del build al repo real.
            ("USER/REPO/blob/main/IA_BGM411/Material_Estudio_IA_Python/", f"{REPO}/blob/main/BGM411/Python/"),
            # Enlaces cruzados al material de bioinformática (estructura local de carpetas).
            ("../../Material_Estudio/", "../../../BGM324/"),
        ],
    },
    "BGM411-R": {
        "src": DOCS / "IA_BGM411/Material_Estudio_IA_R",
        "dest": "BGM411/R",
        "home": "../../../",
        "label": "BGM411 &middot; Inteligencia Artificial &middot; R",
        "zip": "BGM411_R_notebooks.zip",
        # El export desde R deja caracteres como <U+00F3> en vez de "ó": se corrigen al publicar.
        "fix_unicode_escapes": True,
        "replace": [
            ("USER/REPO/blob/main/IA_BGM411/Material_Estudio_IA_R/", f"{REPO}/blob/main/BGM411/R/"),
            ("../../Material_Estudio/", "../../../BGM324/"),
        ],
    },
    # Curso complementario de BGM324, unidades 1–5 del programa oficial (libro curricular).
    "Bioinformatics-Complementary": {
        "src": DOCS / "Bioinformatica_BGM324/Segun_libro_curricular",
        "label": "Bioinformatics &middot; complementary course",
        "replace": [
            # Enlaces a los documentos de BGM324 (en la carpeta local se llaman Material_Estudio).
            ("../../Material_Estudio/", "../../BGM324/"),
        ],
        # En la versión en español, esos enlaces apuntan a la versión en español de BGM324.
        "replace_es": [
            (r'(\.\./\.\./BGM324/[0-9A-Za-z_]+/)index\.html', r"\1index_es.html"),
            # Navegación entre unidades del mismo curso: a la versión en español.
            (r'href="\.\./(U[0-9AB]+_[A-Za-z_]+)/(?:index\.html)?"', r'href="../\1/index_es.html"'),
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
UNI_ESC = re.compile(r"(?:&lt;|<)U\+([0-9A-Fa-f]{4,6})(?:&gt;|>)")
SKIP = shutil.ignore_patterns(".DS_Store", "Thumbs.db", "__pycache__", ".ipynb_checkpoints")


def backbar(label, home="../../", other=None):
    """other = (texto, href) del documento en el otro idioma, si existe."""
    lang = ""
    if other:
        lang = (f'<a href="{other[1]}" style="color:#fff;text-decoration:none;border:1px solid rgba(255,255,255,.55);'
                f'border-radius:6px;padding:2px 10px;margin-right:14px">{other[0]}</a>')
    return MARK + f"""
<nav class="course-backbar" aria-label="Curso" style="position:sticky;top:0;z-index:1000;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:8px 16px;background:#0f6f8c;color:#fff;font:600 14px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif">
  <a href="../" style="color:#fff;text-decoration:none">&larr; {label}</a>
  <span>{lang}<a href="{home}" style="color:#fff;text-decoration:none;opacity:.85;font-weight:500">Daniel Bustos &middot; LBQC-UCM</a></span>
</nav>
"""


def inject(text, label, home="../../", other=None):
    if MARK in text or OLD_MARK in text:
        return text
    m = re.search(r"<body[^>]*>", text, flags=re.I)
    bar = backbar(label, home, other)
    return (text[: m.end()] + "\n" + bar + text[m.end():]) if m else bar + text


def sync(code, src):
    cfg = COURSES[code]
    if not src.is_dir():
        print(f"[{code}] no encuentro la carpeta: {src} (se omite)")
        return
    units = sorted(p for p in src.iterdir() if p.is_dir() and (p / "index.html").exists())
    dest = ROOT / cfg.get("dest", code)
    dest.mkdir(parents=True, exist_ok=True)
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
            if f.name == "index_es.html":
                for pat, rep in cfg.get("replace_es", []):
                    new = re.sub(pat, rep, new)
            if cfg.get("fix_unicode_escapes"):
                new = UNI_ESC.sub(lambda m: chr(int(m.group(1), 16)), new)
            if f.suffix == ".html" and f.parent == out and f.name in ("index.html", "index_es.html"):
                # Documentos con versión en español (index_es.html): enlace al otro idioma.
                if f.name == "index_es.html":
                    other = ("English", "./")
                elif (out / "index_es.html").exists():
                    other = ("Español", "index_es.html")
                else:
                    other = None
                new = inject(new, cfg["label"], cfg.get("home", "../../"), other)
            if new != text:
                f.write_text(new, encoding="utf-8")
        print(f"   {unit.name}: {sum(1 for x in out.rglob('*') if x.is_file())} archivos")
    if cfg.get("zip"):
        zpath = dest / cfg["zip"]
        folder = Path(cfg["zip"]).stem
        allnb = sorted(dest.glob("*/*.ipynb"))
        # Los notebooks traducidos (<carpeta>_es.ipynb) van en un zip aparte: <zip>_es.zip
        groups = [(zpath, folder, [n for n in allnb if not n.stem.endswith("_es")])]
        es = [n for n in allnb if n.stem.endswith("_es")]
        if es:
            groups.append((dest / f"{Path(cfg['zip']).stem}_es.zip", f"{folder}_es", es))
        for zp, fold, nbs in groups:
            with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED) as z:
                for nb in nbs:
                    z.write(nb, f"{fold}/{nb.name}")
            print(f"   {zp.name}: {len(nbs)} notebooks, {zp.stat().st_size / 1e6:.1f} MB")
    print(f"   {len(units)} unidades → {cfg.get('dest', code)}/\n")


def main():
    args = sys.argv[1:]
    names = {k.lower(): k for k in COURSES}
    if args and args[0].lower() in names:
        code = names[args[0].lower()]
        src = Path(args[1]).expanduser() if len(args) > 1 else COURSES[code]["src"]
        sync(code, src)
    elif args and any(k.startswith(args[0].lower() + "-") for k in names):
        # Grupo de ediciones, p. ej. "BGM411" → BGM411-Python y BGM411-R
        for k in names:
            if k.startswith(args[0].lower() + "-"):
                sync(names[k], COURSES[names[k]]["src"])
    else:
        for code, cfg in COURSES.items():
            sync(code, cfg["src"])


if __name__ == "__main__":
    main()
