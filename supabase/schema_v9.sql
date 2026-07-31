-- ============================================================
-- IttFoglalj.hu — schema_v9: weboldal-tartalom (élő szerkesztő)
-- Additív a schema.sql .. schema_v8.sql-hez. Egyszer lefuttatandó a
-- Supabase SQL Editorban, miután az előző scriptek (a schema_v8.sql
-- admin-jogosultsága is) már lefutottak.
--
-- Egyetlen általános kulcs→JSONB tábla a marketing oldal minden
-- szerkeszthető szövegéhez/képéhez — a tartalom-alakzatok túl
-- heterogének (sima string, beágyazott szegmens-tömb, listák listája)
-- ahhoz, hogy megérje mezőnkénti relációs sémát építeni. Lásd
-- lib/content/schema.ts a kulcsok és defaultok teljes listájáért.
-- ============================================================

create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.site_content enable row level security;

drop policy if exists "site_content_select_public" on public.site_content;
create policy "site_content_select_public" on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists "site_content_insert_admin" on public.site_content;
create policy "site_content_insert_admin" on public.site_content
  for insert to authenticated with check (public.is_admin());

drop policy if exists "site_content_update_admin" on public.site_content;
create policy "site_content_update_admin" on public.site_content
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "site_content_delete_admin" on public.site_content;
create policy "site_content_delete_admin" on public.site_content
  for delete to authenticated using (public.is_admin());

-- site-media bucket: ugyanaz a minta, mint a provider-media (schema_v3.sql),
-- csak admin-only írással (nincs felhasználónkénti mappa-korlátozás).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

drop policy if exists "site_media_insert_admin" on storage.objects;
create policy "site_media_insert_admin" on storage.objects
  for insert to authenticated with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "site_media_update_admin" on storage.objects;
create policy "site_media_update_admin" on storage.objects
  for update to authenticated using (bucket_id = 'site-media' and public.is_admin())
  with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "site_media_delete_admin" on storage.objects;
create policy "site_media_delete_admin" on storage.objects
  for delete to authenticated using (bucket_id = 'site-media' and public.is_admin());
