-- Run as the project SQL administrator. Requires two existing anonymous users.
-- All fixtures are transaction-local and are rolled back; original rows are untouched.
begin;
select set_config('melanie.audit_owner',(select id::text from auth.users where is_anonymous order by created_at desc limit 1),true);
select set_config('melanie.audit_other',(select id::text from auth.users where is_anonymous order by created_at desc offset 1 limit 1),true);
select set_config('melanie.audit_thread',gen_random_uuid()::text,true);
set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('melanie.audit_owner'),'role','authenticated','is_anonymous',true)::text,true);
insert into public.melanie_threads(id,owner_id,title)
values (current_setting('melanie.audit_thread')::uuid,current_setting('melanie.audit_owner')::uuid,'MELANIE_AUDIT_ROLLBACK_20261013');
insert into public.melanie_messages(owner_id,thread_id,role,content) values
(current_setting('melanie.audit_owner')::uuid,current_setting('melanie.audit_thread')::uuid,'user','MELANIE_AUDIT_ROLLBACK_20261013 question'),
(current_setting('melanie.audit_owner')::uuid,current_setting('melanie.audit_thread')::uuid,'assistant','MELANIE_AUDIT_ROLLBACK_20261013 synthetic database fixture');
do $$ begin
 if (select count(*) from public.melanie_messages where thread_id=current_setting('melanie.audit_thread')::uuid) <> 2 then raise exception 'owner round-trip failed'; end if;
 if (select array_agg(role order by created_at,role desc,id) from public.melanie_messages where thread_id=current_setting('melanie.audit_thread')::uuid) <> array['user','assistant'] then raise exception 'message order failed'; end if;
end $$;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('melanie.audit_other'),'role','authenticated','is_anonymous',true)::text,true);
do $$ begin
 if exists (select 1 from public.melanie_messages where thread_id=current_setting('melanie.audit_thread')::uuid) then raise exception 'owner isolation failed'; end if;
end $$;
set local role anon;
do $$ begin
 if exists (select 1 from public.melanie_messages where thread_id=current_setting('melanie.audit_thread')::uuid) then raise exception 'unauthenticated isolation failed'; end if;
end $$;
rollback;
select 'PASS: owner round-trip, message order, other-owner isolation, unauthenticated isolation' as result,
(select count(*) from public.melanie_messages where content like 'MELANIE_AUDIT_ROLLBACK_20261013%') as test_rows_remaining;

