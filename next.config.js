// next.config.js
const { SECURITY_HEADERS } = require("./lib/security/headers.cjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vzylebivuwwecvbjritx.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/api/webhooks/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/offline.html",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
    ];
  },
};

// withSentryConfig uploads source maps at build time (so stack traces in
// Sentry show real code, not minified bundles) and requires SENTRY_AUTH_TOKEN
// to be set in CI — see docs/ENVIRONMENT_VARIABLES.md. It's safe to leave
// this wrapper in place even in environments without that token: the upload
// step just no-ops with a warning rather than failing the build.
//
// Skip the wrapper in local `next dev`: Sentry SDK v8's webpack /
// clientTraceMetadata hooks are incompatible with Next.js 15.2+ and surface
// as `frame.join is not a function` in the error overlay.
const sentryOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  // Middleware must stay Edge-compatible. Sentry's automatic wrap pulls
  // sentry.edge.config into the middleware graph and Vercel rejects deploy with
  // "referencing unsupported modules: ./sentry.edge.config".
  autoInstrumentMiddleware: false,
};

if (process.env.NODE_ENV === "development") {
  module.exports = nextConfig;
} else {
  // Lazy-require so `next dev` never loads the Sentry webpack plugin.
  const { withSentryConfig } = require("@sentry/nextjs");
  module.exports = withSentryConfig(nextConfig, sentryOptions);
}
