const CACHE_NAME = "camara-pwa-v2"; // Cambiar a v2
const urlsToCache = [
  "./",
  "./index.html",
  "./app.js",
  "./style.css",
  "./manifest.json",
];

// Instalar Service Worker
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("Cache abierto");
      return cache.addAll(urlsToCache);
    })
  );
});

// Interceptar peticiones
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Activar Service Worker y limpiar cachés antiguos
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
