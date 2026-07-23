# Load Test — Checkout / Inventory Concurrency (D-24)

**Date:** 2026-07-23  
**Script:** `scripts/load-checkout-reserve.mjs`  
**npm:** `npm run load:checkout`

---

## Thresholds (pass criteria)

| Mode | Command | Pass if |
|---|---|---|
| Inventory race (local) | `npm run load:checkout` | No oversell; successes = floor(STOCK / BUY_QTY) |
| Host probe | `npm run load:checkout:probe` | 0 failed `/api/health` + `/api/ready`; p95 &lt; 2000ms |

Default race: `CONCURRENCY=40`, `STOCK=25`, `BUY_QTY=1` → expect 25 successes, 15 failures, onHand 0.

## Staging / production soak

1. Run race locally in CI or pre-deploy (logic invariant).  
2. Against staging: `BASE_URL=https://<staging> npm run load:checkout:probe`  
3. Soft-launch soak: follow `docs/28-soak-monitoring.md` (T+15 / T+60 / T+24h).  
4. Full HTTP checkout load (k6/Artillery placing orders) remains optional until Paybis sandbox + DB staging are dedicated for soak — do **not** hammer production payment rails.

## Recorded baseline (Sprint 15)

```
mode: inventory-race
concurrency: 40
stock: 25
buyQty: 1
expectedSuccess: 25
pass: true (run locally via npm run load:checkout)
```

Owner should paste probe results for staging/production into this file after cutover.
