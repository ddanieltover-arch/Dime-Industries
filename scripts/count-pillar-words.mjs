import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

async function main() {
  // Parse calendar posts via dynamic import of generated JSON-ish TS
  const raw = readFileSync("lib/cms/calendar-posts-2026.ts", "utf8");
  const arrStart = raw.indexOf("export const CALENDAR_POSTS_2026");
  const eq = raw.indexOf("=", arrStart);
  const jsonish = raw.slice(eq + 1).trim().replace(/;?\s*$/, "");
  const posts = JSON.parse(jsonish);
  const pillar = posts.find((p) => p.slug === "beginners-guide-to-dime-carts");
  console.log("pillar words", pillar.body.trim().split(/\s+/).length);

  // Top posts live in store.ts as template literals — count via slug markers is hard;
  // list pillar only here.
  const tops = [
    "what-is-a-dime-cart",
    "dime-cart-vs-disposable",
    "dime-live-reserve-explained",
    "how-to-spot-fake-dime-carts",
    "how-many-dimes-in-a-roll",
  ];
  for (const slug of tops) {
    const p = posts.find((x) => x.slug === slug);
    if (p) console.log(slug, p.body.trim().split(/\s+/).length);
  }
}

main();
