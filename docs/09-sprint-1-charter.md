# Sprint 1 Charter — Catalog Foundation

**Status:** Active (authorized 2026-07-20)  
**Milestone:** S1 — Catalog Foundation  
**Phases covered:** Backend Phase 2 (partial) + Frontend Page 2  
**Duration:** ~2–3 weeks  
**Exit gate:** Browse-complete storefront (shop, category, line, PDP) with search/filters; no checkout

---

## Decisions D1–D7 — locked 2026-07-20

Project owner confirmed **Current Assumption for all**. These are now baseline for Sprint 1+.

| ID | Decision | Locked value | Change control |
|---|---|---|---|
| D1 | Launch jurisdictions | **CA + MA** | Config via `site_settings` / jurisdiction gating — no code change to add states |
| D2 | Age verification | **21+ flat** | `medical_patient` flag reserved; do not build medical carve-out until change request |
| D3 | Fulfillment model | **Platform is licensed seller of record** | Own inventory + delivery zones; retailer-routing requires schema change (tracked risk R-002) |
| D4 | COA + Rewards | **Integrate existing hosted systems** | Do not rebuild; Sprint 1 uses external URL placeholders until API contracts arrive |
| D5 | Wholesale timing | **Phase 2 (post-MVP)** | Nav may link; wholesale flows out of Sprint 1–3 |
| D6 | Payment at launch | **Paybis BTC only** | Payment abstraction still required; no second gateway at launch |
| D7 | M4.0 gate | **Approved** | Sprint 1 authorized |

| Decision | Locked value | Risk if wrong |
|---|---|---|
| Launch jurisdictions | CA + MA | Config-only change later |
| Age gate | 21+ flat | Medical flag reserved on user model |
| Fulfillment model | Platform as seller of record | Schema impact if retailer-routing later (B1 accepted) |
| COA / Rewards | Integrate existing systems; Sprint 1 uses URL placeholders | PDP shows COA link stub until API contracts arrive |
| Wholesale | Phase 2 / post-MVP | Nav link remains; page deferred |
| Payments | Paybis BTC at Phase 12 | Out of Sprint 1 scope |

---

## Sprint 1 scope (IN)

- Catalog read service (list, filter, search, get-by-slug)
- `GET /api/products`, `GET /api/products/[slug]`
- Pages: `/shop`, `/shop/[category]`, `/shop/[category]/[line]`, `/product/[slug]`
- Faceted filters + sort + URL-persisted query state
- Potency-first product cards (shared)
- Dynamic sitemap entries for catalog routes
- Unit tests for catalog query layer; E2E smoke for shop

## Sprint 1 scope (OUT)

- Cart, checkout, payments
- Wishlist persistence
- Admin CRUD
- Real Supabase-backed reads (catalog uses schema-shaped seed catalog until DB is wired in staging)
- COA host live proxy
- Reviews submission

---

## Task board

| Task ID | Title | Owner | Priority | Status |
|---|---|---|---|---|
| T-101 | Shop page — product grid + sort | Frontend | P0 | Done |
| T-102 | Category / line pages + facet filters | Frontend | P0 | Done |
| T-103 | Product detail page | Frontend | P0 | Done |
| T-104 | Shared product card + formatPrice | Frontend | P1 | Done |
| T-105 | Search UI (q param) | Frontend | P1 | Done |
| T-110 | Catalog read APIs | Backend | P0 | Done |
| T-111 | Faceted filter query layer | Backend | P0 | Done |
| T-112 | Full-text search (in-memory, Postgres-ready) | Backend | P1 | Done |
| T-120 | Catalog unit tests | QA | P0 | Done |
| T-121 | Shop E2E smoke | QA | P1 | Done (spec written; needs live server) |
| T-130 | Dynamic sitemap for catalog | SEO | P2 | Done |

---

## Success criteria

1. Age-gated visitors can browse shop/category/PDP with jurisdiction-aware catalog
2. Filters (category, line, strain, potency band, format, price, sort, q) work via URL
3. Product cards always show THC/CBD
4. Typecheck + unit tests pass
5. No cart/checkout scope creep

## Exit criteria

- Sprint 1 report signed off by project owner
- Remaining work deferred to Sprint 2 (Cart) with no silent gaps
