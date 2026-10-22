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
const resources=JSON.parse(fs.readFileSync(root+'/noesis/resources.json','utf8'));
const discovery=fs.readFileSync(root+'/noesis/discover.html','utf8');
const intake=fs.readFileSync(root+'/noesis/ingest.html','utf8');
check('Research resource schema',()=>assert.equal(resources.schema,'noesis.resources.v1'));
check('Curated source identities are unique',()=>assert.equal(new Set(resources.sources.map(s=>s.id)).size,resources.sources.length));
check('All resources use HTTPS',()=>{for(const s of resources.sources){assert.match(s.url,/^https:\/\//);if(s.api)assert.match(s.api,/^https:\/\//)}});
check('Homepage links the discovery instruments',()=>{assert.match(html,/discover\.html/);assert.match(html,/ingest\.html/)});
check('Discovery launcher encodes search terms',()=>assert.match(discovery,/encodeURIComponent\(term\)/));
check('Evidence intake uses browser SHA-256',()=>assert.match(intake,/crypto\.subtle\.digest\('SHA-256'/));
check('Evidence intake records unverified status',()=>assert.match(intake,/verification_status:'unverified'/));
check('No source scripts imported at runtime',()=>{assert.doesNotMatch(discovery,/<script[^>]+src=/);assert.doesNotMatch(intake,/<script[^>]+src=/)});
const sentinel=fs.readFileSync(root+'/noesis/sentinel.html','utf8');
const security=fs.readFileSync(root+'/noesis/SECURITY.md','utf8');
const manifestTool=fs.readFileSync(root+'/scripts/noesis_integrity.cjs','utf8');
check('Integrity Sentinel linked from homepage',()=>assert.match(html,/sentinel\.html/));
check('Integrity Sentinel hashes with Web Crypto',()=>assert.match(sentinel,/crypto\.subtle\.digest\('SHA-256'/));
check('Sentinel refuses automatic baseline trust',()=>assert.match(sentinel,/unattested_browser_observation/));
check('Quantum phase never used as entropy',()=>{assert.match(sentinel,/public_metadata_only/);assert.match(security,/not cryptographic entropy/)});
check('Post-quantum standard signatures documented',()=>{assert.match(security,/ML-DSA/);assert.match(security,/SLH-DSA/);assert.match(security,/ML-KEM/)});
check('Deterministic manifest generator exists',()=>assert.match(manifestTool,/createHash\('sha256'\)/));
console.log(JSON.stringify({schema:'noesis.validation.v1',passed:checks.filter(x=>x.result==='PASS').length,total:checks.length,checks},null,2));
