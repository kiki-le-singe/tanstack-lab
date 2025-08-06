import pino from 'pino';
import { config, isDevelopment } from './config.js';

/**
 * Logging setup - simple but powerful
 * - JSON structured logs for production
 * - Pretty formatted logs for development
 * - Request correlation ready
 * - Zero complexity overhead
 */

export const logger = pino({
  level: config.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // Clean base fields
  base: {
    service: 'tanstack-lab-api',
    env: config.NODE_ENV,
  },

  // Pretty printing in development
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname,service,env',
          messageFormat: '[{requestId}] {msg}',
        },
      }
    : undefined,

  // Production serializers
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

/**
 * Create child logger with request context
 */
export const withRequestId = (requestId: string) => {
  return logger.child({ requestId });
};

/**
 * Simple timing utility for performance insights
 */
export const withTiming = async <T>(
  logger: pino.Logger,
  operation: string,
  fn: () => Promise<T> | T,
): Promise<T> => {
  const start = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - start;
    logger.info({ operation, duration }, `${operation} completed`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error({ operation, duration, err: error }, `${operation} failed`);
    throw error;
  }
};

export default logger;
