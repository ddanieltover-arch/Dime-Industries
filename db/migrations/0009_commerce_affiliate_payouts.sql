-- 0009_commerce_affiliate_payouts.sql
-- Sprint 15: affiliate payout ledger.

create table if not exists commerce_affiliate_payouts (
  id text primary key,
  email text not null,
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'pending'
    check (status in ('pending','paid','rejected')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists commerce_affiliate_payouts_email_idx
  on commerce_affiliate_payouts (email, created_at desc);

alter table commerce_affiliate_payouts enable row level security;
