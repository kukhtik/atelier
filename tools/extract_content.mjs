#!/usr/bin/env node
// Atelier content corpus extractor.
// Sources:
//   source/Open_space/README.ru.md, source/Open_space/README.md
//   ../lcars-v6/content/site-full.json (metrics/results/stack/link/confidentiality)
// Output:
//   content/projects/<slug>.json, content/site.json, content/stack.json
//
// Rules (Task 1): README is cut on "## "; the section title maps to a slug via
// the explicit table below. Paragraphs -> p, lists -> ul, GFM tables -> table,
// image lines and screenshot HTML tables are dropped, "---" is dropped, H3
// becomes a p with a bold lead. Numbers and wording stay verbatim: the content
// gate re-checks every number against the same README.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const README = {
  ru: path.join(ROOT, "source/Open_space/README.ru.md"),
  en: path.join(ROOT, "source/Open_space/README.md"),
};
const SITE_FULL = path.resolve(ROOT, "../lcars-v6/content/site-full.json");
const OUT = path.join(ROOT, "content");

// ---------------------------------------------------------------- title -> slug
const HEADINGS = {
  ru: {
    "Swarm": "swarm",
    "Engineer Companion": "engineer-companion",
    "GeoConverter": "geoconverter",
    "VETKA_DWG": "vetka-dwg",
    "PenaPivo / BeerLog": "penapivo",
    "VTuber Rigger": "vtuber-rigger",
    "Neuro Property Trade": "neuro-property-trade",
    "Разгон Квиз": "razgon-kviz",
    "Hermes Viz": "hermes-viz",
    "Codebot": "codebot",
    "Storybeam": "storybeam",
    "Торговый исследовательский стенд": "trading-stand",
    "Streaming stateful prediction": "streaming-prediction",
    "Статические сайты": "static-sites",
  },
  en: {
    "Swarm": "swarm",
    "Engineer Companion": "engineer-companion",
    "GeoConverter": "geoconverter",
    "VETKA_DWG": "vetka-dwg",
    "PenaPivo / BeerLog": "penapivo",
    "VTuber Rigger": "vtuber-rigger",
    "Neuro Property Trade": "neuro-property-trade",
    "Razgon Quiz": "razgon-kviz",
    "Hermes Viz": "hermes-viz",
    "Codebot": "codebot",
    "Storybeam": "storybeam",
    "Trading research station": "trading-stand",
    "Streaming stateful prediction": "streaming-prediction",
    "Static websites": "static-sites",
  },
};

// Appendix A (spec 2026-11-26-atelier-site-design.md).
const STATUS = {
  "geoconverter": "production",
  "penapivo": "production",
  "razgon-kviz": "production",
  "static-sites": "production",
  "vetka-dwg": "production",
  "hermes-viz": "rnd",
  "streaming-prediction": "rnd",
  "swarm": "rnd",
  "trading-stand": "rnd",
  "codebot": "prototype",
  "engineer-companion": "prototype",
  "neuro-property-trade": "prototype",
  "storybeam": "prototype",
  "vtuber-rigger": "prototype",
};

// Curated approach steps: 3-5 items, wording from README / site-full.json,
// no new facts. The context blocks stay verbatim; this is the only hand edit.
const APPROACH = {
  "codebot": {
    ru: [
      "Telegram-бот на Java 21 без зависимостей: 63 класса, обычный `javac`, без Maven и Gradle.",
      "Мост к локальному серверу кодинг-агента по JSON-RPC поверх WebSocket.",
      "Живые состояния хода, аппрувы, переключение, импорт и архив сессий, вложения и срочный steering.",
      "Режим, где каждый пользователь подключает свою машину.",
    ],
    en: [
      "A dependency-free Java 21 Telegram bot: 63 classes, plain `javac`, no Maven or Gradle.",
      "A bridge to the local coding-agent server over JSON-RPC on WebSocket.",
      "Live turn states, approvals, session switch, import and archive, attachments and urgent steering.",
      "Shared mode where each user pairs their own machine.",
    ],
  },
  "engineer-companion": {
    ru: [
      "Одно Python-ядро: индексация PDF, чанкинг, эмбеддинги, поиск в LanceDB и каталог фактов.",
      "Гибридный поиск: dense-векторы + BM25, с кросс-энкодерным реранкером.",
      "Локальный квантованный инференс (Gemma-3-4B, GGUF / llama.cpp); каждый ответ несёт ссылку на документ, страницу и область чертежа.",
    ],
    en: [
      "One Python core: PDF indexing, chunking, embeddings, LanceDB retrieval and a fact catalogue.",
      "Hybrid retrieval: dense vectors + BM25, with a cross-encoder reranker.",
      "Local quantized inference (Gemma-3-4B, GGUF / llama.cpp); every answer carries an evidence link to document, page and drawing region.",
    ],
  },
  "geoconverter": {
    ru: [
      "Четырёхстадийный пайплайн: Helmert/SVD → Левенберг-Марквардт → Нелдер-Мид, допуск 1e-12.",
      "Проверка невязки: замкнутый маршрут должен вернуться с миллиметровой точностью.",
      "Desktop-продукт на PyQt6 с аппаратной привязкой ключей и офлайн-генератором лицензий.",
    ],
    en: [
      "Four-stage pipeline: Helmert/SVD → Levenberg-Marquardt → Nelder-Mead, tolerance 1e-12.",
      "Round-trip error validation: the closed route must return within millimetres.",
      "PyQt6 desktop product with hardware-locked activation keys and an offline license issuer.",
    ],
  },
  "hermes-viz": {
    ru: [
      "Один экран с тремя фасетами поверх **живых данных**.",
      "**OPS** — радиальный «ролодекс» живой команды: статус, модель, текущий инструмент, активность.",
      "**PIPELINE** — доска задач с зависимостями, прогонами и блокировками.",
      "**KNOWLEDGE** — граф репозитория с потоком ретривала.",
    ],
    en: [
      "One screen with three facets over **live data**.",
      "**OPS** — radial deck of the live team: status, model, current tool, activity.",
      "**PIPELINE** — task board with dependencies, runs and blocked states.",
      "**KNOWLEDGE** — repository graph with retrieval flow.",
    ],
  },
  "neuro-property-trade": {
    ru: [
      "Самостоятельная игра на Godot 4 с детерминированным движком правил.",
      "Seeded RNG течёт через один класс, каждое действие идёт через append-only лог событий с полным replay.",
      "ИИ-места отправляют **интенты**, движок их валидирует и исполняет — состояние нельзя испортить.",
      "Параметрический интерфейс: перекладка вживую под размер окна, RU/EN, светлая и тёмная тема.",
    ],
    en: [
      "A standalone Godot 4 game with a deterministic rules engine.",
      "Seeded RNG flows through one class; every action goes through an append-only event log with full replay.",
      "AI seats submit **intents**; the engine validates and executes them, so the AI cannot corrupt state.",
      "Parametric UI: live relayout to window size, RU/EN, light and dark theme.",
    ],
  },
  "penapivo": {
    ru: [
      "Живой Telegram-продукт: журнал дегустаций с записями, статистикой, карточками профиля и рейтингами.",
      "Cloudflare Workers на edge, D1 для SQL, R2 для бэкапов.",
      "Telegram Mini App с i18n (ru/en/be).",
      "CI с coverage-gate ≥84% ветвей и mutation testing (Stryker).",
    ],
    en: [
      "A live Telegram product: a tasting journal with write-ups, statistics, profile cards and ratings.",
      "Cloudflare Workers on the edge, D1 for SQL, R2 for backups.",
      "Telegram Mini App with i18n (ru/en/be).",
      "CI with a ≥84% branch coverage gate and mutation testing (Stryker).",
    ],
  },
  "razgon-kviz": {
    ru: [
      "Состоянием и счётом владеет один сервер.",
      "Зал открывается по ссылке с токеном; один клик разблокирует `AudioContext`, ведущий листает вопросы с клавиши.",
      "Зал отвечает **на бумаге**, печатает только ведущий — серверу не нужно держать сотни соединений игроков.",
      "Фронт — PWA с явным предкэшем: 386 записей и 98 mp3, закэшированных поимённо.",
    ],
    en: [
      "A single server owns the state and the score.",
      "The hall opens by a tokenised link; one click unlocks `AudioContext`, and the host pages through questions with a keypress.",
      "The hall answers **on paper** and only the host types, so the server never holds hundreds of player sockets.",
      "The front end is a PWA with explicit precache: 386 entries and 98 mp3 cues cached by name.",
    ],
  },
  "static-sites": {
    ru: [
      "Два сайта вручную: HTML, CSS, немного SVG и JS, **ни одного фреймворка и ни одной сторонней библиотеки**.",
      "Два разных визуальных языка: «Сократилин» — инженерный чертёж, «Слава Швед» — постерная типографика.",
      "Проверка замером в headless Chrome: скролл, битые картинки, JS-ошибки, применение стилей.",
      "Отдельный слой — перенос в Тильду, чтобы заказчик правил контент сам.",
    ],
    en: [
      "Two sites built by hand: HTML, CSS, a little SVG and JS, **zero frameworks and zero third-party libraries**.",
      "Two different visual languages: \"Sokratilin\" as an engineering drawing, \"Slava Shved\" as poster typography.",
      "Verified by measurement in headless Chrome: scroll, broken images, JS errors, applied styles.",
      "A separate layer is the Tilda port, so the client edits content without a developer.",
    ],
  },
  "storybeam": {
    ru: [
      "Активный форк MoneyPrinterTurbo, перестроенный в платформу.",
      "React-фронтенд поверх REST API: Create, Library, Settings с API-key gate.",
      "Длинные форматы: сценарий чанками по длительности, resume/idempotency по сценам, ограничение числа сцен.",
      "Контроль затрат: дозированный image-to-video и лимит расходов на задачу.",
      "Комплаенс и безопасность: раскрытие AI-синтетики, анти-шаблонность, auth по умолчанию, фикс path traversal.",
    ],
    en: [
      "An active fork of MoneyPrinterTurbo, rebuilt into a platform.",
      "React front end over the REST API: Create, Library, Settings with an API-key gate.",
      "Long-form mode: duration-driven chunked script, per-scene resume/idempotency, scene-count cap.",
      "Cost governance: dosed image-to-video and a per-task spend cap.",
      "Compliance and security: AI-synthetic disclosure, anti-templated output, auth on by default, path-traversal fix.",
    ],
  },
  "streaming-prediction": {
    ru: [
      "Stateful-рекуррентная модель (GRU) с пошаговым экспортом в ONNX.",
      "Строгий контракт состояния: инференс по одной строке, hidden state переносится между вызовами.",
      "**Метрико-выровненный лосс**: официальный блочный агрегат на torch, побитово сверенный со скорером.",
      "Корреляция накапливается по всей последовательности, а не по короткому окну.",
      "Инфраструктурная устойчивость: `posix_fadvise(DONTNEED)` на каждую группу parquet.",
    ],
    en: [
      "A stateful recurrent model (GRU) with step-by-step ONNX export.",
      "A strict state contract: single-row inference, hidden state carried between calls.",
      "A **metric-aligned loss**: the official block-wise aggregate reimplemented in torch and verified against the scorer.",
      "Correlation accumulated over the whole sequence, not a short window.",
      "Infrastructure resilience: `posix_fadvise(DONTNEED)` on every parquet row group.",
    ],
  },
  "swarm": {
    ru: [
      "Изоляция ролей: планировщик, исполнитель и верификатор — разные личности и контексты.",
      "Планировщик декомпозирует задачу в проверяемые шаги.",
      "Верификатор открывается с чистым контекстом и судит исполнение по pytest, линтеру и dry-run, а не по словам агента.",
      "Защита границ: файлы `scope.protected` прибиты SHA-256, правка или удаление автоматически проваливают задачу.",
      "Бюджет и эскалация: ограниченные ходы и попытки, после N провалов — сильная модель или человек.",
    ],
    en: [
      "Role isolation: planner, executor and verifier are separate personas with separate context windows.",
      "The planner decomposes a task into verifiable steps.",
      "The verifier opens with a fresh context and judges execution by pytest, linter and dry-run, not the agent's word.",
      "Boundary protection: `scope.protected` files are SHA-256 pinned; an edit or deletion auto-fails the task.",
      "Budget and escalation: bounded turns and attempts; after N failures, a stronger model or a human.",
    ],
  },
  "trading-stand": {
    ru: [
      "Исследовательский стенд, а не сигнальный бот.",
      "Walk-forward бэктесты с комиссиями, слиппеджем и фандингом.",
      "Явные проверки look-ahead bias: сдвиг сигналов на бар.",
      "CPCV-консистентность и риск-контроль: сайзинг, circuit breaker, kill-switch.",
      "Paper-режим работает без ключей.",
    ],
    en: [
      "A research bench rather than a signal bot.",
      "Walk-forward backtests with fees, slippage and funding.",
      "Explicit look-ahead-bias checks: signals shifted one bar.",
      "CPCV consistency and risk controls: sizing, circuit breaker, kill-switch.",
      "Paper mode runs without keys.",
    ],
  },
  "vetka-dwg": {
    ru: [
      "Детекция маркеров и текста на фото с телефона, OCR для номеров точек и подписей.",
      "Библиотека из 444 блоков ГУГК с аудитом точности относительно эталонного шаблона.",
      "Генерация DXF, desktop-оболочка на PySide6/QML и quality gates в CI.",
    ],
    en: [
      "Marker and text detection on a phone photo, followed by OCR for point numbers and labels.",
      "A 444-block GUGK sign library with a fidelity audit against the reference template.",
      "DXF generation with a PySide6/QML desktop shell and CI quality gates.",
    ],
  },
  "vtuber-rigger": {
    ru: [
      "Два пути, полностью локально, без платных API: 3D-модель → VRM 1.0 и скриншоты → VRM 1.0.",
      "Сегментация тела на K-Means и кривизне.",
      "Предиктор 53-костного VRM-скелета, скин-веса RBF + Laplacian, 17 выражений.",
      "Spring-bones для волос и одежды.",
      "QA-гейты headless-VRM и LPIPS/CLIP.",
    ],
    en: [
      "Two paths, fully local, no paid APIs: a 3D model → VRM 1.0 and screenshots → VRM 1.0.",
      "Body segmentation with K-Means and curvature.",
      "A 53-bone VRM skeleton predictor, RBF + Laplacian skin weights, 17 expressions.",
      "Spring bones for hair and clothing.",
      "QA gates: headless VRM and LPIPS/CLIP.",
    ],
  },
};

// Text-level curation applied after parsing (screenshot references removed
// with the images themselves; wording otherwise untouched).
const TEXT_FIXES = {
  "swarm": {
    ru: [[" — см. раздел выше.", "."]],
    en: [[" — see the section above.", "."]],
  },
  "vetka-dwg": {
    ru: [["На скриншоте — консоль аудита библиотеки блоков:", "Аудит библиотеки блоков:"]],
    en: [["The screenshot shows the block-library audit console:", "Block-library audit:"]],
  },
};

// ------------------------------------------------------------ markdown parsing
function cutSections(md) {
  const out = [];
  let cur = null;
  for (const line of md.split(/\r?\n/)) {
    const m = /^## (.+)$/.exec(line);
    if (m) {
      if (cur) out.push(cur);
      cur = { title: m[1].trim(), lines: [] };
    } else if (cur) cur.lines.push(line);
  }
  if (cur) out.push(cur);
  return out;
}

function pickSection(sections, lang) {
  const map = HEADINGS[lang];
  const found = {};
  for (const sec of sections) {
    for (const [title, slug] of Object.entries(map)) {
      if (sec.title === title || sec.title.startsWith(title + " — ")) {
        if (found[slug]) throw new Error(`duplicate section for ${slug} (${lang})`);
        found[slug] = sec;
      }
    }
  }
  const missing = Object.values(map).filter((slug) => !found[slug]);
  if (missing.length) throw new Error(`missing sections (${lang}): ${missing.join(", ")}`);
  return found;
}

function cleanInline(s) {
  // Drop stray HTML (screenshot wrappers are removed earlier) and italic
  // markers: the site inline renderer supports only **bold**, `code` and links.
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "$1")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function cells(line) {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => cleanInline(c));
}

const TABLE_SEP = /^\|[\s:|-]+\|$/;

function parseBlocks(section) {
  let text = section.lines.join("\n");
  text = text.replace(/<table>[\s\S]*?<\/table>/g, ""); // screenshot galleries
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    let line = lines[i];
    let s = line.trim();
    if (!s) { i++; continue; }
    if (/^!\[[^\]]*\]\([^)]*\)$/.test(s)) { i++; continue; } // images
    if (/^---+$/.test(s)) { i++; continue; }                 // horizontal rules
    if (/^\*\*(Стек|Stack):\*\*/.test(s)) { i++; continue; } // stack duplicated by the field

    if (s.startsWith("### ")) {
      const title = cleanInline(s.slice(4));
      const rest = [];
      i++;
      while (i < lines.length) {
        const t = lines[i].trim();
        if (!t) { i++; continue; }
        if (/^(\||- |### |!\[)/.test(t)) break;
        rest.push(t); i++;
      }
      const body = rest.length ? " " + cleanInline(rest.join(" ")) : "";
      blocks.push({ t: "p", v: `**${title}.**${body}` });
      continue;
    }

    if (s.startsWith("|") && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1].trim())) {
      const head = cells(lines[i]);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(cells(lines[i])); i++;
      }
      blocks.push({ t: "table", head, rows });
      continue;
    }

    if (/^[-*] /.test(s)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) {
        items.push(cleanInline(lines[i].trim().slice(2))); i++;
      }
      blocks.push({ t: "ul", v: items });
      continue;
    }

    // Paragraph: stop before a blank line, a table, a list, an H3 or an image.
    const para = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t) break;
      if (para.length && (/^(\||- |### |!\[)/.test(t) || (t.startsWith("|") && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1].trim())))) break;
      if (t.startsWith("|") && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1].trim())) break;
      if (/^---+$/.test(t)) break;
      para.push(t); i++;
    }
    if (para.length) blocks.push({ t: "p", v: cleanInline(para.join(" ")) });
  }

  // merge adjacent paragraphs accidentally split by inline tables? keep as is
  return blocks;
}

function blocksText(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b.t === "p") out.push(b.v);
    else if (b.t === "ul") out.push(...b.v);
    else if (b.t === "table") out.push(b.head.join(" "), ...b.rows.map((r) => r.join(" ")));
  }
  return out.join(" ");
}

// site-full.json truncates five summaries at 320 chars mid-word. The truncated
// text is an exact prefix of the project section in README, so the sentence is
// completed from that source instead of inventing an ending.
function completeSummary(summary, md) {
  const s = summary.trim();
  if (/[.!?…»)]$/.test(s)) return s;
  const at = md.indexOf(s);
  if (at < 0) return s;
  const rest = md.slice(at + s.length);
  const end = rest.search(/\.(?=\s)/);
  if (end < 0) return s;
  return (s + rest.slice(0, end + 1)).replace(/\s+/g, " ").trim();
}

// ------------------------------------------------------------------- stack graph
const LAYERS = [
  { id: "lang", label: { ru: "ЯЗЫК", en: "LANGUAGE" } },
  { id: "data", label: { ru: "ДАННЫЕ", en: "DATA" } },
  { id: "infra", label: { ru: "ИНФРА", en: "INFRA" } },
  { id: "tools", label: { ru: "ИНСТРУМЕНТЫ", en: "TOOLS" } },
];

// Canonical node table. Raw stack tokens are matched by prefix (case-sensitive
// where it matters); versions and qualifiers go to `note`, never to the label.
// Composites that always occur together in the sources are one node (e.g.
// "NumPy / SciPy"), which is how 87 raw parts collapse into the 40-50 target.
const NODES = [
  // language / runtime
  { id: "python", label: "Python", layer: "lang", note: "" },
  { id: "javascript", label: "JavaScript", layer: "lang", note: "" },
  { id: "typescript", label: "TypeScript", layer: "lang", note: "5" },
  { id: "java", label: "Java", layer: "lang", note: "21" },
  { id: "gdscript", label: "GDScript", layer: "lang", note: "" },
  { id: "node", label: "Node.js", layer: "lang", note: "20+" },
  { id: "html-css", label: "HTML / CSS", layer: "lang", note: "HTML5 / CSS3" },
  // data
  { id: "lancedb-bm25", label: "LanceDB + BM25", layer: "data", note: "hybrid index" },
  { id: "sqlite", label: "SQLite", layer: "data", note: "" },
  { id: "postgresql", label: "PostgreSQL", layer: "data", note: "17" },
  { id: "redis", label: "Redis", layer: "data", note: "" },
  { id: "d1-r2", label: "Cloudflare D1 / R2", layer: "data", note: "SQL + object storage" },
  { id: "parquet", label: "Parquet", layer: "data", note: "" },
  { id: "jsonl", label: "JSONL", layer: "data", note: "trajectories" },
  { id: "rpc-websocket", label: "JSON-RPC / WebSocket", layer: "data", note: "transport" },
  // infrastructure
  { id: "docker", label: "Docker", layer: "infra", note: "Compose" },
  { id: "cloudflare-workers", label: "Cloudflare Workers", layer: "infra", note: "edge" },
  { id: "linux-wsl", label: "Linux / WSL", layer: "infra", note: "" },
  { id: "systemd", label: "systemd", layer: "infra", note: "units" },
  { id: "ci", label: "CI", layer: "infra", note: "quality gates" },
  { id: "telegram-api", label: "Telegram Bot API", layer: "infra", note: "" },
  { id: "pwa", label: "PWA", layer: "infra", note: "offline-first" },
  { id: "posix-fadvise", label: "posix_fadvise", layer: "infra", note: "DONTNEED" },
  // tools
  { id: "pyside6-qml", label: "PySide6 / QML", layer: "tools", note: "Qt" },
  { id: "pyqt6", label: "PyQt6", layer: "tools", note: "" },
  { id: "onnx-runtime", label: "ONNX Runtime", layer: "tools", note: "incl. Mobile" },
  { id: "numpy-scipy", label: "NumPy / SciPy", layer: "tools", note: "" },
  { id: "pyinstaller-nuitka", label: "PyInstaller / Nuitka", layer: "tools", note: "desktop build" },
  { id: "resvg", label: "resvg", layer: "tools", note: "card rasterization" },
  { id: "fastify", label: "Fastify", layer: "tools", note: "5" },
  { id: "prisma", label: "Prisma", layer: "tools", note: "6" },
  { id: "vite", label: "Vite", layer: "tools", note: "6" },
  { id: "tailwind", label: "Tailwind", layer: "tools", note: "" },
  { id: "react", label: "React", layer: "tools", note: "18" },
  { id: "fastapi-jinja2", label: "FastAPI / Jinja2", layer: "tools", note: "REST + web UI" },
  { id: "ffmpeg", label: "ffmpeg", layer: "tools", note: "" },
  { id: "pytorch", label: "PyTorch", layer: "tools", note: "" },
  { id: "hermes-agent", label: "Hermes Agent", layer: "tools", note: "kanban dispatcher" },
  { id: "pytest", label: "pytest", layer: "tools", note: "oracle" },
  { id: "ccxt", label: "CCXT", layer: "tools", note: "" },
  { id: "pandas", label: "pandas", layer: "tools", note: "" },
  { id: "ezdxf", label: "ezdxf", layer: "tools", note: "" },
  { id: "godot", label: "Godot", layer: "tools", note: "4.7" },
  { id: "trimesh", label: "trimesh", layer: "tools", note: "" },
  { id: "pygltflib", label: "pygltflib", layer: "tools", note: "" },
  { id: "scikit-learn", label: "scikit-learn", layer: "tools", note: "" },
  { id: "opencv", label: "OpenCV", layer: "tools", note: "" },
  { id: "gemma-llamacpp", label: "Gemma-3-4B / llama.cpp", layer: "tools", note: "GGUF" },
  { id: "e5-mmarco", label: "multilingual-e5-small + mmarco", layer: "tools", note: "embeddings + reranker" },
  { id: "neuro-sdk", label: "Neuro SDK", layer: "tools", note: "WS action protocol" },
];

const RULES = [
  [/^Java\b/, ["java"]],
  [/^Telegram Bot API\b/, ["telegram-api"]],
  [/^JSON-RPC\b/, ["rpc-websocket"]],
  [/^Docker(?:\s+Compose)?$/, ["docker"]],
  [/^Python$/, ["python"]],
  [/^LanceDB\b/, ["lancedb-bm25"]],
  [/^BM25\b/, ["lancedb-bm25"]],
  [/^multilingual-e5-small$/, ["e5-mmarco"]],
  [/^mmarco\b/, ["e5-mmarco"]],
  [/^Gemma-3-4B\b/, ["gemma-llamacpp"]],
  [/^PySide6\b/, ["pyside6-qml"]],
  [/^QML$/, ["pyside6-qml"]],
  [/^ONNX Runtime\b/, ["onnx-runtime"]],
  [/^NumPy$/, ["numpy-scipy"]],
  [/^SciPy\b/, ["numpy-scipy"]],
  [/^PyQt6$/, ["pyqt6"]],
  [/^PyInstaller$/, ["pyinstaller-nuitka"]],
  [/^Nuitka$/, ["pyinstaller-nuitka"]],
  [/^JavaScript\b/, ["javascript"]],
  [/^WebSocket-поток/, ["rpc-websocket"]],
  [/^WebSocket-релей$/, ["rpc-websocket"]],
  [/^SQLite\b/, ["sqlite"]],
  [/^Godot\b/, ["godot", "gdscript"]],
  [/^адаптер Neuro SDK\b/, ["neuro-sdk"]],
  [/^Cloudflare Workers$/, ["cloudflare-workers"]],
  [/^D1$/, ["d1-r2"]],
  [/^R2$/, ["d1-r2"]],
  [/^Node\.js$/, ["node"]],
  [/^Node \d/, ["node"]],
  [/^resvg\b/, ["resvg"]],
  [/^Fastify\b/, ["fastify"]],
  [/^Prisma\b/, ["prisma"]],
  [/^PostgreSQL\b/, ["postgresql"]],
  [/^TypeScript\b/, ["typescript"]],
  [/^Vite\b/, ["vite"]],
  [/^PWA\b/, ["pwa"]],
  [/^чистый HTML5$/, ["html-css"]],
  [/^CSS3\b/, ["html-css"]],
  [/^инлайн SVG$/, ["html-css"]],
  [/^генератор страниц на Python$/, ["python"]],
  [/^React\b/, ["react"]],
  [/^Tailwind$/, ["tailwind"]],
  [/^Redis\b/, ["redis"]],
  [/^PyTorch$/, ["pytorch"]],
  [/^ffmpeg$/, ["ffmpeg"]],
  [/^ONNX Runtime Mobile$/, ["onnx-runtime"]],
  [/^parquet$/i, ["parquet"]],
  [/^Linux$/, ["linux-wsl"]],
  [/^WSL$/, ["linux-wsl"]],
  [/^posix_fadvise/, ["posix-fadvise"]],
  [/^Hermes Agent\b/, ["hermes-agent"]],
  [/^pytest\b/, ["pytest"]],
  [/^JSONL-траектории$/, ["jsonl"]],
  [/^CCXT$/, ["ccxt"]],
  [/^pandas$/, ["pandas"]],
  [/^FastAPI$/, ["fastapi-jinja2"]],
  [/^Jinja2\b/, ["fastapi-jinja2"]],
  [/^systemd-юниты$/, ["systemd"]],
  [/^ezdxf$/, ["ezdxf"]],
  [/^CI с quality gates$/, ["ci"]],
  [/^trimesh$/, ["trimesh"]],
  [/^pygltflib$/, ["pygltflib"]],
  [/^numpy$/, ["numpy-scipy"]],
  [/^scipy$/, ["numpy-scipy"]],
  [/^scikit-learn$/, ["scikit-learn"]],
  [/^OpenCV$/, ["opencv"]],
];

function stackParts(s) {
  // split on · + / at parenthesis depth 0
  const out = [];
  let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && (ch === "·" || ch === "+" || ch === "/")) {
      out.push(cur); cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((t) => t.trim()).filter(Boolean);
}

// Tokens that describe a property or bespoke code, not a reusable technology.
// They stay in the free-form `stack` string but do not become graph nodes.
const IGNORE = [
  /^семантический граф$/,
  /^headless-тестируемое ядро$/,
  /^SHA-256 tamper-check$/,
  /^собственный CV-пайплайн/,
  /^библиотека знаков ГУГК$/,
];

function buildStack(projects) {
  const used = new Set();
  const mapping = Object.fromEntries(NODES.map((n) => [n.id, []]));
  const unmatched = [];
  for (const p of projects) {
    const seen = new Set();
    for (const part of stackParts(p.stack)) {
      let hit = null;
      for (const [re, ids] of RULES) {
        if (re.test(part)) { hit = ids; break; }
      }
      if (!hit) {
        if (IGNORE.some((re) => re.test(part))) continue;
        unmatched.push(`${p.slug}: ${part}`);
        continue;
      }
      for (const id of hit) {
        if (!mapping[id]) throw new Error(`unknown node id ${id}`);
        if (!seen.has(id)) { mapping[id].push(p.slug); seen.add(id); }
        used.add(id);
      }
    }
  }
  return {
    layers: LAYERS,
    nodes: NODES.filter((n) => used.has(n.id)).map(({ id, label, layer, note }) => ({ id, label, layer, note })),
    projects: Object.fromEntries(
      NODES.filter((n) => used.has(n.id)).map((n) => [n.id, mapping[n.id]])
    ),
    unmatched,
  };
}

// ------------------------------------------------------------------------ main
function main() {
  const siteFull = JSON.parse(fs.readFileSync(SITE_FULL, "utf8"));
  const raw = {
    ru: fs.readFileSync(README.ru, "utf8"),
    en: fs.readFileSync(README.en, "utf8"),
  };
  const source = {};
  for (const lang of ["ru", "en"]) {
    source[lang] = pickSection(cutSections(raw[lang]), lang);
  }

  fs.mkdirSync(path.join(OUT, "projects"), { recursive: true });
  const report = [];

  siteFull.projects.forEach((sp, idx) => {
    const slug = sp.slug;
    if (!APPROACH[slug]) throw new Error(`no curated approach for ${slug}`);
    const project = {
      slug,
      index: String(idx + 1).padStart(2, "0"),
      title: sp.title,
      status: STATUS[slug],
      years: null,
      confidentiality: sp.confidentiality,
      summary: {
        ru: completeSummary(sp.summary.ru, raw.ru),
        en: completeSummary(sp.summary.en, raw.en),
      },
      metrics: sp.metrics,
      results: sp.results || [],
      stack: sp.stack,
      link: sp.link,
      context: {},
      approach: {},
    };
    for (const lang of ["ru", "en"]) {
      const blocks = parseBlocks(source[lang][slug]);
      const fixes = (TEXT_FIXES[slug] || {})[lang] || [];
      if (fixes.length) {
        const fix = (v) => fixes.reduce((acc, [from, to]) => acc.split(from).join(to), v);
        for (const b of blocks) {
          if (b.t === "p") b.v = fix(b.v);
          else if (b.t === "ul") b.v = b.v.map(fix);
          else if (b.t === "table") {
            b.head = b.head.map(fix);
            b.rows = b.rows.map((r) => r.map(fix));
          }
        }
      }
      project.context[lang] = blocks;
      project.approach[lang] = APPROACH[slug][lang];
      report.push(`${slug}/${lang}: ${blocks.length} blocks, ${blocksText(blocks).length} chars`);
    }
    fs.writeFileSync(
      path.join(OUT, "projects", `${slug}.json`),
      JSON.stringify(project, null, 2) + "\n",
      "utf8"
    );
  });

  const s = siteFull.site;
  const site = {
    name: s.name,
    role: s.role,
    location: s.location,
    timezone: s.timezone,
    email: s.email,
    github: s.github,
    linkedin: s.linkedin,
    domain: s.domain,
    cv: s.cv,
    availability: s.availability,
    hero: s.hero,
    seo: s.seo,
    manifest: {
      ru: [
        "Система считается сделанной только тогда, когда её работу можно измерить и повторить.",
        "Каждое число здесь взято из конкретного прогона; архитектура и исходники открыты там, где это позволяет договор.",
      ],
      en: [
        "A system is finished only when its work can be measured and repeated.",
        "Every number here comes from a specific run; architecture and source are open wherever the contract allows.",
      ],
    },
    about: s.about,
    record: s.record,
    facts: s.facts,
    services: s.services,
    more: s.more,
    ui: {
      work: { ru: "ЧЕРТЕЖИ", en: "DRAWINGS" },
      approach: { ru: "ПОДХОД", en: "APPROACH" },
      stack: { ru: "УЗЛЫ", en: "NODES" },
      contact: { ru: "КОНТАКТ", en: "CONTACT" },
      constructive: { ru: "КОНСТРУКТИВ", en: "CONSTRUCTIVE" },
      context: { ru: "КОНТЕКСТ", en: "CONTEXT" },
      medium: { ru: "НОСИТЕЛЬ", en: "MEDIUM" },
      language: { ru: "ЯЗЫК", en: "LANGUAGE" },
      scale: { ru: "МАСШТАБ 1:1", en: "SCALE 1:1" },
      sheet: { ru: "ЛИСТ", en: "SHEET" },
    },
    status_labels: {
      production: { ru: "В ЭКСПЛУАТАЦИИ", en: "IN PRODUCTION" },
      prototype: { ru: "ПРОТОТИП", en: "PROTOTYPE" },
      rnd: { ru: "R&D", en: "R&D" },
    },
  };
  fs.writeFileSync(path.join(OUT, "site.json"), JSON.stringify(site, null, 2) + "\n", "utf8");

  const stack = buildStack(siteFull.projects);
  const unmatched = stack.unmatched;
  delete stack.unmatched;
  fs.writeFileSync(path.join(OUT, "stack.json"), JSON.stringify(stack, null, 2) + "\n", "utf8");

  console.log(report.join("\n"));
  console.log(`stack: ${stack.nodes.length} nodes, ${Object.values(stack.projects).reduce((a, b) => a + b.length, 0)} project links`);
  if (unmatched.length) {
    console.error("UNMATCHED STACK TOKENS:\n" + unmatched.join("\n"));
    process.exitCode = 1;
  }
}

main();
