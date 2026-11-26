// Планометрия: слои проекта как стопка ромбов (спека §10.5). Данные — из stack.json.
import { escape, attr } from "./html.mjs";

const HW = 108;      // половина ширины ромба
const HH = 54;       // половина высоты (2:1)
const DZ = 62;       // подъём слоя

/** Группирует узлы проекта по слоям: [{id,label,nodes:[label]}] */
export function projectLayers(project, stack) {
  const byLayer = new Map(stack.layers.map((l) => [l.id, { id: l.id, label: l.label, nodes: [] }]));
  const tokens = String(project.stack || "").split(/[·+]/).map((s) => s.trim()).filter(Boolean);
  const norm = tokens.map((t) => t.toLowerCase());
  for (const node of stack.nodes) {
    const hit = norm.some((t) => t.includes(node.id.replaceAll("-", " ")) || t.includes(node.id));
    if (hit) {
      const bucket = byLayer.get(node.layer);
      if (bucket && !bucket.nodes.includes(node.label)) bucket.nodes.push(node.label);
    }
  }
  const out = [...byLayer.values()].filter((l) => l.nodes.length);
  return out.length ? out : [{ id: "core", label: { ru: "ЯДРО", en: "CORE" }, nodes: [] }];
}

function rhombus(hw, hh) {
  return `M0 0 L${hw} ${-hh} L0 ${-hh * 2} L${-hw} ${-hh} Z`;
}

/**
 * Схема слоёв проекта.
 * @param {object} project
 * @param {object} stack
 * @param {{lang?:string,width?:number,compact?:boolean}} opts
 */
export function axonometry(project, stack, opts = {}) {
  const lang = opts.lang || "ru";
  const compact = !!opts.compact;
  const layers = projectLayers(project, stack).slice(0, 5);
  const titleId = `ax-${project.slug}-title`;
  const layerH = compact ? 34 : DZ;
  const hw = compact ? 62 : HW;
  const hh = compact ? 31 : HH;
  const top = 40;
  const height = top + layerH * (layers.length - 1) + hh * 2 + 24;
  const width = hw * 2 + 40;
  const cx = width / 2;
  const baseY = height - 26;

  const parts = [];
  layers.forEach((layer, i) => {
    const y = baseY - i * layerH;
    const opacity = 1 - i * 0.07;
    parts.push(
      `<g class="layer" transform="translate(${cx} ${y})" opacity="${opacity.toFixed(2)}">` +
        `<path d="${rhombus(hw, hh)}" fill="none" stroke="var(--line-structural)" stroke-width="1" vector-effect="non-scaling-stroke"/>` +
        (compact ? "" : axisLine(hw, hh)) +
        nodeDots(layer.nodes, hw, hh, compact) +
        (compact
          ? ""
          : `<text x="${-hw + 6}" y="${4}" class="ax-label" fill="var(--fg-secondary)">${escape(
              layer.label[lang] || layer.label.ru
            )}</text>`) +
        `</g>`
    );
  });

  // ось Z — штрихпунктирная, по ISO 128 тип G
  const axisTop = baseY - (layers.length - 1) * layerH - hh * 2 - 6;
  parts.push(
    `<line x1="${cx}" y1="${baseY + hh + 8}" x2="${cx}" y2="${axisTop}" stroke="var(--line-structural)" stroke-width="1" stroke-dasharray="12 4 2 4"/>`
  );

  return (
    `<svg class="ax${compact ? " ax--compact" : ""}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${attr(titleId)}" xmlns="http://www.w3.org/2000/svg">` +
    `<title id="${attr(titleId)}">${escape(
      (lang === "ru" ? "Слои стека: " : "Stack layers: ") + project.title[lang]
    )}</title>` +
    parts.join("") +
    `</svg>`
  );
}

function axisLine(hw, hh) {
  return `<line x1="${-hw}" y1="${-hh}" x2="${hw}" y2="${-hh}" stroke="var(--line-grid-decor)" stroke-width="1"/>`;
}

function nodeDots(nodes, hw, hh, compact) {
  const n = Math.min(nodes.length, compact ? 3 : 6);
  if (!n) return "";
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x = -hw + 16 + t * (hw * 2 - 32);
    out.push(
      `<circle cx="${x.toFixed(1)}" cy="${(-hh).toFixed(1)}" r="${compact ? 1.6 : 2.4}" fill="${
        i === 0 ? "var(--accent-primary)" : "var(--fg-secondary)"
      }"/>`
    );
  }
  return out.join("");
}
