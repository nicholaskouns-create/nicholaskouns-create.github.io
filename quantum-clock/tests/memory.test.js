// node --test quantum-clock/tests/memory.test.js   (Node 22+, no dependencies)
//
// The Lumen memory test.
//
// Nathan Dickerson and Lumen (ChatGPT) analyzed the E47 clock comparison.
// Lumen reproduced the six-second timing discrepancy and explained why matched
// leak-and-recovery dynamics preserve the encoded qubit up to its intended
// clock rotation.  This file is the separate verification of that explanation:
// under the Lumen condition (equal branch detunings) the four-state node is an
// exact one-qubit memory, because the recovery operator carries no logical
// index and H_1 = H_0 + ω I, so an encoded state stays a product with the flag.
//
// The test stores HALF OF AN ENTANGLED PAIR, which is the sharp version:
// a channel can preserve every single-qubit state and still destroy
// entanglement, so surviving negativity is the stronger claim.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reduced, detunings, isLumenCondition, liouvillian, vecOf, unvec } from '../engine/node.js';
import { cmat, ckron, ceye, cmul, cadj, cexpm, cscale } from '../engine/linalg.js';

const P = { omega: 2, c: 1, gamma: 20 };
const BELL_NEGATIVITY = 0.5;

// ancilla ⊗ node, index 4a + 2l + f
function extend(X) { return ckron(ceye(2), X); }

function bellRho() {
  const psi = cmat(8, 1); psi.re[0] = Math.SQRT1_2; psi.re[6] = Math.SQRT1_2;   // |a0,l0,f0> + |a1,l1,f0>
  return cmul(psi, cadj(psi));
}

/** undo the known clock rotation: e^{+iωt} on logical l = 1 */
function unwind(t, omega) {
  const U = cmat(8);
  for (let a = 0; a < 2; a++) for (let l = 0; l < 2; l++) for (let f = 0; f < 2; f++) {
    const k = 4 * a + 2 * l + f, th = l * omega * t;
    U.re[k * 8 + k] = Math.cos(th); U.im[k * 8 + k] = Math.sin(th);
  }
  return U;
}

/** trace out the flag -> 4x4 on ancilla ⊗ logical */
function traceFlag(rho) {
  const r = cmat(4);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    for (let f = 0; f < 2; f++) {
      const I = 2 * i + f, J = 2 * j + f;
      r.re[i * 4 + j] += rho.re[I * 8 + J]; r.im[i * 4 + j] += rho.im[I * 8 + J];
    }
  }
  return r;
}

/** negativity under partial transpose on the logical qubit */
function negativity(r) {
  const T = cmat(4);
  for (let a = 0; a < 2; a++) for (let l = 0; l < 2; l++) for (let b = 0; b < 2; b++) for (let m = 0; m < 2; m++) {
    const src = (2 * a + l) * 4 + (2 * b + m), dst = (2 * a + m) * 4 + (2 * b + l);
    T.re[dst] = r.re[src]; T.im[dst] = r.im[src];
  }
  // 4x4 Hermitian eigenvalues by Jacobi on the real symmetric embedding of the Hermitian part
  const A = []; for (let i = 0; i < 4; i++) { A.push([]); for (let j = 0; j < 4; j++) A[i].push((T.re[i * 4 + j] + T.re[j * 4 + i]) / 2); }
  for (let s = 0; s < 200; s++) {
    let p = 0, q = 1, big = 0;
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (Math.abs(A[i][j]) > big) { big = Math.abs(A[i][j]); p = i; q = j; }
    if (big < 1e-14) break;
    const th = 0.5 * Math.atan2(2 * A[p][q], A[q][q] - A[p][p]), cs = Math.cos(th), sn = Math.sin(th);
    for (let k = 0; k < 4; k++) { const ap = A[p][k] * cs - A[q][k] * sn, aq = A[p][k] * sn + A[q][k] * cs; A[p][k] = ap; A[q][k] = aq; }
    for (let k = 0; k < 4; k++) { const ap = A[k][p] * cs - A[k][q] * sn, aq = A[k][p] * sn + A[k][q] * cs; A[k][p] = ap; A[k][q] = aq; }
  }
  let n = 0; for (let i = 0; i < 4; i++) if (A[i][i] < 0) n -= A[i][i];
  return n;
}

function storeAndRecover(clock, t) {
  const { H, R } = reduced({ ...P, clock });
  const Lv = liouvillian(extend(H), [extend(R)]);
  const rho = unvec(cmul(cexpm(cscale(Lv, t)), vecOf(bellRho())), 8);   // cexpm takes one argument
  const U = unwind(t, P.omega);
  const rc = cmul(U, cmul(rho, cadj(U)));
  const rAL = traceFlag(rc);
  const fidelity = 0.5 * (rAL.re[0] + rAL.re[15]) + rAL.re[3];   // <Bell|rho|Bell>
  const retention = rc.re[0] + rc.re[2 * 8 + 2] + rc.re[4 * 8 + 4] + rc.re[6 * 8 + 6];
  return { fidelity, negativity: negativity(rAL), retention };
}

test('the Lumen condition holds for the lumen clock and fails for the linear one', () => {
  assert.ok(isLumenCondition(P.omega, 'lumen'));
  assert.ok(!isLumenCondition(P.omega, 'linear'));
  const [la, lb] = detunings(P.omega, 'lumen'), [na, nb] = detunings(P.omega, 'linear');
  assert.ok(Math.abs(la - lb) < 1e-12, `lumen detunings differ: ${la} ${lb}`);
  assert.ok(Math.abs(na - nb) > 0.1, `linear detunings should differ: ${na} ${nb}`);
});

test('Lumen memory: half a Bell pair is returned exactly, at every storage time', () => {
  for (const t of [0.5, 1, 2, 5, 10, 25]) {
    const r = storeAndRecover('lumen', t);
    assert.ok(Math.abs(r.fidelity - 1) < 1e-9, `t=${t}: fidelity ${r.fidelity}`);
    assert.ok(Math.abs(r.negativity - BELL_NEGATIVITY) < 1e-9, `t=${t}: negativity ${r.negativity}`);
  }
});

test('the linear clock loses entanglement, and loses more the longer it stores', () => {
  const a = storeAndRecover('linear', 1), b = storeAndRecover('linear', 25);
  assert.ok(a.negativity < BELL_NEGATIVITY - 1e-6, `no loss at t=1: ${a.negativity}`);
  assert.ok(b.negativity < a.negativity, `loss should grow: ${a.negativity} -> ${b.negativity}`);
});

test('the inversion, at the level of stored information: more retention, worse memory', () => {
  const lum = storeAndRecover('lumen', 25), lin = storeAndRecover('linear', 25);
  assert.ok(lin.retention > lum.retention,
    `linear should retain more: ${lin.retention} vs ${lum.retention}`);
  assert.ok(lin.negativity < lum.negativity,
    `and still hold less entanglement: ${lin.negativity} vs ${lum.negativity}`);
});

test('retention matches the engine closed form 4c²/(γ²+8c²+4δ²)', () => {
  const leak = (c, g, d) => 4 * c * c / (g * g + 8 * c * c + 4 * d * d);
  const { c, gamma } = P;
  const lum = storeAndRecover('lumen', 25);
  assert.ok(Math.abs(lum.retention - (1 - leak(c, gamma, 0.5))) < 1e-6, `lumen ${lum.retention}`);
  const lin = storeAndRecover('linear', 25);
  const predicted = 1 - 0.5 * (leak(c, gamma, 0.5) + leak(c, gamma, 1));
  assert.ok(Math.abs(lin.retention - predicted) < 1e-6, `linear ${lin.retention} vs ${predicted}`);
});
