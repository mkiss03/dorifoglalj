-- ============================================================
-- IdőpontNeked.hu — schema_v15: admin-monitoring RPC
-- Additív a schema.sql .. schema_v14.sql-hez. Egyszer lefuttatandó a
-- Supabase SQL Editorban.
-- ============================================================

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
    'total_users', (select count(*) from auth.users),
    'total_services', (select count(*) from public.provider_services),
    'total_staff', (select count(*) from public.staff_members),
    'total_bookings', (select count(*) from public.bookings),
    'confirmed_bookings', (select count(*) from public.bookings where status = 'confirmed'),
    'month_bookings', (select count(*) from public.bookings where created_at >= date_trunc('month', now())),
    'today_bookings', (select count(*) from public.bookings where created_at >= date_trunc('day', now())),
    'unique_customers', (select count(distinct customer_email) from public.bookings where customer_email is not null and customer_email != ''),
    'media_files_count', coalesce((select count(*) from storage.objects where bucket_id = 'provider-media'), 0),
    'media_bytes_estimated', coalesce((select sum(coalesce((metadata->>'size')::bigint, 0)) from storage.objects where bucket_id = 'provider-media'), 0),
    'total_db_rows', (
      (select count(*) from public.providers) +
      (select count(*) from public.provider_services) +
      (select count(*) from public.staff_members) +
      (select count(*) from public.provider_availability) +
      (select count(*) from public.provider_blocks) +
      (select count(*) from public.bookings) +
      (select count(*) from public.site_content) +
      (select count(*) from public.provider_status_log)
    )
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.admin_get_monitoring_stats() to authenticated;
