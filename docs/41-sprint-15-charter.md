# Sprint 15 Charter — Integrations, Growth Finance, Load Test, Cutover Prep

**Status:** Complete (pending owner exit approval; cutover owner-gated)  
**Prior:** Sprint 14 / Phase 2 wholesale approved  
**Exit gate:** D-21–D-24 code+docs shipped; owner cutover runbook current (DNS/Vercel remain owner-gated)

---

## Scope (IN)

| ID | Deliverable |
|---|---|
| D-21 | COA + Rewards adapter contracts, mock/live clients, env wiring |
| D-22 | Loyalty points redeemable at retail checkout |
| D-23 | Affiliate payout requests + admin mark-paid |
| D-24 | Checkout concurrency load script + documented soak thresholds |
| Cutover | Owner cutover checklist refreshed (migrations `0004`–`0009`, new env) |

## Scope (OUT)

- Executing live DNS/Vercel cutover (owner secrets / domain access)
- Binding to a specific third-party COA/Rewards host until credentials provided (mock until `COA_API_BASE` / `REWARDS_API_BASE` set)

## Task board

| Task ID | Title | Status |
|---|---|---|
| T-1501 | Charter + contracts doc | Done |
| T-1502 | COA/Rewards adapters | Done |
| T-1503 | Loyalty redemption | Done |
| T-1504 | Affiliate payouts | Done |
| T-1505 | Load test + cutover docs | Done |
| T-1510 | Tests + exit | Done |
