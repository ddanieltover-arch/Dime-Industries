# CWV re-measure — Home `/` (age-verified)

**Date:** 2026-08-04  
**Owner:** Enterprise QA & Test Automation Architect (EQTA)  
**Budgets:** LCP ≤ **2500 ms** · CLS ≤ **0.1** (mobile lab, Lighthouse 13.4.1)  
**Method:** `node scripts/lh-home-age-verified.mjs` with cookie `dime_age_verified=1`

## Deploy status (important)

P0 CWV code changes were **not on Vercel production** at measurement time (local dirty working tree vs `main` @ `a381bda`).  

| Target | What was measured |
|---|---|
| `http://127.0.0.1:3010` | Local `next build` + `next start` of **P0 branch code** |
| `https://www.dimeindustries.us` | Live production (**pre-P0 / currently deployed SHA**) |

Re-run this probe against production after P0 is deployed.

## Results

| Run | URL | LCP (ms) | CLS | LCP ≤2.5s | CLS ≤0.1 | Perf score |
|---|---|---:|---:|---|---|---:|
| local P0 runA | localhost:3010 | **3418** | 0.022 | **FAIL** | **PASS** | 0.80 |
| local P0 runB | localhost:3010 | **4019** | 0.022 | **FAIL** | **PASS** | 0.80 |
| local P0 run3 | localhost:3010 | **4006** | 0.022 | **FAIL** | **PASS** | 0.77 |
| live prod | www.dimeindustries.us | **2725** | 0.022 | **FAIL** | **PASS** | 0.76 |

**Median local P0 LCP ≈ 4006 ms.** Live LCP improved vs Aug 2 baseline (~3611 ms) but still over budget.

### Verdict

| Metric | Gate | Result |
|---|---|---|
| CLS | ≤ 0.1 | **PASS** (stable ~0.022) |
| LCP | ≤ 2.5 s | **FAIL** (local ~3.4–4.0 s; live ~2.7 s) |

## Root cause

Age-verified home still downloads **`/brand/hero.mp4`** (~13–15 MiB transfer in lab; **~48.8 MiB** on disk). Network samples:

| Run | hero-poster.webp | hero.mp4 transfer |
|---|---:|---:|
| local P0 runA | 144 KiB | **12.6 MiB** |
| local P0 runB | 144 KiB | **12.6 MiB** |
| live | 143 KiB | **~14.3 MiB** (+ small follow-ups) |

Poster preloads quickly (~0.6 s), but deferred autoplay still pulls the large MP4 and keeps LCP over budget. Total byte weight on local runs ≈ **14 MiB**.

## Remaining debt — `hero.mp4` compression (P0 follow-up)

| Item | Detail |
|---|---|
| Asset | `public/brand/hero.mp4` |
| On-disk size | **~48.8 MB** |
| Lab transfer | **~13–15 MB** (still far too large for LCP) |
| Current mitigation | Poster-first + idle defer + skip on reduced-motion / saveData / 2G |
| Gap | Deferral alone does **not** meet LCP ≤ 2.5 s once the MP4 starts |
| Required fix | Replace with a compressed web hero (target **≤ 1.5–2 MB**, ideally 720p H.264 or short loop + poster-only below `prefers-reduced-motion`); consider load-on-interaction or play only after LCP settles / first input |
| Owner | Senior Full Stack (+ media ops) |
| Priority | **P0** — blocks CWV gate |

## Artifacts

- `docs/seo/_lh_home_p0_runA.json` (+ `.summary.json`)
- `docs/seo/_lh_home_p0_runB.json`
- `docs/seo/_lh_home_p0_run3.json`
- `docs/seo/_lh_home_live_age_verified.json`
- Probe script: `scripts/lh-home-age-verified.mjs`
- DevDep: `lighthouse@13.4.1`

## Re-run

```bash
pnpm build && pnpm start -- -p 3010
# other terminal:
node scripts/lh-home-age-verified.mjs http://127.0.0.1:3010 docs/seo/_lh_home_age_verified.json
node scripts/lh-home-age-verified.mjs https://www.dimeindustries.us docs/seo/_lh_home_live_age_verified.json
```

## Release readiness (CWV slice)

**Not ready** to close the home LCP budget. CLS gate is green. Do not treat homepage CWV as done until compressed `hero.mp4` (or poster-only hero) ships and this probe passes LCP ≤ 2500 ms on age-verified `/`.
