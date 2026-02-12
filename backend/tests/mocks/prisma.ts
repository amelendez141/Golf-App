/**
 * Prisma Mock for Unit Testing
 *
 * This module provides a mock implementation of the Prisma client for unit testing.
 * It uses Jest's mocking capabilities to create type-safe mocks of all Prisma models.
 */

// Type for mock function return type
type MockFn = jest.Mock<any, any>;

// Create mock model methods
function createModelMock() {
  return {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  };
}

// Create the mock Prisma client
export const prismaMock = {
  user: createModelMock(),
  course: createModelMock(),
  teeTime: createModelMock(),
  teeTimeSlot: createModelMock(),
  message: createModelMock(),
  notification: createModelMock(),
  favoriteCourse: createModelMock(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
};

// Reset all mocks
export function resetPrismaMock() {
  Object.values(prismaMock).forEach((model) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method) => {
        if (typeof method === 'function' && 'mockReset' in method) {
          (method as MockFn).mockReset();
        }
      });
    } else if (typeof model === 'function' && 'mockReset' in model) {
      (model as MockFn).mockReset();
    }
  });
}

/**
 * Helper function to setup common prisma mock behaviors
 */
export function setupPrismaMock() {
  // Mock $transaction to execute the callback with the mock client
  prismaMock.$transaction.mockImplementation(async (callback: any) => {
    if (typeof callback === 'function') {
      return callback(prismaMock);
    }
    return Promise.all(callback);
  });

  return prismaMock;
}

// Export type for use in tests
export type PrismaMockType = typeof prismaMock;
