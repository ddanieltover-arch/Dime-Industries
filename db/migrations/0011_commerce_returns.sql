-- 0011_commerce_returns.sql
-- Customer return / refund requests against commerce_orders.

create table if not exists commerce_returns (
  id text primary key,
  order_id text not null,
  email text not null,
  status text not null default 'requested'
    check (status in ('requested','approved','denied','refunded')),
  reason text not null
    check (reason in ('defective_hardware','wrong_item','damaged_shipping','other')),
  details text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists commerce_returns_email_idx
  on commerce_returns (email, created_at desc);

create index if not exists commerce_returns_order_idx
  on commerce_returns (order_id);

create index if not exists commerce_returns_status_idx
  on commerce_returns (status, created_at desc);

alter table commerce_returns enable row level security;
