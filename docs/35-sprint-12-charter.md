# Sprint 12 Charter — Loyalty/Affiliate + Catalog Overrides DB

**Status:** Complete (pending owner exit approval)  
**Prior:** Sprint 11 exit approved  
**Exit gate:** Loyalty + affiliate accounts durable in Postgres; catalog overrides durable; cookie fallback when DATABASE_URL unset

---

## Scope (IN)

- D-12: `commerce_loyalty`, `commerce_affiliates` (+ referral click cookie retained)
- D-13: `commerce_catalog_overrides`
- Migration `0006_commerce_engagement.sql`
- Launch-status + debt backlog updates
- Unit tests + progress doc

## Scope (OUT)

- D-14 inventory reservation
- Wishlist UUID FK wiring
- Wholesale Phase 2

## Task board

| Task ID | Title | Status |
|---|---|---|
| T-1201 | Migration + schema | Done |
| T-1202 | Loyalty + affiliate DB | Done |
| T-1203 | Catalog overrides DB | Done |
| T-1210 | Tests + docs | Done |
