'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Map, { NavigationControl, GeolocateControl } from 'react-map-gl';
import type { MapRef, ViewStateChangeEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils';
import { CourseMarker } from './CourseMarker';
import { MapPopup } from './MapPopup';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants';
import type { MapMarker as MapMarkerType, Course } from '@/lib/types';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface CourseMapProps {
  markers?: MapMarkerType[];
  onMarkerClick?: (marker: MapMarkerType) => void;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  selectedMarkerId?: string;
  className?: string;
}

export function CourseMap({
  markers = [],
  onMarkerClick,
  onBoundsChange,
  initialCenter,
  initialZoom,
  selectedMarkerId,
  className,
}: CourseMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupMarker, setPopupMarker] = useState<MapMarkerType | null>(null);

  const [viewState, setViewState] = useState({
    longitude: initialCenter?.lng || DEFAULT_MAP_CENTER.lng,
    latitude: initialCenter?.lat || DEFAULT_MAP_CENTER.lat,
    zoom: initialZoom || DEFAULT_MAP_ZOOM,
  });

  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  }, []);

  const handleMoveEnd = useCallback(() => {
    if (!mapRef.current || !onBoundsChange) return;

    const bounds = mapRef.current.getBounds();
    if (bounds) {
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    }
  }, [onBoundsChange]);

  const handleMarkerClick = useCallback(
    (marker: MapMarkerType) => {
      setPopupMarker(marker);
      onMarkerClick?.(marker);
    },
    [onMarkerClick]
  );

  const handlePopupClose = useCallback(() => {
    setPopupMarker(null);
  }, []);

  // Fly to selected marker
  useEffect(() => {
    if (selectedMarkerId && mapRef.current) {
      const marker = markers.find((m) => m.id === selectedMarkerId);
      if (marker) {
        mapRef.current.flyTo({
          center: [marker.lng, marker.lat],
          zoom: 14,
          duration: 1000,
        });
        setPopupMarker(marker);
      }
    }
  }, [selectedMarkerId, markers]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={cn('flex items-center justify-center bg-secondary', className)}>
        <p className="text-text-muted">Map unavailable - Mapbox token required</p>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        onMoveEnd={handleMoveEnd}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation
        />

        {/* Markers */}
        {markers.map((marker) => (
          <CourseMarker
            key={marker.id}
            marker={marker}
            isSelected={marker.id === popupMarker?.id}
            onClick={() => handleMarkerClick(marker)}
          />
        ))}

        {/* Popup */}
        {popupMarker && (
          <MapPopup marker={popupMarker} onClose={handlePopupClose} />
        )}
      </Map>
    </div>
  );
}
