/*! Propati shell cache — network-first, no-store safe.
   Bump CACHE to invalidate all stored assets when changing strategy. */
const CACHE = 'propati-shell-v2';
const ASSETS = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png', '/favicon.ico'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS).then(() => self.skipWaiting()))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req).then((resp) => {
        if (!resp || resp.status !== 200) return resp;

        const cacheControl = resp.headers.get('cache-control') || '';
        if (cacheControl.includes('no-store')) return resp;

        const clone = resp.clone();
        caches.open(CACHE).then((cache) => {
          const scheme = req.url ? new URL(req.url).protocol : req.scheme;
          if (scheme !== 'chrome-extension:') {
            cache.put(req, clone).catch(() => {});
          }
        }).catch(() => {});
        return resp;
      }).catch(() => cached || new Response('Offline', { status: 503 }));

      return cached || networkFetch;
    })
  );
});
