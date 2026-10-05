function renderTrainerCardPokemonTeam(){
const box=document.getElementById("trainerCardPokemonTeam");
if(!box)return;
const mons=trainerTeamPokemon();
document.getElementById("trainerCard")?.classList.remove("no-pokemon-team");
box.innerHTML=Array.from({length:6},(_,i)=>{
const p=mons[i];
if(!p)return '<div class="trainer-team-mon empty" aria-hidden="true">+</div>';
const label=`${p.name||"Pokémon"}${p.form?" "+p.form:""}`;
const primaryType=Array.isArray(p.types)?(p.types[0]||""):"";
const tint=trainerCardTypeTint(primaryType);
return `<div class="trainer-team-mon ${typeClass(primaryType)}" style="--trainer-mon-tint:${esc(tint)}" title="${esc(label)}">${trainerPokemonImgMarkup(p,`alt="${esc(label)}"`)}</div>`;
}).join("");
}
function fitTrainerMockupText(el,maxPx,minPx){
if(!el)return;
el.style.fontSize=maxPx+"px";
el.style.letterSpacing="";
let size=maxPx;
while(size>minPx && el.scrollWidth>el.clientWidth){
  size-=1;
  el.style.fontSize=size+"px";
}
}
function renderTrainerCardTestMockup(){
const card=document.getElementById("trainerCardTestMockup");
if(!card)return;
const f=trainerCardFaction();
if(!f)return;

const mons=trainerTestPokemonSlots();
const a=all(),c=a.filter(caught).length,p=a.length?c/a.length*100:0;
const display=profile?.display_name||profile?.username||"Trainer";
const username=profile?.username?`@${profile.username}`:"@reader";
const pctText=p<1&&c?p.toFixed(1)+"%":Math.round(p)+"%";
const leaderNow=isCurrentTeamLeader();

const nameEl=document.getElementById("ttmName");
if(nameEl)nameEl.textContent=display;
const userEl=document.getElementById("ttmUsername");if(userEl)userEl.textContent=username;
const teamEl=document.getElementById("ttmTeam");if(teamEl)teamEl.textContent=f.name||"Team";
const caughtEl=document.getElementById("ttmCaught");if(caughtEl)caughtEl.textContent=`${c} / ${a.length}`;
const completeEl=document.getElementById("ttmComplete");if(completeEl)completeEl.textContent=pctText;

requestAnimationFrame(()=>{
  fitTrainerMockupText(document.getElementById("ttmName"),40,18);
  {
const teamEl=document.getElementById("ttmTeam");
const teamText=String(teamEl?.textContent||"").trim();
if(teamEl){
  teamEl.style.whiteSpace=teamText.length>12?"normal":"nowrap";
  teamEl.style.lineHeight=teamText.length>12?"1.02":"1.05";
  teamEl.style.overflowWrap="normal";
  fitTrainerMockupText(teamEl,teamText.length>12?16:22,10);
}
}
  fitTrainerMockupText(document.getElementById("ttmCaught"),18,10);
  fitTrainerMockupText(document.getElementById("ttmComplete"),18,10);
});

const leaderEl=document.getElementById("ttmLeader");
leaderEl?.classList.toggle("hidden",!leaderNow);
const leaderName=document.getElementById("ttmLeaderName");
if(leaderName)leaderName.textContent=leaderNow?(f.leader_character||"Team Leader"):"";
card.classList.toggle("is-leader",leaderNow);

const avatar=document.getElementById("ttmAvatar"),fallback=document.getElementById("ttmAvatarFallback"),avatarUrl=trainerCardAvatarUrl();
if(avatar&&fallback){
  avatar.style.display=avatarUrl?"block":"none";
  fallback.style.display=avatarUrl?"none":"grid";
  fallback.textContent=(display||"RF").split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase()||"RF";
  avatar.onload=()=>{avatar.style.display="block";fallback.style.display="none"};
  avatar.onerror=()=>{avatar.style.display="none";fallback.style.display="grid"};
  if(avatarUrl){avatar.src=avatarUrl;applyVisibleCharacterFit(avatar,avatarUrl)}
}

const specialBox=document.getElementById("ttmSpecialBadges");
if(specialBox){
  const rows=selectedSpecialBadges().slice(0,2);
  specialBox.innerHTML=Array.from({length:2},(_,i)=>{
    const b=rows[i],src=b?specialBadgeImage(b.slug):"";
    return `<div class="ttm-badge-slot">${src?`<img class="ttm-special-badge" src="${src}" alt="${esc(b.name||'Special badge')}" title="${esc(b.name||'Special badge')}">`:""}</div>`;
  }).join("");
}
const gymBox=document.getElementById("ttmGymBadges");
if(gymBox){
  const rows=selectedTrainerGymBadges();
  gymBox.innerHTML=Array.from({length:6},(_,i)=>{
    const b=rows[i],src=b?trainerGymBadgeImage(b):"",name=b?(b.badge_name||b.gym_name||b.leader_name||"Gym badge"):"";
    return `<div class="ttm-badge-slot">${src?`<img class="ttm-gym-badge" src="${esc(src)}" alt="${esc(name)}" title="${esc(name)}">`:""}</div>`;
  }).join("");
}
const gymCount=document.getElementById("ttmGymsDefeated");
if(gymCount)gymCount.textContent=`Gyms Defeated: ${achievementGymClearedCount()}`;

renderTrainerTestPokemonRow();

const colors=trainerCardColors();
const bannerUrl=trainerCardBannerUrl();
card.style.backgroundImage=bannerUrl
  ?`linear-gradient(105deg,rgba(0,0,0,.18),rgba(0,0,0,.48)),url("${bannerUrl}")`
  :`linear-gradient(135deg,${colors[0]},${colors[1]})`;
card.style.backgroundSize=bannerUrl?"cover":"";
card.style.backgroundPosition=bannerUrl?"center":"";
}
function renderTrainerCard(){
const card=document.getElementById("trainerCard"),locked=document.getElementById("trainerCardLocked"),unlocked=document.getElementById("trainerCardUnlocked");
if(!card||!locked||!unlocked)return;
const f=trainerCardFaction(),hasTeam=!!f;
const liveMockup=document.getElementById("trainerCardTestMockup");
card.classList.toggle("trainer-card-live-hidden",hasTeam);
liveMockup?.classList.toggle("trainer-card-live-visible",hasTeam);
renderTeamViewMode();
renderTrainerCardPokemonTeam();
renderTrainerSpecialBadges();
renderTrainerGymBadges();
locked.classList.toggle("hidden",hasTeam);
unlocked.classList.toggle("hidden",!hasTeam);
if(!hasTeam){closeTrainerCardEditor();return}
const a=all(),c=a.filter(caught).length,p=a.length?c/a.length*100:0,display=profile?.display_name||profile?.username||"Trainer";
trainerCardName.textContent=display;
trainerCardUsername.textContent=profile?.username?`@${profile.username}`:"@reader";
trainerCardTeam.textContent=f.name||"Team";
trainerCardCaught.textContent=`${c} / ${a.length}`;
const percentText=p<1&&c?p.toFixed(1)+"%":Math.round(p)+"%";
if(document.getElementById("trainerCardPercent"))trainerCardPercent.textContent=percentText;
const leaderNow=isCurrentTeamLeader();
trainerLeaderRibbon.classList.toggle("hidden",!leaderNow);
card.classList.toggle("team-leader-card",leaderNow);
if(document.getElementById("trainerLeaderName"))trainerLeaderName.textContent=leaderNow?(f.leader_character||"Team Leader"):"";
requestAnimationFrame(applyTrainerBadgeLayoutToScreen);
const avatar=trainerCardAvatar,fb=trainerAvatarFallback,url=trainerCardAvatarUrl();
avatar.style.display=url?"block":"none";fb.style.display=url?"none":"flex";
avatar.onload=()=>{avatar.style.display="block";fb.style.display="none"};
avatar.onerror=()=>{avatar.style.display="none";fb.style.display="flex";fb.textContent=(display||"RF").split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase()||"RF"};
if(url){avatar.src=url;applyVisibleCharacterFit(avatar,url)}
const colors=trainerCardColors();card.style.setProperty("--tc1",colors[0]);card.style.setProperty("--tc2",colors[1]);
const bannerUrl=trainerCardBannerUrl();
card.style.backgroundImage=bannerUrl?`linear-gradient(105deg,rgba(0,0,0,.18),rgba(0,0,0,.48)),url("${bannerUrl}")`:"";
card.style.backgroundSize=bannerUrl?"cover":"";
card.style.backgroundPosition=bannerUrl?"center":"";
downloadTrainerCardBtn?.classList.toggle("hidden",publicMode);
editTrainerCardBtn?.classList.toggle("hidden",publicMode);
renderInlineTrainerEditor();
renderTrainerCardTestMockup();
}