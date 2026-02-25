'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { FeedFilters, TeeTime, ApiResponse } from '@/lib/types';

export function useTeeTimeFeed(filters: FeedFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['teeTimeFeed', filters],
    queryFn: async ({ pageParam }) => {
      const response = await api.getTeeTimeFeed(filters, pageParam as string | undefined);
      return response;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination?.nextCursor ?? undefined,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useTeeTimeById(id: string) {
  return useQuery({
    queryKey: ['teeTime', id],
    queryFn: async () => {
      const response = await api.getTeeTime(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useRecommendedTeeTimes() {
  return useQuery({
    queryKey: ['recommendedTeeTimes'],
    queryFn: async () => {
      const response = await api.getRecommendedTeeTimes();
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });
}
