// Взрыв-аксонометрия слоёв проекта: плиты с толщиной, модулями, штриховкой,
// подписями и осевыми направляющими (спека §10.5). Проекция — аксонометрия 30°.
import { escape, attr } from "./html.mjs";

const COS = 0.866, SIN = 0.5;

function makeP(cx, cy, s) {
  return (x, y, z) => [cx + (x - y) * COS * s, cy + (x + y) * SIN * s - z * s];
}

export function projectLayers(project, stack) {
  const byLayer = new Map(stack.layers.map((l) => [l.id, { id: l.id, label: l.label, nodes: [] }]));
  const tokens = String(project.stack || "").split(/[·+]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  for (const node of stack.nodes) {
    const hit = tokens.some((t) => t.includes(node.id.replaceAll("-", " ")) || t.includes(node.id));
    if (hit) {
      const bucket = byLayer.get(node.layer);
      if (bucket && !bucket.nodes.includes(node.label)) bucket.nodes.push(node.label);
    }
  }
  const out = [...byLayer.values()].filter((l) => l.nodes.length);
  return out.length ? out : [{ id: "core", label: { ru: "ЯДРО", en: "CORE" }, nodes: [] }];
}

/**
 * @param {object} project
 * @param {object} stack
 * @param {{lang?:string, compact?:boolean}} opts
 */
export function axonometry(project, stack, opts = {}) {
  const lang = opts.lang || "ru";
  const compact = !!opts.compact;
  const layers = projectLayers(project, stack).slice(0, compact ? 4 : 5);
  const uid = `ax-${project.slug}${compact ? "-c" : ""}`;

  const s = compact ? 0.66 : 1;
  const W = compact ? 150 : 230;
  const D = compact ? 84 : 120;
  const T = compact ? 9 : 12;
  const GAP = compact ? 52 : 66;
  const n = layers.length;
  const labelW = compact ? 96 : 190;
  const width = (W + D) * COS * 2 * s + labelW + 20;
  const height = (n - 1) * GAP + (D * SIN * 2 + T) * s + 74;
  const cx = compact ? 18 : 130;
  const cy = 42 + D * SIN * s;
  const p = makeP(cx, cy, s);

  const parts = [];
  const labelParts = [];

  layers.forEach((layer, i) => {
    const z = i * GAP;
    const op = i === 0 && n > 1 ? "0.72" : (1 - i * 0.05).toFixed(2);
    const top = [p(0, 0, z + T), p(W, 0, z + T), p(W, D, z + T), p(0, D, z + T)]
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");
    const left = [p(0, 0, z), p(0, D, z), p(0, D, z + T), p(0, 0, z + T)]
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");
    const right = [p(W, 0, z), p(W, D, z), p(W, D, z + T), p(W, 0, z + T)]
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");

    const modules = [];
    const m = Math.min(layer.nodes.length || 2, compact ? 3 : 5);
    for (let k = 0; k < m; k++) {
      const size = compact ? 9 : 14;
      const mx = 16 + (k * (W - 32)) / Math.max(m - 1, 1) - size / 2;
      const my = D / 2 - size / 2;
      const corners = [
        p(mx, my, z + T),
        p(mx + size, my, z + T),
        p(mx + size, my + size, z + T),
        p(mx, my + size, z + T),
      ]
        .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
        .join(" ");
      modules.push(`<polygon points="${corners}" fill="var(--bg)" stroke="var(--fg-primary)" stroke-width="1"/>`);
    }

    parts.push(
      `<g class="layer" opacity="${op}">` +
        `<polygon points="${left}" fill="url(#${uid}-hatch)" stroke="var(--fg-primary)" stroke-width="1.2"/>` +
        `<polygon points="${right}" fill="var(--bg)" stroke="var(--fg-primary)" stroke-width="1.2"/>` +
        `<polygon points="${top}" fill="var(--surface)" stroke="var(--fg-primary)" stroke-width="1.6"/>` +
        modules.join("") +
        `</g>`
    );

    const [ex, ey] = p(W, D / 2, z + T);
    const lx = (W + D) * COS * s + 26;
    if (compact) {
      labelParts.push(
        `<text x="${(ex + 7).toFixed(1)}" y="${(ey - 2).toFixed(1)}" class="ax-label ax-note" fill="var(--fg-secondary)">${escape(
          (layer.label[lang] || layer.label.ru).slice(0, 10)
        )}</text>`
      );
    } else {
      labelParts.push(
        `<path d="M${ex.toFixed(1)} ${ey.toFixed(1)} L${(lx - 10).toFixed(1)} ${(ey - 6).toFixed(1)}" stroke="var(--line-structural)" stroke-width="1"/>` +
          `<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="2.4" fill="var(--fg-primary)"/>` +
          `<text x="${lx}" y="${(ey - 4).toFixed(1)}" class="ax-label" fill="var(--fg-primary)">${escape(
            layer.label[lang] || layer.label.ru
          )}</text>` +
          `<text x="${lx}" y="${(ey + 12).toFixed(1)}" class="ax-label" fill="var(--fg-secondary)">${escape(
            (layer.nodes.slice(0, 3).join(" · ") || "").slice(0, 34)
          )}</text>`
      );
    }
  });

  const guides = [[0, 0], [W, 0], [W, D], [0, D]].map(([gx, gy]) => {
    const a = p(gx, gy, -10), b = p(gx, gy, (n - 1) * GAP + T + 14);
    return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="var(--line-grid-decor)" stroke-width="1" stroke-dasharray="3 6"/>`;
  }).join("");

  const bolts = [];
  for (let i = 1; i < n; i++) {
    const zc = i * GAP - GAP / 2;
    for (const [bx, by] of [[W * 0.25, D / 2], [W * 0.75, D / 2]]) {
      const a = p(bx, by, zc - 5), b2 = p(bx, by, zc + 5);
      bolts.push(`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b2[0].toFixed(1)}" y2="${b2[1].toFixed(1)}" stroke="var(--fg-secondary)" stroke-width="1"/>`);
    }
  }
  const spineTop = p(W / 2, D / 2, (n - 1) * GAP + T + 22);
  const spineBottom = p(W / 2, D / 2, -14);
  const spine = `<path d="M${spineBottom[0].toFixed(1)} ${spineBottom[1].toFixed(1)} L${spineTop[0].toFixed(1)} ${spineTop[1].toFixed(1)}" stroke="var(--line-structural)" stroke-width="1" stroke-dasharray="12 4 2 4"/>`;

  // размерная линия высоты стопки + триада осей (только полный вид)
  let dims = "";
  if (!compact) {
    const bot = p(0, 0, 0), top = p(0, 0, (n - 1) * GAP + T);
    const dx = bot[0] - 34;
    dims =
      `<path d="M${dx.toFixed(1)} ${bot[1].toFixed(1)} L${dx.toFixed(1)} ${top[1].toFixed(1)}" stroke="var(--line-structural)" stroke-width="1"/>` +
      `<path d="M${(dx - 5).toFixed(1)} ${(bot[1] + 5).toFixed(1)} L${(dx + 5).toFixed(1)} ${(bot[1] - 5).toFixed(1)}" stroke="var(--fg-primary)" stroke-width="1.2"/>` +
      `<path d="M${(dx - 5).toFixed(1)} ${(top[1] + 5).toFixed(1)} L${(dx + 5).toFixed(1)} ${(top[1] - 5).toFixed(1)}" stroke="var(--fg-primary)" stroke-width="1.2"/>` +
      `<text x="${(dx - 8).toFixed(1)}" y="${((bot[1] + top[1]) / 2).toFixed(1)}" text-anchor="end" class="ax-label" fill="var(--fg-secondary)">${n} ${lang === "ru" ? "СЛОЯ" : "LAYERS"}</text>`;
  }
  const triad = compact
    ? ""
    : `<g transform="translate(${(width - 62).toFixed(0)} ${(height - 30).toFixed(0)})" stroke="var(--fg-secondary)" stroke-width="1" fill="none">
        <path d="M0 0 L26 15"/><path d="M26 15 L20 12 M26 15 L23 9"/>
        <path d="M0 0 L26 -15"/><path d="M26 -15 L20 -12 M26 -15 L23 -9"/>
        <path d="M0 0 L0 -22"/><path d="M0 -22 L-3 -16 M0 -22 L3 -16"/>
        <text x="30" y="19" class="ax-label" stroke="none" fill="var(--fg-secondary)">X</text>
        <text x="30" y="-14" class="ax-label" stroke="none" fill="var(--fg-secondary)">Y</text>
        <text x="-3" y="-26" class="ax-label" stroke="none" fill="var(--fg-secondary)">Z</text>
      </g>`;

  const titleId = `${uid}-title`;
  return (
    `<svg class="ax${compact ? " ax--compact" : ""}" viewBox="0 0 ${Math.round(width)} ${Math.round(height)}" role="img" aria-labelledby="${attr(titleId)}" xmlns="http://www.w3.org/2000/svg">` +
    `<title id="${attr(titleId)}">${escape(
      (lang === "ru" ? "Слои архитектуры: " : "Architecture layers: ") + project.title[lang]
    )}</title>` +
    `<defs><pattern id="${uid}-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
    `<line x1="0" y1="0" x2="0" y2="5" stroke="var(--fg-secondary)" stroke-width="1" stroke-opacity=".55"/></pattern></defs>` +
    guides +
    bolts.join("") +
    spine +
    dims +
    triad +
    parts.join("") +
    labelParts.join("") +
    `</svg>`
  );
}
