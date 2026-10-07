const fs=require('fs'),assert=require('assert'),{chromium}=require('playwright');
const code=fs.readFileSync(require('path').join(__dirname,'../rf-challenge-welcome.js'),'utf8');
(async()=>{
const b=await chromium.launch({executablePath:process.env.RF_CHROMIUM_EXECUTABLE});
for(const width of [1280,390])for(const challenge of ['pokemon','museum']){
const ctx=await b.newContext({viewport:{width,height:850}}),p=await ctx.newPage();
const rows=new Set(),calls=[];let failWrite=false,failRead=false;
await p.exposeFunction('welcomeDb',async(op,user,ch)=>{calls.push([op,user,ch]);if(op==='read')return failRead?{error:{message:'offline'}}:{data:rows.has(user+':'+ch)?{challenge_key:ch}:null};if(failWrite)return {error:{message:'offline'}};rows.add(user+':'+ch);return {error:null};});
await p.route('http://welcome.test/**',r=>r.fulfill({body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><button id="entry">Challenge</button><button class="nav" id="faq">FAQ</button><section id="content">Existing challenge content</section>',contentType:'text/html'}));
async function start(user,ch,late=false,storageFail=false){
 await p.goto('http://welcome.test/'+ch);
 await p.evaluate(({user,ch,storageFail})=>{
  window.nativeFaqCalls=0;window.openFaqHelp=()=>window.nativeFaqCalls++;
  const button=document.querySelector('#faq');button.className='';button.dataset.tab='FAQ';const nav=document.createElement('div');nav.className='nav';button.replaceWith(nav);nav.appendChild(button);button.onclick=()=>window.nativeFaqCalls++;
  if(storageFail){Storage.prototype.getItem=()=>{throw Error('blocked');};Storage.prototype.setItem=()=>{throw Error('blocked');};}
  const client={from:()=>({select(){return this;},eq(name,value){this[name]=value;return this;},maybeSingle(){return welcomeDb('read',this.user_id,this.challenge_key);},upsert(row,options){window.upsertOptions=options;return welcomeDb('write',row.user_id,row.challenge_key);}})};
  window.testContext={userId:user,challenge:ch,client};
  document.querySelector('#entry').focus();
 },{user,ch,storageFail});
 if(!late)await p.evaluate(()=>window.rfChallengeWelcomeContext=testContext);
 await p.addScriptTag({content:code});
 if(late)await p.evaluate(()=>{window.rfChallengeWelcomeContext=testContext;dispatchEvent(new Event('rf-challenge-welcome-ready'));});
 await p.waitForTimeout(60);
}
await start('member-a',challenge,true);
assert(await p.locator('#rf-challenge-welcome').isVisible());
assert((await p.locator('#rf-challenge-welcome').textContent()).includes(challenge==='pokemon'?'For 2026 only':'does not allow backlogging'));
assert.equal(await p.locator('#rf-challenge-welcome').evaluate(el=>el.open),true);
const box=await p.locator('#rf-challenge-welcome').boundingBox();assert(box.x>=0&&box.x+box.width<=width+1&&box.height<=850);
await p.screenshot({path:require('path').join(require('os').tmpdir(),'rf-welcome-'+challenge+'-'+width+'.png')});
await p.getByRole('button',{name:'Close welcome message'}).click();await p.waitForTimeout(40);
assert.equal(await p.locator('#rf-challenge-welcome').count(),0);assert(rows.has('member-a:'+challenge));
assert.equal(await p.evaluate(()=>document.activeElement.id),'entry');
assert.deepEqual(await p.evaluate(()=>upsertOptions),{onConflict:'user_id,challenge_key',ignoreDuplicates:true});
await start('member-a',challenge);assert.equal(await p.locator('#rf-challenge-welcome').count(),0);
await p.evaluate(()=>localStorage.clear());await start('member-a',challenge);assert.equal(await p.locator('#rf-challenge-welcome').count(),0);
// Another challenge and another user are independent, even on the same browser.
const other=challenge==='pokemon'?'museum':'pokemon';
await start('member-a',other);assert(await p.locator('#rf-challenge-welcome').isVisible());
await p.getByRole('link',{name:'FAQ page'}).click();await p.waitForTimeout(40);assert.equal(await p.evaluate(()=>nativeFaqCalls),1);assert(rows.has('member-a:'+other));
await start('member-b',challenge);assert(await p.locator('#rf-challenge-welcome').isVisible());
failWrite=true;await p.getByRole('button',{name:'Close welcome message'}).click();await p.waitForTimeout(40);
await start('member-b',challenge);assert.equal(await p.locator('#rf-challenge-welcome').count(),0);assert(!rows.has('member-b:'+challenge));
failWrite=false;await p.evaluate(()=>dispatchEvent(new Event('online')));await p.waitForTimeout(40);assert(rows.has('member-b:'+challenge));
// Cross-device behavior: erase all device caches; database dismissal still suppresses it.
await p.evaluate(()=>localStorage.clear());await start('member-b',challenge,false,true);assert.equal(await p.locator('#rf-challenge-welcome').count(),0);
// New member with unavailable local storage can close and persist to account.
await start('member-c',challenge,false,true);assert(await p.locator('#rf-challenge-welcome').isVisible());await p.keyboard.press('Escape');await p.waitForTimeout(40);assert(rows.has('member-c:'+challenge));
await p.goto('http://welcome.test/');await p.addScriptTag({content:code});await p.waitForTimeout(30);assert.equal(await p.locator('#rf-challenge-welcome').count(),0);
console.log(width,challenge,'eligible existing/new users, independent notices, account persistence, late auth, FAQ, offline retry, blocked storage, keyboard close and mobile bounds passed');
await ctx.close();
}
await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
