function openPokemon(id,fromHistory=false){
currentPokemonId=id;
const p=all().find(x=>x.id===id),e=entry(id);
if(!p)return toast("Pokémon entry not found.");
const promptValue=p.custom?(e.prompt||p.prompt||""):(p.prompt||e.prompt||"");
const types=(p.types||[]).map(t=>`<span class="type-badge ${typeClass(t)}">${esc(t)}</span>`).join("");
const adminDetailImageEdit=isAdmin&&adminDetailEditMode&&!publicMode&&!p.custom&&!!catalogSlugForPokemon(p);
const adminDetailVariant=adminDetailImageEdit?adminPokemonImageVariant(p.id):"regular";
const detailShowsShiny=adminDetailImageEdit?(adminDetailVariant==="shiny"&&isShinyEligiblePokemon(p)):(isShinyEligiblePokemon(p)&&e?.shinyCaught===true&&e?.shinyView==="shiny");
const selectedArtwork=adminDetailImageEdit
 ? (detailShowsShiny?safariShinyImageUrl(p):(p.image||image(+p.dex||0)))
 : pokemonSelectedArtwork(p,e);
const fallbackArtwork=p.image||image(+p.dex||0);
const media=selectedArtwork?`<img src="${esc(selectedArtwork)}" data-stage="0" data-form-api="${esc(p.formApiName||"")}" data-form-label="${esc(p.rawForm||p.form||"")}" data-base-name="${esc(p.name||"")}" onerror="this.onerror=null;this.src='${esc(fallbackArtwork)}'"><div class="placeholder-mon" style="padding:50px 0;display:none">?</div>`:`<div class="placeholder-mon" style="padding:50px 0">?</div>`;
const promptBlock=`<div class="dex43-side-card dex43-card dex43-prompt-card"><h3>📖 Reading Prompt</h3><div class="dex43-prompt">${promptValue?esc(promptValue):"Prompt coming soon."}</div><div class="dex43-rating-note">Rate each book you use for this prompt in the Books Read section.${isUnownPokemon(p)?`<br><strong>Unown exception:</strong> An Unown may reuse a reading even if that book already counted for another Pokémon.${unownSpecialTitleCharacter(p)?` For this form, the book title must contain <strong>${esc(unownSpecialTitleCharacter(p))}</strong>.`:""}`:""}</div></div>`;
const booksBlock=`<div class="dex43-card dex43-books dex43-books-card"><div class="dex43-books-head"><h3>📚 Books Read</h3>${publicMode?"":`<button id="detailAddBookBtn" class="primary" onclick="bookModal()">+ Add Book</button>`}</div>${publicMode?"":`<div class="dex43-book-tabs"><button id="detailMyBooksTab" class="dex43-book-tab active" type="button" onclick="setDetailBooksTab('mine')">My Books</button><button id="detailOthersBooksTab" class="dex43-book-tab" type="button" onclick="setDetailBooksTab('community')">What Others Read</button></div>`}<div id="bookList"></div></div>`;
const caughtBlock=publicMode?"":`<div class="dex43-side-card dex43-card dex43-status dex43-status-card"><h3>◉ Caught Status</h3><div class="muted">At least one book is required.</div><button class="${e.caught?"secondary":"primary"}" onclick="toggleCaught()">${e.caught?"Mark as Uncaught":"Mark as Caught"}</button><button class="secondary wishlist-detail-btn ${e.wishlist?"active":""}" onclick="toggleWishlist('${p.id}')">${e.wishlist?"★ Remove from Wishlist":"☆ Add to Wishlist"}</button><button class="secondary currently-catching-btn ${e.currentlyCatching&&!e.caught?"active":""}" onclick="toggleCurrentlyCatching('${p.id}')">${e.currentlyCatching&&!e.caught?"🎯 Remove from Currently Catching":"🎯 Add to Currently Catching"}</button><div class="planned-book-box"><div class="planned-book-head"><span>📘 Planned Book</span><span class="planned-private">Private</span></div><div class="planned-book-row"><input id="plannedBookInput" type="text" maxlength="180" value="${esc(e.plannedBook||"")}" placeholder="Book you plan to use…" onkeydown="if(event.key==='Enter'){event.preventDefault();savePlannedBook()}"></div><div class="planned-book-actions"><button class="small-btn" type="button" onclick="savePlannedBook()">Save Planned Book</button>${e.plannedBook?`<button class="small-btn" type="button" onclick="clearPlannedBook()">Clear</button>`:""}</div></div><button class="secondary" onclick="openNextUncaught()">Next Uncaught →</button>${p.custom?`<button class="danger" onclick="deleteCustom('${p.id}')">Delete Custom Pokémon</button>`:""}${p.global&&isAdmin?`<button class="secondary" onclick="goPage('settings');globalEditSelect.value='${esc(p.slug)}';loadGlobalEditor('${esc(p.slug)}');setTimeout(()=>adminGlobalCard?.scrollIntoView({behavior:'smooth'}),50)">Edit Global Entry</button>`:""}</div>`;
const adminEditBlock=adminPokemonQuickEditHtml(p);
const factBlock=adminEditBlock?`<div class="dex43-card dex43-side-card dex43-admin">${adminEditBlock}</div>`:`<div id="rotomFactSlot" class="dex43-rotom-slot">${rotomFactHtml(p.fact||`Bzzzt! Rotom is scanning for a cute or curious bit of lore about ${p.name}…`)}</div>`;
detailBooksTab="mine";communityBooks=[];communityBooksPokemonId="";communityBooksExpanded=false;communityBooksLoading=false;
const evolutionBlock=`<div id="dexEvolutionCard" class="dex43-card dex-evo-card hidden"><div class="dex-evo-head"><div class="dex-evo-title">Evolution Chain</div><div class="dex-evo-note">Forms are kept in their matching evolution lines.</div></div><div id="dexEvolutionBody" class="dex-evo-loading">Loading evolution chain…</div></div>`;
const artStateClass=adminDetailImageEdit||e.caught?"caught":"uncaught";
detailContent.innerHTML=`${dexDetailNavHtml(p.id)}<div class="dex43-shell"><div class="dex43-left"><div class="dex43-card dex43-hero"><div class="dex43-mon-art ${artStateClass} ${detailShowsShiny?"rf-shiny-sparkle":""}">${media}</div><div class="dex43-mon-info"><h2>${esc(p.name)}</h2><div class="dex43-meta">${p.dex?"#"+String(p.dex).padStart(4,"0")+" • ":""}${esc(p.region)}${p.form?" • "+esc(p.form):""}</div>${adminDetailImageEdit?"":pokemonShinyToggleHtml(p,e)}${types?`<div class="type-row">${types}</div>`:""}${achievementTagsHtml(p)}${p.global?`<div style="margin-top:14px"><span class="global-badge">${p.isBonus?"Bonus Pokémon":"Global Catalog"}</span></div>`:""}${pokemonGymLinksHtml(p)}</div></div>${evolutionBlock}<div class="dex43-card dex52-status-wide">${caughtBlock}</div></div><div class="dex43-right">${factBlock}<div class="dex43-card dex52-challenge-card">${promptBlock}<div class="dex52-books-wrap">${booksBlock}</div></div></div></div>`;
renderBooks();
renderEvolutionChain(p);
if(!p.fact)loadRotomFactForPokemon(p);
if(!fromHistory){
const detailHash="#pokemon="+encodeURIComponent(id);
try{history.pushState({rfPage:"detail",pokemonId:id},"",location.pathname+location.search+detailHash)}
catch{location.hash=detailHash}
}
goPage("detail","none");
applyRegionTheme(p.region);
}