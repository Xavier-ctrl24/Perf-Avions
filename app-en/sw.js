/* Service worker — toldcalc (worldwide edition)

   Makes the app usable with no connection, which is the real use case: working
   out a performance at the airfield, in flight mode, with no signal.

   IMPORTANT — bump CACHE whenever any file listed in ASSETS changes. It is the
   only thing that triggers an update on installed phones: as long as the cache
   name stays the same, devices keep serving the old version. A performance
   calculator frozen on stale code is the failure mode to avoid.

   TWO NAMING RULES, both load-bearing:

   1. The cache name must NOT collide with the French club tool's
      'perf-avions-vN'. Both apps are served from the same Vercel origin, and
      the Cache Storage API is per-origin, not per-scope.

   2. Deletion on activate is limited to our OWN prefix. The club tool's worker
      deletes every cache that is not its own, so it will evict this app's cache
      whenever it updates (harmless — the files are simply fetched again on the
      next online visit). This worker deliberately does not return the favour:
      evicting the club app's offline cache from here would be a real bug. */
const CACHE_PREFIX = 'tlperf-';
const CACHE = CACHE_PREFIX + 'v12';

const ASSETS = [
  './',
  'index.html',
  'assets.js',
  'manifest.json',
  'C172_Night_cockpit.jpg',
  'icons/icon.svg',
  'icons/favicon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
];

/* addAll is atomic: if a single file is missing, installation fails and nothing
   is cached at all. That is deliberate — no offline mode beats an offline mode
   missing index.html or assets.js. */
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((n) => n.startsWith(CACHE_PREFIX) && n !== CACHE)
          .map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  /* Never intercept other origins: METARs (aviationweather.gov,
     metar.vatsim.net) must always be fresh. A METAR served from a cache would be
     stale weather presented as current. */
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req, { cacheName: CACHE }).then((hit) => hit || fetch(req))
  );
});

/* Sent by the "Reload" button of the update banner: a new worker waits politely
   until every tab is closed, and this message tells it to take over now. */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
