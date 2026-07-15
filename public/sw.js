const CACHE = 'propati-shell-v1';
const ASSETS = ['/','/manifest.json','/icon-192.png','/icon-512.png','/favicon.ico'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(url => new Request(url, {{cache: 'reload'}}))).catch(() => self.skipWaiting())));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(resp => {
    if (resp && resp.status === 200) {
      const clone = resp.clone();
      caches.open(CACHE).then(c => c.put(req, clone));
    }
    return resp;
  }).catch(() => cached || new Response('Offline', { status: 503 }))));
});
