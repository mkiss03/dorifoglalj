-- ============================================================
-- IdőpontNeked.hu — schema_v13: kulcsszavas keresés (search_providers bővítés)
-- Additív a schema.sql .. schema_v12.sql-hez. Egyszer lefuttatandó a
-- Supabase SQL Editorban, miután az előző scriptek már lefutottak.
--
-- Eddig a keresés csak a 10 fix kategória szerint tudott szűrni. Ez a
-- script egy `p_query` paramétert ad a search_providers RPC-hez, ami a
-- szolgáltató nevében/leírásában ÉS minden aktív szolgáltatásának
-- nevében/leírásában is keres (ékezet-toleránsan) — így pl. "mandula
-- köröm"-re rákeresve megtalálható egy olyan szolgáltató, akinek van
-- ilyen nevű szolgáltatása, függetlenül attól, hogy a Köröm kategórián
-- belül ez nincs külön megjelölve.
-- ============================================================

begin;

-- Ékezet-toleráns kisbetűsítés kereséshez — a slugify() (schema_v2.sql)
-- már bevált translate()-mintáját használja újra, csak kötőjelezés/
-- URL-biztonságosítás nélkül (itt substring-illesztéshez kell, nem
-- slug-hoz).
create or replace function public.search_fold(v text)
returns text
language sql
immutable
set search_path = ''
as $$
  select translate(lower(coalesce(v, '')), 'áéíóöőúüű', 'aeiooouuu');
$$;

-- A create or replace nem cseréli le a függvényt, ha a paraméterlista
-- megváltozik (új overloadot hozna létre) — a régi 4-paraméteres
-- verziót explicit droppoljuk előbb (ugyanaz a minta, mint a v4/v11/v12
-- migrációkban a booking-RPC-knél).
drop function if exists public.search_providers(text, text, date, text[]);

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

grant execute on function public.search_fold(text) to anon, authenticated;
grant execute on function public.search_providers(text, text, date, text[], text) to anon, authenticated;

commit;
