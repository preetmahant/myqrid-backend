/* myQRID — Service Worker */

const CACHE = 'myqrid-v1';
const STATIC = [
  '/',
  '/index.html',
  '/profile.html',
  '/login.html',
  '/signup.html',
  '/claim.html',
  '/dashboard.html',
  '/offline.html',
  '/css/glass.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/logo.js',
  '/manifest.json'
];

/* Install — cache static files */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  );
});

/* Activate — clear old caches */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Fetch — cache first, network fallback */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('myqrid-backend.myqrid.workers.dev')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    }).catch(() => caches.match('/offline.html'))
  );
});
