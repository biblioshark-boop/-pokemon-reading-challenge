from pathlib import Path

p = Path("index.html")
text = p.read_text(encoding="utf-8", errors="strict")

old_load = '''async function loadSave(){
const{data}=await sb.from("challenge_saves").select("data,is_public").eq("user_id",user.id).eq("challenge_key",CHALLENGE_KEY).maybeSingle();
if(data){
  challengeData=data.data?.challengeData||{};
  customPokemon=data.data?.customPokemon||[];
  genres=data.data?.genres?.length?data.data.genres:[...DEFAULT_GENRES];
  achievementClaims=Array.isArray(data.data?.achievementClaims)?data.data.achievementClaims:[];
  safariShinyRollState=data.data?.safariShinyRollState&&typeof data.data.safariShinyRollState==="object"?data.data.safariShinyRollState:{date:"",used:0};
  hauntedSafariShinyRollState=data.data?.hauntedSafariShinyRollState&&typeof data.data.hauntedSafariShinyRollState==="object"?data.data.hauntedSafariShinyRollState:{date:"",used:0};
  gymCurrentlyChallenging=data.data?.gymCurrentlyChallenging&&typeof data.data.gymCurrentlyChallenging==="object"?data.data.gymCurrentlyChallenging:{};
  isPublic=!!data.is_public;
  if(migrateSafariShinyRollStateFromLegacy())await saveNow();
}else await saveNow();
updateShare();
}
function saveSoon(){if(publicMode||!user)return;cloud("Saving");clearTimeout(saveTimer);saveTimer=setTimeout(saveNow,400)}
async function saveNow(){if(publicMode||!user)return;normalizeWorkflowFlags();if(isAdminTestMode()){saveAdminTestSandbox();lastSavedAt=Date.now();cloud("Test copy saved",true);return}const{error}=await sb.from("challenge_saves").upsert({user_id:user.id,challenge_key:CHALLENGE_KEY,data:{challengeData,customPokemon,genres,achievementClaims,safariShinyRollState,hauntedSafariShinyRollState,gymCurrentlyChallenging},public_data:publicData(),is_public:isPublic},{onConflict:"user_id,challenge_key"});if(error){console.error(error);cloud("Save error");toast("Cloud save failed")}else{lastSavedAt=Date.now();cloud(lastSavedLabel(),true)}}
'''

new_load = '''let challengeSaveUpdatedAt=null;
let challengeSavePromise=Promise.resolve();
async function loadSave(){
const{data}=await sb.from("challenge_saves").select("data,is_public,updated_at").eq("user_id",user.id).eq("challenge_key",CHALLENGE_KEY).maybeSingle();
if(data){
  challengeSaveUpdatedAt=data.updated_at||null;
  challengeData=data.data?.challengeData||{};
  customPokemon=data.data?.customPokemon||[];
  genres=data.data?.genres?.length?data.data.genres:[...DEFAULT_GENRES];
  achievementClaims=Array.isArray(data.data?.achievementClaims)?data.data.achievementClaims:[];
  safariShinyRollState=data.data?.safariShinyRollState&&typeof data.data.safariShinyRollState==="object"?data.data.safariShinyRollState:{date:"",used:0};
  hauntedSafariShinyRollState=data.data?.hauntedSafariShinyRollState&&typeof data.data.hauntedSafariShinyRollState==="object"?data.data.hauntedSafariShinyRollState:{date:"",used:0};
  gymCurrentlyChallenging=data.data?.gymCurrentlyChallenging&&typeof data.data.gymCurrentlyChallenging==="object"?data.data.gymCurrentlyChallenging:{};
  isPublic=!!data.is_public;
  if(migrateSafariShinyRollStateFromLegacy())await saveNow();
}else{
  challengeSaveUpdatedAt=null;
  await saveNow();
}
updateShare();
}
function saveSoon(){if(publicMode||!user)return;cloud("Saving");clearTimeout(saveTimer);saveTimer=setTimeout(saveNow,400)}
function saveNow(){
  challengeSavePromise=challengeSavePromise.then(saveNowAtomic,saveNowAtomic);
  return challengeSavePromise;
}
async function saveNowAtomic(){
  if(publicMode||!user)return;
  normalizeWorkflowFlags();
  if(isAdminTestMode()){
    saveAdminTestSandbox();
    lastSavedAt=Date.now();
    cloud("Test copy saved",true);
    return;
  }
  const payload={challengeData,customPokemon,genres,achievementClaims,safariShinyRollState,hauntedSafariShinyRollState,gymCurrentlyChallenging};
  const{data,error}=await sb.rpc("save_challenge_if_fresh",{
    p_challenge_key:CHALLENGE_KEY,
    p_data:payload,
    p_public_data:publicData(),
    p_is_public:isPublic,
    p_expected_updated_at:challengeSaveUpdatedAt
  });
  if(error){
    console.error(error);
    cloud("Save error");
    toast("Cloud save failed");
    return;
  }
  const result=Array.isArray(data)?data[0]:data;
  if(result?.save_status==="saved"||result?.save_status==="inserted"){
    challengeSaveUpdatedAt=result.server_updated_at||challengeSaveUpdatedAt;
    lastSavedAt=Date.now();
    cloud(lastSavedLabel(),true);
    return;
  }
  if(result?.save_status==="conflict"||result?.save_status==="conflict_missing"){
    try{
      localStorage.setItem("rf-pokemon-conflict-draft-v1",JSON.stringify({
        savedAt:new Date().toISOString(),
        expectedUpdatedAt:challengeSaveUpdatedAt,
        localData:payload,
        localPublicData:publicData(),
        localIsPublic:isPublic,
        serverUpdatedAt:result?.server_updated_at||null,
        serverData:result?.server_data||null
      }));
    }catch{}
    console.warn("Pokémon cloud save conflict; newer server progress was protected.");
    cloud("Newer cloud save protected");
    toast("A newer Pokémon save exists on another device. Your cloud progress was protected. Reload before saving again.");
    return;
  }
  console.error("Unexpected Pokémon save response",result);
  cloud("Save error");
  toast("Cloud save failed");
}
'''

if text.count(old_load) != 1:
    raise SystemExit(f"Expected one exact Pokémon save/load block, found {text.count(old_load)}")
text = text.replace(old_load, new_load, 1)

# Safety assertions.
required = [
    'select("data,is_public,updated_at")',
    'sb.rpc("save_challenge_if_fresh"',
    'p_expected_updated_at:challengeSaveUpdatedAt',
    'rf-pokemon-conflict-draft-v1',
    'challengeSavePromise=challengeSavePromise.then(saveNowAtomic,saveNowAtomic)'
]
for needle in required:
    if needle not in text:
        raise SystemExit("Missing required protection: " + needle)

# Ensure old whole-row challenge_saves upsert path is gone, while unrelated upserts remain.
old_sig = 'sb.from("challenge_saves").upsert({user_id:user.id,challenge_key:CHALLENGE_KEY'
if old_sig in text:
    raise SystemExit("Old unguarded challenge_saves upsert still present")

p.write_text(text, encoding="utf-8")
print("Patched Pokémon save/load path with atomic freshness guard.")
