"""Контраст по четырём носителям (WCAG 2.x). Источник порогов — спека §15."""
import re, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
css = (ROOT / "src/css/tokens.css").read_text(encoding="utf-8")


def lum(hexs):
    h = hexs.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


MEDIA = ["void", "cyanotype", "chiaroscuro", "vellum"]
TH = {
    "fg-primary": 7.0,
    "fg-secondary": 4.5,
    "line-structural": 3.0,
    "accent-primary": 4.5,
    "accent-secondary": 4.5,
}
fails, rows = [], []
for m in MEDIA:
    block = re.search(r'\[data-medium="%s"\]\s*\{(.*?)\}' % m, css, re.S)
    if not block:
        fails.append(f"{m}: блока нет")
        continue
    tok = dict(re.findall(r"--([a-z-]+):\s*(#[0-9A-Fa-f]{6})", block.group(1)))
    for k, t in TH.items():
        if k not in tok:
            fails.append(f"{m}: нет --{k}")
            continue
        r = ratio(tok[k], tok["bg"])
        rows.append(f"{m:12s} {k:17s} {r:5.2f} (порог {t})")
        if r < t:
            fails.append(f"{m}: {k} = {r:.2f} < {t}")
    for k, t in (("line-structural", 3.0), ("fg-secondary", 4.5)):
        r = ratio(tok[k], tok["surface"])
        rows.append(f"{m:12s} {k:17s} {r:5.2f} (vs surface, порог {t})")
        if r < t:
            fails.append(f"{m}: {k} vs surface = {r:.2f} < {t}")
    # декоративная сетка обязана быть слабее структурной линии — иначе путает
    if "line-grid-decor" in tok and ratio(tok["line-grid-decor"], tok["bg"]) >= ratio(tok["line-structural"], tok["bg"]):
        fails.append(f"{m}: line-grid-decor не слабее line-structural")

print("\n".join(rows))
print("\n".join(fails) if fails else "contrast ok: 4 носителя")
sys.exit(1 if fails else 0)
