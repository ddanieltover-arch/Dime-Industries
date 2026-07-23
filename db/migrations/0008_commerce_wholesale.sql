-- 0008_commerce_wholesale.sql
-- Sprint 14 / Phase 2: wholesale accounts + price overrides.
-- Service-role / DATABASE_URL only.

create table if not exists commerce_wholesale_accounts (
  email text primary key,
  business_name text not null,
  license_number text,
  resale_cert_url text,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  default_payment_terms text not null default 'net30'
    check (default_payment_terms in ('net30','net60','upfront')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists commerce_wholesale_price_overrides (
  variant_id text primary key,
  price_cents integer not null check (price_cents >= 0),
  min_quantity integer not null default 5 check (min_quantity >= 1),
  updated_at timestamptz not null default now()
);

alter table commerce_wholesale_accounts enable row level security;
alter table commerce_wholesale_price_overrides enable row level security;
