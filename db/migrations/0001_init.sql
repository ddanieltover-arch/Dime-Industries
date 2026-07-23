-- Migration 0001_init.sql
-- DIME Enterprise Commerce Platform — initial schema
-- Generated to match db/schema.ts. Apply via drizzle-kit / CI migration gate — never manually against production.

begin;

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Identity & access
-- ---------------------------------------------------------------------------

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  phone text,
  role text not null default 'customer'
    check (role in ('guest','customer','wholesale','admin','vendor')),
  age_verified_at timestamptz,
  jurisdiction text,
  medical_patient boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index users_email_unique on users(email);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  jurisdiction text not null,
  is_default boolean not null default false
);
create index addresses_user_idx on addresses(user_id);
create index addresses_jurisdiction_idx on addresses(jurisdiction);

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null
);
create unique index categories_slug_unique on categories(slug);

create table product_lines (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null
);
create unique index product_lines_slug_unique on product_lines(slug);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  category_id uuid not null references categories(id),
  line_id uuid references product_lines(id),
  strain_type text check (strain_type in ('sativa','indica','hybrid','na')),
  description text,
  status text not null default 'draft' check (status in ('draft','active','archived')),
  allowed_jurisdictions text[] not null default '{}',
  created_at timestamptz not null default now()
);
create unique index products_slug_unique on products(slug);
create index products_category_status_idx on products(category_id, status);
create index products_jurisdiction_gin_idx on products using gin (allowed_jurisdictions);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  sku text not null,
  weight_or_format text not null,
  retail_price_cents integer not null check (retail_price_cents >= 0),
  vendor_id uuid,
  created_at timestamptz not null default now()
);
create unique index product_variants_sku_unique on product_variants(sku);
create index product_variants_product_idx on product_variants(product_id);

create table product_potency (
  variant_id uuid primary key references product_variants(id) on delete cascade,
  thc_pct numeric(5,2),
  cbd_pct numeric(5,2),
  cbn_pct numeric(5,2)
);

create table coa_records (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  external_coa_url text not null,
  batch_id text,
  tested_at date,
  synced_at timestamptz not null default now()
);
create index coa_records_product_idx on coa_records(product_id);

create table inventory (
  variant_id uuid not null references product_variants(id) on delete cascade,
  jurisdiction text not null,
  quantity_on_hand integer not null default 0 check (quantity_on_hand >= 0),
  updated_at timestamptz not null default now(),
  primary key (variant_id, jurisdiction)
);

-- ---------------------------------------------------------------------------
-- Wishlist
-- ---------------------------------------------------------------------------

create table wishlists (
  user_id uuid not null references users(id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (user_id, variant_id)
);

-- ---------------------------------------------------------------------------
-- Coupons
-- ---------------------------------------------------------------------------

create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  type text not null check (type in ('percentage','fixed','bogo')),
  value integer not null,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer,
  used_count integer not null default 0
);
create unique index coupons_code_unique on coupons(code);

-- ---------------------------------------------------------------------------
-- Wholesale
-- ---------------------------------------------------------------------------

create table wholesale_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  business_name text not null,
  resale_cert_url text,
  approved boolean not null default false,
  default_payment_terms text not null default 'upfront'
    check (default_payment_terms in ('net30','net60','upfront')),
  created_at timestamptz not null default now()
);
create index wholesale_accounts_user_idx on wholesale_accounts(user_id);

create table wholesale_pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  wholesale_account_id uuid references wholesale_accounts(id) on delete cascade,
  variant_id uuid references product_variants(id),
  price_cents integer not null,
  min_quantity integer not null default 1
);
create unique index wholesale_pricing_account_variant_unique
  on wholesale_pricing_tiers(wholesale_account_id, variant_id);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  wholesale_account_id uuid references wholesale_accounts(id),
  status text not null default 'pending'
    check (status in ('pending','payment_confirmed','fulfilling','shipped','delivered',
                       'return_requested','returned','cancelled')),
  address_id uuid references addresses(id),
  coupon_id uuid references coupons(id),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  tax_cents integer not null check (tax_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  payment_method text not null default 'paybis_btc',
  payment_terms text,
  created_at timestamptz not null default now()
);
create index orders_user_created_idx on orders(user_id, created_at desc);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  variant_id uuid not null references product_variants(id),
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null
);
create index order_items_order_idx on order_items(order_id);

create table returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  reason text,
  status text not null default 'requested'
    check (status in ('requested','approved','rejected','completed')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Loyalty & affiliate
-- ---------------------------------------------------------------------------

create table loyalty_accounts (
  user_id uuid primary key references users(id) on delete cascade,
  points_balance integer not null default 0,
  tier text not null default 'standard',
  synced_with_dime_rewards_at timestamptz
);

create table affiliate_accounts (
  user_id uuid primary key references users(id) on delete cascade,
  referral_code text not null,
  payout_terms text,
  total_earned_cents integer not null default 0
);
create unique index affiliate_accounts_code_unique on affiliate_accounts(referral_code);

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------

create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references users(id),
  rating integer not null check (rating between 1 and 5),
  body text,
  verified_purchase boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create index reviews_product_idx on reviews(product_id);

-- ---------------------------------------------------------------------------
-- CMS & settings
-- ---------------------------------------------------------------------------

create table cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  blocks jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  updated_at timestamptz not null default now()
);
create unique index cms_pages_slug_unique on cms_pages(slug);

create table site_settings (
  key text primary key,
  value jsonb not null
);

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  diff jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_entity_idx on audit_logs(entity, entity_id);
create index audit_logs_created_idx on audit_logs(created_at);

commit;
