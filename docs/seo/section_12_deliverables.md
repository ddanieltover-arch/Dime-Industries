# Section 12 — Deliverables checklist

**Date:** 2026-08-03  
**Canonical site:** https://www.dimeindustries.us  
**Playbook:** workspace `SEO_GEO_Master_Prompt.md` Sections 0–11 (+12)

This is the completion inventory for the SEO/GEO program. Paths are under `docs/seo/` unless noted.

---

## Files to deliver

| Deliverable | Status | Location / notes |
|-------------|--------|------------------|
| `audit_report.json` | Done | [`audit_report.json`](./audit_report.json) |
| `crawl_inventory.csv` | Done | [`crawl_inventory.csv`](./crawl_inventory.csv) |
| `core_web_vitals_baseline.json` | Done (before) | [`core_web_vitals_baseline.json`](./core_web_vitals_baseline.json) — **after** scores pending LCP pass |
| `keyword_map.csv` | Done | [`keyword_map.csv`](./keyword_map.csv) (+ [`keyword_gap.csv`](./keyword_gap.csv) from Semrush) |
| `competitor_report.csv` | Done | [`competitor_report.csv`](./competitor_report.csv) |
| `seo_strategy.md` | Done | [`seo_strategy.md`](./seo_strategy.md) |
| `internal_linking_plan.csv` | Done | [`internal_linking_plan.csv`](./internal_linking_plan.csv) |
| `content_calendar.csv` | Done | [`content_calendar.csv`](./content_calendar.csv) (= 90d calendar) |
| `content_briefs/` | Done | [`content_briefs/`](./content_briefs/) (12 briefs + template) |
| `schema_validation_report.json` | Done (code) | [`schema_validation_report.json`](./schema_validation_report.json) — Rich Results UI = owner |
| `link_gap_opportunities.csv` | Done | [`link_gap_opportunities.csv`](./link_gap_opportunities.csv) — DR estimates pending Ahrefs |
| `link_building_crm.csv` | Done | [`link_building_crm.csv`](./link_building_crm.csv) (50 prospects) |
| `guest_post_pipeline.csv` | Done | [`guest_post_pipeline.csv`](./guest_post_pipeline.csv) |
| `email_templates.md` | Done | [`email_templates.md`](./email_templates.md) |
| `analytics_setup.md` | Done | [`analytics_setup.md`](./analytics_setup.md) |
| `kpis_dashboard.md` | Done | [`kpis_dashboard.md`](./kpis_dashboard.md) → [`kpi_dashboard.md`](./kpi_dashboard.md) |
| `geo_content_briefs.md` | Done | [`geo_content_briefs.md`](./geo_content_briefs.md) |
| `llms.txt` | Done | [`public/llms.txt`](../../public/llms.txt) → `/llms.txt` |
| `disavow.txt` | Done (empty) | [`disavow.txt`](./disavow.txt) — no toxic domains confirmed yet |
| `robots.txt` | Done (dynamic) | Live `/robots.txt` from `app/robots.ts`; snapshot [`robots.txt.md`](./robots.txt.md) |
| `sitemap.xml` | Done (dynamic) | Live `/sitemap.xml` from `app/sitemap.ts`; notes [`sitemap.md`](./sitemap.md) |

### Supporting section docs (beyond master file list)

| Doc | Section |
|-----|---------|
| `section_0_preflight_summary.md` … `section_11_automation.md` | 0–11 |
| `content_audit.csv`, `rank_keywords_top50.csv`, `ai_visibility_*` | 7–8 |
| CI: `.github/workflows/seo-*.yml`, `.lighthouserc.json`, `pnpm seo:ci` | 11 |

---

## Validation tests

| Test | Status | Notes |
|------|--------|-------|
| Google Rich Results Test — 0 errors | **Owner** | Run URLs in `schema_validation_report.json`; builders pass `pnpm seo:schema` |
| Google Mobile-Friendly Test | **Owner / deprecated tool** | Prefer GSC mobile usability + Lighthouse mobile; site is responsive App Router |
| PageSpeed Insights — LCP ≤ 2.5s, INP ≤ 200ms, CLS < 0.1 | **Not met (lab)** | Baseline shows LCP misses; tracked as Phase 2+; weekly LH warns on perf |
| Screaming Frog — 0 broken / missing meta / dup titles | **Partial** | `pnpm seo:links` + `seo:audit` offline; monthly live sample; full SF crawl = owner |
| Google Search Console — sitemap indexed, 0 critical coverage | **Owner** | Domain property + submit `https://www.dimeindustries.us/sitemap.xml` |
| W3C HTML Validator — 0 critical | **Owner** | Spot-check primary templates post-deploy |
| SSL Labs — A / A+ | **Owner** | Vercel HTTPS; confirm after custom domain |
| robots.txt Tester (GSC) | **Owner** | Rules documented in `robots.txt.md` |

---

## Program status by section

| Section | Status |
|---------|--------|
| 0 Preflight | Complete |
| 1 Keywords | Complete |
| 2 Technical | Complete (www canonical) |
| 3 On-page | Complete |
| 4 Schema | Complete (applicable types) |
| 5 GEO/AEO | Complete (expansion sprint) |
| 6 Local | Complete (brand model; GBP deferred) |
| 7 Content pipeline | Complete (calendar + briefs) |
| 8 Analytics | Complete (code + protocols; GSC link owner) |
| 9 Link building | Complete (playbooks; Ahrefs owner) |
| 10 Multilingual | Skipped (US-EN only) |
| 11 Automation / CI | Complete |
| 12 Deliverables | Complete (this checklist) |

---

## Owner action queue (blocking “fully live” SEO)

1. Set `NEXT_PUBLIC_APP_URL=https://www.dimeindustries.us` on Vercel if unset  
2. **Redirect map:** `.com` → matching `www` URLs for Semrush winners (`semrush_url_migration_map.csv`)  
3. GSC Domain property `dimeindustries.us` + sitemap submit + robots tester  
4. GA4: conversions, Enhanced measurement, link GSC, freeze Day-0 KPIs (`.us` vs `.com` equity)  
5. Rich Results Test on primary URLs; fix any live errors  
6. LCP ≤ 2.5s field/lab pass on home + shop  
7. Grow referring domains on `.us` (16 today) via Section 9 CRM  
8. Ahrefs/Semrush: backlink audit → real `disavow.txt`  
9. GBP street NAP when ready → upgrade LocalBusiness schema  
10. Execute content calendar + monitor AI Visibility climb from 0  

**Semrush baseline:** [`semrush_baseline_2026-08-02.md`](./semrush_baseline_2026-08-02.md)

---

## Local verification commands

```bash
pnpm seo:ci
pnpm exec vitest run tests/unit/seo-section*.test.ts
pnpm smoke -- https://www.dimeindustries.us
```

## Tests

`pnpm exec vitest run tests/unit/seo-section12.test.ts`
