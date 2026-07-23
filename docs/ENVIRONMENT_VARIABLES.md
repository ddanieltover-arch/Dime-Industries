# Environment Variables Reference

Companion to `.env.example`. That file says *what* to set; this says *who owns it, where it's set, and how sensitive it is.* Confirmed against current application code (Sprints 1–7).

| Variable | Where set | Sensitivity | Rotation | Notes |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel (both projects), local `.env.local` | Public | N/A | Safe to expose — it's a URL, not a credential |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel (both projects), local `.env.local` | Public | Only if the project's JWT secret is rotated | RLS is the actual security boundary |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (both projects, server-only) | **Critical** | On any suspected exposure | Bypasses RLS — never `NEXT_PUBLIC_` |
| `DATABASE_URL` (local/dev) | Local `.env.local` only | High | On suspected exposure | Migrations/seed; app uses Supabase clients |
| `STAGING_DATABASE_URL` | GitHub Actions `staging` Environment | High | Quarterly / offboarding | Migrations only |
| `PRODUCTION_DATABASE_URL` | GitHub Actions `production` Environment | **Critical** | Quarterly / offboarding | Migrations only |
| `VERCEL_STAGING_TOKEN` | GitHub Actions `staging` | High | Offboarding | Scope to `dime-staging` if possible |
| `VERCEL_PRODUCTION_TOKEN` | GitHub Actions `production` | **Critical** | Offboarding | Scope to `dime-production` |
| `NEXT_PUBLIC_APP_URL` | Vercel + local | Public | N/A | Production: `https://dimeindustries.us` — used for Paybis return URLs |
| `NEXT_PUBLIC_SENTRY_DSN` | Vercel (both) | Public | N/A | |
| `SENTRY_ORG`, `SENTRY_PROJECT` | Vercel + CI | Low | N/A | |
| `SENTRY_AUTH_TOKEN` | CI + Vercel build | High | If exposed | Source-map upload |
| `RESEND_API_KEY` | Vercel (both) | High | On suspected exposure | Read by `lib/email/resend.ts` — dry-run when unset |
| `RESEND_FROM` | Vercel (both) | Low | N/A | Default from-address for order mail |
| `PAYBIS_API_KEY` / `PAYBIS_API_SECRET` | Vercel (both) | **Critical** | On suspected exposure | Empty → mock checkout |
| `PAYBIS_WEBHOOK_SECRET` | Vercel (both) | **Critical** | On suspected exposure | **Required in production** if webhook route is reachable |
| `PAYBIS_API_BASE` / `PAYBIS_WIDGET_BASE` | Vercel | Low | N/A | Optional overrides |
| `ALLOW_DEMO_AUTH` | Vercel production | High (misconfig risk) | N/A | Must be **unset/false** on dimeindustries.us. Local/dev allows demo when Supabase unset |
| `ORDERS_PERSISTENCE` | Vercel + local | Low | N/A | `auto` (default): DB when `DATABASE_URL` set; `database` forces DB; `cookie` forces jar |
| `DATABASE_URL` | Vercel server + GitHub migrations | High | On exposure | Required for commerce_orders writes and Sprint 10 webhook persistence |

## Principles

- **Nothing server-only ever gets a `NEXT_PUBLIC_` prefix.**
- **Staging and production never share a credential.**
- **Do not set `ALLOW_DEMO_AUTH=true` on the public production site.**

See `docs/GO_LIVE.md` for the launch matrix.
