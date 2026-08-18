-- ============================================================
-- IdőpontNeked.hu — schema_v7: szolgáltató jóváhagyási flow
-- Additív a schema.sql + schema_v2.sql + schema_v3.sql + schema_v4.sql
-- + schema_v5.sql + schema_v6.sql-hez. Egyszer lefuttatandó a Supabase
-- SQL Editorban, miután az előző scriptek már lefutottak.
--
-- A providers tábla már tartalmazott egy 'status' oszlopot a
-- schema.sql óta ('draft' / 'pending_review' / 'published'), de azt
-- semelyik RPC vagy admin felület nem használta — a nyilvános
-- láthatóságot eddig kizárólag a booking_enabled kapcsoló vezérelte.
-- Ez a script ugyanazt az oszlopot hasznosítja újra, immár tényleges
-- jóváhagyási jelentéssel (pending / active / suspended).
-- ============================================================

-- ------------------------------------------------------------
-- providers: jóváhagyási állapot. A már booking_enabled=true
-- szolgáltatókat (akik éles foglalási linket osztottak meg) a
-- migráció automatikusan 'active'-nak veszi, hogy a bevezetés ne
-- törje meg a már élő foglalási linkjeiket — mindenki más 'pending'
-- lesz, ahogy egy vadonatúj regisztrációnak is ott kell kezdenie.
-- ------------------------------------------------------------
alter table public.providers drop constraint if exists providers_status_check;

update public.providers
set status = case when booking_enabled then 'active' else 'pending' end;

alter table public.providers alter column status set default 'pending';
alter table public.providers
  add constraint providers_status_check check (status in ('pending', 'active', 'suspended'));

alter table public.providers
  add column if not exists approved_at timestamptz;

update public.providers set approved_at = now() where status = 'active' and approved_at is null;

-- ------------------------------------------------------------
-- get_public_provider: pending/suspended szolgáltatóra NULL-t ad
-- vissza — a /foglalas/[slug] oldal ilyenkor 404-et dob.
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
    'services', coalesce((
      select json_agg(json_build_object(
        'id', s.id,
        'name', s.name,
        'description', s.description,
        'price_huf', s.price_huf,
        'duration_minutes', s.duration_minutes
      ) order by s.created_at)
      from public.provider_services s
      where s.provider_id = p.id and s.active = true
    ), '[]'::json)
  )
  from public.providers p
  where p.slug = p_slug and p.booking_enabled = true and p.status = 'active';
$$;

grant execute on function public.get_public_provider(text) to anon, authenticated;

-- ------------------------------------------------------------
-- search_providers: csak jóváhagyott (status = 'active')
-- szolgáltatók jelenjenek meg a keresésben.
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
    and p.status = 'active'
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
