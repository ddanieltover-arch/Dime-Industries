# SEO + GEO Strategy — DIME Industries (Phase 1)

**Canonical site:** https://www.dimeindustries.us  
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

### Section 0 — Pre-flight (complete)

Artifacts in `docs/seo/`: `audit_report.json`, `crawl_inventory.csv`, `core_web_vitals_baseline.json`, `seo_baseline.json`, `competitor_report.csv`, `section_0_preflight_summary.md`. Re-run via `node scripts/seo-preflight-assemble.mjs`.

### Section 2 — Technical SEO (complete for remaining Phase-1 gaps)

See `section_2_technical.md`: dynamic sitemap, CMS OG/meta, faceted noindex, age-gate SSR teaser, HSTS, hero preload. **Canonical host is www** (`SITE_URL` + Vercel apex→www 308). Set `NEXT_PUBLIC_APP_URL=https://www.dimeindustries.us` on Vercel if not already.

### Section 3 — On-page SEO (complete)

See `section_3_onpage.md` + `internal_linking_plan.csv`: keyword H1s, answer capsules on all seeded posts, dime-roll corrected to **50/$5**, cluster internal links, Last Updated UI, Live Reserve/Signature intros.

### Section 4 — Structured data (complete for applicable types)

See `section_4_schema.md`: global Organization + WebSite SearchAction, Product/Review, HowTo, SoftwareApplication, VideoObject, breadcrumbs on primary routes. Person deferred; LocalBusiness adapted in Section 6 (Place/OnlineStore until public NAP).

### Section 5 — GEO / AEO (complete for expansion sprint)

See `section_5_geo.md`: `/glossary`, `/trust`, `/facts`, answer capsules on pillars, comparison tables, how-to-use cart post, editorial byline, expanded `llms.txt`.

### Section 6 — Local SEO (complete for brand model)

See `section_6_local.md`: state Place/OnlineStore schema, city maps + Maps retailer search, locations hub ItemList + contact block, GBP/NAP/review owner checklist. Full LocalBusiness deferred until public street NAP exists.

### Section 7 — Content pipeline (complete for planning sprint)

See `section_7_content.md`: `content_audit.csv`, `content_calendar_90d.csv` (≥2/week, gap-prioritized), `content_brief_template.md`, and priority briefs under `content_briefs/`. Next publishes start 2026-08-05 (flavors) → beginners pillar 2026-09-30. No forced consolidating redirects.

### Section 8 — Analytics & monitoring (complete for code + protocols)

See `section_8_analytics.md`: consent-gated GA4 (`G-N04NC98ZM8`) with ecommerce + lead events, Looker Studio KPI spec (`kpi_dashboard.md`), top-50 rank list + protocol, AI visibility protocol/log. Owner still verifies GSC Domain property, Enhanced measurement, GA4↔GSC link, and freezes Day-0 baselines after 7–14 days.

### Section 9 — Link building & digital PR (complete for playbooks + seeded trackers)

See `section_9_link_building.md`: backlink audit protocol, empty `disavow.txt` (pending Ahrefs), `link_gap_opportunities.csv`, 50-prospect `link_building_crm.csv`, guest pipeline, email templates (Tiers 1–7), quality standards, outreach infra. Live DR/toxic scoring still requires Ahrefs/Majestic credentials.

### Section 10 — Multilingual (skipped)

US-English only for now — no `hreflang` / locale subdirectories. Revisit if EU/i18n launches.

### Section 11 — Automation & CI (complete)

See `section_11_automation.md`: `seo-check.yml` static gates, weekly Lighthouse, monthly crawl, production sitemap ping, freshness script, schema validator. `pnpm seo:ci` runs offline gates locally.

### Section 12 — Deliverables checklist (complete)

See `section_12_deliverables.md`: full file inventory vs master prompt, validation test status (code vs owner), and owner action queue. Alias files added: `content_calendar.csv`, `kpis_dashboard.md`, `geo_content_briefs.md`, `schema_validation_report.json`.

### Semrush keyword gap ingested (2026-08-02)

Positions export treated as **gap list for this storefront** — see `keyword_gap_analysis.md` / `keyword_gap.csv` (17 open, 52 partial, 31 covered). Calendar + `keyword_map.csv` updated for disposables landing, flavors, strain PDPs, and cart hub depth. `.com`→`www` redirect map remains a cutover companion.

### Phase 2+ (post-checklist)

- **Critical:** `.com` → `www.dimeindustries.us` redirect map for Semrush-winning URLs
- Owner GSC/GA4/Rich Results/SSL/Screaming Frog passes
- Execute calendar drafts + link outreach (grow `.us` RD past 16)
- LCP ≤ 2.5s → tighten Lighthouse perf asserts
- Ahrefs/Semrush backlink audit → real disavow
- GBP NAP → LocalBusiness schema
- Optional Vercel Analytics / multilingual (Section 10) if markets expand

## Dependencies

- Organic gains require public DNS for `dimeindustries.us` (see `docs/46-cutover-owner-actions.md`).
- No Semrush/Ahrefs automation until API credentials exist; Phase 1 uses seed + SERP-informed mapping.

## Success criteria (Phase 1)

- Post live with unique meta, canonical, BlogPosting JSON-LD, answer capsule (`#answer`)
- Sitemap includes new slug; robots allows major AI crawlers; `/llms.txt` reachable
- Keyword map covers all Phase 1 seeds
- Cart/checkout/admin remain noindex; Product/FAQ schemas intact
