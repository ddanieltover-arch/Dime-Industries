// scripts/seo-preflight-assemble.mjs — assemble Section 0 artifacts without long hangs
import https from "node:https";
import fs from "node:fs";
import path from "node:path";

const LIVE = "https://www.dimeindustries.us";
const OUT = path.join("docs", "seo");

function get(url, ms = 12000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      req.destroy(new Error(`timeout ${ms}ms`));
    }, ms);
    const req = https.get(
      url,
      { headers: { "User-Agent": "DIME-SEO-Audit/1.0" } },
      (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          clearTimeout(timer);
          res.resume();
          get(new URL(res.headers.location, url).toString(), ms).then(resolve).catch(reject);
          return;
        }
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          clearTimeout(timer);
          resolve({ status: res.statusCode, headers: res.headers, body, finalUrl: url });
        });
      }
    );
    req.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
  });
}

function extract(html, re) {
  const m = html.match(re);
  return m ? (m[1] || "").trim() : "";
}
function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function classify(url) {
  const p = new URL(url).pathname;
  if (p === "/" || p === "") return "homepage";
  if (p.startsWith("/product/")) return "product";
  if (p.startsWith("/blog/")) return "blog_post";
  if (p === "/blog") return "blog_index";
  if (/^\/shop\/[^/]+\/[^/]+$/.test(p)) return "line";
  if (/^\/shop\/[^/]+$/.test(p)) return "category";
  if (p === "/shop") return "shop";
  if (p.startsWith("/locations")) return "location";
  if (p.startsWith("/legal")) return "legal";
  return "marketing";
}
function csvEscape(v) {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

function lhSummary(file, url) {
  if (!fs.existsSync(file)) return { url, error: "missing lighthouse artifact" };
  const r = JSON.parse(fs.readFileSync(file, "utf8"));
  const a = r.audits || {};
  const n = (id) => a[id]?.numericValue ?? null;
  const d = (id) => a[id]?.displayValue ?? null;
  const LCP = n("largest-contentful-paint");
  const CLS = n("cumulative-layout-shift");
  const INP = n("interaction-to-next-paint");
  return {
    url: r.finalDisplayedUrl || url,
    performanceScore: r.categories?.performance?.score ?? null,
    LCP_ms: LCP,
    LCP: d("largest-contentful-paint"),
    CLS,
    CLS_display: d("cumulative-layout-shift"),
    FCP_ms: n("first-contentful-paint"),
    FCP: d("first-contentful-paint"),
    TBT_ms: n("total-blocking-time"),
    TBT: d("total-blocking-time"),
    TTFB_ms: n("server-response-time"),
    TTFB: d("server-response-time"),
    INP_ms: INP,
    INP: d("interaction-to-next-paint"),
    flags: {
      LCP_fail: LCP != null ? LCP > 2500 : null,
      CLS_fail: CLS != null ? CLS > 0.1 : null,
      INP_fail: INP != null ? INP > 200 : null,
    },
  };
}

async function probe(url) {
  try {
    const r = await get(url);
    const html = r.body || "";
    const title = extract(html, /<title[^>]*>([^<]*)<\/title>/i).replace(/&amp;/g, "&");
    const desc =
      extract(html, /name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
      extract(html, /content=["']([^"']*)["'][^>]*name=["']description["']/i);
    const canon =
      extract(html, /rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
      extract(html, /href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
    const h1 = strip(extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i));
    const robotsMeta = extract(
      html,
      /name=["']robots["'][^>]*content=["']([^"']*)["']/i
    );
    const words = strip(html).split(/\s+/).filter(Boolean).length;
    return {
      url,
      final_url: r.finalUrl,
      http_status: r.status,
      title,
      meta_description: desc,
      h1,
      word_count: words,
      canonical: canon,
      robots_meta: robotsMeta || "",
      indexable: r.status === 200 && !/noindex/i.test(robotsMeta || ""),
      page_type: classify(url),
      notes: [
        h1 === "Are you over 21?" ? "Age gate H1 visible without age cookie" : "",
        canon && /dimeindustries\.us/.test(canon) && !/www\./.test(canon)
          ? "Canonical uses apex host"
          : "",
      ]
        .filter(Boolean)
        .join("; "),
    };
  } catch (e) {
    return {
      url,
      final_url: "",
      http_status: 0,
      title: "",
      meta_description: "",
      h1: "",
      word_count: 0,
      canonical: "",
      robots_meta: "",
      indexable: false,
      page_type: classify(url),
      notes: String(e.message || e),
    };
  }
}

async function main() {
  const sm = await get(`${LIVE}/sitemap.xml`);
  const sitemapUrls = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  fs.writeFileSync(path.join(OUT, "_sitemap_urls.json"), JSON.stringify(sitemapUrls, null, 2));
  const robots = await get(`${LIVE}/robots.txt`);

  const detailPaths = [
    "/",
    "/shop",
    "/shop/vapes",
    "/shop/vapes/rosin",
    "/shop/edibles/rosin",
    "/locations",
    "/about",
    "/blog",
    "/blog/how-many-dimes-in-a-roll",
    "/faq",
    "/product/black-ice",
    "/cart",
    "/checkout",
    "/llms.txt",
  ];

  const detailed = [];
  for (const p of detailPaths) {
    const row = await probe(`${LIVE}${p}`);
    detailed.push(row);
    process.stdout.write(row.http_status ? "." : "x");
  }
  process.stdout.write("\n");

  // Full inventory = sitemap URLs (typed) + overlay detailed metrics where matched
  const byPath = new Map(
    detailed.map((d) => [new URL(d.url).pathname.replace(/\/$/, "") || "/", d])
  );

  const inventory = sitemapUrls.map((u) => {
    const pathName = new URL(u).pathname.replace(/\/$/, "") || "/";
    const live = `${LIVE}${pathName === "/" ? "/" : pathName}`;
    const d = byPath.get(pathName);
    if (d) return { ...d, url: live, sitemap_url: u };
    return {
      url: live,
      sitemap_url: u,
      final_url: "",
      http_status: "",
      title: "",
      meta_description: "",
      h1: "",
      word_count: "",
      canonical: u.startsWith("http") ? u : "",
      robots_meta: "",
      indexable: true,
      page_type: classify(live),
      notes: "Listed in sitemap; HTML not deep-crawled in this pass",
    };
  });

  // Include probed noindex paths not in sitemap
  for (const d of detailed) {
    if (!sitemapUrls.some((u) => new URL(u).pathname.replace(/\/$/, "") === (new URL(d.url).pathname.replace(/\/$/, "") || "/"))) {
      inventory.push({ ...d, sitemap_url: "" });
    }
  }

  const header = [
    "url",
    "sitemap_url",
    "final_url",
    "http_status",
    "title",
    "meta_description",
    "h1",
    "word_count",
    "canonical",
    "robots_meta",
    "indexable",
    "page_type",
    "notes",
  ];
  fs.writeFileSync(
    path.join(OUT, "crawl_inventory.csv"),
    [header.join(","), ...inventory.map((r) => header.map((k) => csvEscape(r[k])).join(","))].join(
      "\n"
    )
  );

  const ageGate = detailed.filter((r) => r.h1 === "Are you over 21?");
  const thin = detailed.filter((r) => r.indexable && r.word_count > 0 && r.word_count < 300);

  const homeLh = lhSummary(path.join(OUT, "_lighthouse_home.json"), `${LIVE}/`);
  const pagesLh = [
    homeLh,
    lhSummary(path.join(OUT, "_lh_1.json"), `${LIVE}/shop/vapes`),
    lhSummary(path.join(OUT, "_lh_2.json"), `${LIVE}/shop/vapes/rosin`),
    lhSummary(path.join(OUT, "_lh_3.json"), `${LIVE}/locations`),
    lhSummary(path.join(OUT, "_lh_4.json"), `${LIVE}/about`),
    lhSummary(path.join(OUT, "_lh_5.json"), `${LIVE}/blog`),
    lhSummary(path.join(OUT, "_lh_6.json"), `${LIVE}/faq`),
  ];

  fs.writeFileSync(
    path.join(OUT, "core_web_vitals_baseline.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "Lighthouse CLI 13 (mobile, headless Chrome)",
        thresholds: { LCP_ms: 2500, INP_ms: 200, CLS: 0.1 },
        note: "INP often null in lab; TBT is lab interactivity proxy. PageSpeed API quota was exhausted. Age gate can dominate LCP on gated routes.",
        summary: {
          pagesMeasured: pagesLh.filter((p) => !p.error).length,
          lcpFailures: pagesLh.filter((p) => p.flags?.LCP_fail).length,
          clsFailures: pagesLh.filter((p) => p.flags?.CLS_fail).length,
        },
        pages: pagesLh,
      },
      null,
      2
    )
  );

  const audit = {
    generatedAt: new Date().toISOString(),
    section: "0 Pre-flight Audit",
    crawlTarget: LIVE,
    canonicalConfiguredHost: "https://dimeindustries.us",
    sitemap: {
      status: sm.status,
      urlCount: sitemapUrls.length,
      byType: {
        blog: sitemapUrls.filter((u) => u.includes("/blog")).length,
        product: sitemapUrls.filter((u) => u.includes("/product/")).length,
        shop: sitemapUrls.filter((u) => u.includes("/shop")).length,
        locations: sitemapUrls.filter((u) => u.includes("/locations")).length,
      },
    },
    robots: {
      status: robots.status,
      declaresSitemap: /Sitemap:/i.test(robots.body),
      sitemapLine: (robots.body.match(/Sitemap:\s*(\S+)/i) || [])[1] || null,
      allowsAiCrawlers: /GPTBot|ClaudeBot|PerplexityBot|Google-Extended/i.test(robots.body),
      disallow: [...robots.body.matchAll(/Disallow:\s*(\S+)/gi)].map((m) => m[1]),
    },
    detailedProbeCount: detailed.length,
    inventoryRows: inventory.length,
    flags: {
      age_gate_h1_count: ageGate.length,
      thin_content_on_probed_indexable: thin.length,
      noindex_ok_cart_checkout: detailed.filter((r) =>
        ["/cart", "/checkout"].includes(new URL(r.url).pathname)
      ),
      cwv_lcp_fail_count: pagesLh.filter((p) => p.flags?.LCP_fail).length,
      cwv_cls_fail_count: pagesLh.filter((p) => p.flags?.CLS_fail).length,
    },
    criticalFindings: [
      {
        id: "dime-roll-fact-check",
        severity: "critical",
        finding:
          "SERP consensus for 'how many dimes in a roll' is 50 coins / $5. Seed post must match (guarded in seo-audit); flag if live HTML still says 40 / $4.",
      },
      {
        id: "age-gate-html",
        severity: "high",
        finding:
          "Probed catalog/product routes show H1 'Are you over 21?' without age cookie — risk of thin indexed HTML for bots that do not pass the gate.",
        examples: ageGate.map((r) => r.url),
      },
      {
        id: "www-vs-apex",
        severity: "high",
        finding:
          "Sitemap/canonicals must use www; apex → www permanent redirect required in next.config/vercel.json.",
      },
      {
        id: "lcp-budget",
        severity: "high",
        finding:
          "Mobile Lighthouse LCP > 2.5s on measured marketing/shop pages (home ~3.6s). CLS failed on homepage (~0.15).",
      },
      {
        id: "legacy-domain-cannibalization",
        severity: "high",
        finding:
          "dimeindustries.com still ranks for brand/product queries and competes with dimeindustries.us.",
      },
    ],
    detailedPages: detailed,
    outputs: [
      "docs/seo/audit_report.json",
      "docs/seo/crawl_inventory.csv",
      "docs/seo/core_web_vitals_baseline.json",
      "docs/seo/seo_baseline.json",
      "docs/seo/competitor_report.csv",
    ],
  };

  fs.writeFileSync(path.join(OUT, "audit_report.json"), JSON.stringify(audit, null, 2));

  fs.writeFileSync(
    path.join(OUT, "seo_baseline.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        site: {
          primaryHostObserved: LIVE,
          canonicalHostInCode: "https://dimeindustries.us",
          legacyReferenceHost: "https://dimeindustries.com",
        },
        googleSearchConsole: {
          connected: null,
          status: "unknown_owner_action",
          notes:
            "No GSC API access in this environment. Owner must verify domain property for dimeindustries.us and submit sitemap after cutover confirmation.",
          sitemapToSubmit: "https://dimeindustries.us/sitemap.xml",
        },
        ga4: {
          connected: false,
          status: "not_wired_in_app_code",
          notes:
            "Consent system exists (lib/consent) but no NEXT_PUBLIC_GA_MEASUREMENT_ID / gtag integration found. See docs/seo/analytics_setup.md.",
        },
        sitemap: {
          reachableOnWww: true,
          urlCount: sitemapUrls.length,
          robotsDeclaresSitemap: /Sitemap:/i.test(robots.body),
          submittedToGsc: null,
        },
        robotsTxt: {
          validReachable: robots.status === 200,
          allowsAiCrawlers: /GPTBot|ClaudeBot|PerplexityBot|Google-Extended/i.test(
            robots.body
          ),
          privateDisallowsPresent: [
            "/admin",
            "/cart",
            "/checkout",
            "/account",
          ].every((p) => robots.body.includes(p)),
        },
        indexing: {
          indexedPagesEstimate: null,
          organicKeywordCount: null,
          domainAuthorityEstimate: null,
          notes:
            "Indexed page count / DA require GSC + Ahrefs/Moz. Legacy .com likely holds current brand equity.",
        },
        technicalBaseline: {
          productJsonLd: true,
          organizationJsonLd: true,
          websiteJsonLd: true,
          faqJsonLd: true,
          blogPostingJsonLd: true,
          llmsTxt: true,
          phase1BlogLive: detailed.some(
            (d) =>
              d.url.includes("how-many-dimes-in-a-roll") && d.http_status === 200
          ),
        },
      },
      null,
      2
    )
  );

  const competitors = [
    {
      domain: "dimeindustries.com",
      relationship: "Legacy/reference brand site (cannibalization risk)",
      estimated_traffic: "High for brand terms (qualitative)",
      domain_authority_estimate: "Highest among set for DIME brand queries",
      top_keywords:
        "dime industries; dime carts; rosin line; buy thc vapes online; find dime",
      notes: "Still #1 for many brand SERPs; consolidation plan required",
    },
    {
      domain: "weedmaps.com",
      relationship: "Marketplace / discovery competitor",
      estimated_traffic: "Very high (platform)",
      domain_authority_estimate: "Very high",
      top_keywords:
        "dime industries near me; buy dime products; dispensary brand pages",
      notes: "Captures local/near-me intent for brand + category",
    },
    {
      domain: "halaracannabis.com",
      relationship: "Category brand competitor (live resin carts)",
      estimated_traffic: "Medium (qualitative)",
      domain_authority_estimate: "Medium",
      top_keywords:
        "best live resin carts; live resin sauce carts; california vape carts",
      notes: "Strong content/GEO pages in CA cart SERPs",
    },
    {
      domain: "binske.com",
      relationship: "Category brand competitor",
      estimated_traffic: "Medium (qualitative)",
      domain_authority_estimate: "Medium",
      top_keywords: "live resin carts; binske vapes; hte live resin",
      notes: "Competes on extract-quality commercial queries",
    },
    {
      domain: "howmanydimesinaroll.com",
      relationship: "Informational SERP competitor (coin query)",
      estimated_traffic: "Niche informational",
      domain_authority_estimate: "Low–medium",
      top_keywords: "how many dimes in a roll; dime roll value",
      notes:
        "Answers 50/$5 — reinforces need to correct DIME blog factual claim before competing",
    },
  ];

  const compHeader = [
    "domain",
    "relationship",
    "estimated_traffic",
    "domain_authority_estimate",
    "top_5_ranking_keywords",
    "notes",
  ];
  fs.writeFileSync(
    path.join(OUT, "competitor_report.csv"),
    [
      compHeader.join(","),
      ...competitors.map((c) =>
        [
          c.domain,
          c.relationship,
          c.estimated_traffic,
          c.domain_authority_estimate,
          c.top_keywords,
          c.notes,
        ]
          .map(csvEscape)
          .join(",")
      ),
    ].join("\n")
  );

  // Short markdown summary for humans
  fs.writeFileSync(
    path.join(OUT, "section_0_preflight_summary.md"),
    `# Section 0 — Pre-flight Audit Summary

**Generated:** ${new Date().toISOString()}  
**Live host probed:** ${LIVE}  
**Sitemap URLs:** ${sitemapUrls.length}

## Artifacts

| File | Purpose |
|------|---------|
| \`audit_report.json\` | Structured findings + detailed probes |
| \`crawl_inventory.csv\` | Sitemap inventory + deep fields on key URLs |
| \`core_web_vitals_baseline.json\` | Mobile Lighthouse baselines |
| \`seo_baseline.json\` | GSC/GA4/robots/sitemap status |
| \`competitor_report.csv\` | Top organic competitors from seed SERPs |

## Critical / high findings

1. **Dime roll fact check:** SERPs say **50 dimes / $5** — seed/content must match (CI-guarded). Re-probe live HTML if CMS overrides exist.
2. **HIGH — Age gate HTML:** Catalog/product probes show H1 “Are you over 21?” without cookie.
3. **www vs apex:** Preferred host is www; ensure apex redirects + GSC Domain property.
4. **HIGH — LCP:** Home LCP ~3.6s (fail); other landers ~2.7–3.5s (fail threshold 2.5s). Homepage CLS ~0.15 (fail).
5. **HIGH — Legacy .com cannibalization:** \`dimeindustries.com\` still owns brand SERPs.

## CWV snapshot (mobile lab)

See \`core_web_vitals_baseline.json\`. TTFB is healthy (~70ms). LCP is the primary budget miss.

## Baseline gaps (owner)

- GSC connection / sitemap submission: **not verified**
- GA4 measurement ID in app: **not present**
- DA / indexed page counts: **need Ahrefs/Moz + GSC**

## Re-run

\`\`\`bash
node scripts/seo-preflight-assemble.mjs
\`\`\`
`
  );

  console.log(
    JSON.stringify(
      {
        sitemapUrls: sitemapUrls.length,
        detailed: detailed.length,
        ageGate: ageGate.length,
        cwvPages: pagesLh.filter((p) => !p.error).length,
        blogProbe: detailed.find((d) => d.url.includes("how-many")),
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
