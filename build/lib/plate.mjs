// Планшет проекта: общая карточка для главной и реестра.
import { escape, attr, routeHref } from "../lib/html.mjs";
import { axonometry } from "../lib/axonometry.mjs";
import { plain } from "../lib/inline.mjs";

const NUM = /\B(?=(\d{3})+(?!\d))/g;

export function statusLabel(site, project, lang) {
  const s = site.status_labels?.[project.status];
  return s ? s[lang] || s.ru : project.status;
}

export function metricValue(v) {
  return String(v).replace(NUM, "\u202F");
}

/**
 * @param {object} ctx {site, stack}
 * @param {object} project
 * @param {string} lang
 * @param {{compact?:boolean, showOpen?:boolean}} opts
 */
export function plateCard(ctx, project, lang, opts = {}) {
  const { site, stack } = ctx;
  const t = (v) => (v && typeof v === "object" ? v[lang] || v.ru : v || "");
  const compact = !!opts.compact;
  const metrics = (project.metrics || []).slice(0, compact ? 2 : 3);
  const href = routeHref(compact ? "" : "work", lang, `work/${project.slug}`, lang);
  const openLabel = lang === "ru" ? "ОТКРЫТЬ ЧЕРТЁЖ" : "OPEN DRAWING";

  return `<article class="plate">
  <header class="plate-top">
    <span class="idx">${escape(project.index)}</span>
    <span>${escape(statusLabel(site, project, lang))}</span>
    <span>${escape(project.years || "—")}</span>
  </header>
  <div class="plate-fig">${axonometry(project, stack, { lang, compact: true })}</div>
  <div class="plate-body">
    <h3>${escape(t(project.title))}</h3>
    <p class="plate-sum">${escape(plain(t(project.summary)))}</p>
  </div>
  <dl class="plate-metrics">
    ${metrics
      .map(
        (m) =>
          `<div><dt>${escape(t(m.name))}</dt><dd>${escape(metricValue(m.value))}</dd></div>`
      )
      .join("")}
  </dl>
  <a class="plate-open" href="${attr(href)}"><span>${openLabel}</span><span aria-hidden="true">↗</span></a>
</article>`;
}
