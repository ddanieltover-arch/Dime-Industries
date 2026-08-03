# Section 6 — Local SEO

**Date:** 2026-08-03  
**Model:** Multi-state brand + licensed retailer discovery (not a single consumer storefront NAP)

## Checklist vs master prompt

| Item | Status | Notes |
|------|--------|--------|
| 6.1 Google Business Profile | Owner ops | Checklist below — do not invent street NAP in code |
| 6.2 NAP consistency | Partial | Public contact block on `/locations` (name + email + HQ region). Full street/phone when owner publishes GBP |
| 6.3 Local schema | Done (adapted) | State pages emit Place + city GeoCoordinates + OnlineStore (CA/MA). No fake LocalBusiness street address |
| 6.4 Location pages | Done | Unique state copy, city hubs, OSM map embed, Maps retailer search links, FAQ, hub ItemList |
| 6.5 Review strategy | Partial | On-site product reviews + Validate CTA; GBP review SLA is owner ops |

## Code shipped

- `lib/locations/geo.ts` — city/state centroids, OSM embed, Maps search URLs, brand contact constants
- `buildLocationStateJsonLd` / `buildLocationsHubJsonLd` in `lib/seo/json-ld.ts`
- `/locations/[state]` — map section, per-city Maps links, local JSON-LD graph, reviews CTA
- `/locations` — ItemList schema + “How to cite DIME” contact block
- CSP `frame-src` allows `https://www.openstreetmap.org` for embeds

## Owner ops — Google Business Profile (6.1)

1. Claim/create GBP for the **corporate brand** (or primary HQ) — category such as Cannabis Brand / Manufacturer as accurate.
2. Publish identical NAP (Name, Address, Phone) across GBP, site footer/contact, and directories once approved legally.
3. Website URL: `https://www.dimeindustries.us` (www preferred).
4. Add 10+ photos, products/services, Hours if public, messaging optional.
5. Weekly GBP posts (What’s New / Offers) — treat as freshness signals.
6. After NAP is public, add `LocalBusiness` schema with `streetAddress`, `telephone`, `geo`, `hasMap`, and `openingHoursSpecification` (replace current Place-only approach for HQ).

## Owner ops — Citations & NAP (6.2)

1. Audit Yelp / Bing Places / Apple Maps / Facebook / Weedmaps (if used) for name consistency: **DIME Industries**.
2. Prefer BrightLocal, Yext, or Moz Local once street NAP exists.
3. Keep email `sales@dimeindustries.us` consistent with Organization schema.

## Owner ops — Reviews (6.5)

1. Respond to every GBP review within **48 hours**.
2. Post-purchase: continue product review prompts on the storefront; optionally email a GBP review link after validation.
3. Never incentivize fake reviews.

## Deferred until partner store data

- Named retailer directory with per-store LocalBusiness + hours
- Local team photos / store-level testimonials
- Automated GBP review request emails with live GBP URL

## Tests

`npm run test:unit -- tests/unit/seo-section6.test.ts tests/unit/locations-seo.test.ts tests/unit/security-hardening.test.ts`
