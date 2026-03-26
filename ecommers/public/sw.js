/* Service Worker: manual implementation
   - precaches core routes
   - cache-first for static assets
   - network-first for API calls
   - handles push and notificationclick
*/

const CACHE_VERSION = 'v1';
const PRECACHE = `precache-${CACHE_VERSION}`;
const RUNTIME = `runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== PRECACHE && key !== RUNTIME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

function isApiRequest(request) {
  try {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/') || url.pathname.includes('/api/');
  } catch (e) {
    return false;
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  // Network-first for API calls
  if (isApiRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for same-origin requests (static assets, pages)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return caches.open(RUNTIME).then((cache) =>
        fetch(request)
          .then((response) => {
            // don't cache opaque responses (e.g., cross-origin)
            if (response && response.status === 200 && response.type === 'basic') {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // fallback to root for navigation requests
            if (request.mode === 'navigate') return caches.match('/');
            return new Response(null, { status: 504, statusText: 'Gateway Timeout' });
          })
      );
    })
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!(self.Notification && self.Notification.permission === 'granted')) return;
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Notification', body: event.data?.text() };
  }
  const title = data.title || 'Ecommers';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192.svg',
    badge: data.badge || '/icons/icon-192.svg',
    data: data.url || '/',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
