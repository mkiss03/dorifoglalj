-- ============================================================
-- IdőpontNeked.hu — schema_v8: admin-jogosultság
-- Additív a schema.sql .. schema_v7.sql-hez. Egyszer lefuttatandó a
-- Supabase SQL Editorban, miután az előző scriptek már lefutottak.
--
-- Jelenleg minden auth.users regisztráció automatikusan létrehoz egy
-- providers sort (handle_new_user trigger) — nincs "admin, aki nem
-- szolgáltató" fogalom. Ez a script egy külön admins táblát + egy
-- is_admin() függvényt ad hozzá, a meglévő auth-ra ráépülve, a
-- triggert nem érinti.
--
-- BOOTSTRAP (kézi, egyszeri lépés): Dóri a meglévő /regisztracio
-- folyamattal hoz létre fiókot (emiatt kap egy — nem használt —
-- providers sort is, ez ártalmatlan mellékhatás, a /dashboard automatikusan
-- átirányítja innentől a saját admin felületére). Utána a Supabase SQL
-- Editorban futtatva:
--   insert into public.admins (user_id)
--   select id from auth.users where email = '<Dóri email címe>';
-- Ezután Dóri a /admin/bejelentkezes oldalon léphet be — ez a hivatalos,
-- dedikált admin belépési pont (nem szerepel semmilyen nyilvános menüben).
-- ============================================================

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "admins_select_own" on public.admins;
create policy "admins_select_own" on public.admins
  for select using (auth.uid() = user_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to authenticated;
