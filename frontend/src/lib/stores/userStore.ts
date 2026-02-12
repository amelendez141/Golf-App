import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, CourseSearchResult } from '../types';

interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  lastUpdated: string;
}

interface UserState {
  currentUser: User | null;
  location: UserLocation | null;
  recentCourses: CourseSearchResult[];
  isLoadingLocation: boolean;
  locationError: string | null;
  setCurrentUser: (user: User | null) => void;
  setLocation: (location: UserLocation) => void;
  setLocationLoading: (loading: boolean) => void;
  setLocationError: (error: string | null) => void;
  addRecentCourse: (course: CourseSearchResult) => void;
  clearRecentCourses: () => void;
  requestLocation: () => Promise<void>;
}

const MAX_RECENT_COURSES = 5;

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      location: null,
      recentCourses: [],
      isLoadingLocation: false,
      locationError: null,

      setCurrentUser: (user) => set({ currentUser: user }),

      setLocation: (location) =>
        set({
          location,
          isLoadingLocation: false,
          locationError: null,
        }),

      setLocationLoading: (isLoadingLocation) => set({ isLoadingLocation }),

      setLocationError: (locationError) =>
        set({ locationError, isLoadingLocation: false }),

      addRecentCourse: (course) =>
        set((state) => {
          const filtered = state.recentCourses.filter((c) => c.id !== course.id);
          return {
            recentCourses: [course, ...filtered].slice(0, MAX_RECENT_COURSES),
          };
        }),

      clearRecentCourses: () => set({ recentCourses: [] }),

      requestLocation: async () => {
        const { setLocation, setLocationLoading, setLocationError } = get();

        if (!navigator.geolocation) {
          setLocationError('Geolocation is not supported by your browser');
          return;
        }

        setLocationLoading(true);

        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes
              });
            }
          );

          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            lastUpdated: new Date().toISOString(),
          });
        } catch (error) {
          if (error instanceof GeolocationPositionError) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                setLocationError('Location permission denied');
                break;
              case error.POSITION_UNAVAILABLE:
                setLocationError('Location unavailable');
                break;
              case error.TIMEOUT:
                setLocationError('Location request timed out');
                break;
              default:
                setLocationError('Failed to get location');
            }
          } else {
            setLocationError('Failed to get location');
          }
        }
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        location: state.location,
        recentCourses: state.recentCourses,
      }),
    }
  )
);
