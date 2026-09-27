// Minimal service worker: only caches the app shell (this HTML page) so the
// app can open offline. Firestore's own network calls are never touched —
// this only intercepts page navigation, not data requests.
const CACHE_NAME = 'provenance-shell-v1';
const SHELL_FILES = ['./', './index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle loading the page itself. Everything else (Firestore reads/
  // writes, fonts, QR libraries) goes straight to the network as normal.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
  }
});
