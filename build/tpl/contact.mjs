// Контакт: почта, репозитории, CV (спека §11, слот 05).
import { escape, attr, assetHref } from "../lib/html.mjs";

export function contactPage(ctx, lang, route = "contact") {
  const { site } = ctx;
  const t = (v) => (v && typeof v === "object" ? v[lang] || v.ru : v || "");
  const rows = [
    [lang === "ru" ? "ПОЧТА" : "EMAIL", `<a href="mailto:${attr(site.email)}">${escape(site.email)}</a>`],
    ["GITHUB", `<a href="${attr(site.github)}" rel="noopener">${escape(site.github.replace("https://", ""))}</a>`],
    ["LINKEDIN", `<a href="${attr(site.linkedin)}" rel="noopener">${escape(site.linkedin.replace("https://", ""))}</a>`],
  ];
  if (ctx.hasCv) rows.push([
    lang === "ru" ? "РЕЗЮМЕ" : "CV",
    `<a href="${attr(assetHref(route, lang, site.cv[lang] || site.cv.ru))}">PDF · ${lang === "ru" ? "русский" : "English"}</a>`,
  ]);
  const rowsHtml = rows.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join("");

  const more = (site.more || [])
    .map(
      (m) =>
        `<li><a href="${attr(m.url)}" rel="noopener">${escape(t(m.title))}</a> — ${escape(t(m.text))}</li>`
    )
    .join("");

  return `<section class="section" id="s-05">
  <div class="section-head"><span class="num">05</span><h2>${escape(t(site.ui.contact))}</h2><span class="rule"></span><span class="dwg">${escape(t(site.availability))}</span></div>
  <div class="grid">
    <div class="c-half">
      <table class="spec"><tbody>${rowsHtml}</tbody></table>
      <p class="dwg">${lang === "ru" ? "БЕЗ ФОРМ И ТРЕКЕРОВ" : "NO FORMS, NO TRACKERS"}</p>
    </div>
    <div class="c-half prose">
      <p>${escape(site.hero?.lead?.[lang] || "")}</p>
      ${more ? `<ul>${more}</ul>` : ""}
    </div>
  </div>
</section>`;
}
