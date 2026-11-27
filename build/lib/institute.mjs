// Плотный архитектурный лист: фасад, разрез, план, деталь, легенда, размерные цепочки.
// Всё генерируется циклами; целевая плотность — тысячи линий, не десятки.
import { escape } from "./html.mjs";

const W = 1600, H = 1080;
const GY = 742;            // уровень земли
const T = { x1: 252, x2: 392, top: 168, floors: 15 };
const S = { cx: 596, cy: 452, r: 168 };
const SEC = { cx: 940, cy: 452, r: 150, x1: 820, x2: 1060 };

const P = (n) => n.toFixed(1);

/** Штриховка полигона линиями под 45° (заполнение). */
function hatchPolygon(pts, step = 8, attrs = 'stroke="var(--line-structural)" stroke-width="0.8"') {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const out = [];
  for (let c = minX - (maxY - minY); c < maxX; c += step) {
    out.push(`<path d="M${P(c)} ${P(maxY)} L${P(c + (maxY - minY))} ${P(minY)}" ${attrs}/>`);
  }
  return out.join("");
}

function dimChain(x1, x2, y, labels, attrs = "") {
  const out = [`<path d="M${P(x1)} ${P(y)} L${P(x2)} ${P(y)}" stroke="var(--line-structural)" stroke-width="1"/>`];
  const n = labels.length;
  for (let i = 0; i <= n; i++) {
    const x = x1 + ((x2 - x1) * i) / n;
    out.push(`<path d="M${P(x - 4)} ${P(y + 4)} L${P(x + 4)} ${P(y - 4)}" stroke="var(--fg-primary)" stroke-width="1"/>`);
    if (i < n) out.push(`<text x="${P(x + (x2 - x1) / n / 2)}" y="${P(y - 6)}" text-anchor="middle" class="ax-label" fill="var(--fg-secondary)">${escape(labels[i])}</text>`);
  }
  return `<g ${attrs}>${out.join("")}</g>`;
}

function vDimChain(y1, y2, x, labels) {
  const out = [`<path d="M${P(x)} ${P(y1)} L${P(x)} ${P(y2)}" stroke="var(--line-structural)" stroke-width="1"/>`];
  const n = labels.length;
  for (let i = 0; i <= n; i++) {
    const y = y1 + ((y2 - y1) * i) / n;
    out.push(`<path d="M${P(x - 4)} ${P(y + 4)} L${P(x + 4)} ${P(y - 4)}" stroke="var(--fg-primary)" stroke-width="1"/>`);
    if (i < n) out.push(`<text x="${P(x - 8)}" y="${P(y + (y2 - y1) / n / 2)}" text-anchor="end" class="ax-label" fill="var(--fg-secondary)">${escape(labels[i])}</text>`);
  }
  return out.join("");
}

function gridBubbles() {
  const out = [];
  const cols = ["А", "Б", "В", "Г", "Д", "Е", "Ж", "И"];
  const xs = [200, 300, 400, 500, 600, 700, 800, 900];
  cols.forEach((c, i) => {
    out.push(`<circle cx="${xs[i]}" cy="96" r="13" fill="none" stroke="var(--fg-secondary)" stroke-width="1"/>`);
    out.push(`<text x="${xs[i]}" y="101" text-anchor="middle" class="ax-label" fill="var(--fg-primary)">${c}</text>`);
    out.push(`<path d="M${xs[i]} 109 L${xs[i]} 760" stroke="var(--line-grid-decor)" stroke-width="1" stroke-dasharray="14 5 3 5"/>`);
  });
  const rows = ["1", "2", "3", "4"];
  const ys = [200, 380, 560, 740];
  rows.forEach((r, i) => {
    out.push(`<circle cx="150" cy="${ys[i]}" r="13" fill="none" stroke="var(--fg-secondary)" stroke-width="1"/>`);
    out.push(`<text x="150" y="${ys[i] + 5}" text-anchor="middle" class="ax-label" fill="var(--fg-primary)">${r}</text>`);
    out.push(`<path d="M163 ${ys[i]} L960 ${ys[i]}" stroke="var(--line-grid-decor)" stroke-width="1" stroke-dasharray="14 5 3 5"/>`);
  });
  return out.join("");
}

function towerElevation() {
  const out = [];
  const w = T.x2 - T.x1;
  out.push(`<rect x="${T.x1}" y="${T.top}" width="${w}" height="${GY - T.top}" fill="var(--bg)" stroke="var(--fg-primary)" stroke-width="3"/>`);
  const fh = (GY - T.top) / T.floors;
  // этажи: плита + окно + мullions
  for (let f = 0; f <= T.floors; f++) {
    const y = T.top + f * fh;
    out.push(`<path d="M${T.x1} ${P(y)} L${T.x2} ${P(y)}" stroke="var(--fg-primary)" stroke-width="1.6"/>`);
    if (f < T.floors) {
      out.push(`<path d="M${T.x1} ${P(y + 5)} L${T.x2} ${P(y + 5)}" stroke="var(--line-structural)" stroke-width="0.8"/>`);
      out.push(`<path d="M${T.x1} ${P(y + fh - 6)} L${T.x2} ${P(y + fh - 6)}" stroke="var(--line-structural)" stroke-width="0.8"/>`);
    }
  }
  for (let x = T.x1 + 6; x < T.x2; x += 6) {
    out.push(`<path d="M${P(x)} ${T.top + 4} L${P(x)} ${GY - 4}" stroke="var(--line-structural)" stroke-width="0.6" stroke-opacity=".8"/>`);
  }
  // фрамуги и полки книгохранилища
  for (let f = 0; f < T.floors; f++) {
    const y = T.top + f * fh;
    out.push(`<path d="M${T.x1 + 3} ${P(y + fh * 0.45)} L${T.x2 - 3} ${P(y + fh * 0.45)}" stroke="var(--line-grid-decor)" stroke-width="0.6"/>`);
    for (let x = T.x1 + 8; x < T.x2 - 8; x += 13) {
      out.push(`<path d="M${P(x)} ${P(y + 8)} l0 ${P(fh - 18)}" stroke="var(--line-grid-decor)" stroke-width="0.5"/>`);
    }
  }
  for (let f = 0; f < T.floors; f++) {
    const y = T.top + f * fh + fh - 12;
    for (let x = T.x1 + 4; x < T.x2 - 4; x += 7) out.push(`<path d="M${P(x)} ${P(y)} l0 -6" stroke="var(--line-grid-decor)" stroke-width="0.5"/>`);
    out.push(`<path d="M${T.x1 + 4} ${P(y - 6)} L${T.x2 - 4} ${P(y - 6)}" stroke="var(--line-structural)" stroke-width="0.7"/>`);
  }

  // лифтовое ядро + шахты
  out.push(`<rect x="${T.x1 + w / 2 - 18}" y="${T.top + 10}" width="36" height="${GY - T.top - 20}" fill="none" stroke="var(--fg-secondary)" stroke-width="1"/>`);
  for (let x = T.x1 + w / 2 - 14; x < T.x1 + w / 2 + 18; x += 7) {
    out.push(`<path d="M${P(x)} ${T.top + 14} L${P(x - 10)} ${GY - 16}" stroke="var(--line-structural)" stroke-width="0.7"/>`);
  }
  // мачты и раскосы
  out.push(`<path d="M${T.x1 + 24} ${T.top} L${T.x1 + 24} 76 M${T.x2 - 24} ${T.top} L${T.x2 - 24} 104" stroke="var(--fg-primary)" stroke-width="1.6"/>`);
  for (let y = T.top - 18; y > 90; y -= 18) {
    out.push(`<path d="M${T.x1 + 24} ${y} L${T.x2 - 24} ${y - 8}" stroke="var(--line-structural)" stroke-width="0.9"/>`);
    out.push(`<path d="M${T.x2 - 24} ${y} L${T.x1 + 24} ${y - 8}" stroke="var(--line-structural)" stroke-width="0.9"/>`);
  }
  // лестница у основания
  for (let i = 0; i < 14; i++) {
    out.push(`<path d="M${T.x1 - 34 - i * 5} ${GY - 6 - i * 4} L${T.x1 - 2} ${GY - 6 - i * 4}" stroke="var(--fg-primary)" stroke-width="1"/>`);
  }
  out.push(`<path d="M${T.x1 - 100} ${GY} L${T.x1 - 2} ${GY - 60}" stroke="var(--fg-secondary)" stroke-width="1"/>`);
  return out.join("");
}

function sphereElevation() {
  const out = [];
  out.push(`<circle cx="${S.cx}" cy="${S.cy}" r="${S.r + 4}" fill="var(--bg)" stroke="var(--bg)" stroke-width="10"/>`);
  out.push(`<circle cx="${S.cx}" cy="${S.cy}" r="${S.r}" fill="url(#shellLight)" stroke="var(--fg-primary)" stroke-width="3"/>`);
  // меридианы
  for (let m = 1; m < 36; m++) {
    const k = Math.cos((m * Math.PI) / 36);
    const back = Math.sin((m * Math.PI) / 36) < 0;
    out.push(`<ellipse cx="${S.cx}" cy="${S.cy}" rx="${P(Math.abs(k) * S.r)}" ry="${S.r}" fill="none" stroke="var(--line-structural)" stroke-width="${back ? 0.5 : 0.8}" ${back ? 'stroke-dasharray="5 4" opacity=".45"' : 'opacity=".9"'}/>`);
  }
  // параллели
  for (let p = -12; p <= 12; p++) {
    if (!p) continue;
    const dy = (p / 13) * S.r;
    const rx = Math.sqrt(S.r * S.r - dy * dy);
    out.push(`<ellipse cx="${S.cx}" cy="${P(S.cy + dy)}" rx="${P(rx)}" ry="${P(rx * 0.16)}" fill="none" stroke="var(--line-structural)" stroke-width="0.7" opacity=".8"/>`);
  }
  // триангуляция оболочки: дуги-панели
  for (let m = 0; m < 24; m++) {
    const a1 = (m * Math.PI) / 12, a2 = ((m + 1) * Math.PI) / 12;
    for (let p = -3; p < 3; p++) {
      const y1 = S.cy + (p / 4) * S.r, y2 = S.cy + ((p + 1) / 4) * S.r;
      const x1 = S.cx + Math.cos(a1) * Math.sqrt(Math.max(0, S.r * S.r - (y1 - S.cy) ** 2));
      const x2 = S.cx + Math.cos(a2) * Math.sqrt(Math.max(0, S.r * S.r - (y2 - S.cy) ** 2));
      out.push(`<path d="M${P(x1)} ${P(y1)} L${P(x2)} ${P(y2)}" stroke="var(--line-grid-decor)" stroke-width="0.6"/>`);
    }
  }
  // диагонали панелей
  for (let m = 0; m < 24; m++) {
    const a = (m * Math.PI) / 12;
    for (let p = -4; p < 4; p++) {
      const y1 = S.cy + (p / 5) * S.r, y2 = S.cy + ((p + 1) / 5) * S.r;
      const r1 = Math.sqrt(Math.max(0, S.r * S.r - (y1 - S.cy) ** 2));
      const r2 = Math.sqrt(Math.max(0, S.r * S.r - (y2 - S.cy) ** 2));
      out.push(`<path d="M${P(S.cx + Math.cos(a) * r1)} ${P(y1)} L${P(S.cx + Math.cos(a + 0.26) * r2)} ${P(y2)}" stroke="var(--line-grid-decor)" stroke-width="0.5"/>`);
    }
  }
  // амфитеатр: кольца и места
  for (let ring = 1; ring <= 7; ring++) {
    const rr = 26 + ring * 14;
    out.push(`<ellipse cx="${S.cx}" cy="${S.cy + 40}" rx="${rr}" ry="${P(rr * 0.34)}" fill="none" stroke="var(--line-structural)" stroke-width="0.8"/>`);
    const seats = 10 + ring * 4;
    for (let s = 0; s < seats; s++) {
      const a = Math.PI + (s / (seats - 1)) * Math.PI;
      const x = S.cx + Math.cos(a) * rr, y = S.cy + 40 + Math.sin(a) * rr * 0.34;
      out.push(`<path d="M${P(x)} ${P(y)} l0 4" stroke="var(--fg-secondary)" stroke-width="1"/>`);
    }
  }
  // постамент и вход
  out.push(`<path d="M${S.cx - 52} ${S.cy + S.r - 8} L${S.cx + 52} ${S.cy + S.r - 8} L${S.cx + 34} ${GY} L${S.cx - 34} ${GY} Z" fill="none" stroke="var(--fg-primary)" stroke-width="2"/>`);
  for (let i = 0; i < 5; i++) {
    out.push(`<path d="M${S.cx - 34 - i * 10} ${GY - 4 - i * 4} L${S.cx + 34 + i * 10} ${GY - 4 - i * 4}" stroke="var(--line-structural)" stroke-width="1"/>`);
  }
  return out.join("");
}

function bridgeElevation() {
  const out = [];
  const x0 = T.x2, x1 = S.cx - S.r + 14;
  const yTop = 400, yBot = 452;
  out.push(`<path d="M${x0} ${yTop} L${x1} ${yTop + 8} L${x1} ${yBot + 8} L${x0} ${yBot} Z" fill="none" stroke="var(--fg-primary)" stroke-width="1.8"/>`);
  for (let x = x0 + 8; x < x1 - 4; x += 12) {
    out.push(`<path d="M${P(x)} ${yTop + (x - x0) * 0.08} L${P(x)} ${yBot + (x - x0) * 0.08}" stroke="var(--line-structural)" stroke-width="0.7"/>`);
    out.push(`<path d="M${P(x)} ${yTop + 4} L${P(x + 12)} ${yBot}" stroke="var(--line-grid-decor)" stroke-width="0.6"/>`);
  }
  return out.join("");
}

function section() {
  const out = [];
  // подиум и разрез сферы
  const r = SEC.r, cx = SEC.cx, cy = SEC.cy;
  out.push(`<path d="M${cx - r} ${GY} L${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy} L${cx + r} ${GY} Z" fill="var(--bg)" stroke="var(--fg-primary)" stroke-width="3"/>`);
  out.push(hatchPolygon([[cx - r, GY], [cx - r + 26, GY], [cx - r + 26, cy], [cx - r, cy]], 7));
  out.push(hatchPolygon([[cx + r - 26, GY], [cx + r, GY], [cx + r, cy], [cx + r - 26, cy]], 7));
  // полы и ярусы
  for (let i = 1; i <= 5; i++) {
    const y = GY - i * 46;
    const half = Math.sqrt(Math.max(0, r * r - (cy - y) ** 2));
    out.push(`<path d="M${P(cx - half + 8)} ${y} L${P(cx + half - 8)} ${y}" stroke="var(--fg-primary)" stroke-width="1.2"/>`);
    for (let x = cx - half + 16; x < cx + half - 16; x += 16) {
      out.push(`<path d="M${P(x)} ${y} l0 6" stroke="var(--line-structural)" stroke-width="0.8"/>`);
    }
  }
  // стержни арматуры по контуру
  for (let a = -60; a <= 60; a += 6) {
    const rad = (a * Math.PI) / 180;
    out.push(`<circle cx="${P(cx + Math.sin(rad) * (r - 12))}" cy="${P(cy - Math.cos(rad) * (r - 12))}" r="1.4" fill="var(--fg-secondary)"/>`);
  }
  for (let y = cy + 20; y < GY; y += 18) {
    out.push(`<circle cx="${cx - r + 13}" cy="${y}" r="1.4" fill="var(--fg-secondary)"/><circle cx="${cx + r - 13}" cy="${y}" r="1.4" fill="var(--fg-secondary)"/>`);
  }

  // шахта лифта в разрезе
  out.push(`<rect x="${cx - 14}" y="${cy - r + 20}" width="28" height="${GY - cy + r - 20}" fill="none" stroke="var(--fg-secondary)" stroke-width="1"/>`);
  out.push(hatchPolygon([[cx - 14, cy - r + 20], [cx - 2, cy - r + 20], [cx - 2, GY], [cx - 14, GY]], 6));
  return out.join("");
}

function sitePlan() {
  const out = [];
  // контуры рельефа
  for (let i = 0; i < 14; i++) {
    const y = 786 + i * 18;
    const pts = [];
    for (let x = 120; x <= 1560; x += 60) pts.push(`${x} ${P(y + Math.sin((x + i * 40) / 120) * 7)}`);
    out.push(`<path d="M${pts.join(" L")}" fill="none" stroke="var(--line-grid-decor)" stroke-width="0.8"/>`);
  }
  // деревья
  for (let i = 0; i < 70; i++) {
    const x = 130 + ((i * 137) % 1400), y = 786 + ((i * 73) % 120);
    out.push(`<circle cx="${x}" cy="${y}" r="4" fill="none" stroke="var(--fg-secondary)" stroke-width="0.8"/><path d="M${x} ${y - 4} l0 -6" stroke="var(--fg-secondary)" stroke-width="0.8"/>`);
  }
  // соседние здания
  out.push(`<path d="M120 902 L300 902 L300 962 L120 962 Z" fill="none" stroke="var(--line-structural)" stroke-width="1"/>`);
  out.push(`<path d="M1180 902 L1340 902 L1340 968 L1180 968 Z" fill="none" stroke="var(--line-structural)" stroke-width="1"/>`);
  return out.join("");
}

function buildingPlan(ru) {
  const out = [];
  const x0 = 1128, y0 = 140, w = 380, h = 300;
  out.push(`<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="var(--fg-primary)" stroke-width="1.6"/>`);
  // помещения
  for (let i = 1; i < 7; i++) out.push(`<path d="M${x0 + (w / 7) * i} ${y0} L${x0 + (w / 7) * i} ${y0 + h}" stroke="var(--line-structural)" stroke-width="0.9"/>`);
  for (let j = 1; j < 5; j++) out.push(`<path d="M${x0} ${y0 + (h / 5) * j} L${x0 + w} ${y0 + (h / 5) * j}" stroke="var(--line-structural)" stroke-width="0.9"/>`);
  // двери
  for (let i = 1; i < 7; i++) for (let j = 0; j < 5; j++) {
    const x = x0 + (w / 7) * i, y = y0 + (h / 5) * j + 14;
    out.push(`<path d="M${x} ${y} a10 10 0 0 1 10 10" fill="none" stroke="var(--fg-secondary)" stroke-width="0.8"/>`);
  }
  // круглый зал и сцена
  out.push(`<circle cx="${x0 + w * 0.72}" cy="${y0 + h * 0.62}" r="52" fill="none" stroke="var(--fg-primary)" stroke-width="1.4"/>`);
  for (let k = 0; k < 12; k++) {
    const a = (k * Math.PI) / 6;
    out.push(`<path d="M${P(x0 + w * 0.72 + Math.cos(a) * 52)} ${P(y0 + h * 0.62 + Math.sin(a) * 52)} L${P(x0 + w * 0.72 + Math.cos(a) * 60)} ${P(y0 + h * 0.62 + Math.sin(a) * 60)}" stroke="var(--line-structural)" stroke-width="0.7"/>`);
  }
  out.push(`<text x="${x0 + 6}" y="${y0 - 8}" class="ax-label" fill="var(--fg-secondary)">${ru ? "ПЛАН 1:2000" : "PLAN 1:2000"}</text>`);
  return out.join("");
}

function detailD1() {
  const out = [];
  const x0 = 1128, y0 = 500, w = 380, h = 210;
  out.push(`<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="var(--line-structural)" stroke-width="1"/>`);
  // слои оболочки 1:5
  const layers = [
    [0, 6, "var(--fg-primary)", 2],
    [8, 10, "var(--line-structural)", 1],
    [12, 26, "var(--fg-primary)", 1.4],
    [30, 34, "var(--line-structural)", 1],
    [38, 44, "var(--fg-primary)", 2],
  ];
  layers.forEach(([off, hh, col, sw], i) => {
    out.push(`<path d="M${x0 + 24} ${y0 + 30 + off} L${x0 + w - 24} ${y0 + 30 + off} L${x0 + w - 24} ${y0 + 30 + off + hh} L${x0 + 24} ${y0 + 30 + off + hh} Z" fill="none" stroke="${col}" stroke-width="${sw}"/>`);
    if (i % 2 === 0) out.push(hatchPolygon([[x0 + 24, y0 + 30 + off], [x0 + w - 24, y0 + 30 + off], [x0 + w - 24, y0 + 30 + off + hh], [x0 + 24, y0 + 30 + off + hh]], 6));
  });
  for (let x = x0 + 40; x < x0 + w - 30; x += 34) {
    out.push(`<path d="M${x} ${y0 + 40} l14 150" stroke="var(--line-grid-decor)" stroke-width="0.6"/>`);
  }
  return out.join("");
}

function detailD2() {
  const out = [];
  const x0 = 1128, y0 = 940, w = 380, h = 120;
  out.push(`<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="var(--line-structural)" stroke-width="1"/>`);
  // две накладки
  out.push(`<path d="M${x0 + 30} ${y0 + 30} L${x0 + w - 30} ${y0 + 30} L${x0 + w - 30} ${y0 + 50} L${x0 + 30} ${y0 + 50} Z" fill="none" stroke="var(--fg-primary)" stroke-width="2"/>`);
  out.push(`<path d="M${x0 + 30} ${y0 + 74} L${x0 + w - 30} ${y0 + 74} L${x0 + w - 30} ${y0 + 94} L${x0 + 30} ${y0 + 94} Z" fill="none" stroke="var(--fg-primary)" stroke-width="2"/>`);
  // болты с гайками
  for (let i = 0; i < 8; i++) {
    const x = x0 + 60 + i * 40;
    out.push(`<path d="M${x} ${y0 + 50} L${x} ${y0 + 74}" stroke="var(--fg-primary)" stroke-width="1"/>`);
    out.push(`<circle cx="${x}" cy="${y0 + 40}" r="3" fill="none" stroke="var(--fg-secondary)" stroke-width="1"/>`);
    out.push(`<circle cx="${x}" cy="${y0 + 84}" r="3" fill="none" stroke="var(--fg-secondary)" stroke-width="1"/>`);
  }
  // сварные швы (треугольники)
  for (let i = 0; i < 14; i++) {
    const x = x0 + 40 + i * 22;
    out.push(`<path d="M${x} ${y0 + 30} l8 0 l-8 -8 Z" fill="none" stroke="var(--accent-primary)" stroke-width="0.9"/>`);
  }
  return out.join("");
}

function legend(entries) {
  const rows = entries
    .map(
      (e, i) =>
        `<g><circle cx="1136" cy="${560 + i * 26}" r="8" fill="none" stroke="var(--accent-primary)" stroke-width="1"/>` +
        `<text x="1136" y="${564 + i * 26}" text-anchor="middle" class="ax-label" fill="var(--accent-primary)">${i + 1}</text>` +
        `<text x="1154" y="${564 + i * 26}" class="ax-label" fill="var(--fg-secondary)">${escape(e)}</text></g>`
    )
    .join("");
  return rows;
}

export function institute(lang) {
  const ru = lang === "ru";
  const balloons = [
    [1, 300, 240], [2, 380, 320], [3, 596, 300], [4, 660, 520],
    [5, 480, 430], [6, 940, 380], [7, 1010, 520], [8, 596, 760],
  ];
  const leaders = balloons
    .map(([n, x, y]) => {
      const tx = [300, 320, 596, 640, 470, 940, 1000, 596][n - 1];
      const ty = [232, 330, 292, 470, 432, 372, 500, 745][n - 1];
      return `<path d="M${x} ${y} L${tx} ${ty}" stroke="var(--line-structural)" stroke-width="0.9"/><circle cx="${tx}" cy="${ty}" r="2" fill="var(--fg-primary)"/>`;
    })
    .join("");

  const north = `<g transform="translate(1068 120)"><circle r="20" fill="none" stroke="var(--line-structural)" stroke-width="1"/><path d="M0 12 L0 -13" stroke="var(--fg-primary)" stroke-width="1.4"/><path d="M0 -15 L-5 -6 L0 -9 L5 -6 Z" fill="var(--fg-primary)"/><text x="0" y="6" text-anchor="middle" class="ax-label" fill="var(--fg-secondary)">С</text></g>`;

  const levels = [[`${GY}`, "0.000"], [`${T.top}`, "+ВЕРХ"], [`${S.cy - S.r}`, "+КУПОЛ"]]
    .map(([y, l]) => `<path d="M1200 ${y} l-10 -8 l20 0 Z" fill="none" stroke="var(--fg-secondary)" stroke-width="1"/><path d="M1200 ${y} l0 16" stroke="var(--fg-secondary)" stroke-width="0.8"/><text x="1206" y="${Number(y) + 4}" class="ax-label" fill="var(--fg-secondary)">${l}</text>`)
    .join("");

  const pointer = balloons
    .map(([n, x, y]) => `<g class="det" style="--d:${0.6 + n * 0.08}s"><circle cx="${x}" cy="${y}" r="9" fill="var(--bg)" stroke="var(--accent-primary)" stroke-width="1.2"/><text x="${x}" y="${y + 4}" text-anchor="middle" class="ax-label" fill="var(--accent-primary)">${n}</text></g>`)
    .join("");

  const legendItems = ru
    ? ["МАЧТА СВЯЗИ", "КНИГОХРАНИЛИЩЕ", "ОБОЛОЧКА", "АМФИТЕАТР", "МОСТ", "РАЗРЕЗ А—А", "ПАНДУС", "ФУНДАМЕНТ"]
    : ["MAST", "BOOK STACK", "SHELL", "AMPHITHEATRE", "BRIDGE", "SECTION A—A", "RAMP", "FOUNDATION"];

  const notes = (ru
    ? ["РАЗМЕРЫ УСЛОВНЫЕ", "ПРОЕКЦИЯ АКСОНОМЕТРИЧЕСКАЯ", "ЛИНИИ ПО ISO 128", "БЕТОН ШТРИХУЕТСЯ ПОД 45°", "АРМИРОВАНИЕ УСЛОВНО", "УЗЛЫ СМ. Д1, Д2", "МАСШТАБ 1:1000"]
    : ["DIMENSIONS SCHEMATIC", "AXONOMETRIC PROJECTION", "LINES PER ISO 128", "CONCRETE HATCH 45°", "REBAR SCHEMATIC", "JOINTS SEE D1, D2", "SCALE 1:1000"]
  )
    .map((t, i) => `<text x="136" y="${842 + i * 17}" class="ax-label" fill="var(--fg-secondary)">${i + 1}. ${escape(t)}</text>`)
    .join("");

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="sheet-title" xmlns="http://www.w3.org/2000/svg">
<title id="sheet-title">${ru
    ? "Институт библиотековедения им. Ленина, И. Леонидов, 1927: фасад, разрез, план, деталь оболочки"
    : "Lenin Institute of Librarianship, I. Leonidov, 1927: elevation, section, plan, shell detail"}</title>
<defs>
  <radialGradient id="shellLight" cx="34%" cy="28%" r="72%">
    <stop offset="0%" stop-color="currentColor" stop-opacity=".14"/>
    <stop offset="65%" stop-color="currentColor" stop-opacity=".03"/>
    <stop offset="100%" stop-color="currentColor" stop-opacity="0"/>
  </radialGradient>
  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="1.1" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<g class="plot" style="color: var(--fg-primary)">
  ${gridBubbles()}
  ${sitePlan()}
  <path d="M100 ${GY} L1080 ${GY}" stroke="var(--fg-primary)" stroke-width="2"/>
  ${towerElevation()}
  ${bridgeElevation()}
  ${sphereElevation()}
  ${section()}
  ${buildingPlan(ru)}
  ${detailD1()}
  ${detailD2()}
  ${legend(legendItems)}
  ${notes}
  ${dimChain(200, 900, 790, ["1","2","3","4","5","6","7","8"])}
  ${vDimChain(168, GY, 214, ["01","02","03","04","05","06","07","08"])}
  <text x="1136" y="492" class="ax-label" fill="var(--fg-secondary)">${ru ? "ДЕТАЛЬ Д1 · 1:5" : "DETAIL D1 · 1:5"}</text>
  <text x="1136" y="932" class="ax-label" fill="var(--fg-secondary)">${ru ? "УЗЕЛ Д2 · 1:2" : "JOINT D2 · 1:2"}</text>
  ${leaders}
  ${pointer}
  ${north}
  ${levels}
  <path d="M700 700 L1128 620" stroke="var(--fg-secondary)" stroke-width="1" stroke-dasharray="6 4"/>
  <circle cx="700" cy="700" r="10" fill="none" stroke="var(--accent-primary)" stroke-width="1.2"/>
  <text x="714" y="704" class="ax-label" fill="var(--accent-primary)">Д1</text>
  <text x="136" y="820" class="ax-label" fill="var(--fg-secondary)">${ru ? "ПРИМЕЧАНИЯ" : "NOTES"}</text>
  <text x="206" y="782" class="ax-label" fill="var(--fg-secondary)">H1</text>
  <text x="196" y="${GY - 40}" class="ax-label" fill="var(--fg-secondary)">H2</text>
  <text x="${S.cx}" y="${S.cy + S.r + 26}" text-anchor="middle" class="ax-label" fill="var(--fg-secondary)">D1</text>
</g>
</svg>`;
}
