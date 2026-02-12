import pino from 'pino';
import { env } from '../config/env.js';

const transport =
  env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined;

export const logger = pino({
  level: env.LOG_LEVEL,
  transport,
  base: {
    service: 'linkup-realtime',
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
});

// Child loggers for specific modules
export const createLogger = (module: string) =>
  logger.child({ module });
