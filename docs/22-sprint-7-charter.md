# Sprint 7 Charter — Testing / Security / Performance / SEO

**Status:** Complete (awaiting exit approval)  
**Prior:** Sprint 6 exit approved  
**Exit gate:** Hardening pass green (unit tests + typecheck), security headers/rate limits/demo-auth guard in place, SEO surfaces expanded, e2e config + coverage for critical paths

---

## Scope (IN)

- Security headers via Next config (local + deploy parity with `vercel.json`)
- In-memory rate limits on public catalog API + Paybis webhook
- Production fail-closed: demo auth + unsigned webhooks blocked unless explicitly allowed
- Health endpoint: no DB error detail leak in production
- SEO: robots disallow list, sitemap legal + blog seeds, shared site URL helper
- Performance: catalog API cache headers; shop route loading UI; `poweredByHeader: false`
- QA: unit tests for rate limit / auth gates / SEO helpers; Playwright config + CMS/auth/coupon e2e
- Progress doc + README update

## Scope (OUT)

- Full Lighthouse CI gate in GitHub Actions
- WAF / Redis rate limiting
- Enabling e2e on every PR against shared DB (still staging-gated per DevOps docs)
- DB-backed order webhook mutation (still deferred)

## Task board

| Task ID | Title | Status |
|---|---|---|
| T-701 | Security headers + demo-auth / webhook guards | Done |
| T-702 | Rate limits + API cache headers | Done |
| T-703 | SEO robots/sitemap + loading UI | Done |
| T-704 | Unit + e2e expansion | Done |
| T-710 | Docs + exit report | Done |
