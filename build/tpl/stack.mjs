// Узлы: граф технологий + таблица связей (спека §11, слот 03).
import { escape, attr } from "../lib/html.mjs";
import { graph } from "../lib/graph.mjs";

export function stackPage(ctx, lang) {
  const { site, stack } = ctx;
  const t = (v) => (v && typeof v === "object" ? v[lang] || v.ru : v || "");
  const byLayer = stack.layers.map((l) => ({ layer: l, nodes: stack.nodes.filter((n) => n.layer === l.id) }));

  const rows = byLayer
    .map(
      (band) =>
        `<tr><th scope="row">${escape(t(band.layer.label))}</th><td>${band.nodes
          .map((n) => `${escape(n.label)}${n.note ? ` <span class="meta">${escape(n.note)}</span>` : ""}`)
          .join(" · ")}</td></tr>`
    )
    .join("");

  return `<section class="section" id="s-03">
  <div class="section-head"><span class="num">03</span><h2>${escape(t(site.ui.stack))}</h2><span class="rule"></span><span class="dwg">${stack.nodes.length} ${lang === "ru" ? "УЗЛОВ" : "NODES"}</span></div>
  <div class="grid">
    <div class="c-full"><div class="graph-wrap">${graph(stack, lang)}</div><p class="dwg" style="margin-top:var(--s-2)">${lang === "ru" ? "ПРОКРУТКА ПО ГОРИЗОНТАЛИ →" : "SCROLL HORIZONTALLY →"}</p></div>
    <div class="c-two-thirds">
      <table class="spec"><caption>${lang === "ru" ? "УЗЛЫ ПО СЛОЯМ" : "NODES BY LAYER"}</caption><tbody>${rows}</tbody></table>
    </div>
    <div class="c-third">
      <p class="dwg">${lang === "ru"
        ? "СВЯЗЬ — ОБЩИЙ ПРОЕКТ. ТОЛЩИНА — ЧИСЛО ОБЩИХ ПРОЕКТОВ"
        : "A LINK IS A SHARED PROJECT. THICKNESS IS HOW MANY"}</p>
    </div>
  </div>
</section>`;
}
