# Sprint 13 Progress Report — Wishlist DB + Inventory Reservation

**Date:** 2026-07-23  
**Status:** Implementation complete — awaiting owner review / Sprint 13 exit approval

---

## Completed deliverables

| Area | Deliverable |
|---|---|
| Migration | `0007_commerce_wishlist_inventory.sql` |
| Wishlist | `commerce_wishlists`; merge guest cookie on login |
| Inventory (D-14) | `commerce_inventory` + reservations; atomic decrement on checkout |
| Release paths | Paybis reject/cancel, payment_failed checkout return, failed reserve |
| Commit path | Mock pay + Paybis completed webhook |
| Catalog | `loadEffectiveCatalog` overlays durable stock |
| Launch | `inventory_reservation` check; growth/persistence messages updated |
| Debt | D-14 marked Done |

## Enable

Set `DATABASE_URL`, apply migrations `0004`–`0007`, leave `ORDERS_PERSISTENCE=auto`.

## Verify

```bash
npx vitest run && npx tsc --noEmit
# Wishlist: login → toggle → other session as same user → ids present
# Inventory: checkout with DB → stock drops; cancel/payment_failed → stock restored
```

## Soft-launch P0/P1 persistence

Cookie-era commerce debt (orders, cart, CMS, coupons, loyalty, affiliate, overrides, wishlist, inventory) is closed when `DATABASE_URL` + migrations are applied.

## Recommendation

Approve Sprint 13 exit. Next: **owner production cutover** (Vercel/DNS + migrate), or Phase 2 wholesale / live COA.
