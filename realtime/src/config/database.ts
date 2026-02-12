import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientOptions = {
  log:
    env.NODE_ENV === 'development'
      ? [
          { emit: 'event' as const, level: 'query' as const },
          { emit: 'event' as const, level: 'error' as const },
          { emit: 'event' as const, level: 'warn' as const },
        ]
      : [{ emit: 'event' as const, level: 'error' as const }],
};

export const prisma = global.prisma || new PrismaClient(prismaClientOptions);

if (env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Log queries in development
if (env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: { query: string; duration: number }) => {
    logger.debug({ query: e.query, duration: `${e.duration}ms` }, 'Prisma query');
  });
}

prisma.$on('error' as never, (e: { message: string }) => {
  logger.error({ error: e.message }, 'Prisma error');
});

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Connected to database');
  } catch (error) {
    logger.error({ error }, 'Failed to connect to database');
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Disconnected from database');
}
