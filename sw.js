/* FishOS AU Lite — service worker (offline app shell)
   Optional: enables full offline/installable PWA on GitHub Pages.
   Caches the app shell; live weather/map data still needs a connection. */
const CACHE = 'fishos-au-lite-v2';
const SHELL = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never cache live API data — always go to network, fall back gracefully.
  const isLiveData =
    url.hostname.includes('open-meteo.com') ||
    url.hostname.includes('overpass') ||
    url.hostname.includes('nominatim') ||
    url.hostname.includes('tile.openstreetmap.org');

  if (isLiveData) {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // App shell: cache-first, then network, then update cache.
  e.respondWith(
    caches.match(req).then(hit =>
      hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
