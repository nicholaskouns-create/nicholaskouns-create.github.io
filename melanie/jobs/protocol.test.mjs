import test from 'node:test';import assert from 'node:assert/strict';
import {validateSubmission,nextState,leaseExpired,retryable} from './protocol.mjs';
test('accepts supported jobs and rejects malformed input',()=>{assert.equal(validateSubmission({kind:'lean4',payload:{theorem:'x'}}).kind,'lean4');assert.throws(()=>validateSubmission({kind:'shell',payload:{}}));assert.throws(()=>validateSubmission({kind:'coq',payload:[]}))});
test('legal transitions',()=>{assert.equal(nextState('queued','claim'),'running');assert.equal(nextState('running','complete'),'completed');assert.equal(nextState('running','retry'),'queued');assert.throws(()=>nextState('completed','claim'))});
test('lease expiry and attempt limits',()=>{const j={state:'running',leased_until:'2020-01-01T00:00:00Z',attempts:1,max_attempts:3};assert.equal(leaseExpired(j,new Date('2026-01-01')),true);assert.equal(retryable(j),true);assert.equal(retryable({...j,attempts:3}),false)});
