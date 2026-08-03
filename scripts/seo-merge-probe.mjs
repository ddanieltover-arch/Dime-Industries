// scripts/seo-merge-probe.mjs — merge earlier successful PowerShell probe into audit artifacts
import fs from "node:fs";
import path from "node:path";

const OUT = path.join("docs", "seo");
const probePath = path.join(OUT, "_probe_raw.json");
if (!fs.existsSync(probePath)) {
  console.log("no probe raw");
  process.exit(0);
}

const probe = JSON.parse(
  fs.readFileSync(probePath, "utf8").replace(/^\uFEFF/, "")
);
const audit = JSON.parse(
  fs.readFileSync(path.join(OUT, "audit_report.json"), "utf8").replace(/^\uFEFF/, "")
);
const byUrl = new Map(audit.detailedPages.map((p) => [p.url, p]));

for (const p of probe) {
  if (!p.status || p.status !== 200) continue;
  if (!p.url.startsWith("http")) continue;
  if (p.url.endsWith(".txt") || p.url.endsWith(".xml")) continue;
  const existing = byUrl.get(p.url);
  if (existing && existing.http_status === 200) continue;
  byUrl.set(p.url, {
    url: p.url,
    final_url: p.final || p.url,
    http_status: p.status,
    title: String(p.title || "").replace(/&amp;/g, "&"),
    meta_description: p.desc || "",
    h1: p.h1 || "",
    word_count: p.words || 0,
    canonical: p.canon || "",
    robots_meta: p.robots || "",
    indexable: p.status === 200 && !/noindex/i.test(p.robots || ""),
    page_type: "marketing",
    notes: [
      p.h1 === "Are you over 21?" ? "Age gate H1 visible without age cookie" : "",
      p.canon && !String(p.canon).includes("www.")
        ? "Canonical uses apex host"
        : "",
      "Merged from earlier live probe",
    ]
      .filter(Boolean)
      .join("; "),
  });
}

audit.detailedPages = [...byUrl.values()];
audit.flags.age_gate_h1_count = audit.detailedPages.filter(
  (r) => r.h1 === "Are you over 21?"
).length;
audit.flags.thin_content_on_probed_indexable = audit.detailedPages.filter(
  (r) => r.indexable && r.word_count > 0 && r.word_count < 300
).length;
audit.mergedProbeNote =
  "Partial deep-crawl timeouts were backfilled from an earlier successful PowerShell probe of key URLs.";

fs.writeFileSync(path.join(OUT, "audit_report.json"), JSON.stringify(audit, null, 2));
console.log(
  JSON.stringify(
    {
      detailed: audit.detailedPages.length,
      ageGate: audit.flags.age_gate_h1_count,
      thin: audit.flags.thin_content_on_probed_indexable,
    },
    null,
    2
  )
);
