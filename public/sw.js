const CACHE_NAME = 'sprosi-ai-cache-v1';

self.addEventListener('install', (event) => {
    // Skip waiting so the service worker activates immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Claim clients so the pages are controlled immediately
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Simple pass-through fetch to satisfy PWA installability requirements
    event.respondWith(fetch(event.request).catch(error => {
        console.warn('[Service Worker] Fetch failed:', error);
        throw error;
    }));
});
