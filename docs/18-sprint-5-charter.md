# Sprint 5 Charter — Admin Dashboard

**Status:** Active (authorized 2026-07-20)  
**Prior:** Sprint 4 exit approved  
**Exit gate:** Admin shell with catalog, inventory, orders, reviews moderation (stubs OK where DB not wired)

---

## Scope (IN)

- Admin demo role when Supabase unset; Supabase admin role when configured
- `/admin` dashboard KPIs (orders, revenue, catalog counts)
- `/admin/products` — list + edit status/price/stock overrides
- `/admin/orders` — list + status updates
- `/admin/inventory` — low-stock view + quantity adjustments
- `/admin/reviews` — moderation queue (seed + approve/reject)
- `/admin/customers` — stub list from demo signals
- Audit note on admin mutations (console + in-memory log)

## Scope (OUT)

- Full CMS (Sprint 6)
- Coupons/loyalty admin (Sprint 6)
- Analytics charts beyond KPI tiles
- Real Supabase table writes (override store until staging DB)

## Task board

| Task ID | Title | Status |
|---|---|---|
| T-501 | Admin role on demo session + middleware | Done |
| T-502 | Admin layout + dashboard | Done |
| T-503 | Products + inventory admin | Done |
| T-504 | Orders admin | Done |
| T-505 | Reviews moderation | Done |
| T-510 | Tests + docs | Done |
