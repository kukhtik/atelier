import shutil, sys, pathlib
root = pathlib.Path(__file__).resolve().parents[1]
name = sys.argv[1]
dst = root/"docs/sdd/snapshots"/name
if dst.exists(): shutil.rmtree(dst)
ignore = shutil.ignore_patterns('dist','source','snapshots','shots','*.png','node_modules')
shutil.copytree(root, dst, ignore=ignore)
print("snapshot:", dst)
