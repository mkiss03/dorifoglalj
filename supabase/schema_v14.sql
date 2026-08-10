begin;

alter table public.providers
  add column if not exists county text;

alter table public.providers
  add constraint providers_county_check
  check (county is null or county in (
    'HU-BK','HU-BA','HU-BE','HU-BZ','HU-CS','HU-FE','HU-GS','HU-HB','HU-HE',
    'HU-JN','HU-KE','HU-NO','HU-PE','HU-SO','HU-SZ','HU-TO','HU-VA','HU-VE',
    'HU-ZA','HU-BU'
  ));

-- Egyszeri backfill a meglévő szolgáltatóknak, akiknek a city-je a jelenlegi
-- 24 ismert megyeszékhely egyike — a lib/hungaryMap.ts-ben már úgyis benne
-- van ez a párosítás, nem kell hozzá új adat. Aki ezen kívüli városban van,
-- annak county-ja NULL marad, amíg újra el nem menti a profilját.
update public.providers set county = 'HU-BK' where city = 'Kecskemét' and county is null;
update public.providers set county = 'HU-BA' where city = 'Pécs' and county is null;
update public.providers set county = 'HU-BE' where city = 'Békéscsaba' and county is null;
update public.providers set county = 'HU-BZ' where city = 'Miskolc' and county is null;
update public.providers set county = 'HU-CS' where city = 'Szeged' and county is null;
update public.providers set county = 'HU-CS' where city = 'Hódmezővásárhely' and county is null;
update public.providers set county = 'HU-FE' where city = 'Székesfehérvár' and county is null;
update public.providers set county = 'HU-FE' where city = 'Dunaújváros' and county is null;
update public.providers set county = 'HU-GS' where city = 'Győr' and county is null;
update public.providers set county = 'HU-GS' where city = 'Sopron' and county is null;
update public.providers set county = 'HU-HB' where city = 'Debrecen' and county is null;
update public.providers set county = 'HU-HE' where city = 'Eger' and county is null;
update public.providers set county = 'HU-JN' where city = 'Szolnok' and county is null;
update public.providers set county = 'HU-KE' where city = 'Tatabánya' and county is null;
update public.providers set county = 'HU-NO' where city = 'Salgótarján' and county is null;
update public.providers set county = 'HU-PE' where city = 'Érd' and county is null;
update public.providers set county = 'HU-SO' where city = 'Kaposvár' and county is null;
update public.providers set county = 'HU-SZ' where city = 'Nyíregyháza' and county is null;
update public.providers set county = 'HU-TO' where city = 'Szekszárd' and county is null;
update public.providers set county = 'HU-VA' where city = 'Szombathely' and county is null;
update public.providers set county = 'HU-VE' where city = 'Veszprém' and county is null;
update public.providers set county = 'HU-ZA' where city = 'Zalaegerszeg' and county is null;
update public.providers set county = 'HU-ZA' where city = 'Nagykanizsa' and county is null;
update public.providers set county = 'HU-BU' where city = 'Budapest' and county is null;

-- Megyénkénti, aktív (foglalható) szolgáltatókkal rendelkező városok, a
-- HungaryMap popup-listájának dinamikus adatforrása.
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
    and p.county is not null
    and p.city is not null
  group by p.county, p.city
  order by p.county, provider_count desc, p.city asc;
$$;

grant execute on function public.list_active_cities_by_county() to anon, authenticated;

commit;
