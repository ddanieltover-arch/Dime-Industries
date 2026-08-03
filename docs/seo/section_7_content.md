# Section 7 — Content strategy & creation pipeline

**Date:** 2026-08-03  
**Scope:** Audit existing URLs, 90-day calendar from keyword gaps, briefs for next publishes

## Checklist vs master prompt

| Item | Status | Artifact |
|------|--------|----------|
| 7.1 Content audit | Done | [`content_audit.csv`](./content_audit.csv) |
| 7.2 90-day calendar (≥2/week) | Done | [`content_calendar_90d.csv`](./content_calendar_90d.csv) |
| 7.3 Brief template | Done | [`content_brief_template.md`](./content_brief_template.md) |
| Priority briefs (next calendar) | Done | [`content_briefs/`](./content_briefs/) |

## 7.1 Audit summary

| Disposition | Count (approx.) | Notes |
|-------------|-----------------|--------|
| Keep as-is | Majority of shipped GEO blogs + hubs | No forced redirects |
| Improve | Thin shop intros, Signature line, FAQ PAA, older hardware/preroll posts | Calendar + copy passes |
| Consolidate | None forced | No true duplicate URLs requiring 301 |
| Redirect / Delete | None | App routes stay noindex; don’t merge into organic |

**Cannibalization watch:** `dime cart` commercial hub stays `/shop/vapes`; informational depth goes to blogs + future beginners pillar. `live resin vs live reserve` already covered by Signature vs Live Reserve — do not spin a near-duplicate.

**Deferred (compliance):** competitor “DIME vs Jetty / Raw Garden” posts — not on calendar.

## 7.2 Calendar rules applied

- **Cadence:** ~2 planned pieces/week from 2026-08-05 through late Nov 2026 (plus already-published gap posts dated 2026-08-03).
- **Mix (planned organic, excl. ops retrospectives):** ~60% informational guides/HowTos, ~20% commercial line/buyer guides, ~20% navigational / transactional / local enrichment.
- **Priority order:** high-intent low-difficulty gaps first (flavors, resin vs rosin, battery charge, clogged/store FAQs) → line intros → beginners **pillar** (~3k words) → local delivery enrichments.
- **Status column:** `Published` | `Planned` (ops rows marked Planned / internal).

## 7.3 Briefs ready to produce

| Publish target | Brief |
|----------------|--------|
| 2026-08-05 | [`best-dime-industries-flavors.md`](./content_briefs/best-dime-industries-flavors.md) |
| 2026-08-07 | [`live-resin-vs-live-rosin.md`](./content_briefs/live-resin-vs-live-rosin.md) |
| 2026-08-12 | [`how-to-charge-a-dime-battery.md`](./content_briefs/how-to-charge-a-dime-battery.md) |
| 2026-08-14 | [`what-is-in-a-dime-cartridge.md`](./content_briefs/what-is-in-a-dime-cartridge.md) |
| 2026-08-21 | [`are-dime-carts-worth-it.md`](./content_briefs/are-dime-carts-worth-it.md) |
| 2026-08-26 | [`why-is-my-dime-cart-clogged.md`](./content_briefs/why-is-my-dime-cart-clogged.md) |
| 2026-09-30 | [`beginners-guide-to-dime-carts.md`](./content_briefs/beginners-guide-to-dime-carts.md) |

Earlier gap briefs (what-is-a-dime-cart, cart-vs-disposable, Live Reserve, Signature vs Live Reserve, spot fakes) remain under `content_briefs/` for the posts already shipped.

**Pipeline for each Planned row:** copy brief → draft in CMS (`DEFAULT_POSTS` or admin) with `Quick Answer:` first → schema + related-posts cluster → add `SEO_BLOG_SLUGS` → update keyword map Gap → optional `llms.txt` for pillars.

## Still owner / later

- Long-form pillar publish (~3k–4k) on calendar date — not drafted in code yet
- Quarterly refresh pass (Nov) for top posts’ Last Updated + stats
- Competitor comparisons only after legal review
- Ahrefs/Semrush volumes to replace qualitative Volume/Difficulty estimates

## Tests

`npm run test:unit -- tests/unit/seo-section7.test.ts`
