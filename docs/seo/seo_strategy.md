# SEO + GEO Strategy — DIME Industries (Phase 1)

**Canonical site:** https://dimeindustries.us  
**Reference brand site:** https://dimeindustries.com  
**Stack:** Next.js 15 App Router, custom CMS blog, curated SEO in `lib/seo/site.ts`  
**Language:** English  
**Geography:** United States (multi-state retailer discovery via `/locations`)  
**Niche:** Licensed cannabis DTC + retailer discovery (vapes/carts, edibles, prerolls, accessories)

## Goals

1. Make the storefront indexable and AI-citation-ready (technical SEO + GEO).
2. Map seed commercial/brand keywords to concrete URLs.
3. Ship one high-intent informational post that earns featured-snippet / AI Overview eligibility.
4. Preserve compliance: age gate, noindex on checkout/cart/admin, 21+ disclaimers.

## Pillar–cluster model (Phase 1 start)

| Pillar | Role | Cluster / support |
|--------|------|-------------------|
| `/` | Brand / navigational | About, FAQ, Blog index |
| `/shop/vapes` | “Dime cart” commercial hub | Product PDPs, Rosin line, accessories |
| `/shop/*/rosin` | “Dime industries rosin” | Rosin vapes + edibles |
| `/locations` | “Near me” / local intent | State pages under `/locations/[state]` |
| `/blog/how-many-dimes-in-a-roll` | Informational GEO bait | Soft links into shop + find DIME |

## Seed keyword rules

- **dime cart / dimecarts / dim sum cart(s)** = cannabis vape cartridges (and misspellings of Dime). Do **not** create food/dim-sum content.
- **dime industries rosin** = product-line commercial intent → rosin shop URLs.
- **how many dimes in a roll** = factual U.S. coin answer first; brand CTA only after the answer.

## Phased roadmap

### Phase 1 (this sprint) — foundation

- Working docs: strategy, keyword map, content brief, analytics checklist
- Blog: `how-many-dimes-in-a-roll` + BlogPosting / OG / breadcrumbs
- Technical: AI crawler allows, `llms.txt`, WebSite schema
- On-page: vapes + rosin meta/intro refresh

### Phase 2+

- Dedicated “what is a dime cart” blog / landing pages
- DB-driven sitemap for all CMS posts (not seed-only)
- 90-day content calendar, glossary, comparison hubs
- GSC/GA4 verification after DNS cutover
- Local SEO ops (GBP), link building, rank tracking APIs
- Lighthouse CI / crawl audit artifacts

## Dependencies

- Organic gains require public DNS for `dimeindustries.us` (see `docs/46-cutover-owner-actions.md`).
- No Semrush/Ahrefs automation until API credentials exist; Phase 1 uses seed + SERP-informed mapping.

## Success criteria (Phase 1)

- Post live with unique meta, canonical, BlogPosting JSON-LD, answer capsule (`#answer`)
- Sitemap includes new slug; robots allows major AI crawlers; `/llms.txt` reachable
- Keyword map covers all Phase 1 seeds
- Cart/checkout/admin remain noindex; Product/FAQ schemas intact
