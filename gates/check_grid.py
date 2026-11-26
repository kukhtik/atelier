"""Выравнивание по 12-колоночной сетке на 1440 (спека §10.3)."""
import pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"

JS = """() => {
  const bad = [];
  const grids = [...document.querySelectorAll('.grid')];
  if (!grids.length) return bad;
  for (const grid of grids) {
    const gr = grid.getBoundingClientRect();
    if (gr.width < 10) continue;
    const cs = getComputedStyle(grid);
    const cols = cs.gridTemplateColumns.split(' ').map(parseFloat).filter(n => !isNaN(n));
    if (cols.length !== 12 && innerWidth >= 1200) bad.push('колонок ' + cols.length);
    const gap = parseFloat(cs.columnGap) || 0;
    const step = (cols[0] || 1) + gap;
    for (const el of grid.children) {
      const r = el.getBoundingClientRect();
      if (r.width < 2) continue;
      const off = r.left - gr.left;
      const k = off / step;
      if (Math.abs(k - Math.round(k)) > 0.04) bad.push('плитка вне треков: ' + Math.round(off) + 'px');
      if (r.right > gr.right + 1) bad.push('плитка шире сетки');
    }
  }
  const first = grids[0].getBoundingClientRect();
  for (const head of document.querySelectorAll('.section-head')) {
    if (Math.abs(head.getBoundingClientRect().left - first.left) > 1) bad.push('заголовок секции вне сетки');
  }
  return bad;
}"""


def main():
    pages = sorted(DIST.glob("work/*/index.html")) + [DIST / "index.html", DIST / "work/index.html"]
    fails = []
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        ctx = b.new_context(viewport={"width": 1440, "height": 900})
        pg = ctx.new_page()
        for f in pages:
            if not f.exists():
                continue
            pg.goto(f.as_uri())
            pg.wait_for_timeout(60)
            for x in pg.evaluate(JS):
                fails.append(f"{f.relative_to(DIST).as_posix()}: {x}")
        b.close()
    print("\n".join(fails[:30]) if fails else f"grid ok: {len(pages)} страниц")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
