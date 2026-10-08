async function renderMyTeamPage(){
 const hero=document.getElementById("myTeamPageHero");
 const contribPanel=document.getElementById("myTeamContributorsPanel");
 const contrib=document.getElementById("myTeamTopContributors");
 const activity=document.getElementById("myTeamActivity");
 const activityTitle=document.getElementById("myTeamActivityTitle");
 const activityNote=document.getElementById("myTeamActivityNote");
 if(!hero||!contribPanel||!contrib||!activity)return;
 if(publicMode||!user){
   document.getElementById("myteamPage")?.classList.remove("poke-dolls-layout");
   hero.style.background="linear-gradient(135deg,var(--accent),var(--accent2))";
   hero.innerHTML='<div class="myteam-empty" style="color:white">Sign in to open your team clubhouse.</div>';
   return;
 }
 hero.innerHTML='<div class="myteam-empty" style="color:white">Loading team page…</div>';
 contrib.innerHTML='<div class="myteam-empty">Loading contributors…</div>';
 activity.innerHTML='<div class="myteam-empty">Loading activity…</div>';

 const targetFactionId=currentFactionId||joinedFactionId||null;
 const{data:pageData,error}=await sb.rpc("get_team_page_preview",{p_faction_id:targetFactionId});
 if(error){
   document.getElementById("myteamPage")?.classList.remove("poke-dolls-layout");
   console.error(error);
   hero.style.background="linear-gradient(135deg,var(--accent),var(--accent2))";
   hero.innerHTML='<div class="myteam-empty" style="color:white">Could not load this team page right now.</div>';
   return;
 }

 const row=pageData?.summary||null;
 if(!row){
   document.getElementById("myteamPage")?.classList.remove("poke-dolls-layout");
   hero.style.background="linear-gradient(135deg,var(--accent),var(--accent2))";
   hero.innerHTML='<div class="myteam-hero-inner"><div><div class="myteam-kicker">MY TEAM</div><div class="myteam-name">Choose Your Team</div><div class="myteam-sub">Join a team to unlock your team clubhouse, activity, and community features.</div></div></div>';
   contribPanel.classList.add("hidden");
   return;
 }

 const myTeamPage=document.getElementById("myteamPage");
 if(myTeamPage)myTeamPage.classList.toggle("poke-dolls-layout",String(row.slug||"")==="poke-dolls");

 const isPreview=!!pageData?.is_preview;
 const canPost=!!pageData?.can_post_cheer;
 const competitive=row.is_competitive!==false;
 const topRows=Array.isArray(pageData?.top_contributors)?pageData.top_contributors:[];
 const recentRows=Array.isArray(pageData?.recent)?pageData.recent:[];
 const cheerRows=Array.isArray(pageData?.cheers)?pageData.cheers:[];
 const bonusRows=Array.isArray(pageData?.bonuses)?pageData.bonuses:[];
 const memberCount=Number(row.member_count||0);
 const teamMemberRows=Array.isArray(pageData?.members)?pageData.members:[];
 renderMyTeamMembersPanel(teamMemberRows);

 renderMyTeamCheerChoices(row.slug||"",canPost);
 renderMyTeamCheerFeedRows(row.slug||"",cheerRows);
 renderTeamBonusPanel(row,bonusRows);

 const leaderVisual=row.leader_image_url?`<img src="${esc(row.leader_image_url)}" alt="${esc(row.leader_character||"Team Leader")}" onerror="this.style.display='none'">`:"";
 const leaderBlock=competitive?`<div class="myteam-leader">${leaderVisual}<div><div class="myteam-leader-label">TEAM LEADER</div><div class="myteam-leader-name">${esc(row.leader_character||"Leader")}${row.leader_username?` • @${esc(row.leader_username)}`:""}</div></div></div>`:"";
 const joinedName=joinedFaction()?factionName(joinedFaction()):"your team";
 const previewNote=isPreview?`<div class="myteam-preview-note">👁 VIEW MODE • Preview only — your membership and stats remain with ${esc(joinedName)}</div>`:"";

 const heroBanner=(TEAM_CARD_BANNERS[row.slug||""]||[])[0]?.url||"";
 hero.style.background=heroBanner
   ? `linear-gradient(115deg,rgba(7,10,17,.34),rgba(7,10,17,.72)),linear-gradient(135deg,${row.primary_color||"var(--accent)"},${row.secondary_color||"var(--accent2)"}),url("${heroBanner}") center/cover no-repeat`
   : `linear-gradient(135deg,${row.primary_color||"var(--accent)"},${row.secondary_color||"var(--accent2)"})`;
 const myTeamTotalHtml=`<div class="myteam-total">${Number(row.total_points??row.total_caught??0).toLocaleString()}<span>${competitive?"team points": "community hearts"} • ${Number(row.total_caught||0).toLocaleString()} caught</span></div>`;
 const myTeamScoreHtml=competitive?myTeamTotalHtml:`<div class="poke-dolls-heart-summary">${pokeDollsHeartMeterHtml(row)}</div>`;
 hero.innerHTML=`<div class="myteam-hero-inner"><div><div class="myteam-kicker">${competitive?"MY TEAM":"COMMUNITY LOUNGE"}</div><div class="myteam-name">${esc(row.name||"Team")}</div><div class="myteam-sub">${competitive?`${memberCount} member${memberCount===1?"":"s"} • ${isPreview?"Preview this team’s progress, activity, and Cheer Wall.":"Your home base for team progress, activity, and encouragement."}`:`${memberCount} member${memberCount===1?"":"s"} • A noncompetitive space to read, catch Pokémon, and encourage each other without rankings.`}</div>${previewNote}</div>${myTeamScoreHtml}</div>${leaderBlock}`;

 if(competitive){
   contribPanel.classList.remove("hidden");
   contribPanel.querySelector("h3").textContent="Top Contributors";
   contribPanel.querySelector(".myteam-panel-note").textContent="Top three members contributing Pokémon catches to the team. Team Leaders are not included.";
   const medals=["🥇","🥈","🥉"];
   contrib.innerHTML=topRows.length?`<div class="myteam-podium">${topRows.map((r,i)=>{
     const name=String(r.display_name||r.username||"Team member").trim();
     const handle=String(r.username||"").trim();
     return `<div class="myteam-podium-card"><div class="myteam-podium-medal">${medals[i]||"⭐"}</div><div><div class="myteam-podium-name">${esc(name)}</div>${handle?`<div class="myteam-podium-handle">@${esc(handle)}</div>`:""}</div><div class="myteam-podium-score">${Number(r.points??r.caught_count??0).toLocaleString()}<span>points</span></div></div>`;
   }).join("")}</div>`:'<div class="myteam-empty">No contributor stats yet.</div>';
   if(activityTitle)activityTitle.textContent="Recent Team Activity";
   if(activityNote)activityNote.textContent="See what this team has been catching lately.";
 }else{
   contribPanel.classList.remove("hidden");
   contribPanel.querySelector("h3").textContent="Poke Dolls Lounge";
   contribPanel.querySelector(".myteam-panel-note").textContent="No rankings, no podiums, no pressure — just community.";
   contrib.innerHTML='<div class="myteam-community-card"><div class="myteam-community-icon">🧸</div><div class="myteam-community-title">Read at your own pace.</div><div class="myteam-community-copy">Poke Dolls is the noncompetitive home for members who want the full challenge without team rankings. Cheer each other on, celebrate catches, and enjoy the journey.</div></div>';
   if(activityTitle)activityTitle.textContent="What Everyone’s Catching";
   if(activityNote)activityNote.textContent="Recent catches from around the Poke Dolls community.";
 }

 activity.innerHTML=recentRows.length?`<div class="myteam-activity-list">${recentRows.slice(0,10).map(r=>{
   const mon=`${r.pokemon_name||"Pokémon"}${r.pokemon_form?` • ${r.pokemon_form}`:""}`;
   const who=r.username?`@${r.username}`:(r.display_name||"Team member");
   return `<div class="myteam-activity-row" role="button" tabindex="0" title="Open ${esc(mon)}" onclick="openCompetitionActivityPokemon(\'${esc(r.pokemon_key||"")}\',\'${esc(r.pokemon_name||"")}\',\'${esc(r.pokemon_form||"")}\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();openCompetitionActivityPokemon(\'${esc(r.pokemon_key||"")}\',\'${esc(r.pokemon_name||"")}\',\'${esc(r.pokemon_form||"")}\')}"><div class="myteam-activity-main"><div class="myteam-activity-mon">${esc(mon)}</div><div class="myteam-activity-who">Caught by ${esc(who)}</div>${r.book_title?`<div class="myteam-activity-book">📖 ${esc(r.book_title)}</div>`:""}</div><div class="myteam-activity-time">${esc(timeAgo(r.caught_at))}</div></div>`;
 }).join("")}</div>`:'<div class="myteam-empty">No recent catches yet. New team catches will appear here.</div>';
}