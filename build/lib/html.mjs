// Мелкие помощники HTML и путей. Сайт живёт в подпапке /atelier/ → все пути относительные.

export function escape(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function attr(s) {
  return escape(s).replaceAll("'", "&#39;");
}

/** route: "" | "about" | "work" | "work/codebot" ; lang: "ru" | "en" */
export function pageFile(route, lang) {
  const base = route ? `${route}/` : "";
  return `${lang === "en" ? "en/" : ""}${base}index.html`;
}

/** Глубина файла от корня dist — для относительных ссылок. */
export function depthOf(route, lang) {
  const segs = (route ? route.split("/") : []).filter(Boolean);
  return segs.length + (lang === "en" ? 1 : 0);
}

/** Ссылка на ассет из страницы (asset: "assets/site.css"). */
export function assetHref(route, lang, asset) {
  return "../".repeat(depthOf(route, lang)) + asset;
}

/** Ссылка на маршрут из страницы. */
export function routeHref(route, lang, target, targetLang = lang) {
  const from = depthOf(route, lang);
  const pre = targetLang === "en" ? "en/" : "";
  const to = (pre + (target ? `${target}/` : "")) || "";
  return "../".repeat(from) + (to || "./");
}

export function join(parts) {
  return parts.filter(Boolean).join("\n");
}
