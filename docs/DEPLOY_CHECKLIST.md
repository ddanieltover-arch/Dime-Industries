# Deploy Checklist — Production

Complete every item before checking the confirmation box in `deploy-production.yml`'s manual trigger. This checklist is the actual gate — the workflow's checkbox input just proves someone looked at it, it can't verify any of these for you.

Also read `docs/GO_LIVE.md` and **`docs/44-owner-cutover.md`** for the dimeindustries.us cutover sequence.

## Before triggering the workflow

- [ ] Staging has been running the exact commit being promoted for at least the team's soak window with no new Sentry errors attributable to it.
- [ ] Staging smoke passed: `node scripts/smoke-production.mjs <staging-url>` (also run automatically in `deploy-staging.yml`).
- [ ] Staging e2e passed on the deployment being promoted (Actions → deploy-staging → e2e-staging), or an explicit waiver is recorded.
- [ ] If this release includes a database migration:
  - [ ] It's additive-only, OR it follows expand-migrate-contract with the contract step in a *later* release.
  - [ ] It ran successfully against staging via `deploy-staging.yml`.
  - [ ] Someone has read the migration file itself — CI validates it *applies*, not that it's the *right* change.
- [ ] If this release touches RLS policies: re-read them against the Security section in `docs/07-qa-audit-report.md` — every INSERT/UPDATE `WITH CHECK` must validate foreign keys it sets, not only ownership.
- [ ] Production Vercel env vars match `docs/GO_LIVE.md` secrets matrix (`ALLOW_DEMO_AUTH` unset; `NEXT_PUBLIC_APP_URL=https://dimeindustries.us`).
- [ ] If enabling live Paybis: `PAYBIS_WEBHOOK_SECRET` is set (required in production) and webhook URL points at `https://dimeindustries.us/api/webhooks/paybis`.
- [ ] Rollback plan for this release has been read (`ROLLBACK_PLAN.md`).

## Triggering the deploy

- [ ] Run `deploy-production.yml` via `workflow_dispatch`, providing the staging deployment URL that was actually tested.
- [ ] A required reviewer on the `production` GitHub Environment approves the run.
- [ ] Watch the run live — migrate → deploy → smoke-test. Don't walk away until smoke is green.

## After the deploy

- [ ] `node scripts/smoke-production.mjs https://dimeindustries.us` passes (or `node scripts/verify-domain-cutover.mjs` then smoke).
- [ ] Manually: age gate → shop → add to cart → checkout (mock or live).
- [ ] Watch Sentry for 15 minutes for new error signatures.
- [ ] Post the workflow Job Summary wherever the team tracks releases.
- [ ] If anything looks wrong: stop → `ROLLBACK_PLAN.md`. Do not forward-fix under time pressure.

## Soft-launch acknowledgements (check that stakeholders know)

- [ ] Migrations `0004`–`0009` applied on production Postgres with `DATABASE_URL` set.
- [ ] Demo auth disabled (`ALLOW_DEMO_AUTH` unset).
- [ ] Catalog uses **reference pricing** (Eaze/Rolling Releaf); not placeholder bands.
- [ ] COA + AI Assistant default to public DIME Heroku hosts (set `COA_API_BASE=off` / `ASSISTANT_API_BASE=off` only to force mock).
- [ ] Rewards: on-site loyalty is live; optional REST sync only when `REWARDS_API_BASE` + key exist (`rewards.dimeindustries.com` is OAuth SPA).
- [ ] Owner cutover steps in `docs/44-owner-cutover.md` completed (DNS + TLS on `dimeindustries.us`).

## Notes

Load test: `npm run load:checkout` (inventory race) and `npm run load:checkout:probe` against staging/production — see `docs/43-load-test-d24.md`.
