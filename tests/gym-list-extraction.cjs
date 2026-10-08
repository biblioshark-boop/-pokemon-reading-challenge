const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2]||'gym-cleanup/current-main.html','utf8');
const a=source.indexOf('function renderGyms(){'),b=source.indexOf('\nfunction renderBadgeCase(){',a);
assert(a>=0&&b>a,'baseline renderer exists');
const original=source.slice(a,b),fragment=fs.readFileSync(process.argv[3]||'gym-cleanup/gym-list-render.js','utf8').trimEnd();
assert.equal(fragment,original);
function render(code,s){
 const box={innerHTML:''},calls=[];
 const ctx={document:{getElementById:id=>id==='gymList'?(s.missing?null:box):{value:id==='gymRegionFilter'?(s.region||'all'):(s.filter||'all')}},
 gymsData:s.gyms||[],gymTeamData:s.members||[],gymMemberProgress:s.progress||{},
 fillGymRegions:()=>calls.push('regions'),gymIsCurrentlyChallenging:id=>id==='g1',gymIsCleared:()=>!!s.cleared,
 gymMemberPokemon:()=>({formApiName:'fixture-form'}),gymMemberDone:()=>!!s.done,gymMemberImage:()=>s.noImage?'':'fixture.png',
 gymMemberPrompt:()=>'<Reading prompt>',gymCatalogRow:()=>s.exactArt?{image_url:'form.png'}:null,formApiNameFromRow:()=> 'fixture-form',
 trainerShowdownUrl:()=> 'leader.png',trainerInitials:()=> 'L',gymRewardName:()=> 'Fixture Badge',
 hydrateGymFormImages:el=>{assert.equal(el,box);calls.push('hydrate');},esc:x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')};
 vm.createContext(ctx);vm.runInContext(code,ctx);ctx.renderGyms();return {html:box.innerHTML,calls};
}
const gym={id:'g1',region:'Kanto',leader_name:'Leader',challenge_type:'Gym Leader',specialty_type:'Water'},member={id:'m1',gym_id:'g1',pokemon_name:'Eevee',dex_number:133};
const base={gyms:[gym],members:[member]};
const cases=[{missing:true},{},{...base,region:'Johto'},{...base,filter:'current',gyms:[{...gym,id:'g2'}]},base,
 {...base,members:[{...member,form_name:'Special'}]}, {...base,noImage:true}, {...base,cleared:true,done:true},
 ...['existing','new_entry_pokedex','other'].map(completion_source=>({...base,done:true,progress:{m1:{completion_source,book_title:'Book <title>'}}})),
 {...base,exactArt:true,members:[{...member,form_name:'Special'}]}, {...base,filter:'current'}];
for(const scenario of cases)assert.deepEqual(render(original,scenario),render(fragment,scenario));
const ordinary=render(fragment,base);assert(ordinary.html.includes('openGymDefeatModal'));assert(ordinary.html.includes('&lt;Reading prompt>'));assert.deepEqual(ordinary.calls,['regions','hydrate']);
const cleared=render(fragment,{...base,done:true,cleared:true});assert(cleared.html.includes('undoGymMember'));assert(cleared.html.includes('openGymVictoryCard'));assert(cleared.html.includes('Fixture Badge earned!'));
assert(render(fragment,cases[5]).html.includes('data-gym-form="1"'));assert(render(fragment,cases[6]).html.includes('#0133'));
console.log(`PASS: exact extraction; identical Gym HTML and helper calls for ${cases.length} scenarios; artwork, controls, rewards, filters and fallback preserved.`);
