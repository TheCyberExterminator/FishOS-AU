/* FishOS AU Lite — service worker (offline app shell)
   v3: HTML is network-first so deployed updates appear immediately when online,
   while still working fully offline from cache. Live API data is never cached. */
const CACHE = 'fishos-au-lite-v3';
const SHELL = [
  './',
  './index.html',
  './sw.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Live data — never cache (always go to network, fall back to cache only if offline).
const LIVE_HOSTS = [
  'open-meteo.com', 'marine-api.open-meteo.com', 'geocoding-api.open-meteo.com',
  'api.met.no', 'wttr.in', 'austides.vercel.app', 'tideturtle.com',
  'overpass', 'nominatim', 'tile.openstreetmap.org'
];

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (LIVE_HOSTS.some(h => url.hostname.includes(h))) {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // HTML / navigations → NETWORK-FIRST so code updates ship instantly; cache fallback offline.
  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html') ||
    url.pathname.endsWith('/') || url.pathname.endsWith('.html');

  if (isHTML) {
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); return res; })
        .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  // Other shell assets (versioned CDN URLs) → cache-first, then network.
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
