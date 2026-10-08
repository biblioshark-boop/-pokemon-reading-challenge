const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2]||'card-cleanup/current-main.html','utf8');
const a=source.indexOf('const ACHIEVEMENT_CARD_BACK='),b=source.indexOf('\nlet achievementShellCategory=',a);assert(a>=0&&b>a);
const original=source.slice(a,b),fragment=fs.readFileSync(process.argv[3]||'card-cleanup/achievement-card-catalog.js','utf8').trimEnd();assert.equal(fragment,original.trimEnd());
function evaluate(code){const c={};vm.createContext(c);vm.runInContext(code,c);return JSON.parse(vm.runInContext('JSON.stringify({ACHIEVEMENT_CARD_BACK,ACHIEVEMENT_SHELL_DEFINITIONS,ACHIEVEMENT_CATEGORY_LABELS})',c));}
const baseline=evaluate(original),staged=evaluate(fragment);assert.deepEqual(staged,baseline);
const cards=staged.ACHIEVEMENT_SHELL_DEFINITIONS;assert.equal(cards.length,84);assert.equal(Object.keys(staged.ACHIEVEMENT_CATEGORY_LABELS).length,6);
assert.equal(new Set(cards.map(x=>x.title)).size,cards.length);
for(const card of cards){assert(staged.ACHIEVEMENT_CATEGORY_LABELS[card.category]);assert(card.title&&card.requirement&&card.image.endsWith('.png'));assert.equal(card.unlocked,false);}
for(const category of ['pokemon','gyms','teams','trainer-teams','regional'])assert.deepEqual(cards.filter(x=>x.category===category),baseline.ACHIEVEMENT_SHELL_DEFINITIONS.filter(x=>x.category===category));
assert.equal(staged.ACHIEVEMENT_CARD_BACK,'assets/achievement-cards/achievement-card-back.png');
console.log(`PASS: exact extraction; all ${cards.length} card definitions, ordering, artwork filenames, initial states and 6 category labels match main.`);
