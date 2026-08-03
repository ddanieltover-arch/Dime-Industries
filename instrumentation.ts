// instrumentation.ts (project root)
//
// Production-only Sentry bootstrap. Dynamic imports use webpackIgnore so
// `next dev` never pulls @sentry/nextjs / OpenTelemetry into the module graph
// (that combination breaks the App Router overlay: frame.join / reading 'call').
//
// Edge init is intentionally omitted: Vercel Edge middleware rejects a
// sentry.edge.config module reference at deploy time, and we disable
// autoInstrumentMiddleware in next.config.js for the same reason. Server +
// client Sentry still cover app/API errors.

export async function register() {
  if (process.env.NODE_ENV !== "production") return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import(/* webpackIgnore: true */ "./sentry.server.config");
  }
}
