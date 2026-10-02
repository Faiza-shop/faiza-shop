/* Faïza Shop — cache hors ligne.
   IMPORTANT : après chaque modification de index.html, augmentez le numéro
   de VERSION ci-dessous, sinon les appareils garderont l'ancienne version. */
var VERSION = 'faiza-v1';
var FICHIERS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FICHIERS); }).catch(function () {}));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (cles) {
      return Promise.all(cles.map(function (k) { return k === VERSION ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var url = e.request.url;
  // Jamais de cache pour Apps Script : les ventes doivent partir en direct.
  if (e.request.method !== 'GET' || url.indexOf('script.google') !== -1) return;
  e.respondWith(
    fetch(e.request)
      .then(function (r) {
        if (r && r.ok && url.indexOf(self.registration.scope) === 0) {
          var copie = r.clone();
          caches.open(VERSION).then(function (c) { c.put(e.request, copie); });
        }
        return r;
      })
      .catch(function () { return caches.match(e.request).then(function (c) { return c || caches.match('./index.html'); }); })
  );
});
