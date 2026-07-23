# DIME Enterprise Commerce Platform — Deployment Documentation

**Audience:** whoever is setting up or maintaining the infrastructure this app runs on. Pairs with `docs/07-qa-audit-report.md` (early hardening), Sprint progress docs (what's been built), and `docs/GO_LIVE.md` (dimeindustries.us cutover).

**Current app surface (Sprints 1–7):** catalog, cart, checkout (Paybis mock/live), account, admin, CMS/blog, coupons, loyalty/affiliate stubs, security/SEO hardening. Persistence for many commerce writes is still cookie/session-backed pending full Drizzle wiring — treat soft launch accordingly.

**Canonical go-live steps:** `docs/GO_LIVE.md` + `docs/DEPLOY_CHECKLIST.md`.

---

## Environment model

Three environments, each with its own **Supabase project** (per Database Architecture §5 — no shared database, ever) and its own **Vercel project** (see below for why two, not one):

| Environment | Supabase project | Vercel project | Deploy trigger |
|---|---|---|---|
| Development | shared `dime-dev` | n/a (local `next dev`) | manual, local |
| Preview (per PR) | shared `dime-dev` (simplification — see note) | `dime-staging`'s native PR previews | automatic, Vercel git integration |
| Staging | dedicated `dime-staging` | `dime-staging` | automatic, `deploy-staging.yml` on push to `main` |
| Production | dedicated `dime-production` | `dime-production` | manual, `deploy-production.yml` via `workflow_dispatch` |

**Why two Vercel projects, not one:** Vercel natively supports exactly two deployment tiers per project — Preview (any non-production branch/PR) and Production (the production branch). That maps cleanly onto a two-stage pipeline, but this architecture wants three stages with a real gate between the last two (staging → production requires human approval; Preview → Staging doesn't). Splitting into `dime-staging` and `dime-production` as separate Vercel projects, each with its own domain and its own "Production" deploy target, is what actually lets `deploy-production.yml` require manual approval independent of whatever's happening on `main`.

**Known simplification, stated plainly rather than glossed over:** per-PR preview deployments share the `dime-dev` Supabase project rather than getting a fully isolated database per PR. Full isolation would mean either Supabase's database-branching feature (evaluate its current maturity/pricing before adopting) or spinning up/tearing down a project per PR via the Supabase Management API (real engineering effort, not justified yet at this project's size). The tradeoff: two PRs modifying data simultaneously in preview can interfere with each other. Acceptable for now because previews are for visual/functional review, not data-integrity testing — that's what `e2e-staging` (against the real, isolated staging project) is for.

---

## GitHub

1. **Branch protection on `main`:** require PRs (no direct pushes), require the `lint-and-typecheck`, `unit-tests`, `security-scan`, and `migration-dry-run` jobs from `ci.yml` to pass, require at least one approving review, require CODEOWNERS review on the paths listed in `.github/CODEOWNERS`.
2. **Environments:** create `staging` and `production` GitHub Environments (Settings → Environments). Add `production`'s required reviewers here — this is what actually enforces the human approval gate in `deploy-production.yml`, not the workflow file itself.
3. **Secrets:** set per-environment secrets (`STAGING_DATABASE_URL`, `PRODUCTION_DATABASE_URL`, `VERCEL_STAGING_TOKEN`, `VERCEL_PRODUCTION_TOKEN`) scoped to their respective Environments, not as repo-wide secrets — a compromised staging workflow run should never have access to production credentials.
4. **CODEOWNERS / PR template:** already in `.github/` — update the `@dime/...` team handles to match your actual GitHub team slugs before relying on the review requirements.

## GitHub Actions

Three workflows, already written:

- **`ci.yml`** — every PR and push to `main`: lint, typecheck, unit tests, dependency security scan, and a migration dry-run against a throwaway Postgres container (catches a broken migration before it ever reaches a real database). E2E is deliberately `if: false` here — see the comment in the file for why (shared dev DB makes PR-preview e2e flaky; the real e2e gate is post-staging-deploy).
- **`deploy-staging.yml`** — on push to `main`: migrate → deploy → health-check → e2e, in that order, each gated on the previous step succeeding.
- **`deploy-production.yml`** — manual only (`workflow_dispatch`), requires explicitly checking a checklist-confirmation box as an input, then the same migrate → deploy → health-check sequence against production, gated by the GitHub Environment's required reviewers.

## Vercel

1. Create the two projects (`dime-staging`, `dime-production`), each connected to this GitHub repo.
2. **Disable Vercel's automatic Production deployments on both projects** (Project Settings → Git → Production Branch → disconnect, or set an `ignoreCommand` that always exits 1). Deployments to each project's Production target are driven exclusively by the GitHub Actions workflows above — this is what makes the migration-then-deploy ordering actually enforceable. Leaving Vercel's native auto-deploy on would let a push to `main` deploy the app *before* migrations run.
3. Leave Preview deployments enabled on `dime-staging` only (that's where PR previews render) — `dime-production` doesn't need PR previews at all.
4. Apply `vercel.json` (security headers, region pinning) to both projects — it's not project-specific.
5. Set environment variables per project per `.env.example` / `ENVIRONMENT_VARIABLES.md` — staging and production get different Supabase project credentials, different Sentry environment tags, etc.

## Supabase

1. Create `dime-dev`, `dime-staging`, `dime-production` projects.
2. Apply migrations in order (`db/migrations/0001_init.sql` through the latest) to each — locally/manually for the first-ever setup of each project, then via the CI workflows for every deploy after that.
3. Enable **Point-in-Time Recovery** on `dime-production` (Settings → Database → Backups) — this is the actual backup mechanism; see "Backups" below.
4. Configure Auth providers: enable Email, enable Google OAuth (requires a Google Cloud OAuth client — see Backend Phase 1's report for why this is an external dependency the app code can't self-verify).
5. Configure Auth email templates / SMTP — Supabase's built-in signup-confirmation email either uses Supabase's default sender (fine for staging/dev) or should be pointed at a custom SMTP provider for production once one is decided (this is a natural place for Resend to plug in even before the app's own transactional emails are built — see Resend section below).

## Resend

Used by `lib/email/resend.ts` for order confirmation (dry-run when the API key is unset).

1. Verify the sending domain (`dimeindustries.us` or `mail.dimeindustries.us`) in Resend — SPF/DKIM can take up to 48 hours.
2. Set `RESEND_API_KEY` and `RESEND_FROM` on both Vercel projects.
3. Optionally point Supabase Auth SMTP at Resend for signup mail.

## Environment Variables

See `.env.example`, `ENVIRONMENT_VARIABLES.md`, and `GO_LIVE.md`.

## Monitoring

- **Sentry** — wired across client/server/edge; conservative sample rates (10% traces, 0% session replay) pending privacy review for age-gate data.
- **Vercel Analytics** — enable per project dashboard.
- **Uptime / smoke** — `GET /api/health` plus `node scripts/smoke-production.mjs <url>` (wired into staging/production deploy workflows).
- **Alerting** — configure Sentry error-rate alerts after a production baseline exists.

## Backups

- **Mechanism:** Supabase PITR on `dime-production`.
- **Verification:** quarterly restore drill into a throwaway project.
- **Authorization:** same as production deploy reviewers for PITR restores — see `ROLLBACK_PLAN.md`.

## Error Reporting

Sentry `beforeSend` strips `cookie` and `authorization` headers from captured request context.

---

## CI gaps to close (honest list)

- PR-preview e2e remains disabled in `ci.yml` (`if: false`) because previews share `dime-dev` — real e2e runs post-staging-deploy.
- Cookie-backed commerce jars are not multi-instance safe; promote DB-backed orders/CMS before high-traffic launch.
- Load test against checkout/inventory concurrency still outstanding (Scalability Plan).
- `pnpm audit` may fail CI on transitive advisories — triage with `pnpm audit --audit-level=high` locally before blaming the app.
