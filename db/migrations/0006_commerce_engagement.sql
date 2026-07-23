-- 0006_commerce_engagement.sql
-- Sprint 12: durable loyalty, affiliate, catalog overrides.
-- Service-role / DATABASE_URL only.

create table if not exists commerce_loyalty (
  email text primary key,
  points_balance integer not null default 0,
  lifetime_earned integer not null default 0,
  tier text not null default 'standard'
    check (tier in ('standard','reserve','connoisseur')),
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists commerce_affiliates (
  email text primary key,
  referral_code text not null,
  clicks integer not null default 0,
  conversions integer not null default 0,
  earned_cents integer not null default 0,
  commission_bps integer not null default 1000,
  updated_at timestamptz not null default now()
);
create unique index if not exists commerce_affiliates_code_unique
  on commerce_affiliates (referral_code);

create table if not exists commerce_catalog_overrides (
  product_id text primary key,
  override jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table commerce_loyalty enable row level security;
alter table commerce_affiliates enable row level security;
alter table commerce_catalog_overrides enable row level security;
