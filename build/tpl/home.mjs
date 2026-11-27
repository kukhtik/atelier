// Титульный лист: текст стоит в пустой части чертежа, а не над ним.
import { escape, attr, routeHref } from "../lib/html.mjs";
import { institute } from "../lib/institute.mjs";
import { register } from "../lib/register.mjs";

export function homePage(ctx, lang) {
  const { site, projects } = ctx;
  const t = (v) => (v && typeof v === "object" ? v[lang] || v.ru : v || "");
  const lead = t(site.hero?.lead) || "";
  const manifest = (Array.isArray(site.manifest) ? site.manifest.map(t) : [site.manifest?.[lang] || ""]).filter(Boolean);
  const name = t(site.name);
  const role = t(site.role);
  const loc = t(site.location);

  const notes = [lead, ...manifest]
    .map(
      (txt, i) => `<li style="--d:${(i * 120 + 700)}ms">
        <span class="n">${String(i + 1).padStart(2, "0")}</span>
        <span class="tx">${escape(txt)}</span>
        <span class="rule" aria-hidden="true"></span>
      </li>`
    )
    .join("");


  return `<section class="title-sheet" id="s-00">
  <div class="ts-figure">${institute(lang)}</div>
  <div class="ts-text">
    <p class="ts-meta dwg">${lang === "ru" ? "ЛИСТ 00 · ТИТУЛЬНЫЙ · 1:1000" : "SHEET 00 · TITLE · 1:1000"}</p>
    <h1 class="ts-name">${escape(name)}</h1>
    <p class="ts-role">${escape(role)} · ${escape(loc)} · UTC+3</p>
    <ol class="ts-notes">${notes}</ol>
    <p class="ts-avail dwg">${escape(t(site.availability))}</p>
  </div>
</section>

<section class="section" id="s-02">
  <div class="section-head"><span class="num">02</span><h2>${escape(t(site.ui.work))}</h2><span class="rule"></span><span class="dwg">${projects.length} · ${lang === "ru" ? "АРХИВ" : "ARCHIVE"}</span></div>
  ${register(ctx, projects, lang, "", 6)}
</section>`;
}
