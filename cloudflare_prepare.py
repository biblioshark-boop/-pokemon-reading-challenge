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

text = text.replace("20261002184000", "20261013202000", 2)
text = text.replace("Patch #279 — One-time Admin Pumpkin Spawns", "Patch #303 — My Team Container Width Fix")
faq_gate = "if(requiresTeamSelection()&&!['home','settings'].includes(n)){"
if text.count(faq_gate) != 1:
    raise SystemExit("ERROR: FAQ navigation gate context changed; review before deploying.")
text = text.replace(faq_gate, "if(requiresTeamSelection()&&!['home','settings','faq'].includes(n)){", 1)

# My Team was built for an 1120px page, but the global <main> container is only
# 900px wide. That left the desktop two-column layout trying to fit a fixed
# right rail inside a container that was too narrow. Widen the parent only while
# My Team is active, then keep both stacks explicitly contained in their columns.
my_team_overlap_fix = """<style id=\"myTeamContainerWidthFix20261013\">
main:has(#myteamPage.active){
  max-width:1180px!important;
  width:100%!important;
}
#myteamPage{
  width:100%!important;
  max-width:1120px!important;
}
#myteamPage .myteam-main-layout{
  display:grid!important;
  grid-template-columns:minmax(0,1fr) minmax(290px,320px)!important;
  gap:18px!important;
  align-items:start!important;
  position:relative!important;
}
#myteamPage .myteam-left-stack{
  grid-column:1!important;
  grid-row:1!important;
  min-width:0!important;
  width:100%!important;
  max-width:100%!important;
}
#myteamPage .myteam-right-stack{
  grid-column:2!important;
  grid-row:1!important;
  display:flex!important;
  flex-direction:column!important;
  gap:18px!important;
  align-items:stretch!important;
  min-width:0!important;
  width:100%!important;
  max-width:100%!important;
  position:static!important;
  transform:none!important;
}
#myteamPage .myteam-left-stack>*,
#myteamPage .myteam-right-stack>*{
  min-width:0!important;
  max-width:100%!important;
  box-sizing:border-box!important;
}
#myteamPage .myteam-right-stack>.my-team-members-panel,
#myteamPage .myteam-right-stack>.myteam-cheer-panel{
  position:static!important;
  top:auto!important;
  inset:auto!important;
  transform:none!important;
  margin:0!important;
  width:100%!important;
}
#myteamPage .myteam-podium,
#myteamPage .myteam-podium-card{
  min-width:0!important;
  max-width:100%!important;
}
@media(max-width:1050px){
  #myteamPage .myteam-main-layout{grid-template-columns:1fr!important}
  #myteamPage .myteam-left-stack{grid-column:1!important;grid-row:1!important}
  #myteamPage .myteam-right-stack{grid-column:1!important;grid-row:2!important;width:100%!important}
}
</style>"""
head_open = text.lower().find("<head")
head_close = text.lower().find("</head>", head_open + 1)
if head_open == -1 or head_close == -1:
    raise SystemExit("ERROR: Could not locate the document head for My Team container fix.")
text = text[:head_close] + my_team_overlap_fix + "\n" + text[head_close:]

# Reassert the intended right-rail DOM after the async My Team render.
runtime_anchor = """ renderMyTeamCheerChoices(row.slug||\"\",canPost);\n renderMyTeamCheerFeedRows(row.slug||\"\",cheerRows);\n renderTeamBonusPanel(row,bonusRows);"""
runtime_guard = runtime_anchor + """

 const enforceMyTeamRightRail=()=>{
   const page=document.getElementById(\"myteamPage\");
   const layout=page?.querySelector(\".myteam-main-layout\");
   const members=page?.querySelector(\".my-team-members-panel\");
   const cheer=page?.querySelector(\".myteam-cheer-panel\");
   if(!layout||!members||!cheer)return;
   let rail=layout.querySelector(\":scope > .myteam-right-stack\");
   if(!rail){
     rail=document.createElement(\"div\");
     rail.className=\"myteam-right-stack\";
     layout.appendChild(rail);
   }
   if(members.parentElement!==rail)rail.appendChild(members);
   if(cheer.parentElement!==rail)rail.appendChild(cheer);
 };
 enforceMyTeamRightRail();
 requestAnimationFrame(enforceMyTeamRightRail);"""
if text.count(runtime_anchor) != 1:
    raise SystemExit("ERROR: My Team runtime render anchor changed; review before deploying.")
text = text.replace(runtime_anchor, runtime_guard, 1)

import shutil
shutil.copyfile(ROOT / "rf-challenge-welcome.js", ROOT / "dist" / "rf-challenge-welcome.js")
DIST_INDEX.write_text(text, encoding="utf-8")
if DIST_INDEX.stat().st_size > MAX_CF_ASSET:
    raise SystemExit("ERROR: Prepared index.html exceeds Cloudflare's 25 MiB limit after save conflict guard.")

print("SUCCESS: Pokémon patches applied to dist/index.html.")