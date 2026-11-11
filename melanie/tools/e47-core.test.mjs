import test from 'node:test';import assert from 'node:assert/strict';
import {certificate,residualBound} from './e47-core.mjs';
test('exact representation dimensions and commutant',()=>{const c=certificate();assert.equal(c.carrier,125);assert.equal(c.selected,47);assert.equal(c.complement,78);assert.equal(c.commutant,29);assert.equal(c.pass,true)});
test('spectral contraction eigenvalues',()=>{const c=certificate();const eigen=c.spectrum.filter(x=>!x.selected).map(x=>((x.casimir-6)*(x.casimir-30))**2);assert.deepEqual(eigen,[32400,12544,11664,19600,186624]);assert.ok(Math.abs(c.contraction-15/17)<1e-12)});
test('residual bound and input validation',()=>{assert.equal(residualBound(0,2),2);assert.ok(residualBound(220)<1e-11);assert.throws(()=>residualBound(-1))});
