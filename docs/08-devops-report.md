# DIME Enterprise Commerce Platform
## DevOps Mode — Deployment Infrastructure

**Status:** Complete, self-QA passed. This phase configures infrastructure, not application features — see the scope note below before reading "everything's configured" as "the platform is done."

---

## What's in this phase

| File | Purpose |
|---|---|
| `.github/workflows/ci.yml` | Lint, typecheck, unit tests, dependency security scan, migration dry-run — every PR and push to `main` |
| `.github/workflows/deploy-staging.yml` | Migrate → deploy → health-check → e2e, automatic on push to `main` |
| `.github/workflows/deploy-production.yml` | Same sequence, manual trigger only, gated by GitHub Environment required reviewers |
| `.github/CODEOWNERS` | Required review on schema/RLS, auth/middleware, and CI/deploy config |
| `.github/pull_request_template.md` | Checklist tied to this project's own standards (RLS WITH CHECK completeness, contrast checks, migration safety) |
| `vercel.json` | Security headers (CSP, X-Frame-Options, etc.), region pinning |
| `.env.example` / `docs/ENVIRONMENT_VARIABLES.md` | Every variable, cross-checked against actual code via `grep` — not copied from the architecture doc's aspirational list |
| `sentry.client.config.ts` / `sentry.server.config.ts` / `sentry.edge.config.ts` / `instrumentation.ts` | Error reporting across all three Next.js runtimes |
| `next.config.js` | Wrapped with Sentry's build plugin for source-map upload |
| `app/api/health/route.ts` | Unauthenticated health check — real database connectivity check, used by deploy smoke tests and external uptime monitoring |
| `docs/DEPLOYMENT.md` | Full setup guide: GitHub, Vercel, Supabase, Resend, monitoring, backups |
| `docs/DEPLOY_CHECKLIST.md` | Step-by-step, must be completed before every production deploy |
| `docs/ROLLBACK_PLAN.md` | Three scenarios (app-only, migration-involved, security incident), each with a different correct response |

## The one structural decision worth flagging explicitly

Vercel natively supports two deployment tiers (Preview, Production) per project, but the Deployment Architecture wants three stages with a real approval gate between the last two. Resolved by using **two separate Vercel projects** (`dime-staging`, `dime-production`) rather than one — each drives its own "Production" target explicitly via GitHub Actions (with Vercel's own auto-deploy-on-push disabled), which is what makes the migration-before-deploy ordering and the manual approval gate actually enforceable. This is explained in full in `DEPLOYMENT.md`'s "Environment model" section, including the one deliberate simplification (PR previews share the dev Supabase project rather than getting full per-PR isolation) and why that tradeoff is acceptable for now.

## Self-QA actually performed

Same standard as every previous phase — tools run, not just read.

- **YAML validated** for all three workflow files (`yaml.safe_load`), plus a manual check for the classic `on:` → boolean-key gotcha (confirmed it's expected YAML 1.1 behavior that GitHub Actions handles correctly, not a bug — every real-world workflow file has this).
- **JSON validated** for `vercel.json`.
- **JS syntax validated** for `next.config.js` (`node -c`).
- **Full TypeScript compile** against real `@sentry/nextjs`, `next`, and `@supabase/ssr` packages for `instrumentation.ts`, all three `sentry.*.config.ts` files, and `app/api/health/route.ts` (pulled in the real `lib/supabase/server.ts` from Backend Phase 1 so the import actually resolved, rather than type-checking in isolation) — clean.

**A real bug found and fixed before you saw this, not just a note:** the first draft of the `migration-dry-run` CI job ran against a bare `postgres:15` container. Migration `0002_auth_sync_trigger.sql` creates a trigger on `auth.users` — a table that only exists in a real Supabase-provisioned database, not bare Postgres. That job would have either failed on every single run (annoying but at least visible) or, worse, been silently mis-scoped in a way that never actually validated the one migration most likely to have an environment-specific mistake. Switched to the Supabase CLI's local stack (`supabase start`), which provisions the real `auth` schema, and re-verified the corrected job's logic by hand against how `supabase status -o json` actually reports the local connection string.

**Caught and fixed without needing to be told:** the first draft of `vercel.json` included Vercel Cron entries for `/api/cron/coa-sync` and `/api/cron/rewards-sync` — routes that don't exist yet (the COA/Rewards integration is still a later Backend phase). Shipping a scheduled job that hits a 404 every six hours would generate constant, meaningless alert noise the moment monitoring goes live. Removed, with the follow-up noted in `DEPLOYMENT.md` instead of silently shipped as a broken placeholder.

**Confirmed correct, no changes:** staging and production never share a credential anywhere in `ENVIRONMENT_VARIABLES.md`; the service-role key is documented as the one "critical, rotate on any suspected exposure" credential rather than being lumped in with lower-sensitivity ones; Paybis credentials are explicitly *not* provisioned yet, with the reasoning stated (an unused live payment credential sitting in Vercel is pure risk with no offsetting benefit) rather than provisioned "just in case."

## Honest gaps, stated in `DEPLOYMENT.md` rather than hidden

- `e2e-staging` will fail today — there's only one page's worth of Playwright coverage, and Playwright itself isn't yet in a real `package.json` (no consolidated project manifest exists across phases yet — flagged back in Backend Phase 1's report too).
- The Deploy Checklist has a placeholder for load-testing sign-off that can't be filled in until checkout exists as code.
- Resend and Paybis are configured at the infrastructure level (DNS, env var slots) ahead of the application code that will use them — deliberate for Resend (DNS propagation has real lead time), explicitly *not* done for Paybis (no reason to create live payment credentials before Checkout exists).

---

**Status: DevOps Mode complete. No application features were added in this phase — infrastructure only, as scoped.**
