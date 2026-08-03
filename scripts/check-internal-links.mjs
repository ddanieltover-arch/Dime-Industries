// scripts/check-internal-links.mjs — Internal link hygiene (offline seed + optional live)
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const live = process.argv.includes("--live");
const base = (
  process.env.SEO_LINK_BASE_URL ||
  "https://www.dimeindustries.us"
).replace(/\/$/, "");

const site = readFileSync(join(root, "lib/seo/site.ts"), "utf8");
const store = readFileSync(join(root, "lib/cms/store.ts"), "utf8");

const staticBlock = site.slice(
  site.indexOf("export const SEO_STATIC_PATHS"),
  site.indexOf("export const SEO_BLOG_SLUGS")
);
const blogBlock = site.slice(
  site.indexOf("export const SEO_BLOG_SLUGS"),
  site.indexOf("export const SEO_DISALLOW_PATHS")
);

const staticPaths = [...staticBlock.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
const blogSlugs = [...blogBlock.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);

const known = new Set([
  ...staticPaths.map((p) => (p === "" ? "/" : p)),
  ...blogSlugs.map((s) => `/blog/${s}`),
  "/shop/vapes",
  "/shop/vapes/rosin",
  "/shop/vapes/live-reserve",
  "/shop/vapes/signature",
  "/shop/vapes/balanced",
  "/shop/vapes/state-exclusive",
  "/shop/edibles",
  "/shop/edibles/rosin",
  "/shop/prerolls",
  "/shop/accessories",
]);

const hrefRe = /\]\((\/[a-zA-Z0-9#?&=/_-]*)\)/g;
const found = new Set();
let m;
while ((m = hrefRe.exec(store))) {
  const raw = m[1].split("#")[0].split("?")[0];
  if (raw) found.add(raw);
}

const unknown = [...found].filter((href) => {
  if (known.has(href)) return false;
  if (href.startsWith("/product/")) return false;
  if (href.startsWith("/blog/")) return !blogSlugs.includes(href.slice(6));
  if (href.startsWith("/locations/")) return false;
  if (href.startsWith("/shop/")) return false;
  if (href.startsWith("/legal/")) return false;
  return !known.has(href);
});

if (unknown.length) {
  console.warn("Unknown internal hrefs in CMS seed (review):");
  for (const u of unknown.slice(0, 40)) console.warn(`  - ${u}`);
}

const failures = [];

if (live) {
  const sample = [
    "/",
    "/llms.txt",
    "/sitemap.xml",
    "/glossary",
    "/trust",
    "/facts",
    ...blogSlugs.slice(0, 8).map((s) => `/blog/${s}`),
  ];
  for (const path of sample) {
    try {
      const res = await fetch(`${base}${path}`, { redirect: "follow" });
      if (!res.ok) failures.push(`${path} → ${res.status}`);
      else console.log(`OK  ${res.status}  ${path}`);
    } catch (err) {
      failures.push(`${path} → ${err.message}`);
    }
  }
}

if (failures.length) {
  console.error("Broken link check failed:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `Internal link check passed (seed hrefs: ${found.size}, unknown flagged: ${unknown.length}${live ? ", live sample ok" : ""}).`
);
