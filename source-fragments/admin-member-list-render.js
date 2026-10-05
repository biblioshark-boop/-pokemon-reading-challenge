function renderAdminMembers(){
const list=document.getElementById("adminMembersList");
const count=document.getElementById("adminMemberCount");
if(!list)return;
const q=(document.getElementById("adminMemberSearch")?.value||"").trim().toLowerCase();
const joinSort=document.getElementById("adminMemberJoinSort")?.value||"newest";
const rows=adminMembers.filter(m=>{
const hay=[m.username,m.display_name,m.email,m.faction_name].filter(Boolean).join(" ").toLowerCase();
return !q||hay.includes(q);
}).sort((a,b)=>{
const aTime=a.created_at?new Date(a.created_at).getTime():0;
const bTime=b.created_at?new Date(b.created_at).getTime():0;
return joinSort==="oldest"?aTime-bTime:bTime-aTime;
});
if(count)count.textContent=rows.length===adminMembers.length?`${adminMembers.length} member${adminMembers.length===1?"":"s"}`:`${rows.length} of ${adminMembers.length} members`;
if(!rows.length){
list.innerHTML='<div class="muted">No matching members.</div>';
return;
}
list.innerHTML=rows.map(m=>{
const name=memberBestName(m);
const username=m.username?`@${m.username}`:"No username yet";
const display=m.display_name&&m.display_name!==m.username?m.display_name:"";
const email=m.email||"";
return `<div class="admin-member-row"><div class="admin-member-main" role="button" tabindex="0" onclick="adminUsernameMemberSelect.value='${esc(m.user_id)}';loadAdminUsernameEditor('${esc(m.user_id)}')" onkeydown="if(event.key==='Enter'){adminUsernameMemberSelect.value='${esc(m.user_id)}';loadAdminUsernameEditor('${esc(m.user_id)}')}"><div class="admin-member-name">${esc(name)}</div><div class="admin-member-meta">${esc([display,username,email].filter(Boolean).join(" • "))}</div><div class="admin-member-joined">Joined: ${esc(formatAdminJoinedAt(m.created_at))}</div><div class="admin-member-actions"><button type="button" class="secondary" onclick="event.stopPropagation();viewAdminUserCard('${esc(m.user_id)}')">View User Card</button><button type="button" class="secondary" onclick="event.stopPropagation();openAdminBadgeManager('${esc(m.user_id)}')">Manage Badges</button><button type="button" class="danger" onclick="event.stopPropagation();confirmAdminDeleteMember('${esc(m.user_id)}','${esc(name)}')">Delete User</button></div></div><div class="admin-member-team">${esc(m.faction_name||"No team")}</div></div>`;
}).join("");
}