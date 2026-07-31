// next.config.js
const { withSentryConfig } = require("@sentry/nextjs");
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
    ];
  },
};

// withSentryConfig uploads source maps at build time (so stack traces in
// Sentry show real code, not minified bundles) and requires SENTRY_AUTH_TOKEN
// to be set in CI — see docs/ENVIRONMENT_VARIABLES.md. It's safe to leave
// this wrapper in place even in environments without that token: the upload
// step just no-ops with a warning rather than failing the build.
module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
});
