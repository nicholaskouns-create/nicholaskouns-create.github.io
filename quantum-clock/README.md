# The Quantum Clock

**Live:** <https://nicholaskouns-create.github.io/quantum-clock/>

A qubit held inside the protected 47-dimensional sector of V₂⊗V₂⊗V₂. Its hand
is the phase between the Casimir sectors C = 6 and C = 30, it reads its own
proper time, it keeps that time exactly while recovery pulls every leak back,
and clocks on different worldlines drift apart by exactly (N₁ − N₂)ω.

Precision certificate `MC-QCLOCK-PRECISION-20261019-001`: **48/48 PASS**, run in
the browser on every page load, in the test suite, and in GitHub Actions.

## What it is built from

| formalism | where |
|---|---|
| V₂⊗³, C, K = (C − 6I)(C − 30I), E47, P47, Γ = I − K²/99144, ‖Γⁿ − P‖ = (15/17)ⁿ | E47-Kartekeya canonical core |
| Kernel-aligned decoherence-free Lindblad theorem, protected readout, gap 11664 | Drive: *Clock Math — First-Principles Lindblad Proof* |
| Prime 47-cycle, torus clock, joint period 235, synchronised spatial kernel | Notion: *Prime Clock and Synchronized Kernel Dynamics* |
| z ↦ z² mod 5875 (period 220), U = Γ ⊗ T | MC-E47-MODSYNC-20261015-001 |
| dτ = ψ_C dt ⇒ d/dτ = ψ_C⁻¹ d/dt | ARR-C005 Time-Chain Identity (C0-TIME-CHAIN) |
| g = B4†(P6 − P0)B4 = diag(−1, 2, 8, 2), lapse N | MC-E47-SPACETIME-PRIMA-FACIE-26-20260924 |
| Clock-memory node, matched and linear clocks, recovery statistics, TQGNN | *Time, Protected Memory, and E47* and the TQGNN reference |
| Radix dialects of one phase | Drive: *Clock-Based Mathematics* |
| City state receipts | THE MATRIX — Quantum Simulator |

## The construction

- **Node.** |a⟩ = pair singlet ⊗ |m₃ = 0⟩ (C = 6), |b⟩ = P₃₀|38⟩ (C = 30),
  syndromes |a′⟩ = P₁₂|38⟩, |b′⟩ = P₄₂|38⟩. H = f(C) + c(WV† + VW†),
  R = √γ VW†. The 125-dim generator restricts exactly to 4 dimensions.
- **Clock.** Linear f = ωC/24 ticks at ω inside E47, but only (6, 30) has
  Casimir gap 24, so leak and recovery see different detunings for |a⟩ and
  |b⟩ and dephase it. The matched clock moves f(42) to f(12) + ω; then the
  coherence obeys κ(τ) = e^(−iωτ)κ(0) exactly, through every click.
- **Ticks.** Recovery clicks are sub-Poissonian, F = 1 − 24c²γ²/(γ² + 8c²)²;
  efficiency η thins them to F_η = 1 + η(F − 1). At η = 0 the monitored clock
  is the deterministic one.
- **Network.** H_t = Σ N_v H_v + Σ N_e H_e, L_{v,t} = √N_v R_v, with QGNN
  exchange and Ising edges. Lapses are recovered from the clock phases.
- **Matrix bridge.** |0⟩ ↦ |b⟩, |1⟩ ↦ |a⟩. One forward tick ωτ = π/4 is the
  Matrix T gate, exactly, under leak and recovery.

## Run

```
node --test quantum-clock/tests/engine.test.js          # 10 tests, includes the certificate
node quantum-clock/tools/qclock-cli.js certificate      # writes data/certificate.json
node quantum-clock/tools/qclock-cli.js sweep --param gamma --from 2 --to 60 --steps 30 --csv
node quantum-clock/tools/qclock-cli.js run --tau 50 --clock linear --gamma 10
node quantum-clock/tools/qclock-cli.js verify-receipt matrix-quantum-receipt.json
python quantum-clock/tools/golden.py --tqgnn path/to/Time   # regenerate the Python reference values
```

No dependencies: Node 22 and a browser. To view locally, serve the repository
root (`python -m http.server`) and open `/quantum-clock/`.

## Layout

```
index.html, app.js, ui.js     the page
worker.js                     the certificate, off the main thread
engine/linalg.js              dense real and complex linear algebra, Padé-13 expm, Jacobi eigen
engine/carrier.js             V2⊗3, Casimir graph, projector, pullback metric, lapse
engine/node.js                the clock-memory node, Liouvillian, counting statistics, closed forms
engine/sim.js                 the running clock (exact propagators, monitored runs)
engine/network.js             TQGNN networks, Taylor propagation, trajectories
engine/clocks.js              prime clock, torus clock, synchronisation clock, radix dialects
engine/receipt.js             Matrix receipts: digest, replay in both orders, clock-tick export
engine/certificate.js         the 48 checks
engine/automate.js            sweeps, CSV, permalinks
data/golden.json              Python TQGNN reference values (exact expm propagation)
data/certificate.json         the committed certificate
audit/                        precision audit of both Matrix implementations
```

## Credits

E47 framework and kernel: Nicholas Shane Kouns. Clock construction, engine and
instrument: Claude (Anthropic), 19 October 2026. CC BY 4.0, as the rest of this
repository. Quantum clock construction with phase-based elapsed-time readout, validated in mathematics and numerical quantum simulation. Laboratory hardware realization and calibration to physical seconds remain open.
