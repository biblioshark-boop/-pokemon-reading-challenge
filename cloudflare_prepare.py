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

my_team_bonus_patch = ROOT / "pokemon-my-team-bonus-points.patch.json"
for index, change in enumerate(json.loads(my_team_bonus_patch.read_text(encoding="utf-8")), start=1):
    if text.count(change["old"]) != 1:
        raise SystemExit(f"ERROR: My Team bonus points patch #{index} context changed; review before deploying.")
    text = text.replace(change["old"], change["new"], 1)

my_team_personal_patch = ROOT / "pokemon-my-team-personal-contribution.patch.json"
for index, change in enumerate(json.loads(my_team_personal_patch.read_text(encoding="utf-8")), start=1):
    if text.count(change["old"]) != 1:
        raise SystemExit(f"ERROR: My Team personal contribution patch #{index} context changed; review before deploying.")
    text = text.replace(change["old"], change["new"], 1)

text = text.replace("20261002184000", "20261013194000", 2)
text = text.replace("Patch #279 — One-time Admin Pumpkin Spawns", "Patch #300 — My Team Right Rail Containment")
faq_gate = "if(requiresTeamSelection()&&!['home','settings'].includes(n)){"
if text.count(faq_gate) != 1:
    raise SystemExit("ERROR: FAQ navigation gate context changed; review before deploying.")
text = text.replace(faq_gate, "if(requiresTeamSelection()&&!['home','settings','faq'].includes(n)){", 1)

# Keep the My Team right rail contained within its own grid column. The older
# 390px sticky rail could visually cover the contributor/activity cards when
# the available content width was tighter than the desktop breakpoint implied.
my_team_overlap_fix = """<style id=\"myTeamRightRailContainment20261013\">
.myteam-main-layout{
  grid-template-columns:minmax(0,1fr) minmax(290px,320px)!important;
  gap:18px!important;
  align-items:start!important;
}
.myteam-left-stack,
.myteam-right-stack{
  min-width:0!important;
  width:100%!important;
  max-width:100%!important;
}
.myteam-left-stack>*{
  min-width:0!important;
  max-width:100%!important;
}
.myteam-right-stack{
  display:flex!important;
  flex-direction:column!important;
  gap:18px!important;
  align-items:stretch!important;
}
.myteam-right-stack>.my-team-members-panel,
.myteam-right-stack>.myteam-cheer-panel{
  position:static!important;
  top:auto!important;
  margin:0!important;
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
  box-sizing:border-box!important;
}
.myteam-podium,
.myteam-podium-card{
  min-width:0!important;
  max-width:100%!important;
}
@media(max-width:980px){
  .myteam-main-layout{grid-template-columns:1fr!important}
  .myteam-right-stack{width:100%!important}
}
</style>"""
if text.count("</head>") != 1:
    raise SystemExit("ERROR: Expected exactly one closing head tag for My Team containment fix.")
text = text.replace("</head>", my_team_overlap_fix + "\n</head>", 1)

import shutil
shutil.copyfile(ROOT / "rf-challenge-welcome.js", ROOT / "dist" / "rf-challenge-welcome.js")
DIST_INDEX.write_text(text, encoding="utf-8")
if DIST_INDEX.stat().st_size > MAX_CF_ASSET:
    raise SystemExit("ERROR: Prepared index.html exceeds Cloudflare's 25 MiB limit after save conflict guard.")

print("SUCCESS: Pokémon patches applied to dist/index.html.")
