'use client';

import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import type { MapMarker as MapMarkerType } from '@/lib/types';

interface MapEventsHelperProps {
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  markers: MapMarkerType[];
  selectedMarkerId?: string;
  mapRef: React.MutableRefObject<LeafletMap | null>;
}

export function MapEventsHelper({
  onBoundsChange,
  markers,
  selectedMarkerId,
  mapRef
}: MapEventsHelperProps) {
  const map = useMap();
  mapRef.current = map;

  useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }
    },
  });

  // Fly to selected marker
  useEffect(() => {
    if (selectedMarkerId && map) {
      const marker = markers.find((m) => m.id === selectedMarkerId);
      if (marker) {
        map.flyTo([marker.lat, marker.lng], 14, { duration: 1 });
      }
    }
  }, [selectedMarkerId, markers, map]);

  return null;
}
