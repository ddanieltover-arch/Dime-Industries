# Section 11 — Automation & CI/CD

**Date:** 2026-08-03  
**Canonical:** https://www.dimeindustries.us

## Checklist vs master prompt

| Item | Status | Notes |
|------|--------|--------|
| 11.1 Pre-deploy SEO CI | Done | `.github/workflows/seo-check.yml` — audit, schema, links, freshness warn, SEO unit tests |
| 11.1 Lighthouse CI | Done (weekly) | `.github/workflows/seo-lighthouse-weekly.yml` + `.lighthouserc.json` — SEO assert error; perf warn until LCP ≤ 2.5s |
| 11.1 Broken links | Done | Offline seed check on PR; monthly live sample + optional deep `blc` |
| 11.2 Sitemap ping on deploy | Done | `deploy-production.yml` → `scripts/ping-sitemap.mjs` after smoke |
| 11.3 RUM / monitoring | Partial | Sentry already wired; GSC CWV + weekly Lighthouse; Vercel Analytics optional |
| 11.4 Content freshness | Done | `scripts/content-freshness.mjs` (6-month flag); `dateModified` from `updatedAt` on CMS save |
| 11.4 Auto-ping on page update | Via deploy | Sitemap regenerates dynamically; ping runs on production promote |

## Scripts / npm

| Command | Script |
|---------|--------|
| `pnpm seo:audit` | `scripts/seo-audit.mjs` |
| `pnpm seo:schema` | `scripts/validate-schema.ts` |
| `pnpm seo:links` | `scripts/check-internal-links.mjs` (`--live` for prod sample) |
| `pnpm seo:freshness` | `scripts/content-freshness.mjs` (`--strict` to fail) |
| `pnpm seo:ping-sitemap` | `scripts/ping-sitemap.mjs` |
| `pnpm seo:ci` | All offline gates |

Live probes: set `SEO_AUDIT_BASE_URL` / `SEO_LINK_BASE_URL`.

## Workflows

1. **seo-check.yml** — every PR/push to `main`
2. **seo-lighthouse-weekly.yml** — Mondays + `workflow_dispatch`
3. **seo-crawl-monthly.yml** — 1st of month + optional deep blc
4. **deploy-production.yml** — sitemap ping after smoke

## dateModified automation (11.4)

- BlogPosting JSON-LD uses `post.updatedAt` as `dateModified` (`lib/seo/json-ld.ts`)
- Admin CMS save sets `updatedAt: now` (`app/(admin)/growth-actions.ts`)
- Visible “Last updated” UI already shipped in Section 3

## RUM & alerts (owner)

- **Sentry** — errors / performance (already in repo)
- **GSC** — CWV regressions, coverage, crawl anomalies (email alerts)
- **Optional:** enable Vercel Analytics / Speed Insights on the production project
- Weekly Lighthouse artifacts in Actions → investigate SEO fails immediately; treat LCP warns as backlog until budget met

## Sitemap ping caveat

Google deprecated the public HTTP sitemap ping (2023). The deploy job still calls it for compatibility, always pings Bing, and verifies sitemap XML. Trust **GSC Domain property** crawl for Google indexing.

## Section 10 note

Multilingual / `hreflang` is **out of scope** for current US-English storefront. Revisit if EU/i18n launches.

## Tests

`pnpm seo:ci`  
`pnpm exec vitest run tests/unit/seo-section11.test.ts`
