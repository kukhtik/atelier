// Блоки контента проекта: p / ul / table.
import { inline } from "./inline.mjs";

export function renderBlocks(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((b) => {
      if (b.t === "p") return `<p>${inline(b.v)}</p>`;
      if (b.t === "ul") return `<ul>${b.v.map((li) => `<li>${inline(li)}</li>`).join("")}</ul>`;
      if (b.t === "table") {
        const head = `<tr>${b.head.map((h) => `<th scope="col">${inline(h)}</th>`).join("")}</tr>`;
        const rows = b.rows
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
          .join("");
        return `<table class="spec"><thead>${head}</thead><tbody>${rows}</tbody></table>`;
      }
      return "";
    })
    .join("\n");
}

export function blocksText(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((b) => {
      if (b.t === "p") return b.v;
      if (b.t === "ul") return b.v.join(" ");
      if (b.t === "table") return [b.head.join(" "), ...b.rows.map((r) => r.join(" "))].join(" ");
      return "";
    })
    .join(" ");
}
