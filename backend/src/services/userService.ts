import { userRepository } from '../repositories/userRepository.js';
import { NotFoundError } from '../utils/errors.js';
import type { User, Prisma } from '@prisma/client';
import type { UpdateUserInput } from '../validators/user.js';

export const userService = {
  async getById(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  },

  async getByClerkId(clerkId: string): Promise<User> {
    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  },

  async update(id: string, data: UpdateUserInput): Promise<User> {
    await this.getById(id);

    // Convert undefined to null for nullable fields
    const updateData: Prisma.UserUpdateInput = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.industry !== undefined) updateData.industry = data.industry;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.handicap !== undefined) updateData.handicap = data.handicap;
    if (data.skillLevel !== undefined) updateData.skillLevel = data.skillLevel;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.searchRadius !== undefined) updateData.searchRadius = data.searchRadius;

    return userRepository.update(id, updateData);
  },

  async syncFromClerk(
    clerkId: string,
    email: string,
    firstName?: string | null,
    lastName?: string | null,
    imageUrl?: string | null
  ): Promise<User> {
    const createData: Prisma.UserCreateInput = {
      clerkId,
      email,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      avatarUrl: imageUrl ?? null,
    };

    const updateData: Prisma.UserUpdateInput = {
      email,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      avatarUrl: imageUrl ?? null,
    };

    return userRepository.upsertByClerkId(clerkId, createData, updateData);
  },

  async deleteByClerkId(clerkId: string): Promise<void> {
    await userRepository.deleteByClerkId(clerkId);
  },

  formatUserPublic(user: User) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      industry: user.industry,
      company: user.company,
      jobTitle: user.jobTitle,
      bio: user.bio,
      handicap: user.handicap,
      skillLevel: user.skillLevel,
      city: user.city,
      state: user.state,
    };
  },

  formatUserPrivate(user: User) {
    return {
      ...this.formatUserPublic(user),
      email: user.email,
      latitude: user.latitude,
      longitude: user.longitude,
      searchRadius: user.searchRadius,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};
