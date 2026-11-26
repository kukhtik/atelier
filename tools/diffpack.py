"""Review package без git: unified diff между снапшотами before/after."""
import sys, pathlib, difflib
root = pathlib.Path(__file__).resolve().parents[1]
n = sys.argv[1]
a = root/"docs/sdd/snapshots"/f"task{n}-before"
b = root/"docs/sdd/snapshots"/f"task{n}-after"
out = root/"docs/sdd"/f"task{n}-review.diff"
def files(d):
    if not d.exists(): return {}
    return {p.relative_to(d).as_posix(): p for p in d.rglob("*") if p.is_file()}
A, B = files(a), files(b)
lines = []; stats = []
for f in sorted(set(A) | set(B)):
    ta = A[f].read_text(encoding="utf-8", errors="replace").splitlines(keepends=True) if f in A else []
    tb = B[f].read_text(encoding="utf-8", errors="replace").splitlines(keepends=True) if f in B else []
    if ta == tb: continue
    d = list(difflib.unified_diff(ta, tb, fromfile=f"a/{f}", tofile=f"b/{f}", n=3))
    lines += d
    stats.append(f"{f}: +{sum(1 for l in d if l.startswith('+') and not l.startswith('+++'))} -{sum(1 for l in d if l.startswith('-') and not l.startswith('---'))}")
out.write_text("".join(lines) if len(lines) < 400000 else "".join(lines[:400000]), encoding="utf-8")
print("\n".join(stats)); print(f"package: {out} ({len(lines)} строк)")
