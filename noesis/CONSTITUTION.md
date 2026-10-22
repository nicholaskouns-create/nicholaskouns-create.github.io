# NOESIS · Institutional Constitution (v0.1)

**Status:** founding policy proposal. Publication does not imply legal accreditation or scientific certification.

## Mission
Maintain a public, reproducible, revisable research record that distinguishes observations, hypotheses, derivations, simulations, and independently reproducible results.

## Evidence classes
- **E0**: exact mathematical derivation with inspectable assumptions and proof.
- **E1**: executable computational validation with pinned inputs, code, and output.
- **E2**: numerical simulation with specified model and numerical limits.
- **E3**: empirical observation with documented source, measurement and uncertainty.
- **H**: hypothesis, proposal, or claim not yet validated.

An evidence class describes the **support for a particular claim**, not an endorsement of an entire laboratory. Registry-level tags are provisional discovery metadata and must not be interpreted as per-claim certification.

## Publication protocol
1. Preserve the original claim and source reference.
2. Declare the evidence class, assumptions, and testable predictions.
3. Link immutable source revisions and input/output digests when available.
4. Record independent validation, failed checks, and open obligations.
5. Publish amendments as new versions; retain prior records.
6. Separate machine suggestions from accepted human-reviewed conclusions.

## Agent authority
Autonomous agents may draft, search public sources, simulate, and propose tests. They may not silently promote a hypothesis to a theorem, erase evidence, publish secrets, change deployment settings, or modify protected instruments without separately authorized review.

## Architecture
Jekyll is the publishing and indexing layer. The registry is public JSON. Browser workers, CI, and authenticated services may run validators. A public page is never a credential vault. No cross-platform service is treated as connected until its own authenticated adapter is implemented and tested.

## Preservation
The existing Mathematical City Jekyll configuration, publishing workflow, sites, and independent repositories remain authoritative. NOESIS is additive and reversible.

## Current boundary
The first release contains a static atlas and registry plus source-controlled validation scripts. Continuous autonomous research, external ingestion, signed receipts, scientific peer review, and authenticated distributed execution are **not yet implemented**.
