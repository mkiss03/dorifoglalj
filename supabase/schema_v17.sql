begin;

-- Teszt-fiókok megjelölése — a "Máté teszt" (és bármilyen jövőbeli teszt-
-- regisztráció) ne keveredjen az éles keresési/kirakat-eredmények közé,
-- és ne számítson bele a "Már nálunk foglalható" szekció megjelenítési
-- küszöbébe (lásd lib/supabase/featuredProviders.ts).
alter table public.providers
  add column if not exists is_test boolean not null default false;

update public.providers set is_test = true where business_name = 'Máté teszt';

-- search_providers: kiegészítve "and p.is_test = false"-szal — a teszt-
-- fiók így sehol a publikus keresésben/kirakatban nem jelenik meg, nem
-- csak a főoldali szekció számolásánál.
create or replace function public.search_providers(
  p_category text default null,
  p_city text default null,
  p_date date default null,
  p_tags text[] default null,
  p_query text default null
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
    and p.is_test = false
    and (p_category is null or p.category = p_category)
    and (p_city is null or p.city = p_city)
    and (p_tags is null or array_length(p_tags, 1) is null or p.tags && p_tags)
    and (
      p_query is null or trim(p_query) = '' or (
        public.search_fold(p.business_name) like '%' || public.search_fold(p_query) || '%'
        or public.search_fold(coalesce(p.description, '')) like '%' || public.search_fold(p_query) || '%'
        or exists (
          select 1 from public.provider_services s
          where s.provider_id = p.id and s.active = true
            and (
              public.search_fold(s.name) like '%' || public.search_fold(p_query) || '%'
              or public.search_fold(coalesce(s.description, '')) like '%' || public.search_fold(p_query) || '%'
            )
        )
      )
    )
    and (
      p_date is null
      or exists (
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

grant execute on function public.search_providers(text, text, date, text[], text) to anon, authenticated;

-- list_active_cities_by_county: ugyanígy kizárva a teszt-fiók, hogy a
-- megyetérkép ne mutassa "aktívnak" azt a megyét, ahol csak egy teszt-
-- fiók van.
create or replace function public.list_active_cities_by_county()
returns table (county text, city text, provider_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select p.county, p.city, count(*) as provider_count
  from public.providers p
  where p.booking_enabled = true
    and p.status = 'active'
    and p.is_test = false
    and p.county is not null
    and p.city is not null
  group by p.county, p.city
  order by p.county, provider_count desc, p.city asc;
$$;

grant execute on function public.list_active_cities_by_county() to anon, authenticated;

commit;
