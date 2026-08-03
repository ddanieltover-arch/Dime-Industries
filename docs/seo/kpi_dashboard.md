# KPI Dashboard — Looker Studio (Section 8.3)

Build a Looker Studio report titled **DIME Organic SEO / GEO** after GA4 and GSC are linked.

## Data sources

1. **Google Analytics 4** — property with stream `www.dimeindustries.us`
2. **Google Search Console** — Domain property `dimeindustries.us`
3. **Manual / sheet inputs** (optional): Ahrefs DA, referring domains, AI citation rate from `ai_visibility_log.csv`

## Scorecard KPIs

| KPI | Baseline | Target | Source | Cadence |
|-----|----------|--------|--------|---------|
| Organic Sessions | TBD on `.us` · ~11.9k Semrush Traffic on `.com` export | +30% in 90 days vs `.us` Day-0 | GA4 / Semrush | Weekly |
| Organic Keywords (top 10 positions) | `.com` export: 99 in top 10 · `.us`: n/a | 2× on `.us` in 6 months | GSC / Semrush | Monthly |
| Average Position | `.com` brand terms mostly #1 | < 15 overall on `.us` | GSC | Monthly |
| CTR | TBD | > 3% | GSC | Monthly |
| LCP | TBD | ≤ 2.5s | GSC CWV | Weekly |
| INP | TBD | ≤ 200ms | GSC CWV | Weekly |
| CLS | TBD | < 0.1 | GSC CWV | Weekly |
| Domain Authority / DR | `.us` Authority Score **2** (Semrush) | +5 in 6 months | Semrush/Ahrefs | Monthly |
| Referring Domains | `.us`: **16** RD / **21** backlinks | +10/month | Semrush | Monthly |
| AI Citation Rate | `.us` AI Visibility **0** | Rising | Semrush AI + `ai_visibility_log.csv` | Monthly |
| Conversion Rate (purchase / session) | TBD | Site-specific | GA4 | Weekly |
| Lead rate (`generate_lead`) | TBD | Rising | GA4 | Weekly |

Baselines from Semrush 2026-08-02: [`semrush_baseline_2026-08-02.md`](./semrush_baseline_2026-08-02.md). Freeze formal Day-0 after GSC verifies `.us` indexing; then freeze in Looker Studio.

## Suggested pages / charts

1. **Overview** — organic sessions trend, purchase + lead conversions, CWV status chips
2. **Queries** — GSC top queries (filter seed set: dime cart, dime industries, how many dimes in a roll, live reserve, find dime)
3. **Landing pages** — organic landings for `/shop/vapes`, `/blog/*`, `/locations/*`, `/glossary`
4. **Ecommerce funnel** — `view_item` → `add_to_cart` → `begin_checkout` → `purchase`
5. **GEO watch** — impressions/CTR on answer-capsule posts; AI citation log summary

## Share & cadence

- Share with marketing + engineering (view)
- Weekly 15-min review Mondays; monthly deep dive for DA / AI / link growth
- Alert owners: GSC email + GA4 custom insight on organic session −20% WoW
