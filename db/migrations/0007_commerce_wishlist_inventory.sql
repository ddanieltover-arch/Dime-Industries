-- 0007_commerce_wishlist_inventory.sql
-- Sprint 13: durable wishlists + atomic inventory reservation.
-- Service-role / DATABASE_URL only.

create table if not exists commerce_wishlists (
  owner_key text primary key,
  variant_ids jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists commerce_inventory (
  variant_id text primary key,
  quantity_on_hand integer not null default 0
    check (quantity_on_hand >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists commerce_inventory_reservations (
  order_id text primary key,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'reserved'
    check (status in ('reserved','committed','released')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table commerce_wishlists enable row level security;
alter table commerce_inventory enable row level security;
alter table commerce_inventory_reservations enable row level security;
