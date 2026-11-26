# Atelier — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать статический двуязычный сайт-портфолио «чертёжное бюро» на `https://kukhtik.github.io/atelier/` из реального контента (14 проектов) в визуальном языке архитектурного авангарда, с машинной приёмкой на каждом шаге.

**Architecture:** JSON-контент → собственный сборщик на node без зависимостей → `dist/` из 38 HTML-страниц (19 RU + 19 EN), один CSS, один JS, самохостинг субсетов WOFF2. Графика — SVG, генерируемая сборщиком из данных (планометрия слоёв, граф технологий). Приёмка — 7 python-гейтов на Playwright и файловых метриках.

**Tech Stack:** node 24 ESM (0 зависимостей), CSS (Subgrid, oklch, clip-path), inline SVG, Python 3.12 + Playwright (Chromium 148) + fontTools 4.63, GitHub Pages (Actions).

**Spec:** `docs/superpowers/specs/2026-11-26-atelier-site-design.md` — числа, токены, IA, пороги. При расхождении плана и спеки побеждает спека; расхождение фиксируется в `docs/decisions.md`.

## Global Constraints

- Сборка: `node build/build.mjs` из корня проекта, **без npm-зависимостей**; в CI не нужен `npm install`.
- Все пути в `dist/` — относительные (сайт живёт в подпапке `/atelier/`).
- Ноль внешних ассетов: ни `<script src="http://…">`, ни `<link href="https://fonts…">`, ни `<img src="http…">`.
- Ноль растровых изображений в `dist/` (`.png .jpg .jpeg .gif .webp .avif`).
- Токены 4 носителей — ровно значения §10.1 спеки, без правок значений.
- Типографика: Unbounded (дисплей), Golos Text (текст), Martian Mono (техника); шкала √2 от 16px.
- Текстовая копия: авторская — без em dash в латинице, без точки в заголовках, `text-transform: uppercase` только у `.dwg`.
- Доступность: контрасты §15, `:focus-visible` везде, skip-link, `prefers-reduced-motion`, зона нажатия ≥44×44 на 390px.
- Гейты fail-closed; пороги не подгоняются под результат.
- Git: профиль не коммитит и не пушит (`hooks/gate.py`). Чекпойнт задачи — запись в `HANDOFF.md` + `dist/` на диске. Публикация — отдельная задача через GitHub API.

## Review Focus

1. **Длинные русские слова в Unbounded на 390px** («Могилёвский», «исследовательский») — должны переноситься или уменьшаться, а не вылезать за экран. Тест: `check_layout` на 390 у досье с самым длинным заголовком.
2. **Длинные URL и токены стека в таблицах** (URL 68 символов у storybeam) — обязаны ломаться, не растягивая страницу. Тест: `check_layout` + `overflow-wrap: anywhere` на `a`, `code`, `td`.
3. **Переключение носителя на странице с открытым фокусом** — кольцо фокуса должно оставаться видимым во всех 4 палитрах. Тест: `check_contrast` по `--accent-primary` vs `--bg` (кольцо 2px + офсет).
4. **`prefers-reduced-motion: reduce`** — ни одного перехода, страница читается. Тест: `check_static` ищем `prefers-reduced-motion` + `check_layout` с эмуляцией.
5. **Инлайновая разметка в ячейках таблиц** (`` `javac` ``, `**Проблема.**`) — не должна ломать таблицу или выводить сырые звёздочки. Тест: `inline()` + отсутствие `**` в тексте `dist`.

---

## File Structure

```
atelier-v1/
  content/site.json                  сайт, ui-строки, манифест, контакты
  content/projects/<slug>.json       14 проектов (контекст из README, метрики из site-full.json)
  content/stack.json                 узлы технологий + слои + проекты-носители
  build/build.mjs                    точка входа: читает content, пишет dist
  build/lib/content.mjs              загрузка + валидация контента
  build/lib/inline.mjs               **b** / `code` / [t](u) с экранированием
  build/lib/html.mjs                 escape(), attr(), join()
  build/lib/axonometry.mjs           планометрия слоёв → SVG
  build/lib/graph.mjs                граф узлов → SVG
  build/lib/seo.mjs                  title/description/canonical/hreflang/JSON-LD
  build/tpl/layout.mjs               каркас: сетка, оси, рейка, штамп
  build/tpl/home.mjs  work.mjs  dossier.mjs  stack.mjs  about.mjs  contact.mjs
  src/css/tokens.css  base.css  grid.css  components.css  mediums.css  fonts.css
  src/js/site.js                     носитель, режим досье, координаты указателя
  src/fonts/*.woff2                  субсеты + OFL
  tools/extract_content.mjs          README + site-full.json → черновики content/projects
  tools/subset_fonts.py              fontTools: субсет + woff2
  gates/check_content.py  check_contrast.py  check_layout.py  check_grid.py
  gates/check_weight.py  check_copy.py  check_static.py
  scripts/run_all.py                 прогон всех гейтов, ненулевой код при провале
  scripts/shots.py                   матрица скриншотов
  shots/  docs/  HANDOFF.md  dist/
```

---

### Task 1: Контентный корпус (14 проектов из реальных источников)

**Files:**
- Create: `tools/extract_content.mjs`, `content/site.json`, `content/stack.json`, `content/projects/*.json`
- Test: `gates/check_content.py`

**Interfaces:**
- Consumes: `source/Open_space/README.ru.md`, `source/Open_space/README.md`, `workspace/lcars-v6/content/site-full.json`.
- Produces: `content/projects/<slug>.json` со схемой
  ```json
  {"slug":"codebot","index":"01","title":{"ru":"Codebot","en":"Codebot"},
   "status":"prototype|production|rnd","years":null,
   "confidentiality":{"ru":"…","en":"…"},
   "summary":{"ru":"…","en":"…"},
   "metrics":[{"name":{"ru":"…","en":"…"},"value":"63","note":""}],
   "results":[{"value":"<1 mm","label":{"ru":"…","en":"…"}}],
   "stack":"Java 21 · …","link":"https://…",
   "context":{"ru":[Block],"en":[Block]},
   "approach":{"ru":["…"],"en":["…"]}}
  ```
  `Block` = `{"t":"p","v":"…"}` | `{"t":"ul","v":["…"]}` | `{"t":"table","head":["…"],"rows":[["…"]]}`.
- Produces: `content/site.json` (`name/role/location/timezone/email/github/linkedin/cv/availability/manifest/about/record/facts/services/more/ui`), `content/stack.json` (`{"layers":[{"id","label":{ru,en}}],"nodes":[{"id","label","layer","note"}],"projects":{"<node>":["<slug>"]}}`).

- [ ] **Step 1: Write the failing test**

```python
# gates/check_content.py
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
        elif b["t"]=="table": out+=" ".join(b["head"])+ " " + " ".join(" ".join(r) for r in b["rows"])
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python gates/check_content.py`
Expected: FAIL — 14 строк «файла нет».

- [ ] **Step 3: Implement `tools/extract_content.mjs`**

Правила: README режется по `^## `; заголовок мапится на slug по таблице `title→slug` (14 пар, задаются в скрипте явно); внутри секции абзацы → `p`, списки `-` → `ul`, GFM-таблицы → `table`, `![…](…)` удаляются, `---` отбрасывается, H3 подсекции становятся `p` с `**жирным**` лидом. Метрики и `results` берутся из `site-full.json` без изменений; `status` — из приложения А спеки; `years: null`; `confidentiality` — из `site-full.json`. Скрипт пишет черновики и печатает число блоков на проект.

- [ ] **Step 4: Curate**

Пройти 14 файлов: убрать машинные артефакты, свести `approach` к 3–5 пунктам, собрать `content/stack.json` по правилу §13.1 спеки (73 токена → узлы, слой по роли), `content/site.json` — из `site-full.json` + `ui` (метки RU/EN: `ЧЕРТЁЖИ`, `ПОДХОД`, `УЗЛЫ`, `КОНТАКТ`, `КОНСТРУКТИВ`, `КОНТЕКСТ`, `НОСИТЕЛЬ`, `ЯЗЫК`, `МАСШТАБ 1:1`, `ЛИСТ`) + `manifest` (2 тезиса).

- [ ] **Step 5: Run test to verify it passes**

Run: `python gates/check_content.py`
Expected: `content ok: 14 проектов`, exit 0.

---

### Task 2: Токены четырёх носителей и базовая типографика

**Files:**
- Create: `src/css/tokens.css`, `src/css/base.css`, `src/css/mediums.css`, `gates/check_contrast.py`

**Interfaces:**
- Produces: `html[data-medium="void|cyanotype|chiaroscuro|vellum"]` задаёт `--bg --surface --fg-primary --fg-secondary --line-structural --line-grid-decor --accent-primary --accent-secondary`; `:root` дополнительно `--type-*`, `--space-*`, `--angle-*`.

- [ ] **Step 1: Write the failing test**

```python
# gates/check_contrast.py — парсит tokens.css, считает WCAG-отношения
import re, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
css = (ROOT/"src/css/tokens.css").read_text(encoding="utf-8")
def lum(hexs):
    h = hexs.lstrip("#"); c = [int(h[i:i+2],16)/255 for i in (0,2,4)]
    c = [x/12.92 if x <= 0.04045 else ((x+0.055)/1.055)**2.4 for x in c]
    return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2]
def ratio(a,b):
    la,lb = sorted((lum(a),lum(b)), reverse=True); return (la+0.05)/(lb+0.05)
MEDIA = ["void","cyanotype","chiaroscuro","vellum"]
TH = {"fg-primary":7.0,"fg-secondary":4.5,"line-structural":3.0,"accent-primary":4.5,"accent-secondary":4.5}
fails=[]; rows=[]
for m in MEDIA:
    block = re.search(r'\[data-medium="%s"\]\s*\{(.*?)\}' % m, css, re.S)
    if not block: fails.append(f"{m}: блока нет"); continue
    tok = dict(re.findall(r'--([a-z-]+):\s*(#[0-9A-Fa-f]{6})', block.group(1)))
    for k,t in TH.items():
        if k not in tok: fails.append(f"{m}: нет --{k}"); continue
        r = ratio(tok[k], tok["bg"]); rows.append(f"{m:12s} {k:17s} {r:5.2f} (порог {t})")
        if r < t: fails.append(f"{m}: {k} = {r:.2f} < {t}")
    for k in ("line-structural","fg-secondary"):
        r = ratio(tok[k], tok["surface"])
        if r < (3.0 if k=="line-structural" else 4.5): fails.append(f"{m}: {k} vs surface = {r:.2f}")
print("\n".join(rows)); print("\n".join(fails) if fails else "contrast ok: 4 носителя")
sys.exit(1 if fails else 0)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python gates/check_contrast.py`
Expected: FAIL — `tokens.css` не найден (FileNotFoundError) → создать файл на шаге 3.

- [ ] **Step 3: Write `tokens.css` + `base.css` + `mediums.css`**

Токены — дословно §10.1 спеки (8 значений × 4 носителя + `--taut-*` в тёмных носителях). `base.css`: `@supports (color: oklch(50% 0.1 200))` переопределения, шкала `--type-11-31: 11.31px … --type-64: 64px`, `line-height: 1.7` для прозы, `max-width: 65ch`, `border-radius: 0`, `.dwg` (Martian Mono, 11.31–13.45px, `letter-spacing: .08em`), `:focus-visible {outline: 2px solid var(--accent-primary); outline-offset: 2px}`, `@media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important}}`.

- [ ] **Step 4: Run test to verify it passes**

Run: `python gates/check_contrast.py`
Expected: таблица 24+ отношений, `contrast ok: 4 носителя`, минимум по акцентам ≥ 4.5 (chiaroscuro accent-secondary ≈ 5.73).

---

### Task 3: Каркас страницы, 12-колоночная сетка, штамп, главная

**Files:**
- Create: `build/build.mjs`, `build/lib/content.mjs`, `build/lib/html.mjs`, `build/tpl/layout.mjs`, `build/tpl/home.mjs`, `src/css/grid.css`, `src/css/components.css`, `src/js/site.js`, `gates/check_layout.py`
- Test: `gates/check_layout.py`

**Interfaces:**
- Consumes: `content/*.json` (Task 1), `tokens.css`/`base.css` (Task 2).
- Produces: `build/lib/content.mjs` → `loadContent(root) -> {site, projects, stack}`; `build/lib/html.mjs` → `escape(s)`, `pagePath(route, lang) -> "index.html" | "en/index.html" | …`; `build/tpl/layout.mjs` → `renderPage({lang, route, title, description, body, bodyClass}) -> string`; `src/js/site.js` — `window.__atelier = {setMedium(id), setMode(id), coords}`.

- [ ] **Step 1: Write the failing test**

```python
# gates/check_layout.py — Playwright, 1440×900 и 390×844
import pathlib, sys, json
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parents[1]
pages = sorted(p for p in (ROOT/"dist").rglob("*.html"))
fails = []
if not pages: print("dist пуст"); sys.exit(1)
with sync_playwright() as pw:
    b = pw.chromium.launch()
    for w,h,label in ((1440,900,"desktop"),(390,844,"mobile")):
        ctx = b.new_context(viewport={"width":w,"height":h}, reduced_motion="reduce")
        pg = ctx.new_page()
        for f in pages:
            pg.goto(f.as_uri()); pg.wait_for_timeout(50)
            r = pg.evaluate("""() => {
              const de=document.documentElement, bad=[];
              if (de.scrollWidth > de.clientWidth+1) bad.push('overflow '+de.scrollWidth+'>'+de.clientWidth);
              for (const el of document.querySelectorAll('p,li,h1,h2,h3,td,th,span,a')) {
                if (el.scrollWidth > el.clientWidth+1 && getComputedStyle(el).overflow !== 'visible')
                  bad.push('clip '+el.tagName+'.'+el.className);
              }
              const s=[...document.querySelectorAll('section')].map(e=>e.getBoundingClientRect());
              for (let i=0;i<s.length-1;i++) if (s[i].bottom > s[i+1].top+1) bad.push('overlap sections');
              if (innerWidth<500) for (const el of document.querySelectorAll('a,button')) {
                const r=el.getBoundingClientRect(); if (r.width && (r.width<44||r.height<44)) bad.push('tap '+el.textContent.trim().slice(0,20));
              }
              return bad; }""")
            for x in r: fails.append(f"{label} {f.relative_to(ROOT/'dist')}: {x}")
        ctx.close()
    b.close()
print("\n".join(fails[:40]) if fails else f"layout ok: {len(pages)} страниц × 2 вьюпорта")
sys.exit(1 if fails else 0)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python gates/check_layout.py`
Expected: FAIL — `dist пуст`.

- [ ] **Step 3: Implement `build.mjs`, `content.mjs`, `html.mjs`, `layout.mjs`, `home.mjs`, `grid.css`, `components.css`, `site.js`**

Сборка: `rm -rf dist` → склейка CSS в `dist/assets/site.css` → копирование `src/js/site.js` → рендер страниц → `dist/sitemap.xml`, `robots.txt`. Сетка: `.grid {display:grid; grid-template-columns: repeat(12, minmax(0,1fr)); gap: var(--gutter); padding-inline: var(--margin)}` с медиа-правилами 6/4 колонки; карточки — `grid-column: span n; display:grid; grid-template-columns: subgrid` внутри `@supports (grid-template-columns: subgrid)`. Секция: реперные крестики `+` (5×5, `aria-hidden`), буквы осей A–L на desktop. Штамп: `<footer class="titleblock">` — площадка, носитель (4 кнопки), язык, `МАСШТАБ 1:1 · ЛИСТ 01`, `v1.<hash>`. Главная: H1 Unbounded 64/45, манифест (2 тезиса), SVG-сфера в изометрии (радиус 220, меридианы 8, параллели 6, `vector-effect: non-scaling-stroke`), блок координат `X 0000 Y 0000`, три последних планшета, две ссылки.

- [ ] **Step 4: Run build + test to verify it passes**

Run: `node build/build.mjs && python gates/check_layout.py`
Expected: `dist/index.html` + `dist/en/index.html`; `layout ok: N страниц × 2 вьюпорта`.

- [ ] **Step 5: First render**

Run: `python scripts/shots.py` (создаётся здесь: 1440×900 и 390×844 для `/` и `/en/`, все 4 носителя)
Expected: 8 PNG в `shots/`, `home-void-desktop.png` открывается и показывает сетку, сферу, штамп.

---

### Task 4: Реестр планшетов, досье, планометрия, инлайновая разметка

**Files:**
- Create: `build/lib/inline.mjs`, `build/lib/axonometry.mjs`, `build/tpl/work.mjs`, `build/tpl/dossier.mjs`, `src/css/plate.css`, `gates/check_grid.py`
- Test: `build/lib/inline.test.mjs`, `build/lib/axonometry.test.mjs`, `gates/check_grid.py`

**Interfaces:**
- Consumes: `Block[]` из Task 1, `renderPage` из Task 3.
- Produces: `inline(text) -> string`; `renderBlocks(blocks, lang) -> string`; `axonometry(project, {width, nodes}) -> string` (валидный SVG, `<svg role="img" aria-labelledby>`, 3–5 слоёв).

- [ ] **Step 1: Write the failing tests**

```js
// build/lib/inline.test.mjs — node --test
import test from "node:test"; import assert from "node:assert/strict";
import { inline } from "./inline.mjs";
test("bold, code, link", () => {
  assert.equal(inline("**Проблема.** x"), "<strong>Проблема.</strong> x");
  assert.equal(inline("обычный `javac` тут"), "обычный <code>javac</code> тут");
  assert.equal(inline("[текст](https://a.b/c)"), '<a href="https://a.b/c" rel="noopener">текст</a>');
});
test("escapes html", () => {
  assert.equal(inline("<script>x</script>"), "&lt;script&gt;x&lt;/script&gt;");
});
// axonometry.test.mjs
import { axonometry } from "./axonometry.mjs";
test("three layers, no raster, unique ids", () => {
  const svg = axonometry({slug:"x", layers:[{label:"UI"},{label:"DATA"},{label:"CORE"}]}, {width:640});
  assert.match(svg, /^<svg /); assert.equal((svg.match(/<g class="layer"/g)||[]).length, 3);
  assert.ok(!/\.(png|jpg)/.test(svg)); assert.match(svg, /aria-labelledby="ax-x-title"/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test build/lib/`
Expected: FAIL — модули не найдены.

- [ ] **Step 3: Implement `inline`, `renderBlocks`, `axonometry`**

`inline`: три правила по порядку — экранирование всего, затем `\*\*(.+?)\*\*`, затем `` `([^`]+)` ``, затем `\[([^\]]+)\]\((https?:[^)\s]+)\)`; URL экранируется и оборачивается в `<a rel="noopener">`. `renderBlocks`: `p → <p>`, `ul → <ul><li>`, `table → <table class="spec">` c `overflow-wrap:anywhere` на `td`. `axonometry`: планометрия — горизонталь под 45° (`dx = (x-y)*cos45`, `dy = (x+y)*sin45*0.5 - z*28`), Z без сокращения; слои с зазором 28px; узлы — кружки r=3; подписи Martian Mono 11.31; ось `stroke-dasharray="12 4 2 4"`; `viewBox` по bounding box с полем 12.

- [ ] **Step 4: Write `work.mjs`, `dossier.mjs`, `plate.css`, run build**

Реестр: 14 планшетов, индекс `01–14`, статус (`В ЭКСПЛУАТАЦИИ / ПРОТОТИП / R&D`), годы или `—`, закрытость, 2 метрики, миниатюра схемы (3 слоя). Досье: шапка, `data-mode="context"` по умолчанию, оба вида в DOM, переключатель только если `approach[]` непуст (все 14 после Task 1), таблица спецификаций, стек, ссылка, полная схема.

- [ ] **Step 5: Run tests + grid gate**

Run: `node --test build/lib/ && node build/build.mjs && python gates/check_grid.py`
Expected: тесты PASS; `check_grid` — левые края `section` и `.plate` совпадают с треками 12-колоночной сетки ±1px на 1440; exit 0.

---

### Task 5: Граф технологий `/stack/`

**Files:**
- Create: `build/lib/graph.mjs`, `build/tpl/stack.mjs`, `src/css/graph.css`

**Interfaces:**
- Consumes: `content/stack.json`, `renderPage`, `inline`.
- Produces: `graph(stack, lang) -> string`; рёбра только между узлами, встречающимися в одном проекте; `<g class="node" tabindex="0" data-node="python">`.

- [ ] **Step 1: Write the failing test**

```js
// build/lib/graph.test.mjs
import test from "node:test"; import assert from "node:assert/strict";
import { graph } from "./graph.mjs";
const st = {layers:[{id:"lang",label:{ru:"ЯЗЫК",en:"LANGUAGE"}}],
  nodes:[{id:"python",label:"Python",layer:"lang"},{id:"fastapi",label:"FastAPI",layer:"lang"},{id:"react",label:"React",layer:"lang"}],
  projects:{python:["a","b"],fastapi:["a"],react:["c"]}};
test("nodes and factual edges only", () => {
  const svg = graph(st, "ru");
  assert.equal((svg.match(/class="node"/g)||[]).length, 3);
  assert.equal((svg.match(/class="edge"/g)||[]).length, 1); // python—fastapi (общий проект a)
  assert.ok(!/python.*react|react.*python/.test(svg.replace(/\s+/g," ")));
  assert.match(svg, /tabindex="0"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test build/lib/`
Expected: FAIL — `./graph.mjs` не найден.

- [ ] **Step 3: Implement `graph.mjs` + `stack.mjs`**

Раскладка детерминированная: слои — горизонтальные полосы сверху вниз (`lang`, `data`, `infra`, `tools`), узлы внутри полосы равномерно по X, отсортированы по числу проектов; связи — линии `1px`, толщина `stroke-width = 0.5 + shared`, подсветка при `:hover/:focus-within` (соседи получают класс через CSS `:has()` или инлайн-скрипт 20 строк). Под графом — таблица «узел → проекты» (она же доступная альтернатива графу, `aria-describedby`).

- [ ] **Step 4: Run tests + build + layout**

Run: `node --test build/lib/ && node build/build.mjs && python gates/check_layout.py`
Expected: PASS, 0 переполнений на 390.

---

### Task 6: `/about/`, `/contact/`, EN-зеркало, SEO

**Files:**
- Create: `build/tpl/about.mjs`, `build/tpl/contact.mjs`, `build/lib/seo.mjs`
- Modify: `build/build.mjs` (список маршрутов), `build/tpl/layout.mjs` (hreflang, canonical, JSON-LD)

**Interfaces:**
- Produces: `seo({lang, route, title, description}) -> {canonical, alternates, jsonld}`; 38 страниц: `index, about, work, stack, contact` × 2 + 14 досье × 2.

- [ ] **Step 1: Write the failing test**

```python
# gates/check_seo.py
import pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]; dist = ROOT/"dist"
pages = sorted(dist.rglob("*.html")); fails=[]
want = ["index","about","work","stack","contact"] + ["work/"+s for s in __import__("json").load(open(ROOT/"content/slugs.json",encoding="utf-8"))]
for route in want:
    for lang,pref in (("ru",""),("en","en/")):
        f = dist/(pref+route+".html") if route!="index" else dist/(pref+"index.html")
        if not f.exists(): fails.append(f"нет {f.relative_to(dist)}"); continue
        h = f.read_text(encoding="utf-8")
        if f'<html lang="{lang}"' not in h: fails.append(f"{f.name}: lang")
        if 'rel="alternate" hreflang="en"' not in h: fails.append(f"{f.name}: hreflang en")
        if 'name="description"' not in h: fails.append(f"{f.name}: description")
        if 'application/ld+json' not in h: fails.append(f"{f.name}: jsonld")
print("\n".join(fails[:30]) if fails else f"seo ok: {len(pages)} страниц")
sys.exit(1 if fails else 0)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python gates/check_seo.py`
Expected: FAIL — страниц нет (после Task 4 существуют только главная и реестр).

- [ ] **Step 3: Implement pages + SEO**

`about`: 3 абзаца, карьерная запись (3 строки с `2022 — 11.2026`), таблица фактов (5), `services` (3), доступность. `contact`: почта, GitHub, LinkedIn, CV RU/EN, `more` (2 ссылки), расширенный штамп. `seo.mjs`: canonical `https://kukhtik.github.io/atelier/<path>`, `hreflang="ru|en|x-default"`, JSON-LD `Person` (name, jobTitle, url, email, sameAs). Список слагов — `content/slugs.json` (пишется сборщиком из `content/projects/`).

- [ ] **Step 4: Run test to verify it passes**

Run: `node build/build.mjs && python gates/check_seo.py`
Expected: `seo ok: 38 страниц`.

---

### Task 7: Шрифты — субсет, WOFF2, лицензии

**Files:**
- Create: `tools/subset_fonts.py`, `src/fonts/unbounded-var.woff2`, `src/fonts/golos-var.woff2`, `src/fonts/martian-var.woff2`, `src/fonts/OFL.txt`, `src/css/fonts.css`
- Modify: `build/tpl/layout.mjs` (`<link rel="preload">` для двух шрифтов)

**Interfaces:**
- Consumes: `source/fonts/*.ttf` (скачаны из google/fonts), `content/**` для сбора кодпоинтов.
- Produces: `@font-face` для трёх семейств с `font-display: swap`, `size-adjust` не применяется.

- [ ] **Step 1: Write the failing test**

```python
# gates/check_fonts.py
import pathlib, re, sys
from fontTools.ttLib import TTFont
ROOT = pathlib.Path(__file__).resolve().parents[1]
need=set()
for p in list((ROOT/"content").rglob("*.json")):
    need |= set(p.read_text(encoding="utf-8"))
need |= set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:;!?()[]{}«»„“”—–-·/\\+*№%&@#_")
need |= {chr(c) for c in range(0x410,0x450)} | {chr(0x401),chr(0x451)} | {"↗","→","↑","↓","←"}
fails=[]; total=0
for name in ("unbounded-var","golos-var","martian-var"):
    f = ROOT/"src/fonts"/f"{name}.woff2"
    if not f.exists(): fails.append(f"{name}: нет файла"); continue
    total += f.stat().st_size
    if f.read_bytes()[:4] != b"wOF2": fails.append(f"{name}: не woff2")
    cmap = set(TTFont(str(f)).getBestCmap())
    miss = {c for c in need if ord(c) not in cmap}
    if miss: fails.append(f"{name}: нет {len(miss)} глифов, напр. {sorted(miss)[:8]}")
print(f"fonts: {total/1024:.0f} КБ")
print("\n".join(fails) if fails else "fonts ok")
sys.exit(1 if fails else 0)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python gates/check_fonts.py`
Expected: FAIL — файлов нет.

- [ ] **Step 3: Implement `subset_fonts.py`**

`fontTools.subset` с `--unicodes` из того же набора, `--layout-features='*'`, `--flavor=woff2` (brotli есть), сохранить вариативные оси (`--no-instancer`); положить OFL из google/fonts; `fonts.css` — `@font-face` с `font-weight: 200 900` (Unbounded), `400 900` (Golos), `100 800` (Martian) и `unicode-range` не нужен (один файл на семейство).

- [ ] **Step 4: Run test to verify it passes**

Run: `python tools/subset_fonts.py && python gates/check_fonts.py`
Expected: `fonts: ≤240 КБ`, `fonts ok`.

---

### Task 8: Полная приёмка — гейты, скриншоты, отчёт

**Files:**
- Create: `gates/check_weight.py`, `gates/check_copy.py`, `gates/check_static.py`, `scripts/run_all.py`, `scripts/shots.py`, `docs/acceptance-v1.md`
- Modify: `gates/check_layout.py` (добавить `prefers-reduced-motion` контекст уже есть)

**Interfaces:**
- Produces: `scripts/run_all.py` — запускает 7 гейтов + `check_fonts` + `check_seo`, печатает сводку, exit 1 при любом провале.

- [ ] **Step 1: Write the failing tests**

```python
# gates/check_weight.py — бюджеты §15
import pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]; dist = ROOT/"dist"
KB = 1024
def size(p): return p.stat().st_size
fails=[]
limits = {"work":60,"dossier":45,"other":30}
for f in dist.rglob("*.html"):
    rel = f.relative_to(dist).as_posix()
    route = rel[3:] if rel.startswith("en/") else rel
    if route.startswith("work/") and route.count("/")==1: lim = limits["work"]
    elif route.startswith("work/"): lim = limits["dossier"]
    else: lim = limits["other"]
    if size(f) > lim*KB: fails.append(f"{rel}: {size(f)/KB:.0f} КБ > {lim}")
for pat,lim in (("assets/*.css",45),("assets/*.js",10)):
    for f in dist.glob(pat):
        if size(f) > lim*KB: fails.append(f"{f.name}: {size(f)/KB:.0f} КБ > {lim}")
fonts = sum(size(f) for f in (dist/"fonts").glob("*.woff2"))
if fonts > 240*KB: fails.append(f"шрифты {fonts/KB:.0f} КБ > 240")
total = sum(size(f) for f in dist.rglob("*") if f.is_file() and f.suffix in (".html",".css",".js",".woff2",".svg"))
print(f"первая загрузка ≈ {total/KB:.0f} КБ")
print("\n".join(fails) if fails else "weight ok")
sys.exit(1 if fails else 0)
```

```python
# gates/check_copy.py — авторская копия
import json, pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
site = json.load(open(ROOT/"content/site.json", encoding="utf-8"))
fails=[]
def walk(o, path=""):
    if isinstance(o, str): yield path, o
    elif isinstance(o, dict):
        for k,v in o.items(): yield from walk(v, f"{path}.{k}")
    elif isinstance(o, list):
        for i,v in enumerate(o): yield from walk(v, f"{path}[{i}]")
for p, s in walk(site.get("ui",{})):
    if re.search(r"[A-Za-z][^—]*—[^—]*[A-Za-z]", s): fails.append(f"em dash: {p} = {s!r}")
for p, s in walk(site.get("manifest",{})):
    if re.search(r"[A-Za-z][^—]*—", s): fails.append(f"em dash в манифесте: {p}")
css = "
".join(p.read_text(encoding="utf-8") for p in (ROOT/"dist").rglob("*.css"))
for m in re.finditer(r"([^{}]+)\{[^}]*text-transform:\s*uppercase", css):
    if ".dwg" not in m.group(1): fails.append(f"uppercase вне .dwg: {m.group(1).strip()[:60]}")
for f in (ROOT/"dist").rglob("*.html"):
    h = f.read_text(encoding="utf-8")
    for m in re.finditer(r"<h[123][^>]*>([^<]+)</h[123]>", h):
        if m.group(1).strip().endswith("."): fails.append(f"{f.name}: точка в заголовке {m.group(1)!r}")
print("\n".join(fails[:20]) if fails else "copy ok")
sys.exit(1 if fails else 0)
```

```python
# gates/check_static.py — офлайн, растры, доступность
import pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]; dist = ROOT/"dist"
RASTER={".png",".jpg",".jpeg",".gif",".webp",".avif",".bmp",".ico"}
fails=[]
for f in dist.rglob("*"):
    if f.is_file() and f.suffix.lower() in RASTER: fails.append(f"растр: {f.relative_to(dist)}")
for f in dist.rglob("*.html"):
    h = f.read_text(encoding="utf-8")
    if re.search(r'<(script|link|img)[^>]+(src|href)="https?://', h): fails.append(f"{f.name}: внешний ассет")
    if "<html" in h and 'lang="' not in h: fails.append(f"{f.name}: нет lang")
    if 'class="skip' not in h: fails.append(f"{f.name}: нет skip-link")
css = "\n".join(p.read_text(encoding="utf-8") for p in dist.rglob("*.css"))
if "prefers-reduced-motion" not in css: fails.append("css: нет prefers-reduced-motion")
if ":focus-visible" not in css: fails.append("css: нет :focus-visible")
for lic in ("OFL.txt",):
    if not (dist/"fonts"/lic).exists(): fails.append(f"нет fonts/{lic}")
print("\n".join(fails[:20]) if fails else "static ok")
sys.exit(1 if fails else 0)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `python gates/check_weight.py; python gates/check_copy.py; python gates/check_static.py`
Expected: минимум один FAIL (нет `fonts/OFL.txt`, вес реестра, или uppercase).

- [ ] **Step 3: Fix until green, then full run**

`python scripts/run_all.py` — 9 гейтов подряд, сводка `PASS/FAIL` построчно, exit 1 при провале. Затем `python scripts/shots.py --all`: матрица 4 носителя × 2 вьюпорта для `/`, плюс `work-void-desktop`, `dossier-void-desktop`, `dossier-void-desktop-constructive`, `stack-void-desktop`, `contact-vellum-mobile`.

- [ ] **Step 4: Write `docs/acceptance-v1.md`**

Таблица: вес (HTML по типам, CSS, JS, шрифты, всего), контрасты (24+ строк), число страниц, 0 переполнений, 0 растров, 0 внешних ассетов, список скриншотов с путями. Числа вписать из фактического прогона, не из ожиданий.

---

### Task 9: Публикация на GitHub Pages

**Files:**
- Create: `.github/workflows/pages.yml`, `README.md`, `.gitignore`, `handoff/publish.md`

**Interfaces:**
- Consumes: готовый `dist/` (Task 8), `gh` с правами `repo` + `workflow`.
- Produces: `https://kukhtik.github.io/atelier/` (HTTP 200, `<title>` содержит «Kukhto»), workflow `pages` зелёный.

- [ ] **Step 1: Write the failing test**

```bash
# scripts/check_live.sh
set -e
URL=https://kukhtik.github.io/atelier/
out="$(dirname "$0")/../shots/live.html"; mkdir -p "$(dirname "$out")"
code=$(curl -s -o "$out" -w "%{http_code}" -m 25 "$URL")
echo "status=$code"
[ "$code" = "200" ] || exit 1
grep -q "Kukhto" "$out" || { echo "нет имени"; exit 1; }
css=$(grep -o 'assets/[a-z]*\.css' "$out" | head -1)
[ -n "$css" ] || { echo "нет css"; exit 1; }
curl -sf -m 25 "$URL$css" -o /dev/null || { echo "css 404"; exit 1; }
echo "live ok"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bash scripts/check_live.sh`
Expected: FAIL — 404 (репозитория нет).

- [ ] **Step 3: Create repo, workflow, publish**

`gh repo create kukhtik/atelier --public --description "Atelier — drafting-bureau portfolio"`. Workflow `pages.yml`: `on: push: branches: [main]`, job `build`: checkout, `setup-node@v4` (node 24), `node build/build.mjs`, `upload-pages-artifact` (`path: dist`), job `deploy` c `deploy-pages`, permissions `pages: write, id-token: write`. Публикация файлов — по скиллу `publish-static-site-github-api` (git push запрещён профилем): дерево + коммит + `refs/heads/main` через API. Затем `gh api -X POST repos/kukhtik/atelier/pages -f build_type=workflow`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bash scripts/check_live.sh`
Expected: `status=200`, `live ok`. Плюс `gh run list -R kukhtik/atelier --limit 1` → `completed success`.

---

## Self-Review

- Покрытие спеки: §10.1 → Task 2; §10.2–10.4 → Task 2 + 3; §10.5 → Task 4; §10.6 → Task 3 (reduced-motion) ; §11 (6 слотов) → Task 3, 4, 5, 6; §12 (компоненты) → Task 3 (штамп, рейка), Task 4 (планшет, режим); §13 (контент) → Task 1; §13.1 (граф) → Task 1 + 5; §14 (сборка) → Task 3; §15 (гейты) → Task 2, 3, 4, 8; §16 (риски) → Review Focus.
- Раздел 04 «Заметки» намеренно отсутствует (спека §4).
- Веб-GL, view transitions, scroll-driven — вне v1 (спека §4), задач нет намеренно.
