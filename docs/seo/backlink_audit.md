# Backlink Audit Protocol (Section 9.1)

## Prerequisites

- Ahrefs, Majestic, or Moz Link Explorer access for:
  - `dimeindustries.us`
  - `www.dimeindustries.us`
  - `dimeindustries.com` (legacy — inventory equity + toxic risk)
- Google Search Console Domain property verified

## Steps

1. Export all referring domains for `.us` and `.com` (last 24 months).
2. Flag toxic candidates:
   - Spam Score / Toxic Score **> 60**
   - Irrelevant foreign PBNs / casino / pharma spam
   - Exact-match paid directories with no organic traffic
   - Hacked / injected footer links
3. Build `disavow.txt` only for high-confidence toxic domains (see seed file). Prefer **nofollow / ignore** over aggressive disavow when unsure.
4. Submit disavow in GSC → Removals → Disavow links (Domain property).
5. Identify **top 20** highest-value backlinks → fill [`backlink_top20_template.csv`](./backlink_top20_template.csv).
6. Pattern mine top 20: guest posts? news? retailer blogs? podcasts? Replicate via Tier 1–7.

## Top-20 scoring heuristic

Score = (DR × 0.4) + (Organic traffic estimate normalized × 0.3) + (Topical relevance 0–10 × 3) + (Dofollow bonus 10)

Prefer editorial, cannabis-adjacent, CA/MA local news, and industry trades.

## Owner actions this sprint

- [ ] Export Ahrefs backlinks for `.com` + `.us`
- [ ] Complete top-20 CSV
- [ ] Draft first `disavow.txt` if toxic domains confirmed
- [ ] Set Google Alerts: `"DIME Industries"`, `"Dime cart"`, `dimeindustries.us`
