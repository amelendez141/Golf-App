'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker, isOnline, addConnectivityListener } from '@/lib/offline';

export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Register service worker
    registerServiceWorker().then((registration) => {
      if (registration) {
        setIsRegistered(true);
      }
    });

    // Listen for update events
    const handleUpdate = () => setUpdateAvailable(true);
    window.addEventListener('sw-update-available', handleUpdate);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdate);
    };
  }, []);

  const refreshApp = () => {
    window.location.reload();
  };

  return { isRegistered, updateAvailable, refreshApp };
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(isOnline());

    const cleanup = addConnectivityListener(
      () => setOnline(true),
      () => setOnline(false)
    );

    return cleanup;
  }, []);

  return online;
}
