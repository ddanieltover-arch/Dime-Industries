# AI Visibility Monitoring (Section 8.5)

## KPI

**AI Citation Rate** = (Queries where DIME / brand URL is cited or clearly recommended ÷ Total tested queries) × 100

Target: establish baseline in month 1; improve month-over-month via GEO pages (`/glossary`, `/facts`, `/trust`, answer capsules, `llms.txt`).

## Weekly protocol (manual until Profound/Brandwatch)

1. Use a clean session (or logged-out) on each engine.
2. Run the **standard query set** below.
3. Log results in [`ai_visibility_log.csv`](./ai_visibility_log.csv).
4. Note mention quality: *Cited URL* | *Brand name only* | *Wrong product* | *Absent*

### Engines

- ChatGPT (web browsing if available)
- Perplexity
- Google AI Overviews (incognito SERP)
- Bing Copilot
- Claude (web if available)

### Standard query set (rotate ±2 variants)

1. What is a Dime cart?
2. How many dimes in a roll?
3. DIME Industries Live Reserve vs Signature
4. How to spot fake Dime carts
5. Where to buy DIME Industries near me
6. Best lab-tested cannabis carts California (brand-neutral — see if DIME appears)
7. What is DIME Rosin?
8. How to validate a Dime product

## Monthly summary

- Citation rate by engine
- Which URLs get cited (`www.dimeindustries.us` vs legacy `.com`)
- Content gaps → feed Section 7 calendar

## Tools (optional paid)

Profound.com, Brandwatch, or similar — plug into Looker Studio when available. Until then, CSV + monthly memo is the source of truth.
