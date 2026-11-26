# Atelier — чертёжное бюро

Второй личный сайт Максима Кухто: инженерное портфолио в графической грамматике бумажного архитектурного авангарда. Живёт параллельно с LCARS-консолью на `kukhto.is-a.dev`.

- Живой сайт: https://kukhtik.github.io/atelier/
- Дизайн-спека: `docs/superpowers/specs/2026-11-26-atelier-site-design.md`
- План сборки: `docs/superpowers/plans/2026-11-26-atelier-site.md`
- Приёмка (числа): `docs/acceptance-v1.md`

## Сборка

```
node build/build.mjs      # content → dist, ноль зависимостей
./py scripts/run_all.py   # 9 гейтов приёмки (Python 3.12 + Playwright)
```

Контент — `content/*.json`: 14 проектов, метрики из проверенных прогонов, проза — из README Open_space.
Четыре носителя: Leonidov Void, Prussian Cyanotype, Ferriss Chiaroscuro, Architectural Vellum.
