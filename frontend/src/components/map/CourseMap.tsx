/**
 * ============================================================================
 * COURSE MAP - Interactive Golf Course Map
 * ============================================================================
 *
 * Uses Leaflet with OpenStreetMap tiles - completely free, no API key required!
 *
 * Features:
 * - Interactive pan and zoom
 * - Custom course markers
 * - Popups with course info
 * - Geolocation support
 * - Mobile-friendly touch controls
 *
 * ============================================================================
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants';
import type { MapMarker as MapMarkerType } from '@/lib/types';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const ZoomControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ZoomControl),
  { ssr: false }
);

interface CourseMapProps {
  markers?: MapMarkerType[];
  onMarkerClick?: (marker: MapMarkerType) => void;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  selectedMarkerId?: string;
  className?: string;
}

// Custom hook to handle map events
function MapEvents({
  onBoundsChange,
  markers,
  selectedMarkerId,
  mapRef
}: {
  onBoundsChange?: CourseMapProps['onBoundsChange'];
  markers: MapMarkerType[];
  selectedMarkerId?: string;
  mapRef: React.MutableRefObject<L.Map | null>;
}) {
  const { useMapEvents, useMap } = require('react-leaflet');

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

export function CourseMap({
  markers = [],
  onMarkerClick,
  onBoundsChange,
  initialCenter,
  initialZoom,
  selectedMarkerId,
  className,
}: CourseMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const [customIcon, setCustomIcon] = useState<L.Icon | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<L.Icon | null>(null);

  // Only render map on client side
  useEffect(() => {
    setIsMounted(true);

    // Create custom icons after mounting (Leaflet requires window)
    if (typeof window !== 'undefined') {
      const L = require('leaflet');

      // Fix for default marker icons in Leaflet with webpack/Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Custom green marker for courses with availability
      const greenIcon = new L.Icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
            <path fill="#1B3A2D" d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24C24 5.4 18.6 0 12 0z"/>
            <circle fill="#C4A265" cx="12" cy="12" r="6"/>
          </svg>
        `),
        iconSize: [24, 36],
        iconAnchor: [12, 36],
        popupAnchor: [0, -36],
      });

      // Selected marker (larger, highlighted)
      const selectedMarkerIcon = new L.Icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48" width="32" height="48">
            <path fill="#C4A265" d="M16 0C7.2 0 0 7.2 0 16c0 9.6 16 32 16 32s16-22.4 16-32C32 7.2 24.8 0 16 0z"/>
            <circle fill="#1B3A2D" cx="16" cy="16" r="8"/>
            <circle fill="#fff" cx="16" cy="16" r="4"/>
          </svg>
        `),
        iconSize: [32, 48],
        iconAnchor: [16, 48],
        popupAnchor: [0, -48],
      });

      setCustomIcon(greenIcon);
      setSelectedIcon(selectedMarkerIcon);
    }
  }, []);

  const center = initialCenter
    ? [initialCenter.lat, initialCenter.lng] as [number, number]
    : [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng] as [number, number];

  const zoom = initialZoom || DEFAULT_MAP_ZOOM;

  // Loading state
  if (!isMounted) {
    return (
      <div className={cn('flex items-center justify-center bg-secondary', className)}>
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <svg
              className="w-8 h-8 text-primary/60"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
              />
            </svg>
          </div>
          <p className="text-text-muted">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Import Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        integrity="sha512-h9FcoyWjHcOcmEVkxOfTLnmZFWIH0iZhZT1H2TbOq55xssQGEJHEaIm+PgoUaZbRvQTNTluNOEfb1ZRy6D3BOw=="
        crossOrigin="anonymous"
      />

      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
        className="z-0"
      >
        {/* OpenStreetMap tiles - free and open source */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Zoom controls */}
        <ZoomControl position="topright" />

        {/* Map event handler */}
        <MapEvents
          onBoundsChange={onBoundsChange}
          markers={markers}
          selectedMarkerId={selectedMarkerId}
          mapRef={mapRef}
        />

        {/* Course markers */}
        {markers.map((marker) => {
          const isSelected = marker.id === selectedMarkerId;
          const icon = isSelected ? selectedIcon : customIcon;

          return (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={icon || undefined}
              eventHandlers={{
                click: () => onMarkerClick?.(marker),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-semibold text-primary text-sm mb-1">
                    {marker.course.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {marker.course.city}, {marker.course.state}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full',
                      marker.openSlots > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      {marker.teeTimeCount} tee {marker.teeTimeCount === 1 ? 'time' : 'times'}
                    </span>
                    {marker.openSlots > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        {marker.openSlots} open
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Geolocation button */}
      <button
        onClick={() => {
          if (navigator.geolocation && mapRef.current) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                mapRef.current?.flyTo(
                  [position.coords.latitude, position.coords.longitude],
                  13,
                  { duration: 1 }
                );
              },
              (error) => {
                console.error('Geolocation error:', error);
              }
            );
          }
        }}
        className="absolute bottom-24 right-4 z-[1000] bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Go to my location"
      >
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      </button>
    </div>
  );
}
