// Главный экран: титульный лист — реконструкция Института библиотековедения
// И. Леонидова (башня книгохранилища + сфера-планетарий): веса линий, оконные
// пояса, пьедестал, размерные засечки, две фигуры масштаба, ось 23,5°.
import { escape, attr, routeHref } from "../lib/html.mjs";
import { plateCard } from "../lib/plate.mjs";

const W = 1200, H = 700, GY = 618;

function leader(x1, y1, x2, y2) {
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="var(--line-structural)" stroke-width="1"/><circle cx="${x1}" cy="${y1}" r="2.8" fill="var(--fg-primary)"/>`;
}

/** Засечка размерной линии под 45°, как в строительных чертежах */
function tick(x, y) {
  return `<path d="M${x - 5} ${y + 5} L${x + 5} ${y - 5}" stroke="var(--fg-primary)" stroke-width="1.2"/>`;
}

function institute(lang) {
  const towerX = 300, towerW = 130, towerTop = 196;
  const sph = { cx: 828, cy: 322, r: 168 };

  // этажи: двойные линии (плита + окно)
  const floors = [];
  const n = 12;
  const step = (GY - 30 - towerTop) / n;
  for (let i = 1; i < n; i++) {
    const y = towerTop + step * i;
    floors.push(
      `<line x1="${towerX}" y1="${y.toFixed(1)}" x2="${towerX + towerW}" y2="${y.toFixed(1)}" stroke="var(--fg-primary)" stroke-width="1.6"/>`,
      `<line x1="${towerX}" y1="${(y + 4).toFixed(1)}" x2="${towerX + towerW}" y2="${(y + 4).toFixed(1)}" stroke="var(--line-structural)" stroke-width="0.8"/>`
    );
  }
  // вертикальные импосты окон
  const mullions = [];
  for (let x = towerX + 16; x < towerX + towerW; x += 16) {
    mullions.push(`<line x1="${x}" y1="${towerTop + 6}" x2="${x}" y2="${GY - 30}" stroke="var(--line-structural)" stroke-width="0.7" stroke-opacity=".8"/>`);
  }

  // мачты с раскосами
  const masts = `<path d="M${towerX + 26} ${towerTop} L${towerX + 26} 66 M${towerX + 96} ${towerTop} L${towerX + 96} 88" stroke="var(--fg-primary)" stroke-width="1.6" fill="none"/>` +
    [0, 1, 2, 3].map((i) => {
      const y1 = towerTop - 34 - i * 26, y2 = y1 + 12;
      const x1 = towerX + 26, x2 = towerX + 96;
      return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="var(--line-structural)" stroke-width="1"/><path d="M${x2} ${y1} L${x1} ${y2}" stroke="var(--line-structural)" stroke-width="1"/>`;
    }).join("") +
    `<path d="M${towerX + 26} 66 L${towerX + 96} 66 M${towerX + 26} 88 L${towerX + 96} 88" stroke="var(--fg-primary)" stroke-width="1"/>`;

  // сфера: оболочка, пояса, меридиан
  const lat = [-0.66, -0.36, 0.36, 0.66].map((k) => {
    const dy = sph.r * k;
    const rx = Math.sqrt(sph.r * sph.r - dy * dy);
    return `<ellipse cx="${sph.cx}" cy="${(sph.cy + dy).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * 0.16).toFixed(1)}" fill="none" stroke="var(--line-structural)" stroke-width="0.9"/>`;
  }).join("");
  const sphere = `<circle cx="${sph.cx}" cy="${sph.cy}" r="${sph.r}" fill="url(#sphLight)" stroke="var(--fg-primary)" stroke-width="2.2"/>` +
    `<ellipse cx="${sph.cx}" cy="${sph.cy}" rx="${sph.r}" ry="${(sph.r * 0.27).toFixed(1)}" fill="none" stroke="var(--fg-primary)" stroke-width="1.3"/>` +
    `<ellipse cx="${sph.cx}" cy="${sph.cy}" rx="${(sph.r * 0.3).toFixed(1)}" ry="${sph.r}" fill="none" stroke="var(--fg-primary)" stroke-width="1" stroke-opacity=".7"/>` +
    lat;

  // пьедестал сферы и лестница
  const base = `<path d="M${sph.cx - 46} ${sph.cy + sph.r - 6} L${sph.cx + 46} ${sph.cy + sph.r - 6} L${sph.cx + 30} ${GY} L${sph.cx - 30} ${GY} Z" fill="none" stroke="var(--fg-primary)" stroke-width="1.6"/>` +
    [0, 1, 2].map((i) => `<line x1="${sph.cx - 30 - i * 12}" y1="${GY - 4 - i * 4}" x2="${sph.cx + 30 + i * 12}" y2="${GY - 4 - i * 4}" stroke="var(--line-structural)" stroke-width="1"/>`).join("");

  // плита башни и ступени
  const plinth = `<rect x="${towerX - 16}" y="${GY - 14}" width="${towerW + 32}" height="14" fill="none" stroke="var(--fg-primary)" stroke-width="1.6"/>` +
    `<path d="M${towerX - 26} ${GY} L${towerX + towerW + 26} ${GY}" stroke="var(--fg-primary)" stroke-width="1.2"/>`;

  // мост башня — сфера
  const bridge = `<path d="M${towerX + towerW} 292 L660 306 L660 352 L${towerX + towerW} 340 Z" fill="none" stroke="var(--fg-primary)" stroke-width="1.6"/>` +
    [0, 1, 2, 3].map((i) => `<line x1="${towerX + towerW + 40 + i * 56}" y1="${296 + i * 3}" x2="${towerX + towerW + 40 + i * 56}" y2="${338 - i * 2}" stroke="var(--line-structural)" stroke-width="0.9"/>`).join("");

  // земля
  const hatches = [];
  for (let x = 80; x <= 1120; x += 24) hatches.push(`<path d="M${x} ${GY} l-12 12" stroke="var(--line-structural)" stroke-width="0.9"/>`);
  const ground = `<line x1="64" y1="${GY}" x2="1136" y2="${GY}" stroke="var(--fg-primary)" stroke-width="1.8"/>${hatches.join("")}`;

  // оси
  const axes = `<path d="M365 50 L365 672" stroke="var(--line-structural)" stroke-width="1" stroke-dasharray="12 4 2 4"/>` +
    `<path d="M540 322 L1088 322" stroke="var(--line-structural)" stroke-width="1" stroke-dasharray="12 4 2 4"/>`;

  // ось 23,5° (Татлин) через центр сферы + дуга угла
  const ang = (23.5 * Math.PI) / 180;
  const len = 520;
  const ax2 = sph.cx + Math.cos(ang) * len * 0.95, ay2 = sph.cy - Math.sin(ang) * len;
  const axis23 = `<path d="M${sph.cx - Math.cos(ang) * 300} ${(sph.cy + Math.sin(ang) * 300).toFixed(1)} L${ax2.toFixed(1)} ${ay2.toFixed(1)}" stroke="var(--accent-primary)" stroke-width="1.2" stroke-dasharray="16 6" opacity=".9"/>` +
    `<path d="M${sph.cx} ${sph.cy - 70} A70 70 0 0 1 ${(sph.cx + Math.sin(ang) * 70).toFixed(1)} ${(sph.cy - Math.cos(ang) * 70).toFixed(1)}" fill="none" stroke="var(--accent-primary)" stroke-width="1"/>` +
    `<text x="${(sph.cx + 78).toFixed(0)}" y="${(sph.cy - 46).toFixed(0)}" class="ax-label" fill="var(--accent-primary)">23,5°</text>`;

  // размеры с засечками
  const dims = `<path d="M1016 ${towerTop} L1016 ${GY}" stroke="var(--line-structural)" stroke-width="1"/>` +
    tick(1016, towerTop) + tick(1016, GY) +
    `<path d="M${towerX + towerW} ${towerTop} L1022 ${towerTop}" stroke="var(--line-structural)" stroke-width="0.8" stroke-dasharray="4 4"/>` +
    `<text x="1030" y="${(GY + towerTop) / 2}" class="ax-label" fill="var(--fg-secondary)">H</text>` +
    `<path d="M${sph.cx - sph.r} 592 L${sph.cx + sph.r} 592" stroke="var(--line-structural)" stroke-width="1"/>` +
    tick(sph.cx - sph.r, 592) + tick(sph.cx + sph.r, 592) +
    `<text x="${sph.cx}" y="584" text-anchor="middle" class="ax-label" fill="var(--fg-secondary)">D</text>`;

  // фигуры масштаба: у башни и у сферы
  const fig = (x, h, label) => `<g transform="translate(${x} ${GY})">` +
    `<ellipse cx="0" cy="2" rx="9" ry="2.2" fill="var(--line-structural)" opacity=".8"/>` +
    `<g stroke="var(--fg-primary)" stroke-width="2" fill="none" transform="scale(${(h / 30).toFixed(2)})">` +
    `<circle cx="0" cy="-26" r="4.4"/><path d="M0 -21 L0 -9 M0 -9 L-5 0 M0 -9 L5 0 M-5 -16 L5 -16"/></g>` +
    `<text x="10" y="-4" class="ax-label" fill="var(--fg-secondary)">${label}</text></g>`;
  const human = fig(470, 34, "1:1000") + fig(636, 30, "");


  // ---- детали листа: лестница, ограждение, цепочка размеров, метки разреза, север ----
  const stairs = [];
  for (let i = 0; i < 7; i++) {
    const y = GY - 4 - i * 5;
    stairs.push(`<path d="M${towerX - 26 - i * 6} ${y} L${towerX - 4} ${y}" stroke="var(--fg-primary)" stroke-width="1"/>`);
  }
  const stairStringer = `<path d="M${towerX - 66} ${GY - 2} L${towerX - 4} ${GY - 38}" stroke="var(--fg-secondary)" stroke-width="1"/>`;
  const rail = [];
  for (let x = towerX - 14; x <= towerX + towerW + 14; x += 7) {
    rail.push(`<path d="M${x} ${GY - 16} L${x} ${GY - 10}" stroke="var(--line-structural)" stroke-width="0.8"/>`);
  }
  const railing = `<path d="M${towerX - 14} ${GY - 16} L${towerX + towerW + 14} ${GY - 16}" stroke="var(--fg-secondary)" stroke-width="1"/>${rail.join("")}`;

  const chainY = GY + 34;
  const chainX = [towerX - 16, 470, 560, 660, 760, 900, sph.cx + sph.r];
  const chain = `<path d="M${chainX[0]} ${chainY} L${chainX[chainX.length - 1]} ${chainY}" stroke="var(--line-structural)" stroke-width="1"/>` +
    chainX.map((x, i) => tick(x, chainY) +
      `<text x="${x + 4}" y="${chainY + 12}" class="ax-label" fill="var(--fg-secondary)">${String.fromCharCode(65 + i)}</text>`).join("") +
    [0, 1, 2, 3, 4, 5].map((i) => {
      const mid = (chainX[i] + chainX[i + 1]) / 2;
      return `<text x="${mid}" y="${chainY - 5}" text-anchor="middle" class="ax-label" fill="var(--fg-secondary)" opacity=".7">${i + 1}</text>`;
    }).join("");

  const sectionMarks =
    `<g class="det" style="--d:.9s">` +
    `<path d="M357 172 L357 196" stroke="var(--fg-primary)" stroke-width="3"/>` +
    `<path d="M373 172 L373 196" stroke="var(--fg-primary)" stroke-width="1"/>` +
    `<text x="334" y="188" class="ax-label" fill="var(--fg-primary)">А</text>` +
    `<path d="M357 184 L318 184" stroke="var(--line-structural)" stroke-width="1"/><path d="M322 180 L316 184 L322 188" fill="none" stroke="var(--line-structural)" stroke-width="1"/>` +
    `<path d="M357 ${GY + 2} L357 ${GY + 20}" stroke="var(--fg-primary)" stroke-width="3"/>` +
    `<path d="M373 ${GY + 2} L373 ${GY + 20}" stroke="var(--fg-primary)" stroke-width="1"/>` +
    `<text x="334" y="${GY + 16}" class="ax-label" fill="var(--fg-primary)">А</text>` +
    `<text x="380" y="${GY + 18}" class="ax-label" fill="var(--fg-secondary)">А—А</text></g>`;

  const north = `<g class="det" style="--d:1s" transform="translate(150 556)">` +
    `<circle r="17" fill="none" stroke="var(--line-structural)" stroke-width="1"/>` +
    `<path d="M0 10 L0 -11" stroke="var(--fg-primary)" stroke-width="1.2"/>` +
    `<path d="M0 -13 L-4 -5 L0 -8 L4 -5 Z" fill="var(--fg-primary)"/>` +
    `<text x="0" y="4" text-anchor="middle" class="ax-label" fill="var(--fg-secondary)">С</text></g>`;

  const shadowHatch = [];
  for (let i = 0; i < 16; i++) {
    const x = 742 + i * 11;
    shadowHatch.push(`<path d="M${x} ${GY} L${x - 26} ${GY - 26}" stroke="var(--line-grid-decor)" stroke-width="1"/>`);
  }
  const shadow = `<g class="det" style="--d:.7s">${shadowHatch.join("")}</g>`;


  // примечания и выносная деталь узла
  const notes = `<g class="det" style="--d:1.15s">
    <path d="M80 176 L250 176" stroke="var(--line-structural)" stroke-width="1"/>
    <text x="80" y="168" class="ax-label" fill="var(--fg-secondary)">${lang === "ru" ? "ПРИМЕЧАНИЯ" : "NOTES"}</text>
    <text x="80" y="194" class="ax-label" fill="var(--fg-secondary)">1. ${lang === "ru" ? "РАЗМЕРЫ УСЛОВНЫЕ" : "DIMENSIONS SCHEMATIC"}</text>
    <text x="80" y="210" class="ax-label" fill="var(--fg-secondary)">2. ${lang === "ru" ? "ПРОЕКЦИЯ АКСОНОМЕТРИЧЕСКАЯ" : "AXONOMETRIC PROJECTION"}</text>
    <text x="80" y="226" class="ax-label" fill="var(--fg-secondary)">3. ${lang === "ru" ? "ЛИНИИ ПО ISO 128" : "LINES PER ISO 128"}</text>
    <text x="80" y="242" class="ax-label" fill="var(--fg-secondary)">4. ${lang === "ru" ? "МАСШТАБ 1:1000" : "SCALE 1:1000"}</text>
  </g>`;

  const detailBox = `<g class="det" style="--d:1.3s">
    <rect x="946" y="96" width="176" height="118" fill="none" stroke="var(--line-structural)" stroke-width="1"/>
    <text x="946" y="88" class="ax-label" fill="var(--fg-secondary)">${lang === "ru" ? "ДЕТАЛЬ Д1" : "DETAIL D1"}</text>
    <path d="M962 168 L1074 168 M962 176 L1074 176" stroke="var(--fg-primary)" stroke-width="1.6"/>
    <path d="M962 152 L1074 152 M962 160 L1074 160" stroke="var(--fg-primary)" stroke-width="1"/>
    ${[0,1,2,3,4].map((i)=>`<path d="M${970+i*24} 148 L${958+i*24} 172" stroke="var(--line-structural)" stroke-width="1"/>`).join("")}
    <text x="1062" y="140" class="ax-label" fill="var(--fg-secondary)">1:10</text>
    <path d="M946 158 L716 214" stroke="var(--fg-secondary)" stroke-width="1" stroke-dasharray="6 4"/>
    <circle cx="716" cy="214" r="9" fill="none" stroke="var(--accent-primary)" stroke-width="1.2"/>
    <text x="728" y="218" class="ax-label" fill="var(--accent-primary)">Д1</text>
  </g>`;

  // выноски
  const labels = leader(towerX - 6, 330, 200, 330) + leader(sph.cx + 110, 430, 1030, 470) + leader(792, 196, 726, 132) +
    `<text x="116" y="324" class="ax-label" fill="var(--fg-primary)">${lang === "ru" ? "КНИГОХРАНИЛИЩЕ" : "BOOK STACK"}</text>` +
    `<text x="1034" y="474" class="ax-label" fill="var(--fg-primary)">${lang === "ru" ? "АУДИТОРИЯ" : "AUDITORIUM"}</text>` +
    `<text x="730" y="128" class="ax-label" fill="var(--fg-secondary)">${lang === "ru" ? "ОБОЛОЧКА" : "SHELL"}</text>`;


  // малый план: след башни и круг сферы
  const plan = `<g class="plan" transform="translate(96 452)">
    <rect x="0" y="0" width="196" height="132" fill="none" stroke="var(--line-structural)" stroke-width="1" stroke-dasharray="6 4"/>
    <rect x="18" y="24" width="46" height="84" fill="none" stroke="var(--fg-primary)" stroke-width="1.4"/>
    ${[0,1,2,3].map((i)=>`<line x1="26" y1="${34+i*19}" x2="56" y2="${34+i*19}" stroke="var(--line-structural)" stroke-width="0.8"/>`).join("")}
    <circle cx="128" cy="66" r="38" fill="none" stroke="var(--fg-primary)" stroke-width="1.6"/>
    <circle cx="128" cy="66" r="22" fill="none" stroke="var(--line-structural)" stroke-width="0.8"/>
    <line x1="128" y1="14" x2="128" y2="118" stroke="var(--line-structural)" stroke-width="0.8" stroke-dasharray="10 3 2 3"/>
    <line x1="76" y1="66" x2="180" y2="66" stroke="var(--line-structural)" stroke-width="0.8" stroke-dasharray="10 3 2 3"/>
    <text x="0" y="-8" class="ax-label" fill="var(--fg-secondary)">${lang === "ru" ? "ПЛАН" : "PLAN"}</text>
    <text x="0" y="148" class="ax-label" fill="var(--fg-secondary)">1:2000</text>
  </g>`;

  // штриховка ядра башни
  const coreHatch = [];
  for (let i = 0; i < 26; i++) {
    const y = towerTop + 8 + i * 14;
    if (y > GY - 40) break;
    coreHatch.push(`<line x1="${towerX + 54}" y1="${y}" x2="${towerX + 76}" y2="${y - 12}" stroke="var(--line-structural)" stroke-width="0.8" clip-path="url(#towerClip)"/>`);
  }
  const hatch = `<clipPath id="towerClip"><rect x="${towerX}" y="${towerTop}" width="${towerW}" height="${GY - 30 - towerTop}"/></clipPath>${coreHatch.join("")}`;

  // дуга построения радиуса сферы
  const construction = `<circle cx="${sph.cx}" cy="${sph.cy}" r="${(sph.r * 1.22).toFixed(1)}" fill="none" stroke="var(--line-grid-decor)" stroke-width="1" stroke-dasharray="2 7"/>`;

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="sheet-title" xmlns="http://www.w3.org/2000/svg">
<title id="sheet-title">${lang === "ru"
    ? "Реконструкция: Институт библиотековедения им. Ленина, Иван Леонидов, 1927 — башня книгохранилища и сфера-планетарий"
    : "Reconstruction: Lenin Institute of Librarianship, Ivan Leonidov, 1927 — book tower and planetarium sphere"}</title>
<defs>
  <radialGradient id="sphLight" cx="36%" cy="30%" r="72%">
    <stop offset="0%" stop-color="currentColor" stop-opacity=".12"/>
    <stop offset="65%" stop-color="currentColor" stop-opacity=".03"/>
    <stop offset="100%" stop-color="currentColor" stop-opacity="0"/>
  </radialGradient>
  <filter id="glow" x="-25%" y="-25%" width="150%" height="150%">
    <feGaussianBlur stdDeviation="1.2" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<g class="plot" filter="url(#glow)" style="color: var(--fg-primary)">
  ${ground}
  ${plinth}
  <rect x="${towerX}" y="${towerTop}" width="${towerW}" height="${GY - 30 - towerTop}" fill="none" stroke="var(--fg-primary)" stroke-width="2"/>
  ${floors.join("")}
  ${mullions.join("")}
  ${masts}
  ${base}
  ${sphere}
  ${bridge}
  ${axes}
  ${construction}
  ${axis23}
  ${hatch}
  ${plan}
  ${dims}
  ${human}
  ${labels}
  ${stairs.join("")}
  ${stairStringer}
  ${railing}
  ${chain}
  ${sectionMarks}
  ${north}
  ${shadow}
  ${notes}
  ${detailBox}
</g>
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

  return `<section class="hero" id="s-00">
  <div class="grid">
    <div class="hero-text">
      <p class="hero-role">${escape(role)} · ${escape(loc)}</p>
      <h1 class="hero-id">${escape(name)}</h1>
      <div class="hero-manifest prose">
        ${lead ? `<p>${escape(lead)}</p>` : ""}
        ${manifest.filter(Boolean).map((m) => `<p>${escape(m)}</p>`).join("")}
      </div>
    </div>
    <div class="hero-side dwg dwg--lg">
      <p><span>${lang === "ru" ? "ЛИСТ" : "SHEET"}</span><span>00 · ${lang === "ru" ? "ТИТУЛЬНЫЙ" : "TITLE"}</span></p>
      <p><span>${lang === "ru" ? "ПО ЧЕРТЕЖУ" : "AFTER"}</span><span>1927</span></p>
      <p><span>${lang === "ru" ? "ДОСТУПЕН" : "AVAILABLE"}</span><span>${escape(t(site.availability))}</span></p>
      <p><span>UTC</span><span>+3</span></p>
    </div>
    <figure class="hero-sheet">
      <span class="cross-x" aria-hidden="true"></span>
      <span class="cross-y" aria-hidden="true"></span>
      ${institute(lang)}
      <figcaption class="coords">
        <span id="coords">X 0000 · Y 0000</span>
        <span>${lang === "ru" ? "ИНСТИТУТ БИБЛИОТЕКОВЕДЕНИЯ · И. ЛЕОНИДОВ · 1927 · РАЗМЕРЫ УСЛОВНЫЕ" : "LENIN INSTITUTE · I. LEONIDOV · 1927 · DIMENSIONS SCHEMATIC"}</span>
      </figcaption>
    </figure>
  </div>
</section>

<section class="section reveal" id="s-02">
  <div class="section-head"><span class="num">02</span><h2>${escape(t(site.ui.work))}</h2><span class="rule"></span><span class="dwg">${projects.length} ${lang === "ru" ? "ПРОЕКТОВ" : "PROJECTS"}</span></div>
  <div class="grid">${preview}</div>
  <div class="link-row">
    <a class="link-big" href="${attr(routeHref("", lang, "work", lang))}"><span>${escape(t(site.ui.work))}</span><span aria-hidden="true">→</span></a>
    <a class="link-big" href="${attr(routeHref("", lang, "contact", lang))}"><span>${escape(t(site.ui.contact))}</span><span aria-hidden="true">→</span></a>
  </div>
</section>`;
}
