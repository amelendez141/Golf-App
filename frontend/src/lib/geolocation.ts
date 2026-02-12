export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';
  message: string;
}

export type GeolocationResult =
  | { success: true; position: GeolocationPosition }
  | { success: false; error: GeolocationError };

export async function getCurrentPosition(): Promise<GeolocationResult> {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    return {
      success: false,
      error: {
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by your browser',
      },
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          position: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        });
      },
      (error) => {
        let code: GeolocationError['code'];
        let message: string;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            code = 'PERMISSION_DENIED';
            message = 'Location access was denied. Please enable location in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            code = 'POSITION_UNAVAILABLE';
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            code = 'TIMEOUT';
            message = 'The request to get your location timed out.';
            break;
          default:
            code = 'POSITION_UNAVAILABLE';
            message = 'An unknown error occurred.';
        }

        resolve({
          success: false,
          error: { code, message },
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

// Watch position for continuous updates
export function watchPosition(
  onSuccess: (position: GeolocationPosition) => void,
  onError: (error: GeolocationError) => void
): () => void {
  if (!navigator.geolocation) {
    onError({
      code: 'NOT_SUPPORTED',
      message: 'Geolocation is not supported by your browser',
    });
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    (error) => {
      let code: GeolocationError['code'];
      let message: string;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          code = 'PERMISSION_DENIED';
          message = 'Location access was denied.';
          break;
        case error.POSITION_UNAVAILABLE:
          code = 'POSITION_UNAVAILABLE';
          message = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          code = 'TIMEOUT';
          message = 'Location request timed out.';
          break;
        default:
          code = 'POSITION_UNAVAILABLE';
          message = 'An unknown error occurred.';
      }

      onError({ code, message });
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000, // 1 minute
    }
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

// Calculate distance between two points (in miles)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
