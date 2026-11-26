"""Скриншоты: матрица носителей и вьюпортов. Запуск: ./py scripts/shots.py [--all]"""
import pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
OUT = ROOT / "shots"
OUT.mkdir(exist_ok=True)

VIEWS = {"desktop": (1440, 900), "mobile": (390, 844)}
MEDIA = ["void", "cyanotype", "chiaroscuro", "vellum"]


def main():
    allmode = "--all" in sys.argv
    jobs = []
    if allmode:
        for m in MEDIA:
            for v in VIEWS:
                jobs.append(("", f"home-{m}-{v}.png", m, v))
        jobs += [
            ("work/", "work-void-desktop.png", "void", "desktop"),
            ("work/codebot/", "dossier-void-desktop.png", "void", "desktop"),
            ("work/codebot/", "dossier-void-mobile.png", "void", "mobile"),
            ("stack/", "stack-void-desktop.png", "void", "desktop"),
            ("contact/", "contact-vellum-mobile.png", "vellum", "mobile"),
        ]
    else:
        jobs = [("", f"home-{m}-{v}.png", m, v) for m in ("void", "vellum") for v in VIEWS]

    with sync_playwright() as pw:
        b = pw.chromium.launch()
        for route, name, medium, view in jobs:
            url = (DIST / route / "index.html").as_uri()
            if not (DIST / route / "index.html").exists():
                print("skip", name); continue
            w, h = VIEWS[view]
            ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
            pg = ctx.new_page()
            pg.add_init_script(f"localStorage.setItem('atelier.medium','{medium}')")
            pg.goto(url)
            pg.wait_for_timeout(350)
            pg.screenshot(path=str(OUT / name), full_page=True)
            print("shot", name)
            ctx.close()
        b.close()


if __name__ == "__main__":
    main()
