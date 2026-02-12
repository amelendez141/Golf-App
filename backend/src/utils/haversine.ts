const EARTH_RADIUS_MILES = 3958.8;
const EARTH_RADIUS_KM = 6371;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates,
  unit: 'miles' | 'km' = 'miles'
): number {
  const radius = unit === 'miles' ? EARTH_RADIUS_MILES : EARTH_RADIUS_KM;

  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);
  const deltaLat = toRadians(point2.latitude - point1.latitude);
  const deltaLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radius * c;
}

export function milesToMeters(miles: number): number {
  return miles * 1609.34;
}

export function metersToMiles(meters: number): number {
  return meters / 1609.34;
}

export function getBoundingBox(
  center: Coordinates,
  radiusMiles: number
): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  const latDelta = radiusMiles / 69.0;
  const lngDelta = radiusMiles / (69.0 * Math.cos(toRadians(center.latitude)));

  return {
    minLat: center.latitude - latDelta,
    maxLat: center.latitude + latDelta,
    minLng: center.longitude - lngDelta,
    maxLng: center.longitude + lngDelta,
  };
}
