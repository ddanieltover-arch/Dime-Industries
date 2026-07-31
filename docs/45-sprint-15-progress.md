# Sprint 15 Progress Report — D-21–D-24 + Cutover Prep

**Date:** 2026-08-01  
**Status:** Engineering cutover package complete — **DNS publish still owner-gated**

---

## Completed

| ID | Deliverable |
|---|---|
| D-21 | COA/Rewards contracts + adapters; live DIME Heroku COA/Assistant defaults |
| D-22 | Loyalty redeem at checkout (100 pts = $1, max 50% subtotal); deduct on paid |
| D-23 | Affiliate payout request + admin mark paid/rejected (`0009`) |
| D-24 | `npm run load:checkout` / `:probe` + `docs/43-load-test-d24.md` |
| Cutover docs | `docs/44-owner-cutover.md`, `docs/46-cutover-owner-actions.md`, GO_LIVE + DEPLOY_CHECKLIST |
| Cutover verify | `npm run cutover:verify` / `cutover:verify:once` |
| Production smoke | `https://dime-industries.vercel.app` — smoke **passed**; `/api/ready` → ready |

## Domain cutover status (2026-08-01)

| Check | Result |
|---|---|
| Vercel app health | OK |
| `dimeindustries.us` DNS A/CNAME | **Missing** (SOA/NS only at registrar-servers) |
| TLS on custom domain | Blocked until DNS |
| Owner Vercel Domains + registrar | See **`docs/46-cutover-owner-actions.md`** |

## Enable after DNS

1. Owner completes `docs/46-cutover-owner-actions.md` (Vercel Domains + registrar A/CNAME)
2. `NEXT_PUBLIC_APP_URL=https://dimeindustries.us` + redeploy
3. `npm run cutover:verify:once && npm run smoke -- https://dimeindustries.us`

## Owner next step

**Publish DNS** per `docs/46-cutover-owner-actions.md`, then reply “DNS published” for re-verify.
