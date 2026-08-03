# Section 5 — GEO / AEO expansion

**Date:** 2026-08-03  
**Canonical host:** `https://www.dimeindustries.us`

## Checklist vs master prompt

| Item | Status |
|------|--------|
| 5.1 Answer capsules | Done — blogs, state locations, about, validate, `/shop/vapes`, glossary/trust/facts |
| 5.2 Question-first + tables + `<dl>` | Done — comparison tables in cart-vs-disposable + signature-vs-live-reserve; glossary `<dl>`; how-to ordered table |
| 5.3 E-E-A-T | Done — `/trust`, blog `ContentByline` (org editorial), reviews schema already on PDP; Last Updated retained |
| 5.4 Entity optimization | Partial — synonyms in glossary/about/llms.txt; Wikipedia/Wikidata deferred (no reliable brand wiki page) |
| 5.5 Semantic HTML | Done — main/article/section/aside/nav/figure/table/dl in place |
| 5.6 AI crawlers + `llms.txt` | Done — robots AI allowlist; `llms.txt` expanded |
| 5.7 Unlinked mentions | Ops checklist below (not code) |
| 5.8 GEO content expansion | Done — `/glossary`, FAQ hub PAA links, comparison posts, `/facts`; definitive long-form guide deferred |

## New routes

| URL | Role |
|-----|------|
| `/glossary` | Term definitions + FAQPage schema |
| `/trust` | Trust / credentials hub |
| `/facts` | Citable brand facts with sources |
| `/blog/how-to-use-a-dime-cart` | HowTo + steps table |

## Owner ops (5.7)

1. Create Google Alert for “DIME Industries”, “Dime cart”, “dimeindustries”.
2. Optionally add Brand24 / Mention monitoring.
3. When unlinked mentions appear on trusted sites, request a link to the matching canonical (glossary / product / locations).

## Deferred

- Wikidata / Wikipedia entity pages (editorial ownership)
- 3,000–6,000 word definitive pillar (schedule as content sprint)
- Competitor “DIME vs X” posts (compliance review required)

## Tests

`npm run test:unit -- tests/unit/seo-section5.test.ts tests/unit/cms-faq.test.ts tests/unit/seo-section3.test.ts`
