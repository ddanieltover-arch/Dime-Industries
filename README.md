# DIME Enterprise Commerce Platform

A cannabis marketplace platform (retail + wholesale), built via Claude DevOS Enterprise across SRS → Architecture → Database → Backend → Frontend → QA → DevOps phases. This README orients a first-time reader; `docs/` has the full reasoning behind every decision.

## What actually exists as code right now

Being direct about this, since it's easy for a well-documented repo to look more complete than it is:

- **Auth** (`app/(auth)/`, `lib/auth/`, `middleware.ts`) — email/password + Google OAuth, role-based route gating, profile auto-creation via DB trigger.
- **Home page** (`app/page.tsx` and its components).
- **Catalog (Sprint 1)** — shop, category, line, and product detail pages; catalog query layer; `GET /api/products` (+ `[slug]`); faceted filters, search, sort; jurisdiction-aware seed catalog.
- **Cart & wishlist (Sprint 2)** — cookie-backed cart (drawer + `/cart`), wishlist (`/wishlist`), recently viewed, PDP add-to-cart.
- **Checkout (Sprint 3)** — `/checkout` with itemized tax/shipping, Paybis BTC provider (mock when keys absent), confirmation receipt, webhook route.
- **Customer account (Sprint 4)** — `/login` + `/account` portal (orders, profile, addresses, notifications, validate); demo session without Supabase; Resend order email (dry-run when unset).
- **Admin (Sprint 5)** — `/admin` dashboard, products/inventory/orders/reviews/customers/audit; demo admin role; catalog overrides apply to storefront.
- **CMS & growth (Sprint 6)** — CMS pages + blog, homepage banner, coupons at cart/checkout, loyalty + affiliate account/admin surfaces, `/r/[code]` referrals.
- **Hardening (Sprint 7)** — security headers, rate limits, production demo-auth/webhook guards, SEO present (robots/sitemap/metadata/JSON-LD — not SEO automation), Playwright config + critical-path e2e.
- **Go-live prep (Sprint 8)** — `docs/GO_LIVE.md`, refreshed deploy checklist/env docs, smoke script, CI/deploy workflow hardening; production `next build` verified.
- **Post-launch review (Sprint 9)** — readiness (`/api/ready`), admin launch status, soft-launch debt backlog, soak runbook, orders repository seam.
- **DB orders (Sprint 10)** — `commerce_orders` + Drizzle repository; Paybis webhook can mark paid; `ORDERS_PERSISTENCE=auto`.
- **Growth persistence (Sprint 11–13)** — logged-in cart/wishlist sync; CMS/coupons/loyalty/affiliate/catalog overrides/inventory reservation in Postgres when `DATABASE_URL` set.
- **Database schema, RLS policies, and migrations** (`db/`) — including `0004`–`0007` commerce tables.
- **Wholesale (Sprint 14 / Phase 2)** — apply → admin approve → `/wholesale/shop` + NET-30/60 or Bitcoin upfront checkout.
- **Integrations & growth finance (Sprint 15)** — COA/Rewards adapters, loyalty redeem at checkout, affiliate payouts, load-test script.
- **Deployment infrastructure** (`.github/`, `vercel.json`, Sentry configs, `docs/DEPLOYMENT.md` and friends) — production app live at `https://dime-industries.vercel.app`.

**Owner-gated (final step):** point `dimeindustries.us` DNS at Vercel — follow **`docs/46-cutover-owner-actions.md`** (also `docs/44-owner-cutover.md`). Verify with `npm run cutover:verify:once`.

## Getting started

```bash
pnpm install   # or npm install --legacy-peer-deps — next-themes' peer range
               # lags behind React 19 as of this writing
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL against your own Supabase project
pnpm dev
```

To stand up the database: apply `db/migrations/*.sql` in order, then `db/rls_policies.sql`, against a Supabase project (local `supabase start` or a real project). `pnpm db:seed` loads placeholder catalog data afterward.

## Reading order for `docs/`

Start with `docs/00-project-manager-mode.md` when you want TPM / phase-gate coordination for the project.

The numbered docs (`01`–`08`) are in the order they were produced and reference each other forward, not backward — `04-database-design.md` assumes you've read `02`/`03`, for instance. The unnumbered docs (`DEPLOYMENT.md`, `DEPLOY_CHECKLIST.md`, `ROLLBACK_PLAN.md`, `ENVIRONMENT_VARIABLES.md`) are operational references, meant to be consulted, not read start to end.

Two open questions from `docs/02-architecture.md` are still unresolved and worth knowing about before building further: the **order fulfillment model** (is this platform the licensed seller of record, or does it route to third-party licensed retailers?) and the **actual API contracts** for DIME's existing COA host and rewards system. Neither is closeable by more code — both need a real answer from the business side.

## Testing

`pnpm test:unit` runs the Vitest suite (5 tests, all passing as of the last audit). `pnpm test:e2e` runs the Playwright spec — currently only covers the Home page and needs a real dev/staging server to run against, per `docs/06-frontend-page1-home-report.md`.
