-- Trusted worker transitions. Apply AFTER jobs/schema.sql.
-- Public schema RPC functions are callable only by service_role; never expose service key to browsers.
create or replace function public.melanie_worker_claim()
returns setof public.melanie_research_jobs
language plpgsql security definer set search_path = ''
as $$
declare chosen uuid;
begin
 select j.id into chosen from public.melanie_research_jobs j
 where (j.state='queued' or (j.state='running' and j.leased_until < now()))
 and j.attempts < j.max_attempts
 order by j.created_at for update skip locked limit 1;
 if chosen is null then return;end if;
 return query update public.melanie_research_jobs j
 set state='running',attempts=j.attempts+1,lease_token=gen_random_uuid(),
 leased_until=now()+interval '90 seconds',updated_at=now()
 where j.id=chosen returning j.*;
end $$;
create or replace function public.melanie_worker_finish(p_id uuid,p_token uuid,p_result jsonb,p_error text default null)
returns boolean language plpgsql security definer set search_path=''
as $$
begin
 update public.melanie_research_jobs set
 state=case when p_error is null then 'completed' else 'failed' end,
 result=case when p_error is null then p_result else null end,
 error=left(p_error,2000),leased_until=null,lease_token=null,
 updated_at=now(),completed_at=now()
 where id=p_id and state='running' and lease_token=p_token and leased_until>now();
 return found;
end $$;
revoke all on function public.melanie_worker_claim() from public,anon,authenticated;
revoke all on function public.melanie_worker_finish(uuid,uuid,jsonb,text) from public,anon,authenticated;
grant execute on function public.melanie_worker_claim() to service_role;
grant execute on function public.melanie_worker_finish(uuid,uuid,jsonb,text) to service_role;
