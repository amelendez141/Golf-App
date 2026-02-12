const CACHE_NAME = 'linkup-golf-v1';
const OFFLINE_URL = '/offline';

// Resources to cache immediately on install
const PRECACHE_RESOURCES = [
  '/',
  '/feed',
  '/explore',
  '/offline',
  '/manifest.json',
];

// Cache duration settings (in seconds)
const CACHE_DURATIONS = {
  courses: 7 * 24 * 60 * 60, // 7 days
  teeTimesLive: 30, // 30 seconds
  userProfile: 60 * 60, // 1 hour
  weather: 30 * 60, // 30 minutes
  images: 24 * 60 * 60, // 1 day
  static: 30 * 24 * 60 * 60, // 30 days
};

// Install event - precache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching resources');
      return cache.addAll(PRECACHE_RESOURCES);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except for API and images)
  if (url.origin !== location.origin && !isAllowedCrossOrigin(url)) {
    return;
  }

  // API requests - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, getCacheDuration(url.pathname)));
    return;
  }

  // Static assets - cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstWithNetwork(request));
    return;
  }

  // Images - cache first with network fallback
  if (isImageRequest(request)) {
    event.respondWith(cacheFirstWithNetwork(request));
    return;
  }

  // HTML pages - network first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirstWithCache(request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Default - network with cache fallback
  event.respondWith(networkFirstWithCache(request));
});

// Network first strategy with cache fallback
async function networkFirstWithCache(request, maxAge = 60) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      const responseToCache = networkResponse.clone();

      // Add timestamp to cached response
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-at', Date.now().toString());

      cache.put(request, new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers,
      }));
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      // Check if cache is still valid
      const cachedAt = cachedResponse.headers.get('sw-cached-at');
      if (cachedAt && Date.now() - parseInt(cachedAt) < maxAge * 1000) {
        return cachedResponse;
      }
    }

    throw error;
  }
}

// Cache first strategy with network fallback
async function cacheFirstWithNetwork(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Update cache in background
    fetchAndCache(request);
    return cachedResponse;
  }

  return fetchAndCache(request);
}

// Fetch and cache
async function fetchAndCache(request) {
  const networkResponse = await fetch(request);

  if (networkResponse.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  return /\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname);
}

// Check if request is for an image
function isImageRequest(request) {
  const accept = request.headers.get('accept') || '';
  return accept.includes('image/');
}

// Check if cross-origin request is allowed
function isAllowedCrossOrigin(url) {
  const allowedOrigins = [
    'api.mapbox.com',
    'tiles.mapbox.com',
    'images.unsplash.com',
  ];
  return allowedOrigins.some((origin) => url.hostname.includes(origin));
}

// Get cache duration based on pathname
function getCacheDuration(pathname) {
  if (pathname.includes('/courses')) return CACHE_DURATIONS.courses;
  if (pathname.includes('/tee-times')) return CACHE_DURATIONS.teeTimesLive;
  if (pathname.includes('/weather')) return CACHE_DURATIONS.weather;
  if (pathname.includes('/users')) return CACHE_DURATIONS.userProfile;
  return 60; // Default 1 minute
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-join-requests') {
    event.waitUntil(syncJoinRequests());
  }
});

// Sync queued join requests
async function syncJoinRequests() {
  const cache = await caches.open('linkup-offline-queue');
  const requests = await cache.keys();

  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.delete(request);
      }
    } catch (error) {
      console.log('[SW] Sync failed, will retry', error);
    }
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/feed';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
