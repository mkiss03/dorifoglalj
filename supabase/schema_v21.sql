begin;

-- ============================================================
-- IdőpontNeked.hu — schema_v21: egyszerű, cookie-mentes
-- oldalmegtekintés-számláló az admin Kapacitás & Monitor panelhez.
--
-- Szándékosan NEM egyedi látogatót mér (nincs cookie, session-id vagy
-- egyéb azonosító tárolva) — csak egy naponta összesített
-- oldalmegtekintés-számot, hogy összhangban maradjon az adatkezelési
-- tájékoztatóban leírtakkal (a részletes, egyedi-látogatós forgalmi
-- analitika a Vercel Web Analytics, ahhoz ez csak egy gyors, durva
-- kiegészítő szám az admin felületen).
-- ============================================================

create table if not exists public.daily_page_views (
  day date primary key,
  view_count bigint not null default 0
);

alter table public.daily_page_views enable row level security;
-- Nincs publikus select/insert policy — csak a lenti SECURITY DEFINER
-- RPC-k érik el (record_page_view a beszúráshoz/növeléshez,
-- admin_get_monitoring_stats az összesítéshez).

create or replace function public.record_page_view()
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.daily_page_views (day, view_count)
  values (current_date, 1)
  on conflict (day) do update set view_count = public.daily_page_views.view_count + 1;
$$;

-- A marketing layout minden (nem admin/dashboard) oldalbetöltésnél hívja,
-- bejelentkezés nélküli vendégként is — ezért kell az anon jogosultság.
grant execute on function public.record_page_view() to anon, authenticated;

-- admin_get_monitoring_stats kiegészítve a page view-számokkal.
create or replace function public.admin_get_monitoring_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_is_admin boolean;
  v_result jsonb;
begin
  select exists (select 1 from public.admins where user_id = auth.uid()) into v_is_admin;
  if not v_is_admin then
    raise exception 'Unauthorized';
  end if;

  select jsonb_build_object(
    'total_providers', (select count(*) from public.providers),
    'pending_providers', (select count(*) from public.providers where status = 'pending'),
    'active_providers', (select count(*) from public.providers where status = 'active'),
    'suspended_providers', (select count(*) from public.providers where status = 'suspended'),
    'providers_this_week', (select count(*) from public.providers where created_at >= now() - interval '7 days'),
    'providers_this_month', (select count(*) from public.providers where created_at >= date_trunc('month', now())),
    'total_users', (select count(*) from auth.users),
    'total_services', (select count(*) from public.provider_services),
    'total_staff', (select count(*) from public.staff_members),
    'total_bookings', (select count(*) from public.bookings),
    'confirmed_bookings', (select count(*) from public.bookings where status = 'confirmed'),
    'month_bookings', (select count(*) from public.bookings where created_at >= date_trunc('month', now())),
    'today_bookings', (select count(*) from public.bookings where created_at >= date_trunc('day', now())),
    'week_bookings', (select count(*) from public.bookings where created_at >= now() - interval '7 days'),
    'unique_customers', (select count(distinct customer_email) from public.bookings where customer_email is not null and customer_email != ''),
    'media_files_count', coalesce((select count(*) from storage.objects where bucket_id in ('provider-media', 'site-media')), 0),
    'media_bytes_estimated', coalesce((select sum(coalesce((metadata->>'size')::bigint, 0)) from storage.objects where bucket_id in ('provider-media', 'site-media')), 0),
    'total_db_rows', (
      (select count(*) from public.providers) +
      (select count(*) from public.provider_services) +
      (select count(*) from public.staff_members) +
      (select count(*) from public.provider_availability) +
      (select count(*) from public.provider_blocks) +
      (select count(*) from public.bookings) +
      (select count(*) from public.site_content) +
      (select count(*) from public.provider_status_log)
    ),
    'total_page_views', (select coalesce(sum(view_count), 0) from public.daily_page_views),
    'today_page_views', (select coalesce(view_count, 0) from public.daily_page_views where day = current_date),
    'week_page_views', (select coalesce(sum(view_count), 0) from public.daily_page_views where day > current_date - 7)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.admin_get_monitoring_stats() to authenticated;

commit;
