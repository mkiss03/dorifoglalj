-- ============================================================
-- IttFoglalj.hu — schema_v4: szünet (puffer) + időpont-zárolás
-- Additív a schema.sql + schema_v2.sql + schema_v3.sql-hez.
-- Egyszer lefuttatandó a Supabase SQL Editorban.
-- A script újrafuttatható (idempotens, ahol lehet).
-- ============================================================

-- ------------------------------------------------------------
-- providers: szünet két foglalás között (percben)
-- ------------------------------------------------------------
alter table public.providers
  add column if not exists buffer_minutes int not null default 0;

alter table public.providers drop constraint if exists providers_buffer_minutes_check;
alter table public.providers
  add constraint providers_buffer_minutes_check check (buffer_minutes between 0 and 180);

-- ------------------------------------------------------------
-- bookings: rövid életű zárolás (hold) támogatása.
-- A zárolás pillanatában még nincs vendég-adat, ezért a
-- customer_name/customer_phone csak "confirmed" állapotban kötelező.
-- ------------------------------------------------------------
alter table public.bookings
  alter column customer_name drop not null,
  alter column customer_phone drop not null;

alter table public.bookings
  add column if not exists hold_token uuid,
  add column if not exists hold_expires_at timestamptz;

create unique index if not exists bookings_hold_token_key
  on public.bookings (hold_token) where hold_token is not null;

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings
  add constraint bookings_status_check check (status in ('confirmed', 'pending', 'cancelled'));

alter table public.bookings drop constraint if exists bookings_confirmed_customer_check;
alter table public.bookings
  add constraint bookings_confirmed_customer_check
  check (status <> 'confirmed' or (customer_name is not null and customer_phone is not null));

-- A kizárási megszorítás mostantól a "pending" (zárolt) sorokat is
-- véded — így egy zárolt sávra sem lehet másik zárolást/foglalást
-- beszúrni, versenyhelyzetben is.
alter table public.bookings drop constraint if exists bookings_no_overlap;
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    provider_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('confirmed', 'pending'));

-- ------------------------------------------------------------
-- get_available_slots: puffer-tudatos + a le nem járt zárolásokat
-- is figyelembe veszi (nem ajánlja fel más által épp zárolt sávot).
-- ------------------------------------------------------------
create or replace function public.get_available_slots(
  p_slug text,
  p_service_id uuid,
  p_date date
)
returns timestamptz[]
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_provider_id uuid;
  v_buffer interval;
  v_duration int;
  v_result timestamptz[] := '{}';
  v_window record;
  v_slot_start time;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_dur interval;
  v_step interval := interval '30 minutes';
begin
  select id, make_interval(mins => buffer_minutes) into v_provider_id, v_buffer
    from public.providers where slug = p_slug and booking_enabled = true;
  if v_provider_id is null then
    return v_result;
  end if;

  select duration_minutes into v_duration from public.provider_services
    where id = p_service_id and provider_id = v_provider_id and active = true;
  if v_duration is null then
    return v_result;
  end if;
  v_dur := make_interval(mins => v_duration);

  for v_window in
    select start_time, end_time from public.provider_availability
    where provider_id = v_provider_id
      and weekday = extract(isodow from p_date)::smallint
    order by start_time
  loop
    v_slot_start := v_window.start_time;
    while v_slot_start + v_dur <= v_window.end_time loop
      v_starts_at := (p_date + v_slot_start) at time zone 'Europe/Budapest';
      v_ends_at := v_starts_at + v_dur;

      if v_starts_at > now()
         and not exists (
           select 1 from public.bookings b
           where b.provider_id = v_provider_id
             and (
               b.status = 'confirmed'
               or (b.status = 'pending' and b.hold_expires_at > now())
             )
             and tstzrange(b.starts_at - v_buffer, b.ends_at + v_buffer) && tstzrange(v_starts_at, v_ends_at)
         )
      then
        v_result := array_append(v_result, v_starts_at);
      end if;

      v_slot_start := v_slot_start + v_step;
    end loop;
  end loop;

  return v_result;
end;
$$;

-- get_own_available_slots: ugyanaz a puffer/pending-tudatos logika,
-- a dashboard saját (manuális) foglalás-felvételéhez.
create or replace function public.get_own_available_slots(
  p_service_id uuid,
  p_date date
)
returns timestamptz[]
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_provider_id uuid := auth.uid();
  v_buffer interval;
  v_duration int;
  v_result timestamptz[] := '{}';
  v_window record;
  v_slot_start time;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_dur interval;
  v_step interval := interval '30 minutes';
begin
  if v_provider_id is null then
    return v_result;
  end if;

  select make_interval(mins => buffer_minutes) into v_buffer
    from public.providers where id = v_provider_id;

  select duration_minutes into v_duration from public.provider_services
    where id = p_service_id and provider_id = v_provider_id and active = true;
  if v_duration is null then
    return v_result;
  end if;
  v_dur := make_interval(mins => v_duration);

  for v_window in
    select start_time, end_time from public.provider_availability
    where provider_id = v_provider_id
      and weekday = extract(isodow from p_date)::smallint
    order by start_time
  loop
    v_slot_start := v_window.start_time;
    while v_slot_start + v_dur <= v_window.end_time loop
      v_starts_at := (p_date + v_slot_start) at time zone 'Europe/Budapest';
      v_ends_at := v_starts_at + v_dur;

      if v_starts_at > now()
         and not exists (
           select 1 from public.bookings b
           where b.provider_id = v_provider_id
             and (
               b.status = 'confirmed'
               or (b.status = 'pending' and b.hold_expires_at > now())
             )
             and tstzrange(b.starts_at - v_buffer, b.ends_at + v_buffer) && tstzrange(v_starts_at, v_ends_at)
         )
      then
        v_result := array_append(v_result, v_starts_at);
      end if;

      v_slot_start := v_slot_start + v_step;
    end loop;
  end loop;

  return v_result;
end;
$$;

-- ------------------------------------------------------------
-- create_hold: rövid (5 perces) zárolás egy sávra, amint a vendég
-- rákattint — ez alatt más nem kaphatja meg ugyanazt/átfedő sávot.
-- ------------------------------------------------------------
create or replace function public.create_hold(
  p_slug text,
  p_service_id uuid,
  p_starts_at timestamptz
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_provider_id uuid;
  v_buffer interval;
  v_service record;
  v_dur interval;
  v_ends_at timestamptz;
  v_local_date date;
  v_local_start time;
  v_weekday smallint;
  v_in_window boolean;
  v_hold_token uuid;
  v_expires_at timestamptz;
begin
  select id, make_interval(mins => buffer_minutes) into v_provider_id, v_buffer
    from public.providers where slug = p_slug and booking_enabled = true;
  if v_provider_id is null then
    return json_build_object('ok', false, 'error', 'provider_not_found');
  end if;

  -- lejárt zárolások eltakarítása, hogy ne blokkoljanak feleslegesen
  delete from public.bookings
    where provider_id = v_provider_id and status = 'pending' and hold_expires_at < now();

  select id, name, price_huf, duration_minutes into v_service
    from public.provider_services
    where id = p_service_id and provider_id = v_provider_id and active = true;
  if not found then
    return json_build_object('ok', false, 'error', 'service_not_found');
  end if;

  if p_starts_at <= now() then
    return json_build_object('ok', false, 'error', 'in_past');
  end if;

  v_dur := make_interval(mins => v_service.duration_minutes);
  v_ends_at := p_starts_at + v_dur;

  v_local_date := (p_starts_at at time zone 'Europe/Budapest')::date;
  v_local_start := (p_starts_at at time zone 'Europe/Budapest')::time;
  v_weekday := extract(isodow from v_local_date)::smallint;

  select exists (
    select 1 from public.provider_availability a
    where a.provider_id = v_provider_id
      and a.weekday = v_weekday
      and a.start_time <= v_local_start
      and a.end_time >= (v_local_start + v_dur)
  ) into v_in_window;

  if not v_in_window then
    return json_build_object('ok', false, 'error', 'outside_hours');
  end if;

  if exists (
    select 1 from public.bookings b
    where b.provider_id = v_provider_id
      and (
        b.status = 'confirmed'
        or (b.status = 'pending' and b.hold_expires_at > now())
      )
      and tstzrange(b.starts_at - v_buffer, b.ends_at + v_buffer) && tstzrange(p_starts_at, v_ends_at)
  ) then
    return json_build_object('ok', false, 'error', 'slot_taken');
  end if;

  v_hold_token := gen_random_uuid();
  v_expires_at := now() + interval '5 minutes';

  begin
    insert into public.bookings (
      provider_id, service_id, service_name, price_huf,
      starts_at, ends_at, status, hold_token, hold_expires_at
    ) values (
      v_provider_id, v_service.id, v_service.name, v_service.price_huf,
      p_starts_at, v_ends_at, 'pending', v_hold_token, v_expires_at
    );
  exception
    when exclusion_violation then
      return json_build_object('ok', false, 'error', 'slot_taken');
  end;

  return json_build_object(
    'ok', true,
    'hold_token', v_hold_token,
    'expires_at', v_expires_at,
    'ends_at', v_ends_at
  );
end;
$$;

-- release_hold: a zárolás korai feloldása (pl. a vendég másik sávot
-- választ, vagy elhagyja az oldalt). Idempotens.
create or replace function public.release_hold(p_hold_token uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.bookings where hold_token = p_hold_token and status = 'pending';
$$;

-- ------------------------------------------------------------
-- create_booking: puffer-tudatos, és most már el tudja fogadni a
-- create_hold-ból kapott tokent (a zárolást váltja be foglalássá).
-- A régi 6-paraméteres verziót el kell távolítani, különben a
-- CREATE OR REPLACE egy másik, felesleges overloadot hozna létre.
-- ------------------------------------------------------------
drop function if exists public.create_booking(text, uuid, timestamptz, text, text, text);

create or replace function public.create_booking(
  p_slug text,
  p_service_id uuid,
  p_starts_at timestamptz,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_hold_token uuid default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_provider_id uuid;
  v_buffer interval;
  v_service record;
  v_dur interval;
  v_ends_at timestamptz;
  v_local_date date;
  v_local_start time;
  v_weekday smallint;
  v_in_window boolean;
  v_booking_id uuid;
  v_claimed boolean := false;
begin
  if coalesce(trim(p_customer_name), '') = '' or coalesce(trim(p_customer_phone), '') = '' then
    return json_build_object('ok', false, 'error', 'missing_fields');
  end if;

  select id, make_interval(mins => buffer_minutes) into v_provider_id, v_buffer
    from public.providers where slug = p_slug and booking_enabled = true;
  if v_provider_id is null then
    return json_build_object('ok', false, 'error', 'provider_not_found');
  end if;

  delete from public.bookings
    where provider_id = v_provider_id and status = 'pending' and hold_expires_at < now();

  select id, name, price_huf, duration_minutes into v_service
    from public.provider_services
    where id = p_service_id and provider_id = v_provider_id and active = true;
  if not found then
    return json_build_object('ok', false, 'error', 'service_not_found');
  end if;

  if p_starts_at <= now() then
    return json_build_object('ok', false, 'error', 'in_past');
  end if;

  v_dur := make_interval(mins => v_service.duration_minutes);
  v_ends_at := p_starts_at + v_dur;

  v_local_date := (p_starts_at at time zone 'Europe/Budapest')::date;
  v_local_start := (p_starts_at at time zone 'Europe/Budapest')::time;
  v_weekday := extract(isodow from v_local_date)::smallint;

  select exists (
    select 1 from public.provider_availability a
    where a.provider_id = v_provider_id
      and a.weekday = v_weekday
      and a.start_time <= v_local_start
      and a.end_time >= (v_local_start + v_dur)
  ) into v_in_window;

  if not v_in_window then
    return json_build_object('ok', false, 'error', 'outside_hours');
  end if;

  -- Ha érvényes, egyező zárolás-tokent kapunk, azt a sort erősítjük
  -- meg — ez nem számít bele saját magába az ütközés-vizsgálatba.
  if p_hold_token is not null then
    update public.bookings
      set status = 'confirmed',
          customer_name = trim(p_customer_name),
          customer_phone = trim(p_customer_phone),
          customer_email = nullif(trim(coalesce(p_customer_email, '')), ''),
          hold_token = null,
          hold_expires_at = null
      where hold_token = p_hold_token
        and provider_id = v_provider_id
        and service_id = v_service.id
        and starts_at = p_starts_at
        and status = 'pending'
        and hold_expires_at > now()
      returning id into v_booking_id;
    v_claimed := v_booking_id is not null;
  end if;

  if not v_claimed then
    if exists (
      select 1 from public.bookings b
      where b.provider_id = v_provider_id
        and (
          b.status = 'confirmed'
          or (b.status = 'pending' and b.hold_expires_at > now())
        )
        and tstzrange(b.starts_at - v_buffer, b.ends_at + v_buffer) && tstzrange(p_starts_at, v_ends_at)
    ) then
      return json_build_object('ok', false, 'error', 'slot_taken');
    end if;

    begin
      insert into public.bookings (
        provider_id, service_id, service_name, price_huf,
        starts_at, ends_at, customer_name, customer_phone, customer_email, status
      ) values (
        v_provider_id, v_service.id, v_service.name, v_service.price_huf,
        p_starts_at, v_ends_at, trim(p_customer_name), trim(p_customer_phone),
        nullif(trim(coalesce(p_customer_email, '')), ''), 'confirmed'
      )
      returning id into v_booking_id;
    exception
      when exclusion_violation then
        return json_build_object('ok', false, 'error', 'slot_taken');
    end;
  end if;

  return json_build_object(
    'ok', true,
    'booking_id', v_booking_id,
    'service_name', v_service.name,
    'starts_at', p_starts_at,
    'ends_at', v_ends_at
  );
end;
$$;

-- ------------------------------------------------------------
-- create_manual_booking: ugyanaz a puffer/pending-tudatos ütközés-
-- ellenőrzés, mint a create_booking friss-beszúrás ágában — a
-- tulajdonos se vihessen fel a pufferbe vagy egy vendég zárolásába
-- ütköző időpontot.
-- ------------------------------------------------------------
create or replace function public.create_manual_booking(
  p_service_id uuid,
  p_starts_at timestamptz,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_provider_id uuid := auth.uid();
  v_buffer interval;
  v_service record;
  v_dur interval;
  v_ends_at timestamptz;
  v_local_date date;
  v_local_start time;
  v_weekday smallint;
  v_in_window boolean;
  v_booking_id uuid;
begin
  if v_provider_id is null then
    return json_build_object('ok', false, 'error', 'provider_not_found');
  end if;

  if coalesce(trim(p_customer_name), '') = '' or coalesce(trim(p_customer_phone), '') = '' then
    return json_build_object('ok', false, 'error', 'missing_fields');
  end if;

  select make_interval(mins => buffer_minutes) into v_buffer
    from public.providers where id = v_provider_id;

  delete from public.bookings
    where provider_id = v_provider_id and status = 'pending' and hold_expires_at < now();

  select id, name, price_huf, duration_minutes into v_service
    from public.provider_services
    where id = p_service_id and provider_id = v_provider_id and active = true;
  if not found then
    return json_build_object('ok', false, 'error', 'service_not_found');
  end if;

  if p_starts_at <= now() then
    return json_build_object('ok', false, 'error', 'in_past');
  end if;

  v_dur := make_interval(mins => v_service.duration_minutes);
  v_ends_at := p_starts_at + v_dur;

  v_local_date := (p_starts_at at time zone 'Europe/Budapest')::date;
  v_local_start := (p_starts_at at time zone 'Europe/Budapest')::time;
  v_weekday := extract(isodow from v_local_date)::smallint;

  select exists (
    select 1 from public.provider_availability a
    where a.provider_id = v_provider_id
      and a.weekday = v_weekday
      and a.start_time <= v_local_start
      and a.end_time >= (v_local_start + v_dur)
  ) into v_in_window;

  if not v_in_window then
    return json_build_object('ok', false, 'error', 'outside_hours');
  end if;

  if exists (
    select 1 from public.bookings b
    where b.provider_id = v_provider_id
      and (
        b.status = 'confirmed'
        or (b.status = 'pending' and b.hold_expires_at > now())
      )
      and tstzrange(b.starts_at - v_buffer, b.ends_at + v_buffer) && tstzrange(p_starts_at, v_ends_at)
  ) then
    return json_build_object('ok', false, 'error', 'slot_taken');
  end if;

  begin
    insert into public.bookings (
      provider_id, service_id, service_name, price_huf,
      starts_at, ends_at, customer_name, customer_phone, customer_email, status
    ) values (
      v_provider_id, v_service.id, v_service.name, v_service.price_huf,
      p_starts_at, v_ends_at, trim(p_customer_name), trim(p_customer_phone),
      nullif(trim(coalesce(p_customer_email, '')), ''), 'confirmed'
    )
    returning id into v_booking_id;
  exception
    when exclusion_violation then
      return json_build_object('ok', false, 'error', 'slot_taken');
  end;

  return json_build_object(
    'ok', true,
    'booking_id', v_booking_id,
    'service_name', v_service.name,
    'starts_at', p_starts_at,
    'ends_at', v_ends_at
  );
end;
$$;

grant execute on function public.get_available_slots(text, uuid, date) to anon, authenticated;
grant execute on function public.get_own_available_slots(uuid, date) to authenticated;
grant execute on function public.create_hold(text, uuid, timestamptz) to anon, authenticated;
grant execute on function public.release_hold(uuid) to anon, authenticated;
grant execute on function public.create_booking(text, uuid, timestamptz, text, text, text, uuid) to anon, authenticated;
grant execute on function public.create_manual_booking(uuid, timestamptz, text, text, text) to authenticated;
