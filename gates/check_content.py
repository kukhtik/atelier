import json, re, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
SLUGS = ["codebot","engineer-companion","geoconverter","hermes-viz","neuro-property-trade",
         "penapivo","razgon-kviz","static-sites","storybeam","streaming-prediction","swarm",
         "trading-stand","vetka-dwg","vtuber-rigger"]
NUM = re.compile(r"\d[\d  ,.]*")
def readme_text(lang):
    f = ROOT/"source/Open_space"/("README.ru.md" if lang=="ru" else "README.md")
    return f.read_text(encoding="utf-8")
def blocks_text(blocks):
    out=[]
    for b in blocks:
        if b["t"]=="p": out.append(b["v"])
        elif b["t"]=="ul": out+=b["v"]
        # append, not +=: out is a list, so += "text" would extend it char by char
        elif b["t"]=="table": out.append(" ".join(b["head"])+ " " + " ".join(" ".join(r) for r in b["rows"]))
    return " ".join(out)
fails=[]
for slug in SLUGS:
    p = ROOT/"content/projects"/f"{slug}.json"
    if not p.exists(): fails.append(f"{slug}: файла нет"); continue
    d = json.loads(p.read_text(encoding="utf-8"))
    for lang in ("ru","en"):
        txt = blocks_text(d["context"][lang])
        if len(txt) < 300: fails.append(f"{slug}/{lang}: контекст короче 300 знаков")
        src = readme_text(lang)
        for m in NUM.findall(txt):
            tok = m.strip()
            if len(tok.replace(" ","")) < 2: continue
            if tok not in src: fails.append(f"{slug}/{lang}: число {tok!r} нет в README")
    if "![" in json.dumps(d, ensure_ascii=False): fails.append(f"{slug}: картинка в контенте")
    if not d.get("metrics"): fails.append(f"{slug}: нет метрик")
site = json.loads((ROOT/"content/site.json").read_text(encoding="utf-8"))
for k in ("name","role","manifest","about","record","facts","ui"):
    if not site.get(k): fails.append(f"site.json: нет {k}")
print("\n".join(fails) if fails else f"content ok: {len(SLUGS)} проектов")
sys.exit(1 if fails else 0)
