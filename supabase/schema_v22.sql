begin;

-- ============================================================
-- IdőpontNeked.hu — schema_v22: tesztelési visszajelzések javításai
-- ============================================================

-- 1) Képfeltöltés (logó, borító, munkatárs-fotó).
-- A feltöltés felülírással (upsert) megy, hogy a képcsere ugyanarra az
-- útvonalra kerüljön. A Supabase Storage-ban az upsert az INSERT és
-- UPDATE mellett SELECT jogosultságot is igényel — ez hiányzott, ezért
-- minden feltöltés RLS-hibával elbukott. A saját mappára szűkítve, a
-- publikus képmegjelenítést (public bucket URL) ez nem érinti.
drop policy if exists "provider_media_select_own" on storage.objects;
create policy "provider_media_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'provider-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2) Kereső / foglalási oldal láthatósága.
-- Eddig minden új szolgáltató booking_enabled = false-szal indult, és a
-- jóváhagyás sem kapcsolta be — így jóváhagyás után is rejtve maradt a
-- keresőben és a foglalási oldala 404-et adott, amíg a szolgáltató meg
-- nem találta a "Link szerkesztése → Foglalási oldal aktív" kapcsolót.
-- A láthatóságot a jóváhagyás (status = 'active') már úgyis kapuzza, ez
-- a kapcsoló a szolgáltató saját "szüneteltetés" lehetősége marad.
alter table public.providers alter column booking_enabled set default true;

-- Indulás előtti visszatöltés: a meglévő fiókok is bekapcsolt foglalási
-- oldallal induljanak (aki szüneteltetni akarja, a Megosztás oldalon
-- kikapcsolhatja).
update public.providers set booking_enabled = true where booking_enabled = false;

commit;
