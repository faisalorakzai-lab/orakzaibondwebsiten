/* Orakzai Bond Service Worker — v1.
 * Cache-first for shell + static assets, network-first for /api,
 * navigation fallback to cached index.html for offline single-page navigation. */
const CACHE = "okbond-v1";
const SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/okbond-logo.png",
  "/favicon.svg",
  "/opengraph.jpg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // /api → network-first with cache fallback
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => {
            if (res.ok) c.put(req, copy);
          });
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // SPA navigations → network-first, fallback to cached index.html
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/index.html", copy));
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Static assets → cache-first
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          const copy = res.clone();
          if (
            res.ok &&
            (req.destination === "style" ||
              req.destination === "script" ||
              req.destination === "image" ||
              req.destination === "font")
          ) {
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
