"""Прогон всех гейтов. Ненулевой код при любом провале."""
import subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
GATES = [
    "check_content.py",
    "check_contrast.py",
    "check_seo.py",
    "check_layout.py",
    "check_grid.py",
    "check_weight.py",
    "check_copy.py",
    "check_static.py",
    "check_fonts.py",
]

results = []
for g in GATES:
    p = subprocess.run([sys.executable, str(ROOT / "gates" / g)], capture_output=True, text=True, cwd=ROOT)
    out = (p.stdout or "").strip().splitlines()
    last = out[-1] if out else ""
    results.append((g, p.returncode, last))
    print(f"[{'PASS' if p.returncode == 0 else 'FAIL'}] {g}: {last}")
    if p.returncode != 0 and len(out) > 1:
        for line in out[:-1][:6]:
            print("      ", line)

bad = [g for g, rc, _ in results if rc != 0]
print(f"\n{len(results) - len(bad)}/{len(results)} гейтов зелёные")
sys.exit(1 if bad else 0)
