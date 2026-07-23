# Sprint 10 Charter — DB-Backed Orders + Paybis Webhook

**Status:** Complete (awaiting exit approval)  
**Prior:** Sprint 9 exit approved  
**Exit gate:** Orders persist to Postgres when enabled; webhook can mark paid by `paymentRequestId`; cookie fallback remains for local/demo

---

## Scope (IN)

- Migration `0004_commerce_orders.sql` — snapshot table for CheckoutOrder + payment lookup
- Drizzle schema + `lib/db/client.ts`
- `DrizzleOrderRepository` behind `getOrderRepository()` (`ORDERS_PERSISTENCE=auto|database|cookie`)
- Paybis webhook → `markPaid` / status updates with `persisted: true`
- Account/admin/confirmation wired through repository
- Launch status: persistence check flips when DB mode active
- Unit tests (repo selection + webhook persist path with mocks)
- Progress doc

## Scope (OUT)

- Migrating seed catalog onto UUID `product_variants` FKs (snapshot JSON avoids that)
- Cart/wishlist DB sync (D-03 — later)
- CMS/coupons DB (P1)

## Task board

| Task ID | Title | Status |
|---|---|---|
| T-1001 | Migration + Drizzle client/schema | Done |
| T-1002 | Drizzle order repository | Done |
| T-1003 | Webhook persistence | Done |
| T-1004 | Call-site wiring + launch status | Done |
| T-1010 | Tests + docs | Done |
