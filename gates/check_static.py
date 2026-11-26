"""Офлайн, растры, доступность-каркас, лицензии (спека §15)."""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
RASTER = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".bmp", ".ico"}
fails = []

for f in DIST.rglob("*"):
    if f.is_file() and f.suffix.lower() in RASTER:
        fails.append(f"растр: {f.relative_to(DIST)}")

for f in DIST.rglob("*.html"):
    h = f.read_text(encoding="utf-8")
    if re.search(r'<script[^>]+src="https?://', h) or re.search(r'<img[^>]+src="https?://', h):
        fails.append(f"{f.name}: внешний ассет")
    if re.search(r'<link[^>]+rel="(stylesheet|preload|icon|manifest)"[^>]+href="https?://', h):
        fails.append(f"{f.name}: внешний стиль/шрифт")
    if 'lang="' not in h:
        fails.append(f"{f.name}: нет lang")
    if 'class="skip' not in h:
        fails.append(f"{f.name}: нет skip-link")
    if 'id="main"' not in h:
        fails.append(f"{f.name}: нет main")

css = "\n".join(p.read_text(encoding="utf-8") for p in DIST.rglob("*.css"))
if "prefers-reduced-motion" not in css:
    fails.append("css: нет prefers-reduced-motion")
if ":focus-visible" not in css:
    fails.append("css: нет :focus-visible")
for lic in ("OFL-Unbounded.txt", "OFL-GolosText.txt", "OFL-MartianMono.txt"):
    if not (DIST / "fonts" / lic).exists():
        fails.append(f"нет fonts/{lic}")

print("\n".join(fails[:20]) if fails else "static ok")
sys.exit(1 if fails else 0)
