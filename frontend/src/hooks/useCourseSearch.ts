'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CourseSearchResult } from '@/lib/types';
import { debounce } from '@/lib/utils';

export function useCourseSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce the query
  const debouncedSetQuery = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSetQuery(query);
  }, [query, debouncedSetQuery]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['courseSearch', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return { data: [] };
      }
      return api.searchCourses(debouncedQuery);
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });

  return {
    query,
    setQuery,
    results: (data?.data || []) as CourseSearchResult[],
    isLoading: isLoading && debouncedQuery.length >= 2,
    error,
    hasResults: (data?.data?.length || 0) > 0,
    isEmpty: debouncedQuery.length >= 2 && !isLoading && (data?.data?.length || 0) === 0,
  };
}

export function useNearbyCourses(lat?: number, lng?: number, radius = 25) {
  return useQuery({
    queryKey: ['nearbyCourses', lat, lng, radius],
    queryFn: async () => {
      if (lat === undefined || lng === undefined) {
        return { data: [] };
      }
      return api.getNearbyCourses(lat, lng, radius);
    },
    enabled: lat !== undefined && lng !== undefined,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const response = await api.getCourse(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
}

export function useCourseBySlug(slug: string) {
  return useQuery({
    queryKey: ['courseBySlug', slug],
    queryFn: async () => {
      const response = await api.getCourseBySlug(slug);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 300000, // 5 minutes
  });
}
