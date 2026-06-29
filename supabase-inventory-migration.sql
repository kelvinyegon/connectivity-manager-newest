

create table if not exists public.inventory_items (
  id bigint generated always as identity primary key,
  institution_id bigint not null references public.institutions(id) on delete cascade,
  equipment_type text not null check (
    equipment_type in ('site_switch', 'access_switch', 'router', 'ups', 'tx_equipment')
  ),
  tx_type text check (tx_type is null or tx_type in ('DWDM', 'OSN')),
  equipment_name text not null,
  model text,
  oem text,
  serial_number text,
  quantity integer not null default 1 check (quantity > 0),
  connected_router_count integer check (connected_router_count is null or connected_router_count >= 0),
  ups_capacity text,
  status text not null default 'Active' check (
    status in ('Active', 'Inactive', 'Faulty', 'Under Maintenance', 'Decommissioned')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_tx_type_required check (
    (equipment_type = 'tx_equipment' and tx_type is not null)
    or (equipment_type <> 'tx_equipment' and tx_type is null)
  )
);

create unique index if not exists inventory_serial_number_unique
  on public.inventory_items (lower(serial_number))
  where serial_number is not null and btrim(serial_number) <> '';

create index if not exists inventory_items_institution_id_idx
  on public.inventory_items (institution_id);

create index if not exists inventory_items_equipment_type_idx
  on public.inventory_items (equipment_type);

create or replace function public.set_inventory_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists inventory_items_updated_at on public.inventory_items;
create trigger inventory_items_updated_at
before update on public.inventory_items
for each row execute function public.set_inventory_updated_at();

alter table public.inventory_items enable row level security;

drop policy if exists "Authenticated users can view inventory" on public.inventory_items;
drop policy if exists "Admins can insert inventory" on public.inventory_items;
drop policy if exists "Admins can update inventory" on public.inventory_items;
drop policy if exists "Admins can delete inventory" on public.inventory_items;

create policy "Authenticated users can view inventory"
on public.inventory_items
for select
to authenticated
using (true);

create policy "Admins can insert inventory"
on public.inventory_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can update inventory"
on public.inventory_items
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can delete inventory"
on public.inventory_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

