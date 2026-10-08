function renderGyms(){
const box=document.getElementById("gymList");if(!box)return;
if(!gymsData.length){box.innerHTML='<div class="gym-empty">Gym challenges are being added.</div>';return}
fillGymRegions();
const region=document.getElementById("gymRegionFilter")?.value||"all";
const challengeFilter=document.getElementById("gymChallengeFilter")?.value||"all";
const list=gymsData.filter(g=>(region==="all"||g.region===region)&&(challengeFilter!=="current"||gymIsCurrentlyChallenging(g.id)));
if(!list.length){box.innerHTML=`<div class="gym-empty">${challengeFilter==="current"?"No gyms are marked Currently Challenging.":"No gym challenges match this filter."}</div>`;return}
box.innerHTML=list.map(g=>{
const team=gymTeamData.filter(m=>m.gym_id===g.id),cleared=gymIsCleared(g.id);
const mons=team.map(m=>{
const p=gymMemberPokemon(m),done=gymMemberDone(g.id,m);
const progress=gymMemberProgress[m.id]||{};
const img=gymMemberImage(m,p);
const form=m.form_name?`<div class="gym-mon-form">${esc(m.form_name)}</div>`:"";
const prompt=gymMemberPrompt(m,p);
const promptHtml=`<div class="gym-mon-prompt"><strong>Reading Prompt</strong>${esc(prompt)}</div>`;
const sourceNote=done
?`<div class="gym-mon-note">${progress.completion_source==="existing"?"Used existing Pokédex catch":progress.completion_source==="new_entry_pokedex"?"New entry + added to Pokédex":progress.book_title?`Gym entry: ${esc(progress.book_title)}`:"Defeated"}</div>`
:"";
const control=done
?`<button class="gym-defeat-btn done" onclick="undoGymMember('${m.gym_id}','${m.id}')">Defeated ✓</button>`
:`<button class="gym-defeat-btn" onclick="openGymDefeatModal('${m.gym_id}','${m.id}')">Defeat</button>`;
const row=gymCatalogRow(m);
const needsExactForm=!!m.form_name&&!row?.image_url;
const formApi=needsExactForm?(p?.formApiName||formApiNameFromRow(row||{name:m.pokemon_name,form_name:m.form_name,dex_number:m.dex_number})):"";
const media=img
?`<div class="gym-mon-pokedex-link" role="link" tabindex="0" title="Open ${esc(m.pokemon_name)} in Pokédex" onclick="openGymPokemonDetail('${m.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openGymPokemonDetail('${m.id}')}"><img class="gym-mon-pokedex-link" src="${esc(img)}" data-stage="0" data-gym-form="${needsExactForm?1:0}" data-form-api="${esc(formApi)}" data-form-label="${esc(m.form_name||"")}" data-base-name="${esc(m.pokemon_name||"")}" data-dex="${+m.dex_number||0}" onerror="gymMonImgError(this,${+m.dex_number||0})" alt="Open ${esc(m.pokemon_name)} in Pokédex"><div class="gym-mon-fallback" style="display:none">#${String(m.dex_number||"").padStart(4,"0")}</div></div>`
:`<div class="gym-mon-fallback gym-mon-pokedex-link" role="link" tabindex="0" title="Open ${esc(m.pokemon_name)} in Pokédex" onclick="openGymPokemonDetail('${m.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openGymPokemonDetail('${m.id}')}">#${String(m.dex_number||"").padStart(4,"0")}</div>`;
return `<div class="gym-mon">${media}<div><div class="gym-mon-name gym-mon-pokedex-link" role="link" tabindex="0" title="Open ${esc(m.pokemon_name)} in Pokédex" onclick="openGymPokemonDetail('${m.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openGymPokemonDetail('${m.id}')}">${esc(m.pokemon_name)}</div>${form}${promptHtml}${sourceNote}</div>${control}</div>`;
}).join("");
const trainerUrl=g.leader_image_url||trainerShowdownUrl(g.leader_name);
const initials=trainerInitials(g.leader_name);
return `<div class="gym-card ${cleared?"cleared":""}" data-gym-id="${esc(g.id)}"><div class="gym-card-top"><div class="gym-leader-wrap"><div class="trainer-portrait"><img loading="lazy" data-stage="0" src="${esc(trainerUrl)}" onerror="trainerImgFail(this,'${esc(g.leader_name)}')" alt="${esc(g.leader_name)}"><div class="trainer-fallback">${esc(initials)}</div></div><div><div class="gym-leader-name">${esc(g.leader_name)}</div><div class="gym-kind">${esc(g.region)} • ${esc(g.challenge_type||"Gym Leader")}</div></div></div>
${g.specialty_type?`<div class="gym-specialty">${esc(g.specialty_type)}</div>`:""}
</div><label class="gym-current-toggle"><input type="checkbox" ${gymIsCurrentlyChallenging(g.id)?"checked":""} onchange="toggleGymCurrentlyChallenging('${g.id}',this.checked)"><span>Currently Challenging</span></label><div class="gym-team">${mons}</div>
${cleared?`<div class="gym-clear-banner">${esc(gymRewardName(g))} earned!<button class="secondary" type="button" style="margin-left:10px" onclick="openGymVictoryCard('${g.id}')">✨ Gym Victory Card</button></div>`:""}
</div>`;
}).join("");
hydrateGymFormImages(box);
}