# KARTEKEYA / E47 Quantum Core
This directory contains the standalone GitHub Pages instrument `index.html`, the original NumPy engine `kartekeya_core.py`, and the `share-card.svg` social preview.

## Local Python execution
```bash
python -m pip install numpy
python kartekeya_core.py
```
## Local interactive browser execution
```bash
python -m http.server 8000
```
Open http://localhost:8000/ in a browser. The browser interface is an independent JavaScript port of the supplied NumPy operations; it does not execute Python. The simulation uses normalized 128-component complex statevectors with the first 125 slots valid, a 47-dimensional protected subspace, K diagonal in the coupled basis, a 5×5 M2 logical qudit and a 2×11 M5 logical qubit.

### Important semantic details
- `apply_p47` projects then **renormalizes**; it is undefined as a normalized state for zero overlap, and the supplied code returns a zero vector.
- `evolve_k` applies unitary phases from K, so fidelity is unchanged by evolution alone.
- `expectation_k` may be negative because K is signed. It is not a nonnegative error measure.
- `M2` applies the per-row phase before cyclic shifting the row index; `M5` applies the selected 2×2 unitary across 11 spectator coordinates.
- The live browser controls generate unseeded random values. Python supports deterministic runs by passing a seeded NumPy Generator.

## Intertwiner laboratory
Open `intertwiner.html` for the 29-complex-dimensional collective SU(2) commutant `M5(C) ⊕ M2(C)`. The laboratory constructs the 47×47 coupled-basis matrices, explicitly computes `[U,Jz]`, `[U,J+]`, and `U†U-I`, and provides an adjustable exact spectral contraction bound. Links connect this result to the spectral theorem and the QGNN/clock interpretation; no quantum hardware or Time-repository experiment is executed by this page.

The supplied Lean/Coq fragments contain unfilled proofs/axioms, so they are structural sketches, not machine-checked certificates. The supplied QuTiP fragment constructs collective generators but does not compute the commutant residual. The 29 dimension is the complex vector-space dimension of the associative commutant, also the real dimension of its unitary group U(5)×U(2).

## QSVT spectral filter laboratory
Open [qsvt-lab.html](./qsvt-lab.html) to inspect the complete 2×2 QSP matrices with W(σ)=exp(i arccos(σ)X) and Z phase rotations, the exact degree-2 phase vector Φ₂=(½ arctan¼, arctan¼−π, ½ arctan¼), and the numerical symmetric degree-4 phase vector. The page directly recomputes the complex QSP unitary across 1001 singular values; compares Re U₀₀ to Q₂ and Q₄; and audits all seven Casimir sectors and repeated complement contraction.

Exact filter identities: Q₂(K/432)=I−K²/99144=Γ; Q₄(K/432)=(578Γ²−225I)/353. Sharp complementary factors are 15/17 and 225/353. The complex QSP amplitude alone is not a contraction at σ=1; realizing the real-part block encoding requires appropriate coherent extraction. This laboratory does not run a quantum hardware circuit or implement a physical scalar-field theory.
