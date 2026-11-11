import test from 'node:test';import assert from 'node:assert/strict';
import {executeJob,processOnce} from './worker.mjs';
test('certificate produces exact sector counts',()=>{const r=executeJob({kind:'e47_certificate'});assert.equal(r.certificate.selected,47);assert.equal(r.certificate.commutant,29);assert.equal(r.verified,true)});
test('unimplemented runner fails explicitly',()=>assert.throws(()=>executeJob({kind:'lean4'}),/No executable runner/));
test('worker commits with lease token',async()=>{let saved;const api={claim:async()=>({id:'a',lease_token:'secret',kind:'e47_certificate'}),finish:async(...args)=>saved=args,fail:async()=>assert.fail()};const r=await processOnce(api);assert.equal(r.status,'completed');assert.equal(saved[1],'secret');assert.equal(saved[2].certificate.carrier,125)});
test('failure is persisted',async()=>{let error;const api={claim:async()=>({id:'a',lease_token:'t',kind:'coq'}),finish:async()=>assert.fail(),fail:async(_id,_lease,e)=>error=e};const r=await processOnce(api);assert.equal(r.status,'failed');assert.match(error,/No executable runner/)});
