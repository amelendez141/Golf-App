/**
 * User Service Unit Tests
 *
 * Tests the user service which handles user management operations
 * including CRUD operations, Clerk synchronization, and data formatting.
 */

import { userService } from '../../src/services/userService';
import { userRepository } from '../../src/repositories/userRepository';
import { NotFoundError } from '../../src/utils/errors';
import { createMockUser, createMockUsers } from '../mocks/factories';
import type { User, Industry, SkillLevel } from '@prisma/client';

// Mock the userRepository
jest.mock('../../src/repositories/userRepository');

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return user when found', async () => {
      const mockUser = createMockUser({ id: 'user-123' });
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getById('user-123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
    });

    it('should throw NotFoundError when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getById('nonexistent')).rejects.toThrow(
        NotFoundError
      );
      await expect(userService.getById('nonexistent')).rejects.toThrow(
        'User not found'
      );
    });

    it('should propagate repository errors', async () => {
      mockUserRepository.findById.mockRejectedValue(new Error('DB Error'));

      await expect(userService.getById('user-123')).rejects.toThrow('DB Error');
    });
  });

  describe('getByClerkId', () => {
    it('should return user when found by Clerk ID', async () => {
      const mockUser = createMockUser({ clerkId: 'clerk-abc123' });
      mockUserRepository.findByClerkId.mockResolvedValue(mockUser);

      const result = await userService.getByClerkId('clerk-abc123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByClerkId).toHaveBeenCalledWith(
        'clerk-abc123'
      );
    });

    it('should throw NotFoundError when Clerk ID not found', async () => {
      mockUserRepository.findByClerkId.mockResolvedValue(null);

      await expect(
        userService.getByClerkId('nonexistent-clerk')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const existingUser = createMockUser({ id: 'user-123' });
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        company: 'New Company',
      };
      const updatedUser = { ...existingUser, ...updateData };

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.update('user-123', updateData);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          firstName: 'Updated',
          lastName: 'Name',
          company: 'New Company',
        })
      );
    });

    it('should throw NotFoundError when updating nonexistent user', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        userService.update('nonexistent', { firstName: 'Test' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should only include defined fields in update', async () => {
      const existingUser = createMockUser({ id: 'user-123' });
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(existingUser);

      await userService.update('user-123', { firstName: 'Only This' });

      expect(mockUserRepository.update).toHaveBeenCalledWith('user-123', {
        firstName: 'Only This',
      });
    });

    it('should handle all updatable fields', async () => {
      const existingUser = createMockUser({ id: 'user-123' });
      const fullUpdate = {
        firstName: 'John',
        lastName: 'Doe',
        industry: 'FINANCE' as Industry,
        company: 'Finance Corp',
        jobTitle: 'Analyst',
        bio: 'New bio',
        handicap: 10,
        skillLevel: 'ADVANCED' as SkillLevel,
        latitude: 40.7128,
        longitude: -74.006,
        city: 'New York',
        state: 'NY',
        searchRadius: 75,
      };

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue({ ...existingUser, ...fullUpdate });

      await userService.update('user-123', fullUpdate);

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining(fullUpdate)
      );
    });
  });

  describe('syncFromClerk', () => {
    it('should create new user from Clerk data', async () => {
      const newUser = createMockUser({
        clerkId: 'clerk-new',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        avatarUrl: 'https://example.com/avatar.jpg',
      });

      mockUserRepository.upsertByClerkId.mockResolvedValue(newUser);

      const result = await userService.syncFromClerk(
        'clerk-new',
        'new@example.com',
        'New',
        'User',
        'https://example.com/avatar.jpg'
      );

      expect(result).toEqual(newUser);
      expect(mockUserRepository.upsertByClerkId).toHaveBeenCalledWith(
        'clerk-new',
        {
          clerkId: 'clerk-new',
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
        {
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User',
          avatarUrl: 'https://example.com/avatar.jpg',
        }
      );
    });

    it('should handle null optional fields', async () => {
      const newUser = createMockUser({
        clerkId: 'clerk-minimal',
        email: 'minimal@example.com',
        firstName: null,
        lastName: null,
        avatarUrl: null,
      });

      mockUserRepository.upsertByClerkId.mockResolvedValue(newUser);

      await userService.syncFromClerk('clerk-minimal', 'minimal@example.com');

      expect(mockUserRepository.upsertByClerkId).toHaveBeenCalledWith(
        'clerk-minimal',
        {
          clerkId: 'clerk-minimal',
          email: 'minimal@example.com',
          firstName: null,
          lastName: null,
          avatarUrl: null,
        },
        {
          email: 'minimal@example.com',
          firstName: null,
          lastName: null,
          avatarUrl: null,
        }
      );
    });

    it('should handle undefined optional fields as null', async () => {
      const newUser = createMockUser();
      mockUserRepository.upsertByClerkId.mockResolvedValue(newUser);

      await userService.syncFromClerk(
        'clerk-id',
        'email@test.com',
        undefined,
        undefined,
        undefined
      );

      expect(mockUserRepository.upsertByClerkId).toHaveBeenCalledWith(
        'clerk-id',
        expect.objectContaining({
          firstName: null,
          lastName: null,
          avatarUrl: null,
        }),
        expect.objectContaining({
          firstName: null,
          lastName: null,
          avatarUrl: null,
        })
      );
    });
  });

  describe('deleteByClerkId', () => {
    it('should delete user by Clerk ID', async () => {
      mockUserRepository.deleteByClerkId.mockResolvedValue();

      await userService.deleteByClerkId('clerk-to-delete');

      expect(mockUserRepository.deleteByClerkId).toHaveBeenCalledWith(
        'clerk-to-delete'
      );
    });

    it('should propagate delete errors', async () => {
      mockUserRepository.deleteByClerkId.mockRejectedValue(
        new Error('Delete failed')
      );

      await expect(
        userService.deleteByClerkId('clerk-id')
      ).rejects.toThrow('Delete failed');
    });
  });

  describe('formatUserPublic', () => {
    it('should return only public fields', () => {
      const user = createMockUser({
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        industry: 'TECHNOLOGY',
        company: 'Tech Corp',
        jobTitle: 'Developer',
        bio: 'A developer',
        handicap: 15,
        skillLevel: 'INTERMEDIATE',
        city: 'San Francisco',
        state: 'CA',
        email: 'private@email.com', // Should not be included
        latitude: 37.7749, // Should not be included
        longitude: -122.4194, // Should not be included
      });

      const result = userService.formatUserPublic(user);

      expect(result).toEqual({
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        industry: 'TECHNOLOGY',
        company: 'Tech Corp',
        jobTitle: 'Developer',
        bio: 'A developer',
        handicap: 15,
        skillLevel: 'INTERMEDIATE',
        city: 'San Francisco',
        state: 'CA',
      });

      // Verify private fields are not included
      expect(result).not.toHaveProperty('email');
      expect(result).not.toHaveProperty('latitude');
      expect(result).not.toHaveProperty('longitude');
      expect(result).not.toHaveProperty('clerkId');
      expect(result).not.toHaveProperty('searchRadius');
    });

    it('should handle null values in public fields', () => {
      const user = createMockUser({
        avatarUrl: null,
        industry: null,
        company: null,
        bio: null,
        handicap: null,
        skillLevel: null,
      });

      const result = userService.formatUserPublic(user);

      expect(result.avatarUrl).toBeNull();
      expect(result.industry).toBeNull();
      expect(result.company).toBeNull();
      expect(result.bio).toBeNull();
      expect(result.handicap).toBeNull();
      expect(result.skillLevel).toBeNull();
    });
  });

  describe('formatUserPrivate', () => {
    it('should include public fields plus private fields', () => {
      const user = createMockUser({
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        latitude: 37.7749,
        longitude: -122.4194,
        searchRadius: 50,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });

      const result = userService.formatUserPrivate(user);

      // Should have all public fields
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');

      // Should also have private fields
      expect(result).toHaveProperty('email', 'john@example.com');
      expect(result).toHaveProperty('latitude', 37.7749);
      expect(result).toHaveProperty('longitude', -122.4194);
      expect(result).toHaveProperty('searchRadius', 50);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle null location values', () => {
      const user = createMockUser({
        latitude: null,
        longitude: null,
      });

      const result = userService.formatUserPrivate(user);

      expect(result.latitude).toBeNull();
      expect(result.longitude).toBeNull();
    });
  });

  describe('integration scenarios', () => {
    it('should handle Clerk user sync workflow', async () => {
      // Initial sync creates user
      const newUser = createMockUser({
        clerkId: 'clerk-workflow',
        email: 'workflow@example.com',
        firstName: 'Workflow',
        lastName: 'User',
      });

      mockUserRepository.upsertByClerkId.mockResolvedValue(newUser);

      const created = await userService.syncFromClerk(
        'clerk-workflow',
        'workflow@example.com',
        'Workflow',
        'User'
      );

      expect(created.clerkId).toBe('clerk-workflow');

      // User updates their profile
      const updatedUser = { ...newUser, company: 'New Company' };
      mockUserRepository.findById.mockResolvedValue(newUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const updated = await userService.update(newUser.id, {
        company: 'New Company',
      });

      expect(updated.company).toBe('New Company');
    });
  });
});
