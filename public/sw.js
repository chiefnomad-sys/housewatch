// Housewatch service worker. Kept deliberately small: pages always come from the
// network, so readers never see stale news. If the phone is offline, a page opened
// from the home screen shows a short offline notice instead of a browser error.
const CACHE = 'housewatch-offline-v1';
const OFFLINE = '/offline/';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE)));
});
