'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { DemoFeatures } from '@/components/demo';
import { ErrorBoundary } from '@/components/error-boundary';
import { ThemeProvider } from '@/components/theme';
import { registerServiceWorker } from '@/lib/offline';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  // Register service worker for PWA support
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <ErrorBoundary>
            <OfflineIndicator />
            {children}
            {/* Demo-specific features: activity feed, tour modal, showcase mode */}
            <DemoFeatures />
          </ErrorBoundary>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
