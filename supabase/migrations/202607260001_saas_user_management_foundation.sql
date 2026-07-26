create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

alter table public.users add column if not exists name text;
alter table public.users add column if not exists updated_at timestamptz not null default now();

update public.users
set name = coalesce(nullif(trim(name), ''), split_part(email, '@', 1))
where name is null or trim(name) = '';

update public.users
set business_id = null
where business_id is not null and trim(business_id) = '';

alter table public.users alter column name set not null;

alter table public.users drop constraint if exists users_role_check;
alter table public.users
  add constraint users_role_check
  check (role in ('owner', 'admin', 'sales', 'client', 'demo', 'employee'));

create table if not exists public.businesses (
  id text primary key default gen_random_uuid()::text,
  name text not null check (trim(name) <> ''),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.businesses(id, name)
select distinct business_id, business_id
from public.users
where business_id is not null and trim(business_id) <> ''
on conflict (id) do nothing;

alter table public.users drop constraint if exists users_business_id_fkey;
alter table public.users
  add constraint users_business_id_fkey
  foreign key (business_id) references public.businesses(id) on update cascade on delete set null;

create table if not exists public.business_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(auth_user_id) on delete cascade,
  business_id text not null references public.businesses(id) on update cascade on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, business_id)
);

create index if not exists business_memberships_user_id_idx
  on public.business_memberships(user_id);
create index if not exists business_memberships_business_id_idx
  on public.business_memberships(business_id);
create index if not exists users_business_id_idx
  on public.users(business_id);

insert into public.business_memberships(user_id, business_id)
select auth_user_id, business_id
from public.users
where business_id is not null and trim(business_id) <> ''
on conflict (user_id, business_id) do nothing;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function private.set_updated_at();

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function private.set_updated_at();

create or replace function private.sync_primary_business_membership()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.business_id is not null then
    insert into public.business_memberships(user_id, business_id)
    values (new.auth_user_id, new.business_id)
    on conflict (user_id, business_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists users_sync_primary_business_membership on public.users;
create trigger users_sync_primary_business_membership
after insert or update of business_id on public.users
for each row execute function private.sync_primary_business_membership();

create or replace function private.current_user_is_active()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.users
    where auth_user_id = (select auth.uid())
      and active = true
  );
$$;

create or replace function private.current_user_role()
returns text
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select role
  from public.users
  where auth_user_id = (select auth.uid())
    and active = true
  limit 1;
$$;

create or replace function private.current_user_has_business(target_business_id text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    private.current_user_role() = 'owner'
    or exists (
      select 1
      from public.business_memberships
      where user_id = (select auth.uid())
        and business_id = target_business_id
    );
$$;

create or replace function private.current_user_can_manage_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    private.current_user_role() = 'owner'
    or (
      private.current_user_role() = 'admin'
      and exists (
        select 1
        from public.business_memberships manager_membership
        join public.business_memberships target_membership
          on target_membership.business_id = manager_membership.business_id
        join public.users target_user
          on target_user.auth_user_id = target_membership.user_id
        where manager_membership.user_id = (select auth.uid())
          and target_membership.user_id = target_user_id
          and target_user.role not in ('owner', 'admin')
      )
    );
$$;

create or replace function public.is_active_owner()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select private.current_user_role() = 'owner';
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.users(auth_user_id, name, email, role, active, business_id)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)),
    new.email,
    'client',
    case
      when new.raw_user_meta_data ->> 'provisioning' = 'true' then false
      else true
    end,
    null
  )
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.businesses enable row level security;
alter table public.business_memberships enable row level security;

drop policy if exists "users can read their own authorization profile" on public.users;
drop policy if exists "owners can read authorization profiles" on public.users;
drop policy if exists "active owners can read authorization profiles" on public.users;
drop policy if exists "active owners can update authorization profiles" on public.users;
drop policy if exists "authorized managers can read users" on public.users;
drop policy if exists "authorized managers can update users" on public.users;

create policy "authorized managers can read users"
on public.users for select
to authenticated
using (
  auth_user_id = (select auth.uid())
  or private.current_user_can_manage_user(auth_user_id)
);

drop policy if exists "authorized users can read businesses" on public.businesses;
drop policy if exists "owners can manage businesses" on public.businesses;

create policy "authorized users can read businesses"
on public.businesses for select
to authenticated
using (
  private.current_user_is_active()
  and private.current_user_has_business(id)
);

drop policy if exists "authorized users can read memberships" on public.business_memberships;
drop policy if exists "owners can manage memberships" on public.business_memberships;

create policy "authorized users can read memberships"
on public.business_memberships for select
to authenticated
using (
  private.current_user_is_active()
  and (
    user_id = (select auth.uid())
    or private.current_user_role() = 'owner'
    or (
      private.current_user_role() = 'admin'
      and private.current_user_has_business(business_id)
      and private.current_user_can_manage_user(user_id)
    )
  )
);

revoke all on public.users, public.businesses, public.business_memberships from anon;
grant select on public.users, public.businesses, public.business_memberships to authenticated;
revoke insert, update, delete on public.users, public.businesses, public.business_memberships from authenticated;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.is_active_owner() from public, anon;
grant execute on function public.is_active_owner() to authenticated;

revoke all on all functions in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.current_user_is_active() to authenticated;
grant execute on function private.current_user_role() to authenticated;
grant execute on function private.current_user_has_business(text) to authenticated;
grant execute on function private.current_user_can_manage_user(uuid) to authenticated;
