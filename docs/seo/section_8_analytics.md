# Section 8 — Analytics & monitoring

**Date:** 2026-08-03  
**Canonical host:** https://www.dimeindustries.us  
**GA4 measurement ID:** `G-N04NC98ZM8` (override `NEXT_PUBLIC_GA_MEASUREMENT_ID`)

## Checklist vs master prompt

| Item | Status | Notes |
|------|--------|--------|
| 8.1 GA4 install | Done | Consent-gated gtag via `GoogleAnalyticsHost` (GTM.js host). Optional `NEXT_PUBLIC_GTM_CONTAINER_ID` documented — do not double-fire |
| 8.1 Conversion events | Done in code | `purchase`, `begin_checkout`, `add_to_cart`, `view_item`, `generate_lead`, `sign_up`, `click` |
| 8.1 `schedule_appointment` | N/A | No booking product |
| 8.1 Enhanced measurement | Owner ops | Enable in GA4 Admin → Data streams → Enhanced measurement |
| 8.1 GA4 ↔ GSC + BigQuery | Owner ops | Link after Domain property verified |
| 8.2 Google Search Console | Owner ops | Domain property `dimeindustries.us`, sitemap submit, www preference |
| 8.3 KPI dashboard | Spec ready | [`kpi_dashboard.md`](./kpi_dashboard.md) — Looker Studio recipe |
| 8.4 Rank tracking | Protocol + list | [`rank_tracking.md`](./rank_tracking.md) + [`rank_keywords_top50.csv`](./rank_keywords_top50.csv) |
| 8.5 AI visibility | Protocol + log | [`ai_visibility_protocol.md`](./ai_visibility_protocol.md) + [`ai_visibility_log.csv`](./ai_visibility_log.csv) |

## Code shipped

| Path | Role |
|------|------|
| `lib/analytics/ga.ts` | Measurement ID + conversion catalog |
| `lib/analytics/track.ts` | Client `gtag` helpers |
| `components/analytics/*` | Host, route listener, outbound clicks, ecommerce events |
| Wired surfaces | PDP `view_item` / `add_to_cart`, checkout `begin_checkout`, confirmation `purchase`, contact + wholesale `generate_lead`, signup `sign_up` |

Tags load **only** when analytics cookie consent is true (`lib/consent`).

## Owner ops (must complete for live baselines)

### GA4
1. Confirm Web stream URL = `https://www.dimeindustries.us`
2. Mark as conversions: `purchase`, `begin_checkout`, `generate_lead`, `sign_up`
3. Enable Enhanced measurement (scroll, outbound, downloads, video, site search)
4. Admin → Product links → link Search Console
5. Admin → Product links → BigQuery (optional; Free tier 1M events/day)
6. DebugView: opt into cookies on staging/prod, complete a cart path, confirm events

### GSC
1. Domain property for `dimeindustries.us` (DNS TXT)
2. Preferred host via redirects (apex → www 308 already)
3. Submit `https://www.dimeindustries.us/sitemap.xml`
4. Email alerts on; weekly review of Coverage, CWV, Manual Actions, Rich Results

### Looker Studio
Follow `kpi_dashboard.md` — connect GA4 + GSC connectors; baselines TBD after 7–14 days indexing.

## Related docs

- [`analytics_setup.md`](./analytics_setup.md) — cutover checklist
- [`kpi_dashboard.md`](./kpi_dashboard.md)
- [`rank_tracking.md`](./rank_tracking.md)
- [`ai_visibility_protocol.md`](./ai_visibility_protocol.md)

## Tests

`npm run test:unit -- tests/unit/seo-section8.test.ts`
