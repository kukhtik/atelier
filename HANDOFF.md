# Atelier — рабочий журнал

План: `docs/superpowers/plans/2026-11-26-atelier-site.md` · Спека: `docs/superpowers/specs/2026-11-26-atelier-site-design.md`
Леджер: `docs/sdd/progress.md`

## Чекпойнты

### 2026-11-26 · Task 1 — контентный корпус
- `content/projects/*.json` (14), `content/site.json`, `content/stack.json` (50 узлов / 72 связи), `tools/extract_content.mjs`.
- `./py gates/check_content.py` → `content ok: 14 проектов` (exit 0).
- Отчёт: `docs/sdd/task-1-report.md`.

- Task 1 (контент): 14 JSON из README Open_space + site-full.json, гейт зелёный.
- Task 2 (токены): 4 носителя, 28 контрастных пар по доку.
- Task 3–6 (каркас, реестр, досье, граф, about/contact, SEO): 38 страниц, RU/EN.
- Task 7 (шрифты): 3 субсета WOFF2, 180 КБ, покрытие всех глифов контента.
- Task 8 (приёмка): `scripts/run_all.py` → 9/9; `docs/acceptance-v1.md` с числами; 13 скриншотов.
- Task 9 (публикация): repo kukhtik/atelier + workflow pages.yml, публикация через git-database API.
