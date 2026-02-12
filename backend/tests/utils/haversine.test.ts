import { calculateDistance, milesToMeters, metersToMiles, getBoundingBox } from '../../src/utils/haversine';

describe('Haversine Utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points in miles', () => {
      // San Francisco to Los Angeles (~380 miles)
      const sf = { latitude: 37.7749, longitude: -122.4194 };
      const la = { latitude: 34.0522, longitude: -118.2437 };

      const distance = calculateDistance(sf, la, 'miles');

      expect(distance).toBeGreaterThan(340);
      expect(distance).toBeLessThan(400);
    });

    it('should calculate distance between two points in km', () => {
      // San Francisco to Los Angeles (~612 km)
      const sf = { latitude: 37.7749, longitude: -122.4194 };
      const la = { latitude: 34.0522, longitude: -118.2437 };

      const distance = calculateDistance(sf, la, 'km');

      expect(distance).toBeGreaterThan(550);
      expect(distance).toBeLessThan(650);
    });

    it('should return 0 for same point', () => {
      const point = { latitude: 37.7749, longitude: -122.4194 };

      const distance = calculateDistance(point, point);

      expect(distance).toBe(0);
    });

    it('should handle points across the equator', () => {
      const north = { latitude: 10, longitude: 0 };
      const south = { latitude: -10, longitude: 0 };

      const distance = calculateDistance(north, south, 'miles');

      expect(distance).toBeGreaterThan(1350);
      expect(distance).toBeLessThan(1400);
    });
  });

  describe('milesToMeters', () => {
    it('should convert miles to meters', () => {
      expect(milesToMeters(1)).toBeCloseTo(1609.34, 0);
      expect(milesToMeters(10)).toBeCloseTo(16093.4, 0);
    });
  });

  describe('metersToMiles', () => {
    it('should convert meters to miles', () => {
      expect(metersToMiles(1609.34)).toBeCloseTo(1, 2);
      expect(metersToMiles(16093.4)).toBeCloseTo(10, 1);
    });
  });

  describe('getBoundingBox', () => {
    it('should create a bounding box around a point', () => {
      const center = { latitude: 37.7749, longitude: -122.4194 };
      const radius = 10; // miles

      const bbox = getBoundingBox(center, radius);

      expect(bbox.minLat).toBeLessThan(center.latitude);
      expect(bbox.maxLat).toBeGreaterThan(center.latitude);
      expect(bbox.minLng).toBeLessThan(center.longitude);
      expect(bbox.maxLng).toBeGreaterThan(center.longitude);
    });

    it('should create a larger box for larger radius', () => {
      const center = { latitude: 37.7749, longitude: -122.4194 };

      const smallBox = getBoundingBox(center, 10);
      const largeBox = getBoundingBox(center, 50);

      const smallLatRange = smallBox.maxLat - smallBox.minLat;
      const largeLatRange = largeBox.maxLat - largeBox.minLat;

      expect(largeLatRange).toBeGreaterThan(smallLatRange);
    });
  });
});
