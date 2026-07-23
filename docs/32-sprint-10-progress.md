# Sprint 10 Progress Report — DB-Backed Orders + Paybis Webhook

**Date:** 2026-07-21  
**Status:** Implementation complete — awaiting owner review / Sprint 10 exit approval

---

## Completed deliverables

| Area | Deliverable |
|---|---|
| Migration | `db/migrations/0004_commerce_orders.sql` |
| Schema | `commerceOrders` in `db/schema.ts` |
| DB client | `lib/db/client.ts` (Drizzle + postgres.js) |
| Repository | Drizzle impl; `ORDERS_PERSISTENCE=auto\|database\|cookie` |
| Webhook | Marks paid/rejected/cancelled when `mode=database`; `persisted` flag |
| Account | Order lists filtered by profile email |
| Admin | Uses repository (sees DB orders when enabled) |
| Launch | `orders_persistence` + `paybis_webhook_persist` checks |
| Tests | Persistence mode unit tests |

## How to enable

1. Apply migration `0004_commerce_orders.sql` to staging/production  
2. Set `DATABASE_URL` on the app (server)  
3. Leave `ORDERS_PERSISTENCE=auto` (or `database`)  
4. Confirm `/admin/launch` shows orders persistence OK  
5. Point Paybis webhook at `/api/webhooks/paybis`

## Verify

```bash
npx vitest run && npx tsc --noEmit
# with DATABASE_URL:
# complete mock or live checkout → row in commerce_orders
# POST webhook with matching paymentRequestId → status payment_confirmed
```

## Remaining

| Item | Notes |
|---|---|
| D-03 Cart DB sync | Still cookie |
| CMS/coupons/loyalty DB | P1 |
| Map to canonical `orders` UUID table | Later once catalog UUIDs align |

## Recommendation

Approve Sprint 10 exit. Next: owner cutover with DB orders enabled, or **Sprint 11 — cart sync / CMS DB**.
