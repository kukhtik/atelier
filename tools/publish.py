"""Публикация через GitHub git-database API без git push (через gh api --input -).

blob → tree → commit → ref. Тело запроса передаётся по stdin: блобы шрифтов
больше лимита командной строки Windows.
"""
import base64, json, pathlib, subprocess, sys, time

OWNER, REPO = "kukhtik", "atelier"
ROOT = pathlib.Path(__file__).resolve().parents[1]
EXCLUDE = {".git", "dist", "source", "shots", "docs/sdd", "node_modules"}


def gh(method, path, payload=None, tries=4):
    args = ["gh", "api", "-X", method, path]
    data = None
    if payload is not None:
        args += ["--input", "-"]
        data = json.dumps(payload).encode()
    for n in range(1, tries + 1):
        p = subprocess.run(args, input=data, capture_output=True)
        if p.returncode == 0:
            out = p.stdout.decode().strip()
            return json.loads(out) if out else {}
        err = p.stderr.decode(errors="replace")
        if n < tries and ("timeout" in err.lower() or "502" in err or "503" in err or "504" in err or "connection reset" in err.lower()):
            time.sleep(6 * n)
            continue
        raise SystemExit(f"gh api {method} {path}: {err[:400]}")


def files():
    out = []
    for p in sorted(ROOT.rglob("*")):
        if not p.is_file():
            continue
        rel = p.relative_to(ROOT).as_posix()
        if any(rel == ex or rel.startswith(ex + "/") for ex in EXCLUDE):
            continue
        out.append((rel, p))
    return out


def main():
    items = files()
    print(f"файлов: {len(items)}")
    tree, total = [], 0
    for rel, p in items:
        raw = p.read_bytes()
        total += len(raw)
        blob = gh("POST", f"/repos/{OWNER}/{REPO}/git/blobs",
                  {"content": base64.b64encode(raw).decode(), "encoding": "base64"})
        tree.append({"path": rel, "mode": "100644", "type": "blob", "sha": blob["sha"]})
    print(f"объём: {total/1024:.0f} КБ")

    try:
        ref = gh("GET", f"/repos/{OWNER}/{REPO}/git/ref/heads/main")
    except SystemExit:
        ref = None
    payload = {"tree": tree}
    parents = []
    if ref:
        head = ref["object"]["sha"]
        base = gh("GET", f"/repos/{OWNER}/{REPO}/git/commits/{head}")
        payload["base_tree"] = base["tree"]["sha"]
        parents = [head]
    new_tree = gh("POST", f"/repos/{OWNER}/{REPO}/git/trees", payload)
    commit = gh("POST", f"/repos/{OWNER}/{REPO}/git/commits",
                {"message": sys.argv[1] if len(sys.argv) > 1 else "Atelier: сборка",
                 "tree": new_tree["sha"], "parents": parents})
    if ref:
        gh("PATCH", f"/repos/{OWNER}/{REPO}/git/refs/heads/main", {"sha": commit["sha"], "force": False})
    else:
        gh("POST", f"/repos/{OWNER}/{REPO}/git/refs", {"ref": "refs/heads/main", "sha": commit["sha"]})
    print("commit:", commit["sha"])


if __name__ == "__main__":
    main()
