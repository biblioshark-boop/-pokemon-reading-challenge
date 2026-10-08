const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2],'utf8');
const start=source.indexOf('async function renderMyTeamPage(){');
const end=source.indexOf('\nfunction renderStats(){',start);
const original=source.slice(start,end);
const fragment=fs.readFileSync(require('node:path').join(__dirname,'../source-fragments/my-team-page-render.js'),'utf8').trimEnd();
assert.equal(fragment,original);
async function render(code,scenario){
 const elements=new Map(),calls=[];
 function el(id){if(!elements.has(id)){const classes=new Set();elements.set(id,{innerHTML:'',textContent:'',style:{},classes,classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),toggle:(c,b)=>b?classes.add(c):classes.delete(c)},querySelector:q=>el(id+':'+q)});}return elements.get(id);}
 const ctx={document:{getElementById:id=>scenario.missing?null:el(id)},publicMode:!!scenario.public,user:scenario.signedOut?null:{id:'fixture'},
 currentFactionId:'preview-team',joinedFactionId:'actual-team',sb:{rpc:async(name,args)=>{calls.push([name,args]);return {data:scenario.data,error:scenario.error};}},
 renderMyTeamMembersPanel:rows=>calls.push(['members',rows]),renderMyTeamCheerChoices:(...a)=>calls.push(['choices',...a]),renderMyTeamCheerFeedRows:(...a)=>calls.push(['cheers',...a]),renderTeamBonusPanel:(...a)=>calls.push(['bonus',...a]),
 esc:s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;'),joinedFaction:()=>({name:'Actual Team'}),factionName:f=>f.name,
 TEAM_CARD_BANNERS:{'team-rocket':[{url:'fixture-banner.png'}]},pokeDollsHeartMeterHtml:()=>'<div>fixture hearts</div>',timeAgo:()=> 'fixture time',console:{error:()=>{}}};
 vm.createContext(ctx);vm.runInContext(code,ctx);await ctx.renderMyTeamPage();
 return JSON.parse(JSON.stringify({elements:[...elements].map(([id,e])=>({id,html:e.innerHTML,text:e.textContent,style:e.style,classes:[...e.classes]})),calls}));
}
(async()=>{
 const summary={slug:'team-rocket',name:'Rocket',member_count:4,total_points:123,total_caught:7,leader_character:'Giovanni',leader_username:'leader',leader_image_url:'fixture-leader.png'};
 const cases=[{missing:true},{public:true},{signedOut:true},{error:'fixture error'},{data:{summary:null}},
 {data:{summary,top_contributors:[{username:'reader',points:9}],recent:[{pokemon_name:'Eevee',pokemon_key:'eevee',username:'reader',book_title:'Book'}],members:[],bonuses:[],cheers:[]}},
 {data:{summary:{...summary,slug:'poke-dolls',is_competitive:false}}},
 {data:{summary,is_preview:true,can_post_cheer:false}},
 {data:{summary,top_contributors:null,recent:null,members:null,bonuses:null,cheers:null}}];
 for(const c of cases)assert.deepEqual(await render(original,c),await render(fragment,c));
 const ordinary=await render(fragment,cases[5]);assert(ordinary.elements.find(e=>e.id==='myTeamPageHero').html.includes('123'));
 assert.equal(ordinary.calls.filter(c=>c[0]==='get_team_page_preview').length,1);
 assert(ordinary.elements.find(e=>e.id==='myTeamActivity').html.includes('Eevee'));
 const preview=await render(fragment,cases[7]);assert(preview.elements.find(e=>e.id==='myTeamPageHero').html.includes('VIEW MODE'));
 console.log('PASS: exact extraction; identical DOM output and calls for 9 Team-page scenarios; one RPC read; totals/activity/preview preserved.');
})().catch(e=>{console.error(e);process.exitCode=1;});
