# Sprint 9 Charter — Post-Launch Review

**Status:** Complete (awaiting exit approval)  
**Prior:** Sprint 8 exit approved  
**Exit gate:** Post-launch review report filed; soft-launch debt prioritized; soak/monitoring runbooks live; readiness + admin launch status shipping; orders repository seam for DB swap

---

## Scope (IN)

- Phase 19 post-launch review report (findings, risks, recommendations)
- Soft-launch debt backlog (P0–P2) with acceptance criteria
- Soak + monitoring runbook
- Production readiness checks (`/api/ready`) — fail loud on unsafe prod config
- Admin launch-status surface (cookie-mode debt visibility)
- Order repository interface wrapping cookie store (one-swap path to Drizzle)
- Unit tests + progress doc

## Scope (OUT)

- Full Drizzle order/CMS write migration (P0 backlog item — planned, not completed this sprint)
- Wholesale Phase 2
- Live traffic load test (criteria documented; execute when traffic exists)
- Owner DNS/Vercel cutover (still owner-gated from Sprint 8)

## Task board

| Task ID | Title | Status |
|---|---|---|
| T-901 | Charter + post-launch review report | Done |
| T-902 | Debt backlog + soak/monitoring docs | Done |
| T-903 | Readiness API + admin launch status | Done |
| T-904 | Orders repository seam | Done |
| T-910 | Tests + exit docs | Done |
