from pathlib import Path
import re

path = Path("index.html")
c = path.read_text(encoding="utf-8")

def rr(old, new, label):
    global c
    if old not in c:
        raise RuntimeError(f"Missing {label}")
    c = c.replace(old, new, 1)

def rx(pattern, new, label):
    global c
    c2, n = re.subn(pattern, new, c, count=1, flags=re.S)
    if n != 1:
        raise RuntimeError(f"Missing {label}")
    c = c2

if "Patch #275 — Remove Public Sharing + Locked Achievement Progress" in c:
    print("Patch 275 already applied.")
    raise SystemExit(0)

rr(
'<!DOCTYPE html><!-- RF_BUILD:20260918042000 --><!-- RF_PATCH_NAME:Patch #274 — Refresh Top Recruiter Badge Image --><html lang="en"><head>',
'<!DOCTYPE html><!-- RF_BUILD:20260925220000 --><!-- RF_PATCH_NAME:Patch #275 — Remove Public Sharing + Locked Achievement Progress --><html lang="en"><head>',
"top build marker"
)
rr(
'const RF_BUILD="20260918042000";\nconst RF_PATCH_NAME="Patch #274 — Refresh Top Recruiter Badge Image";',
'const RF_BUILD="20260925220000";\nconst RF_PATCH_NAME="Patch #275 — Remove Public Sharing + Locked Achievement Progress";',
"js build marker"
)

rx(
r'<div class="setting-row"><strong>Public sharing</strong><div class="muted">Creates a read-only link to your caught Pokémon, prompts and books\.</div><button id="sharingBtn"[\s\S]*?</div></div><div class="setting-row"><button class="secondary" style="width:100%" onclick="downloadMyBackup\(\)">',
'<div class="setting-row"><button class="secondary" style="width:100%" onclick="downloadMyBackup()">',
"public sharing settings block"
)

rr('<div id="publicBanner" class="public-banner hidden">Public Reading Frenzy challenge view</div>', '', "public banner")

rx(r'function publicData\(\)\{[\s\S]*?return\{challengeData:c,customPokemon,genres\}\}\n', '', "publicData")
rx(r'const shareURL=\(\)=>[\s\S]*?async function loadPublic\(u\)\{[\s\S]*?return true\}\n', '', "sharing functions")
rx(r'async function startPublic\(u\)\{[\s\S]*?\n\}\nfunction pageFromLocation\(\)\{', 'function pageFromLocation(){', "startPublic")
rr(
'async function init(){\nconst u=new URLSearchParams(location.search).get("u");\nif(u)return startPublic(u);\nconst recoveryLink=isPasswordRecoveryUrl();',
'async function init(){\nconst recoveryLink=isPasswordRecoveryUrl();',
"public init routing"
)

c = c.replace('updateShare();', '')
c = c.replace('p_public_data:publicData(),', 'p_public_data:{},')
c = c.replace('p_is_public:isPublic,', 'p_is_public:false,')
c = c.replace('localPublicData:publicData(),', 'localPublicData:{},')
c = c.replace('localIsPublic:isPublic,', 'localIsPublic:false,')
c = c.replace('.select("data,is_public,updated_at")', '.select("data,updated_at")')
c = c.replace('.select("data,is_public")', '.select("data")')
c = c.replace('  isPublic=!!data.is_public;\n', '  isPublic=false;\n')
c = c.replace('    isPublic:!!data.is_public\n', '    isPublic:false\n')
c = c.replace('challenge:{challengeData,customPokemon,genres,achievementClaims,isPublic:!!isPublic}', 'challenge:{challengeData,customPokemon,genres,achievementClaims}')
c = c.replace(',isPublic:!!isPublic};', '};')
c = c.replace('  if(typeof p.isPublic==="boolean")isPublic=p.isPublic;\n', '  isPublic=false;\n')

anchor = """function achievementShellState(a){
  const claims=getAchievementClaims();"""
helper = """function achievementProgressText(a){
  const title=String(a?.title||"");
  const milestone=ACHIEVEMENT_MILESTONES[title];
  if(milestone)return `${Math.min(achievementCaughtCount(),milestone)} / ${milestone} Pokémon caught`;
  const type=ACHIEVEMENT_TYPE_TARGETS[title];
  if(type)return `${Math.min(achievementCaughtPrimaryTypeCount(type),10)} / 10 ${type}-type Pokémon caught`;
  const safariTarget=ACHIEVEMENT_SAFARI_TARGETS[title];
  if(safariTarget)return `${Math.min(achievementSafariCaughtCount(),safariTarget)} / ${safariTarget} Safari catches`;
  const shinyTarget=ACHIEVEMENT_SHINY_TARGETS[title];
  if(shinyTarget)return `${Math.min(achievementShinyCaughtCount(),shinyTarget)} / ${shinyTarget} shiny Pokémon caught`;
  if(title==="Evolution Expert")return `${achievementEvolutionExpertEligible?1:0} / 1 evolution line completed`;
  const collectionRule=ACHIEVEMENT_COLLECTION_RULES[title];
  if(collectionRule){
    const total=collectionRule.mode==="all"?achievementCollectionTargets(collectionRule.key).length:Number(collectionRule.count||0);
    const current=Math.min(achievementCollectionCaughtCount(collectionRule.key),total);
    if(total)return `${current} / ${total} required Pokémon caught`;
  }
  const factionSlug=ACHIEVEMENT_TEAM_TITLE_SLUG[title];
  if(factionSlug){
    const required=Object.entries(achievementTeamBonusTagsBySlug).filter(([,teams])=>teams.some(t=>String(t.slug)===String(factionSlug))).map(([pokemonSlug])=>String(pokemonSlug).toLowerCase());
    if(required.length){
      const caughtSlugs=new Set(all().filter(p=>caught(p)).map(achievementCatalogKey));
      return `${required.filter(slug=>caughtSlugs.has(slug)).length} / ${required.length} team bonus Pokémon caught`;
    }
  }
  const trainerKey=achievementTrainerTeamKeyForTitle(title);
  if(trainerKey){
    const items=ACHIEVEMENT_TRAINER_SPEC[trainerKey]||[];
    if(items.length)return `${items.filter(achievementTrainerRosterItemCaught).length} / ${items.length} team Pokémon caught`;
  }
  const region=ACHIEVEMENT_REGION_TITLE[title];
  if(region){
    const rows=all().filter(p=>String(p.region||"")===String(region));
    if(rows.length)return `${rows.filter(p=>caught(p)).length} / ${rows.length} ${region} Pokémon caught`;
  }
  const gymTargets={"First Badge":1,"Gym Challenger":3,"Gym Veteran":8,"Badge Collector":16};
  if(gymTargets[title])return `${Math.min(achievementGymClearedCount(),gymTargets[title])} / ${gymTargets[title]} Gyms completed`;
  if(title==="League Ready"&&gymsData.length)return `${Math.min(achievementGymClearedCount(),gymsData.length)} / ${gymsData.length} Gyms completed`;
  if(title==="Elite Challenger"){
    const elites=gymsData.filter(g=>String(g.challenge_type||"").toLowerCase()==="elite four");
    if(elites.length)return `${elites.filter(g=>gymIsCleared(g.id)).length} / ${elites.length} Elite Four challenges completed`;
  }
  if(title==="Fresh Challenger"||title==="Trusted Partner")return `${achievementEligibility(title)?1:0} / 1 requirement completed`;
  return "";
}
function achievementShellState(a){
  const claims=getAchievementClaims();"""
rr(anchor, helper, "achievement progress helper")

old_render = """        const eligible=st.eligible;
        const trainerKey=a.category==="trainer-teams"?achievementTrainerTeamKeyForTitle(a.title):"";
        const trainerItems=trainerKey?(ACHIEVEMENT_TRAINER_SPEC[trainerKey]||[]):[];
        const trainerCaught=trainerItems.length?trainerItems.filter(achievementTrainerRosterItemCaught).length:0;
        const trainerProgressHtml=trainerItems.length?`<span style="margin-top:5px;font-weight:800">${trainerCaught} / ${trainerItems.length} team Pokémon caught</span>`:"";
        return `<article class="achievement-card ${eligible?"is-eligible":""}" data-achievement-title="${esc(a.title)}" ${eligible?`role="button" tabindex="0" onclick="claimAchievementFromCard(this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();claimAchievementFromCard(this)}"`:""} aria-label="${esc(a.title)} — ${eligible?"Ready to claim":"Locked"}"><img src="${ACHIEVEMENT_CARD_BACK}" alt="" loading="lazy"><span class="achievement-card-state ${eligible?"ready":""}">${eligible?"READY TO CLAIM":"LOCKED"}</span><div class="achievement-card-lockcopy"><strong>${esc(a.title)}</strong><span>${esc(a.requirement)}</span>${trainerProgressHtml}${eligible?`<span style="margin-top:5px;font-weight:900;color:#fff">Tap card to claim</span>`:""}</div></article>`;"""
new_render = """        const eligible=st.eligible;
        const progressText=achievementProgressText(a);
        const progressHtml=progressText?`<span style="margin-top:5px;font-weight:800">${esc(progressText)}</span>`:"";
        return `<article class="achievement-card ${eligible?"is-eligible":""}" data-achievement-title="${esc(a.title)}" ${eligible?`role="button" tabindex="0" onclick="claimAchievementFromCard(this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();claimAchievementFromCard(this)}"`:""} aria-label="${esc(a.title)} — ${eligible?"Ready to claim":"Locked"}"><img src="${ACHIEVEMENT_CARD_BACK}" alt="" loading="lazy"><span class="achievement-card-state ${eligible?"ready":""}">${eligible?"READY TO CLAIM":"LOCKED"}</span><div class="achievement-card-lockcopy"><strong>${esc(a.title)}</strong><span>${esc(a.requirement)}</span>${progressHtml}${eligible?`<span style="margin-top:5px;font-weight:900;color:#fff">Tap card to claim</span>`:""}</div></article>`;"""
rr(old_render, new_render, "locked achievement renderer")

if re.search(r'Public Sharing|get_public_challenge|togglePublicSharing|startPublic\(', c, re.I):
    raise RuntimeError("Public sharing code remains after patch")
if c.count('function achievementProgressText') != 1:
    raise RuntimeError("Achievement progress helper missing or duplicated")
if 'trainerProgressHtml' in c:
    raise RuntimeError("Old trainer-only progress renderer remains")

path.write_text(c, encoding="utf-8")
print("Patch 275 applied:", len(c), "characters")
