// scripts/seo-preflight-crawl.mjs — Section 0 crawl helpers
import https from "node:https";
import fs from "node:fs";
import path from "node:path";

const LIVE_HOST = "https://www.dimeindustries.us";
const OUT = path.join("docs", "seo");
const TIMEOUT_MS = 15000;

function toLiveUrl(url) {
  return url
    .replace("https://dimeindustries.us", LIVE_HOST)
    .replace("http://dimeindustries.us", LIVE_HOST);
}

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: { "User-Agent": "DIME-SEO-Audit/1.0" },
        timeout: TIMEOUT_MS,
      },
      (res) => {
        const code = res.statusCode || 0;
        if ([301, 302, 307, 308].includes(code) && res.headers.location) {
          const next = new URL(res.headers.location, url).toString();
          res.resume();
          get(next).then(resolve).catch(reject);
          return;
        }
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () =>
          resolve({ status: code, headers: res.headers, body, finalUrl: url })
        );
      }
    );
    req.on("timeout", () => {
      req.destroy(new Error(`timeout after ${TIMEOUT_MS}ms`));
    });
    req.on("error", reject);
  });
}

function extract(html, re) {
  const m = html.match(re);
  return m ? (m[1] || m[2] || "").trim() : "";
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

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function csvEscape(v) {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

async function main() {
  const sm = await get(`${LIVE_HOST}/sitemap.xml`);
  const sitemapUrls = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  fs.writeFileSync(
    path.join(OUT, "_sitemap_urls.json"),
    JSON.stringify(sitemapUrls, null, 2)
  );

  const robots = await get(`${LIVE_HOST}/robots.txt`);
  const apex = await get("https://dimeindustries.us/").catch((e) => ({
    status: 0,
    headers: {},
    body: "",
    error: String(e.message || e),
  }));

  const products = sitemapUrls.filter((u) => u.includes("/product/"));
  const priority = [
    ...sitemapUrls.filter((u) => !u.includes("/product/")),
    ...products.slice(0, 20),
  ].map(toLiveUrl);

  const rows = [];
  for (const url of priority) {
    try {
      const r = await get(url);
      const html = r.body || "";
      const title = extract(html, /<title[^>]*>([^<]*)<\/title>/i).replace(
        /&amp;/g,
        "&"
      );
      const desc =
        extract(
          html,
          /name=["']description["'][^>]*content=["']([^"']*)["']/i
        ) ||
        extract(
          html,
          /content=["']([^"']*)["'][^>]*name=["']description["']/i
        );
      const canon =
        extract(html, /rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
        extract(html, /href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
      const h1 = stripTags(extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i));
      const robotsMeta = extract(
        html,
        /name=["']robots["'][^>]*content=["']([^"']*)["']/i
      );
      const wordCount = stripTags(html)
        .split(/\s+/)
        .filter(Boolean).length;
      const indexable =
        !/noindex/i.test(robotsMeta || "") && r.status === 200;
      const canonApex =
        Boolean(canon) &&
        /https?:\/\/dimeindustries\.us\b/i.test(canon) &&
        !/www\./i.test(canon);

      rows.push({
        url,
        final_url: r.finalUrl || url,
        http_status: r.status,
        title,
        meta_description: desc,
        h1,
        word_count: wordCount,
        canonical: canon,
        robots_meta: robotsMeta || "",
        indexable,
        page_type: classify(url),
        notes: [
          h1 === "Are you over 21?"
            ? "Age gate H1 in HTML for unverified crawlers/clients"
            : "",
          canonApex ? "Canonical points to apex host" : "",
        ]
          .filter(Boolean)
          .join("; "),
      });
      process.stdout.write(".");
    } catch (e) {
      rows.push({
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
      });
      process.stdout.write("x");
    }
  }
  process.stdout.write("\n");

  const header = [
    "url",
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
  const csv = [
    header.join(","),
    ...rows.map((r) => header.map((k) => csvEscape(r[k])).join(",")),
  ].join("\n");
  fs.writeFileSync(path.join(OUT, "crawl_inventory.csv"), csv);

  const ageGate = rows.filter((r) => r.h1 === "Are you over 21?");
  const thin = rows.filter(
    (r) => r.indexable && r.word_count > 0 && r.word_count < 300
  );
  const canonApexRows = rows.filter((r) =>
    /Canonical points to apex host/i.test(r.notes || "")
  );

  const audit = {
    generatedAt: new Date().toISOString(),
    crawlTarget: LIVE_HOST,
    canonicalConfiguredHost: "https://dimeindustries.us",
    method:
      "Sitemap discovery + sampled HTML fetch (www rewrite; 15s timeout; products capped at 20)",
    apexProbe: {
      status: apex.status,
      location: apex.headers?.location || null,
      error: apex.error || null,
    },
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
      allowsAiCrawlers: /GPTBot|ClaudeBot|PerplexityBot|Google-Extended/i.test(
        robots.body
      ),
      disallow: [...robots.body.matchAll(/Disallow:\s*(\S+)/gi)].map((m) => m[1]),
    },
    sampledPages: rows.length,
    flags: {
      status_4xx_count: rows.filter(
        (r) => r.http_status >= 400 && r.http_status < 500
      ).length,
      status_5xx_count: rows.filter((r) => r.http_status >= 500).length,
      error_count: rows.filter((r) => r.http_status === 0).length,
      age_gate_h1_count: ageGate.length,
      thin_content_count: thin.length,
      canonical_apex_count: canonApexRows.length,
    },
    criticalFindings: [
      {
        id: "age-gate-html",
        severity: "high",
        finding:
          "Commercial/catalog pages often expose H1 'Are you over 21?' and low word counts to clients without the age-gate cookie — Googlebot may see thin/gated HTML.",
        affectedSample: ageGate.slice(0, 10).map((r) => r.url),
      },
      {
        id: "www-vs-apex",
        severity: "high",
        finding:
          "Sitemap + canonicals use apex dimeindustries.us; live success observed on www. Confirm apex→www (or reverse) 301/308 is consistent and GSC property matches.",
      },
      {
        id: "dime-roll-fact-check",
        severity: "critical",
        finding:
          "Current SERP consensus for 'how many dimes in a roll' is 50 dimes / $5.00. The Phase 1 blog claims 40 / $4 — correct before promoting that URL.",
      },
      {
        id: "legacy-domain-cannibalization",
        severity: "high",
        finding:
          "dimeindustries.com still owns brand/product SERPs. Plan consolidation (redirects or clear host preference) to avoid cannibalizing dimeindustries.us.",
      },
    ],
    pages: rows,
  };

  fs.writeFileSync(path.join(OUT, "audit_report.json"), JSON.stringify(audit, null, 2));
  console.log(
    JSON.stringify(
      {
        sitemapUrls: sitemapUrls.length,
        sampled: rows.length,
        flags: audit.flags,
        robotsSitemap: audit.robots.sitemapLine,
        ageGateExamples: ageGate.slice(0, 3).map((r) => r.url),
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
