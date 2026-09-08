begin;

-- Szolgáltató saját maga jelöli be a profiljában, hogy nála lehet-e
-- bankkártyával fizetni a helyszínen — ez csak egy informatív jelző a
-- vendégek felé (nincs tényleges online kártyás fizetés a rendszerben),
-- ezért egyszerű boolean a providers táblán, alapértéke false (amíg a
-- szolgáltató nem állítja be az ellenkezőjét).
alter table public.providers
  add column if not exists accepts_card_payment boolean not null default false;

-- get_public_provider: kiegészítve az új mezővel, hogy a publikus
-- foglalási oldal meg tudja jeleníteni.
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
    'accepts_card_payment', p.accepts_card_payment,
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

commit;
