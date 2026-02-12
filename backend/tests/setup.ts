/**
 * Jest Test Setup
 *
 * This file configures the test environment before each test suite runs.
 * It sets up mock environment variables and configures global test settings.
 */

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3002';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/linkup_golf_test';
process.env.REDIS_URL = ''; // Disable Redis in tests - it will gracefully skip
process.env.CLERK_SECRET_KEY = 'sk_test_mock_clerk_secret_key';
process.env.CLERK_WEBHOOK_SECRET = 'whsec_mock_webhook_secret';
process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_mock_publishable_key';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.LOG_LEVEL = 'error'; // Reduce noise in tests

// Mock Redis module to prevent connection attempts
jest.mock('../src/config/redis', () => ({
  redis: null,
  redisPub: null,
  redisSub: null,
  connectRedis: jest.fn().mockResolvedValue(undefined),
  disconnectRedis: jest.fn().mockResolvedValue(undefined),
}));

// Increase timeout for integration tests
jest.setTimeout(30000);

// Suppress console output during tests unless debugging
if (!process.env.DEBUG_TESTS) {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  // Keep console.error for debugging test failures
}

// Global test utilities
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Extend Jest matchers types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}

// Clean up after all tests
afterAll(async () => {
  // Allow time for any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 100));
});
