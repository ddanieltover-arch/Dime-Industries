# Keyword gap — Semrush → www.dimeindustries.us

**Source:** Semrush US Organic Positions export for `dimeindustries.com` (2026-08-02), used as the **keyword universe / gap list for our storefront**.

The export shows what Google already associates with DIME. For `.us`, each row is classified as:

| Gap | Meaning |
|-----|---------|
| **N** | Dedicated `.us` URL exists (usually PDP) — optimize on-page |
| **Partial** | Hub exists but not query-specific — deepen copy / FAQ / blog support |
| **Y** | Need new landing, blog, or missing PDP |

## Coverage summary

| Status | Keywords |
|--------|----------|
| Covered (N) | 31 |
| Partial | 52 |
| Open gap (Y) | 17 |
| Priority sprint rows | 26 |

## Highest-volume open / partial gaps (act on these)

- **dime cart** (1900 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime pen** (1300 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime disposable** (1300 vol, Gap Y) → `/blog/dime-cart-vs-disposable` — High-volume gap — need dedicated disposable landing (calendar) + cart-vs-disposable already helps
- **dimes disposable** (1000 vol, Gap Y) → `/blog/dime-cart-vs-disposable` — High-volume gap — need dedicated disposable landing (calendar) + cart-vs-disposable already helps
- **dime carts** (1000 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime weed** (720 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime of weed** (590 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime dispo** (480 vol, Gap Y) → `/blog/dime-cart-vs-disposable` — High-volume gap — need dedicated disposable landing (calendar) + cart-vs-disposable already helps
- **dime thc las vegas** (480 vol, Gap Partial) → `/locations/nevada` — Strengthen local capsules + Maps CTAs; sync NAP when GBP live
- **dime thc las vegas** (480 vol, Gap Partial) → `/locations/nevada` — Strengthen local capsules + Maps CTAs; sync NAP when GBP live
- **dime industries disposable** (320 vol, Gap Y) → `/blog/dime-cart-vs-disposable` — High-volume gap — need dedicated disposable landing (calendar) + cart-vs-disposable already helps
- **dime industries rosin** (320 vol, Gap Partial) → `/shop/vapes/rosin` — Rosin hub live — deepen intro + ship what-is-dime-rosin blog
- **dime 2g disposable** (260 vol, Gap Y) → `/blog/dime-cart-vs-disposable` — High-volume gap — need dedicated disposable landing (calendar) + cart-vs-disposable already helps
- **dime flavors** (210 vol, Gap Y) → `/blog/best-dime-industries-flavors` — Ship flavors guide (calendar 2026-08-05); link Signature hub
- **dime industries flower** (210 vol, Gap Y) → `/shop` — Category thin or SKUs pending — calendar buying guides; don't invent flower catalog
- **dime dispensary** (210 vol, Gap Partial) → `/locations` — Strengthen local capsules + Maps CTAs; sync NAP when GBP live
- **dime industries pre-roll** (210 vol, Gap Y) → `/shop/prerolls` — Category thin or SKUs pending — calendar buying guides; don't invent flower catalog
- **dime disposables** (140 vol, Gap Y) → `/blog/dime-cart-vs-disposable` — High-volume gap — need dedicated disposable landing (calendar) + cart-vs-disposable already helps
- **dime dispos** (140 vol, Gap Y) → `/blog/dime-cart-vs-disposable` — High-volume gap — need dedicated disposable landing (calendar) + cart-vs-disposable already helps
- **dime disposable pens** (110 vol, Gap Y) → `/blog/dime-cart-vs-disposable` — High-volume gap — need dedicated disposable landing (calendar) + cart-vs-disposable already helps

## How we use this in the project

1. [`keyword_gap.csv`](./keyword_gap.csv) — full 100-keyword gap map (canonical for planning)
2. [`keyword_gap_priority.csv`](./keyword_gap_priority.csv) — sprint subset
3. [`keyword_map.csv`](./keyword_map.csv) — Semrush volumes merged for primary commercial terms
4. [`content_calendar_90d.csv`](./content_calendar_90d.csv) — disposable / flavors / rosin / preroll items already aligned
5. [`semrush_url_migration_map.csv`](./semrush_url_migration_map.csv) — still useful for `.com`→`www` redirects at cutover

## Project build implications

| Gap cluster | Code / content action |
|-------------|----------------------|
| Disposables (`dime disposable` 1300) | Dedicated landing or format hub — do not rely on homepage alone |
| Flavors (`dime flavors` 210) | Ship `/blog/best-dime-industries-flavors` |
| Strain PDPs | Confirm every legacy slug has `/product/{slug}`; optimize titles for “* strain” |
| Rosin / Live Reserve | Hubs live — finish GEO blogs on calendar |
| Deals / specials | Enrich `/promotions` |
| Flower | No inventing catalog — soft hub or defer until SKUs |
| Local (`near me`, Las Vegas) | `/locations` + state pages |

Regenerate: `node scripts/seo-import-semrush-positions.mjs`
