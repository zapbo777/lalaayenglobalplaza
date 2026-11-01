// Lala Ayen Global Plaza - safe service worker (network-first)
// Visitors always get the newest site from the network. The cache is only an
// offline fallback. Payments, logins, owner/admin pages, APIs and every
// non-GET request are never touched (the browser handles them normally).
const CACHE = "lala-ayen-plaza-v2";
const SKIP = /(^\/(api|auth|owner|admin|account|login|cdn-cgi)(\/|$))|checkout|payment|square|paypal|stripe|zonos|owner|admin|login|signin|auth/i;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;               // never POST/PUT/etc.
  if (req.headers.has("range")) return;            // video streaming
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never other sites (Square, CJ, etc.)
  if (SKIP.test(url.pathname) || SKIP.test(url.search)) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match("/") : Response.error()))
      )
  );
});
