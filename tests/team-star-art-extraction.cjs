const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const source=fs.readFileSync(process.argv[2]||'star-cleanup/current-main.html','utf8');
const a=source.indexOf('const TEAM_STAR_LOGO='),b=source.indexOf('\nfunction ',a);assert(a>=0&&b>a);
const original=source.slice(a,b),fragment=fs.readFileSync(process.argv[3]||'star-cleanup/team-star-art.js','utf8').trimEnd();assert.equal(fragment,original.trimEnd());
function evaluate(code){
 const c={TEAM_CARD_BANNERS:{fixture:[{key:'existing',url:'existing.png'}]}};vm.createContext(c);vm.runInContext(code,c);
 return JSON.parse(vm.runInContext('JSON.stringify({logo:TEAM_STAR_LOGO,banners:TEAM_CARD_BANNERS})',c));
}
const baseline=evaluate(original),staged=evaluate(fragment);assert.deepEqual(staged,baseline);
assert.deepEqual(staged.banners.fixture,[{key:'existing',url:'existing.png'}]);
assert.deepEqual(staged.banners['team-star'].map(x=>x.key),['star-graffiti','star-campus','star-base']);
for(const url of [staged.logo,...staged.banners['team-star'].map(x=>x.url)]){
 assert(url.startsWith('data:image/webp;base64,'));const bytes=Buffer.from(url.split(',')[1],'base64');
 assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.readUInt32LE(4)+8,bytes.length);
 assert(bytes.length>10000);
}
const digest=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');assert.equal(digest(staged),digest(baseline));
console.log('PASS: exact extraction; Team Star logo and all 3 banner keys, labels and bytes match main; existing team banners preserved; all 4 WebP payloads valid.');
