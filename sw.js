var version = "0.0.3";
var cacheName = `sb-gf-offline-${version}`;
self.addEventListener('install', e => {
  var timeStamp = Date.now();
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        `/gravity-offline/index.html?timestamp=${timeStamp}`,
        `/gravity-offline/styles/main.css?timestamp=${timeStamp}`,
        `/gravity-offline/styles/offline-chrome.css?timestamp=${timeStamp}`,
        `/gravity-offline/scripts/offline.min.js?timestamp=${timeStamp}`,
        `/gravity-offline/scripts/main.js?timestamp=${timeStamp}`
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