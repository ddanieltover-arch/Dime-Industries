-- 0003_qa_hardening.sql
-- QA Mode audit fixes. Apply after 0001_init.sql + 0002_auth_sync_trigger.sql
-- + rls_policies.sql. Each block below corresponds to a specific finding in
-- DIME-QA-Audit-Report.md — see that document for the reasoning; this file
-- is the mechanical delta.
--
-- Idempotent: safe to re-run after a current rls_policies.sql (which already
-- backports several of these fixes).

begin;

-- ---------------------------------------------------------------------------
-- Finding: wholesale_accounts had no uniqueness constraint — a user could
-- submit multiple applications, creating ambiguity for which account governs
-- their orders/pricing.
-- ---------------------------------------------------------------------------
drop index if exists wholesale_accounts_user_idx;
create unique index if not exists wholesale_accounts_user_unique on wholesale_accounts(user_id);

-- ---------------------------------------------------------------------------
-- Finding: orders.payment_terms had no check constraint, and nothing tied
-- "has payment terms" to "is a wholesale order."
-- ---------------------------------------------------------------------------
alter table orders drop constraint if exists orders_payment_terms_check;
alter table orders
  add constraint orders_payment_terms_check
  check (payment_terms is null or payment_terms in ('net30','net60','upfront'));

alter table orders drop constraint if exists orders_wholesale_terms_consistency;
alter table orders
  add constraint orders_wholesale_terms_consistency
  check (wholesale_account_id is not null or payment_terms is null);

-- ---------------------------------------------------------------------------
-- Finding: nothing prevented a user from submitting unlimited reviews for
-- the same product.
-- ---------------------------------------------------------------------------
create unique index if not exists reviews_product_user_unique on reviews(product_id, user_id);

-- ---------------------------------------------------------------------------
-- Finding (critical): orders_owner_insert's WITH CHECK validated that the
-- order's user_id belonged to the caller, but never validated that a
-- supplied wholesale_account_id also belonged to the caller. Since Supabase
-- exposes the table directly to PostgREST, any authenticated retail
-- customer could have crafted an insert referencing another user's approved
-- wholesale account and received wholesale pricing/terms on their order.
-- ---------------------------------------------------------------------------
drop policy if exists orders_owner_insert on orders;
create policy orders_owner_insert on orders for insert
  with check (
    (user_id = auth.uid() or current_user_role() = 'admin')
    and (
      wholesale_account_id is null
      or exists (
        select 1 from wholesale_accounts wa
        where wa.id = orders.wholesale_account_id
          and wa.user_id = auth.uid()
          and wa.approved = true
      )
      or current_user_role() = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- Finding (functional bug): order_items had a SELECT policy but no INSERT
-- policy. With RLS enabled and no matching policy, Postgres denies by
-- default — meaning checkout using the normal authenticated client (not the
-- service-role key) would have failed on every single order.
-- ---------------------------------------------------------------------------
drop policy if exists order_items_insert_via_order on order_items;
create policy order_items_insert_via_order on order_items for insert
  with check (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or current_user_role() = 'admin')
    )
  );

-- ---------------------------------------------------------------------------
-- Finding (data leak): coupons_active_read let any caller `select code from
-- coupons` and enumerate every currently active promo code — including
-- ones never publicly advertised. Replaced with admin-only table access
-- plus a narrow validation function.
-- ---------------------------------------------------------------------------
drop policy if exists coupons_active_read on coupons;
drop policy if exists coupons_admin_write on coupons;
drop policy if exists coupons_admin_only on coupons;
create policy coupons_admin_only on coupons for all
  using (current_user_role() = 'admin') with check (current_user_role() = 'admin');

create or replace function public.validate_coupon(p_code text)
returns table (valid boolean, type text, value integer, coupon_id uuid) as $$
  select
    (c.id is not null
      and now() between coalesce(c.starts_at, 'epoch'::timestamptz) and coalesce(c.ends_at, 'infinity'::timestamptz)
      and (c.usage_limit is null or c.used_count < c.usage_limit)
    ) as valid,
    c.type,
    c.value,
    c.id
  from coupons c
  where c.code = p_code;
$$ language sql stable security definer set search_path = public;

grant execute on function public.validate_coupon(text) to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Finding (defensive clarity): inventory_status relied on Postgres's
-- implicit default for view RLS behavior. Made explicit so a future
-- Postgres version changing that default can't silently alter what this
-- view exposes.
-- ---------------------------------------------------------------------------
create or replace view inventory_status
  with (security_invoker = false) as
  select variant_id, jurisdiction,
    case
      when quantity_on_hand <= 0 then 'out_of_stock'
      when quantity_on_hand < 10 then 'low_stock'
      else 'in_stock'
    end as status
  from inventory;

commit;
