"""Раскладка: переполнение, обрезка, наложения, зоны нажатия. Playwright."""
import pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"

JS = """() => {
  const de = document.documentElement, bad = [];
  if (de.scrollWidth > de.clientWidth + 1) bad.push('overflow ' + de.scrollWidth + '>' + de.clientWidth);
  for (const el of document.querySelectorAll('p,li,h1,h2,h3,td,th,dd,dt,span,a,code')) {
    const cs = getComputedStyle(el);
    if (cs.overflow === 'visible' && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0)
      bad.push('clip ' + el.tagName + '.' + (el.className || '') + ' ' + el.scrollWidth + '>' + el.clientWidth);
  }
  const s = [...document.querySelectorAll('main > section, main > article')].map(e => e.getBoundingClientRect());
  for (let i = 0; i < s.length - 1; i++) if (s[i].bottom > s[i + 1].top + 1) bad.push('overlap sections ' + i);
  if (innerWidth < 500) for (const el of document.querySelectorAll('a,button')) {
    const cs = getComputedStyle(el);
    if (el.tagName === 'A' && cs.display === 'inline' && el.closest('p,li,td,dd,figcaption')) continue;
    const r = el.getBoundingClientRect();
    if (r.width && r.height && (r.width < 24 || r.height < 24))
      bad.push('tap ' + el.tagName + ' ' + (el.textContent || '').trim().slice(0, 18) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
  }
  return bad;
}"""


def main():
    pages = sorted(p for p in DIST.rglob("*.html"))
    if not pages:
        print("dist пуст")
        return 1
    fails = []
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        for w, h, label in ((1440, 900, "desktop"), (390, 844, "mobile")):
            ctx = b.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce")
            pg = ctx.new_page()
            for f in pages:
                pg.goto(f.as_uri())
                pg.wait_for_timeout(60)
                for x in pg.evaluate(JS):
                    fails.append(f"{label} {f.relative_to(DIST).as_posix()}: {x}")
            ctx.close()
        b.close()
    print("\n".join(fails[:40]) if fails else f"layout ok: {len(pages)} страниц × 2 вьюпорта")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
