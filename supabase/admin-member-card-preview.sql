-- Patch 287: extend existing admin-only read with member badge selections.
DO $patch$
DECLARE current_def text; addition text;
BEGIN
 current_def := pg_get_functiondef('public.get_admin_member_card(uuid,text)'::regprocedure);
 IF position('''special_badges''' in current_def)>0 THEN RETURN; END IF;
 IF position('if not public.is_app_admin()' in current_def)=0 OR position('  return result;' in current_def)=0 THEN RAISE EXCEPTION 'Admin card context changed'; END IF;
 addition := $body$
  result := result || jsonb_build_object(
    'special_badges', coalesce((
      select jsonb_agg(jsonb_build_object('slug',b.slug,'name',b.name,'display_order',tcb.display_order) order by tcb.display_order)
      from public.trainer_card_badges tcb
      join public.user_special_badges usb on usb.user_id=tcb.user_id and usb.badge_slug=tcb.badge_slug
      join public.special_badges b on b.slug=tcb.badge_slug and b.is_active=true
      where tcb.user_id=target_user_id
    ),'[]'::jsonb),
    'gym_badges', coalesce((
      select jsonb_agg(jsonb_build_object('gym_id',g.id,'badge_name',g.badge_name,'gym_name',g.gym_name,'leader_name',g.leader_name,'badge_image_url',g.badge_image_url,'display_order',tcgb.display_order) order by tcgb.display_order)
      from public.trainer_card_gym_badges tcgb
      join public.user_gym_progress ugp on ugp.user_id=tcgb.user_id and ugp.gym_id=tcgb.gym_id and ugp.completed=true
      join public.gyms g on g.id=tcgb.gym_id and g.is_active=true
      where tcgb.user_id=target_user_id
    ),'[]'::jsonb),
    'gyms_defeated', (select count(*) from public.user_gym_progress ugp join public.gyms g on g.id=ugp.gym_id and g.is_active=true where ugp.user_id=target_user_id and ugp.completed=true)
  );
  return result;
$body$;
 EXECUTE replace(current_def,'  return result;',addition);
END $patch$;
