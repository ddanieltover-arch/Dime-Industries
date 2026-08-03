# sitemap.xml — deliverable note (Section 12)

**Live URL (canonical):** https://www.dimeindustries.us/sitemap.xml  
**Source of truth:** `app/sitemap.ts` (dynamic App Router sitemap)

## Validation

| Check | Status |
|-------|--------|
| Reachable on www | Yes (Section 0 / smoke) |
| Declared in robots | Yes — `Sitemap: https://www.dimeindustries.us/sitemap.xml` |
| Includes static SEO paths + blog seeds + CMS posts | Yes — `SEO_STATIC_PATHS` + `SEO_BLOG_SLUGS` + live CMS |
| Submitted to GSC | **Owner action** — Domain property + submit |
| Ping on production deploy | Yes — `scripts/ping-sitemap.mjs` (Bing + deprecated Google ping) |

## Snapshot

Preflight URL inventory (may still list apex host from earlier crawl): [`_sitemap_urls.json`](./_sitemap_urls.json).  
Canonical host in code is **www** (`SITE_URL`).

Do not commit a stale static `sitemap.xml` at repo root — it would drift from the dynamic generator.
