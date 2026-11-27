// Реестр планшетов (спека §11, слот 02).
import { escape, attr, routeHref } from "../lib/html.mjs";
import { register } from "../lib/register.mjs";

export function workPage(ctx, lang) {
  const { site, projects } = ctx;
  const t = (v) => (v && typeof v === "object" ? v[lang] || v.ru : v || "");
  const count = {};
  projects.forEach((p) => (count[p.status] = (count[p.status] || 0) + 1));
  const summary = ["production", "prototype", "rnd"]
    .filter((k) => count[k])
    .map((k) => `${count[k]} ${(site.status_labels?.[k]?.[lang] || k).toLowerCase()}`)
    .join(" · ");

  return `<section class="section" id="s-02">
  <div class="section-head"><span class="num">02</span><h2>${escape(t(site.ui.work))}</h2><span class="rule"></span><span class="dwg">${projects.length} · ${escape(summary)}</span></div>
  ${register(ctx, projects, lang, "work")}
  <p class="dwg" style="margin-top:var(--s-6)">${lang === "ru"
    ? "СТАТУС — ФАКТИЧЕСКОЕ СОСТОЯНИЕ; ГОДЫ УКАЗАНЫ ТАМ, ГДЕ ИЗВЕСТНЫ"
    : "STATUS IS THE ACTUAL STATE; YEARS SHOWN WHERE KNOWN"}</p>
</section>`;
}
