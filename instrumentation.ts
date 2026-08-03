// instrumentation.ts (project root)
//
// Next.js 15 instrumentation hook — loads Sentry for the Node.js runtime.
// Skip entirely in development: Sentry SDK v8 + Next 15.2+ break the local
// error overlay (`frame.join`) and pull OpenTelemetry into the webpack graph.
//
// Do NOT use `webpackIgnore` on these imports — Vercel serverless then cannot
// resolve ./sentry.server.config at runtime and every request returns 500.
//
// Edge init stays off: autoInstrumentMiddleware is false in next.config.js
// because Vercel rejects middleware that references sentry.edge.config.

export async function register() {
  if (process.env.NODE_ENV === "development") return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      await import("./sentry.server.config");
    } catch (err) {
      console.error("[instrumentation] Sentry server init failed", err);
    }
  }
}

export async function onRequestError(
  error: unknown,
  request: { path: string; method: string; headers: Record<string, string | string[]> },
  context: { routerKind: string; routePath: string; routeType: string }
) {
  if (process.env.NODE_ENV === "development") return;
  try {
    const Sentry = await import("@sentry/nextjs");
    return Sentry.captureRequestError(error, request, context);
  } catch (err) {
    console.error("[instrumentation] captureRequestError failed", err);
  }
}
