-- ============================================================
-- IttFoglalj.hu — schema_v10: szolgáltató-tracking/jóváhagyó panel
-- (admin terület 2. üteme)
-- Additív a schema.sql .. schema_v9.sql-hez. Egyszer lefuttatandó a
-- Supabase SQL Editorban, miután az előző scriptek (a schema_v8.sql
-- admin-jogosultsága is) már lefutottak.
--
-- A projekt biztonsági modellje szerint (ld. README) nincs blanket RLS
-- tábla-hozzáférés, minden anon/admin művelet SECURITY DEFINER RPC-n
-- keresztül megy — ez a script ugyanezt a mintát követi az admin
-- olvasás/írás esetén is, nem ad admin-only RLS policy-t a providers
-- táblára.
-- ============================================================

-- ------------------------------------------------------------
-- provider_status_log: egyszerű audit-nyom — ki, mikor, milyen
-- irányba változtatta egy szolgáltató jóváhagyási állapotát.
-- ------------------------------------------------------------
create table if not exists public.provider_status_log (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  old_status text not null,
  new_status text not null,
  changed_by uuid not null references auth.users(id),
  changed_at timestamptz not null default now()
);

alter table public.provider_status_log enable row level security;

drop policy if exists "provider_status_log_select_admin" on public.provider_status_log;
create policy "provider_status_log_select_admin" on public.provider_status_log
  for select to authenticated using (public.is_admin());

-- ------------------------------------------------------------
-- admin_list_providers: minden szolgáltató a jóváhagyáshoz szükséges
-- mezőkkel (business_name, e-mail, telefon — Dórinak ez kell az
-- egyeztetéshez —, kategória, város, státusz, dátumok). Az e-mail az
-- auth.users-ből jön, mert a providers tábla nem tárolja külön.
-- ------------------------------------------------------------
create or replace function public.admin_list_providers()
returns table (
  id uuid,
  business_name text,
  email text,
  phone text,
  category text,
  city text,
  status text,
  booking_enabled boolean,
  created_at timestamptz,
  approved_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.business_name,
    u.email,
    p.phone,
    p.category,
    p.city,
    p.status,
    p.booking_enabled,
    p.created_at,
    p.approved_at
  from public.providers p
  join auth.users u on u.id = p.id
  where public.is_admin()
  order by
    (case p.status when 'pending' then 0 when 'active' then 1 else 2 end),
    p.created_at desc;
$$;

grant execute on function public.admin_list_providers() to authenticated;

-- ------------------------------------------------------------
-- admin_set_provider_status: jóváhagyás/felfüggesztés/visszaállítás —
-- ez váltja ki a Supabase SQL Editor-os kézi UPDATE-et. active-ra
-- váltáskor tölti approved_at-ot (ha még nincs), és mindig naplóz a
-- provider_status_log-ba.
-- ------------------------------------------------------------
create or replace function public.admin_set_provider_status(
  p_provider_id uuid,
  p_status text
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old_status text;
begin
  if not public.is_admin() then
    return json_build_object('ok', false, 'error', 'not_admin');
  end if;

  if p_status not in ('pending', 'active', 'suspended') then
    return json_build_object('ok', false, 'error', 'invalid_status');
  end if;

  select status into v_old_status from public.providers where id = p_provider_id;
  if v_old_status is null then
    return json_build_object('ok', false, 'error', 'provider_not_found');
  end if;

  update public.providers
    set status = p_status,
        approved_at = case
          when p_status = 'active' and approved_at is null then now()
          else approved_at
        end
    where id = p_provider_id;

  insert into public.provider_status_log (provider_id, old_status, new_status, changed_by)
    values (p_provider_id, v_old_status, p_status, auth.uid());

  return json_build_object('ok', true);
end;
$$;

grant execute on function public.admin_set_provider_status(uuid, text) to authenticated;
