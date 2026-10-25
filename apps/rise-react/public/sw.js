/* Rise Nocturne — safe PWA cache. Never cache private documents or APIs.
 * Retire obsolete classic worker caches after takeover. This does NOT touch localStorage/IndexedDB. */
const NAME = "rise-nocturne-static-v2";
const STATIC_ASSET_PREFIX = "/assets/";
self.addEventListener("install", () => { self.skipWaiting(); });
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((key) => (key.startsWith("rise-nocturne-static-") && key !== NAME) || key.startsWith("renzo-hub-")).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || req.mode === "navigate") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin ||
      !url.pathname.startsWith(STATIC_ASSET_PREFIX) ||
      !/^[a-zA-Z0-9_-]+\.(?:js|css|png|jpe?g|webp|svg|woff2?)$/.test(url.pathname.slice(STATIC_ASSET_PREFIX.length))) return;
  event.respondWith((async () => {
    const cache = await caches.open(NAME);
    const hit = await cache.match(req);
    if (hit) return hit;
    const response = await fetch(req);
    if (response.ok && response.type === "basic") await cache.put(req, response.clone());
    return response;
  })());
});
