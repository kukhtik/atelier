"""Шрифты: woff2, покрытие всех символов контента, бюджет."""
import json, pathlib, sys
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parents[1]
need = set()
for p in (ROOT / "content").rglob("*.json"):
    need |= set(p.read_text(encoding="utf-8"))
for p in (ROOT / "dist").glob("*.html"):
    need |= set(p.read_text(encoding="utf-8"))
for p in (ROOT / "dist").rglob("*.html"):
    need |= set(p.read_text(encoding="utf-8"))
need |= set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:;!?()[]{}«»„“”—–-·/\\+*№%&@#_")
need |= {chr(c) for c in range(0x410, 0x450)} | {chr(0x401), chr(0x451)} | set("↗→↑↓←·")
need = {c for c in need if ord(c) >= 32}

fails, warns, total = [], [], 0
cover = set()
for name in ("unbounded-var", "golos-var", "martian-var"):
    f = ROOT / "src/fonts" / f"{name}.woff2"
    if not f.exists():
        fails.append(f"{name}: нет файла")
        continue
    total += f.stat().st_size
    if f.read_bytes()[:4] != b"wOF2":
        fails.append(f"{name}: не woff2")
        continue
    cmap = set(TTFont(str(f)).getBestCmap())
    cover |= cmap
    miss = sorted({c for c in need if ord(c) not in cmap})
    if miss:
        warns.append(f"{name}: нет {len(miss)} глифов (фолбэк), напр. {miss[:6]}")
miss_all = sorted({c for c in need if ord(c) not in cover})
if miss_all:
    fails.append(f"нет ни в одном семействе: {miss_all[:8]}")

print(f"fonts: {total/1024:.0f} КБ")
for w in warns:
    print("  warn:", w)
print("\n".join(fails) if fails else "fonts ok")
sys.exit(1 if fails else 0)
