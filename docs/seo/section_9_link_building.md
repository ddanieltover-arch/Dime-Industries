# Section 9 — Link building & digital PR

**Date:** 2026-08-03  
**Canonical link destination:** `https://www.dimeindustries.us` (prefer www; avoid pitching preview/staging URLs)  
**Legacy brand equity:** `dimeindustries.com` — migrate mentions to `.us` where editors will update

## Checklist vs master prompt

| Item | Status | Artifact |
|------|--------|----------|
| 9.1 Backlink audit | Protocol + templates | [`backlink_audit.md`](./backlink_audit.md), [`backlink_top20_template.csv`](./backlink_top20_template.csv), [`disavow.txt`](./disavow.txt) |
| 9.2 Competitor link gap | Seeded (verify in Ahrefs) | [`link_gap_opportunities.csv`](./link_gap_opportunities.csv) |
| 9.3 Campaign tiers 1–7 | Playbook + templates | This doc + [`email_templates.md`](./email_templates.md) |
| 9.3 Guest posts | Pipeline seeded | [`guest_post_pipeline.csv`](./guest_post_pipeline.csv) |
| 9.4 Outreach infrastructure | Spec | [`outreach_infrastructure.md`](./outreach_infrastructure.md) |
| 9.4 CRM | Seeded 50 prospects | [`link_building_crm.csv`](./link_building_crm.csv) |
| 9.5 Quality standards | Done | [`link_quality_standards.md`](./link_quality_standards.md) |

**Blocked without owner tools:** Live Ahrefs/Majestic crawl, toxic-link scoring, and confirmed DR/traffic. All DR values in CSVs are **estimates** until credentials exist.

## Competitors (from Section 0.4)

Use these domains for gap analysis in Ahrefs “Link intersecting” / “Content gap → referring domains”:

1. `weedmaps.com` — marketplace / near-me
2. `halaracannabis.com` — live resin / cart brand
3. `binske.com` — extract brand
4. `howmanydimesinaroll.com` — coin informational SERP
5. `dimeindustries.com` — legacy brand (equity migration, not “attack” competitor)

## Priority link targets (where links should point)

| Priority | URL | Why |
|----------|-----|-----|
| P0 | `/` | Brand navigational |
| P0 | `/shop/vapes` | Commercial “dime cart” hub |
| P0 | `/locations` | Local / near-me |
| P1 | `/blog/how-many-dimes-in-a-roll` | Coin GEO / snippet |
| P1 | `/blog/what-is-a-dime-cart` | Definition GEO |
| P1 | `/trust`, `/lab-results`, `/validate` | E-E-A-T |
| P1 | `/glossary`, `/facts` | AI citation |

## Tier execution order (ROI)

1. **Unlinked brand mentions** — Google Alerts for “DIME Industries”, “Dime cart”, “DIME Live Reserve”
2. **Digital PR / quarterly data study** — see Tier 2 brief below
3. **Guest posts** — DR 40+ cannabis / retail / hardware education
4. **Broken link building** — Ahrefs broken backlinks on Halara / Binske / coin SERP pages
5. **Resource & listicle placements** — “best cannabis brands CA”, “vape hardware guides”
6. **HARO / Connectively / Featured / Qwoted** — 5–10 pitches/week
7. **Podcasts & newsletters** — media kit + show-notes link

## Tier 2 — First quarterly data study (proposal)

**Working title:** *DIME Authenticity Pulse 2026 — How shoppers verify cannabis carts in CA & MA*

**Hook angles (compliance-safe):**
- % of support tickets mentioning counterfeit concerns (internal anonymized)
- Validate tool usage trends (aggregated, no PII)
- Share of licensed vs gray-market purchase questions in contact form tags

**Press release:** 5 bullets + expert quote from brand/ops — pitch MJBiz, Cannabis Business Times, Leafly News editors, local CA/MA business desks.

**Publish URL:** `/blog/…` or `/facts` companion + PDF table for journalists.

## Compliance (non-negotiable)

- No medical/health claims in pitches or guest posts
- 21+ / licensed markets only; do not pitch underage audiences
- Prefer licensed-retailer framing for “where to buy”
- Do not buy links, PBNs, or private blog networks
- No competitor attack / disparagement posts

## Monthly targets (from master prompt)

- ≥ **50** outreach contacts
- **5–10** qualifying link wins (see quality standards)
- Track everything in `link_building_crm.csv`

## Tests

`npm run test:unit -- tests/unit/seo-section9.test.ts`
