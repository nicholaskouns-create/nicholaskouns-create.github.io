---
layout: default
title: Authorization Invariant Discovery
---

# Authorization Invariant Discovery

**Discovery date: 8 October 2026**

## Core theorem

A privileged action is authorized only when the grant is bound to the requesting principal, task, tool, exact arguments, validity window, and a fresh one-shot nonce.

\[
\mathrm{Invoke}\Rightarrow
\mathrm{BoundPrincipal}\land
\mathrm{BoundTask}\land
\mathrm{BoundTool}\land
\mathrm{BoundArgs}\land
\mathrm{Fresh}\land
\mathrm{ActivePrincipal}.
\]

On successful invocation the nonce is consumed, so replay is rejected.

## Confused-deputy consequence

A persisted prefix, cached approval, or reusable allow rule is not sufficient authority for a later request when requester, task, arguments, freshness, or principal state differ.

## Executable result

Reference-model validation: **16/16 PASS**.

The suite covers valid invocation, replay rejection, cross-task reuse, cross-principal access, inactive principals, tool mismatch, argument/content substitution, expiry, pre-issued use, signature tampering, strict boolean evidence semantics, and the distinction between a valid signature and invocation authority.

## Evidence boundary

The executable is a reference invariant model. Direct upstream regression remains a separate evidence layer.

- OpenAI Codex public source inspected 2026-10-08 contains `persist_execpolicy_amendment`, documented to persist approved prefixes for future commands.
- Sovereign Veritas issue #4 records the earlier `sv.gate/0` authorization/evidence-binding defects and proposed additive repair.
- NVIDIA NeMo direct upstream regression was not established in the prior execution pass.

## Source routes

- [Authorization kernel repository](https://github.com/nicholaskouns-create/auth-kernel)
- [E47 / Mathematical City security record](https://github.com/nicholaskouns-create/E47-Kartekeya/blob/main/research/security/AUTHORIZATION_INVARIANT_DISCOVERY_20261008.md)
- [OpenAI Codex issue #52286](https://github.com/openai/codex/issues/52286)
- [Sovereign Veritas issue #4](https://github.com/holland202/sovereign-veritas/issues/4)
