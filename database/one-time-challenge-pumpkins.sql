create schema if not exists rf_internal;
revoke all on schema rf_internal from public,anon;
grant usage on schema rf_internal to authenticated;

create or replace function rf_internal.roll_challenge_pumpkin(p_site_area text,p_navigation_type text)
returns table(spawned boolean,spawn_key text,collectible_key text,display_name text,asset_path text,rarity text,expires_at timestamptz,cooldown_seconds integer)
language plpgsql security definer set search_path=''
as $function$
declare
  v_user uuid:=auth.uid();
  v_site text:=lower(btrim(coalesce(p_site_area,'')));
  v_request public.rf_event_spawn_state%rowtype;
  v_catalog public.rf_collectible_catalog%rowtype;
  v_key text;
  v_expires timestamptz;
begin
  if v_user is null then raise exception 'Sign in required'; end if;
  if v_site not in ('pokemon','dino') then raise exception 'Unknown challenge'; end if;
  if public.is_app_admin()
     and now()<('2026-11-01 00:00:00'::timestamp at time zone 'America/Chicago')
     and not coalesce((select enabled from public.rf_test_modes where area='main-hub'),false) then
    -- Lock the normal claim state before the preview request, consistently across sites.
    insert into public.rf_event_spawn_state(event_key,user_id,updated_at)
      values('pumpkin-hunt-2026',v_user,now()) on conflict(event_key,user_id) do nothing;
    perform 1 from public.rf_event_spawn_state
      where event_key='pumpkin-hunt-2026' and user_id=v_user for update;
    select * into v_request from public.rf_event_spawn_state
      where event_key='pumpkin-hunt-2026:preview:'||v_site and user_id=v_user for update;
    if v_request.active_spawn_key is not null and v_request.active_expires_at>now() then
      select * into v_catalog from public.rf_collectible_catalog c
        where c.collectible_key=v_request.active_collectible_key
        and c.event_key='pumpkin-hunt-2026' and c.active and c.rarity='regular';
      if found then
        v_key:=gen_random_uuid()::text;
        v_expires:=now()+interval '2 minutes';
        update public.rf_event_spawn_state
          set active_spawn_key=null,active_collectible_key=null,active_expires_at=null,updated_at=now()
          where event_key='pumpkin-hunt-2026:preview:'||v_site and user_id=v_user;
        update public.rf_event_spawn_state
          set active_spawn_key=v_key,active_collectible_key=v_catalog.collectible_key,
          active_expires_at=v_expires,last_spawn_at=now(),last_browse_roll_at=now(),updated_at=now()
          where event_key='pumpkin-hunt-2026' and user_id=v_user;
        return query select true,v_key,v_catalog.collectible_key,v_catalog.display_name,
          v_catalog.asset_path,v_catalog.rarity,v_expires,10;
        return;
      end if;
    end if;
  end if;
  return query select * from public.roll_rf_pumpkin_browse_spawn(p_navigation_type);
end;
$function$;
revoke all on function rf_internal.roll_challenge_pumpkin(text,text) from public,anon;
grant execute on function rf_internal.roll_challenge_pumpkin(text,text) to authenticated;

create or replace function public.roll_rf_challenge_pumpkin_browse_spawn(p_site_area text,p_navigation_type text)
returns table(spawned boolean,spawn_key text,collectible_key text,display_name text,asset_path text,rarity text,expires_at timestamptz,cooldown_seconds integer)
language sql security invoker set search_path=''
as $function$
  select * from rf_internal.roll_challenge_pumpkin(p_site_area,p_navigation_type);
$function$;
revoke all on function public.roll_rf_challenge_pumpkin_browse_spawn(text,text) from public,anon;
grant execute on function public.roll_rf_challenge_pumpkin_browse_spawn(text,text) to authenticated;
