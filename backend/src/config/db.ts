import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from './logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'warn' },
            { emit: 'event', level: 'error' },
          ]
        : [
            { emit: 'event', level: 'warn' },
            { emit: 'event', level: 'error' },
          ],
  });
}

export const prisma: PrismaClient = globalThis.__prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Log slow queries in dev
if (env.NODE_ENV === 'development') {
  (prisma as unknown as { $on: (event: string, handler: (e: { duration: number; query: string }) => void) => void })
    .$on('query', (e) => {
      if (e.duration > 500) {
        logger.warn('Slow query detected', { duration: e.duration, query: e.query });
      }
    });
}

(prisma as unknown as { $on: (event: string, handler: (e: { message: string }) => void) => void })
  .$on('error', (e) => {
    logger.error('Prisma error', { message: e.message });
  });
