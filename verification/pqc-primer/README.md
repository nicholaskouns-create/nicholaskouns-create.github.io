# PQC Primer — First-Principles Verification

Self-contained verifier for the claims in
[`flowshield-pqc-primer.html`](../../flowshield-pqc-primer.html)
(*Error-Corrected Post-Quantum Cryptography Primer*, Unicode Canonical Edition,
source text 20 November 2026).

```
python3 verify_pqc_primer.py --json pqc_primer_certificate.json
```

**Status: 60 / 60 checks pass.** Python 3.13.18, NumPy 2.5.3.
Certificate SHA-256: `f8f3a82ab0f4421dd69a037636e911e371dcc840bb66b8d2a14db7abb3d68f01`

## What is checked

| § | Claim verified | Tier |
|---|---|---|
| 1 | spin-2 cube Casimir spectrum {0,2,6,12,20,30,42}, multiplicities (1,9,25,28,27,22,13), μ=18 / σ=12, degree-six projector P₄₇ against the spectral projector, SU(2) and S₃ commutation, exact 𝔽_q rank 47 for q ∈ {43,47,53,101} | E0 |
| 2 | K² gap 11 664, max 186 624, ratio 16, ε\* = 1/99 144, ρ\* = 15/17 as an equality, semigroup rate, buoy dichotomy for all ε < 54 | E0 |
| 3 | keyed conjugation P_σ, exact noise-annihilation recovery, and the constructive public-projector no-go | E0 / COND |
| 4 | both NTT profiles — primality, order of ζ, modular inverses, full NTT/INTT round-trip and cyclic-convolution spot checks — plus rejection of (N=1024, q=3329) | E0 / E1 |
| 5 | threshold Ring-LWE worst-case noise certificate, flooding, correctness margins at N ∈ {2,5,100}, statistical distance < 2⁻⁴⁰ | E1 |
| 6 | SHOE dual-residual fail-closed gate, Babylonian scalar lock and Q2.30 error, bus framing 1 504 b / 8 beats and 4 000 b / 21 beats | E0 / E1 |
| 7 | CP-TNI and CPTP channel properties of ℳ_P, ℳ_t, 𝒟_P and the reset channel; 7-qubit embedding 128 = 47 + 81 | E2 |

## What is not checked

Asymptotic MLWE / RLWE hardness, fabricated silicon timing or PPA closure,
and physical quantum-hardware execution. These are outside the reach of a
finite-dimensional numerical suite by construction, and §7 of the primer
states them as non-implications.

## Note on §2.2

The interleaved-drift test builds its unitary block-diagonally on
E₄₇ ⊕ Q₇₈, so the `(15/17)ⁿ` bound is verified for drift commuting with
P₄₇. For a unitary that does not commute with P₄₇ the limit is still
P₄₇ but the rate degrades (observed ≈ 0.925 per step), so the bound
should be read with the covariance hypothesis the test already assumes.
