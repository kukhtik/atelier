// Граф технологий: слои по роли, рёбра только по общим проектам (спека §13.1).
import { escape, attr } from "./html.mjs";

const W = 2200, PAD = 90, ROWH = 104, PER_ROW = 11;

export function graph(stack, lang) {
  const layers = stack.layers;
  const nodes = stack.nodes;
  const projOf = (id) => stack.projects[id] || [];

  // Слой шире PER_ROW узлов переносится на две строки — подписи не слипаются.
  const rows = [];
  for (const layer of layers) {
    const band = nodes
      .filter((n) => n.layer === layer.id)
      .sort((a, b) => projOf(b.id).length - projOf(a.id).length);
    if (!band.length) continue;
    const per = band.length > PER_ROW ? Math.ceil(band.length / 2) : band.length;
    for (let i = 0; i < band.length; i += per) {
      rows.push({ layer, nodes: band.slice(i, i + per), first: i === 0 });
    }
  }

  const H = PAD * 2 + (rows.length - 1) * ROWH;
  const pos = new Map();
  rows.forEach((row, ri) => {
    const y = PAD + ri * ROWH;
    const n = row.nodes.length;
    row.nodes.forEach((node, i) => {
      const x = n === 1 ? W / 2 : PAD + (i * (W - PAD * 2)) / (n - 1);
      pos.set(node.id, { x, y, node });
    });
  });

  const edges = [];
  const ids = nodes.map((n) => n.id);
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = projOf(ids[i]), b = projOf(ids[j]);
      const shared = a.filter((p) => b.includes(p));
      if (shared.length) edges.push({ a: ids[i], b: ids[j], shared: shared.length });
    }
  }

  const edgeSvg = edges
    .map((e) => {
      const A = pos.get(e.a), B = pos.get(e.b);
      if (!A || !B) return "";
      const sw = (0.5 + Math.min(e.shared, 6) * 0.3).toFixed(2);
      return `<line class="edge" data-a="${attr(e.a)}" data-b="${attr(e.b)}" x1="${A.x.toFixed(1)}" y1="${A.y.toFixed(1)}" x2="${B.x.toFixed(1)}" y2="${B.y.toFixed(1)}" stroke="var(--line-grid-decor)" stroke-width="${sw}" vector-effect="non-scaling-stroke"/>`;
    })
    .join("");

  const labelSvg = rows
    .map((row, ri) => {
      if (!row.first) return "";
      return `<text x="10" y="${(PAD + ri * ROWH - 26).toFixed(1)}" class="ax-label" fill="var(--fg-secondary)">${escape(
        row.layer.label[lang] || row.layer.label.ru
      )}</text>`;
    })
    .join("");

  const nodeSvg = rows
    .flatMap((row, ri) =>
      row.nodes.map((n, i) => {
        const p = pos.get(n.id);
        const short = n.label.length > 20 ? n.label.slice(0, 19) + "…" : n.label;
        const above = (i + ri) % 2 === 1;
        const ly = p.y + (above ? -13 : 23);
        return `<g class="node" data-node="${attr(n.id)}" tabindex="0" role="listitem" aria-label="${attr(n.label)}">` +
          `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="var(--fg-secondary)"/>` +
          `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${(above ? p.y - 8 : p.y + 9).toFixed(1)}" stroke="var(--line-structural)" stroke-width="1"/>` +
          `<text x="${p.x.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" fill="var(--fg-primary)" class="ax-label" paint-order="stroke" stroke="var(--bg)" stroke-width="4" stroke-linejoin="round">${escape(short)}</text>` +
          `</g>`;
      })
    )
    .join("");

  return `<svg class="graph" viewBox="0 0 ${W} ${Math.round(H)}" role="list" aria-label="${lang === "ru" ? "Граф технологий" : "Technology graph"}" xmlns="http://www.w3.org/2000/svg">
${labelSvg}
${edgeSvg}
${nodeSvg}
</svg>`;
}
