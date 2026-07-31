# Go-Live Runbook — dimeindustries.us

**Audience:** owner / DevOps executing the first production cutover after Sprint 8.  
**Pairs with:** `DEPLOYMENT.md`, `DEPLOY_CHECKLIST.md`, `ROLLBACK_PLAN.md`, `ENVIRONMENT_VARIABLES.md`.

---

## Preflight (must be true)

1. Staging (`dime-staging`) is serving the exact git SHA you intend to promote.
2. `pnpm test:unit` and `pnpm typecheck` are green on that SHA (CI on `main`).
3. Staging smoke: `GET {staging}/api/health` → 200.
4. Staging e2e (optional but recommended):  
   `PLAYWRIGHT_BASE_URL=https://<staging-host> pnpm test:e2e`
5. You have completed every open item in `DEPLOY_CHECKLIST.md`.

## Secrets matrix (production Vercel project `dime-production`)

| Variable | Required for MVP launch? | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** (recommended) | Without it, demo auth is blocked in production unless `ALLOW_DEMO_AUTH=true` (do **not** enable on public site) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** with URL | |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes if any server admin paths need service role | Never expose to browser |
| `NEXT_PUBLIC_APP_URL` | **Yes** | `https://dimeindustries.us` |
| `RESEND_API_KEY` / `RESEND_FROM` | Strongly recommended | Order emails dry-run without it |
| `PAYBIS_API_KEY` / `PAYBIS_API_SECRET` / `PAYBIS_WEBHOOK_SECRET` | Optional at soft launch | Empty → mock checkout; **webhook secret required** if live Paybis in production |
| `PAYBIS_API_BASE` / `PAYBIS_WIDGET_BASE` | If live Paybis | |
| `NEXT_PUBLIC_SENTRY_DSN` | Recommended | |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | For source maps | |
| `ALLOW_DEMO_AUTH` | **Must be unset/false** | Production fail-closed |
| `COA_API_BASE` | Optional | Empty → public DIME lab host; `off` → mock |
| `ASSISTANT_API_BASE` | Optional | Empty → Budtender Heroku; `off` → mock |
| `REWARDS_APP_URL` | Optional | Default legacy SPA `https://rewards.dimeindustries.com` |
| `REWARDS_API_BASE` / `REWARDS_API_KEY` | Optional | Only with REST-compatible Rewards host |

GitHub Environment `production` secrets: `PRODUCTION_DATABASE_URL`, `VERCEL_PRODUCTION_TOKEN`.

## DNS / domain

Follow **`docs/44-owner-cutover.md` §3** (current status + typical records).

1. In the production Vercel project, add domain `dimeindustries.us` (+ `www`).
2. At the registrar (`registrar-servers.com` NS), create the records Vercel shows (typically apex `A` `76.76.21.21`, `www` `CNAME` `cname.vercel-dns.com`).
3. Wait for TLS certificate issued (Vercel dashboard → Domains).
4. Confirm with:

```bash
node scripts/verify-domain-cutover.mjs --once
node scripts/smoke-production.mjs https://dimeindustries.us
```

## Cutover steps

1. Confirm checklist → trigger `deploy-production.yml` (`workflow_dispatch`).
2. Input staging URL that was tested; check the confirmation box.
3. Wait for GitHub Environment reviewer approval.
4. Watch: migrate → deploy → smoke-test.
5. Run local smoke against production:

```bash
node scripts/smoke-production.mjs https://dimeindustries.us
```

6. Manual browser pass (age gate → shop → cart → checkout mock or live).
7. Watch Sentry 15 minutes.

## Soft-launch known limits (communicate to stakeholders)

- **Orders** durable via `commerce_orders` when `DATABASE_URL` is set (`ORDERS_PERSISTENCE=auto`). Apply `0004`+.
- **Carts, wishlists, CMS, coupons, loyalty, affiliate, catalog overrides, inventory** persist via `0005`–`0007` when `DATABASE_URL` is set.
- Checkout **reserves** stock in `commerce_inventory` (released on cancel/reject/payment_failed).
- Wholesale Phase 2 (apply / shop / NET terms) is available when enabled; see `/wholesale`.

See `docs/27-soft-launch-debt.md`, `docs/28-soak-monitoring.md`, and **`docs/44-owner-cutover.md`** for cutover.

Apply migrations **`0004`–`0009`** before public traffic when using `DATABASE_URL`.

## Abort

Any smoke or Sentry spike → `ROLLBACK_PLAN.md` Scenario 1 (promote previous Vercel deployment). Do not hot-patch under pressure.

Also check `GET /api/ready` — if it returns `not_ready`, halt public announcement until blockers clear.
