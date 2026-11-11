# Melanie durable research jobs — Phase 2 foundation

Additive files, not a deployed service. Existing `melanie-chat` remains unchanged.

## What is implemented
- `schema.sql`: owner-scoped durable job records with RLS, status, attempts, lease metadata, result and errors.
- `protocol.mjs`: validated submission, legal state transitions, lease expiry, retry eligibility.
- `protocol.test.mjs`: three deterministic Node tests.

## How to test
`node --test melanie/jobs/protocol.test.mjs`

## Integration sequence
1. Review schema against existing project; apply to project `gpkjvihkyectnenvnbng` only after approval.
2. Implement transactional claim with `FOR UPDATE SKIP LOCKED`, lease token, and bounded retries in trusted worker context.
3. Implement authenticated job submit/status endpoints using user-scoped database access.
4. Attach external Lean/Coq/Python/quantum runners. Do not run untrusted arbitrary code in Supabase Edge Functions.
5. Save stdout, stderr, toolchain versions, hashes and outputs as job artifacts.
6. Add job status and retry controls to existing GitHub Pages UI.
7. Test concurrent claims, expiry recovery, RLS isolation and browser disconnect before production.

## Invariants
- No API secrets in the browser.
- The client cannot mark its own job completed or overwrite another user's results.
- Workers must check lease ownership before recording results.
- Edge function wall-clock limits are not increased by this schema.
- This milestone does not claim operational resumable execution until a worker is deployed and tested.
