# Owner Cutover Checklist — dimeindustries.us

**Audience:** project owner executing production cutover  
**Code prep:** Sprint 15 complete — DNS/Vercel/secrets remain **owner-gated**

Pairs with: `GO_LIVE.md`, `DEPLOY_CHECKLIST.md`, `ROLLBACK_PLAN.md`, `ENVIRONMENT_VARIABLES.md`

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

## 2. Secrets (Vercel `dime-production`)

From `GO_LIVE.md` matrix, plus:

| Variable | Notes |
|---|---|
| `COA_API_BASE` / `COA_API_KEY` | Optional — mock COA until host ready |
| `REWARDS_API_BASE` / `REWARDS_API_KEY` | Optional |
| `REWARDS_SYNC_ENABLED=true` | Only when Rewards host accepts events |
| `ALLOW_DEMO_AUTH` | **Must be unset** |

## 3. Domain

1. Add `dimeindustries.us` (+ www) in Vercel  
2. Create DNS records shown by Vercel  
3. Wait for TLS  
4. `GET https://dimeindustries.us/api/health` → 200  
5. `GET https://dimeindustries.us/api/ready` → ready (no blockers)

## 4. Deploy

1. Complete `DEPLOY_CHECKLIST.md`  
2. `workflow_dispatch` → `deploy-production.yml`  
3. Environment reviewer approves  
4. Watch migrate → deploy → smoke  
5. `npm run smoke -- https://dimeindustries.us`  
6. `BASE_URL=https://dimeindustries.us npm run load:checkout:probe`

## 5. Manual smoke

Age gate → shop → cart → checkout (mock or live) → confirmation  
Wholesale apply (optional) · loyalty redeem (signed-in) · affiliate page  

## 6. Abort

Any smoke/Sentry spike → `ROLLBACK_PLAN.md` Scenario 1. Do not enable demo auth.

---

**Engineering cannot complete steps 3–4 without your Vercel/DNS/GitHub Environment access.** Reply when secrets + domain are ready if you want a guided cutover session.
