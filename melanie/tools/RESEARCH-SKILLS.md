# Melanie ∞ — Research skills and execution plan

This is an additive upgrade to the existing GitHub Pages / Supabase application. No existing production file is replaced.

## Implemented instrument: E47 exact spectral certificate
- `e47-core.mjs` computes spin-sector dimensions, selected rank 47, commutant dimension 29, the exact discrete step, and spectral contraction bound.
- `node --test melanie/tools/e47-core.test.mjs` runs three deterministic tests.
- This verifies arithmetic from the specified representation multiplicities, not a full matrix diagonalization or Lean proof.

## Next independent skills (not yet implemented)
1. **Proof Forge:** submit Lean/Coq jobs to a durable external runner; capture compiler version, stdout/stderr, exit code and artifact SHA.
2. **Research Jobs:** persist queued/running/completed/failed states and checkpoints; lease jobs to workers and recover expired leases.
3. **Evidence Atlas:** attach provenance and evidence categories to theorem, computation, simulation and conjecture records.
4. **Quantum Laboratory:** execute Qiskit/QuTiP jobs on an external compute worker and store reproducible receipts.
5. **Memory Retrieval:** improve owner-scoped archival search without changing existing transcripts.
6. **Provider Routing:** prefer xAI when configured; allow an explicit fallback, not silent OpenAI priority.

## Capacity
Supabase Edge Functions are bounded by platform CPU, memory and wall-clock limits. Heavy Lean/Coq/Python jobs must execute in a separate worker; Edge can coordinate, authenticate, and persist job state. Never place provider keys in GitHub Pages.

## Production status
Not deployed. The existing Melanie application and Supabase function remain unchanged. This branch is a reviewable foundation for further work.
