// Инлайновая разметка контента: **жирный**, `код`, [текст](url). Всё остальное — экранируется.
import { escape } from "./html.mjs";

export function inline(text) {
  let s = escape(String(text ?? ""));
  s = s.replace(/`([^`]+)`/g, (_m, code) => `<code>${code}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, (_m, bold) => `<strong>${bold}</strong>`);
  s = s.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, (_m, label, url) => {
    const safe = url.replace(/"/g, "%22");
    return `<a href="${safe}" rel="noopener">${label}</a>`;
  });
  return s;
}

/** Текст без разметки — для карточек и мета-строк. */
export function plain(text) {
  return String(text ?? "")
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}
