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
