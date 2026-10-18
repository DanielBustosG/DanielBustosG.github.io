#!/usr/bin/env python3
"""
Regenera data/publications.json desde OpenAlex.

Uso (Mac, Linux o Windows; solo biblioteca estándar, sin pip install):
    python3 scripts/update_publications.py

También lo ejecuta automáticamente cada semana la GitHub Action
.github/workflows/update-publications.yml, que hace commit del JSON si cambió.

La página lee OpenAlex en vivo al cargar; este archivo es el respaldo que se usa
si OpenAlex no responde. La configuración (filtros, blocklist, papers manuales)
vive en data/pub-config.json y la comparten este script y assets/js/app.js.
"""
import datetime
import html
import json
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG_FILE = ROOT / "data" / "pub-config.json"
OUT_FILE = ROOT / "data" / "publications.json"

SELECT = ",".join([
    "id", "doi", "title", "publication_year", "cited_by_count",
    "type", "biblio", "primary_location", "open_access", "authorships",
])


# ── normalización: debe coincidir con normTitle()/titleKey() de app.js ──
def strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFD", s or "")
                   if unicodedata.category(c) != "Mn")


def norm_title(s):
    s = re.sub(r"[^a-z0-9 ]", "", strip_accents(s).lower())
    return re.sub(r"\s+", " ", s).strip()


def title_key(s):
    return re.sub(r"[^a-z0-9]", "", strip_accents(s).lower())


def clear_markup(s):
    if not s:
        return ""
    s = html.unescape(html.unescape(s))  # algunos títulos vienen doblemente escapados
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", s).strip()


# ── OpenAlex ──
def get_json(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json",
                                                       "User-Agent": "lbqc-website-updater"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except Exception as exc:  # red intermitente: reintenta con espera creciente
            if attempt == retries - 1:
                raise
            print(f"  reintento ({exc})", file=sys.stderr)
            time.sleep(3 * (attempt + 1))


def fetch_filter(flt, mailto):
    out, cursor = [], "*"
    while cursor:
        url = ("https://api.openalex.org/works?" + urllib.parse.urlencode({
            "filter": flt, "per-page": 200, "cursor": cursor,
            "select": SELECT, "mailto": mailto}))
        page = get_json(url)
        res = page.get("results") or []
        out.extend(res)
        cursor = (page.get("meta") or {}).get("next_cursor")
        if not res:
            break
    print(f"  {flt} -> {len(out)} registros")
    return out


def from_openalex(w):
    loc = w.get("primary_location") or {}
    src = loc.get("source") or {}
    bib = w.get("biblio") or {}
    oa = w.get("open_access") or {}
    fp, lp = bib.get("first_page"), bib.get("last_page")
    authors = []
    for a in w.get("authorships") or []:
        n = a.get("raw_author_name") or (a.get("author") or {}).get("display_name")
        if n:
            authors.append(n)
    return {
        "id": w.get("id"),
        "title": clear_markup(w.get("title")),
        "authors": authors,
        "venue": src.get("display_name"),
        "year": w.get("publication_year"),
        "volume": bib.get("volume"),
        "issue": bib.get("issue"),
        "pages": f"{fp}-{lp}" if fp and lp else fp,
        "doi": w.get("doi"),
        "url": w.get("doi") or loc.get("landing_page_url"),
        "oa_url": oa.get("oa_url"),
        "citations": int(w.get("cited_by_count") or 0),
        "type": w.get("type"),
    }


def from_extra(w):
    return {
        "id": w.get("doi") or w.get("title"),
        "title": w.get("title", ""),
        "authors": w.get("authors", []),
        "venue": w.get("venue"),
        "year": w.get("year"),
        "volume": w.get("volume"),
        "issue": w.get("issue"),
        "pages": w.get("pages"),
        "doi": w.get("doi"),
        "url": w.get("url") or w.get("doi"),
        "oa_url": w.get("oa_url"),
        "citations": int(w.get("citations") or 0),
        "type": w.get("type") or "article",
        "manual": True,
    }


def clean(pubs, cfg):
    """Filtro de año, blocklist de homónimos y deduplicado (igual que dedupe() en app.js)."""
    min_year = cfg.get("minYear")
    block = set(cfg.get("blocklist") or [])
    by_key = {}
    for p in pubs:
        if not p["title"]:
            continue
        if min_year and p["year"] and p["year"] < min_year:
            continue
        if norm_title(p["title"]) in block:
            print(f"  excluido (homónimo): {p['title']}")
            continue
        k = title_key(p["title"])
        prev = by_key.get(k)
        if prev is None or p["citations"] > prev["citations"]:
            by_key[k] = p
    return sorted(by_key.values(), key=lambda p: (-(p["year"] or 0), -p["citations"]))


def metrics(pubs):
    c = sorted((p["citations"] for p in pubs), reverse=True)
    h = sum(1 for i, v in enumerate(c) if v >= i + 1)
    return {"works": len(pubs), "citations": sum(c), "h_index": h,
            "i10_index": sum(1 for v in c if v >= 10)}


def main():
    cfg = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    raw = []
    for flt in cfg["authorFilters"]:
        raw.extend(fetch_filter(flt, cfg.get("mailto", "")))
    if not raw:
        sys.exit("OpenAlex no devolvió resultados; no se sobrescribe el respaldo.")

    pubs = [from_openalex(w) for w in raw] + [from_extra(w) for w in cfg.get("extraWorks") or []]
    works = clean(pubs, cfg)
    m = metrics(works)

    payload = {
        "generated": datetime.date.today().isoformat(),
        "source": "OpenAlex",
        "filters": cfg["authorFilters"],
        "count": m["works"],
        "citations": m["citations"],
        "h_index": m["h_index"],
        "i10_index": m["i10_index"],
        "works": works,
    }
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nEscrito {OUT_FILE.relative_to(ROOT)}: {m['works']} publicaciones, "
          f"{m['citations']} citas, h = {m['h_index']}, i10 = {m['i10_index']}")


if __name__ == "__main__":
    main()
