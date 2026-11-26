// Загрузка и минимальная валидация контента. Ноль зависимостей.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join as pathJoin } from "node:path";

export function loadContent(root) {
  const contentDir = pathJoin(root, "content");
  const site = JSON.parse(readFileSync(pathJoin(contentDir, "site.json"), "utf8"));
  const stack = JSON.parse(readFileSync(pathJoin(contentDir, "stack.json"), "utf8"));

  const pdir = pathJoin(contentDir, "projects");
  if (!existsSync(pdir)) throw new Error("content/projects отсутствует");
  const projects = readdirSync(pdir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(pathJoin(pdir, f), "utf8")))
    .sort((a, b) => String(a.index).localeCompare(String(b.index)));

  const hash = createHash("sha256")
    .update(JSON.stringify(site) + JSON.stringify(projects) + JSON.stringify(stack))
    .digest("hex")
    .slice(0, 7);

  return { site, projects, stack, hash };
}
