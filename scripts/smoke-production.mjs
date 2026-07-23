// scripts/smoke-production.mjs
/**
 * Post-deploy smoke checks against a base URL (staging or production).
 * Usage: node scripts/smoke-production.mjs https://dimeindustries.us
 */

const base = (process.argv[2] || process.env.SMOKE_BASE_URL || "").replace(/\/$/, "");

if (!base) {
  console.error("Usage: node scripts/smoke-production.mjs <base-url>");
  process.exit(2);
}

const paths = [
  { path: "/api/health", expectStatus: [200], expectJsonStatus: true },
  { path: "/api/ready", expectStatus: [200, 503], expectReadyProbe: true },
  { path: "/", expectStatus: [200] },
  { path: "/robots.txt", expectStatus: [200], bodyIncludes: "sitemap" },
  { path: "/sitemap.xml", expectStatus: [200], bodyIncludes: "dimeindustries.us" },
  { path: "/shop", expectStatus: [200] },
  { path: "/about", expectStatus: [200] },
  { path: "/blog", expectStatus: [200] },
  { path: "/.well-known/security.txt", expectStatus: [200], bodyIncludes: "Contact:" },
  { path: "/admin", expectStatus: [200, 307, 302, 303] },
];

async function check(entry) {
  const url = `${base}${entry.path}`;
  const res = await fetch(url, { redirect: "manual" });
  const status = res.status;
  if (!entry.expectStatus.includes(status)) {
    throw new Error(`${url} → ${status} (expected ${entry.expectStatus.join("|")})`);
  }
  const text = await res.text();
  if (entry.bodyIncludes && !text.toLowerCase().includes(entry.bodyIncludes.toLowerCase())) {
    throw new Error(`${url} missing expected body fragment: ${entry.bodyIncludes}`);
  }
  if (entry.expectJsonStatus) {
    const json = JSON.parse(text);
    if (json.status !== "ok" && json.status !== "error") {
      throw new Error(`${url} unexpected health payload`);
    }
    if (status !== 200) throw new Error(`${url} health not 200`);
  }
  if (entry.expectReadyProbe) {
    const json = JSON.parse(text);
    if (json.status !== "ready" && json.status !== "not_ready") {
      throw new Error(`${url} unexpected ready payload`);
    }
    if (!Array.isArray(json.checks)) {
      throw new Error(`${url} missing checks array`);
    }
  }
  console.log(`OK  ${status}  ${entry.path}`);
}

const failures = [];
for (const entry of paths) {
  try {
    await check(entry);
  } catch (err) {
    console.error(`FAIL ${entry.path}: ${err instanceof Error ? err.message : err}`);
    failures.push(entry.path);
  }
}

if (failures.length) {
  console.error(`\nSmoke failed (${failures.length}): ${failures.join(", ")}`);
  process.exit(1);
}

console.log(`\nSmoke passed against ${base}`);
