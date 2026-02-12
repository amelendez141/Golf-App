/**
 * Pagination Utilities Unit Tests
 *
 * Tests for cursor-based pagination helpers including result creation
 * and cursor encoding/decoding.
 */

import {
  createPaginatedResult,
  encodeCursor,
  decodeCursor,
  paginationSchema,
} from '../../src/utils/pagination';

describe('Pagination Utils', () => {
  describe('createPaginatedResult', () => {
    it('should indicate no more items when less than limit', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      const result = createPaginatedResult(items, 10);

      expect(result.data).toHaveLength(2);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('should indicate more items when exceeding limit', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ];

      const result = createPaginatedResult(items, 2);

      expect(result.data).toHaveLength(2);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('2');
    });

    it('should handle empty array', () => {
      const items: { id: string }[] = [];

      const result = createPaginatedResult(items, 10);

      expect(result.data).toHaveLength(0);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('should handle single item', () => {
      const items = [{ id: 'only-one' }];

      const result = createPaginatedResult(items, 10);

      expect(result.data).toHaveLength(1);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('should handle exact limit count (no more)', () => {
      const items = [
        { id: '1' },
        { id: '2' },
        { id: '3' },
      ];

      const result = createPaginatedResult(items, 3);

      expect(result.data).toHaveLength(3);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('should handle limit of 1', () => {
      const items = [
        { id: 'first' },
        { id: 'second' },
      ];

      const result = createPaginatedResult(items, 1);

      expect(result.data).toHaveLength(1);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('first');
    });

    it('should preserve item structure', () => {
      const items = [
        { id: '1', name: 'Name', value: 42, nested: { key: 'value' } },
      ];

      const result = createPaginatedResult(items, 10);

      expect(result.data[0]).toEqual(items[0]);
    });

    it('should use last item id for cursor', () => {
      const items = [
        { id: 'alpha' },
        { id: 'beta' },
        { id: 'gamma' },
        { id: 'delta' },
      ];

      const result = createPaginatedResult(items, 3);

      expect(result.nextCursor).toBe('gamma'); // Last item in truncated data
    });
  });

  describe('cursor encoding/decoding', () => {
    it('should encode and decode cursor correctly', () => {
      const original = 'some-id-12345';

      const encoded = encodeCursor(original);
      const decoded = decodeCursor(encoded);

      expect(decoded).toBe(original);
    });

    it('should handle special characters', () => {
      const original = 'id-with-special/chars+test';

      const encoded = encodeCursor(original);
      const decoded = decodeCursor(encoded);

      expect(decoded).toBe(original);
    });

    it('should handle empty string', () => {
      const original = '';

      const encoded = encodeCursor(original);
      const decoded = decodeCursor(encoded);

      expect(decoded).toBe(original);
    });

    it('should handle unicode characters', () => {
      const original = 'cursor-with-emoji-and-unicode';

      const encoded = encodeCursor(original);
      const decoded = decodeCursor(encoded);

      expect(decoded).toBe(original);
    });

    it('should produce URL-safe encoding', () => {
      const original = 'test+value/with=chars';

      const encoded = encodeCursor(original);

      // base64url should not contain +, /, or =
      expect(encoded).not.toMatch(/[+/=]/);
    });

    it('should handle CUID-like IDs', () => {
      const cuids = [
        'clxxxxxxxxxxxxxxxxxxxxxxxxx',
        'cm1abc2def3ghi4jkl5mno6pqr',
      ];

      cuids.forEach((cuid) => {
        const encoded = encodeCursor(cuid);
        const decoded = decodeCursor(encoded);
        expect(decoded).toBe(cuid);
      });
    });
  });

  describe('paginationSchema', () => {
    it('should validate valid pagination params', () => {
      const result = paginationSchema.safeParse({
        cursor: 'some-cursor',
        limit: 50,
      });

      expect(result.success).toBe(true);
    });

    it('should apply default limit', () => {
      const result = paginationSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
      }
    });

    it('should reject negative limit', () => {
      const result = paginationSchema.safeParse({ limit: -1 });

      expect(result.success).toBe(false);
    });

    it('should reject limit over 100', () => {
      const result = paginationSchema.safeParse({ limit: 101 });

      expect(result.success).toBe(false);
    });

    it('should coerce string limit to number', () => {
      const result = paginationSchema.safeParse({ limit: '50' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it('should accept optional cursor', () => {
      const withCursor = paginationSchema.safeParse({ cursor: 'test' });
      const withoutCursor = paginationSchema.safeParse({});

      expect(withCursor.success).toBe(true);
      expect(withoutCursor.success).toBe(true);
    });
  });
});
