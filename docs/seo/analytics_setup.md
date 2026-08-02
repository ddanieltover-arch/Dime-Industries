# Analytics & Search Console Setup (Post-Cutover)

Owner checklist after `dimeindustries.us` DNS points at the Vercel production deploy. See also `docs/46-cutover-owner-actions.md` and `docs/GO_LIVE.md`.

## Prerequisites

- [ ] `dimeindustries.us` and `www.dimeindustries.us` resolve to production
- [ ] `NEXT_PUBLIC_APP_URL=https://dimeindustries.us` on Vercel
- [ ] Smoke: `npm run smoke -- https://dimeindustries.us`
- [ ] Public URLs respond: `/`, `/sitemap.xml`, `/robots.txt`, `/llms.txt`

## Google Search Console

1. Create a **Domain** property for `dimeindustries.us` (DNS TXT verification preferred).
2. Confirm preferred host (apex vs www) matches redirects in Vercel.
3. Submit sitemap: `https://dimeindustries.us/sitemap.xml`
4. Inspect key URLs:
   - `/`
   - `/shop/vapes`
   - `/shop/vapes/rosin`
   - `/locations`
   - `/blog/how-many-dimes-in-a-roll`
5. Monitor Coverage / Pages, Enhancements (Product, FAQ, Breadcrumbs), Core Web Vitals.
6. Enable email alerts for critical issues.

## Google Analytics 4

GA4 is wired with measurement ID `G-N04NC98ZM8` (override via `NEXT_PUBLIC_GA_MEASUREMENT_ID`). gtag loads from the root layout **only when** the visitor has opted into analytics cookies (`lib/consent`).

Owner checklist:

1. Confirm the GA4 Web data stream for `https://dimeindustries.us` uses `G-N04NC98ZM8`
2. Optional: set `NEXT_PUBLIC_GA_MEASUREMENT_ID` on Vercel (defaults to `G-N04NC98ZM8` in code if unset)
3. Recommended events (commerce):
   - `purchase`, `begin_checkout`, `add_to_cart`, `view_item`
   - `generate_lead` (contact / wholesale)
4. Link GA4 ↔ Google Search Console
5. Verify cookie banner: tags must not fire before analytics opt-in

Also use Vercel Analytics / server logs + GSC for organic baselines.

## Bing Webmaster Tools (optional)

1. Import site from GSC or verify via DNS/meta
2. Submit the same sitemap URL

## KPI baseline (record after 7–14 days of indexing)

| KPI | Baseline | 90-day target | Source |
|-----|----------|---------------|--------|
| Organic sessions | TBD | +30% | GA4 |
| Indexed pages | TBD | All public SEO paths | GSC |
| Impressions for seed keywords | TBD | Rising | GSC |
| CTR on `/blog/how-many-dimes-in-a-roll` | TBD | >3% when ranking | GSC |
| LCP / INP / CLS on home + shop | TBD | Good thresholds | GSC CWV |

## Phase 1 seed queries to watch

- dime industries
- dime industries rosin
- dime cart / dimecarts
- dime carts near me
- how many dimes in a roll

## Notes

- Do not submit staging or Vercel preview URLs as the primary property.
- Cart, checkout, account, and admin must remain noindex (already configured in `lib/seo/site.ts` + page metadata).
