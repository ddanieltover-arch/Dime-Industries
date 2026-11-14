# Keyword gap — Semrush → www.dimeindustries.us

**Source:** Semrush US Organic Positions export for `dimeindustries.com` (2026-11-12), used as the **keyword universe / gap list for our storefront**.

The export shows what Google already associates with DIME. For `.us`, each row is classified as:

| Gap | Meaning |
|-----|---------|
| **N** | Dedicated `.us` URL exists (usually PDP or dedicated hub) — optimize on-page |
| **Partial** | Hub exists but not query-specific — deepen copy / FAQ / blog support |
| **Y** | Need new landing, blog, or missing PDP |

## Coverage summary

| Status | Keywords |
|--------|----------|
| Covered (N) | 47 |
| Partial | 53 |
| Open gap (Y) | 0 |
| Priority sprint rows | 16 |

## Highest-volume open / partial gaps (act on these)

Updated **2026-11-12** after hub landings + curated anchors:

| Keyword | Status | Where |
|---------|--------|--------|
| dime cart / dime carts / dime pen | Partial | `/shop/vapes` — deepen exact-match anchors |
| dime disposable (+ variants) | **N** | `/shop/vapes/disposables` + disposable blogs |
| dime flavors / cart flavors | **N** | `/blog/best-dime-industries-flavors` |
| dime battery | Partial | `/shop/accessories` |
| dime thc las vegas | Partial | `/locations/nevada` |
| dime industries flower | Y / soft | `/shop` — **no invented flower SKUs** |
| dime industries pre-roll | Partial | `/shop/prerolls` + buying guide |
| dime industries rosin | **N** | Rosin hub + `/blog/what-is-dime-rosin` |

### Priority open / partial (auto from this export)

- **dime cart** (1900 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime pen** (1900 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime pen** (1900 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime pen** (1900 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime pen** (1900 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime cart** (1900 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime cart** (1900 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime carts** (1300 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime weed** (720 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime weed** (720 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime battery** (590 vol, Gap Partial) → `/shop/accessories` — Accessories hub live — deepen exact-match anchors + battery blog support
- **dime of weed** (590 vol, Gap Partial) → `/shop/vapes` — Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart
- **dime thc las vegas** (320 vol, Gap Partial) → `/locations/nevada` — Strengthen local capsules + Maps CTAs; sync NAP when GBP live
- **dime industries pre-roll near met** (260 vol, Gap Partial) → `/locations` — Strengthen local capsules + Maps CTAs; sync NAP when GBP live
- **dime industries flower near met** (210 vol, Gap Partial) → `/locations` — Strengthen local capsules + Maps CTAs; sync NAP when GBP live
- **dime industries battery** (210 vol, Gap Partial) → `/shop/accessories` — Accessories hub live — deepen exact-match anchors + battery blog support

### Still soft / owner-dependent

- Flower **loose** catalog — defer until real SKUs exist
- GBP street NAP for LocalBusiness
- `.com` → `.us` redirects for equity transfer

## How we use this in the project

1. [`keyword_gap.csv`](./keyword_gap.csv) — full gap map (canonical for planning)
2. [`keyword_gap_priority.csv`](./keyword_gap_priority.csv) — sprint subset
3. [`keyword_map.csv`](./keyword_map.csv) — Semrush volumes merged for primary commercial terms
4. [`content_calendar_90d.csv`](./content_calendar_90d.csv) — disposable / flavors / rosin / preroll items already aligned
5. [`semrush_url_migration_map.csv`](./semrush_url_migration_map.csv) — still useful for `.com`→`www` redirects at cutover
6. [`organic_positions_anchor_map_2026-11.md`](./organic_positions_anchor_map_2026-11.md) — curated exact-match anchors

## Project build implications

| Gap cluster | Code / content action |
|-------------|----------------------|
| Disposables | Landing live — keep exact-match anchors + blog support |
| Flavors | Flavors guide live — keep Signature/hub cross-links |
| Strain PDPs | Confirm every legacy slug has `/product/{slug}`; optimize titles for “* strain” |
| Rosin / Live Reserve | Hubs live — keep GEO blogs aligned |
| Deals / specials | Enrich `/promotions` |
| Flower | No inventing catalog — soft hub or defer until SKUs |
| Local (`near me`, Las Vegas) | `/locations` + state pages |
| Accessories / battery | `/shop/accessories` + battery blogs |

Regenerate: `node scripts/seo-import-semrush-positions.mjs`
