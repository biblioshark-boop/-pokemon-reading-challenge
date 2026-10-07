-- Apply once before merging the two welcome-popup branches.
create table public.rf_challenge_welcome_dismissals (
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_key text not null check (challenge_key in ('pokemon','museum')),
  dismissed_at timestamptz not null default now(),
  primary key (user_id, challenge_key)
);
alter table public.rf_challenge_welcome_dismissals enable row level security;
revoke all on public.rf_challenge_welcome_dismissals from public, anon, authenticated;
grant select, insert on public.rf_challenge_welcome_dismissals to authenticated;
create policy "Read own challenge welcome dismissal"
  on public.rf_challenge_welcome_dismissals for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Dismiss own challenge welcome"
  on public.rf_challenge_welcome_dismissals for insert to authenticated
  with check ((select auth.uid()) = user_id);
