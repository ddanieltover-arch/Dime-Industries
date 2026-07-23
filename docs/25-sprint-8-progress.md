# Sprint 8 Progress Report — Documentation + Production Deploy

**Date:** 2026-07-21  
**Status:** Implementation complete — cutover runbook ready; **live DNS/Vercel promotion awaits owner credentials**

---

## Completed deliverables

| Area | Deliverable |
|---|---|
| Go-live | `docs/GO_LIVE.md` — dimeindustries.us preflight, secrets matrix, DNS, cutover, abort |
| Checklist | `DEPLOY_CHECKLIST.md` refreshed for Sprints 1–7 + soft-launch limits |
| Env docs | `ENVIRONMENT_VARIABLES.md` + `DEPLOYMENT.md` brought current (Resend/Paybis/demo-auth) |
| Smoke | `scripts/smoke-production.mjs` + `npm run smoke` |
| CI/CD | Staging/production workflows call smoke script; CI drops broken `--coverage` |
| Playwright | Remote staging e2e skips local webServer when `CI=true` + `PLAYWRIGHT_BASE_URL` |
| Build | Production `next build` verified green; `app/global-error.tsx` added for Sentry |
| Charter | `docs/24-sprint-8-charter.md` |

## Cutover status (honest)

| Step | Status |
|---|---|
| Docs + smoke + build | **Done** |
| GitHub Environment secrets / Vercel project wiring | **Owner action** |
| DNS for dimeindustries.us → Vercel | **Owner action** |
| `deploy-production.yml` workflow_dispatch | **Owner action** after staging soak |

AppDeploy MCP is for Cursor-hosted simple apps — **not** used for this Next.js + Supabase + Vercel production stack.

## How to finish go-live

1. Set production secrets per `docs/GO_LIVE.md`  
2. Point domain in Vercel `dime-production`  
3. Complete `DEPLOY_CHECKLIST.md`  
4. Run `deploy-production.yml`  
5. `npm run smoke -- https://dimeindustries.us`

## Recommendation

Approve Sprint 8 exit (docs/build ready). Authorize **Sprint 9 — Post-launch review** after the owner completes the DNS/Vercel cutover, or run cutover now using `GO_LIVE.md` and report back.

## Next milestone

**Sprint 9:** Post-launch monitoring, soft-launch debt (DB-backed orders/CMS), soak review.
