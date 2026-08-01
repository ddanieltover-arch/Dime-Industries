// lib/pwa/cache-policy.ts — mirror of public/sw.js path rules (keep in sync)
export function isPwaBypassedPath(pathname: string): boolean {
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/account")) return true;
  if (pathname.startsWith("/checkout")) return true;
  if (pathname.startsWith("/cart")) return true;
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) return true;
  if (pathname.startsWith("/wholesale/checkout")) return true;
  return false;
}

export function isPwaStaticAssetPath(pathname: string): boolean {
  if (pathname.startsWith("/_next/static/")) return true;
  if (pathname.startsWith("/fonts/")) return true;
  if (pathname.startsWith("/brand/")) return true;
  if (pathname.startsWith("/catalog/")) return true;
  return /\.(?:js|css|woff2?|png|jpe?g|webp|avif|svg|ico|mp4)$/i.test(pathname);
}

export const PWA_SW_PATH = "/sw.js";
export const PWA_OFFLINE_PATH = "/offline.html";
