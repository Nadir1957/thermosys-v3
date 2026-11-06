// Thermosys v3 - Service Worker (reseau d'abord)
const CACHE = 'thermosys-v3-cache-v2';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // CDN, Supabase, etc. : non intercepte
  if (url.pathname.indexOf('/api/') === 0) return;   // appels API : non intercepte
  // Reseau d'abord : toujours la derniere version en ligne, cache en secours hors ligne
  e.respondWith(
    fetch(req).then(function(res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function(c) { c.put(req, copy); });
      }
      return res;
    }).catch(function() {
      return caches.match(req).then(function(cached) { return cached || caches.match('/index.html'); });
    })
  );
});
