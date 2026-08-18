-- ============================================================
-- IdőpontNeked.hu — schema_v5: alkalom-címkék (tags)
-- Additív a schema.sql + schema_v2.sql + schema_v3.sql + schema_v4.sql-hez.
-- Egyszer lefuttatandó a Supabase SQL Editorban, miután az előző
-- scriptek már lefutottak. A script újrafuttatható (idempotens).
-- ============================================================

-- ------------------------------------------------------------
-- providers: milyen alkalmakra vállal munkát a szolgáltató —
-- ez alapján tudnak majd rá szűrni a vendégek.
-- ------------------------------------------------------------
alter table public.providers
  add column if not exists tags text[] not null default '{}';

alter table public.providers drop constraint if exists providers_tags_check;
alter table public.providers
  add constraint providers_tags_check
  check (tags <@ array['eskuvo', 'hetkoznapi', 'party', 'ballagas', 'szuletesnap', 'ceges_esemeny']::text[]);

-- ------------------------------------------------------------
-- get_public_provider: bővítve a tags mezővel.
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
  where p.slug = p_slug and p.booking_enabled = true;
$$;

grant execute on function public.get_public_provider(text) to anon, authenticated;
