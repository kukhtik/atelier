// Сборка: content → dist. Ноль зависимостей.
import { rmSync, mkdirSync, writeFileSync, cpSync, readFileSync, existsSync } from "node:fs";
import { join as p } from "node:path";
import { loadContent } from "./lib/content.mjs";
import { renderPage } from "./tpl/layout.mjs";
import { homePage } from "./tpl/home.mjs";
import { workPage } from "./tpl/work.mjs";
import { dossierPage } from "./tpl/dossier.mjs";
import { stackPage } from "./tpl/stack.mjs";
import { aboutPage } from "./tpl/about.mjs";
import { contactPage } from "./tpl/contact.mjs";
import { pageFile } from "./lib/html.mjs";
import { plain } from "./lib/inline.mjs";

const root = process.cwd();
const dist = p(root, "dist");
const { site, projects, stack, hash } = loadContent(root);
const ctx = { site, projects, stack, hash, hasCv: false };

rmSync(dist, { recursive: true, force: true });
mkdirSync(p(dist, "assets"), { recursive: true });
mkdirSync(p(dist, "fonts"), { recursive: true });

// ---- CSS: склейка в один файл
const cssOrder = ["tokens.css", "fonts.css", "base.css", "grid.css", "components.css", "mediums.css"];
const css = cssOrder
  .map((f) => p(root, "src/css", f))
  .filter((f) => existsSync(f))
  .map((f) => `/* ${f.split(/[\\/]/).pop()} */\n` + readFileSync(f, "utf8"))
  .join("\n");
writeFileSync(p(dist, "assets/site.css"), css);

// ---- JS
cpSync(p(root, "src/js/site.js"), p(dist, "assets/site.js"));

// ---- Шрифты и лицензии
cpSync(p(root, "src/fonts"), p(dist, "fonts"), { recursive: true });

// ---- Страницы
const pages = [];
for (const lang of ["ru", "en"]) {
  pages.push({
    lang,
    route: "",
    file: pageFile("", lang),
    pageKey: "home",
    title: (site.seo?.title?.[lang]) || `${site.name[lang]} — ${site.role[lang]}`,
    description: (site.seo?.description?.[lang]) || site.hero?.lead?.[lang] || "",
    body: homePage(ctx, lang),
  });
  pages.push({
    lang,
    route: "about",
    file: pageFile("about", lang),
    pageKey: "about",
    title: `${site.ui.approach[lang] || site.ui.approach.ru} — ${site.name[lang]}`,
    description: plain(site.about?.[lang]?.[0] || "").slice(0, 180),
    body: aboutPage(ctx, lang),
  });
  pages.push({
    lang,
    route: "stack",
    file: pageFile("stack", lang),
    pageKey: "stack",
    title: `${site.ui.stack[lang] || site.ui.stack.ru} — ${site.name[lang]}`,
    description: site.seo?.description?.[lang] || "",
    body: stackPage(ctx, lang),
  });
  pages.push({
    lang,
    route: "contact",
    file: pageFile("contact", lang),
    pageKey: "contact",
    title: `${site.ui.contact[lang] || site.ui.contact.ru} — ${site.name[lang]}`,
    description: site.seo?.description?.[lang] || "",
    body: contactPage(ctx, lang, "contact"),
  });
  pages.push({
    lang,
    route: "work",
    file: pageFile("work", lang),
    pageKey: "work",
    title: `${site.ui.work[lang] || site.ui.work.ru} — ${site.name[lang]}`,
    description: site.seo?.description?.[lang] || "",
    body: workPage(ctx, lang),
  });
  for (const project of projects) {
    const route = `work/${project.slug}`;
    pages.push({
      lang,
      route,
      file: pageFile(route, lang),
      pageKey: "dossier",
      title: `${project.title[lang]} — ${site.name[lang]}`,
      description: plain(project.summary?.[lang] || "").slice(0, 180),
      body: dossierPage(ctx, project, lang),
    });
  }
}

for (const page of pages) {
  const html = renderPage(ctx, page);
  const out = p(dist, page.file);
  mkdirSync(p(out, ".."), { recursive: true });
  writeFileSync(out, html);
}

writeFileSync(p(dist, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://kukhtik.github.io/atelier/sitemap.xml\n");

const sizes = pages.map((pg) => `${pg.file} ${(readFileSync(p(dist, pg.file)).length / 1024).toFixed(1)} КБ`);
console.log(`built ${pages.length} pages, css ${(Buffer.byteLength(css) / 1024).toFixed(1)} КБ, hash ${hash}`);
console.log(sizes.join("\n"));
