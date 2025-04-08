const cacheName = "Brain10x-Brain10x APP-0.4";
const contentToCache = [
    "Build/build_0.4.loader.js",
    "Build/build_0.4.framework.js",
    "Build/build_0.4.data",
    "Build/build_0.4.wasm",
    "TemplateData/style.css"

];

// Install event: cache app shell
self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    e.waitUntil((async function () {
        const cache = await caches.open(cacheName);
        console.log('[Service Worker] Caching all: app shell and content');
        await cache.addAll(contentToCache);
    })());
    self.skipWaiting(); // Activate immediately
});

// Activate event: clean up old caches
self.addEventListener('activate', function (e) {
    console.log('[Service Worker] Activate');
    e.waitUntil((async function () {
        const keys = await caches.keys();
        await Promise.all(
            keys.map((key) => {
                if (key !== cacheName) {
                    console.log('[Service Worker] Deleting old cache:', key);
                    return caches.delete(key);
                }
            })
        );
    })());
    self.clients.claim(); // Take control immediately
});

// Fetch event: serve from cache, then fetch and cache new
self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
        const cachedResponse = await caches.match(e.request);
        if (cachedResponse) {
            console.log(`[Service Worker] Serving from cache: ${e.request.url}`);
            return cachedResponse;
        }

        try {
            const networkResponse = await fetch(e.request);
            const cache = await caches.open(cacheName);
            cache.put(e.request, networkResponse.clone());
            console.log(`[Service Worker] Fetched & cached: ${e.request.url}`);
            return networkResponse;
        } catch (err) {
            console.warn(`[Service Worker] Fetch failed: ${e.request.url}`, err);
            throw err;
        }
    })());
});