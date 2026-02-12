import { prisma } from '../config/database.js';
import type { Message, Prisma } from '@prisma/client';

export interface MessageWithSender extends Message {
  sender: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
}

const messageInclude = {
  sender: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  },
};

export const messageRepository = {
  async findById(id: string): Promise<MessageWithSender | null> {
    return prisma.message.findUnique({
      where: { id },
      include: messageInclude,
    }) as Promise<MessageWithSender | null>;
  },

  async listByTeeTime(
    teeTimeId: string,
    cursor?: string,
    limit: number = 50
  ): Promise<{ messages: MessageWithSender[]; hasMore: boolean }> {
    const where: Prisma.MessageWhereInput = { teeTimeId };

    if (cursor) {
      where.id = { lt: cursor };
    }

    const messages = await prisma.message.findMany({
      where,
      include: messageInclude,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    }) as MessageWithSender[];

    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop();
    }

    // Return in chronological order
    return { messages: messages.reverse(), hasMore };
  },

  async create(data: Prisma.MessageCreateInput): Promise<MessageWithSender> {
    return prisma.message.create({
      data,
      include: messageInclude,
    }) as Promise<MessageWithSender>;
  },

  async delete(id: string): Promise<void> {
    await prisma.message.delete({
      where: { id },
    });
  },

  async getLatestByTeeTime(teeTimeId: string): Promise<MessageWithSender | null> {
    return prisma.message.findFirst({
      where: { teeTimeId },
      include: messageInclude,
      orderBy: { createdAt: 'desc' },
    }) as Promise<MessageWithSender | null>;
  },
};
