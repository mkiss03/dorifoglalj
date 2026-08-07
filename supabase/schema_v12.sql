-- ============================================================
-- IttFoglalj.hu — schema_v12: munkatársak (staff) egy profilon belül
-- Additív a schema.sql .. schema_v11.sql-hez. Egyszer lefuttatandó a
-- Supabase SQL Editorban, miután az előző scriptek már lefutottak.
--
-- Lényeg: eddig egy `providers` sor = egy naptár. Mostantól minden
-- szolgáltató kap egy vagy több `staff_members` sort — a nyitvatartás
-- (`provider_availability`), a kizárások (`provider_blocks`) és a
-- foglalások (`bookings`) mind egy konkrét staff-hoz kötődnek, NEM a
-- providerhez közvetlenül. Visszamenőleges kompatibilitás: MINDEN
-- meglévő szolgáltató automatikusan kap egy alapértelmezett "saját"
-- staff-sort (a backfill lentebb), így `staff_id` mindenhol NOT NULL
-- lehet — nincs elágazó NULL-kezelés egyik RPC-ben sem. Az "egyszemélyes
-- vállalkozás" eset egyszerűen "pontosan 1 staff sor", a UI ezt
-- mindenhol elrejti (dashboard, publikus foglalás), amíg a szolgáltató
-- fel nem vesz egy 2. dolgozót.
--
-- FONTOS SORREND (ne cseréld fel): táblák/RLS → nullable staff_id
-- oszlopok → backfill (alapértelmezett staff + staff_id kitöltés +
-- staff_services kitöltés) → staff_id NOT NULL → bookings_no_overlap
-- csere staff_id-re. Ha ezt a sorrendet felcseréled, az exclusion
-- constraint NULL staff_id-jű sorokat láthatatlanul enged át (a NULL
-- sosem egyenlő NULL-lal), ami visszanyitná a dupla-foglalás rést.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- Új táblák
-- ------------------------------------------------------------
create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  name text not null,
  specialty text,
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists staff_members_provider_idx on public.staff_members (provider_id);

alter table public.staff_members enable row level security;

drop policy if exists "staff_members_select_own" on public.staff_members;
drop policy if exists "staff_members_insert_own" on public.staff_members;
drop policy if exists "staff_members_update_own" on public.staff_members;
drop policy if exists "staff_members_delete_own" on public.staff_members;

create policy "staff_members_select_own" on public.staff_members
  for select using (auth.uid() = provider_id);
create policy "staff_members_insert_own" on public.staff_members
  for insert with check (auth.uid() = provider_id);
create policy "staff_members_update_own" on public.staff_members
  for update using (auth.uid() = provider_id) with check (auth.uid() = provider_id);
create policy "staff_members_delete_own" on public.staff_members
  for delete using (auth.uid() = provider_id);

create table if not exists public.staff_services (
  staff_id uuid not null references public.staff_members(id) on delete cascade,
  service_id uuid not null references public.provider_services(id) on delete cascade,
  -- denormalizált, hogy az RLS ne igényeljen join-t a másik két táblára
  provider_id uuid not null references public.providers(id) on delete cascade,
  primary key (staff_id, service_id)
);
create index if not exists staff_services_provider_idx on public.staff_services (provider_id);
create index if not exists staff_services_service_idx on public.staff_services (service_id);

alter table public.staff_services enable row level security;

drop policy if exists "staff_services_select_own" on public.staff_services;
drop policy if exists "staff_services_insert_own" on public.staff_services;
drop policy if exists "staff_services_delete_own" on public.staff_services;

create policy "staff_services_select_own" on public.staff_services
  for select using (auth.uid() = provider_id);
create policy "staff_services_insert_own" on public.staff_services
  for insert with check (auth.uid() = provider_id);
create policy "staff_services_delete_own" on public.staff_services
  for delete using (auth.uid() = provider_id);

-- Az RLS a `provider_id`-t helyesen ellenőrzi, de nem látja, hogy a
-- `staff_id`/`service_id` ténylegesen a JELZETT providerhez tartozik-e
-- (két másik FK-n keresztül) — ez a trigger zárja ezt a rést, nehogy
-- egy hibás kliens-hívás egy más sajátjához nem illő staff/service
-- párost tudjon beszúrni.
create or replace function public.check_staff_service_ownership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.staff_members m
    where m.id = new.staff_id and m.provider_id = new.provider_id
  ) then
    raise exception 'staff_id nem a megadott provider_id-hoz tartozik';
  end if;
  if not exists (
    select 1 from public.provider_services s
    where s.id = new.service_id and s.provider_id = new.provider_id
  ) then
    raise exception 'service_id nem a megadott provider_id-hoz tartozik';
  end if;
  return new;
end;
$$;

drop trigger if exists staff_services_check_ownership on public.staff_services;
create trigger staff_services_check_ownership
before insert or update on public.staff_services
for each row execute function public.check_staff_service_ownership();

-- ------------------------------------------------------------
-- staff_id oszlopok — egyelőre NULLABLE, a backfill után válnak
-- kötelezővé (ld. a fájl elején lévő sorrend-figyelmeztetést).
-- ------------------------------------------------------------
alter table public.provider_availability
  add column if not exists staff_id uuid references public.staff_members(id) on delete cascade;
alter table public.provider_blocks
  add column if not exists staff_id uuid references public.staff_members(id) on delete cascade;
-- RESTRICT (nem CASCADE): a bookings sorban nincs staff-név pillanatkép
-- (a service_name/price_huf mintájára), tehát egy dolgozó törlése
-- véglegesen elveszejtene valódi foglalás-történetet, ha cascade lenne.
-- Emiatt a dashboard "törlés" gombja csak akkor engedélyezett, ha a
-- dolgozónak soha nem volt foglalása — ezt a szerver action ellenőrzi,
-- ez a constraint csak a végső biztosíték.
alter table public.bookings
  add column if not exists staff_id uuid references public.staff_members(id) on delete restrict;

create index if not exists provider_availability_staff_idx on public.provider_availability (staff_id);
create index if not exists provider_blocks_staff_idx on public.provider_blocks (staff_id);
create index if not exists bookings_staff_starts_idx on public.bookings (staff_id, starts_at);

-- ------------------------------------------------------------
-- Backfill — idempotens: újrafuttatva sem hoz létre duplikátumot.
-- ------------------------------------------------------------

-- 1) Minden olyan providernek, akinek MÉG nincs staff sora, kap egyet.
--    A business_name üres string is lehet egy friss regisztrációnál.
insert into public.staff_members (provider_id, name)
select p.id, coalesce(nullif(p.business_name, ''), 'Tulajdonos')
from public.providers p
where not exists (select 1 from public.staff_members sm where sm.provider_id = p.id);

-- 2) A meglévő nyitvatartás/kizárás/foglalás sorok staff_id-je a
--    providerük legrégebbi (= az imént/korábban létrehozott alapértelmezett)
--    staff sorára mutat.
update public.provider_availability a
set staff_id = (
  select sm.id from public.staff_members sm
  where sm.provider_id = a.provider_id
  order by sm.created_at asc
  limit 1
)
where a.staff_id is null;

update public.provider_blocks b
set staff_id = (
  select sm.id from public.staff_members sm
  where sm.provider_id = b.provider_id
  order by sm.created_at asc
  limit 1
)
where b.staff_id is null;

update public.bookings bk
set staff_id = (
  select sm.id from public.staff_members sm
  where sm.provider_id = bk.provider_id
  order by sm.created_at asc
  limit 1
)
where bk.staff_id is null;

-- 3) Minden meglévő szolgáltatáshoz, aminek MÉG nincs staff-hozzárendelése,
--    hozzárendeljük a providere alapértelmezett staffját — így a jelenlegi
--    szolgáltatások változatlanul foglalhatók maradnak.
insert into public.staff_services (staff_id, service_id, provider_id)
select
  (select sm.id from public.staff_members sm where sm.provider_id = s.provider_id order by sm.created_at asc limit 1),
  s.id,
  s.provider_id
from public.provider_services s
where not exists (select 1 from public.staff_services ss where ss.service_id = s.id);

-- 4) Csak MOST, a fenti backfill után válik kötelezővé staff_id.
alter table public.provider_availability alter column staff_id set not null;
alter table public.provider_blocks alter column staff_id set not null;
alter table public.bookings alter column staff_id set not null;

-- 5) A dupla-foglalás elleni exclusion constraint mostantól staff_id
--    szerint particionál (nem provider_id szerint) — két különböző
--    dolgozó UGYANARRA az időpontra is lefoglalható egyszerre, de egy
--    dolgozó nem foglalható duplán. A btree_gist extension már be van
--    kapcsolva (schema_v2).
alter table public.bookings drop constraint if exists bookings_no_overlap;
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    staff_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('confirmed', 'pending'));

-- ------------------------------------------------------------
-- handle_new_user: minden ÚJ regisztráció is azonnal kapjon egy
-- alapértelmezett staff-sort (a fenti backfill csak a meglévőket fedte).
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_name text := coalesce(new.raw_user_meta_data ->> 'business_name', '');
  v_provider_id uuid;
begin
  insert into public.providers (id, business_name, slug)
  values (
    new.id,
    v_name,
    public.slugify(coalesce(nullif(v_name, ''), 'szolgaltato'))
      || '-' || substr(md5(new.id::text), 1, 6)
  )
  returning id into v_provider_id;

  insert into public.staff_members (provider_id, name)
  values (v_provider_id, coalesce(nullif(v_name, ''), 'Tulajdonos'));

  return new;
end;
$$;

-- ------------------------------------------------------------
-- get_available_slots: staff-tudatos. p_staff_id kötelező, az
-- availability/blocks/bookings lookup mind erre szűkül (a bookings
-- overlap-check staff_id-re vált a korábbi provider_id helyett — ez
-- teszi lehetővé, hogy két dolgozó egyszerre legyen lefoglalva).
-- ------------------------------------------------------------
drop function if exists public.get_available_slots(text, uuid, date);

create or replace function public.get_available_slots(
  p_slug text,
  p_service_id uuid,
  p_staff_id uuid,
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

  if not exists (
    select 1 from public.staff_members m
    where m.id = p_staff_id and m.provider_id = v_provider_id and m.active = true
  ) then
    return v_result;
  end if;

  select duration_minutes into v_duration from public.provider_services
    where id = p_service_id and provider_id = v_provider_id and active = true;
  if v_duration is null then
    return v_result;
  end if;

  if not exists (
    select 1 from public.staff_services ss
    where ss.staff_id = p_staff_id and ss.service_id = p_service_id
  ) then
    return v_result;
  end if;

  v_dur := make_interval(mins => v_duration);

  for v_window in
    select start_time, end_time from public.provider_availability
    where provider_id = v_provider_id
      and staff_id = p_staff_id
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
           where b.staff_id = p_staff_id
             and (
               b.status = 'confirmed'
               or (b.status = 'pending' and b.hold_expires_at > now())
             )
             and tstzrange(b.starts_at - v_buffer, b.ends_at + v_buffer) && tstzrange(v_starts_at, v_ends_at)
         )
         and not exists (
           select 1 from public.provider_blocks pb
           where pb.provider_id = v_provider_id
             and pb.staff_id = p_staff_id
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

-- get_own_available_slots: ugyanaz, dashboard saját (manuális)
-- foglalás-felvételhez, auth.uid() a provider-azonosító.
drop function if exists public.get_own_available_slots(uuid, date);

create or replace function public.get_own_available_slots(
  p_service_id uuid,
  p_staff_id uuid,
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

  if not exists (
    select 1 from public.staff_members m
    where m.id = p_staff_id and m.provider_id = v_provider_id and m.active = true
  ) then
    return v_result;
  end if;

  select duration_minutes into v_duration from public.provider_services
    where id = p_service_id and provider_id = v_provider_id and active = true;
  if v_duration is null then
    return v_result;
  end if;

  if not exists (
    select 1 from public.staff_services ss
    where ss.staff_id = p_staff_id and ss.service_id = p_service_id
  ) then
    return v_result;
  end if;

  v_dur := make_interval(mins => v_duration);

  for v_window in
    select start_time, end_time from public.provider_availability
    where provider_id = v_provider_id
      and staff_id = p_staff_id
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
           where b.staff_id = p_staff_id
             and (
               b.status = 'confirmed'
               or (b.status = 'pending' and b.hold_expires_at > now())
             )
             and tstzrange(b.starts_at - v_buffer, b.ends_at + v_buffer) && tstzrange(v_starts_at, v_ends_at)
         )
         and not exists (
           select 1 from public.provider_blocks pb
           where pb.provider_id = v_provider_id
             and pb.staff_id = p_staff_id
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
-- create_hold: staff-tudatos, staff_not_found/staff_not_eligible
-- új hibakódokkal.
-- ------------------------------------------------------------
drop function if exists public.create_hold(text, uuid, timestamptz);

create or replace function public.create_hold(
  p_slug text,
  p_service_id uuid,
  p_staff_id uuid,
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

  if not exists (
    select 1 from public.staff_members m
    where m.id = p_staff_id and m.provider_id = v_provider_id and m.active = true
  ) then
    return json_build_object('ok', false, 'error', 'staff_not_found');
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

  if not exists (
    select 1 from public.staff_services ss
    where ss.staff_id = p_staff_id and ss.service_id = v_service.id
  ) then
    return json_build_object('ok', false, 'error', 'staff_not_eligible');
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
      and a.staff_id = p_staff_id
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
      and pb.staff_id = p_staff_id
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
    where b.staff_id = p_staff_id
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
      provider_id, staff_id, service_id, service_name, price_huf,
      starts_at, ends_at, status, hold_token, hold_expires_at
    ) values (
      v_provider_id, p_staff_id, v_service.id, v_service.name, v_service.price_huf,
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
-- create_booking: staff-tudatos. A hold-claim ág is staff_id szerint
-- ellenőriz (a zárolást csak a saját staffjára lehet beváltani).
-- ------------------------------------------------------------
drop function if exists public.create_booking(text, uuid, timestamptz, text, text, text, uuid);

create or replace function public.create_booking(
  p_slug text,
  p_service_id uuid,
  p_staff_id uuid,
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

  if not exists (
    select 1 from public.staff_members m
    where m.id = p_staff_id and m.provider_id = v_provider_id and m.active = true
  ) then
    return json_build_object('ok', false, 'error', 'staff_not_found');
  end if;

  delete from public.bookings
    where provider_id = v_provider_id and status = 'pending' and hold_expires_at < now();

  select id, name, price_huf, duration_minutes into v_service
    from public.provider_services
    where id = p_service_id and provider_id = v_provider_id and active = true;
  if not found then
    return json_build_object('ok', false, 'error', 'service_not_found');
  end if;

  if not exists (
    select 1 from public.staff_services ss
    where ss.staff_id = p_staff_id and ss.service_id = v_service.id
  ) then
    return json_build_object('ok', false, 'error', 'staff_not_eligible');
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
      and a.staff_id = p_staff_id
      and a.weekday = v_weekday
      and a.start_time <= v_local_start
      and a.end_time >= (v_local_start + v_dur)
  ) into v_in_window;

  if not v_in_window then
    return json_build_object('ok', false, 'error', 'outside_hours');
  end if;

  -- Ha érvényes, egyező zárolás-tokent kapunk (ugyanahhoz a staffhoz),
  -- azt a sort erősítjük meg — ez nem számít bele saját magába az
  -- ütközés-vizsgálatba.
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
        and staff_id = p_staff_id
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
        and pb.staff_id = p_staff_id
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
      where b.staff_id = p_staff_id
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
        provider_id, staff_id, service_id, service_name, price_huf,
        starts_at, ends_at, customer_name, customer_phone, customer_email, status
      ) values (
        v_provider_id, p_staff_id, v_service.id, v_service.name, v_service.price_huf,
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
-- create_manual_booking: dashboard-oldali megfelelője, staff-tudatos.
-- ------------------------------------------------------------
drop function if exists public.create_manual_booking(uuid, timestamptz, text, text, text);

create or replace function public.create_manual_booking(
  p_service_id uuid,
  p_staff_id uuid,
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

  if not exists (
    select 1 from public.staff_members m
    where m.id = p_staff_id and m.provider_id = v_provider_id and m.active = true
  ) then
    return json_build_object('ok', false, 'error', 'staff_not_found');
  end if;

  delete from public.bookings
    where provider_id = v_provider_id and status = 'pending' and hold_expires_at < now();

  select id, name, price_huf, duration_minutes into v_service
    from public.provider_services
    where id = p_service_id and provider_id = v_provider_id and active = true;
  if not found then
    return json_build_object('ok', false, 'error', 'service_not_found');
  end if;

  if not exists (
    select 1 from public.staff_services ss
    where ss.staff_id = p_staff_id and ss.service_id = v_service.id
  ) then
    return json_build_object('ok', false, 'error', 'staff_not_eligible');
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
      and a.staff_id = p_staff_id
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
      and pb.staff_id = p_staff_id
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
    where b.staff_id = p_staff_id
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
      provider_id, staff_id, service_id, service_name, price_huf,
      starts_at, ends_at, customer_name, customer_phone, customer_email, status
    ) values (
      v_provider_id, p_staff_id, v_service.id, v_service.name, v_service.price_huf,
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

-- ------------------------------------------------------------
-- get_public_provider: kap egy `staff` tömböt (csak aktív staff), és
-- minden szolgáltatáshoz egy `staff_ids` mezőt — ebből épül fel a
-- publikus foglalási oldal staff-választója.
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
    'tags', coalesce(p.tags, '{}'::text[]),
    'staff', coalesce((
      select json_agg(json_build_object(
        'id', m.id,
        'name', m.name,
        'specialty', m.specialty,
        'photo_url', m.photo_url
      ) order by m.created_at)
      from public.staff_members m
      where m.provider_id = p.id and m.active = true
    ), '[]'::json),
    'services', coalesce((
      select json_agg(json_build_object(
        'id', s.id,
        'name', s.name,
        'description', s.description,
        'price_huf', s.price_huf,
        'duration_minutes', s.duration_minutes,
        'staff_ids', coalesce((
          select json_agg(ss.staff_id)
          from public.staff_services ss
          join public.staff_members m on m.id = ss.staff_id
          where ss.service_id = s.id and m.active = true
        ), '[]'::json)
      ) order by s.created_at)
      from public.provider_services s
      where s.provider_id = p.id and s.active = true
    ), '[]'::json)
  )
  from public.providers p
  where p.slug = p_slug and p.booking_enabled = true and p.status = 'active';
$$;

-- ------------------------------------------------------------
-- search_providers: a dátum-szűrés minden (aktív szolgáltatás × azt
-- végző aktív staff) párra ellenőrzi, van-e szabad időpont aznapra.
-- ------------------------------------------------------------
create or replace function public.search_providers(
  p_category text default null,
  p_city text default null,
  p_date date default null,
  p_tags text[] default null
)
returns table (
  id uuid, slug text, business_name text, category text, city text,
  description text, logo_url text, cover_url text, tags text[]
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id, p.slug, p.business_name, p.category, p.city, p.description,
    p.logo_url, p.cover_url, coalesce(p.tags, '{}'::text[]) as tags
  from public.providers p
  where p.booking_enabled = true
    and p.status = 'active'
    and (p_category is null or p.category = p_category)
    and (p_city is null or p.city = p_city)
    and (p_tags is null or array_length(p_tags, 1) is null or p.tags && p_tags)
    and (
      p_date is null
      or exists (
        -- Elfogadható overhead a jelenlegi méretnél; ha sokasodik a
        -- staff/szolgáltatás-szám, elég lenne staffonként csak a
        -- legrövidebb szolgáltatást tesztelni, nem mindet.
        select 1
        from public.provider_services s
        join public.staff_services ss on ss.service_id = s.id
        join public.staff_members m on m.id = ss.staff_id and m.active = true
        where s.provider_id = p.id
          and s.active = true
          and array_length(public.get_available_slots(p.slug, s.id, m.id, p_date), 1) > 0
      )
    )
  order by
    (case when p.logo_url is not null or p.cover_url is not null then 0 else 1 end),
    p.business_name asc
  limit 50;
$$;

-- ------------------------------------------------------------
-- Végrehajtási jogok
-- ------------------------------------------------------------
grant execute on function public.get_available_slots(text, uuid, uuid, date) to anon, authenticated;
grant execute on function public.get_own_available_slots(uuid, uuid, date) to authenticated;
grant execute on function public.create_hold(text, uuid, uuid, timestamptz) to anon, authenticated;
grant execute on function public.create_booking(text, uuid, uuid, timestamptz, text, text, text, uuid) to anon, authenticated;
grant execute on function public.create_manual_booking(uuid, uuid, timestamptz, text, text, text) to authenticated;
grant execute on function public.get_public_provider(text) to anon, authenticated;
grant execute on function public.search_providers(text, text, date, text[]) to anon, authenticated;

commit;
