function setSafariMode(mode){
  const next=mode==="haunted"&&hauntedSafariAvailable()?"haunted":"regular";
  if(next===safariMode)return syncSafariModeUi();
  if(!clearSafariEncounter())return;
  safariMode=next;
  syncSafariModeUi();
}
function syncSafariModeUi(){
  const hauntedAvailable=hauntedSafariAvailable();
  if(!hauntedAvailable&&safariMode!=="regular")safariMode="regular";
  const haunted=isHauntedSafariMode();
  const page=document.getElementById("safariPage");
  const toggle=document.getElementById("safariModeToggle");
  toggle?.classList.toggle("hidden",!hauntedAvailable);
  page?.classList.toggle("haunted-safari",haunted);
  document.getElementById("regularSafariModeBtn")?.classList.toggle("active",!haunted);
  document.getElementById("hauntedSafariModeBtn")?.classList.toggle("active",haunted);
  const regularBtn=document.getElementById("regularSafariModeBtn"),hauntedBtn=document.getElementById("hauntedSafariModeBtn");
  if(regularBtn)regularBtn.className=haunted?"secondary":"primary active";
  if(hauntedBtn)hauntedBtn.className=haunted?"primary active":"secondary";
  document.getElementById("regularSafariControls")?.classList.toggle("hidden",haunted);
  document.getElementById("regularGrassField")?.classList.toggle("hidden",haunted);
  document.getElementById("regularGrassHelp")?.classList.toggle("hidden",haunted);
  document.getElementById("hauntedSafariControls")?.classList.toggle("hidden",!haunted);
  document.getElementById("hauntedGraveyardField")?.classList.toggle("hidden",!haunted);
  document.getElementById("hauntedGraveyardHelp")?.classList.toggle("hidden",!haunted);
  const title=document.getElementById("safariTitle");
  if(title)title.textContent=haunted?"Haunted Safari":"Safari Zone";
  const intro=document.getElementById("safariIntroText");
  if(intro&&haunted)intro.innerHTML="Welcome to the Haunted Safari test! Search the graveyard to encounter only your Halloween event Pokémon pool. This patch is focused on the visual theme first, so the shiny rules are still using the current Safari test settings. Use the Show filter below to switch between caught, uncaught, or both.";
  else if(intro&&intro.dataset.regularSafariIntro)intro.innerHTML=intro.dataset.regularSafariIntro;
}