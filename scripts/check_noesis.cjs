#!/usr/bin/env node
// NOESIS institutional registry contract. No external dependencies or credentials.
const fs=require('node:fs');const assert=require('node:assert/strict');
const root=require('node:path').resolve(__dirname,'..');
const registry=JSON.parse(fs.readFileSync(root+'/noesis/registry.json','utf8'));
const html=fs.readFileSync(root+'/noesis/index.html','utf8');
const checks=[];
function check(name,fn){try{fn();checks.push({name,result:'PASS'});console.log('PASS '+name)}catch(e){checks.push({name,result:'FAIL',error:e.message});console.error('FAIL '+name+': '+e.message);process.exitCode=1}}
check('Registry schema',()=>assert.equal(registry.schema,'noesis.registry.v1'));
check('Institution identity',()=>assert.equal(registry.institution,'NOESIS'));
check('Evidence taxonomy',()=>assert.deepEqual(registry.evidence_classes.map(x=>x.id),['E0','E1','E2','E3','H']));
check('Unique instrument IDs',()=>assert.equal(new Set(registry.instruments.map(x=>x.id)).size,registry.instruments.length));
check('HTTPS laboratory destinations',()=>{for(const x of registry.instruments){assert.match(x.url,/^https:\/\//);assert.match(x.source,/^https:\/\//);assert.ok(x.name);assert.ok(registry.evidence_classes.some(e=>e.id===x.evidence))}});
check('No unverified automatic certification',()=>assert.match(html,/not yet an autonomous research or certification service/));
check('Public registry referenced by page',()=>assert.match(html,/fetch\('\.\/registry\.json'/));
check('No inline credential',()=>assert.doesNotMatch(html,/sb_secret_|sk-proj-|SUPABASE_SECRET_KEY/));
check('Preservation: Jekyll config exists',()=>assert.ok(fs.existsSync(root+'/_config.yml')));
check('Preservation: existing deployment workflow exists',()=>assert.ok(fs.existsSync(root+'/.github/workflows/pages.yml')));
console.log(JSON.stringify({schema:'noesis.validation.v1',passed:checks.filter(x=>x.result==='PASS').length,total:checks.length,checks},null,2));
