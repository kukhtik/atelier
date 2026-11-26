"""SEO-каркас: lang, hreflang, description, JSON-LD, canonical."""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
pages = sorted(DIST.rglob("*.html"))
fails = []
want = 38

for f in pages:
    h = f.read_text(encoding="utf-8")
    lang = "en" if f.relative_to(DIST).as_posix().startswith("en/") else "ru"
    if f'<html lang="{lang}"' not in h:
        fails.append(f"{f.relative_to(DIST)}: lang")
    for hl in ("ru", "en", "x-default"):
        if f'rel="alternate" hreflang="{hl}"' not in h:
            fails.append(f"{f.relative_to(DIST)}: hreflang {hl}")
    if 'name="description" content=""' in h or 'name="description"' not in h:
        fails.append(f"{f.relative_to(DIST)}: description")
    if "application/ld+json" not in h:
        fails.append(f"{f.relative_to(DIST)}: jsonld")
    if 'rel="canonical"' not in h:
        fails.append(f"{f.relative_to(DIST)}: canonical")

if len(pages) != want:
    fails.append(f"страниц {len(pages)}, ожидалось {want}")

print("\n".join(fails[:20]) if fails else f"seo ok: {len(pages)} страниц")
sys.exit(1 if fails else 0)
