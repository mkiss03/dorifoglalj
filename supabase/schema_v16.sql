-- ============================================================
-- IdőpontNeked.hu — schema_v16: create_booking válasz bővítése
-- (vendég-oldali visszaigazoló email adatai)
-- Additív a schema.sql .. schema_v15.sql-hez. Egyszer lefuttatandó a
-- Supabase SQL Editorban.
--
-- Miért kell: a vendég-oldali visszaigazoló email küldéséhez
-- (lib/email/sendBookingConfirmationEmail.ts) a szolgáltató nevére,
-- telefonjára, címére és a szolgáltatás árára is szükség van. Ezeket
-- korábban a create_booking RPC sikeres visszatérése UTÁN, a
-- app/foglalas/[slug]/actions.ts külön, anon (nem bejelentkezett)
-- kliensről próbálta lekérdezni közvetlenül a providers/
-- provider_services/staff_members táblákból — ezeken viszont RLS van,
-- ami csak a saját, bejelentkezett tulajdonosnak enged olvasást (lásd
-- schema.sql "providers_select_own" stb.). Egy vendég ezekhez sosem
-- fér hozzá, így a lekérdezések némán üres eredményt adtak, és az
-- email vagy hiányos adatokkal ment ki, vagy egyáltalán nem ment ki.
--
-- Megoldás: mivel a create_booking RPC SECURITY DEFINER (emelt
-- jogosultsággal fut), már úgyis hozzáfér ezekhez az adatokhoz — a
-- válaszába egyszerűen belefoglaljuk őket, nincs szükség külön
-- lekérdezésre a hívó oldalon.
-- ============================================================

drop function if exists public.create_booking(text, uuid, uuid, timestamptz, text, text, text, uuid);

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
  v_provider record;
  v_service record;
  v_staff_name text;
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

  select id, business_name, phone, address, city, make_interval(mins => coalesce(buffer_minutes, 0))
    into v_provider_id, v_provider.business_name, v_provider.phone, v_provider.address, v_provider.city, v_buffer
    from public.providers where slug = p_slug and booking_enabled = true;
  if v_provider_id is null then
    return json_build_object('ok', false, 'error', 'provider_not_found');
  end if;

  select name into v_staff_name from public.staff_members m
    where m.id = p_staff_id and m.provider_id = v_provider_id and m.active = true;
  if v_staff_name is null then
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
    'ends_at', v_ends_at,
    'price_huf', v_service.price_huf,
    'provider_name', v_provider.business_name,
    'provider_phone', v_provider.phone,
    'provider_address', v_provider.address,
    'provider_city', v_provider.city,
    'staff_name', v_staff_name
  );
end;
$$;

grant execute on function public.create_booking(text, uuid, uuid, timestamptz, text, text, text, uuid)
  to anon, authenticated;
