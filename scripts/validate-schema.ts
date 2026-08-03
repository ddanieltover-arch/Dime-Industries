// scripts/validate-schema.ts — Assert JSON-LD builders emit required types/fields
import { buildFaqPageJsonLd } from "../lib/cms/faq";
import {
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  buildHowToJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
  buildSoftwareApplicationJsonLd,
  buildWebSiteJsonLd,
} from "../lib/seo/json-ld";

const failures: string[] = [];

function check(name: string, ok: boolean, detail?: string) {
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}

const org = buildOrganizationJsonLd();
check("Organization @type", org["@type"] === "Organization");
check("Organization url", typeof org.url === "string" && String(org.url).includes("dimeindustries.us"));

const web = buildWebSiteJsonLd();
check("WebSite @type", web["@type"] === "WebSite");
check("WebSite SearchAction", JSON.stringify(web).includes("SearchAction"));

const product = buildProductJsonLd({
  name: "Test Cart",
  description: "Test",
  slug: "test-cart",
  sku: "TEST-1",
  imageUrl: "/brand/og.png",
  priceCents: 2500,
  inStock: true,
  aggregateRating: null,
  reviews: [],
});
check("Product @type", product["@type"] === "Product");
check("Product offers", JSON.stringify(product).includes("Offer"));

const post = buildBlogPostingJsonLd({
  title: "How many dimes in a roll?",
  excerpt: "A U.S. roll of dimes holds 50 coins worth $5.",
  slug: "how-many-dimes-in-a-roll",
  publishedAt: "2026-08-03T00:00:00.000Z",
  updatedAt: "2026-08-03T12:00:00.000Z",
});
check("BlogPosting @type", post["@type"] === "BlogPosting");
check("BlogPosting dateModified", post.dateModified === "2026-08-03T12:00:00.000Z");
check("BlogPosting datePublished", typeof post.datePublished === "string");

const howto = buildHowToJsonLd({
  name: "How to use a Dime cart",
  description: "Steps",
  url: "/blog/how-to-use-a-dime-cart",
  steps: [
    { name: "Charge", text: "Charge the battery." },
    { name: "Attach", text: "Attach the cart." },
  ],
});
check("HowTo @type", howto["@type"] === "HowTo");
check("HowTo steps", Array.isArray(howto.step) && (howto.step as unknown[]).length === 2);

const faq = buildFaqPageJsonLd(
  [
    { question: "Q1?", answer: "A1" },
    { question: "Q2?", answer: "A2" },
  ],
  "https://www.dimeindustries.us/faq"
);
check("FAQPage @type", faq["@type"] === "FAQPage");

const crumbs = buildBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Blog", path: "/blog" },
]);
check("BreadcrumbList @type", crumbs["@type"] === "BreadcrumbList");

const app = buildSoftwareApplicationJsonLd();
check("SoftwareApplication @type", app["@type"] === "SoftwareApplication");

if (failures.length) {
  console.error("Schema validation failed:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("Schema validation passed.");
