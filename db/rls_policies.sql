-- rls_policies.sql
-- DIME Enterprise Commerce Platform — Supabase Row-Level Security
-- Apply after 0001_init.sql. This is the hard access-control boundary (Security Architecture §8) —
-- route-level guards in the API layer are defense-in-depth, not a substitute for these.

begin;

-- Helper: current caller's role, read from the users table via auth.uid()
create or replace function current_user_role() returns text as $$
  select role from users where id = auth.uid();
$$ language sql stable security definer;

-- Helper: current caller's resolved jurisdiction (session/account level)
create or replace function current_user_jurisdiction() returns text as $$
  select jurisdiction from users where id = auth.uid();
$$ language sql stable security definer;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
alter table users enable row level security;

create policy users_select_own on users for select
  using (id = auth.uid() or current_user_role() = 'admin');

create policy users_update_own on users for update
  using (id = auth.uid() or current_user_role() = 'admin');

-- inserts happen via the auth trigger / server-side service role only
create policy users_insert_service on users for insert
  with check (current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- addresses
-- ---------------------------------------------------------------------------
alter table addresses enable row level security;

create policy addresses_owner_all on addresses for all
  using (user_id = auth.uid() or current_user_role() = 'admin')
  with check (user_id = auth.uid() or current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- categories / product_lines — public read, admin write
-- ---------------------------------------------------------------------------
alter table categories enable row level security;
alter table product_lines enable row level security;

create policy categories_public_read on categories for select using (true);
create policy categories_admin_write on categories for all
  using (current_user_role() = 'admin') with check (current_user_role() = 'admin');

create policy product_lines_public_read on product_lines for select using (true);
create policy product_lines_admin_write on product_lines for all
  using (current_user_role() = 'admin') with check (current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- products — jurisdiction-gated public read, admin write
-- ---------------------------------------------------------------------------
alter table products enable row level security;

create policy products_jurisdiction_read on products for select
  using (
    status = 'active'
    and (
      allowed_jurisdictions = '{}'
      or current_user_jurisdiction() = any (allowed_jurisdictions)
      or current_user_role() = 'admin'
    )
  );

create policy products_admin_write on products for all
  using (current_user_role() = 'admin') with check (current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- product_variants / product_potency / coa_records — inherit product visibility
-- ---------------------------------------------------------------------------
alter table product_variants enable row level security;
alter table product_potency enable row level security;
alter table coa_records enable row level security;

create policy variants_read_via_product on product_variants for select
  using (
    exists (
      select 1 from products p
      where p.id = product_variants.product_id
        and p.status = 'active'
        and (p.allowed_jurisdictions = '{}' or current_user_jurisdiction() = any (p.allowed_jurisdictions))
    )
    or current_user_role() = 'admin'
  );
create policy variants_admin_write on product_variants for all
  using (current_user_role() = 'admin') with check (current_user_role() = 'admin');

create policy potency_public_read on product_potency for select using (true);
create policy potency_admin_write on product_potency for all
  using (current_user_role() = 'admin') with check (current_user_role() = 'admin');

create policy coa_public_read on coa_records for select using (true);
create policy coa_admin_write on coa_records for all
  using (current_user_role() = 'admin') with check (current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- inventory — no public read of raw quantities (avoid leaking stock levels)
-- ---------------------------------------------------------------------------
alter table inventory enable row level security;

create policy inventory_admin_only on inventory for all
  using (current_user_role() = 'admin') with check (current_user_role() = 'admin');

-- expose a derived, non-numeric status via a view instead of raw quantity.
-- security_invoker = false (explicit, not relying on Postgres's default) is
-- intentional here: the view must run as its owner to see past inventory's
-- admin-only RLS at all, and it's safe because the SELECT list only ever
-- exposes the derived status enum, never quantity_on_hand itself.
create or replace view inventory_status
  with (security_invoker = false) as
  select variant_id, jurisdiction,
    case
      when quantity_on_hand <= 0 then 'out_of_stock'
      when quantity_on_hand < 10 then 'low_stock'
      else 'in_stock'
    end as status
  from inventory;
grant select on inventory_status to authenticated, anon;

-- ---------------------------------------------------------------------------
-- wishlists — owner only
-- ---------------------------------------------------------------------------
alter table wishlists enable row level security;

create policy wishlists_owner_all on wishlists for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- coupons — NOT publicly readable as a table. The original version of this
-- policy allowed any authenticated/anon caller to `select code from coupons`
-- and enumerate every currently active promo code — a real leak, not a
-- theoretical one, since PostgREST exposes tables directly. Fixed: the table
-- itself is admin-only; checkout validates a specific code (that the caller
-- already claims to have) through a narrow function instead, which reveals
-- nothing about codes the caller didn't already provide.
-- ---------------------------------------------------------------------------
alter table coupons enable row level security;

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
-- wholesale_accounts / wholesale_pricing_tiers
-- ---------------------------------------------------------------------------
alter table wholesale_accounts enable row level security;
alter table wholesale_pricing_tiers enable row level security;

create policy wholesale_accounts_owner on wholesale_accounts for select
  using (user_id = auth.uid() or current_user_role() = 'admin');
create policy wholesale_accounts_owner_insert on wholesale_accounts for insert
  with check (user_id = auth.uid());
create policy wholesale_accounts_admin_update on wholesale_accounts for update
  using (current_user_role() = 'admin');

create policy wholesale_pricing_owner_read on wholesale_pricing_tiers for select
  using (
    exists (
      select 1 from wholesale_accounts wa
      where wa.id = wholesale_pricing_tiers.wholesale_account_id
        and (wa.user_id = auth.uid() or current_user_role() = 'admin')
    )
  );
create policy wholesale_pricing_admin_write on wholesale_pricing_tiers for all
  using (current_user_role() = 'admin') with check (current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- orders / order_items / returns — owner (retail or wholesale) + admin
-- ---------------------------------------------------------------------------
alter table orders enable row level security;
alter table order_items enable row level security;
alter table returns enable row level security;

create policy orders_owner_read on orders for select
  using (
    user_id = auth.uid()
    or current_user_role() = 'admin'
    or exists (
      select 1 from wholesale_accounts wa
      where wa.id = orders.wholesale_account_id and wa.user_id = auth.uid()
    )
  );
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
create policy orders_admin_update on orders for update
  using (current_user_role() = 'admin'); -- status transitions happen server-side only

create policy order_items_via_order on order_items for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or current_user_role() = 'admin')
    )
  );

-- Without this, checkout using the normal authenticated client (not the
-- service-role key) would fail every insert with no explicit error beyond
-- "0 rows affected" — RLS denies by default when a table has RLS enabled
-- and no policy matches the operation. Scoped to: the item's parent order
-- must belong to the caller (or caller is admin), same ownership rule as
-- the order itself.
create policy order_items_insert_via_order on order_items for insert
  with check (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or current_user_role() = 'admin')
    )
  );

create policy returns_owner_all on returns for all
  using (
    exists (
      select 1 from orders o
      where o.id = returns.order_id and (o.user_id = auth.uid() or current_user_role() = 'admin')
    )
  );

-- ---------------------------------------------------------------------------
-- loyalty_accounts / affiliate_accounts — owner only, sync fields admin/service only
-- ---------------------------------------------------------------------------
alter table loyalty_accounts enable row level security;
alter table affiliate_accounts enable row level security;

create policy loyalty_owner_read on loyalty_accounts for select
  using (user_id = auth.uid() or current_user_role() = 'admin');
create policy loyalty_service_write on loyalty_accounts for all
  using (current_user_role() = 'admin') with check (current_user_role() = 'admin');

create policy affiliate_owner_read on affiliate_accounts for select
  using (user_id = auth.uid() or current_user_role() = 'admin');
create policy affiliate_owner_insert on affiliate_accounts for insert
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- reviews — public read of approved reviews, owner can write their own
-- ---------------------------------------------------------------------------
alter table reviews enable row level security;

create policy reviews_public_read on reviews for select
  using (status = 'approved' or user_id = auth.uid() or current_user_role() = 'admin');
create policy reviews_owner_insert on reviews for insert
  with check (user_id = auth.uid());
create policy reviews_admin_moderate on reviews for update
  using (current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- cms_pages / site_settings — public read of published, admin write
-- ---------------------------------------------------------------------------
alter table cms_pages enable row level security;
alter table site_settings enable row level security;

create policy cms_published_read on cms_pages for select
  using (status = 'published' or current_user_role() = 'admin');
create policy cms_admin_write on cms_pages for all
  using (current_user_role() = 'admin') with check (current_user_role() = 'admin');

create policy settings_admin_only on site_settings for all
  using (current_user_role() = 'admin') with check (current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- audit_logs — admin read only, service-role insert only
-- ---------------------------------------------------------------------------
alter table audit_logs enable row level security;

create policy audit_logs_admin_read on audit_logs for select
  using (current_user_role() = 'admin');
-- no insert/update/delete policy for regular roles — writes go through the
-- service-role key from server-side code only.

commit;
