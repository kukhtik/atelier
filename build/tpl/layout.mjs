// Каркас страницы: шапка, оси A–L, линейка, штамп, SEO (спека §11–12).
import { escape, attr, assetHref, routeHref, pageFile } from "../lib/html.mjs";

const SITE = "https://kukhtik.github.io/atelier/";

const NAV = [
  { route: "", key: "home", num: "00" },
  { route: "about", key: "approach", num: "01" },
  { route: "work", key: "work", num: "02" },
  { route: "stack", key: "stack", num: "03" },
  { route: "contact", key: "contact", num: "05" },
];

function label(site, key, lang) {
  if (key === "home") return lang === "ru" ? "ГЛАВНАЯ" : "HOME";
  const v = site.ui?.[key];
  return v ? v[lang] || v.ru : key;
}

export function renderPage(ctx, { lang, route, title, description, body, pageKey }) {
  const { site, hash } = ctx;
  const t = (v) => (v && typeof v === "object" ? v[lang] || v.ru : v || "");
  const canonical = SITE + pageFile(route, lang).replace("index.html", "");
  const altRu = SITE + pageFile(route, "ru").replace("index.html", "");
  const altEn = SITE + pageFile(route, "en").replace("index.html", "");

  const nav = NAV.map((item) => {
    const cur = item.route === route ? ' aria-current="page"' : "";
    return `<a href="${routeHref(route, lang, item.route, lang)}"${cur}><span class="n">${item.num}</span>${escape(
      label(site, item.key, lang)
    )}</a>`;
  }).join("");

  const langSwitch = ["ru", "en"]
    .map((l) => {
      const cur = l === lang ? ' aria-current="true"' : "";
      return `<a href="${routeHref(route, lang, route, l)}" hreflang="${l}"${cur}>${l.toUpperCase()}</a>`;
    })
    .join("");

  const ruler = NAV.map((item) => {
    const cur = item.route === route ? ' class="current"' : "";
    return `<li${cur}><a href="${routeHref(route, lang, item.route, lang)}">${item.num}</a></li>`;
  }).join("");

  const axes = "ABCDEFGHIJKL".split("").map((a) => `<span>${a}</span>`).join("");

  const jsonld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name[lang] || site.name.ru,
    jobTitle: site.role[lang] || site.role.ru,
    url: SITE,
    email: `mailto:${site.email}`,
    sameAs: [site.github, site.linkedin].filter(Boolean),
  });

  const fontBase = assetHref(route, lang, "fonts");

  return `<!doctype html>
<html lang="${lang}" data-medium="void">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<meta name="description" content="${attr(description)}">
<link rel="canonical" href="${attr(canonical)}">
<link rel="alternate" hreflang="ru" href="${attr(altRu)}">
<link rel="alternate" hreflang="en" href="${attr(altEn)}">
<link rel="alternate" hreflang="x-default" href="${attr(altRu)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${attr(canonical)}">
<meta name="theme-color" content="#0B0C0E">
<link rel="preload" href="${fontBase}/golos-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${fontBase}/unbounded-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${assetHref(route, lang, "assets/site.css")}">
<script type="application/ld+json">${jsonld}</script>
</head>
<body class="page-${attr(pageKey)}">
<a class="skip" href="#main">${lang === "ru" ? "К содержанию" : "Skip to content"}</a>
<div class="sheet-frame" aria-hidden="true"></div>
<div class="sheet">
  <header class="masthead">
    <a class="brand" href="${routeHref(route, lang, "", lang)}">${lang === "ru" ? "КУХТО" : "KUKHTO"}<span class="dot">·</span>ATELIER</a>
    <nav class="nav" aria-label="${lang === "ru" ? "Разделы" : "Sections"}">${nav}</nav>
    <div class="lang" aria-label="${lang === "ru" ? "Язык" : "Language"}">${langSwitch}</div>
  </header>
  <div class="axes" aria-hidden="true">${axes}</div>
  <aside class="ruler" aria-hidden="true"><ol>${ruler}</ol></aside>
  <main id="main">
${body}
  </main>
  <footer class="titleblock" aria-label="${lang === "ru" ? "Штамп чертежа" : "Title block"}">
    <div class="tb-head"><span>${lang === "ru" ? "ШТАМП" : "TITLE BLOCK"}</span><span>${escape(t(site.ui.scale))}</span></div>
    <dl>
      <div class="row"><span>${escape(t(site.ui.medium))}</span><b data-medium-name>VOID</b></div>
      <div class="row"><span>${escape(t(site.ui.sheet))}</span><b>01</b></div>
      <div class="row"><span>${lang === "ru" ? "СБОРКА" : "BUILD"}</span><b>v1.${escape(hash)}</b></div>
      <div class="row"><span>${lang === "ru" ? "СТАТУС" : "STATUS"}</span><b>${escape(t(site.availability))}</b></div>
    </dl>
    <div class="mediums" role="group" aria-label="${lang === "ru" ? "Носитель" : "Medium"}">
      <button type="button" data-medium-set="void" aria-pressed="true">VOID</button>
      <button type="button" data-medium-set="cyanotype" aria-pressed="false">CYAN</button>
      <button type="button" data-medium-set="chiaroscuro" aria-pressed="false">CHAR</button>
      <button type="button" data-medium-set="vellum" aria-pressed="false">VELL</button>
    </div>
  </footer>
</div>
<script src="${assetHref(route, lang, "assets/site.js")}" defer></script>
</body>
</html>`;
}
