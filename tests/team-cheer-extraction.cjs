const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2]||'cheer-cleanup/current-main.html','utf8');
const a=source.indexOf('const TEAM_CHEERS={'),b=source.indexOf('\nfunction cheerCatalogFor(',a);
assert(a>=0&&b>a);
const original=source.slice(a,b),fragment=fs.readFileSync(process.argv[3]||'cheer-cleanup/team-cheer-catalog.js','utf8').trimEnd();assert.equal(fragment,original.trimEnd());
function evaluate(code){
 const c={};vm.createContext(c);vm.runInContext(code,c);
 const catalog=JSON.parse(vm.runInContext('JSON.stringify(TEAM_CHEERS)',c));
 const types=[...new Set(Object.values(catalog).flat().map(row=>row[1]))];
 const icons=Object.fromEntries([...types,'unknown-icon','',null].map(t=>[String(t),c.cheerIconSvg(t)]));
 return {catalog,icons,types};
}
const baseline=evaluate(original),staged=evaluate(fragment);assert.deepEqual(staged,baseline);
assert.equal(Object.keys(staged.catalog).length,12);assert.equal(staged.catalog.generic.length,4);assert.equal(staged.catalog['team-star'].length,4);
for(const rows of Object.values(staged.catalog))for(const [key,icon,label] of rows){assert(key&&icon&&label);assert(staged.icons[icon].startsWith('<svg viewBox="0 0 24 24"'));}
assert.equal(staged.icons['unknown-icon'],staged.icons.sparkles);assert.equal(staged.icons.null,staged.icons.sparkles);
console.log(`PASS: exact extraction; all ${Object.values(staged.catalog).flat().length} cheers across 12 catalog groups and ${staged.types.length} SVG types match main; unknown/null icon fallback preserved.`);
