"""Публикация статики через GitHub git-database API (без git push).

blob → tree → commit → ref, как требует скилл publish-static-site-github-api:
blob-эндпоинт с encoding=base64, затем ссылка по sha (никакого content в tree).
"""
import base64, json, pathlib, subprocess, sys, time, urllib.request, urllib.error

OWNER, REPO = "kukhtik", "atelier"
ROOT = pathlib.Path(__file__).resolve().parents[1]
EXCLUDE = {".git", "dist", "source", "shots", "docs/sdd", "node_modules"}


def token():
    return subprocess.run(["gh", "auth", "token"], capture_output=True, text=True, check=True).stdout.strip()


TOKEN = token()


def api(method, path, payload=None, tries=4):
    url = f"https://api.github.com{path}"
    data = json.dumps(payload).encode() if payload is not None else None
    for n in range(1, tries + 1):
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header("Authorization", f"Bearer {TOKEN}")
        req.add_header("Accept", "application/vnd.github+json")
        req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read() or b"{}")
        except urllib.error.HTTPError as e:
            body = e.read().decode(errors="replace")[:300]
            if e.code in (502, 503, 504) and n < tries:
                time.sleep(6 * n)
                continue
            raise SystemExit(f"HTTP {e.code} {method} {path}: {body}")
        except (urllib.error.URLError, TimeoutError) as e:
            if n < tries:
                time.sleep(6 * n)
                continue
            raise


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
    print(f"файлов к публикации: {len(items)}")
    tree, total = [], 0
    for rel, p in items:
        raw = p.read_bytes()
        total += len(raw)
        blob = api("POST", f"/repos/{OWNER}/{REPO}/git/blobs",
                   {"content": base64.b64encode(raw).decode(), "encoding": "base64"})
        tree.append({"path": rel, "mode": "100644", "type": "blob", "sha": blob["sha"]})
    print(f"объём: {total/1024:.0f} КБ")

    ref = api("GET", f"/repos/{OWNER}/{REPO}/git/ref/heads/main") if has_main() else None
    payload = {"tree": tree}
    parents = []
    if ref:
        payload["base_tree"] = api("GET", f"/repos/{OWNER}/{REPO}/git/commits/{ref['object']['sha']}")["tree"]["sha"]
        parents = [ref["object"]["sha"]]
    new_tree = api("POST", f"/repos/{OWNER}/{REPO}/git/trees", payload)

    commit = api("POST", f"/repos/{OWNER}/{REPO}/git/commits",
                 {"message": "Atelier v1: контентный корпус, четыре носителя, сборщик и гейты",
                  "tree": new_tree["sha"], "parents": parents})
    if ref:
        api("PATCH", f"/repos/{OWNER}/{REPO}/git/refs/heads/main", {"sha": commit["sha"], "force": False})
    else:
        api("POST", f"/repos/{OWNER}/{REPO}/git/refs", {"ref": "refs/heads/main", "sha": commit["sha"]})
    print("commit:", commit["sha"])


def has_main():
    try:
        api("GET", f"/repos/{OWNER}/{REPO}/git/ref/heads/main")
        return True
    except SystemExit:
        return False


if __name__ == "__main__":
    main()
