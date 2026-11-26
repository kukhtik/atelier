"""Бюджеты веса (спека §15)."""
import pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
KB = 1024
fails = []
LIM = {"work": 60, "stack": 60, "dossier": 45, "other": 30}

html_total = 0
for f in DIST.rglob("*.html"):
    rel = f.relative_to(DIST).as_posix()
    route = rel[3:] if rel.startswith("en/") else rel
    if route.startswith("work/") and route.count("/") == 1:
        lim = LIM["work"]
    elif route.startswith("work/"):
        lim = LIM["dossier"]
    elif route.startswith("stack/"):
        lim = LIM["stack"]
    else:
        lim = LIM["other"]
    n = f.stat().st_size
    html_total += n
    if n > lim * KB:
        fails.append(f"{rel}: {n/KB:.0f} КБ > {lim}")

for pat, lim in (("assets/*.css", 45), ("assets/*.js", 10)):
    for f in DIST.glob(pat):
        if f.stat().st_size > lim * KB:
            fails.append(f"{f.name}: {f.stat().st_size/KB:.0f} КБ > {lim}")

fonts = sum(f.stat().st_size for f in (DIST / "fonts").glob("*.woff2"))
if fonts > 240 * KB:
    fails.append(f"шрифты {fonts/KB:.0f} КБ > 240")

# первая загрузка: главная + css + js + шрифты
first = (DIST / "index.html").stat().st_size + sum(
    f.stat().st_size for f in DIST.glob("assets/*") if f.suffix in (".css", ".js")
) + fonts
if first > 400 * KB:
    fails.append(f"первая загрузка {first/KB:.0f} КБ > 400")

print(f"первая загрузка ≈ {first/KB:.0f} КБ (html {html_total/KB:.0f} КБ суммарно, шрифты {fonts/KB:.0f} КБ)")
print("\n".join(fails) if fails else "weight ok")
sys.exit(1 if fails else 0)
