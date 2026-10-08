const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2]||'achievement-cleanup/current-main.html','utf8');
const a=source.indexOf('const ACHIEVEMENT_COLLECTION_SPEC='),b=source.indexOf('\nconst achievementTeamBonusDisplayTagsBySlug=',a);assert(a>=0&&b>a);
const original=source.slice(a,b),fragment=fs.readFileSync(process.argv[3]||'achievement-cleanup/achievement-membership-catalog.js','utf8').trimEnd();assert.equal(fragment,original.trimEnd());
const end=source.indexOf('\nlet achievementTeamBonusTagsBySlug=',b);assert(end>b);const indexCode=source.slice(b,end);
const names=['ACHIEVEMENT_COLLECTION_SPEC','ACHIEVEMENT_COLLECTION_LABELS','ACHIEVEMENT_TRAINER_SPEC','ACHIEVEMENT_TRAINER_LABELS','ACHIEVEMENT_TEAM_BONUS_DISPLAY_SPEC','ACHIEVEMENT_TEAM_BONUS_DISPLAY_NAMES','achievementTeamBonusDisplayTagsBySlug'];
function evaluate(code){const c={};vm.createContext(c);vm.runInContext(code+indexCode,c);return JSON.parse(vm.runInContext('JSON.stringify({'+names.join(',')+'})',c));}
const baseline=evaluate(original),staged=evaluate(fragment);assert.deepEqual(staged,baseline);
assert.equal(Object.keys(staged.ACHIEVEMENT_COLLECTION_SPEC).length,7);assert.equal(Object.keys(staged.ACHIEVEMENT_TRAINER_SPEC).length,18);assert.equal(Object.keys(staged.ACHIEVEMENT_TEAM_BONUS_DISPLAY_SPEC).length,11);
assert(staged.ACHIEVEMENT_TRAINER_SPEC.jessie.some(x=>x.slugIncludes==='frillish-f'));
assert(staged.ACHIEVEMENT_TRAINER_SPEC.roy.some(x=>x.slugIncludes==='maushold-family-of-four'));
for(const [team,slugs] of Object.entries(staged.ACHIEVEMENT_TEAM_BONUS_DISPLAY_SPEC))for(const slug of slugs)assert(staged.achievementTeamBonusDisplayTagsBySlug[slug].some(x=>x.slug===team&&x.name===staged.ACHIEVEMENT_TEAM_BONUS_DISPLAY_NAMES[team]));
assert(staged.achievementTeamBonusDisplayTagsBySlug['data-0041-zubat'].length>1);
console.log('PASS: exact extraction; 7 collection groups, 18 trainer teams and 11 bonus-team mappings match main; exact-form criteria and every derived display tag preserved.');
