-- ============================================================
-- IttFoglalj.hu — schema_v2: foglalási rendszer (2. teszt fázis)
-- Additív a schema.sql-hez (v0.1.0). Egyszer lefuttatandó a
-- Supabase SQL Editorban, miután a schema.sql már lefutott.
-- A script újrafuttatható (idempotens, ahol lehet).
-- ============================================================

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- ------------------------------------------------------------
-- slugify: ékezet-mentes, kisbetűs, kötőjelezett azonosító
-- (unaccent extension nélkül, magyar karakterekre translate-tel)
-- ------------------------------------------------------------
create or replace function public.slugify(v text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from
    regexp_replace(
      regexp_replace(
        translate(lower(coalesce(v, '')), 'áéíóöőúüű', 'aeiooouuu'),
        '[^a-z0-9]+', '-', 'g'
      ),
      '-{2,}', '-', 'g'
    )
  );
$$;

-- ------------------------------------------------------------
-- providers: új oszlopok (slug, ics_token, booking_enabled)
-- ------------------------------------------------------------
alter table public.providers
  add column if not exists slug text,
  add column if not exists ics_token uuid not null default gen_random_uuid(),
  add column if not exists booking_enabled boolean not null default false;

-- Meglévő szolgáltató(k) slug-jának feltöltése (id-ből képzett egyedi utótaggal)
update public.providers
set slug = public.slugify(coalesce(nullif(business_name, ''), 'szolgaltato'))
           || '-' || substr(md5(id::text), 1, 6)
where slug is null;

alter table public.providers alter column slug set not null;
create unique index if not exists providers_slug_key on public.providers (slug);

-- Trigger frissítése: új regisztrációnál slug is generálódjon
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_name text := coalesce(new.raw_user_meta_data ->> 'business_name', '');
begin
  insert into public.providers (id, business_name, slug)
  values (
    new.id,
    v_name,
    public.slugify(coalesce(nullif(v_name, ''), 'szolgaltato'))
      || '-' || substr(md5(new.id::text), 1, 6)
  );
  return new;
end;
$$;

-- ------------------------------------------------------------
-- provider_availability: heti ismétlődő nyitvatartás
-- weekday: 1=hétfő … 7=vasárnap (ISO). Naponta több sor is lehet.
-- ------------------------------------------------------------
create table if not exists public.provider_availability (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);
create index if not exists provider_availability_provider_idx
  on public.provider_availability (provider_id);

alter table public.provider_availability enable row level security;

drop policy if exists "availability_select_own" on public.provider_availability;
drop policy if exists "availability_insert_own" on public.provider_availability;
drop policy if exists "availability_update_own" on public.provider_availability;
drop policy if exists "availability_delete_own" on public.provider_availability;

create policy "availability_select_own" on public.provider_availability
  for select using (auth.uid() = provider_id);
create policy "availability_insert_own" on public.provider_availability
  for insert with check (auth.uid() = provider_id);
create policy "availability_update_own" on public.provider_availability
  for update using (auth.uid() = provider_id) with check (auth.uid() = provider_id);
create policy "availability_delete_own" on public.provider_availability
  for delete using (auth.uid() = provider_id);

-- ------------------------------------------------------------
-- bookings: foglalások
-- A szolgáltatás nevét/árát pillanatképként tároljuk, hogy a
-- foglalás túlélje a szolgáltatás módosítását/törlését.
-- ------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id) on delete cascade,
  service_id uuid references public.provider_services (id) on delete set null,
  service_name text not null,
  price_huf integer,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists bookings_provider_starts_idx
  on public.bookings (provider_id, starts_at);

-- Dupla-foglalás elleni védelem (verseny-biztos): nincs két egymást
-- fedő 'confirmed' foglalás ugyanannál a szolgáltatónál.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bookings_no_overlap') then
    alter table public.bookings
      add constraint bookings_no_overlap
      exclude using gist (
        provider_id with =,
        tstzrange(starts_at, ends_at) with &&
      ) where (status = 'confirmed');
  end if;
end $$;

alter table public.bookings enable row level security;

-- Csak a tulajdonos lát/kezel; anon SEMMILYEN közvetlen hozzáférés
-- (a vendég kizárólag a lenti create_booking RPC-n át foglal).
drop policy if exists "bookings_select_own" on public.bookings;
drop policy if exists "bookings_update_own" on public.bookings;

create policy "bookings_select_own" on public.bookings
  for select using (auth.uid() = provider_id);
create policy "bookings_update_own" on public.bookings
  for update using (auth.uid() = provider_id) with check (auth.uid() = provider_id);

-- ============================================================
-- RPC-k (SECURITY DEFINER) — a vendég-oldal EZEKEN át fér csak
-- az adatokhoz, sosem közvetlenül a táblákhoz.
-- ============================================================

-- Publikus szolgáltató-adat a foglalási oldalhoz (csak aktív oldal).
-- Csak a publikus mezőket adja vissza (telefont NEM).
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
    'category', p.category,
    'description', p.description,
    'services', coalesce((
      select json_agg(json_build_object(
        'id', s.id,
        'name', s.name,
        'price_huf', s.price_huf,
        'duration_minutes', s.duration_minutes
      ) order by s.created_at)
      from public.provider_services s
      where s.provider_id = p.id
    ), '[]'::json)
  )
  from public.providers p
  where p.slug = p_slug and p.booking_enabled = true;
$$;

-- Szabad kezdő-időpontok egy adott napra és szolgáltatásra.
-- Nyitvatartás mínusz meglévő foglalások, 30 perces rácson,
-- Europe/Budapest helyi idő szerint. Vendég-adatot NEM ad ki.
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
    where id = p_service_id and provider_id = v_provider_id;
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

-- Foglalás létrehozása. Minden validáció itt, szerver-oldalon.
-- A kizárási megszorítás fogja meg a párhuzamos dupla-foglalást.
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
    where id = p_service_id and provider_id = v_provider_id;
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

-- Az .ics feedhez tartozó foglalások (titkos token alapján).
create or replace function public.get_ics_bookings(p_token uuid)
returns table (
  id uuid,
  service_name text,
  starts_at timestamptz,
  ends_at timestamptz,
  customer_name text,
  customer_phone text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select b.id, b.service_name, b.starts_at, b.ends_at,
         b.customer_name, b.customer_phone, b.created_at
  from public.bookings b
  join public.providers p on p.id = b.provider_id
  where p.ics_token = p_token
    and b.status = 'confirmed'
    and b.ends_at >= now() - interval '1 day'
  order by b.starts_at;
$$;

-- Végrehajtási jogok: a vendég-oldal (anon) és a bejelentkezett
-- szolgáltató (authenticated) is hívhatja ezeket az RPC-ket.
grant execute on function public.get_public_provider(text) to anon, authenticated;
grant execute on function public.get_available_slots(text, uuid, date) to anon, authenticated;
grant execute on function public.create_booking(text, uuid, timestamptz, text, text, text) to anon, authenticated;
grant execute on function public.get_ics_bookings(uuid) to anon, authenticated;
