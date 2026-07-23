# Sprint 12 Progress Report — Loyalty/Affiliate + Catalog Overrides DB

**Date:** 2026-07-21  
**Status:** Implementation complete — awaiting owner review / Sprint 12 exit approval

---

## Completed deliverables

| Area | Deliverable |
|---|---|
| Migration | `0006_commerce_engagement.sql` |
| Loyalty (D-12) | `commerce_loyalty` + store DB branch |
| Affiliate (D-12) | `commerce_affiliates`; `dime_ref` cookie kept for attribution |
| Catalog (D-13) | `commerce_catalog_overrides` |
| Launch | `growth_persistence` + `persistence_mode` updated |
| Debt | D-12 / D-13 marked Done |

## Enable

Set `DATABASE_URL`, apply migrations `0004`–`0006`, leave `ORDERS_PERSISTENCE=auto`.

## Verify

```bash
npx vitest run && npx tsc --noEmit
# With DATABASE_URL: adjust loyalty in admin → new browser still shows balance
# Affiliate /r/CODE click → conversions survive new session
# Admin catalog price edit → storefront reflects across instances
```

## Remaining debt

Wishlist DB, D-14 inventory reservation, Phase 2 wholesale / live COA.

## Recommendation

Approve Sprint 12 exit. Next: **Sprint 13 — wishlist DB + inventory reservation**, or **owner production cutover**.
