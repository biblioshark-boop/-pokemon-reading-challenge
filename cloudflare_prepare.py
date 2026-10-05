from pathlib import Path
import json
import runpy

ROOT = Path(__file__).resolve().parent
BASE_PREPARE = ROOT / "cloudflare_prepare_base.py"
DIST_INDEX = ROOT / "dist" / "index.html"
PATCH_FILE = ROOT / "pokemon-save-conflict-guard.patch.json"
MAX_CF_ASSET = 25 * 1024 * 1024

# Run the existing, already-reviewed Cloudflare preparation unchanged first.
runpy.run_path(str(BASE_PREPARE), run_name="__main__")

if not DIST_INDEX.exists():
    raise SystemExit("ERROR: Base Cloudflare preparation did not create dist/index.html.")
if not PATCH_FILE.exists():
    raise SystemExit("ERROR: Pokémon save conflict guard patch file is missing.")

text = DIST_INDEX.read_text(encoding="utf-8")
changes = json.loads(PATCH_FILE.read_text(encoding="utf-8"))
for index, change in enumerate(changes, start=1):
    old = change["old"]
    new = change["new"]
    matches = text.count(old)
    if matches != 1:
        raise SystemExit(
            f"ERROR: Save conflict guard patch #{index} expected exactly one match, found {matches}. Stop and review before deploying."
        )
    text = text.replace(old, new, 1)

prompt_patch = ROOT / "pokemon-prompt-shiny.patch.json"
for index, change in enumerate(json.loads(prompt_patch.read_text(encoding="utf-8")), start=1):
    if text.count(change["old"]) != 1:
        raise SystemExit(f"ERROR: Prompt shiny patch #{index} context changed; review before deploying.")
    text = text.replace(change["old"], change["new"], 1)
text = text.replace("20261002184000", "20261005194500", 2)
text = text.replace("Patch #279 — One-time Admin Pumpkin Spawns", "Patch #281 — Extract Safari Encounter Rendering")
DIST_INDEX.write_text(text, encoding="utf-8")
if DIST_INDEX.stat().st_size > MAX_CF_ASSET:
    raise SystemExit("ERROR: Prepared index.html exceeds Cloudflare's 25 MiB limit after save conflict guard.")

print("SUCCESS: Pokémon save conflict guard applied to dist/index.html.")
