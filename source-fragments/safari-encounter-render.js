function safariEncounterMarkup(p){
const e=entry(p.id);
const prompt=e.prompt||p.prompt||"Prompt coming soon.";
const types=(p.types||[]).map(t=>`<span class="type-badge ${typeClass(t)}">${esc(t)}</span>`).join("");
const imgSrc=safariCurrentIsShiny?safariShinyImageUrl(p):p.image;
const media=imgSrc?`<img src="${esc(imgSrc)}" data-stage="0" data-form-api="${esc(p.formApiName||"")}" data-form-label="${esc(p.form||"")}" data-base-name="${esc(p.name||"")}" onerror="this.onerror=null;this.src='${esc(p.image||"")}'" alt="${esc(p.name)}"><div class="placeholder-mon" style="display:none">?</div>`:`<div class="placeholder-mon">?</div>`;
const safariMark=`<button class="secondary safari-mark-btn ${e.safariMarked?"is-marked":""}" type="button" onclick="toggleSafariEncounterMark('${esc(p.id)}')">${e.safariMarked?"✓ Safari Encounter Marked":"Mark Safari Encounter"}</button>`;
const shinyBanner=safariCurrentIsShiny?`<div class="safari-shiny-banner">✨ Shiny Encounter!</div>`:"";
const shinySave=safariCurrentIsShiny
 ? (caught(p)
    ? (e.shinyCaught
       ? `<button class="primary safari-save-shiny is-saved" type="button" disabled>✓ Shiny Already Caught</button>`
       : `<button class="primary safari-save-shiny" type="button" onclick="catchSafariShinyEncounter('${esc(p.id)}')">Catch Shiny</button>`)
    : `<button class="primary safari-save-shiny ${e.shinySaved?"is-saved":""}" type="button" onclick="saveSafariShinyEncounter('${esc(p.id)}')">${e.shinySaved?"✓ Shiny Saved":"Save Shiny"}</button>`)
 : "";
const shinySparkles=safariCurrentIsShiny?`<span class="rf-shiny-star rf-shiny-star-a" aria-hidden="true">✦</span><span class="rf-shiny-star rf-shiny-star-b" aria-hidden="true">✧</span>`:"";
const safariArt=`<div class="safari-mon-art ${safariCurrentIsShiny?"rf-shiny-sparkle":""}">${media}${shinySparkles}</div>`;
const encounterLabel=isHauntedSafariMode()?"Something is stirring behind the tombstones...":"The grass is rustling...";
return `<div class="safari-encounter ${safariCurrentIsShiny?"is-shiny":""}">${shinyBanner}<div class="wild-label">${encounterLabel}</div><h3>A wild ${esc(p.name)} appeared!</h3>${p.form?`<span class="form-tag">${esc(p.form)}</span>`:""}<div class="safari-mon-wrap">${safariArt}</div>${types?`<div class="type-row">${types}</div>`:""}${achievementTagsHtml(p)}<div class="safari-prompt"><div class="prompt-label">Reading Prompt</div><div class="prompt-text">${esc(prompt)}</div></div><div class="safari-actions"><button class="primary" onclick="openPokemon('${esc(p.id)}')">View Pokémon</button><button class="secondary" onclick="searchSafari()">Search Again</button></div>${safariMark}${shinySave}</div>`;
}
