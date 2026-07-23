# Sprint 1 Progress Report — Catalog Foundation

**Date:** 2026-07-20  
**Status:** Implementation complete — awaiting owner review / Sprint 1 exit approval  
**Unit tests:** 13/13 passing  
**Typecheck:** clean

---

## Completed deliverables

| Area | Deliverable |
|---|---|
| Decisions | D1–D7 locked (`docs/10-decisions-d1-d7-locked.md`) |
| Backend | Catalog query layer (`lib/catalog/*`) |
| Backend | `GET /api/products`, `GET /api/products/[slug]` |
| Frontend | `/shop`, `/shop/[category]`, `/shop/[category]/[line]` |
| Frontend | `/product/[slug]` with JSON-LD, COA link stub, related products |
| Shared | Product card, grid, filters, toolbar; `lib/format.ts` |
| SEO | Dynamic sitemap includes categories, lines, products |
| QA | Catalog query unit tests + product card tests; shop E2E spec |

## Remaining / deferred

| Item | Target |
|---|---|
| Wire catalog reads to Drizzle / Supabase | Staging env available |
| Live COA host proxy | When API contracts arrive (D4) |
| Cart / Add to bag on PDP | Sprint 2 |
| Playwright E2E in CI against staging | DevOps follow-up |
| Real product imagery | CMS / asset pipeline |

## Risks updated

| Risk | Note |
|---|---|
| R-002 Fulfillment model | Accepted as seller-of-record (D3) |
| Seed catalog vs DB | Intentional until staging DB; contracts stable for swap |

## Recommendation

Approve Sprint 1 exit and authorize **Sprint 2 — Cart & Wishlist**.

## Next milestone

**Sprint 2:** Persistent cart (guest + auth), wishlist, recently viewed, cart drawer — no payments yet.
