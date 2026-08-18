-- ============================================================
-- IdőpontNeked.hu — schema_v6: vendég-oldali kereső
-- Additív a schema.sql + schema_v2.sql + schema_v3.sql + schema_v4.sql
-- + schema_v5.sql-hez. Egyszer lefuttatandó a Supabase SQL Editorban,
-- miután az előző scriptek már lefutottak. Újrafuttatható (idempotens).
-- ============================================================

-- ------------------------------------------------------------
-- search_providers: kategória / település / dátum / címke szerinti
-- szűrés a publikusan foglalható (booking_enabled = true) szolgál-
-- tatók között. Csak publikus mezőket ad vissza, akárcsak a
-- get_public_provider. A dátum-szűrés a get_available_slots RPC-re
-- támaszkodik (bármelyik aktív szolgáltatásra legyen szabad sáv).
-- ------------------------------------------------------------
create or replace function public.search_providers(
  p_category text default null,
  p_city text default null,
  p_date date default null,
  p_tags text[] default null
)
returns table (
  id uuid,
  slug text,
  business_name text,
  category text,
  city text,
  description text,
  logo_url text,
  cover_url text,
  tags text[]
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.slug,
    p.business_name,
    p.category,
    p.city,
    p.description,
    p.logo_url,
    p.cover_url,
    coalesce(p.tags, '{}'::text[]) as tags
  from public.providers p
  where p.booking_enabled = true
    and (p_category is null or p.category = p_category)
    and (p_city is null or p.city = p_city)
    and (p_tags is null or array_length(p_tags, 1) is null or p.tags && p_tags)
    and (
      p_date is null
      or exists (
        select 1
        from public.provider_services s
        where s.provider_id = p.id
          and s.active = true
          and array_length(public.get_available_slots(p.slug, s.id, p_date), 1) > 0
      )
    )
  order by
    (case when p.logo_url is not null or p.cover_url is not null then 0 else 1 end),
    p.business_name asc
  limit 50;
$$;

grant execute on function public.search_providers(text, text, date, text[]) to anon, authenticated;
