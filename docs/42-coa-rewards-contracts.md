# COA & Rewards / Assistant API Contracts (D-21)

**Status:** Live against public DIME reference hosts (overridable via env)  
**Authority:** Architecture (COA + Rewards are integrations, not rebuilds)

When bases are unset, adapters use the public hosts linked from [dimeindustries.com](https://dimeindustries.com/). Set a base to `off` to force mock/local.

---

## Discovered reference hosts

| System | Host | API shape |
|---|---|---|
| Lab / COA | `https://coas-7d1e18b1a038.herokuapp.com` | `GET /api/coas?q=&limit=` → `{ data, pagination }`; detail `/coa/{id}` |
| AI Budtender | `https://budtender-bdf452c7c488.herokuapp.com` | `POST /chat` body `{ message }` → `{ reply }` |
| Rewards app | `https://rewards.dimeindustries.com` | OAuth SPA — **no** public `/v1/members` REST |
| Serial validate | `https://dime-serial-validator-cd1cd.firebaseapp.com` | Firebase validator UI |

---

## Environment

| Variable | Purpose |
|---|---|
| `COA_API_BASE` | Override COA origin (default: Heroku lab host). `off` = mock |
| `COA_API_KEY` | Optional bearer/API key |
| `ASSISTANT_API_BASE` | Override Budtender origin (default: Heroku). `off` = mock |
| `ASSISTANT_API_KEY` | Optional bearer/API key |
| `REWARDS_API_BASE` | REST Rewards origin — **only** if you have a contract-compatible host + key |
| `REWARDS_API_KEY` | Optional bearer/API key |
| `REWARDS_SYNC_ENABLED` | `true` to push earn/redeem events to Rewards REST host |
| `REWARDS_APP_URL` | Consumer link to legacy Rewards SPA (default: rewards.dimeindustries.com) |

---

## COA — live Heroku shape (default)

### `GET {COA_API_BASE}/api/coas?q={query}&limit=5`

Adapter searches by product name, then SKU-derived query. Maps first hit to:

- `documentUrl` → `{COA_API_BASE}/coa/{id}`
- `thcPct` / `cbdPct` / `labName` / `testedAt` from row fields
- `status` `passed` → `published`

### Fallback contract (custom hosts)

`GET {COA_API_BASE}/v1/coa?sku={sku}` as previously documented.

**Timeout:** 3–4s — fail soft to catalog URL.

---

## Assistant — live Budtender shape (default)

### `POST {ASSISTANT_API_BASE}/chat`

```json
{ "message": "What is Miami Ice?" }
```

**200:** `{ "reply": "..." }` (also accepts `{ "answer" }` on `/v1/chat` for custom hosts)

---

## Rewards — local-first

On-site loyalty (`/account/loyalty`, checkout earn/redeem) remains source of truth.

`rewards.dimeindustries.com` is linked as the legacy member app. REST sync (`REWARDS_API_BASE` + `REWARDS_SYNC_ENABLED=true`) stays optional until a contract-compatible host is provided.

### Optional REST (when configured)

`GET {REWARDS_API_BASE}/v1/members/{email}`  
`POST {REWARDS_API_BASE}/v1/events`

---

## Implementation map

| Module | Role |
|---|---|
| `lib/integrations/hosts.ts` | Default public origins |
| `lib/integrations/coa/` | Heroku `/api/coas` + contract fallback |
| `lib/integrations/assistant/` | Budtender `/chat` + `/v1/chat` fallback |
| `lib/integrations/rewards/` | Optional REST + `REWARDS_APP_URL` link |
| Product PDP / Lab Results | Prefer live COA document URL |
| Loyalty earn/redeem | Optional Rewards sync when enabled |
