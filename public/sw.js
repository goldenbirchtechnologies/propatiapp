const CACHE = 'propati-shell-v4';
const ASSETS = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png', '/favicon.ico'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS).then(() => self.skipWaiting()))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Never intercept Next.js internal routes, API, or any HTML pages
  const url = new URL(req.url);
  if (url.pathname.startsWith('/_next/') ||
      url.pathname.startsWith('/api/') ||
      url.pathname === '/sign-in' ||
      url.pathname === '/sign-up' ||
      url.pathname.startsWith('/dashboard') ||
      url.pathname.startsWith('/admin')) {
    return;
  }
});
