// instrumentation.ts (project root)
//
// Production-only Sentry bootstrap. Dynamic imports use webpackIgnore so
// `next dev` never pulls @sentry/nextjs / OpenTelemetry into the module graph
// (that combination breaks the App Router overlay: frame.join / reading 'call').

export async function register() {
  if (process.env.NODE_ENV !== "production") return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import(/* webpackIgnore: true */ "./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import(/* webpackIgnore: true */ "./sentry.edge.config");
  }
}
