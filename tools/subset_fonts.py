"""Субсет вариативных шрифтов до кириллицы+латиницы+технических знаков, WOFF2."""
import pathlib, subprocess, sys
root = pathlib.Path(__file__).resolve().parents[1]
UNI = ("U+0020-007E,U+00A0-00FF,U+0400-045F,U+0451,U+0401,U+2116,"
       "U+2190-2199,U+2010-2014,U+2018-201F,U+00AB,U+00BB,U+2026,U+2022,U+00B7,U+2039-203A,U+2032-2033,"
       "U+2212,U+2264-2265")
pairs = [("unbounded.ttf","unbounded-var.woff2"),("golos.ttf","golos-var.woff2"),("martian.ttf","martian-var.woff2")]
out = root/"src/fonts"; out.mkdir(parents=True, exist_ok=True)
for src, dst in pairs:
    cmd = [sys.executable, "-m", "fontTools.subset", str(root/"source/fonts"/src),
           f"--unicodes={UNI}", "--layout-features=*", "--flavor=woff2",
           "--no-hinting", "--desubroutinize", f"--output-file={out/dst}"]
    subprocess.run(cmd, check=True)
    print(dst, round((out/dst).stat().st_size/1024), "КБ")
