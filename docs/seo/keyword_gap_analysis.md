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

Updated **2026-08-04** after hub deepening + calendar publish:

| Keyword | Was | Now | Where |
|---------|-----|-----|--------|
| dime cart / dime pen / dime carts | Partial | **N** | `/shop/vapes` deepened (H1/meta/answer + beginners/flavors links) |
| dime disposable (+ variants) | Y | **N** | `/shop/vapes/disposables` + cart-vs-disposable |
| dime flavors / cart flavors | Y | **N** | `/blog/best-dime-industries-flavors` |
| dime thc las vegas | Partial | **N** | `/locations/nevada` Las Vegas depth |
| dime industries rosin | Partial | **N** | Rosin hub + `/blog/what-is-dime-rosin` |
| dime industries flower | Y | **Partial** | Soft path `/shop` + prerolls — **no invented flower SKUs** |
| dime industries pre-roll | Y | **Partial** | `/shop/prerolls` hub + buying guide |
| dime dispensary | Partial | Partial | `/locations` dispensary language (GBP still owner) |
| dime weed / dime of weed | Partial | Partial | Covered via carts hub slang; low specificity |

### Still soft / owner-dependent

- Flower **loose** catalog — defer until real SKUs exist  
- GBP street NAP for LocalBusiness  
- `.com` → `.us` redirects for equity transfer  

## Highest-volume open / partial gaps (historical Semrush notes)

- **dime cart** (1900 vol) → `/shop/vapes` — deepened 2026-08-04
- **dime pen** (1300 vol) → `/shop/vapes` — deepened 2026-08-04
- **dime disposable** (1300 vol) → `/shop/vapes/disposables` — landing live
- **dime thc las vegas** (480 vol) → `/locations/nevada` — LV depth live
- **dime flavors** (210 vol) → `/blog/best-dime-industries-flavors` — published
- **dime industries flower** (210 vol) → `/shop` soft hub — no invented SKUs
- **dime industries pre-roll** (210 vol) → `/shop/prerolls` — hub + guide

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
