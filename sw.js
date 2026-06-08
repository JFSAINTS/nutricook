// NutriCook Service Worker — offline app shell caching
const CACHE = 'nutricook-v1';

// App shell: only same-origin static assets. AI/API calls are cross-origin
// and must always hit the network, so they are never intercepted here.
const SHELL = [
  './',
  './index.html',
  './i18n.js',
  './assets/index-XRHRr6FJ.js',
  './assets/index-B9VSYjip.css',
  './assets/manifest-46XtiS4X.json',
  './assets/icon-32-B_SY1GJM.png',
  './assets/icon-16-D29-abfk.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // Cache each item individually so one 404 doesn't abort the whole install.
      Promise.allSettled(SHELL.map((url) => cache.add(url)))
    )
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

  // Only handle GET requests on the same origin. Let everything else
  // (POST, and all cross-origin AI provider API calls) go straight to the network.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  // Navigation requests: network-first so users get the latest app,
  // falling back to the cached shell when offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Static assets: cache-first, then update the cache in the background.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
