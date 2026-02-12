import { createTeeTimeSchema, updateTeeTimeSchema, joinTeeTimeSchema } from '../../src/validators/teeTime';

describe('TeeTime Validators', () => {
  describe('createTeeTimeSchema', () => {
    it('should validate valid tee time creation data', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const data = {
        courseId: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
        dateTime: futureDate.toISOString(),
        totalSlots: 4,
        industryPreference: ['TECHNOLOGY', 'FINANCE'],
        skillPreference: ['INTERMEDIATE'],
        notes: 'Looking forward to playing!',
      };

      const result = createTeeTimeSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('should reject past date times', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const data = {
        courseId: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
        dateTime: pastDate.toISOString(),
      };

      const result = createTeeTimeSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Tee time must be in the future');
      }
    });

    it('should reject invalid slot counts', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const data = {
        courseId: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
        dateTime: futureDate.toISOString(),
        totalSlots: 5, // Max is 4
      };

      const result = createTeeTimeSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should apply defaults for optional fields', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const data = {
        courseId: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
        dateTime: futureDate.toISOString(),
      };

      const result = createTeeTimeSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalSlots).toBe(4);
        expect(result.data.industryPreference).toEqual([]);
        expect(result.data.skillPreference).toEqual([]);
      }
    });
  });

  describe('updateTeeTimeSchema', () => {
    it('should allow partial updates', () => {
      const data = {
        notes: 'Updated notes',
      };

      const result = updateTeeTimeSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('should allow status changes', () => {
      const data = {
        status: 'CANCELLED',
      };

      const result = updateTeeTimeSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const data = {
        status: 'INVALID_STATUS',
      };

      const result = updateTeeTimeSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('joinTeeTimeSchema', () => {
    it('should accept valid slot number', () => {
      const data = {
        slotNumber: 2,
      };

      const result = joinTeeTimeSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const data = {};

      const result = joinTeeTimeSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('should reject invalid slot numbers', () => {
      const data = {
        slotNumber: 5, // Max is 4
      };

      const result = joinTeeTimeSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });
});
