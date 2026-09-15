begin;

-- get_public_provider: admin (Dóri) jóváhagyás előtt is meg tudja nézni a
-- szolgáltató kitöltött profilját (leírás, szolgáltatások, fotók, stb.) -
-- eddig ez `status = 'active'`-hez volt kötve, ami kizárta a meg nem
-- jóváhagyott ("pending") fiókokat is. Anonim/vendég nézetben a viselkedés
-- változatlan (csak aktív, foglalható profil látszik) - a bővítés
-- kizárólag admin session-re vonatkozik.
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
    'status', p.status,
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
  where p.slug = p_slug
    and (public.is_admin() or (p.booking_enabled = true and p.status = 'active'));
$$;

grant execute on function public.get_public_provider(text) to anon, authenticated;

-- admin_list_providers: kiegészítve a `slug`-gal, hogy az admin felület
-- linkelni tudjon a szolgáltató publikus (előnézeti) profiljára jóváhagyás
-- előtt is.
drop function if exists public.admin_list_providers();

create function public.admin_list_providers()
returns table (
  id uuid,
  business_name text,
  slug text,
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
    p.slug,
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
