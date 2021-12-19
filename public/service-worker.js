// Service worker structure taken from PWA Activity 12 service worker.
console.log("Your service worker is logged!");
const FILES_TO_CACHE = ["/", "index.html", "styles.css", "index.js", "db.js"];

// these are the names of my caches
const CACHE_NAME = "static-cache-v3";
const DATA_CACHE_NAME = "data-cache-v1";

// install - the service worker is installed
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    // create a static cache
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Your files were pre-cached successfully!");
      // add the files to the cache
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// fetch
self.addEventListener("fetch", function (evt) {
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request).then((response) => {
        return response || fetch(evt.request);
      });
    })
  );
});
