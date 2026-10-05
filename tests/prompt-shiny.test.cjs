const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let src=fs.readFileSync(__dirname+'/../index.html','utf8');
for(const file of ['pokemon-save-conflict-guard.patch.json','pokemon-prompt-shiny.patch.json'])for(const change of JSON.parse(fs.readFileSync(__dirname+'/../'+file,'utf8'))){assert.equal(src.split(change.old).length-1,1,'exact build context: '+file);src=src.replace(change.old,change.new)}
const code=src.slice(src.indexOf('const PROMPT_SHINY_ODDS='),src.indexOf('async function addCustomPokemon'));
function setup(roll=0, initial={}){
 const store=new Map(),events=[],p={id:'25',name:'Pikachu'},e={caught:false,books:[{title:'A book'}],...initial};
 const c={Math:Object.assign(Object.create(Math),{random:()=>{events.push('roll');return roll}}),Date,Map,console,user:{id:'u'},publicMode:false,currentPokemonId:'25',data:{25:e},entry:id=>c.data[id],all:()=>[p],isAdminTestMode:()=>false,isShinyEligiblePokemon:()=>true,localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},toast:t=>events.push(t),toastWithUndo:(t,cb)=>{c.undo=cb},missingUnownSpecialTitleCharacter:()=>'',duplicateCaughtBookConflict:()=>null,savePokemonEntryWithConflictRetry:async()=>({ok:true}),saveNow:async()=>({ok:true}),invalidateAchievementEvolutionExpert(){},syncAchievementMilestoneNotification(){},logTeamCatchForPokemon:async()=>events.push('team'),syncMyTeamBonusForPokemon:async()=>false,syncMonthlyBonusForPokemon:async()=>0,openPokemon(){},joinedFaction:()=>null};
 vm.createContext(c);vm.runInContext(code,c);vm.runInContext('showPromptShinyPopup=()=>{events.push("popup")}',Object.assign(c,{events}));return {c,e,events,p};
}
(async()=>{
 for(const [roll,win]of [[0,true],[.019999,true],[.02,false],[.8,false]]){const {c,e,events}=setup(roll);await c.toggleCaught();assert.equal(e.caught,true);assert.equal(!!e.shinyCaught,win);assert.equal(events.includes('popup'),win);assert.equal(e.promptCatchCompleted,true);await c.toggleCaught();await c.toggleCaught();assert.equal(events.filter(x=>x==='roll').length,1);assert.equal(events.filter(x=>x==='popup').length,win?1:0)}
 for(const initial of [{caught:true},{shinySaved:true},{shinyCaught:true},{promptCatchCompleted:true}]){const {c,events}=setup(0,initial);await c.toggleCaught();assert(!events.includes('roll'));assert(!events.includes('popup'))}
 {const {c,e,events}=setup(0,{books:[]});await c.toggleCaught();assert(!e.caught);assert(!events.includes('roll'))}
 {const {c,e,events}=setup(0);c.savePokemonEntryWithConflictRetry=async()=>({ok:false});await c.toggleCaught();assert(!events.includes('popup'));assert(!events.includes('team'))}
 {const {c,events}=setup(0);c.savePokemonEntryWithConflictRetry=async(id,reapply)=>{c.data[id]={caught:true,books:[{title:'Newest book'}]};reapply(c.data[id]);return {ok:true}};await c.toggleCaught();assert(!events.includes('popup'));assert.equal(c.data['25'].books[0].title,'Newest book')}
 {const {c,events}=setup(0);c.savePokemonEntryWithConflictRetry=async(id,reapply)=>{c.data[id]={caught:false,books:[{title:'Newest book'}]};reapply(c.data[id]);return {ok:true}};await c.toggleCaught();assert.equal(events.filter(x=>x==='roll').length,1);assert(events.includes('popup'));assert(c.data['25'].shinyCaught)}
 {const {c,events}=setup(0);let resolve;c.savePokemonEntryWithConflictRetry=()=>new Promise(r=>resolve=r);const first=c.toggleCaught();await c.toggleCaught();assert.equal(events.filter(x=>x==='roll').length,1);resolve({ok:true});await first}
 {const {c,e,events}=setup(0);await c.toggleCaught();const restored=JSON.parse(JSON.stringify(e));restored.caught=false;c.data['25']=restored;await c.toggleCaught();assert.equal(events.filter(x=>x==='roll').length,1)}
 {const {c,e,events}=setup(0);c.duplicateCaughtBookConflict=()=>({name:'Other'});await c.toggleCaught();assert(!e.caught);assert(!events.includes('roll'))}
 assert(src.includes('const SAFARI_SHINY_ODDS=60;'));assert(src.includes('const SAFARI_DAILY_SHINY_ROLLS=5;'));
 console.log('Passed: odds boundaries, repeat catches, legacy catches, Safari saved shiny, failed saves, fresh conflicts, double clicks, reload, invalid books.');
})().catch(e=>{console.error(e);process.exitCode=1});
