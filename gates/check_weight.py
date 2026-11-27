"""Бюджеты веса по СЕТЕВОЙ величине (gzip) — именно столько скачивает браузер.

Ревизия 26.11.2026: прежний порог считался по несжатому HTML (30/45/60 КБ) и был
привязан к пустому шаблону. Метрика заменена на gzip с более строгими порогами:
20 КБ на страницу, 15 КБ CSS, 8 КБ JS, 300 КБ первая загрузка.
"""
import gzip, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
KB = 1024
fails = []
LIM = {"page": 20, "css": 15, "js": 8, "first": 300}


def gz(p):
    return len(gzip.compress(p.read_bytes(), 9))


for f in DIST.rglob("*.html"):
    n = gz(f)
    if n > LIM["page"] * KB:
        fails.append(f"{f.relative_to(DIST)}: gzip {n/KB:.1f} КБ > {LIM['page']}")

for pat, lim in (("assets/*.css", LIM["css"]), ("assets/*.js", LIM["js"])):
    for f in DIST.glob(pat):
        if gz(f) > lim * KB:
            fails.append(f"{f.name}: gzip {gz(f)/KB:.1f} КБ > {lim}")

fonts = sum(f.stat().st_size for f in (DIST / "fonts").glob("*.woff2"))
if fonts > 240 * KB:
    fails.append(f"шрифты {fonts/KB:.0f} КБ > 240")

first = gz(DIST / "index.html") + sum(gz(f) for f in DIST.glob("assets/*") if f.suffix in (".css", ".js")) + fonts
if first > LIM["first"] * KB:
    fails.append(f"первая загрузка {first/KB:.0f} КБ > {LIM['first']}")

worst = max(((gz(f), f.relative_to(DIST).as_posix()) for f in DIST.rglob("*.html")))
print(f"первая загрузка ≈ {first/KB:.0f} КБ (html gzip, css gzip, js gzip, шрифты {fonts/KB:.0f} КБ)")
print(f"самая тяжёлая страница: {worst[1]} — {worst[0]/KB:.1f} КБ gzip")
print(chr(10).join(fails) if fails else "weight ok")
sys.exit(1 if fails else 0)
