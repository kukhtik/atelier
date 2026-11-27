// Реестр-архив: строка = чертёж (индекс, имя, статус, аксонометрия, метрики).
import { escape, attr, routeHref } from "./html.mjs";
import { axonometry } from "./axonometry.mjs";
import { statusLabel } from "./plate.mjs";

export function registerRow(ctx, project, lang, fromRoute = "") {
  const { site, stack } = ctx;
  const t = (v) => (v && typeof v === "object" ? v[lang] || v.ru : v || "");
  const mm = (project.metrics || []).slice(0, 2);
  const top = mm.map((m) => m.value).join(" · ");
  const topNames = mm.map((m) => (m.name?.[lang] || m.name?.ru || "")).join(" · ");
  return `<a class="reg-row" href="${attr(routeHref(fromRoute, lang, `work/${project.slug}`, lang))}">
    <span class="r-idx">${escape(project.index)}</span>
    <span class="r-title">${escape(t(project.title))}</span>
    <span class="r-status">${escape(statusLabel(site, project, lang))}</span>
    <span class="r-ax">${axonometry(project, stack, { lang, compact: true })}</span>
    <span class="r-metric"><b>${escape(top)}</b><i>${escape(topNames)}</i></span>
    <span class="r-go" aria-hidden="true">↗</span>
  </a>`;
}

export function register(ctx, projects, lang, fromRoute = "", limit = 0) {
  const list = limit ? projects.slice(0, limit) : projects;
  const head = `<div class="reg-head dwg" aria-hidden="true">
      <span>№</span>
      <span>${lang === "ru" ? "ЧЕРТЁЖ" : "DRAWING"}</span>
      <span>${lang === "ru" ? "СТАТУС" : "STATUS"}</span>
      <span></span>
      <span>${lang === "ru" ? "МЕТРИКА" : "METRIC"}</span>
      <span></span>
    </div>`;
  return `<div class="register">${head}${list.map((p) => registerRow(ctx, p, lang, fromRoute)).join("")}</div>`;
}
