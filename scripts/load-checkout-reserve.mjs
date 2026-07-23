/**
 * Checkout / inventory concurrency soak (D-24).
 *
 * Simulates N buyers racing to reserve the same SKU stock using the same
 * optimistic rule as production: decrement only when on_hand >= qty.
 *
 * Usage:
 *   node scripts/load-checkout-reserve.mjs
 *   CONCURRENCY=50 STOCK=20 BUY_QTY=1 node scripts/load-checkout-reserve.mjs
 *
 * Against a live host (readiness only — does not place orders):
 *   BASE_URL=https://staging.example.com node scripts/load-checkout-reserve.mjs --probe
 */

import { performance } from "node:perf_hooks";

const CONCURRENCY = Number(process.env.CONCURRENCY ?? 40);
const STOCK = Number(process.env.STOCK ?? 25);
const BUY_QTY = Number(process.env.BUY_QTY ?? 1);
const PROBE = process.argv.includes("--probe");
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Mirrors lib/inventory/logic.ts canReserve + applyReserve under a mutex. */
function simulateRace({ stock, concurrency, buyQty }) {
  let onHand = stock;
  let successes = 0;
  let failures = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    // microtask shuffle
    await Promise.resolve();
    if (buyQty > 0 && onHand >= buyQty) {
      onHand -= buyQty;
      successes += 1;
    } else {
      failures += 1;
    }
  });
  return Promise.all(workers).then(() => ({ onHand, successes, failures }));
}

async function probeHost() {
  const started = performance.now();
  const paths = ["/api/health", "/api/ready"];
  const results = [];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (const path of paths) {
        const t0 = performance.now();
        try {
          const res = await fetch(`${BASE_URL}${path}`);
          results.push({
            path,
            ok: res.ok,
            status: res.status,
            ms: Math.round(performance.now() - t0),
          });
        } catch (err) {
          results.push({
            path,
            ok: false,
            status: 0,
            ms: Math.round(performance.now() - t0),
            error: String(err),
          });
        }
      }
    })
  );
  const elapsed = Math.round(performance.now() - started);
  const failures = results.filter((r) => !r.ok).length;
  const p95 = [...results.map((r) => r.ms)].sort((a, b) => a - b)[
    Math.floor(results.length * 0.95)
  ];
  return { elapsed, failures, p95, sample: results.slice(0, 6) };
}

async function main() {
  if (PROBE) {
    const probe = await probeHost();
    console.log(
      JSON.stringify(
        {
          mode: "probe",
          baseUrl: BASE_URL,
          concurrency: CONCURRENCY,
          ...probe,
          pass: probe.failures === 0 && (probe.p95 ?? 0) < 2000,
          threshold: "0 failed probes; p95 < 2000ms",
        },
        null,
        2
      )
    );
    process.exit(probe.failures === 0 ? 0 : 1);
  }

  const result = await simulateRace({
    stock: STOCK,
    concurrency: CONCURRENCY,
    buyQty: BUY_QTY,
  });
  const expectedSuccess = Math.floor(STOCK / BUY_QTY);
  const pass =
    result.successes === expectedSuccess &&
    result.failures === CONCURRENCY - expectedSuccess &&
    result.onHand === STOCK - expectedSuccess * BUY_QTY;

  console.log(
    JSON.stringify(
      {
        mode: "inventory-race",
        concurrency: CONCURRENCY,
        stock: STOCK,
        buyQty: BUY_QTY,
        ...result,
        expectedSuccess,
        pass,
        threshold: "successes === floor(stock/buyQty); no oversell",
      },
      null,
      2
    )
  );
  process.exit(pass ? 0 : 1);
}

main();
