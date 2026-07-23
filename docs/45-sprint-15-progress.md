# Sprint 15 Progress Report — D-21–D-24 + Cutover Prep

**Date:** 2026-07-23  
**Status:** Implementation complete — awaiting owner review; **cutover remains owner-gated**

---

## Completed

| ID | Deliverable |
|---|---|
| D-21 | COA/Rewards contracts (`docs/42-coa-rewards-contracts.md`) + adapters; PDP uses live COA when configured |
| D-22 | Loyalty redeem at checkout (100 pts = $1, max 50% subtotal); deduct on paid |
| D-23 | Affiliate payout request + admin mark paid/rejected (`0009`) |
| D-24 | `npm run load:checkout` / `:probe` + `docs/43-load-test-d24.md` |
| Cutover | `docs/44-owner-cutover.md` + checklist/GO_LIVE updates |

## Enable

- Migrations `0004`–`0009` + `DATABASE_URL`
- Optional: `COA_API_*`, `REWARDS_API_*`, `REWARDS_SYNC_ENABLED`

## Verify

```bash
npx vitest run && npx tsc --noEmit && npm run load:checkout
```

## Owner next step

Execute **`docs/44-owner-cutover.md`** (DNS, Vercel secrets, deploy). Engineering cannot complete live cutover without your access.
