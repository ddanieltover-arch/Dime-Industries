# Soak & Monitoring Runbook

**Audience:** on-call / owner during soft launch  
**Pairs with:** `GO_LIVE.md`, `ROLLBACK_PLAN.md`, `/api/health`, `/api/ready`

---

## Continuous probes

| Probe | Expect | Alert if |
|---|---|---|
| `GET /api/health` | 200, `status: ok` | Non-200 for 2+ minutes |
| `GET /api/ready` | 200 `ready` once prod secrets set | 503 `not_ready` after go-live |
| Homepage `/` | 200 | 5xx spike |
| Sentry | Baseline error rate | New fingerprint or 2× baseline |

Local/CI smoke:

```bash
npm run smoke -- https://dimeindustries.us
```

## Soak window (post-cutover)

Minimum soak before announcing “open for business”:

1. **T+0–15 min** — smoke + manual age gate → shop → cart → checkout  
2. **T+15–60 min** — Sentry watch; no payment/auth error clusters  
3. **T+24 h** — confirm multi-instance cart/order consistency with `DATABASE_URL` persistence enabled.

If traffic is near-zero, soak is configuration confidence only — still complete the probes.

## Soft-launch watch items

- Orders missing across devices → check `ORDERS_PERSISTENCE` / `DATABASE_URL`  
- Paybis “paid” but order still pending → webhook + DB mode  
- `/api/ready` blocker `demo_auth` or `paybis_webhook` → treat as launch halt

## Load probe

```bash
BASE_URL=https://dimeindustries.us npm run load:checkout:probe
```

See `docs/43-load-test-d24.md`.

## Weekly review (soft launch)

1. Open `/admin/launch` — any new blockers?  
2. Walk top of `docs/27-soft-launch-debt.md`  
3. Sentry: triage unresolved issues older than 7 days  
4. Decide: stay soft / promote DB orders sprint

## Incident first moves

1. Confirm probe failure (health vs ready vs page)  
2. `ROLLBACK_PLAN.md` Scenario 1 if app regression  
3. Do not enable `ALLOW_DEMO_AUTH` as a “fix”
