# NOESIS Defensive Preservation Architecture · v0.1

## Actual components
- `sentinel.html`: browser-based read-only SHA-256 integrity scan, exportable observation receipts, optional authenticated-baseline comparison.
- `scripts/noesis_integrity.cjs`: deterministic content manifest generator and drift-check mode for local/CI use. It does not automatically publish a signed baseline.
- FlowShield: existing independent policy-analysis and authorization laboratory.
- Quantum Clock: quantum clock with phase-based elapsed-time readout. The Sentinel's `phase_mod_47` is an illustrative public clock annotation calculated from Unix time, **not** a measurement of the Quantum Clock's internal phase and not cryptographic entropy.

## Threat model
Protect against unnoticed public artifact mutation, authority confusion, untrusted instruction promotion, and accidental loss of provenance. This browser tool does **not** prevent a compromised GitHub account, compromised deployment, or malicious origin from serving altered source and a matching altered baseline.

## Evidence and cryptography
1. SHA-256 authenticates *content equality* only against an independently trusted baseline. It is not a signature or tamper-proof log.
2. Git commit SHAs and pinned source revisions establish traceability but not authorship without independently verified signatures.
3. Post-quantum authenticity should use **NIST ML-DSA (FIPS 204)** or **SLH-DSA (FIPS 205)** in a separately reviewed signing pipeline, with public verification keys anchored outside the Pages origin.
4. **ML-KEM (FIPS 203)** is a key-establishment mechanism, not a digital signature and not an integrity-hash replacement.
5. Do not derive private keys, nonces, passwords or randomness from public/deterministic quantum-clock periods, the 47-cycle, timestamps, or E47 eigenvalues.
6. Use operating-system CSPRNGs, key isolation, verified implementation dependencies, version pinning, and independent signature verification.
7. Never embed a private signing key in GitHub Pages or browser JavaScript.

## Deployment model
A future independent CI attestation job may hash a pinned release, sign the manifest with a protected ML-DSA signing key, and publish the signature plus certificate chain. Clients must verify the public key from an independently trusted channel, not the same potentially compromised origin.

## Known limits
The current Sentinel is an *observation and comparison tool*, not a real-time server monitor, post-quantum signature service, or tamper-proof store. Browser clocks can be manipulated. Network responses can change between scans. A browser scan does not attest to the remote repository's security.

## Preservation rule
Never rewrite or replace the Time, E47, FlowShield, Jekyll, or NOESIS source of authority to make a cryptographic claim. Add reviewed, independently testable components instead.
