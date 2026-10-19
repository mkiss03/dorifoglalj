begin;

-- ============================================================
-- IdőpontNeked.hu — schema_v23: értesítők, naptár-adatvédelem,
-- jóváhagyási állapot védelme
-- ============================================================

-- 1) Vendég-emlékeztető: ide kerül, mikor ment ki a foglalás előtti napi
-- emlékeztető, hogy a naponta futó feladat ugyanarra a foglalásra kétszer
-- ne küldjön (pl. újrafuttatáskor).
alter table public.bookings
  add column if not exists reminder_sent_at timestamptz;

-- 2) A szolgáltató választhatja, hogy a naptár-linkjén (ics) ne
-- látszódjon a vendég neve és telefonszáma, csak a szolgáltatás és az
-- időpont.
alter table public.providers
  add column if not exists ics_hide_customer boolean not null default false;

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
         case when p.ics_hide_customer then null else b.customer_name end,
         case when p.ics_hide_customer then null else b.customer_phone end,
         b.created_at
  from public.bookings b
  join public.providers p on p.id = b.provider_id
  where p.ics_token = p_token
    and b.status = 'confirmed'
    and b.ends_at >= now() - interval '1 day'
  order by b.starts_at;
$$;

grant execute on function public.get_ics_bookings(uuid) to anon, authenticated;

-- 3) Biztonsági javítás: a "providers_update_own" szabály eddig a saját
-- sor MINDEN oszlopát írhatóvá tette a szolgáltatónak — a felületet
-- megkerülve, közvetlen API-hívással a jóváhagyásra váró fiók magát
-- aktiválhatta, a felfüggesztett pedig visszaállíthatta magát. Ez a
-- trigger a jóváhagyáshoz tartozó oszlopokat csak adminnak (és a
-- szerveroldali / SQL Editor-os műveleteknek) engedi módosítani.
-- SECURITY INVOKER szándékosan: így a current_user a hívó szerepe
-- (bejelentkezett felhasználónál 'authenticated'), az admin RPC-k
-- (security definer) és az SQL Editor alatt viszont nem az.
create or replace function public.providers_protect_admin_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'anon' or (current_user = 'authenticated' and not public.is_admin()) then
    new.status := old.status;
    new.approved_at := old.approved_at;
    new.is_test := old.is_test;
  end if;
  return new;
end;
$$;

drop trigger if exists providers_protect_admin_columns on public.providers;
create trigger providers_protect_admin_columns
before update on public.providers
for each row execute function public.providers_protect_admin_columns();

commit;
