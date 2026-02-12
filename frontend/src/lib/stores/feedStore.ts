import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FeedFilters, Industry, SkillLevel } from '../types';

interface FeedState {
  filters: FeedFilters;
  viewMode: 'list' | 'compact';
  sortBy: 'date' | 'distance' | 'slots';
  setFilters: (filters: Partial<FeedFilters>) => void;
  setIndustry: (industry?: Industry) => void;
  setSkillLevel: (skillLevel?: SkillLevel) => void;
  setDateRange: (fromDate?: string, toDate?: string) => void;
  setLocation: (latitude: number, longitude: number, radius?: number) => void;
  clearFilters: () => void;
  setViewMode: (mode: 'list' | 'compact') => void;
  setSortBy: (sort: 'date' | 'distance' | 'slots') => void;
}

const defaultFilters: FeedFilters = {
  industry: undefined,
  skillLevel: undefined,
  fromDate: undefined,
  toDate: undefined,
  courseId: undefined,
  latitude: undefined,
  longitude: undefined,
  radius: 50,
  hasAvailableSlots: true,
};

export const useFeedStore = create<FeedState>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      viewMode: 'list',
      sortBy: 'date',

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      setIndustry: (industry) =>
        set((state) => ({
          filters: { ...state.filters, industry },
        })),

      setSkillLevel: (skillLevel) =>
        set((state) => ({
          filters: { ...state.filters, skillLevel },
        })),

      setDateRange: (fromDate, toDate) =>
        set((state) => ({
          filters: { ...state.filters, fromDate, toDate },
        })),

      setLocation: (latitude, longitude, radius = 50) =>
        set((state) => ({
          filters: { ...state.filters, latitude, longitude, radius },
        })),

      clearFilters: () =>
        set(() => ({
          filters: defaultFilters,
        })),

      setViewMode: (viewMode) => set({ viewMode }),

      setSortBy: (sortBy) => set({ sortBy }),
    }),
    {
      name: 'feed-store',
      partialize: (state) => ({
        filters: {
          industry: state.filters.industry,
          skillLevel: state.filters.skillLevel,
          radius: state.filters.radius,
          hasAvailableSlots: state.filters.hasAvailableSlots,
        },
        viewMode: state.viewMode,
        sortBy: state.sortBy,
      }),
    }
  )
);
