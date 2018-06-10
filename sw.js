---
---

var DYNAMIC_CACHE = 'dynamic-cache-v1';
var STATIC_CACHE = 'static-cache-v1'

// listen for outgoing network request
self.addEventListener('fetch', function (event) {
    // try to find response object in the cache
    // associated with current request
    event.respondWith(
        caches.open(STATIC_CACHE).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                if (response) return response;

                return fetch(event.request).then(function (networkResponse) {
                    if (!networkResponse || (networkResponse.status !== 200 && !networkResponse.ok)) {
                        return caches.open(DYNAMIC_CACHE).then(function (dynCache) {
                            return dynCache.match(event.request);
                        }).then(function (dynResponse) {
                            if (dynResponse) return dynResponse;
                            else return networkResponse;
                        });
                    }
                    var cachedResponse = networkResponse.clone();
                    caches.open(DYNAMIC_CACHE).then(function (dynCache) {
                        dynCache.put(event.request, cachedResponse);
                    });
                    return networkResponse;
                });
            });
        })
    );
});

self.addEventListener('activate', function (event) {
    console.log('service worker activate');
});

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(function (cache) {
            return cache.addAll(
                [
                    "./",
                    "./css/main.css",
                    "./js/main.js",
                    "./images/logo.png",
                    "./images/home-images/portfolio.jpg",
                    "https://fonts.googleapis.com/css?family=Open+Sans:400,300,300italic,400italic,600,600italic,700,700italic,800,800italic",
                    "./assets/minima-social-icons.svg",
                    "./about/",
                    "./blog/",
                    "./contact/",
                ]
            );
        })
    );
});