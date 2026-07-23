# Sprint 14 Progress Report — Phase 2 Wholesale (D-20)

**Date:** 2026-07-23  
**Status:** Implementation complete — awaiting owner review / Sprint 14 exit approval

---

## Completed deliverables

| Area | Deliverable |
|---|---|
| Migration | `0008_commerce_wholesale.sql` |
| Apply | `/wholesale` application form |
| Admin | `/admin/wholesale` approve/reject + price overrides |
| Shop | `/wholesale/shop` gated catalog (MOQ + ~30% off) |
| Checkout | `/wholesale/checkout` — NET-30/60 invoice accept or Paybis upfront |
| Auth | Demo role `wholesale`; middleware shop gate = signed-in buyer |
| Orders | `channel`, `paymentTerms`, `paymentMethod: net_terms` on order payload |
| Tests | Wholesale pricing + role gate unit tests |

## Enable

Apply migration `0008` (with prior `0004`–`0007`). Cookie fallback works without `DATABASE_URL`.

## Verify

```bash
npx vitest run && npx tsc --noEmit
# Demo login role Wholesale → /wholesale/shop
# Or apply → admin approve → shop → NET checkout → confirmation
```

## Out of scope (still open)

D-21 COA/Rewards APIs, D-22 loyalty redemption, D-23 affiliate payouts, D-24 load test, full AR aging UI.

## Recommendation

Approve Sprint 14 / Phase 2 wholesale exit. Next: **owner production cutover**, or **D-22 loyalty redemption** / **D-21 integrations**.
