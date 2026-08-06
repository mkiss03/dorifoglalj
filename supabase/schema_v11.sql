-- ============================================================
-- IttFoglalj.hu — schema_v11: eseti szabad/nem-foglalható időszakok
-- (kivételek a heti nyitvatartásban)
-- Additív a schema.sql .. schema_v10.sql-hez. Egyszer lefuttatandó a
-- Supabase SQL Editorban, miután az előző scriptek már lefutottak.
--
-- A provider_availability HETI, ismétlődő nyitvatartást ír le. Ez a
-- script egy külön "kivétel" táblát ad hozzá — egy adott NAPON belüli
-- (vagy egész napos) nem-foglalható időszakot, amit a szolgáltató ad
-- meg eseti jelleggel (pl. "kedden 8-9 között el kell mennem valahova").
-- A get_available_slots / get_own_available_slots / create_hold /
-- create_booking / create_manual_booking mind figyelembe veszi mostantól.
-- ============================================================

create table if not exists public.provider_blocks (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  block_date date not null,
  -- NULL start_time/end_time = egész napos kizárás
  start_time time,
  end_time time,
  note text,
  created_at timestamptz not null default now(),
  check (
    (start_time is null and end_time is null)
    or (start_time is not null and end_time is not null and end_time > start_time)
  )
);

create index if not exists provider_blocks_provider_date_idx
  on public.provider_blocks (provider_id, block_date);

alter table public.provider_blocks enable row level security;

drop policy if exists "provider_blocks_select_own" on public.provider_blocks;
create policy "provider_blocks_select_own" on public.provider_blocks
  for select using (auth.uid() = provider_id);
drop policy if exists "provider_blocks_insert_own" on public.provider_blocks;
create policy "provider_blocks_insert_own" on public.provider_blocks
  for insert with check (auth.uid() = provider_id);
drop policy if exists "provider_blocks_delete_own" on public.provider_blocks;
create policy "provider_blocks_delete_own" on public.provider_blocks
  for delete using (auth.uid() = provider_id);

-- ------------------------------------------------------------
-- get_available_slots: a nyitvatartási ablakon belüli, de kizárt
-- (provider_blocks) sávokat sem ajánlja fel.
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
  select id, make_interval(mins => coalesce(buffer_minutes, 0)) into v_provider_id, v_buffer
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
         and not exists (
           select 1 from public.provider_blocks pb
           where pb.provider_id = v_provider_id
             and pb.block_date = p_date
             and (
               pb.start_time is null
               or (pb.start_time < (v_slot_start + v_dur) and pb.end_time > v_slot_start)
             )
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

-- get_own_available_slots: ugyanaz a kizárás-tudatos logika, a
-- dashboard saját (manuális) foglalás-felvételéhez.
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

  select make_interval(mins => coalesce(buffer_minutes, 0)) into v_buffer
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
         and not exists (
           select 1 from public.provider_blocks pb
           where pb.provider_id = v_provider_id
             and pb.block_date = p_date
             and (
               pb.start_time is null
               or (pb.start_time < (v_slot_start + v_dur) and pb.end_time > v_slot_start)
             )
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
-- create_hold: most már a kizárt (provider_blocks) sávokat is
-- elutasítja, külön 'slot_blocked' hibakóddal.
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
  select id, make_interval(mins => coalesce(buffer_minutes, 0)) into v_provider_id, v_buffer
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
    select 1 from public.provider_blocks pb
    where pb.provider_id = v_provider_id
      and pb.block_date = v_local_date
      and (
        pb.start_time is null
        or (pb.start_time < (v_local_start + v_dur) and pb.end_time > v_local_start)
      )
  ) then
    return json_build_object('ok', false, 'error', 'slot_blocked');
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

-- ------------------------------------------------------------
-- create_booking: a friss-beszúrás ágon (amikor nincs érvényes
-- hold-token) most már a kizárt sávokat is elutasítja.
-- ------------------------------------------------------------
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

  select id, make_interval(mins => coalesce(buffer_minutes, 0)) into v_provider_id, v_buffer
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
      select 1 from public.provider_blocks pb
      where pb.provider_id = v_provider_id
        and pb.block_date = v_local_date
        and (
          pb.start_time is null
          or (pb.start_time < (v_local_start + v_dur) and pb.end_time > v_local_start)
        )
    ) then
      return json_build_object('ok', false, 'error', 'slot_blocked');
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
-- create_manual_booking: a tulajdonos se vihessen fel foglalást
-- egy saját maga által kizárt (provider_blocks) sávba.
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

  select make_interval(mins => coalesce(buffer_minutes, 0)) into v_buffer
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
    select 1 from public.provider_blocks pb
    where pb.provider_id = v_provider_id
      and pb.block_date = v_local_date
      and (
        pb.start_time is null
        or (pb.start_time < (v_local_start + v_dur) and pb.end_time > v_local_start)
      )
  ) then
    return json_build_object('ok', false, 'error', 'slot_blocked');
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
grant execute on function public.create_booking(text, uuid, timestamptz, text, text, text, uuid) to anon, authenticated;
grant execute on function public.create_manual_booking(uuid, timestamptz, text, text, text) to authenticated;
