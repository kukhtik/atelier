// Подход: биография, запись, факты, услуги (спека §11, слот 01).
import { escape } from "../lib/html.mjs";

export function aboutPage(ctx, lang) {
  const { site } = ctx;
  const t = (v) => (v && typeof v === "object" ? v[lang] || v.ru : v || "");
  const about = (site.about?.[lang] || []).map((p) => `<p>${escape(p)}</p>`).join("");
  const record = (site.record || [])
    .map(
      (r) =>
        `<tr><th scope="row">${escape(r.when)}</th><td><strong>${escape(t(r.title))}</strong><br>${escape(
          t(r.text)
        )}</td></tr>`
    )
    .join("");
  const facts = (site.facts || [])
    .map((f) => `<tr><th scope="row">${escape(t(f.label))}</th><td>${escape(t(f.value))}</td></tr>`)
    .join("");
  const services = (site.services || [])
    .map(
      (s, i) =>
        `<div class="c-third"><p class="dwg">${escape(s.number || String(i + 1).padStart(2, "0"))}</p><h3>${escape(
          t(s.title)
        )}</h3><p>${escape(t(s.text))}</p></div>`
    )
    .join("");

  return `<section class="section" id="s-01">
  <div class="section-head"><span class="num">01</span><h2>${escape(t(site.ui.approach))}</h2><span class="rule"></span><span class="dwg">${escape(t(site.location))} · UTC+3</span></div>
  <div class="grid">
    <div class="c-two-thirds prose">${about}</div>
    <div class="c-third">
      <table class="spec"><caption>${lang === "ru" ? "ФАКТЫ" : "FACTS"}</caption><tbody>${facts}</tbody></table>
      <p class="dwg">${escape(t(site.availability))}</p>
    </div>
    <div class="c-full"><table class="spec"><caption>${lang === "ru" ? "ЗАПИСЬ" : "RECORD"}</caption><tbody>${record}</tbody></table></div>
    <div class="c-full"><div class="grid">${services}</div></div>
  </div>
</section>`;
}
