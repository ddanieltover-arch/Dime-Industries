// lib/security/headers.cjs
/** CJS twin of headers.ts for next.config.js (CommonJS). Keep values in sync. */

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; media-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://api.paybis.com https://tile.openstreetmap.org https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com; worker-src 'self'; manifest-src 'self'; frame-ancestors 'none';",
  },
];

module.exports = { SECURITY_HEADERS };
