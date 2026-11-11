-- Melanie durable jobs: additive SQL, apply to existing Supabase project after review.
create table if not exists public.melanie_research_jobs (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check (kind in ('e47_certificate','lean4','coq','python','quantum')),
 payload jsonb not null default '{}'::jsonb,
 state text not null default 'queued' check (state in ('queued','running','completed','failed','cancelled')),
 attempts integer not null default 0 check (attempts >= 0),
 max_attempts integer not null default 3 check (max_attempts between 1 and 20),
 lease_token uuid,
 leased_until timestamptz,
 result jsonb,
 error text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 completed_at timestamptz,
 constraint payload_object check (jsonb_typeof(payload)='object')
);
create index if not exists melanie_jobs_owner_created on public.melanie_research_jobs(owner_id,created_at desc);
create index if not exists melanie_jobs_claimable on public.melanie_research_jobs(state,leased_until,created_at);
alter table public.melanie_research_jobs enable row level security;
create policy "melanie_jobs_owner_select" on public.melanie_research_jobs for select to authenticated using ((select auth.uid())=owner_id);
create policy "melanie_jobs_owner_insert" on public.melanie_research_jobs for insert to authenticated with check ((select auth.uid())=owner_id and state='queued' and attempts=0 and lease_token is null and leased_until is null and result is null);
-- No client UPDATE/DELETE: only trusted workers may transition states.
revoke update,delete on public.melanie_research_jobs from anon,authenticated;
grant select,insert on public.melanie_research_jobs to authenticated;
-- Claiming and completion should be implemented by a trusted worker using a
-- database transaction with FOR UPDATE SKIP LOCKED and a unique lease token.
-- Do not expose service-role credentials or job transition functions to browsers.
