create extension if not exists pgcrypto;

create table public.providers (
  id uuid primary key references auth.users (id) on delete cascade,
  business_name text not null,
  category text,
  city text,
  phone text,
  description text,
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.provider_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id) on delete cascade,
  name text not null,
  price_huf integer not null check (price_huf >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  created_at timestamptz not null default now()
);

alter table public.providers enable row level security;
alter table public.provider_services enable row level security;

-- Nincs INSERT policy a providers táblán szándékosan — sor csak a lenti
-- SECURITY DEFINER trigger által jöhet létre (megkerüli az RLS-t).
create policy "providers_select_own" on public.providers
  for select using (auth.uid() = id);
create policy "providers_update_own" on public.providers
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "provider_services_select_own" on public.provider_services
  for select using (auth.uid() = provider_id);
create policy "provider_services_insert_own" on public.provider_services
  for insert with check (auth.uid() = provider_id);
create policy "provider_services_update_own" on public.provider_services
  for update using (auth.uid() = provider_id) with check (auth.uid() = provider_id);
create policy "provider_services_delete_own" on public.provider_services
  for delete using (auth.uid() = provider_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger providers_set_updated_at
before update on public.providers
for each row execute function public.set_updated_at();

-- új regisztrációnál automatikusan létrehoz egy 'draft' providers sort
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.providers (id, business_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'business_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
