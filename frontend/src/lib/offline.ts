// Offline support utilities for PWA

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[PWA] Service worker registered:', registration.scope);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, notify user
            dispatchEvent(new CustomEvent('sw-update-available'));
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error);
    return null;
  }
}

// Check if app is running as installed PWA
export function isInstalledPWA(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// Check if online
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

// Add listener for online/offline events
export function addConnectivityListener(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

// Queue action for later sync when offline
export async function queueOfflineAction(action: {
  type: string;
  url: string;
  method: string;
  body?: unknown;
}): Promise<void> {
  const cache = await caches.open('linkup-offline-queue');

  const request = new Request(action.url, {
    method: action.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: action.body ? JSON.stringify(action.body) : undefined,
  });

  // Store the request
  await cache.put(request, new Response(JSON.stringify(action)));

  // Request background sync if available
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await (registration as any).sync.register('sync-join-requests');
    } catch (error) {
      console.log('[PWA] Background sync not available:', error);
    }
  }
}

// Cache course data for offline access
export async function cacheCourseData(courseId: string, data: unknown): Promise<void> {
  const cache = await caches.open('linkup-courses');
  const url = `/api/courses/${courseId}`;
  const response = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'sw-cached-at': Date.now().toString(),
    },
  });
  await cache.put(url, response);
}

// Get cached course data
export async function getCachedCourseData(courseId: string): Promise<unknown | null> {
  const cache = await caches.open('linkup-courses');
  const url = `/api/courses/${courseId}`;
  const response = await cache.match(url);

  if (!response) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
}

// Check if course data is cached
export async function isCourseDataCached(courseId: string): Promise<boolean> {
  const cache = await caches.open('linkup-courses');
  const url = `/api/courses/${courseId}`;
  const response = await cache.match(url);
  return response !== undefined;
}

// Clear all cached data
export async function clearAllCaches(): Promise<void> {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((name) => caches.delete(name))
  );
}

// Get storage estimate
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
} | null> {
  if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
    return null;
  }

  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage || 0;
  const quota = estimate.quota || 0;
  const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;

  return { usage, quota, percentUsed };
}

// Request persistent storage
export async function requestPersistentStorage(): Promise<boolean> {
  if (!('storage' in navigator) || !('persist' in navigator.storage)) {
    return false;
  }

  try {
    const isPersisted = await navigator.storage.persist();
    console.log('[PWA] Storage persistence:', isPersisted ? 'granted' : 'denied');
    return isPersisted;
  } catch {
    return false;
  }
}
