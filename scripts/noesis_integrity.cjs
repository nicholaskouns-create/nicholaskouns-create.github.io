#!/usr/bin/env node
/* NOESIS integrity manifest: deterministic SHA-256 content hashes. No clock entropy. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const files=['noesis/index.html','noesis/registry.json','noesis/resources.json','noesis/discover.html','noesis/ingest.html','flowshield.html','flowshield-engine.js'];
const records=files.map(p=>{const bytes=fs.readFileSync(path.join(root,p));return {path:p,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length}});
const manifest={schema:'noesis.integrity.v1',algorithm:'SHA-256',scope:'public-static-assets',records};
const output=JSON.stringify(manifest,null,2)+'\n';
if(process.argv.includes('--check')){const existing=fs.readFileSync(path.join(root,'noesis/integrity.json'),'utf8');if(existing!==output){console.error('FAIL manifest drift: run node scripts/noesis_integrity.cjs to regenerate');process.exit(1)}console.log('PASS: '+records.length+' SHA-256 file digests match');}
else{fs.writeFileSync(path.join(root,'noesis/integrity.json'),output);console.log('Wrote NOESIS integrity manifest for '+records.length+' assets');}
