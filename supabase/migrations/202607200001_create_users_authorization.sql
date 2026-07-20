create table if not exists public.users (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'owner' check (role in ('owner', 'admin', 'employee', 'client')),
  business_id text null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users can read their own authorization profile"
  on public.users for select
  using (auth.uid() = auth_user_id);

create policy "owners can read authorization profiles"
  on public.users for select
  using (exists (select 1 from public.users owner_profile where owner_profile.auth_user_id = auth.uid() and owner_profile.role = 'owner' and owner_profile.active = true));

revoke all on public.users from anon;
grant select on public.users to authenticated;
