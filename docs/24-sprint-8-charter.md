# Sprint 8 Charter — Documentation + Production Deploy

**Status:** Complete (awaiting exit approval; live cutover is owner-gated)  
**Prior:** Sprint 7 exit approved  
**Exit gate:** Go-live docs current; production env matrix documented; CI/smoke hardened; production build verified; cutover runbook ready for dimeindustries.us (actual DNS/Vercel promotion requires owner credentials)

---

## Scope (IN)

- Refresh DEPLOYMENT.md, DEPLOY_CHECKLIST.md, ENVIRONMENT_VARIABLES.md for Sprints 1–7 reality
- New go-live runbook for https://dimeindustries.us
- Production smoke script + expanded post-deploy checks in workflows
- CI fix: remove broken `--coverage` (no coverage provider) so unit job stays green
- Staging e2e job: use npm-compatible install path; document PLAYWRIGHT_BASE_URL
- Verify `next build` locally
- Attempt / document AppDeploy or Vercel cutover steps

## Scope (OUT)

- Owner-only DNS / domain registrar changes (document, don't execute blindly)
- Creating live Paybis production credentials without owner confirmation
- Sprint 9 post-launch analytics deep-dive

## Task board

| Task ID | Title | Status |
|---|---|---|
| T-801 | Go-live docs + env matrix refresh | Done |
| T-802 | CI / smoke / deploy workflow hardening | Done |
| T-803 | Production build verification | Done |
| T-804 | Cutover attempt or blocked-by-credentials report | Done (blocked on owner Vercel/DNS) |
| T-810 | Progress doc + exit | Done |
