import { readFileSync, writeFileSync, copyFileSync } from "node:fs";

const path = "docs/seo/content_calendar_90d.csv";
const lines = readFileSync(path, "utf8").split(/\r?\n/);
const out = lines.map((line) => {
  if (line.includes("Quarterly content refresh") && line.includes("Planned")) {
    return line.replace(",Planned,", ",Published,").replace(
      "Update dates + stats; Section 3 freshness",
      "Executed 2026-08-04 — see quarterly_refresh_2026-q3.md"
    );
  }
  if (line.includes("90-day retrospective") && line.includes("Planned")) {
    return line.replace(",Planned,", ",Published,").replace(
      "Internal only",
      "See docs/seo/q1_backlog_after_90d.md"
    );
  }
  if (line.includes("beginners-guide-to-dime-carts")) {
    return line.replace(
      "Definitive guide; link all cart clusters",
      "Long-form ~3–4k pillar in lib/cms/posts/beginners-guide-to-dime-carts.ts"
    );
  }
  return line;
});
writeFileSync(path, out.join("\n"));
copyFileSync(path, "docs/seo/content_calendar.csv");
console.log("calendar ops rows published");
