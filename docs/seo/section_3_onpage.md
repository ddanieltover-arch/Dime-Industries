# Section 3 — On-page SEO

**Date:** 2026-08-03  
**Canonical host:** `https://www.dimeindustries.us`

## Checklist vs master prompt

| Item | Status |
|------|--------|
| 3.1 One H1 + keyword on pillars | Done — home, shop, locations, about, vapes, rosin, Live Reserve, Signature |
| 3.2 Answer capsules | Done — all seeded blog posts; dime-roll corrected to **50 / $5** |
| 3.3 Image alt / figure | Done — product gallery, home awards, category spotlight, About awards use `figure` + `figcaption`; decorative heroes stay `alt=""` |
| 3.4 Internal linking | Done — `internal_linking_plan.csv` + `lib/seo/related-posts.ts` (related posts, sidebar CTAs, catalog SEO links, home Rosin tile) |
| 3.5 Freshness | Done — visible “Last updated” on blog when `updatedAt` ≠ `publishedAt`; `dateModified` already in BlogPosting |

## Code / content changes

- Home default H1 → **DIME Industries**; CTA → `/shop/vapes`
- `/locations` H1 → **Find DIME Near Me** (slogan moved to eyebrow)
- `/about` H1 + title → **About DIME Industries**
- `/shop` H1 + title → **Shop DIME Products**
- Live Reserve + Signature line intros/meta enriched
- Catalog hero “Related guides” links on shop / vapes / rosin / Live Reserve / Signature
- Blog: cluster-aware related posts + per-slug sidebar CTAs
- Corrected `/blog/how-many-dimes-in-a-roll` to 50 dimes / $5
- Capsules added to hardware, prerolls, and State Exclusive posts

## Artifacts

- `docs/seo/internal_linking_plan.csv`
- `lib/seo/related-posts.ts`

## Deferred / next

- Content refresh reminders (ops calendar) every 6 months for top URLs
- Named storefront retailer directory when partner data is available (currently statewide placeholders)
- Section 5 LocalBusiness / Person when NAP or author pages exist (see `section_4_schema.md`)
- Section 5 deferred items: Wikidata entity, long-form definitive pillar, competitor vs posts (see `section_5_geo.md`)

## Follow-ups completed (2026-08-03)

- `/locations/{state}` enrichment: city hubs, answer capsules, FAQs, BreadcrumbList + FAQPage JSON-LD
- Broader `figure`/`figcaption`: product gallery, home awards, category spotlight (About gallery already done)

## Tests

`npm run test:unit -- tests/unit/seo-section3.test.ts`
