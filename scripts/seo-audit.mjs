// scripts/seo-audit.mjs — Offline SEO gate for CI (meta surfaces, robots, sitemap seeds, llms.txt)
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const warnings = [];

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function mustExist(rel) {
  if (!existsSync(join(root, rel))) failures.push(`Missing file: ${rel}`);
}

mustExist("public/llms.txt");
mustExist("app/robots.ts");
mustExist("app/sitemap.ts");
mustExist("lib/seo/site.ts");
mustExist("lib/seo/json-ld.ts");
mustExist(".lighthouserc.json");

const llms = read("public/llms.txt");
if (!llms.includes("www.dimeindustries.us") && !llms.includes("/shop/vapes")) {
  warnings.push("llms.txt should list key storefront paths");
}
if (!/^#\s*DIME/i.test(llms.trim()) && !llms.includes("DIME Industries")) {
  failures.push("llms.txt missing brand identity header");
}

const site = read("lib/seo/site.ts");
if (!site.includes('SITE_URL = "https://www.dimeindustries.us"')) {
  failures.push("SITE_URL must be https://www.dimeindustries.us");
}
if (!site.includes("SEO_BLOG_SLUGS") || !site.includes("how-many-dimes-in-a-roll")) {
  failures.push("SEO_BLOG_SLUGS must include how-many-dimes-in-a-roll");
}
if (!site.includes("SEO_DISALLOW_PATHS") || !site.includes('"/checkout"')) {
  failures.push("SEO_DISALLOW_PATHS must block checkout");
}

const robotsApp = read("app/robots.ts");
if (!/sitemap/i.test(robotsApp)) {
  failures.push("robots must declare sitemap");
}

const store = read("lib/cms/store.ts");

const blogBlock = site.slice(
  site.indexOf("export const SEO_BLOG_SLUGS"),
  site.indexOf("export const SEO_DISALLOW_PATHS")
);
const blogSlugs = [...blogBlock.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
for (const slug of blogSlugs) {
  if (!store.includes(`slug: "${slug}"`) && !store.includes(`slug: '${slug}'`)) {
    // Some posts may only live in DB — warn for seed consistency
    warnings.push(`SEO_BLOG_SLUGS entry not found in DEFAULT_POSTS seed: ${slug}`);
  }
}

const requiredPages = [
  "app/layout.tsx",
  "app/glossary/page.tsx",
  "app/trust/page.tsx",
  "app/facts/page.tsx",
];
for (const p of requiredPages) mustExist(p);

const layout = read("app/layout.tsx");
if (!layout.includes("metadataBase") || !layout.includes("www.dimeindustries.us")) {
  failures.push("Root layout metadataBase must use https://www.dimeindustries.us");
}
if (!layout.includes("buildOrganizationJsonLd") || !layout.includes("buildWebSiteJsonLd")) {
  failures.push("Root layout must emit Organization + WebSite JSON-LD");
}
if (!layout.includes('href="/fonts/gotham-black.ttf"')) {
  failures.push("Root layout must preload Gotham Black for LCP typography");
}
if (!layout.includes("hero-poster.webp")) {
  failures.push("Root layout must preload hero-poster.webp");
}

const dimeRollIdx = store.indexOf('slug: "how-many-dimes-in-a-roll"');
if (dimeRollIdx < 0) {
  failures.push('DEFAULT_POSTS missing how-many-dimes-in-a-roll');
} else {
  const dimeRollSlice = store.slice(dimeRollIdx, dimeRollIdx + 4500);
  if (!/50 dimes/.test(dimeRollSlice) || !/\$5/.test(dimeRollSlice)) {
    failures.push("how-many-dimes-in-a-roll must state 50 dimes / $5");
  }
  if (/40 dimes/.test(dimeRollSlice) || /\$4 face/.test(dimeRollSlice)) {
    failures.push("how-many-dimes-in-a-roll must not claim 40 dimes / $4");
  }
}

const nextConfig = read("next.config.js");
const vercelJson = read("vercel.json");
const hasApexRedirect =
  (nextConfig.includes('value: "dimeindustries.us"') &&
    nextConfig.includes("www.dimeindustries.us")) ||
  (vercelJson.includes('"dimeindustries.us"') && vercelJson.includes("www.dimeindustries.us"));
if (!hasApexRedirect) {
  failures.push("Apex → www host redirect required in next.config.js or vercel.json");
}

const hero = read("components/home/hero-video.tsx");
if (!hero.includes("pointerdown") || !hero.includes("setLoadVideo")) {
  failures.push("Hero must load video only after first user input (LCP-safe)");
}
if (!hero.includes("fetchPriority=\"high\"") && !hero.includes("fetchPriority='high'")) {
  failures.push("Hero poster must use fetchPriority=high");
}

try {
  const heroBytes = readFileSync(join(root, "public/brand/hero.mp4"));
  const maxBytes = 2 * 1024 * 1024;
  if (heroBytes.length > maxBytes) {
    failures.push(
      `public/brand/hero.mp4 must be ≤2MB (got ${(heroBytes.length / (1024 * 1024)).toFixed(2)}MB)`
    );
  }
} catch {
  failures.push("Missing public/brand/hero.mp4");
}

// Optional live probe
const base = (process.env.SEO_AUDIT_BASE_URL || "").replace(/\/$/, "");
if (base) {
  const paths = ["/", "/robots.txt", "/sitemap.xml", "/llms.txt", "/blog/how-many-dimes-in-a-roll"];
  for (const path of paths) {
    try {
      const res = await fetch(`${base}${path}`, { redirect: "follow" });
      if (!res.ok) failures.push(`Live ${path} → ${res.status}`);
      else console.log(`OK live ${res.status} ${path}`);
    } catch (err) {
      failures.push(`Live fetch failed ${path}: ${err.message}`);
    }
  }
}

for (const w of warnings) console.warn(`WARN  ${w}`);
if (failures.length) {
  console.error("SEO audit failed:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`SEO audit passed (${warnings.length} warning(s)).`);
