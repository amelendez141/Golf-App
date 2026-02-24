'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { CourseBottomSheet } from '@/components/map/CourseBottomSheet';
import { MapFilterChips, type MapFilters } from '@/components/map/MapFilterChips';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCourseSearch, useNearbyCourses } from '@/hooks/useCourseSearch';
import { useUserStore } from '@/lib/stores/userStore';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { MapMarker, MapBounds, Course } from '@/lib/types';

// Dynamically import the map to avoid SSR issues
const CourseMap = dynamic(
  () => import('@/components/map/CourseMap').then((mod) => mod.CourseMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-primary/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
          </div>
          <p className="text-text-muted text-sm">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export default function ExplorePage() {
  const router = useRouter();
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [mapFilters, setMapFilters] = useState<MapFilters>({
    courseType: 'all',
    availability: 'all',
    price: 'all',
  });
  const { location, isLoadingLocation, requestLocation } = useUserStore();

  const { query, setQuery, results: searchResults, isLoading: isSearching } = useCourseSearch();

  const { data: nearbyCourses } = useNearbyCourses(
    location?.lat,
    location?.lng,
    50 // Increased radius
  );

  // Load all courses on mount (fallback when no location)
  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await api.getCourses({ limit: 100 });
        if (response.success && response.data) {
          setAllCourses(response.data);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    }
    loadCourses();
  }, []);

  // Use nearby courses if available, otherwise fall back to all courses
  const coursesToShow = nearbyCourses?.data?.length ? nearbyCourses.data : allCourses;

  // Convert courses to map markers
  const markers: MapMarker[] = coursesToShow.map((course: any) => ({
    id: course.id,
    lat: course.latitude,
    lng: course.longitude,
    course,
    openSlots: Math.floor(Math.random() * 4), // Mock data
    teeTimeCount: Math.floor(Math.random() * 5) + 1, // Mock data
  }));

  // Filter markers based on mapFilters
  const filteredMarkers = useMemo(() => {
    return markers.filter((marker) => {
      const { course, openSlots } = marker;

      // Filter by course type
      if (mapFilters.courseType !== 'all') {
        // Convert filter value to match CourseType enum (e.g., 'public' -> 'PUBLIC', 'semi-private' -> 'SEMI_PRIVATE')
        const filterTypeUppercase = mapFilters.courseType.toUpperCase().replace('-', '_');
        if (course.courseType !== filterTypeUppercase) {
          return false;
        }
      }

      // Filter by availability
      if (mapFilters.availability !== 'all') {
        if (mapFilters.availability === 'available') {
          // 'available' means there are open slots
          if (openSlots <= 0) {
            return false;
          }
        } else if (mapFilters.availability === 'today') {
          // TODO: Filter by tee times happening today
          // For now, just check if there are open slots (placeholder logic)
          if (openSlots <= 0) {
            return false;
          }
        } else if (mapFilters.availability === 'tomorrow') {
          // TODO: Filter by tee times happening tomorrow
          // For now, just check if there are open slots (placeholder logic)
          if (openSlots <= 0) {
            return false;
          }
        }
      }

      // Filter by price (greenFee is in cents)
      if (mapFilters.price !== 'all') {
        const greenFee = course.greenFee ?? 0;
        switch (mapFilters.price) {
          case '$':
            // Under $50 = under 5000 cents
            if (greenFee >= 5000) return false;
            break;
          case '$$':
            // $50-100 = 5000-10000 cents
            if (greenFee < 5000 || greenFee >= 10000) return false;
            break;
          case '$$$':
            // $100-200 = 10000-20000 cents
            if (greenFee < 10000 || greenFee >= 20000) return false;
            break;
          case '$$$$':
            // $200+ = 20000+ cents
            if (greenFee < 20000) return false;
            break;
        }
      }

      return true;
    });
  }, [markers, mapFilters]);

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    setSelectedMarker(marker);
  }, []);

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  const handleNearMeClick = useCallback(() => {
    requestLocation();
  }, [requestLocation]);

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] relative">
      {/* Map */}
      <CourseMap
        markers={filteredMarkers}
        onMarkerClick={handleMarkerClick}
        onBoundsChange={handleBoundsChange}
        initialCenter={location ? { lat: location.lat, lng: location.lng } : undefined}
        selectedMarkerId={selectedMarker?.id}
        className="h-full w-full"
      />

      {/* Search overlay - mobile optimized */}
      <div className="absolute top-3 sm:top-4 left-3 right-3 sm:left-4 sm:right-4 lg:left-auto lg:right-4 lg:w-96 z-10">
        <div className="bg-card rounded-xl shadow-lg p-2.5 sm:p-3 space-y-2 sm:space-y-3">
          <Input
            placeholder="Search courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<SearchIcon className="h-5 w-5" />}
            inputSize="lg"
            className="touch-manipulation"
          />

          {/* Search results dropdown with animation */}
          <AnimatePresence>
            {query.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{ originY: 0 }}
                className="bg-card border border-primary/5 rounded-lg divide-y divide-primary/5 max-h-60 overflow-auto"
              >
                {isSearching ? (
                  <div className="p-3 text-center text-text-muted text-sm">
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      Searching...
                    </motion.span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-center text-text-muted text-sm">
                    No courses found
                  </div>
                ) : (
                  searchResults.map((course, index) => (
                    <motion.button
                      key={course.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="w-full p-3 text-left hover:bg-primary/5 transition-colors"
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        // Navigate to course detail page
                        router.push(`/course/${course.slug}`);
                        setQuery('');
                      }}
                    >
                      <p className="font-medium text-primary text-sm">
                        {course.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {course.city}, {course.state}
                      </p>
                    </motion.button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filter chips - positioned on map with horizontal scroll on mobile */}
      <div className="absolute top-[72px] sm:top-20 lg:top-4 left-0 right-0 sm:left-4 sm:right-4 lg:left-[420px] lg:right-auto z-10 px-3 sm:px-0">
        <MapFilterChips filters={mapFilters} onChange={setMapFilters} />
      </div>

      {/* Near me button - positioned above bottom nav on mobile */}
      <div className="absolute bottom-28 sm:bottom-24 lg:bottom-6 right-3 sm:right-4 z-10">
        <Button
          variant="secondary"
          size="icon-lg"
          onClick={handleNearMeClick}
          isLoading={isLoadingLocation}
          className="shadow-lg h-14 w-14 touch-manipulation"
          aria-label="Find courses near me"
        >
          <LocationIcon className="h-6 w-6" />
        </Button>
      </div>

      {/* Legend - hidden on mobile to save space, shown as tooltip elsewhere */}
      <div className="absolute bottom-28 sm:bottom-24 lg:bottom-6 left-3 sm:left-4 z-10 hidden sm:block">
        <div className="bg-card rounded-lg shadow-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-text-secondary">Open tee times</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-text-secondary">No availability</span>
          </div>
        </div>
      </div>

      {/* Course panel (desktop) */}
      <AnimatePresence>
        {selectedMarker && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="hidden lg:block absolute top-4 left-4 z-10 w-80"
          >
            <div className="bg-card rounded-xl shadow-lg overflow-hidden">
              <CoursePanelContent marker={selectedMarker} onClose={handleCloseSheet} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom sheet (mobile) */}
      <CourseBottomSheet marker={selectedMarker} onClose={handleCloseSheet} />
    </div>
  );
}

function CoursePanelContent({
  marker,
  onClose,
}: {
  marker: MapMarker;
  onClose: () => void;
}) {
  const { course, openSlots, teeTimeCount } = marker;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif font-semibold text-primary">
            {course.name}
          </h3>
          <p className="text-sm text-text-muted">
            {course.city}, {course.state}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-primary/5 transition-colors"
        >
          <CloseIcon className="h-5 w-5 text-text-muted" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              openSlots > 0 ? 'bg-success' : 'bg-gray-300'
            )}
          />
          <span className="text-sm">
            {teeTimeCount} tee {teeTimeCount === 1 ? 'time' : 'times'}
          </span>
        </div>
        {openSlots > 0 && (
          <span className="text-sm text-success font-medium">
            {openSlots} {openSlots === 1 ? 'spot' : 'spots'} open
          </span>
        )}
      </div>

      <Button variant="primary" fullWidth>
        View Tee Times
      </Button>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
