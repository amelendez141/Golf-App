/**
 * Error Classes Unit Tests
 *
 * Tests the custom error classes used throughout the application.
 */

import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  SlotUnavailableError,
  TeeTimeFullError,
  AlreadyJoinedError,
} from '../../src/utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with all properties', () => {
      const error = new AppError('Test error', 500, 'TEST_CODE', true);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('TEST_CODE');
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should use default values', () => {
      const error = new AppError('Simple error');

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.isOperational).toBe(true);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Stack test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('BadRequestError', () => {
    it('should create 400 error', () => {
      const error = new BadRequestError();

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('Bad request');
    });

    it('should accept custom message and code', () => {
      const error = new BadRequestError('Invalid input', 'INVALID_INPUT');

      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('INVALID_INPUT');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create 401 error', () => {
      const error = new UnauthorizedError();

      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Unauthorized');
    });

    it('should accept custom message', () => {
      const error = new UnauthorizedError('Token expired');

      expect(error.message).toBe('Token expired');
    });
  });

  describe('ForbiddenError', () => {
    it('should create 403 error', () => {
      const error = new ForbiddenError();

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('Forbidden');
    });

    it('should accept custom message', () => {
      const error = new ForbiddenError('Access denied');

      expect(error.message).toBe('Access denied');
    });
  });

  describe('NotFoundError', () => {
    it('should create 404 error', () => {
      const error = new NotFoundError();

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
    });

    it('should accept custom message', () => {
      const error = new NotFoundError('User not found');

      expect(error.message).toBe('User not found');
    });
  });

  describe('ConflictError', () => {
    it('should create 409 error', () => {
      const error = new ConflictError();

      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
      expect(error.message).toBe('Resource conflict');
    });

    it('should accept custom message', () => {
      const error = new ConflictError('Resource already exists');

      expect(error.message).toBe('Resource already exists');
    });
  });

  describe('ValidationError', () => {
    it('should create 400 error with validation details', () => {
      const errors = {
        email: ['Email is required', 'Email must be valid'],
        password: ['Password is too short'],
      };

      const error = new ValidationError(errors);

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Validation failed');
      expect(error.errors).toEqual(errors);
    });

    it('should accept custom message', () => {
      const error = new ValidationError(
        { field: ['error'] },
        'Custom validation message'
      );

      expect(error.message).toBe('Custom validation message');
    });
  });

  describe('RateLimitError', () => {
    it('should create 429 error', () => {
      const error = new RateLimitError();

      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.message).toBe('Too many requests');
      expect(error.retryAfter).toBe(60);
    });

    it('should accept custom retry after', () => {
      const error = new RateLimitError(120);

      expect(error.retryAfter).toBe(120);
    });

    it('should accept custom message', () => {
      const error = new RateLimitError(30, 'Slow down please');

      expect(error.message).toBe('Slow down please');
      expect(error.retryAfter).toBe(30);
    });
  });

  describe('SlotUnavailableError', () => {
    it('should create 409 error', () => {
      const error = new SlotUnavailableError();

      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('SLOT_UNAVAILABLE');
      expect(error.message).toBe('Slot is no longer available');
    });

    it('should accept custom message', () => {
      const error = new SlotUnavailableError('Slot was taken');

      expect(error.message).toBe('Slot was taken');
    });
  });

  describe('TeeTimeFullError', () => {
    it('should create 409 error', () => {
      const error = new TeeTimeFullError();

      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('TEE_TIME_FULL');
      expect(error.message).toBe('Tee time is full');
    });

    it('should accept custom message', () => {
      const error = new TeeTimeFullError('No slots available');

      expect(error.message).toBe('No slots available');
    });
  });

  describe('AlreadyJoinedError', () => {
    it('should create 409 error', () => {
      const error = new AlreadyJoinedError();

      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('ALREADY_JOINED');
      expect(error.message).toBe('You have already joined this tee time');
    });

    it('should accept custom message', () => {
      const error = new AlreadyJoinedError('Already a participant');

      expect(error.message).toBe('Already a participant');
    });
  });

  describe('Error inheritance', () => {
    it('should all inherit from AppError', () => {
      const errors = [
        new BadRequestError(),
        new UnauthorizedError(),
        new ForbiddenError(),
        new NotFoundError(),
        new ConflictError(),
        new ValidationError({}),
        new RateLimitError(),
        new SlotUnavailableError(),
        new TeeTimeFullError(),
        new AlreadyJoinedError(),
      ];

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(AppError);
        expect(error).toBeInstanceOf(Error);
        expect(error.isOperational).toBe(true);
      });
    });
  });

  describe('Error throwing and catching', () => {
    it('should be catchable as Error', () => {
      expect(() => {
        throw new NotFoundError('Test');
      }).toThrow(Error);
    });

    it('should be catchable as AppError', () => {
      expect(() => {
        throw new NotFoundError('Test');
      }).toThrow(AppError);
    });

    it('should be catchable as specific type', () => {
      expect(() => {
        throw new NotFoundError('Test');
      }).toThrow(NotFoundError);
    });
  });
});
