// Досье проекта: шапка, «Контекст / Конструктив», схема, спецификация (спека §12.2).
import { escape, attr, routeHref } from "../lib/html.mjs";
import { renderBlocks } from "../lib/blocks.mjs";
import { inline } from "../lib/inline.mjs";
import { axonometry } from "../lib/axonometry.mjs";
import { statusLabel, metricValue } from "../lib/plate.mjs";

export function dossierPage(ctx, project, lang) {
  const { site, stack } = ctx;
  const t = (v) => (v && typeof v === "object" ? v[lang] || v.ru : v || "");
  const hasContext = Array.isArray(project.approach?.[lang]) && project.approach[lang].length > 0;

  const metrics = (project.metrics || [])
    .map(
      (m) =>
        `<tr><th scope="row">${escape(t(m.name))}</th><td>${escape(metricValue(m.value))}${
          m.note ? ` <span class="meta">${escape(m.note)}</span>` : ""
        }</td></tr>`
    )
    .join("");
  const results = (project.results || [])
    .map(
      (r) =>
        `<tr><th scope="row">${escape(t(r.label))}</th><td>${escape(metricValue(r.value))}</td></tr>`
    )
    .join("");

  const specTable = `<table class="spec"><caption>${
    lang === "ru" ? "СПЕЦИФИКАЦИЯ" : "SPECIFICATION"
  }</caption><tbody>${results}${metrics}</tbody></table>`;

  const contextView = `<div class="view-context">
    <div class="grid">
      <div class="c-two-thirds prose">${renderBlocks(project.context?.[lang])}</div>
      <div class="c-third">
        ${specTable}
        <p class="stackline">${escape(project.stack || "")}</p>
      </div>
    </div>
  </div>`;

  const constructiveView = `<div class="view-constructive">
    <div class="grid">
      <div class="c-half">${axonometry(project, stack, { lang, compact: false })}</div>
      <div class="c-half">
        ${specTable}
        <p class="stackline">${escape(project.stack || "")}</p>
      </div>
    </div>
  </div>`;

  const switchHtml = `<div class="mode-switch" role="group" aria-label="${lang === "ru" ? "Вид досье" : "Dossier view"}">
    <button type="button" data-mode-set="context" aria-pressed="true">${escape(t(site.ui.context))}</button>
    <button type="button" data-mode-set="constructive" aria-pressed="false">${escape(t(site.ui.constructive))}</button>
  </div>`;

  return `<article class="dossier" data-mode="context">
  <header class="dossier-head">
    <p class="dwg dwg--lg">${escape(project.index)} · ${escape(statusLabel(site, project, lang))} · ${escape(
      project.years || "—"
    )} · ${escape(t(project.confidentiality))}</p>
    <h1>${escape(t(project.title))}</h1>
    <p class="prose">${inline(t(project.summary))}</p>
    ${
      project.link
        ? `<p class="stackline"><a href="${attr(project.link)}" rel="noopener">${escape(project.link)}</a></p>`
        : ""
    }
  </header>
  ${switchHtml}
  ${contextView}
  ${constructiveView}
  <p class="dwg" style="margin-top:var(--s-8)"><a href="${attr(routeHref(`work/${project.slug}`, lang, "work", lang))}">← ${lang === "ru" ? "К РЕЕСТРУ" : "TO THE REGISTRY"}</a></p>
</article>`;
}
