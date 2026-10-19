begin;

-- ============================================================
-- IdőpontNeked.hu — schema_v24: munkatársankénti naptár-link
-- ============================================================

-- Minden munkatárs saját, titkos naptár-linket kap, ami csak az ő
-- foglalásait tartalmazza — így a munkatárs a saját naptárába
-- feliratkozhat anélkül, hogy a többiek foglalásait látná. A szolgáltató
-- összesítő linkje (providers.ics_token) változatlanul megmarad.
alter table public.staff_members
  add column if not exists ics_token uuid not null default gen_random_uuid();

create unique index if not exists staff_members_ics_token_key on public.staff_members (ics_token);

-- Egyetlen végpont mindkét link-típushoz: a token alapján eldönti, hogy
-- a szolgáltató összesítő naptáráról vagy egy munkatárs saját naptáráról
-- van-e szó. A szolgáltató "vendégadatok elrejtése" beállítása mindkettőre
-- érvényes. Ismeretlen tokenre NULL-t ad (a route 404-et válaszol).
create or replace function public.get_ics_feed(p_token uuid)
returns json
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_provider_id uuid;
  v_staff_id uuid;
  v_name text;
  v_hide boolean;
  v_multi boolean;
begin
  select p.id, p.business_name, p.ics_hide_customer
    into v_provider_id, v_name, v_hide
    from public.providers p
    where p.ics_token = p_token;

  if v_provider_id is null then
    select m.provider_id, m.id, m.name, p.ics_hide_customer
      into v_provider_id, v_staff_id, v_name, v_hide
      from public.staff_members m
      join public.providers p on p.id = m.provider_id
      where m.ics_token = p_token;
    if v_provider_id is null then
      return null;
    end if;
  end if;

  -- Az összesítő naptárban több munkatárs esetén a munkatárs neve is
  -- megjelenik a bejegyzésben.
  select count(*) > 1 into v_multi
    from public.staff_members
    where provider_id = v_provider_id and active = true;

  return json_build_object(
    'name', 'IdőpontNeked – ' || v_name,
    'events', coalesce((
      select json_agg(json_build_object(
        'id', b.id,
        'service_name', b.service_name,
        'starts_at', b.starts_at,
        'ends_at', b.ends_at,
        'created_at', b.created_at,
        'customer_name', case when v_hide then null else b.customer_name end,
        'customer_phone', case when v_hide then null else b.customer_phone end,
        'staff_name', case when v_staff_id is null and v_multi then m.name else null end
      ) order by b.starts_at)
      from public.bookings b
      left join public.staff_members m on m.id = b.staff_id
      where b.provider_id = v_provider_id
        and (v_staff_id is null or b.staff_id = v_staff_id)
        and b.status = 'confirmed'
        and b.ends_at >= now() - interval '1 day'
    ), '[]'::json)
  );
end;
$$;

grant execute on function public.get_ics_feed(uuid) to anon, authenticated;

commit;
