# Section 4 — Structured data (schema)

**Date:** 2026-08-03  
**Canonical host:** `https://www.dimeindustries.us`  
**Builders:** `lib/seo/json-ld.ts` · injector: `components/seo/json-ld-script.tsx`

## Checklist vs master prompt

| Schema | Status | Where |
|--------|--------|--------|
| Organization (4.1) | Done — logo ImageObject, email contactPoints, sameAs, areaServed, foundingDate | Global via `app/layout.tsx` |
| WebSite + SearchAction (4.1) | Done — `potentialAction` → `/shop?q={search_term_string}` | Global via layout |
| BreadcrumbList (4.1) | Done on primary public surfaces | Shop, category, line, PDP, blog, about, FAQ, locations, validate, app |
| BlogPosting (4.2) | Done (existing, linked to org `@id`) | `/blog/[slug]` |
| FAQPage (4.2) | Done | `/faq`, blog FAQs, `/locations/[state]` |
| Product + Offer + AggregateRating + Review (4.2) | Done | `/product/[slug]` |
| HowTo (4.2) | Done | `/validate`, `/blog/how-to-spot-fake-dime-carts` |
| SoftwareApplication (4.2) | Done | `/app` |
| VideoObject (4.2) | Done | Home (`/brand/hero.mp4`) |
| LocalBusiness (4.2) | Deferred → Section 6 adapted | No consumer storefront NAP; state pages use Place + OnlineStore (see `section_6_local.md`) |
| Person (4.2) | Deferred | No dedicated founder/author pages yet — BlogPosting author remains Organization |

## Social sameAs (verified)

- https://dimeindustries.com  
- https://www.instagram.com/dime.industries/  
- https://www.facebook.com/DimeIndustriesCo  
- https://www.linkedin.com/company/dime-industries  

## Owner validation

Before promoting rich results, spot-check with [Google Rich Results Test](https://search.google.com/test/rich-results):

1. `https://www.dimeindustries.us/` — Organization, WebSite, VideoObject  
2. `https://www.dimeindustries.us/product/{slug}` — Product  
3. `https://www.dimeindustries.us/validate` — HowTo  
4. `https://www.dimeindustries.us/faq` — FAQPage  
5. `https://www.dimeindustries.us/blog/how-to-spot-fake-dime-carts` — BlogPosting + HowTo + FAQ  

## Tests

`npm run test:unit -- tests/unit/seo-section4.test.ts tests/unit/seo-json-ld.test.ts`
