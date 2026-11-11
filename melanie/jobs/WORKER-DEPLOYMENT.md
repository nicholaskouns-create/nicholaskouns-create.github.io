# Melanie Phase 3 — transactional worker
1. Apply `melanie/jobs/schema.sql` if not already applied, then `worker-rpc.sql` in the existing Supabase project. Review with SQL advisors and test RLS first.
2. Configure GitHub Actions secrets `MELANIE_SUPABASE_URL` and `MELANIE_SUPABASE_SERVICE_ROLE_KEY` in repository settings. Never commit service role credentials.
3. Workflow runs every five minutes or manually; one job per invocation. A 90-second lease allows recovery from interrupted workers.
4. Run `node --test melanie/tools/e47-core.test.mjs melanie/jobs/protocol.test.mjs melanie/jobs/worker.test.mjs`.
5. Submit a job via authenticated database client: `insert into melanie_research_jobs(owner_id,kind,payload) values(auth.uid(),'e47_certificate','{}')`. Verify completion via owner-scoped SELECT.
6. Lean4, Coq, Python and quantum job kinds are reserved but deliberately fail with explicit status until isolated execution adapters are implemented.
7. The current workflow is NOT a guarantee of immediate execution: GitHub scheduled workflows may be delayed or skipped. Long-running jobs require a dedicated worker or queue.
8. Worker finish uses lease-token compare-and-swap. A stale worker cannot overwrite the result of a reclaimed job.
Production state: files prepared, NOT deployed, secrets and schema unverified.
