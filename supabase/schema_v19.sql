-- ============================================================
-- IdőpontNeked.hu — schema_v19: marketinges visszajelzések (2026-09)
--
-- Additív a schema.sql .. schema_v18.sql-hez. Egyszer lefuttatandó a
-- Supabase SQL Editorban, miután az előző scriptek már lefutottak.
--
-- Tartalom:
--   1. providers.category_other  — "Egyéb" kategória esetén a szolgáltató
--      által kért megnevezés (5. pont).
--   2. providers.tiktok_url      — TikTok a közösségi linkek közé (6. pont).
--   3. providers.payment_methods — több elfogadott fizetési mód, nem csak
--      a bankkártya (7. pont). A régi `accepts_card_payment` boolean
--      MEGMARAD és szinkronban tartjuk vele, hogy semmi meglévő ne törjön el.
--   4. get_public_provider       — a három új mező kiadása a publikus oldalnak.
--   5. admin_list_providers      — a kért kategória megjelenítése a jóváhagyó listán.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1-3. Új oszlopok (idempotens)
-- ------------------------------------------------------------
alter table public.providers
  add column if not exists category_other text;

alter table public.providers
  add column if not exists tiktok_url text;

alter table public.providers
  add column if not exists payment_methods text[] not null default '{}'::text[];

-- Csak az ismert értékeket engedjük be (az alkalmazás is ezt a listát
-- használja: lib/supabase/types.ts -> PAYMENT_METHODS).
alter table public.providers
  drop constraint if exists providers_payment_methods_valid;

alter table public.providers
  add constraint providers_payment_methods_valid check (
    payment_methods <@ array[
      'keszpenz', 'bankkartya', 'atutalas', 'szep_kartya', 'mobilfizetes', 'utalvany'
    ]::text[]
  );

-- Visszamenőleges feltöltés: akinél eddig be volt jelölve a bankkártya,
-- annál a lista is tartalmazza (különben a publikus oldalról eltűnne a
-- korábban megadott információ).
update public.providers
set payment_methods = array['bankkartya']::text[]
where accepts_card_payment = true
  and coalesce(array_length(payment_methods, 1), 0) = 0;

-- ------------------------------------------------------------
-- 4. get_public_provider — kiegészítve a category_other, tiktok_url és
--    payment_methods mezőkkel. A többi mező és a szűrési feltétel
--    (booking_enabled + status = 'active') változatlan.
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
    'category_other', p.category_other,
    'description', p.description,
    'phone', p.phone,
    'website', p.website,
    'facebook_url', p.facebook_url,
    'instagram_url', p.instagram_url,
    'tiktok_url', p.tiktok_url,
    'logo_url', p.logo_url,
    'cover_url', p.cover_url,
    'tags', coalesce(p.tags, '{}'::text[]),
    'accepts_card_payment', p.accepts_card_payment,
    'payment_methods', coalesce(p.payment_methods, '{}'::text[]),
    'staff', coalesce((
      select json_agg(json_build_object(
        'id', m.id,
        'name', m.name,
        'specialty', m.specialty,
        'photo_url', m.photo_url
      ) order by m.created_at)
      from public.staff_members m
      where m.provider_id = p.id and m.active = true
    ), '[]'::json),
    'services', coalesce((
      select json_agg(json_build_object(
        'id', s.id,
        'name', s.name,
        'description', s.description,
        'price_huf', s.price_huf,
        'duration_minutes', s.duration_minutes,
        'staff_ids', coalesce((
          select json_agg(ss.staff_id)
          from public.staff_services ss
          join public.staff_members m on m.id = ss.staff_id
          where ss.service_id = s.id and m.active = true
        ), '[]'::json)
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
-- 5. admin_list_providers — egy új oszloppal (category_other). A returns
--    table alakja változik, ezért a `create or replace` nem elég: előbb
--    el kell dobni a régi függvényt.
-- ------------------------------------------------------------
drop function if exists public.admin_list_providers();

create function public.admin_list_providers()
returns table (
  id uuid,
  business_name text,
  email text,
  phone text,
  category text,
  category_other text,
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
    p.category_other,
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

commit;
