function renderDex(preserveBatch=false){
let l=all(),q=String(searchInput.value||"").trim().toLowerCase(),qTerms=q.split(/\s+/).filter(Boolean);
updateWishlistFilterCount();
updateCatchingFilterCount();
if(!preserveBatch)resetDexBatch();
l=l.filter(p=>{
 const ownBooks=publicMode?[]:(Array.isArray(challengeData[p.id]?.books)?challengeData[p.id].books:[]);
 const bookText=ownBooks.map(b=>String((b&&typeof b==="object"?b.title:b)||"")).join(" ");
 const promptText=p.custom?(challengeData[p.id]?.prompt||p.prompt||""):(p.prompt||challengeData[p.id]?.prompt||"");
 const searchText=`${p.name||""} ${p.form||""} ${p.dex||""} ${promptText} ${bookText}`.toLowerCase();
 const matchesSearch=!q||qTerms.every(term=>searchText.includes(term));
 const regionMatches=!dexSelectedRegions.size||dexSelectedRegions.has(p.region);
 const statusMatches=!dexSelectedStatuses.size||[...dexSelectedStatuses].some(status=>dexStatusMatches(p,status));
 return matchesSearch&&regionMatches&&achievementTypeFilterMatches(p)&&achievementTagFilterMatches(p)&&statusMatches;
});
if(dexSortMode==="az")l.sort((a,b)=>a.name.localeCompare(b.name)||String(a.form||"").localeCompare(String(b.form||"")));
else if(dexSortMode==="za")l.sort((a,b)=>b.name.localeCompare(a.name)||String(b.form||"").localeCompare(String(a.form||"")));
else if(dexSortMode==="caught")l.sort((a,b)=>+caught(b)-+caught(a));
else if(dexSortMode==="uncaught")l.sort((a,b)=>+caught(a)-+caught(b));
else l.sort((a,b)=>{
const d=(+a.dex||99999)-(+b.dex||99999);if(d)return d;
if(+a.dex===201&&+b.dex===201)return String(a.form||"").localeCompare(String(b.form||""),undefined,{numeric:true});
return (a.sortOrder??99999)-(b.sortOrder??99999);
});
dexCurrentFiltered=l;
if(!l.length){dexGrid.innerHTML='<div class="empty">No Pokémon match.</div>';return}
const existingDexCards=preserveBatch?[...(dexGrid?.querySelectorAll(".pokemon-card")||[])]:[];
const existingDexCount=existingDexCards.length;
const visibleDex=preserveBatch?l.slice(existingDexCount,dexBatchShown):l.slice(0,dexBatchShown);
if(preserveBatch)document.getElementById("dexLoadSentinel")?.remove();
const dexFragment=document.createDocumentFragment();
visibleDex.forEach(p=>{
const editable=adminImageEditMode&&isAdmin&&!p.custom&&!!catalogSlugForPokemon(p);
const b=document.createElement(editable?"div":"button");
const adminImageReveal=editable&&String(profile?.username||"").toLowerCase()==="biblioshark_travis";
b.className="pokemon-card"+(caught(p)?" caught":"")+(currentlyCatching(p)?" catching":"")+(editable?" admin-image-card":"")+(adminImageReveal?" admin-image-reveal":"");
b.dataset.pokemonId=p.id;
if(editable){
b.ondragover=e=>{e.preventDefault();b.classList.add("image-drag-over")};
b.ondragleave=()=>b.classList.remove("image-drag-over");
b.ondrop=e=>handlePokemonImageDrop(e,p.id);
}
const dexIsShinyList=(dexSelectedStatuses.has("savedshiny")&&isShinyEligiblePokemon(p)&&challengeData?.[p.id]?.shinySaved===true&&challengeData?.[p.id]?.shinyCaught!==true)||(dexSelectedStatuses.has("shinycatch")&&isShinyEligiblePokemon(p)&&challengeData?.[p.id]?.shinyCaught===true);
const dexHasCaughtShiny=challengeData?.[p.id]?.shinyCaught===true;
const adminImageVariant=editable?adminPokemonImageVariant(p.id):"regular";
const shinyEligible=isShinyEligiblePokemon(p);
const dexShowsShiny=(editable&&adminImageVariant==="shiny"&&shinyEligible)||(dexIsShinyList&&dexHasCaughtShiny);
const dexArtwork=editable&&adminImageVariant==="shiny"&&shinyEligible
  ? safariShinyImageUrl(p)
  : (dexIsShinyList&&dexHasCaughtShiny?safariShinyImageUrl(p):p.image);
const media=dexArtwork?`<img loading="lazy" src="${esc(gridThumbSrc(dexArtwork))}" data-fullsrc="${esc(dexArtwork)}" referrerpolicy="no-referrer" data-stage="0" data-form-api="${esc(p.formApiName||"")}" data-form-label="${esc(p.rawForm||p.form||"")}" data-base-name="${esc(p.name||"")}" onerror="this.onerror=null;this.src='${esc(p.image||image(+p.dex||0))}'"><div class="placeholder-mon" style="display:none">?</div>`:`<div class="placeholder-mon">?</div>`;
const types=(p.types||[]).map(t=>`<span class="type-badge ${typeClass(t)}">${esc(t)}</span>`).join("");
const editTools=editable?`<div class="admin-image-overlay">
<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:6px">
<button type="button" class="small-btn ${adminImageVariant==="regular"?"active":""}" onclick="event.stopPropagation();setAdminPokemonImageVariant('${esc(p.id)}','regular')">Regular</button>
${shinyEligible?`<button type="button" class="small-btn ${adminImageVariant==="shiny"?"active":""}" onclick="event.stopPropagation();setAdminPokemonImageVariant('${esc(p.id)}','shiny')">✨ Shiny</button>`:""}
</div>
<span>${shinyEligible?(adminImageVariant==="shiny"?(p.manualShinyImage?"Custom shiny ✓":"No custom shiny image"):(p.manualImage?"Custom image ✓":"No custom regular image")):(p.manualImage?"Custom image ✓ • No Shiny form":"No custom regular image • No Shiny form")}</span>
<button type="button" class="small-btn" onclick="event.stopPropagation();choosePokemonCardImage('${esc(p.id)}')">${adminImageVariant==="shiny"&&shinyEligible?(p.manualShinyImage?"Replace Shiny Image":"Add Shiny Image"):(p.manualImage?"Replace Image":"Add Regular Image")}</button>
</div>`:"";
const cardEntry=challengeData[p.id]||{};
const cardPrompt=p.custom?(cardEntry.prompt||p.prompt||""):(p.prompt||cardEntry.prompt||"");
b.innerHTML=`<span class="status-dot"></span>${publicMode?"":`<button class="wishlist-star ${wishlisted(p)?"active":""}" type="button" title="${wishlisted(p)?"Remove from wishlist":"Add to wishlist"}" aria-label="${wishlisted(p)?"Remove from wishlist":"Add to wishlist"}" aria-pressed="${wishlisted(p)}" onclick="event.stopPropagation();toggleWishlist('${p.id}')">${wishlisted(p)?"★":"☆"}</button>`}<div class="pokemon-img-wrap ${dexShowsShiny?"rf-shiny-sparkle":""}">${media}</div><div class="dex-number">${p.dex?"#"+String(p.dex).padStart(4,"0"):(p.global?"Bonus":"Custom")}</div><div class="pokemon-name">${esc(p.name)}</div>${p.form?`<span class="form-tag">${esc(p.form)}</span>`:""}${types?`<div class="type-row">${types}</div>`:""}${monthlyBonusForPokemon(p)?`<span class="monthly-bonus-chip">⭐ MONTHLY BONUS • ${Number(monthlyBonusForPokemon(p).multiplier||2)}×</span>`:""}${achievementTagsHtml(p)}${currentlyCatching(p)?`<span class="catching-chip">🎯 Currently Catching</span>`:""}${cardEntry.plannedBook&&!publicMode?`<span class="planned-chip" title="${esc(cardEntry.plannedBook)}">📘 ${esc(cardEntry.plannedBook)}</span>`:""}<div class="pokemon-card-prompt-wrap"><div class="pokemon-card-prompt"><span>Prompt</span><div class="pokemon-card-prompt-text">${esc(cardPrompt||"Prompt coming soon.")}</div></div><button class="pokemon-card-prompt-toggle hidden" type="button" aria-label="Expand reading prompt" aria-expanded="false" onclick="event.stopPropagation();togglePokemonCardPrompt(this)">⌄</button></div>${editTools}`;
if(!editable)b.onclick=()=>openPokemon(p.id);
dexFragment.appendChild(b)
})
if(dexBatchShown<dexCurrentFiltered.length){
  const sentinel=document.createElement("div");
  sentinel.id="dexLoadSentinel";
  sentinel.className="empty";
  sentinel.style.cursor="pointer";
  sentinel.textContent=`Loading more Pokémon… (${Math.min(dexBatchShown,dexCurrentFiltered.length)} of ${dexCurrentFiltered.length})`;
  dexFragment.appendChild(sentinel);
}
if(preserveBatch)dexGrid.appendChild(dexFragment);
else dexGrid.replaceChildren(dexFragment);
prioritizeVisibleDexImages();
setupAheadOfScrollPreload();
setupDexInfiniteLoader();
schedulePokemonPromptToggleScan();
}
function updatePokemonPromptToggles(){
  (dexGrid?.querySelectorAll(".pokemon-card-prompt-wrap")||[]).forEach(wrap=>{
    const prompt=wrap.querySelector(".pokemon-card-prompt");
    const btn=wrap.querySelector(".pokemon-card-prompt-toggle");
    if(!prompt||!btn)return;
    const expanded=prompt.classList.contains("expanded");
    if(expanded){
      btn.classList.remove("hidden");
      btn.setAttribute("aria-expanded","true");
      btn.textContent="⌃";
      btn.setAttribute("aria-label","Collapse reading prompt");
      return;
    }
    const overflowing=prompt.scrollHeight>prompt.clientHeight+2;
    btn.classList.toggle("hidden",!overflowing);
    btn.setAttribute("aria-expanded","false");
    btn.textContent="⌄";
    btn.setAttribute("aria-label","Expand reading prompt");
  });
}
function togglePokemonCardPrompt(btn){
  const wrap=btn?.closest(".pokemon-card-prompt-wrap");
  const prompt=wrap?.querySelector(".pokemon-card-prompt");
  if(!prompt)return;
  const expanded=prompt.classList.toggle("expanded");
  btn.setAttribute("aria-expanded",expanded?"true":"false");
  btn.textContent=expanded?"⌃":"⌄";
  btn.setAttribute("aria-label",expanded?"Collapse reading prompt":"Expand reading prompt");
}