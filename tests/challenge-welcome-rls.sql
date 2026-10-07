-- Run with psql; all fixture rows and schema changes roll back.
begin;
\ir ../sql/rf-challenge-welcome.sql

select set_config('rf.test_owner',(select id::text from auth.users order by id limit 1),true);
select set_config('rf.test_other',(select id::text from auth.users order by id offset 1 limit 1),true);
insert into public.rf_challenge_welcome_dismissals(user_id,challenge_key) values(current_setting('rf.test_other')::uuid,'pokemon');
select set_config('request.jwt.claim.sub',current_setting('rf.test_owner'),true);
set local role authenticated;
insert into public.rf_challenge_welcome_dismissals(user_id,challenge_key) values(auth.uid(),'pokemon'),(auth.uid(),'museum');
insert into public.rf_challenge_welcome_dismissals(user_id,challenge_key) values(auth.uid(),'pokemon') on conflict do nothing;
do $test$
begin
 if (select count(*) from public.rf_challenge_welcome_dismissals) <> 2 then raise exception 'Owner read or separate challenge check failed'; end if;
 begin
  insert into public.rf_challenge_welcome_dismissals(user_id,challenge_key) values(current_setting('rf.test_other')::uuid,'museum');
  raise exception 'Cross-user insertion was permitted';
 exception when insufficient_privilege then null; end;
 begin
  update public.rf_challenge_welcome_dismissals set user_id=current_setting('rf.test_other')::uuid;
  raise exception 'Update was permitted';
 exception when insufficient_privilege then null; end;
 begin
  delete from public.rf_challenge_welcome_dismissals;
  raise exception 'Delete was permitted';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.rf_challenge_welcome_dismissals(user_id,challenge_key) values(auth.uid(),'unsupported');
  raise exception 'Unsupported challenge permitted';
 exception when check_violation then null; end;
end $test$;
set local role anon;
do $test$
begin
 begin
  perform * from public.rf_challenge_welcome_dismissals;
  raise exception 'Anonymous read permitted';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.rf_challenge_welcome_dismissals(user_id,challenge_key) values(current_setting('rf.test_owner')::uuid,'museum');
  raise exception 'Anonymous insert permitted';
 exception when insufficient_privilege then null; end;
end $test$;
reset role;
select 'Owner reads/inserts, cross-user isolation, separate challenges, duplicate safety, invalid challenge, update/delete/anonymous denial passed; transaction rolled back' as result;
rollback;
