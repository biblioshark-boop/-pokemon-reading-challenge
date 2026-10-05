function renderMissedSafariShinies(){
  const wrap=document.getElementById("safariMissedShinyControl");
  const sel=document.getElementById("safariMissedShinySelect");
  const count=document.getElementById("safariMissedShinyCount");
  wrap?.classList.remove("hidden");
  if(!sel)return;
  const rows=safariMissedShinyEntries();
  if(count)count.textContent=`(${rows.length}/${SAFARI_MISSED_SHINY_LIMIT})`;
  sel.innerHTML='<option value="">Select a missed shiny…</option>'+rows.map(([id])=>{
    const p=all().find(x=>x.id===id);
    if(!p)return "";
    const label=p.form?`${p.name} — ${p.form}`:p.name;
    return `<option value="${esc(id)}">✨ ${esc(label)}</option>`;
  }).join("");
}
function restoreMissedSafariShiny(pokemonId){
  if(publicMode||!pokemonId)return;
  const e=challengeData?.[pokemonId];
  const p=all().find(x=>x.id===pokemonId);
  if(!p||!isShinyEligiblePokemon(p)||!e?.missedShiny||e.shinySaved||e.shinyCaught){renderMissedSafariShinies();return}
  safariCurrentId=pokemonId;
  safariCurrentIsShiny=true;
  safariCurrentMustResolve=false;
  const box=document.getElementById("safariEncounter");
  if(box){box.innerHTML=safariEncounterMarkup(p);box.scrollIntoView({behavior:"smooth",block:"nearest"})}
  const sel=document.getElementById("safariMissedShinySelect");
  if(sel)sel.value="";
}