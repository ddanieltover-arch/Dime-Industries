# Owner Cutover Checklist — dimeindustries.us

**Audience:** project owner executing production cutover  
**Code prep:** Complete (reference pricing, live COA/Assistant defaults, soft-launch commerce)  
**Live app today:** `https://dime-industries.vercel.app` (health OK)  
**Domain status:** `dimeindustries.us` registered (NS `registrar-servers.com`) — **no A/CNAME yet**

Pairs with: `GO_LIVE.md`, `DEPLOY_CHECKLIST.md`, `ROLLBACK_PLAN.md`, `ENVIRONMENT_VARIABLES.md`, `42-coa-rewards-contracts.md`

---

## 0. Product state (2026-08-01)

| Area | Status |
|---|---|
| Catalog prices | `REFERENCE_PRICING` from Eaze/Rolling Releaf — `PLACEHOLDER_PRICING=false` |
| COA / Lab Results | Defaults to DIME Heroku lab host (`lib/integrations/hosts.ts`); override with `COA_API_BASE` or `off` |
| AI Assistant | Defaults to DIME Budtender Heroku (`POST /chat`); `ASSISTANT_API_BASE=off` forces mock |
| Rewards | On-site loyalty is source of truth; legacy SPA link via `REWARDS_APP_URL` |
| Soft launch | Paybis mock OK if keys unset; do **not** set `ALLOW_DEMO_AUTH` on production |

Verify current Vercel deployment before cutover:

```bash
node scripts/smoke-production.mjs https://dime-industries.vercel.app
node scripts/verify-domain-cutover.mjs   # polls dimeindustries.us until DNS/TLS ready
```

---

## 1. Database (before traffic)

Apply migrations in order against production Postgres:

1. `0004_commerce_orders.sql`
2. `0005_commerce_growth.sql`
3. `0006_commerce_engagement.sql`
4. `0007_commerce_wishlist_inventory.sql`
5. `0008_commerce_wholesale.sql`
6. `0009_commerce_affiliate_payouts.sql`

Set `DATABASE_URL` (pooled for app; unpooled for migrate). Leave `ORDERS_PERSISTENCE=auto`.

---

## 2. Secrets (Vercel production project)

From `GO_LIVE.md` matrix, plus:

| Variable | Required? | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | **Yes** | Must be `https://dimeindustries.us` after domain attach |
| `ALLOW_DEMO_AUTH` | **Must be unset** | Production fail-closed |
| `DATABASE_URL` | Strongly recommended | Durable orders/cart/loyalty when set |
| `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` | Recommended | Real auth; no demo on public site |
| `RESEND_API_KEY` / `RESEND_FROM` | Recommended | Order emails |
| `PAYBIS_*` | Optional soft launch | Empty → mock checkout; webhook secret required if live |
| `COA_API_BASE` | Optional | Leave empty to use public DIME lab host; `off` = catalog mock |
| `ASSISTANT_API_BASE` | Optional | Leave empty for Budtender host; `off` = mock |
| `REWARDS_API_BASE` / `REWARDS_API_KEY` | Optional | Only if you have REST matching `docs/42` |
| `REWARDS_APP_URL` | Optional | Default `https://rewards.dimeindustries.com` |
| `REWARDS_SYNC_ENABLED` | Optional | `true` only with working Rewards REST host |

---

## 3. Domain (Vercel + registrar)

### 3a. Vercel

1. Open the production Vercel project → **Settings → Domains**
2. Add `dimeindustries.us` and `www.dimeindustries.us`
3. Copy the exact DNS records Vercel shows (typical values below — **prefer Vercel’s UI if different**)

### 3b. Typical Vercel DNS (registrar-servers / Namecheap Advanced DNS)

| Type | Host | Value | TTL |
|---|---|---|---|
| A | `@` | `76.76.21.21` | Automatic |
| CNAME | `www` | `cname.vercel-dns.com` | Automatic |

Do **not** change nameservers away from `dns1/dns2.registrar-servers.com` unless Vercel requires it.

### 3c. Verify

1. Wait for Vercel Domains → TLS **Valid**
2. `GET https://dimeindustries.us/api/health` → 200  
3. `GET https://dimeindustries.us/api/ready` → no blockers  
4. Or: `node scripts/verify-domain-cutover.mjs`

---

## 4. Deploy

If production already serves the intended `main` SHA on `*.vercel.app`, **domain attach alone** may be enough after env update + redeploy.

Otherwise:

1. Complete `DEPLOY_CHECKLIST.md`  
2. `workflow_dispatch` → `deploy-production.yml`  
3. Environment reviewer approves  
4. Watch migrate → deploy → smoke  
5. `node scripts/smoke-production.mjs https://dimeindustries.us`  
6. `BASE_URL=https://dimeindustries.us npm run load:checkout:probe`

---

## 5. Manual smoke

Age gate → shop → cart → checkout (mock or live) → confirmation  
Wholesale apply (optional) · loyalty redeem (signed-in) · affiliate page  
Lab Results search (live COA) · Assistant question  

---

## 6. Abort

Any smoke/Sentry spike → `ROLLBACK_PLAN.md` Scenario 1. Do not enable demo auth.

---

## Owner vs engineering

| Step | Who |
|---|---|
| Docs, smoke scripts, code defaults | Engineering |
| Vercel Domains + production env | **Owner** |
| Registrar DNS publish | **Owner** |
| GitHub `production` environment approval | **Owner** |
| Post-DNS verify + smoke | Engineering (after DNS propagates) |

**Blocked without owner:** registrar login, Vercel project access, GitHub Environment approval, production DB/Supabase secrets.

**Short owner checklist:** [`46-cutover-owner-actions.md`](./46-cutover-owner-actions.md)
