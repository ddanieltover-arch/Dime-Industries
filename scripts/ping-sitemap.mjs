// scripts/ping-sitemap.mjs — Notify search engines after deploy (11.2)
/**
 * Usage:
 *   node scripts/ping-sitemap.mjs
 *   node scripts/ping-sitemap.mjs https://www.dimeindustries.us/sitemap.xml
 *
 * Note: Google deprecated the HTTP sitemap ping endpoint (2023). We still
 * attempt it for compatibility, always ping Bing, and verify the sitemap
 * is reachable. Prefer GSC Domain property auto-crawl + Indexing API for Google.
 */

const sitemapUrl =
  process.argv[2] ||
  process.env.SITEMAP_URL ||
  "https://www.dimeindustries.us/sitemap.xml";

async function ping(label, url) {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    console.log(`${label}: ${res.status} ${url}`);
    return res.ok || res.status === 200;
  } catch (err) {
    console.warn(`${label}: failed — ${err.message}`);
    return false;
  }
}

const head = await fetch(sitemapUrl, { redirect: "follow" });
if (!head.ok) {
  console.error(`Sitemap not reachable: ${sitemapUrl} → ${head.status}`);
  process.exit(1);
}
const body = await head.text();
if (!body.includes("<urlset") && !body.includes("<sitemapindex")) {
  console.error("Sitemap body does not look like XML sitemap");
  process.exit(1);
}
console.log(`Sitemap OK (${body.length} bytes): ${sitemapUrl}`);

const encoded = encodeURIComponent(sitemapUrl);
await ping("Bing ping", `https://www.bing.com/ping?sitemap=${encoded}`);
await ping(
  "Google ping (deprecated)",
  `https://www.google.com/ping?sitemap=${encoded}`
);

console.log(
  "Done. Confirm indexing in GSC (Domain property) — do not rely on Google ping alone."
);
