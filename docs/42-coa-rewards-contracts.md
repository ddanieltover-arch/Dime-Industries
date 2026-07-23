# COA & Rewards API Contracts (D-21)

**Status:** Adapter-ready — live hosts optional via env  
**Authority:** Architecture (COA + Rewards are integrations, not rebuilds)

When base URLs are unset, adapters run in **mock** mode so storefront/dev never block on external systems.

---

## Environment

| Variable | Purpose |
|---|---|
| `COA_API_BASE` | Origin for COA host (no trailing slash), e.g. `https://coa.example.com` |
| `COA_API_KEY` | Optional bearer/API key |
| `REWARDS_API_BASE` | Origin for DIME Rewards |
| `REWARDS_API_KEY` | Optional bearer/API key |
| `REWARDS_SYNC_ENABLED` | `true` to push earn/redeem events to Rewards host |

---

## COA — expected HTTP contract

### `GET {COA_API_BASE}/v1/coa?sku={sku}`

**Headers:** `Authorization: Bearer {COA_API_KEY}` (if key set), `Accept: application/json`

**200 response:**

```json
{
  "sku": "LR-GELATO-1G",
  "productName": "Live Reserve Gelato 1g",
  "labName": "Example Analytics",
  "testedAt": "2026-06-01T00:00:00.000Z",
  "documentUrl": "https://coa.example.com/docs/lr-gelato-1g.pdf",
  "thcPct": 78.2,
  "cbdPct": 0.4,
  "status": "published"
}
```

**404:** SKU unknown — adapter falls back to catalog `coaUrl`.  
**Timeout:** 3s — fail soft to catalog URL.

Allow-list: requests only to `COA_API_BASE` origin (no user-supplied hosts).

---

## Rewards — expected HTTP contract

### `GET {REWARDS_API_BASE}/v1/members/{email}`

**200:**

```json
{
  "email": "buyer@example.com",
  "externalId": "rw_abc",
  "pointsBalance": 1200,
  "tier": "reserve"
}
```

### `POST {REWARDS_API_BASE}/v1/events`

```json
{
  "email": "buyer@example.com",
  "type": "earn" | "redeem" | "adjust",
  "points": 100,
  "reason": "order ord_…",
  "idempotencyKey": "ord_…:earn"
}
```

**200/201:** `{ "ok": true, "balance": 1300 }`  
Failures are logged; local loyalty ledger remains source of truth for checkout.

---

## Implementation map

| Module | Role |
|---|---|
| `lib/integrations/coa/` | Fetch + fallback |
| `lib/integrations/rewards/` | Member read + event push |
| Product PDP | Prefer live `documentUrl`, else seed `coaUrl` |
| Loyalty earn/redeem | Optional Rewards sync when enabled |
