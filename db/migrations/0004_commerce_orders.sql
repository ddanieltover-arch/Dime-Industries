-- 0004_commerce_orders.sql
-- Soft-launch durable checkout orders (Sprint 10).
-- Stores the full CheckoutOrder snapshot as JSONB so seed-catalog string
-- variant IDs do not need to match product_variants UUID FKs yet.
-- Access is service-role / DATABASE_URL only (no anon policies).

create table if not exists commerce_orders (
  id text primary key,
  status text not null,
  email text not null,
  jurisdiction text not null,
  payload jsonb not null,
  payment_request_id text,
  payment_mode text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commerce_orders_status_check
    check (status in ('pending','payment_confirmed','cancelled','rejected')),
  constraint commerce_orders_jurisdiction_check
    check (jurisdiction in ('CA','MA')),
  constraint commerce_orders_payment_mode_check
    check (payment_mode is null or payment_mode in ('live','mock'))
);

create index if not exists commerce_orders_email_created_idx
  on commerce_orders (email, created_at desc);

create unique index if not exists commerce_orders_payment_request_uidx
  on commerce_orders (payment_request_id)
  where payment_request_id is not null;

alter table commerce_orders enable row level security;

-- No policies for anon/authenticated — server uses DATABASE_URL / service role.
-- Intentional: webhooks and checkout writes must not go through PostgREST as the shopper.
