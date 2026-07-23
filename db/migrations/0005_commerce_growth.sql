-- 0005_commerce_growth.sql
-- Sprint 11: durable carts, CMS, blog, coupons (snapshot tables).
-- Service-role / DATABASE_URL only — no anon policies.

create table if not exists commerce_carts (
  owner_key text primary key,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists commerce_cms_pages (
  slug text primary key,
  title text not null,
  body text not null,
  status text not null default 'draft'
    check (status in ('draft','published')),
  updated_at timestamptz not null default now()
);

create table if not exists commerce_blog_posts (
  slug text primary key,
  title text not null,
  excerpt text not null,
  body text not null,
  status text not null default 'draft'
    check (status in ('draft','published')),
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists commerce_coupons (
  id text primary key,
  code text not null,
  type text not null check (type in ('percentage','fixed')),
  value integer not null,
  min_subtotal_cents integer not null default 0,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer,
  used_count integer not null default 0
);
create unique index if not exists commerce_coupons_code_unique on commerce_coupons (code);

alter table commerce_carts enable row level security;
alter table commerce_cms_pages enable row level security;
alter table commerce_blog_posts enable row level security;
alter table commerce_coupons enable row level security;
