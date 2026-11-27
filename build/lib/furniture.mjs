// Детальный слой листа: кромочные линейки, кроп-марки, маргиналии.
import { escape } from "./html.mjs";

/** Горизонтальная линейка по верхней кромке: штрихи каждые 50, подписи каждые 100. */
export function topRuler(width = 1500, step = 50, labelEvery = 100) {
  const ticks = [];
  for (let x = 0; x <= width; x += step) {
    const big = x % labelEvery === 0;
    ticks.push(
      `<span class="tick${big ? " tick--big" : ""}" style="left:${x}px">${big ? `<i>${x}</i>` : ""}</span>`
    );
  }
  return `<div class="edge-ruler edge-ruler--top" aria-hidden="true">${ticks.join("")}</div>`;
}

/** Вертикальная линейка по левой кромке. */
export function leftRuler(height = 1400, step = 50, labelEvery = 100) {
  const ticks = [];
  for (let y = 0; y <= height; y += step) {
    const big = y % labelEvery === 0;
    ticks.push(
      `<span class="tick${big ? " tick--big" : ""}" style="top:${y}px">${big ? `<i>${y}</i>` : ""}</span>`
    );
  }
  return `<div class="edge-ruler edge-ruler--left" aria-hidden="true">${ticks.join("")}</div>`;
}

/** Кроп-марки по четырём углам листа. */
export function cropMarks() {
  return `<div class="crops" aria-hidden="true">${["tl", "tr", "bl", "br"]
    .map((k) => `<span class="crop crop--${k}"></span>`)
    .join("")}</div>`;
}

/** Вертикальная маргиналия у левого поля. */
export function marginalia(text) {
  return `<div class="marginalia" aria-hidden="true">${escape(text)}</div>`;
}

/** Таблица изменений для штампа. */
export function revisionTable(rows, lang) {
  const head =
    lang === "ru"
      ? ["ИЗМ", "ЛИСТ", "ДАТА"]
      : ["REV", "SHEET", "DATE"];
  return (
    `<table class="revisions"><thead><tr>` +
    head.map((h) => `<th>${escape(h)}</th>`).join("") +
    `</tr></thead><tbody>` +
    rows.map((r) => `<tr>${r.map((c) => `<td>${escape(c)}</td>`).join("")}</tr>`).join("") +
    `</tbody></table>`
  );
}

/** Мини-масштабная линейка: 5 делений. */
export function scaleBar(lang) {
  return (
    `<div class="scalebar" aria-hidden="true">` +
    `<span></span><span></span><span></span><span></span><span></span>` +
    `<i>0</i><i>${lang === "ru" ? "УСЛОВНО" : "SCHEMATIC"}</i>` +
    `</div>`
  );
}
