# Sprint 13 Charter — Wishlist DB + Inventory Reservation

**Status:** Complete (pending owner exit approval)  
**Prior:** Sprint 12 exit approved  
**Exit gate:** Logged-in wishlists durable in Postgres; checkout reserves stock atomically when DB mode on; cookie fallback when `DATABASE_URL` unset

---

## Scope (IN)

- Wishlist: `commerce_wishlists` + merge guest cookie on login
- D-14: `commerce_inventory` + `commerce_inventory_reservations`; reserve on checkout, release on cancel/reject/payment_failed, commit on paid
- Migration `0007_commerce_wishlist_inventory.sql`
- Overlay durable stock onto effective catalog
- Launch-status + debt backlog + tests

## Scope (OUT)

- Wholesale Phase 2
- Live COA / Rewards APIs
- Load-test soak (D-24)

## Task board

| Task ID | Title | Status |
|---|---|---|
| T-1301 | Migration + schema | Done |
| T-1302 | Wishlist DB + login merge | Done |
| T-1303 | Inventory reserve/release | Done |
| T-1310 | Tests + docs | Done |
