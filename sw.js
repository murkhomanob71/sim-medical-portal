/* SIM Group Medical Portal — offline cache.
   Only active when the folder is served over http(s); file:// pages skip it. */
'use strict';

const CACHE_NAME = 'sim-medical-v3.4';

const PRECACHE = [
  './index.html',
  './dashboard.html',
  './medical_requisition.html',
  './notice_board.html',
  './styles.css',
  './app.js',
  './logo.png',
  './manifest.webmanifest',
  './assets/css/inter.css',
  './assets/css/utilities.css',
  './assets/css/requisition.css',
  './assets/css/requisition-extras.css',
  './assets/css/notices.css',
  './assets/icons/bootstrap-icons.css',
  './assets/icons/fonts/bootstrap-icons.woff2',
  './assets/js/requisition.js',
  './assets/js/notices.js',
  './assets/vendor/xlsx.bundle.js',
  './assets/img/icon-32.png',
  './assets/img/icon-180.png',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // One missing file must not break the whole install.
      Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first so a refreshed file is picked up immediately; the cache
  // keeps the portal working when the machine is offline.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => null);
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => (
        cached || caches.match('./medical_requisition.html')
      )))
  );
});
