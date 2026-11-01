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

/* Notificaciones push de Rise (02-11-2026). El servidor solo envía título, texto, enlace interno y etiqueta. */
self.addEventListener("push", (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch { d = { body: event.data ? event.data.text() : "" }; }
  const url = typeof d.url === "string" && d.url.startsWith("/") && !d.url.startsWith("//") ? d.url : "/";
  event.waitUntil(self.registration.showNotification(String(d.title || "Rise").slice(0, 80), {
    body: String(d.body || "").slice(0, 200), tag: String(d.tag || "rise").slice(0, 80),
    data: { url }, icon: "/icon-192.png", badge: "/icon-192.png"
  }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil((async () => {
    const open = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of open) {
      if (c.url.startsWith(self.location.origin)) { await c.focus(); if ("navigate" in c) await c.navigate(url); return; }
    }
    await self.clients.openWindow(url);
  })());
});
