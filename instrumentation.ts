// instrumentation.ts (project root)
//
// Next.js 15's instrumentation hook — the single entry point that loads the
// right Sentry config for whichever runtime the current request is in.
// Requires `experimental.instrumentationHook` is NOT needed on Next 15 (it's
// stable/default on); if this is ever added to a Next <13.4 project, that
// flag would need to be set explicitly in next.config.js.

export async function register() {
  // Sentry SDK v8 + Next 15.2+ break the local error overlay (`frame.join`)
  // and pull OpenTelemetry into the webpack graph. Skip entirely in development.
  if (process.env.NODE_ENV === "development") return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export async function onRequestError(
  error: unknown,
  request: { path: string; method: string; headers: Record<string, string | string[]> },
  context: { routerKind: string; routePath: string; routeType: string }
) {
  if (process.env.NODE_ENV === "development") return;
  const Sentry = await import("@sentry/nextjs");
  return Sentry.captureRequestError(error, request, context);
}
