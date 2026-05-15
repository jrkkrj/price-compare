const CACHE_NAME = 'price-comp-v2';
const ASSETS = [
  './price-compare.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become active immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim()) // Take control of all pages immediately
  );
});

self.addEventListener('fetch', (event) => {
  // Network-First Strategy
  event.respondWith(
    fetch(event.request).then(response => {
      // Update cache with the new version
      if (response && response.status === 200 && response.type === 'basic') {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
      }
      return response;
    }).catch(() => {
      // If network fails, fallback to cache
      return caches.match(event.request);
    })
  );
});