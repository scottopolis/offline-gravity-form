var version = "0.0.3";
var cacheName = `sb-gf-offline-${version}`;
self.addEventListener('install', e => {
  var timeStamp = Date.now();
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        `/offline-gravity-form/index.html?timestamp=${timeStamp}`,
        `/offline-gravity-form/styles/main.css?timestamp=${timeStamp}`,
        `/offline-gravity-form/styles/offline-chrome.css?timestamp=${timeStamp}`,
        `/offline-gravity-form/scripts/offline.min.js?timestamp=${timeStamp}`,
        `/offline-gravity-form/scripts/main.js?timestamp=${timeStamp}`
      ])
          .then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, {ignoreSearch: true}))
      .then(response => {
      return response || fetch(event.request);
    })
  );
});