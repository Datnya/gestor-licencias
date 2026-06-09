const CACHE_NAME = 'gestor-licencias-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css',
  './css/base.css',
  './css/components.css',
  './css/app.css',
  'https://unpkg.com/dexie@3.2.4/dist/dexie.js',
  './js/utils.js',
  './js/db.js',
  './js/github.js',
  './js/ui.js',
  './js/pages/dashboard.js',
  './js/pages/clients.js',
  './js/pages/new-license.js',
  './js/pages/projects.js',
  './js/pages/settings.js',
  './js/pages/client-detail.js',
  './js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network first, fallback to cache for HTML/JS/CSS
// We need network to check latest versions
self.addEventListener('fetch', (event) => {
  // Ignore API calls for caching
  if (event.request.url.includes('api.github.com') || event.request.url.includes('raw.githubusercontent.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache the new version if successful
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request);
      })
  );
});
