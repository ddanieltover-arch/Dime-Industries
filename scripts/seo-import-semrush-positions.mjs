// scripts/seo-import-semrush-positions.mjs
// Treats the Semrush Organic Positions export as the keyword-gap universe for www.dimeindustries.us
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seoDir = join(root, "docs/seo");
const src = join(seoDir, "semrush_organic_positions_com_us_2026-11-12.csv");
const baselineDate = "2026-11-12";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      q = !q;
      continue;
    }
    if ((c === "," && !q) || ((c === "\n" || c === "\r") && !q)) {
      row.push(cur);
      cur = "";
      if (c === "\n" || (c === "\r" && text[i + 1] !== "\n")) {
        if (row.some((x) => x.length)) rows.push(row);
        row = [];
      }
      if (c === "\r" && text[i + 1] === "\n") i++;
      continue;
    }
    cur += c;
  }
  row.push(cur);
  if (row.some((x) => x.length)) rows.push(row);
  return rows;
}

function slugFromLegacy(url) {
  const m = String(url || "").match(
    /\/products\/vapes\/(?:signature-line|live-reserve-line|collaborations|rosin-line)\/([^/?#]+)/i
  );
  return m ? m[1].toLowerCase() : null;
}

const productSlugs = new Set();
const crawlPath = join(seoDir, "crawl_inventory.csv");
if (existsSync(crawlPath)) {
  for (const m of readFileSync(crawlPath, "utf8").matchAll(
    /\/product\/([a-z0-9-]+)/gi
  )) {
    productSlugs.add(m[1].toLowerCase());
  }
}

// Also seed from catalog image folders when present
const catalogDir = join(root, "public/catalog");
if (existsSync(catalogDir)) {
  for (const name of readdirSync(catalogDir, { withFileTypes: true })) {
    if (name.isDirectory()) productSlugs.add(name.name.toLowerCase());
  }
}

if (!existsSync(src)) {
  console.error(`Missing Semrush source: ${src}`);
  process.exit(1);
}

const rows = parseCsv(readFileSync(src, "utf8").trim());
const hdr = rows[0];
const col = (n) => hdr.indexOf(n);
const data = rows.slice(1).map((r) => ({
  keyword: r[col("Keyword")],
  position: Number(r[col("Position")]),
  volume: Number(r[col("Search Volume")]) || 0,
  kd: Number(r[col("Keyword Difficulty")]) || 0,
  cpc: Number(r[col("CPC")]) || 0,
  url: r[col("URL")],
  traffic: Number(r[col("Traffic")]) || 0,
  intents: r[col("Keyword Intents")] || "",
  serp: r[col("SERP Features by Keyword")] || "",
}));

/** Map each Semrush keyword → .us target + gap status for THIS project */
function classify(row) {
  const kw = row.keyword.toLowerCase();
  const legacySlug = slugFromLegacy(row.url);
  const hasPdp = legacySlug && productSlugs.has(legacySlug);

  // Strain / PDP queries
  if (legacySlug || /\bstrain\b/.test(kw) || hasPdp) {
    if (hasPdp) {
      return {
        assignedUrl: `/product/${legacySlug}`,
        pageType: "Product",
        gap: "N",
        priority: row.volume >= 1000 ? "High" : "Medium",
        action: "Optimize PDP meta/H1/schema for strain query; ensure in sitemap",
        cluster: "Strain PDP",
      };
    }
    if (legacySlug) {
      return {
        assignedUrl: `/product/${legacySlug}`,
        pageType: "Product",
        gap: "Y",
        priority: "High",
        action: "Missing PDP on .us — import SKU or redirect to line hub until live",
        cluster: "Strain PDP",
      };
    }
    return {
      assignedUrl: "/shop/vapes",
      pageType: "Category",
      gap: "Partial",
      priority: "Medium",
      action: "Strain query without clear PDP — target Signature/Live Reserve hub + internal links",
      cluster: "Strain PDP",
    };
  }

  if (/near me|near met|dispensary|las vegas|nevada|california|massachusetts|arizona|new jersey|mesquite/.test(kw)) {
    let path = "/locations";
    if (/las vegas|nevada/.test(kw)) path = "/locations/nevada";
    if (/california|los angeles|orange/.test(kw)) path = "/locations/california";
    if (/new jersey|nj\b/.test(kw)) path = "/locations/new-jersey";
    if (/find-us|pre-roll near|carts near|disposable near/.test(kw)) path = "/locations";
    return {
      assignedUrl: path,
      pageType: "Location",
      gap: "Partial",
      priority: "High",
      action: "Strengthen local capsules + Maps CTAs; sync NAP when GBP live",
      cluster: "Local",
    };
  }

  if (/battery|accessor/.test(kw)) {
    return {
      assignedUrl: "/shop/accessories",
      pageType: "Category",
      gap: "Partial",
      priority: "High",
      action: "Accessories hub live — deepen exact-match anchors + battery blog support",
      cluster: "Accessories",
    };
  }

  if (/rosin/.test(kw)) {
    return {
      assignedUrl: "/shop/vapes/rosin",
      pageType: "Line",
      gap: "N",
      priority: "High",
      action: "Rosin hub + what-is-dime-rosin live — keep ranking copy aligned",
      cluster: "Rosin",
    };
  }

  if (/live resin|live reserve/.test(kw)) {
    return {
      assignedUrl: "/shop/vapes/live-reserve",
      pageType: "Line",
      gap: "N",
      priority: "High",
      action: "Live Reserve hub + explainer shipped — keep ranking copy aligned",
      cluster: "Live Reserve",
    };
  }

  if (/dispo|disposable/.test(kw)) {
    return {
      assignedUrl: "/shop/vapes/disposables",
      pageType: "Category",
      gap: "N",
      priority: "High",
      action: "Disposables landing + dime-disposable-vapes blog live — deepen exact-match anchors",
      cluster: "Disposables",
    };
  }

  if (/flavor/.test(kw)) {
    return {
      assignedUrl: "/blog/best-dime-industries-flavors",
      pageType: "Blog",
      gap: "N",
      priority: "High",
      action: "Flavors guide live — keep Signature/hub cross-links",
      cluster: "Flavors GEO",
    };
  }

  if (/deal|special|promo/.test(kw)) {
    return {
      assignedUrl: "/promotions",
      pageType: "Marketing",
      gap: "Partial",
      priority: "Medium",
      action: "Enrich /promotions with answer capsule + current offers; avoid thin promo spam",
      cluster: "Promotions",
    };
  }

  if (/flower|pre-?roll|preroll/.test(kw)) {
    const isPreroll = /pre-?roll|preroll/.test(kw);
    return {
      assignedUrl: isPreroll ? "/shop/prerolls" : "/shop",
      pageType: "Category",
      gap: isPreroll ? "Partial" : "Y",
      priority: "Medium",
      action: isPreroll
        ? "Prerolls hub + buying guide live — deepen copy; don't invent flower SKUs"
        : "No invented flower catalog — soft /shop hub until SKUs exist",
      cluster: isPreroll ? "Prerolls" : "Flower",
    };
  }

  if (/career/.test(kw)) {
    return {
      assignedUrl: "/careers",
      pageType: "Marketing",
      gap: "N",
      priority: "Low",
      action: "Careers page live",
      cluster: "Brand",
    };
  }

  if (/review|what is dime|products/.test(kw) && /industr/.test(kw)) {
    return {
      assignedUrl: /product/.test(kw) ? "/shop" : "/about",
      pageType: "Marketing",
      gap: "Partial",
      priority: "Medium",
      action: "Brand/about surfaces — keep About + FAQ GEO links",
      cluster: "Brand",
    };
  }

  if (/pen|cart|cartridge|vape|weed|thc|wax|yart|2g|industrys|cannabis/.test(kw)) {
    return {
      assignedUrl: "/shop/vapes",
      pageType: "Category",
      gap: "Partial",
      priority: row.volume >= 500 ? "High" : "Medium",
      action: "Commercial hub exists — improve H1/meta/internal links; beginners pillar for dime cart",
      cluster: "Carts",
    };
  }

  return {
    assignedUrl: "/",
    pageType: "Homepage",
    gap: "Partial",
    priority: "Medium",
    action: "Brand navigational — ensure home teaser + sitelinks targets",
    cluster: "Brand",
  };
}

const classified = data.map((row) => {
  const c = classify(row);
  return { ...row, ...c };
});

const gapCsv = [
  "Keyword,Volume,KD,CPC,Position (.com equity),Traffic,Intent,Assigned .us URL,Page Type,Gap,Priority,Cluster,Action,AI Overview,SERP Features",
  ...classified
    .sort((a, b) => b.volume - a.volume || b.traffic - a.traffic)
    .map((r) =>
      [
        `"${r.keyword.replace(/"/g, '""')}"`,
        r.volume,
        r.kd,
        r.cpc,
        r.position,
        r.traffic,
        `"${r.intents}"`,
        r.assignedUrl,
        r.pageType,
        r.gap,
        r.priority,
        r.cluster,
        `"${r.action.replace(/"/g, '""')}"`,
        /AI overview/i.test(r.serp) ? "Y" : "N",
        `"${r.serp.replace(/"/g, '""')}"`,
      ].join(",")
    ),
].join("\n");

writeFileSync(join(seoDir, "keyword_gap.csv"), gapCsv + "\n");

const priorityGaps = classified.filter(
  (r) => r.gap === "Y" || (r.gap === "Partial" && r.priority === "High" && r.volume >= 200)
);
const priorityCsv = [
  "Keyword,Volume,KD,Gap,Priority,Assigned .us URL,Cluster,Action",
  ...priorityGaps
    .sort((a, b) => b.volume - a.volume)
    .map((r) =>
      [
        `"${r.keyword.replace(/"/g, '""')}"`,
        r.volume,
        r.kd,
        r.gap,
        r.priority,
        r.assignedUrl,
        r.cluster,
        `"${r.action.replace(/"/g, '""')}"`,
      ].join(",")
    ),
].join("\n");
writeFileSync(join(seoDir, "keyword_gap_priority.csv"), priorityCsv + "\n");

const migCsv = [
  "Keyword,Position,Volume,Traffic,Legacy URL,Target www URL,Gap,Cluster",
  ...classified
    .sort((a, b) => b.traffic - a.traffic)
    .slice(0, 50)
    .map((r) =>
      [
        `"${r.keyword.replace(/"/g, '""')}"`,
        r.position,
        r.volume,
        r.traffic,
        r.url,
        `https://www.dimeindustries.us${r.assignedUrl === "/" ? "" : r.assignedUrl}`,
        r.gap,
        r.cluster,
      ].join(",")
    ),
].join("\n");
writeFileSync(join(seoDir, "semrush_url_migration_map.csv"), migCsv + "\n");

const counts = {
  total: classified.length,
  gapY: classified.filter((r) => r.gap === "Y").length,
  gapPartial: classified.filter((r) => r.gap === "Partial").length,
  gapN: classified.filter((r) => r.gap === "N").length,
  priorityRows: priorityGaps.length,
};

const md = `# Keyword gap — Semrush → www.dimeindustries.us

**Source:** Semrush US Organic Positions export for \`dimeindustries.com\` (${baselineDate}), used as the **keyword universe / gap list for our storefront**.

The export shows what Google already associates with DIME. For \`.us\`, each row is classified as:

| Gap | Meaning |
|-----|---------|
| **N** | Dedicated \`.us\` URL exists (usually PDP or dedicated hub) — optimize on-page |
| **Partial** | Hub exists but not query-specific — deepen copy / FAQ / blog support |
| **Y** | Need new landing, blog, or missing PDP |

## Coverage summary

| Status | Keywords |
|--------|----------|
| Covered (N) | ${counts.gapN} |
| Partial | ${counts.gapPartial} |
| Open gap (Y) | ${counts.gapY} |
| Priority sprint rows | ${counts.priorityRows} |

## Highest-volume open / partial gaps (act on these)

Updated **${baselineDate}** after hub landings + curated anchors:

| Keyword | Status | Where |
|---------|--------|--------|
| dime cart / dime carts / dime pen | Partial | \`/shop/vapes\` — deepen exact-match anchors |
| dime disposable (+ variants) | **N** | \`/shop/vapes/disposables\` + disposable blogs |
| dime flavors / cart flavors | **N** | \`/blog/best-dime-industries-flavors\` |
| dime battery | Partial | \`/shop/accessories\` |
| dime thc las vegas | Partial | \`/locations/nevada\` |
| dime industries flower | Y / soft | \`/shop\` — **no invented flower SKUs** |
| dime industries pre-roll | Partial | \`/shop/prerolls\` + buying guide |
| dime industries rosin | **N** | Rosin hub + \`/blog/what-is-dime-rosin\` |

### Priority open / partial (auto from this export)

${priorityGaps
  .sort((a, b) => b.volume - a.volume)
  .slice(0, 20)
  .map(
    (r) =>
      `- **${r.keyword}** (${r.volume} vol, Gap ${r.gap}) → \`${r.assignedUrl}\` — ${r.action}`
  )
  .join("\n")}

### Still soft / owner-dependent

- Flower **loose** catalog — defer until real SKUs exist
- GBP street NAP for LocalBusiness
- \`.com\` → \`.us\` redirects for equity transfer

## How we use this in the project

1. [\`keyword_gap.csv\`](./keyword_gap.csv) — full gap map (canonical for planning)
2. [\`keyword_gap_priority.csv\`](./keyword_gap_priority.csv) — sprint subset
3. [\`keyword_map.csv\`](./keyword_map.csv) — Semrush volumes merged for primary commercial terms
4. [\`content_calendar_90d.csv\`](./content_calendar_90d.csv) — disposable / flavors / rosin / preroll items already aligned
5. [\`semrush_url_migration_map.csv\`](./semrush_url_migration_map.csv) — still useful for \`.com\`→\`www\` redirects at cutover
6. [\`organic_positions_anchor_map_2026-11.md\`](./organic_positions_anchor_map_2026-11.md) — curated exact-match anchors

## Project build implications

| Gap cluster | Code / content action |
|-------------|----------------------|
| Disposables | Landing live — keep exact-match anchors + blog support |
| Flavors | Flavors guide live — keep Signature/hub cross-links |
| Strain PDPs | Confirm every legacy slug has \`/product/{slug}\`; optimize titles for “* strain” |
| Rosin / Live Reserve | Hubs live — keep GEO blogs aligned |
| Deals / specials | Enrich \`/promotions\` |
| Flower | No inventing catalog — soft hub or defer until SKUs |
| Local (\`near me\`, Las Vegas) | \`/locations\` + state pages |
| Accessories / battery | \`/shop/accessories\` + battery blogs |

Regenerate: \`node scripts/seo-import-semrush-positions.mjs\`
`;

writeFileSync(join(seoDir, "keyword_gap_analysis.md"), md);

const summary = {
  generatedAt: new Date().toISOString(),
  purpose: "keyword_gap_for_www_storefront",
  sourceFile: "semrush_organic_positions_com_us_2026-11-12.csv",
  domainEquityReference: "dimeindustries.com",
  targetSite: "https://www.dimeindustries.us",
  counts,
  productSlugsDetected: productSlugs.size,
  topPriorityGaps: priorityGaps
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 25)
    .map((r) => ({
      keyword: r.keyword,
      volume: r.volume,
      kd: r.kd,
      gap: r.gap,
      assignedUrl: r.assignedUrl,
      cluster: r.cluster,
      action: r.action,
    })),
};

writeFileSync(
  join(seoDir, `semrush_baseline_${baselineDate}.json`),
  JSON.stringify(summary, null, 2) + "\n"
);

writeFileSync(
  join(seoDir, `semrush_baseline_${baselineDate}.md`),
  `# Semrush data — keyword gap for .us (${baselineDate})

See **[\`keyword_gap_analysis.md\`](./keyword_gap_analysis.md)** for the working gap map.

## Snapshot

- **Source:** \`semrush_organic_positions_com_us_2026-11-12.csv\` (Semrush US Positions for \`dimeindustries.com\`)
- **Rows:** **${counts.total}** keywords (export may include duplicate keyword×URL SERP rows)
- Est. traffic on export: **~${data.reduce((s, r) => s + r.traffic, 0).toLocaleString()}**
- Gap classification: **${counts.gapY}** open · **${counts.gapPartial}** partial · **${counts.gapN}** covered
- Priority sprint rows: **${counts.priorityRows}**
- Product slugs detected for PDP mapping: **${productSlugs.size}**

This export is **not** only a migration artifact — it is the prioritized keyword list to win on \`www.dimeindustries.us\`.

Prior baseline: [\`semrush_baseline_2026-08-02.md\`](./semrush_baseline_2026-08-02.md).
`
);

console.log(JSON.stringify({ ...counts, productSlugs: productSlugs.size }, null, 2));
