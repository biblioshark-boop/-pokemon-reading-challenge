const fs=require('fs'),assert=require('assert'),vm=require('vm');
(async()=>{
for(const [name,prefix,challenge] of [['pokemonworker','pokemon','pokemon'],['dinoworker','dino','museum']].filter(([,prefix])=>fs.existsSync(require('path').join(__dirname,'..',prefix==='pokemon'?'pokemon-worker.js':'dino-worker.js')))){
 const handlers=[],appended=[];
 global.HTMLRewriter=class{on(tag,handler){handlers.push([tag,handler]);return this;}transform(response){for(const [tag,handler] of handlers)handler.element({append:html=>appended.push(html)});return response;}};
 const code=fs.readFileSync(require('path').join(__dirname,'..',prefix==='pokemon'?'pokemon-worker.js':'dino-worker.js'),'utf8');
 const mod=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 let routed='';
 const env={ASSETS:{fetch:async req=>{routed=new URL(req.url).pathname;return new Response('fixture',{headers:{'content-type':routed.endsWith('.js')?'application/javascript':'text/html'}});}}};
 await mod.default.fetch(new Request('https://thereadingfrenzy.com/'+prefix+'/'),env);
 assert.equal(routed,'/');
 const html=appended.join('\n');
 assert.equal((html.match(/rf-challenge-welcome\.js/g)||[]).length,1);
 assert(html.includes("challenge:'"+challenge+"'"));
 const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
 assert(scripts.length);for(const script of scripts)new vm.Script(script);
 await mod.default.fetch(new Request('https://thereadingfrenzy.com/'+prefix+'/rf-challenge-welcome.js?v=1'),env);
 assert.equal(routed,'/rf-challenge-welcome.js');
 console.log(prefix,'worker generated scripts parse; authenticated context and module asset routing passed');
}
})().catch(e=>{console.error(e);process.exit(1)});
