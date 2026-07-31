/**
 * scripts/verify-domain-cutover.mjs
 *
 * Polls DNS + HTTPS health/ready for dimeindustries.us (or argv host).
 *
 * Usage:
 *   node scripts/verify-domain-cutover.mjs
 *   node scripts/verify-domain-cutover.mjs dimeindustries.us
 *   node scripts/verify-domain-cutover.mjs --once
 */

import dns from "node:dns/promises";
import { setTimeout as sleep } from "node:timers/promises";

const args = process.argv.slice(2);
const once = args.includes("--once");
const host = args.find((a) => !a.startsWith("--")) || "dimeindustries.us";
const healthUrl = `https://${host}/api/health`;
const readyUrl = `https://${host}/api/ready`;
const maxAttempts = once ? 1 : 36; // ~6 minutes at 10s
const delayMs = 10_000;

// Prefer public resolvers — some local stacks return ECONNREFUSED on system DNS.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function resolveHost() {
  const out = { a: [], cname: [], errors: [] };
  try {
    out.a = await dns.resolve4(host);
  } catch (e) {
    out.errors.push(`A: ${e.code || e.message}`);
  }
  try {
    out.cname = await dns.resolveCname(host);
  } catch (e) {
    if (e.code !== "ENODATA" && e.code !== "ENOTFOUND") {
      out.errors.push(`CNAME: ${e.code || e.message}`);
    }
  }
  return out;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { status: res.status, json, text: text.slice(0, 200) };
}

async function attempt(n) {
  const dnsResult = await resolveHost();
  const resolved = dnsResult.a.length > 0 || dnsResult.cname.length > 0;

  let health = null;
  let ready = null;
  let httpsError = null;

  if (resolved) {
    try {
      health = await fetchJson(healthUrl);
      ready = await fetchJson(readyUrl);
    } catch (e) {
      httpsError = String(e.message || e);
    }
  }

  const healthOk = health?.status === 200 && (health.json?.status === "ok" || health.text.includes("ok"));
  const readyOk =
    ready?.status === 200 &&
    (ready.json?.readyForPublicTraffic === true ||
      ready.json?.ready === true ||
      (ready.json && ready.json.readyForPublicTraffic !== false && !ready.json.blockers?.length));

  // /api/ready shape from getLaunchStatus
  let readySummary = null;
  if (ready?.json) {
    const blockers = Array.isArray(ready.json.checks)
      ? ready.json.checks.filter((c) => c.severity === "blocker" && !c.ok)
      : [];
    readySummary = {
      readyForPublicTraffic: ready.json.readyForPublicTraffic,
      softLaunch: ready.json.softLaunch,
      blockers: blockers.map((b) => b.id),
    };
    if (ready.json.readyForPublicTraffic === true) {
      /* readyOk already */
    } else if (ready.status === 200 && blockers.length === 0 && ready.json.readyForPublicTraffic !== false) {
      /* keep prior */
    }
  }

  return {
    n,
    host,
    dns: dnsResult,
    resolved,
    healthOk,
    readyOk: ready?.json?.readyForPublicTraffic === true,
    health,
    readySummary,
    httpsError,
  };
}

function print(result) {
  console.log(`\n[attempt ${result.n}] ${result.host}`);
  console.log(
    `  DNS: ${result.resolved ? "OK" : "PENDING"}`,
    result.dns.a.length ? `A=${result.dns.a.join(",")}` : "",
    result.dns.cname.length ? `CNAME=${result.dns.cname.join(",")}` : "",
    result.dns.errors.length ? `(${result.dns.errors.join("; ")})` : ""
  );
  if (result.httpsError) console.log(`  HTTPS: ERROR ${result.httpsError}`);
  else if (!result.resolved) console.log("  HTTPS: skipped (no DNS)");
  else {
    console.log(`  health: ${result.healthOk ? "OK" : "FAIL"}`, result.health?.status ?? "");
    console.log(
      `  ready:  ${result.readyOk ? "OK" : "NOT READY"}`,
      result.readySummary ? JSON.stringify(result.readySummary) : ""
    );
  }
}

async function main() {
  console.log(`Verifying cutover for https://${host}`);
  console.log(`Typical DNS: A @ → 76.76.21.21 ; CNAME www → cname.vercel-dns.com`);
  console.log(`See docs/44-owner-cutover.md`);

  for (let n = 1; n <= maxAttempts; n++) {
    const result = await attempt(n);
    print(result);

    if (result.healthOk && result.readyOk) {
      console.log("\nCutover verify PASSED — domain serves health + ready.");
      process.exit(0);
    }

    if (result.healthOk && !result.readyOk) {
      console.log("\nDomain serves traffic but /api/ready has blockers — fix secrets before launch announcement.");
      if (once) process.exit(2);
    }

    if (once) {
      console.log("\n--once: not fully ready.");
      process.exit(1);
    }

    if (n < maxAttempts) {
      console.log(`  waiting ${delayMs / 1000}s…`);
      await sleep(delayMs);
    }
  }

  console.log("\nCutover verify TIMED OUT — publish DNS at registrar + add domain in Vercel, then re-run.");
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
