function renderAchievementShell(){
  if((achievementShellCategory==="pokemon"||achievementShellCategory==="full")&&!achievementEvolutionExpertChecked&&!achievementEvolutionExpertChecking)refreshAchievementEvolutionExpertEligibility();
  const select=document.getElementById("achievementCategorySelect");
  if(select&&select.value!==achievementShellCategory)select.value=achievementShellCategory;
  const title=document.getElementById("achievementSectionTitle");
  if(title)title.textContent=ACHIEVEMENT_CATEGORY_LABELS[achievementShellCategory]||"Achievements";
  const categoryItems=achievementItemsForCategory(achievementShellCategory);
  const unlockedCount=categoryItems.filter(a=>achievementShellState(a).claimed).length;
  const progress=document.getElementById("achievementProgressText");
  if(progress)progress.textContent=`${unlockedCount} / ${categoryItems.length} unlocked`;
  const items=getAchievementShellFiltered();
  const pages=Math.max(1,Math.ceil(items.length/ACHIEVEMENTS_PER_PAGE));
  achievementShellPage=Math.min(pages,Math.max(1,achievementShellPage));
  const start=(achievementShellPage-1)*ACHIEVEMENTS_PER_PAGE;
  const pageItems=items.slice(start,start+ACHIEVEMENTS_PER_PAGE);
  const grid=document.getElementById("achievementGrid");
  if(grid){
    if(!pageItems.length){
      grid.innerHTML='<div class="achievement-empty" style="grid-column:1/-1">No cards match this filter yet.</div>';
    }else{
      grid.innerHTML=pageItems.map(a=>{
        const st=achievementShellState(a);
        if(st.claimed){
          return `<article class="achievement-card is-claimed" data-achievement-title="${esc(a.title)}" aria-label="${esc(a.title)} — Unlocked"><img src="assets/achievement-cards/${esc(a.image)}" alt="${esc(a.title)} achievement card" loading="lazy"><span class="achievement-card-state claimed">UNLOCKED</span><button class="achievement-card-download" type="button" onclick="event.stopPropagation();downloadAchievementCardFromButton(this)" aria-label="Download ${esc(a.title)} card">⬇ Card</button></article>`;
        }
        const eligible=st.eligible;
        const trainerKey=a.category==="trainer-teams"?achievementTrainerTeamKeyForTitle(a.title):"";
        const trainerItems=trainerKey?(ACHIEVEMENT_TRAINER_SPEC[trainerKey]||[]):[];
        const trainerCaught=trainerItems.length?trainerItems.filter(achievementTrainerRosterItemCaught).length:0;
        const trainerProgressHtml=trainerItems.length?`<span style="margin-top:5px;font-weight:800">${trainerCaught} / ${trainerItems.length} team Pokémon caught</span>`:"";
        return `<article class="achievement-card ${eligible?"is-eligible":""}" data-achievement-title="${esc(a.title)}" ${eligible?`role="button" tabindex="0" onclick="claimAchievementFromCard(this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();claimAchievementFromCard(this)}"`:""} aria-label="${esc(a.title)} — ${eligible?"Ready to claim":"Locked"}"><img src="${ACHIEVEMENT_CARD_BACK}" alt="" loading="lazy"><span class="achievement-card-state ${eligible?"ready":""}">${eligible?"READY TO CLAIM":"LOCKED"}</span><div class="achievement-card-lockcopy"><strong>${esc(a.title)}</strong><span>${esc(a.requirement)}</span>${trainerProgressHtml}${eligible?`<span style="margin-top:5px;font-weight:900;color:#fff">Tap card to claim</span>`:""}</div></article>`;
      }).join("");
    }
  }
  const label=document.getElementById("achievementPageLabel");
  if(label)label.textContent=`Page ${achievementShellPage} of ${pages}`;
  const prev=document.getElementById("achievementPrevBtn"),next=document.getElementById("achievementNextBtn");
  if(prev)prev.disabled=achievementShellPage<=1;
  if(next)next.disabled=achievementShellPage>=pages;
  syncAchievementMilestoneNotification();
}