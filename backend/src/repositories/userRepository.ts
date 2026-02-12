import { prisma } from '../config/database.js';
import type { User, Prisma } from '@prisma/client';

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async findByClerkId(clerkId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { clerkId },
    });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  },

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async updateByClerkId(clerkId: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { clerkId },
      data,
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  },

  async deleteByClerkId(clerkId: string): Promise<void> {
    await prisma.user.delete({
      where: { clerkId },
    });
  },

  async upsertByClerkId(
    clerkId: string,
    create: Prisma.UserCreateInput,
    update: Prisma.UserUpdateInput
  ): Promise<User> {
    return prisma.user.upsert({
      where: { clerkId },
      create,
      update,
    });
  },
};
