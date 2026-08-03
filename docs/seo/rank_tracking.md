# Rank Tracking Protocol (Section 8.4)

## Keyword universe

Regenerate the tracked set anytime the keyword map changes:

```bash
node scripts/seo-rank-keywords.mjs
```

Output: [`rank_keywords_top50.csv`](./rank_keywords_top50.csv) — top 50 by Priority (High → Medium), with empty columns for Desktop/Mobile/SERP features.

## Tooling

| Option | When |
|--------|------|
| **Ahrefs / Semrush rank tracker** | Preferred once API/credentials exist |
| **DataForSEO** | Automated CI-friendly pulls |
| **Manual SERPWatcher / spreadsheet** | Until APIs are connected — fill CSV weekly |

Track **Desktop and Mobile** separately (US locale, English).

## SERP feature flags

For each keyword, mark Y/N in the CSV:

- Featured Snippet
- People Also Ask
- AI Overview appearance

## Alerts

- Any **priority High** keyword dropping **> 5 positions** WoW → investigate (indexing, cannibalization, CWV, content freshness)
- Sudden Featured Snippet / AI Overview loss on coin GEO or cart GEO posts → refresh answer capsule

## Priority watch list (always)

- dime industries
- dime cart / dimecarts
- dime industries rosin
- how many dimes in a roll
- what is a dime cart
- how to use a dime cart
- find dime / dime near me (via locations)
- dime live reserve / signature vs live reserve
