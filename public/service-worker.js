// Service worker structure taken from PWA Activity 12 service worker.
// This is where the files to be cached are specified.
// Go to NETWORK --> Turn No Throttling to Offline to check if this is working offline
// Go to APPLICATION --> Storage --> Clear Site Data to clear cache
// This stuff is stored in the cache storage.
// Cache storage just stores the files/data you specify. IndexedDB is a "smarter" way of storing data. It's not a cache. It's a object/document-based way of storing data, which you have to reference using indexes/keys.
// IndexedDB is used to store the transactions you make offline, while the cache just stores all the transactions/whatever the database gives back.
const FILES_TO_CACHE = [
  "/",
  "index.html",
  "styles.css",
  "index.js",
  "db.js",
  "manifest.webmanifest",
];

// these are the names of my caches
const CACHE_NAME = "static-cache-v3";
const DATA_CACHE_NAME = "data-cache-v1";

// INSTALL - the service worker is installed
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

// ACTIVATE
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
  // cache successful requests to the API
  if (evt.request.url.includes("/api/")) {
    // Anywhere you see evt.respondWith, there's a caching strategy.
    evt.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(evt.request)
            .then((response) => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }

              return response;
            })
            .catch((err) => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
        })
        .catch((err) => console.log(err))
    );

    return;
  }

  // if the request is not for the API, serve static assets using "offline-first" approach.
  // see https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook#cache-falling-back-to-network
  evt.respondWith(
    caches.match(evt.request).then(function (response) {
      return response || fetch(evt.request);
    })
  );
});
