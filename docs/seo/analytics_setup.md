# Analytics & Search Console Setup (Post-Cutover)

Owner checklist after `dimeindustries.us` DNS points at the Vercel production deploy. See also `docs/46-cutover-owner-actions.md`, `docs/GO_LIVE.md`, and **[`section_8_analytics.md`](./section_8_analytics.md)**.

## Prerequisites

- [ ] `dimeindustries.us` and `www.dimeindustries.us` resolve to production
- [ ] `NEXT_PUBLIC_APP_URL=https://www.dimeindustries.us` on Vercel
- [ ] Smoke: `npm run smoke -- https://www.dimeindustries.us`
- [ ] Public URLs respond: `/`, `/sitemap.xml`, `/robots.txt`, `/llms.txt`

## Google Search Console

1. Create a **Domain** property for `dimeindustries.us` (DNS TXT verification preferred).
2. Confirm preferred host: **www** (apex → www 308 on Vercel).
3. Submit sitemap: `https://www.dimeindustries.us/sitemap.xml`
4. Inspect key URLs: `/`, `/shop/vapes`, `/shop/vapes/rosin`, `/locations`, `/blog/how-many-dimes-in-a-roll`, `/glossary`
5. Monitor Coverage / Pages, Enhancements (Product, FAQ, Breadcrumbs, HowTo), Core Web Vitals.
6. Enable email alerts for critical issues.

## Google Analytics 4

GA4 is wired with measurement ID `G-N04NC98ZM8` (override via `NEXT_PUBLIC_GA_MEASUREMENT_ID`). gtag loads from the root layout **only when** the visitor has opted into analytics cookies (`lib/consent`).

Client events (consent-gated):

| Event | Trigger |
|-------|---------|
| `view_item` | Product detail page |
| `add_to_cart` | PDP / quick add |
| `begin_checkout` | Checkout page with cart value |
| `purchase` | Confirmation when `payment_confirmed` |
| `generate_lead` | Contact form + wholesale apply success |
| `sign_up` | Account signup success |
| `click` | mailto / tel / outbound links |
| `page_view` | Initial load + App Router navigations |

Owner checklist:

1. Confirm the GA4 Web data stream for `https://www.dimeindustries.us` uses `G-N04NC98ZM8`
2. Optional: set `NEXT_PUBLIC_GA_MEASUREMENT_ID` on Vercel
3. Optional later: `NEXT_PUBLIC_GTM_CONTAINER_ID` — use **either** GTM *or* keep direct gtag, not both without dedupe
4. Mark key events as conversions; enable Enhanced measurement
5. Link GA4 ↔ Google Search Console; optional BigQuery export
6. Verify cookie banner: tags must not fire before analytics opt-in
7. Build Looker Studio dashboard per [`kpi_dashboard.md`](./kpi_dashboard.md)

Also use Vercel Analytics / server logs + GSC for organic baselines.

## Bing Webmaster Tools (optional)

1. Import site from GSC or verify via DNS/meta
2. Submit the same sitemap URL

## Rank + AI monitoring

- Rank list: [`rank_keywords_top50.csv`](./rank_keywords_top50.csv) — protocol in [`rank_tracking.md`](./rank_tracking.md)
- AI citations: [`ai_visibility_protocol.md`](./ai_visibility_protocol.md) + log CSV

## KPI baseline (record after 7–14 days of indexing)

| KPI | Baseline | 90-day target | Source |
|-----|----------|---------------|--------|
| Organic sessions | TBD | +30% | GA4 |
| Indexed pages | TBD | All public SEO paths | GSC |
| Impressions for seed keywords | TBD | Rising | GSC |
| CTR on `/blog/how-many-dimes-in-a-roll` | TBD | >3% when ranking | GSC |
| LCP / INP / CLS on home + shop | TBD | Good thresholds | GSC CWV |
| AI Citation Rate | TBD | Rising | Manual / Profound |

## Phase 1 seed queries to watch

- dime industries
- dime industries rosin
- dime cart / dimecarts
- dime carts near me
- how many dimes in a roll

## Notes

- Do not submit staging or Vercel preview URLs as the primary property.
- Cart, checkout, account, and admin must remain noindex (already configured in `lib/seo/site.ts` + page metadata).
- `schedule_appointment` is N/A (no booking flow).
