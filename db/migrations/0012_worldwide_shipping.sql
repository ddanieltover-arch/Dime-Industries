-- 0012_worldwide_shipping.sql
-- Worldwide checkout: denormalized ship/tax columns on commerce_orders,
-- country on addresses, and shipping_rates / country_tax_rates config rows.

begin;

-- ---------------------------------------------------------------------------
-- commerce_orders: queryable shipping destination + pricing snapshot columns
-- (full CheckoutOrder remains in payload jsonb)
-- ---------------------------------------------------------------------------
alter table commerce_orders
  add column if not exists ship_country text,
  add column if not exists ship_state text,
  add column if not exists shipping_cents integer,
  add column if not exists tax_cents integer,
  add column if not exists tax_rate_bps integer,
  add column if not exists shipping_label text,
  add column if not exists tax_label text,
  add column if not exists subtotal_cents integer,
  add column if not exists total_cents integer;

-- Backfill from existing payload snapshots
update commerce_orders
set
  ship_country = coalesce(upper(payload->'address'->>'country'), 'US'),
  ship_state = coalesce(payload->'address'->>'state', ''),
  shipping_cents = coalesce((payload->>'shippingCents')::integer, 0),
  tax_cents = coalesce((payload->>'taxCents')::integer, 0),
  tax_rate_bps = coalesce((payload->>'taxRateBps')::integer, 0),
  shipping_label = payload->>'shippingLabel',
  tax_label = payload->>'taxLabel',
  subtotal_cents = coalesce((payload->>'subtotalCents')::integer, 0),
  total_cents = coalesce((payload->>'totalCents')::integer, 0)
where ship_country is null;

create index if not exists commerce_orders_ship_country_idx
  on commerce_orders (ship_country);

create index if not exists commerce_orders_ship_state_idx
  on commerce_orders (ship_state);

-- ---------------------------------------------------------------------------
-- addresses: support international ship-to
-- ---------------------------------------------------------------------------
alter table addresses
  add column if not exists country text not null default 'US';

create index if not exists addresses_country_idx on addresses (country);

-- ---------------------------------------------------------------------------
-- Shipping rate config (site_settings)
-- ---------------------------------------------------------------------------
insert into site_settings (key, value)
values (
  'shipping_rates',
  '{"usFlatCents":1200,"intlFlatCents":2500,"freeThresholdCents":30000}'::jsonb
)
on conflict (key) do update
set value = excluded.value;

-- ---------------------------------------------------------------------------
-- Country tax rate estimates (basis points) for admin/reporting parity
-- ---------------------------------------------------------------------------
create table if not exists country_tax_rates (
  country_code text primary key,
  tax_rate_bps integer not null check (tax_rate_bps >= 0),
  updated_at timestamptz not null default now()
);

alter table country_tax_rates enable row level security;

-- Seed / upsert a representative set matching app COUNTRY_TAX_RATE_BPS
insert into country_tax_rates (country_code, tax_rate_bps) values
  ('US', 0),
  ('CA', 500),
  ('GB', 2000),
  ('AU', 1000),
  ('NZ', 1500),
  ('IE', 2300),
  ('DE', 1900),
  ('FR', 2000),
  ('ES', 2100),
  ('IT', 2200),
  ('NL', 2100),
  ('BE', 2100),
  ('AT', 2000),
  ('CH', 810),
  ('SE', 2500),
  ('NO', 2500),
  ('DK', 2500),
  ('FI', 2550),
  ('PT', 2300),
  ('PL', 2300),
  ('CZ', 2100),
  ('MX', 1600),
  ('BR', 1700),
  ('AR', 2100),
  ('CL', 1900),
  ('CO', 1900),
  ('JP', 1000),
  ('KR', 1000),
  ('SG', 900),
  ('HK', 0),
  ('TW', 500),
  ('AE', 500),
  ('IL', 1700),
  ('ZA', 1500),
  ('IN', 1800),
  ('PH', 1200),
  ('TH', 700),
  ('MY', 800),
  ('ID', 1100),
  ('PR', 1150)
on conflict (country_code) do update
set tax_rate_bps = excluded.tax_rate_bps,
    updated_at = now();

commit;
