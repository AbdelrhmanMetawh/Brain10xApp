const cacheName = "Brain10x-Brain10x APP-0.9";
const contentToCache = [
    "Build/build_0.9.loader.js",
    "Build/build_0.9.framework.js",
    "Build/build_0.9.data",
    "Build/build_0.9.wasm",
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

// Activate event: clean up old caches and notify clients
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activate');
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => key !== cacheName && caches.delete(key)));
        await self.clients.claim();

        // Send message to all clients to trigger popup
		const clients = await self.clients.matchAll({ type: 'window' });
		for (const client of clients) {
		client.postMessage({ type: 'NEW_VERSION_AVAILABLE' });
		}
	
    })());
});

// Fetch event: serve from cache, fetch and cache new
self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
        const cachedResponse = await caches.match(e.request);
        if (cachedResponse) {
            return cachedResponse;
        }

        try {
            const networkResponse = await fetch(e.request);
            const cache = await caches.open(cacheName);
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
        } catch (err) {
            console.warn(`[Service Worker] Fetch failed: ${e.request.url}`, err);
            throw err;
        }
    })());
});
