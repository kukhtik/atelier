// Главный экран: имя, манифест, каркасная сфера в изометрии, три планшета (спека §11).
import { escape, attr, routeHref } from "../lib/html.mjs";
import { plateCard } from "../lib/plate.mjs";

function sphereSvg() {
  const r = 168, cx = 250, cy = 232;
  const kx = 0.866, ky = 0.5;
  const p = (x, y, z) => [cx + (x - y) * kx, cy + (x + y) * ky - z];
  const poly = (pts) =>
    "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L") + "";
  const out = [];
  for (const lat of [-60, -40, -20, 0, 20, 40, 60]) {
    const z = r * Math.sin((lat * Math.PI) / 180);
    const rc = r * Math.cos((lat * Math.PI) / 180);
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const t = (i / 60) * Math.PI * 2;
      pts.push(p(rc * Math.cos(t), rc * Math.sin(t), z));
    }
    out.push(
      `<path d="${poly(pts)}" fill="none" stroke="var(--line-structural)" stroke-width="1" stroke-opacity="${
        lat === 0 ? 0.9 : 0.45
      }" vector-effect="non-scaling-stroke"/>`
    );
  }
  for (let lon = 0; lon < 180; lon += 30) {
    const f = (lon * Math.PI) / 180;
    const pts = [];
    for (let i = 0; i <= 48; i++) {
      const th = (i / 48) * Math.PI * 2;
      pts.push(p(r * Math.sin(th) * Math.cos(f), r * Math.sin(th) * Math.sin(f), r * Math.cos(th)));
    }
    out.push(
      `<path d="${poly(pts)}" fill="none" stroke="var(--line-structural)" stroke-width="1" stroke-opacity="0.4" vector-effect="non-scaling-stroke"/>`
    );
  }
  // оси: Z вертикально, X и Y под 30°
  const axes = [
    [`M${cx} ${cy + r + 26} L${cx} ${cy - r - 26}`, "var(--line-structural)"],
    [`M${cx - r * 0.9} ${cy + r * 0.52} L${cx + r * 0.9} ${cy - r * 0.52}`, "var(--line-grid-decor)"],
    [`M${cx - r * 0.9} ${cy - r * 0.52} L${cx + r * 0.9} ${cy + r * 0.52}`, "var(--line-grid-decor)"],
  ]
    .map(
      ([d, c]) =>
        `<path d="${d}" fill="none" stroke="${c}" stroke-width="1" stroke-dasharray="12 4 2 4" vector-effect="non-scaling-stroke"/>`
    )
    .join("");

  const nodes = [
    [p(r * 0.62, -r * 0.5, r * 0.6), "var(--taut-emerald)"],
    [p(-r * 0.7, r * 0.35, -r * 0.45), "var(--taut-cobalt)"],
    [p(-r * 0.1, -r * 0.8, -r * 0.58), "var(--taut-ruby)"],
  ]
    .map(([[x, y], c]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="${c}"/>`)
    .join("");

  return `<svg viewBox="0 0 500 500" role="img" aria-labelledby="sphere-title" xmlns="http://www.w3.org/2000/svg">
<title id="sphere-title">${
    "Каркасная сфера в изометрии — референс Леонидова"
  }</title>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--fg-secondary)" stroke-width="1" vector-effect="non-scaling-stroke"/>
${out.join("")}
${axes}
${nodes}
</svg>`;
}

export function homePage(ctx, lang) {
  const { site, projects } = ctx;
  const t = (v) => (v && typeof v === "object" ? v[lang] || v.ru : v || "");
  const lead = site.hero?.lead ? t(site.hero.lead) : "";
  const manifest = Array.isArray(site.manifest) ? site.manifest.map(t) : [site.manifest?.[lang] || ""];
  const name = t(site.name);
  const role = t(site.role);
  const loc = t(site.location);

  const preview = projects.slice(0, 3).map((p) => `<div class="c-third">${plateCard(ctx, p, lang, { compact: true })}</div>`).join("");

  return `<section class="hero grid" id="s-00">
  <div class="hero-text">
    <p class="hero-role">${escape(role)} · ${escape(loc)}</p>
    <h1 class="hero-id">${escape(name)}</h1>
    <div class="hero-manifest prose">
      ${lead ? `<p>${escape(lead)}</p>` : ""}
      ${manifest.filter(Boolean).map((m) => `<p>${escape(m)}</p>`).join("")}
    </div>
    <p class="dwg dwg--lg">${escape(t(site.availability))} · UTC+3</p>
  </div>
  <figure class="hero-figure">
    ${sphereSvg()}
    <figcaption class="coords" aria-hidden="true">
      <span id="coords">X 0000 · Y 0000</span>
      <span>ISO 35.264° · Z 1:1</span>
    </figcaption>
  </figure>
</section>

<section class="section" id="s-02">
  <div class="section-head"><span class="num">02</span><h2>${escape(t(site.ui.work))}</h2><span class="rule"></span><span class="dwg">${projects.length} ${lang === "ru" ? "ПРОЕКТОВ" : "PROJECTS"}</span></div>
  <div class="grid">${preview}</div>
  <div class="link-row">
    <a class="link-big" href="${attr(routeHref("", lang, "work", lang))}"><span>${escape(t(site.ui.work))}</span><span aria-hidden="true">→</span></a>
    <a class="link-big" href="${attr(routeHref("", lang, "contact", lang))}"><span>${escape(t(site.ui.contact))}</span><span aria-hidden="true">→</span></a>
  </div>
</section>`;
}
