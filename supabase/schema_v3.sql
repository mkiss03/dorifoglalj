-- ============================================================
-- IdőpontNeked.hu — schema_v3: irányítópult-bővítés (3. teszt fázis)
-- Additív a schema.sql + schema_v2.sql-hez. Egyszer lefuttatandó
-- a Supabase SQL Editorban, miután az előző két script már lefutott.
-- A script újrafuttatható (idempotens, ahol lehet).
-- ============================================================

-- ------------------------------------------------------------
-- providers: bővített, Google Cégprofil-ihletésű mezők
-- ------------------------------------------------------------
alter table public.providers
  add column if not exists address text,
  add column if not exists website text,
  add column if not exists facebook_url text,
  add column if not exists instagram_url text,
  add column if not exists logo_url text,
  add column if not exists cover_url text;

-- ------------------------------------------------------------
-- provider_services: leírás + aktív/inaktív kapcsoló
-- ------------------------------------------------------------
alter table public.provider_services
  add column if not exists description text,
  add column if not exists active boolean not null default true;

-- ------------------------------------------------------------
-- Storage: provider-media bucket (publikus olvasás, tulajdonos
-- írás a saját "{auth.uid()}/…" mappájába — logó + borítókép).
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('provider-media', 'provider-media', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

drop policy if exists "provider_media_insert_own" on storage.objects;
drop policy if exists "provider_media_update_own" on storage.objects;
drop policy if exists "provider_media_delete_own" on storage.objects;

create policy "provider_media_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'provider-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "provider_media_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'provider-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'provider-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "provider_media_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'provider-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ------------------------------------------------------------
-- get_public_provider: bővítve a brandelt mezőkkel, a szolgáltatás-
-- lista csak "active" sorokat ad ki, description-nel együtt.
-- A telefonszám mostantól SZÁNDÉKOSAN publikus (a schema_v2-ben még
-- nem volt az) — a brandelt foglalási oldal elérhetőség-soraként
-- jelenik meg, hívható tel: linkként.
-- ------------------------------------------------------------
create or replace function public.get_public_provider(p_slug text)
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_build_object(
    'id', p.id,
    'slug', p.slug,
    'business_name', p.business_name,
    'city', p.city,
    'address', p.address,
    'category', p.category,
    'description', p.description,
    'phone', p.phone,
    'website', p.website,
    'facebook_url', p.facebook_url,
    'instagram_url', p.instagram_url,
    'logo_url', p.logo_url,
    'cover_url', p.cover_url,
    'services', coalesce((
      select json_agg(json_build_object(
        'id', s.id,
        'name', s.name,
        'description', s.description,
        'price_huf', s.price_huf,
        'duration_minutes', s.duration_minutes
      ) order by s.created_at)
      from public.provider_services s
      where s.provider_id = p.id and s.active = true
    ), '[]'::json)
  )
  from public.providers p
  where p.slug = p_slug and p.booking_enabled = true;
$$;

-- get_available_slots: csak aktív szolgáltatásra adjon szabad sávot.
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
  v_duration int;
  v_result timestamptz[] := '{}';
  v_window record;
  v_slot_start time;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_dur interval;
  v_step interval := interval '30 minutes';
begin
  select id into v_provider_id from public.providers
    where slug = p_slug and booking_enabled = true;
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
             and b.status = 'confirmed'
             and tstzrange(b.starts_at, b.ends_at) && tstzrange(v_starts_at, v_ends_at)
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

-- create_booking: csak aktív szolgáltatásra engedjen foglalni.
create or replace function public.create_booking(
  p_slug text,
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
  v_provider_id uuid;
  v_service record;
  v_dur interval;
  v_ends_at timestamptz;
  v_local_date date;
  v_local_start time;
  v_weekday smallint;
  v_in_window boolean;
  v_booking_id uuid;
begin
  if coalesce(trim(p_customer_name), '') = '' or coalesce(trim(p_customer_phone), '') = '' then
    return json_build_object('ok', false, 'error', 'missing_fields');
  end if;

  select id into v_provider_id from public.providers
    where slug = p_slug and booking_enabled = true;
  if v_provider_id is null then
    return json_build_object('ok', false, 'error', 'provider_not_found');
  end if;

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

  -- nyitvatartásban van-e a teljes időtartam? (helyi idő szerint)
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

  begin
    insert into public.bookings (
      provider_id, service_id, service_name, price_huf,
      starts_at, ends_at, customer_name, customer_phone, customer_email
    ) values (
      v_provider_id, v_service.id, v_service.name, v_service.price_huf,
      p_starts_at, v_ends_at, trim(p_customer_name), trim(p_customer_phone),
      nullif(trim(coalesce(p_customer_email, '')), '')
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

-- ------------------------------------------------------------
-- get_own_available_slots: ugyanaz, mint a get_available_slots,
-- de a dashboard saját (manuális) foglalás-felvételéhez —
-- auth.uid()-ból azonosítja a szolgáltatót, NEM követeli meg a
-- booking_enabled = true-t (a publikus oldal lehet kikapcsolva,
-- a tulajdonos akkor is lásson szabad sávot telefonos foglaláshoz).
-- ------------------------------------------------------------
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
             and b.status = 'confirmed'
             and tstzrange(b.starts_at, b.ends_at) && tstzrange(v_starts_at, v_ends_at)
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
-- create_manual_booking: a szolgáltató saját maga vesz fel egy
-- telefonon/személyesen egyeztetett foglalást a dashboardon.
-- A `create_booking`-gal azonos validáció, de a szolgáltatót
-- auth.uid()-ból azonosítja (nem slug-ból), és NEM követeli meg
-- a booking_enabled = true-t — a publikus oldal ki lehet kapcsolva,
-- a tulajdonos akkor is felvihet foglalást.
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

  begin
    insert into public.bookings (
      provider_id, service_id, service_name, price_huf,
      starts_at, ends_at, customer_name, customer_phone, customer_email
    ) values (
      v_provider_id, v_service.id, v_service.name, v_service.price_huf,
      p_starts_at, v_ends_at, trim(p_customer_name), trim(p_customer_phone),
      nullif(trim(coalesce(p_customer_email, '')), '')
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

grant execute on function public.get_public_provider(text) to anon, authenticated;
grant execute on function public.get_available_slots(text, uuid, date) to anon, authenticated;
grant execute on function public.create_booking(text, uuid, timestamptz, text, text, text) to anon, authenticated;
grant execute on function public.get_own_available_slots(uuid, date) to authenticated;
grant execute on function public.create_manual_booking(uuid, timestamptz, text, text, text) to authenticated;
