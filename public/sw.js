/* public/sw.js — DIME storefront service worker
 * Strategy:
 * - Precache shell + offline fallback
 * - Cache-first for static assets (_next/static, fonts, brand images)
 * - Network-first for HTML navigations (fallback to offline.html)
 * - Bypass API, admin, checkout, account, and other sensitive surfaces
 */
const VERSION = "dime-pwa-v1";
const PRECACHE = `${VERSION}-precache`;
const RUNTIME = `${VERSION}-runtime`;
const PRECACHE_URLS = ["/", "/offline.html", "/icon.png", "/apple-icon.png", "/brand/logo.png", "/manifest.webmanifest"];

function isBypassed(url) {
  const path = url.pathname;
  if (path.startsWith("/api/")) return true;
  if (path.startsWith("/admin")) return true;
  if (path.startsWith("/account")) return true;
  if (path.startsWith("/checkout")) return true;
  if (path.startsWith("/cart")) return true;
  if (path.startsWith("/login") || path.startsWith("/signup")) return true;
  if (path.startsWith("/wholesale/checkout")) return true;
  return false;
}

function isStaticAsset(url) {
  const path = url.pathname;
  if (path.startsWith("/_next/static/")) return true;
  if (path.startsWith("/fonts/")) return true;
  if (path.startsWith("/brand/")) return true;
  if (path.startsWith("/catalog/")) return true;
  return /\.(?:js|css|woff2?|png|jpe?g|webp|avif|svg|ico|mp4)$/i.test(path);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== PRECACHE && key !== RUNTIME) return caches.delete(key);
            return undefined;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (isBypassed(url)) return;

  // Navigations: network first, offline HTML fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const home = await caches.match("/");
          if (home) return home;
          return (await caches.match("/offline.html")) || Response.error();
        })
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
  }
});

self.addEventListener("sync", (event) => {
  // Reserved for future offline newsletter / form replay (tag: dime-bg-sync).
  if (event.tag === "dime-bg-sync") {
    event.waitUntil(Promise.resolve());
  }
});
