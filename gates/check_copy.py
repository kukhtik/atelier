"""Копия: em dash в авторской латинице, точки в заголовках, uppercase только .dwg, филлеры."""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
site = json.load(open(ROOT / "content/site.json", encoding="utf-8"))
fails = []
FILTER = ["lorem ipsum", "revolutionary", "cutting-edge", "seamless experience", "leverage synergies"]


def walk(o, path=""):
    if isinstance(o, str):
        yield path, o
    elif isinstance(o, dict):
        for k, v in o.items():
            yield from walk(v, f"{path}.{k}")
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from walk(v, f"{path}[{i}]")


authored = {"ui": site.get("ui", {}), "manifest": site.get("manifest", {}), "hero": site.get("hero", {})}
for block, value in authored.items():
    for p, s in walk(value, block):
        if re.search(r"[A-Za-z][^—]*—[^—]*[A-Za-z]", s):
            fails.append(f"em dash в латинице: {p} = {s[:60]!r}")
        for w in FILTER:
            if w in s.lower():
                fails.append(f"филлер {w!r}: {p}")

css = "\n".join(p.read_text(encoding="utf-8") for p in (ROOT / "dist").rglob("*.css"))
for m in re.finditer(r"([^{}]+)\{([^}]*)\}", css):
    sel, body = m.group(1).strip(), m.group(2)
    if "text-transform: uppercase" not in body or ".dwg" in sel:
        continue
    ls = re.search(r"letter-spacing:\s*([0-9.]+)(em|rem)", body)
    if not ls or float(ls.group(1)) < 0.06:
        fails.append(f"uppercase без трекинга >=0.06em: {sel[:60]}")

for f in (ROOT / "dist").rglob("*.html"):
    h = f.read_text(encoding="utf-8")
    for m in re.finditer(r"<h[123][^>]*>(.*?)</h[123]>", h, re.S):
        txt = re.sub(r"<[^>]+>", "", m.group(1)).strip()
        if txt.endswith("."):
            fails.append(f"{f.name}: точка в заголовке {txt[:40]!r}")
    if "**" in re.sub(r"<script.*?</script>", "", h, flags=re.S):
        fails.append(f"{f.name}: сырая markdown-разметка в тексте")

print("\n".join(fails[:20]) if fails else "copy ok")
sys.exit(1 if fails else 0)
