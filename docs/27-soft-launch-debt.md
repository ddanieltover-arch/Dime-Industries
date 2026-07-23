# Soft-Launch Debt Backlog

**Owner:** TPM / Eng  
**Source:** Sprint 9 post-launch review  
**Status:** Soft-launch persistence + Phase 2 growth items closed in code; owner cutover remains gated

Cookie/session persistence was an intentional MVP accelerator. This backlog is the path to hardened launch.

---

## P0 — Before high traffic / multi-instance Vercel

| ID | Item | Acceptance | Status |
|---|---|---|---|
| D-01 | **Drizzle order writes** | `getOrderRepository()` returns `mode: "database"` when `DATABASE_URL` + auto/database; writes `commerce_orders` | **Done (Sprint 10)** |
| D-02 | **Paybis webhook → markPaid** | Verified webhook updates order by `paymentRequestId`; idempotent | **Done (Sprint 10)** |
| D-03 | **Cart DB sync (authenticated)** | Logged-in cart survives device switch; guest cookie merges on login | **Done (Sprint 11)** |

## P1 — Soft-launch exit criteria

| ID | Item | Acceptance | Status |
|---|---|---|---|
| D-10 | CMS / blog / banner in DB | Admin edits survive new browsers; cookie CMS retired when DB on | **Done (Sprint 11)** |
| D-11 | Coupons in DB + validate path | Durable codes; applied code still session cookie | **Done (Sprint 11)** |
| D-12 | Loyalty / affiliate in DB | Points and referral stats durable | **Done (Sprint 12)** |
| D-13 | Catalog overrides in DB | Admin price/stock edits not cookie-scoped | **Done (Sprint 12)** |
| D-14 | Inventory reservation on checkout | Queue or row-lock decrement per Scalability Plan | **Done (Sprint 13)** |

## P2 — Growth / Phase 2

| ID | Item | Acceptance | Status |
|---|---|---|---|
| D-20 | Wholesale NET terms + catalog | Apply → approve → shop → NET/upfront checkout | **Done (Sprint 14)** |
| D-21 | Live COA / Rewards API contracts | Adapter + contracts; live when env set | **Done (Sprint 15)** |
| D-22 | Loyalty redemption at checkout | Points → discount | **Done (Sprint 15)** |
| D-23 | Affiliate payouts | Request + admin mark-paid | **Done (Sprint 15)** |
| D-24 | Load test checkout concurrency | Script + documented thresholds | **Done (Sprint 15)** |

---

## Seam already shipped

- Sprint 9–14: persistence, wholesale, inventory
- Sprint 15: COA/Rewards adapters, loyalty redeem, affiliate payouts, load script, owner cutover doc

## Remaining (owner-gated)

**Production cutover** — see `docs/44-owner-cutover.md` (DNS, Vercel secrets, migrate `0004`–`0009`, deploy).
