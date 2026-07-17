/* Service worker : rend l'appli utilisable sans connexion (calcul d'une perfo
   au terrain, en mode avion, dans un hangar sans réseau).

   IMPORTANT — incrémenter CACHE à chaque modification d'un fichier listé dans
   ASSETS. C'est le seul déclencheur de mise à jour : tant que le nom du cache
   ne change pas, les téléphones déjà installés resservent l'ancienne version.
   Un calculateur de perfos figé sur de vieilles données, c'est le scénario à
   éviter. */
const CACHE = 'perf-avions-v2';

/* Les photos d'avions vivent dans un dossier au nom espacé, et sont déclarées
   avec l'espace encodé (%20) dans db-flotte.js. Une clé de cache se compare
   caractère par caractère : « images avions/... » ne correspondrait pas à la
   requête « images%20avions/... » émise par le navigateur, et la photo
   manquerait hors-ligne. Garder ces chemins identiques à ceux de db-flotte.js. */
const ASSETS = [
  './',
  'index.html',
  'db-flotte.js',
  'logo.png',
  'C172_Night_cockpit.jpg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon.svg',
  'images%20avions/wt9_ulm.png',
  'images%20avions/wt9_lsa.png',
  'images%20avions/ps28.png',
  'images%20avions/c172.png',
  'images%20avions/pa28.png',
  'images%20avions/tetras.png',
  'images%20avions/savanah.png'
];

/* addAll est atomique : si un seul fichier manque, l'installation échoue et
   rien n'est mis en cache. C'est voulu — mieux vaut pas de hors-ligne du tout
   qu'un hors-ligne amputé d'une photo ou, pire, de db-flotte.js. */
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  /* Ne jamais intercepter les autres origines : les METAR (aviationweather.gov,
     metar.vatsim.net) doivent toujours être frais. Un METAR servi depuis un
     cache serait une info météo périmée présentée comme actuelle. */
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req, { cacheName: CACHE }).then((hit) => hit || fetch(req))
  );
});

/* Envoyé par le bouton « Recharger » du bandeau de mise à jour : le nouveau
   service worker attend sagement que tous les onglets soient fermés, ce message
   lui dit de prendre la main tout de suite. */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
