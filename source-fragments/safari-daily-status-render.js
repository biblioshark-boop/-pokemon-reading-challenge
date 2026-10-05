function renderSafariShinyDailyStatus(){
  const count=document.getElementById("safariShinyAttemptsCount");
  const countLabel=document.getElementById("safariShinyAttemptsLabel");
  const countdown=document.getElementById("safariShinyResetCountdown");
  const note=document.getElementById("safariShinyDailyNote");
  const intro=document.getElementById("safariIntroText");
  const used=getSafariShinyRollsUsed();
  const limit=safariDailyShinyLimit();
  const odds=safariShinyOdds();
  const haunted=isHauntedSafariMode();
  const unlimited=safariUnlimitedShinyRolls();
  const limitText=document.getElementById("safariDailyLimitText");
  if(limitText)limitText.textContent=String(limit);
  if(countLabel)countLabel.textContent=haunted?"✨ Haunted Shiny Attempts Today:":"✨ Shiny Attempts Today:";
  if(count)count.textContent=unlimited?`∞ / ∞`:`${used} / ${limit}`;
  if(note)note.textContent=unlimited?"Every Safari search is shiny-eligible on this account.":used>=limit?`All ${limit} shiny attempts are used for today. Safari searches are still unlimited!`:`Safari searches remain unlimited after all ${limit} shiny attempts are used.`;
  if(intro){
    if(haunted){
      intro.innerHTML=`Search the tombstones to encounter Halloween event Pokémon. Your first <strong>${limit} Haunted Safari searches each day</strong> can roll for a Shiny at <strong>1 in ${odds} odds</strong>. After that, normal Haunted Safari searches stay unlimited. <strong>This event ends November 2.</strong>`;
    }else{
      intro.innerHTML=unlimited
        ?`Tap the tall grass to find a Pokémon. <strong>Every Safari search on this account can roll for a Shiny Pokémon at 1 in ${odds} odds.</strong> The daily counter below tracks how many shiny rolls you have made today and resets once daily. Safari filters control regular encounters, but if a shiny roll hits, that shiny is chosen from the full shiny-eligible Pokédex. Mark an encounter before catching it if you want it counted as a Safari catch. Turn on <strong>All Pokémon — Caught + Uncaught</strong> when you want your regular Safari encounters to include Pokémon you already caught.`
        :`Tap the tall grass to find a Pokémon. Safari searches are unlimited, but only your first <strong>${limit} searches each day</strong> can roll for a Shiny Pokémon at <strong>1 in ${odds} odds</strong>. Your shiny attempts reset once daily; the countdown below shows exactly when your next reset happens. Safari filters control regular encounters, but if a shiny roll hits, that shiny is chosen from the full shiny-eligible Pokédex. Mark an encounter before catching it if you want it counted as a Safari catch. Turn on <strong>All Pokémon — Caught + Uncaught</strong> when you want your regular Safari encounters to include Pokémon you already caught.`;
    }
  }
  if(countdown){
    const remaining=Math.max(0,safariNextResetTimestamp()-Date.now());
    const totalSeconds=Math.floor(remaining/1000);
    const hours=Math.floor(totalSeconds/3600);
    const minutes=Math.floor((totalSeconds%3600)/60);
    const seconds=totalSeconds%60;
    countdown.textContent=`${hours}h ${String(minutes).padStart(2,"0")}m ${String(seconds).padStart(2,"0")}s`;
  }
}