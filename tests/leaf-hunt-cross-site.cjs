// Pokémon seasonal Leaf Hunt integration guard. No live RPC calls or member data.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const script=fs.readFileSync('rf-pumpkin-hunt.js','utf8');
const build=fs.readFileSync('cloudflare_prepare_base.py','utf8');
assert.match(script,/const hunt=await rpc\('rf_current_seasonal_event'\)/,'Use same scheduled seasonal event as Hub');
assert.match(script,/rpc\('rf_roll_seasonal_action'\)/,'Claim queued Hub/challenge action before browsing');
assert.match(script,/rpc\('rf_roll_seasonal_browse',\{p_navigation_type:navigationType\}\)/,'Browse from active seasonal event, shared backend');
assert.match(script,/rf_claim_seasonal_action/,'Action spawns use active seasonal action claim');
assert.match(script,/rf_claim_seasonal_browse/,'Browse spawns use active seasonal browse claim');
assert.match(script,/storage\/v1\/object\/public\/rf-hunt-public-art\//,'Allow public seasonal leaf artwork on Supabase storage');
assert.match(script,/rf_submit_leaf_shiny_choice/,'Gold-leaf shiny choice is available directly from the Pokémon popup');
assert.match(script,/LEAF_CHOICE_KEY/,'Pending Gold-leaf choice is recoverable after reload');
assert.doesNotMatch(script,/rpc\('roll_rf_challenge_pumpkin_browse_spawn'/,'No expired Pumpkin Hunt rolls');
assert.match(build,/rf-pumpkin-hunt\.js\?v=20261105141600/,'Deploy uses updated, uncached seasonal integration');
console.log('Pokémon seasonal Leaf Hunt integration checks passed');
