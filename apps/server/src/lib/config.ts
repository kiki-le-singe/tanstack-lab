import { z } from 'zod';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

/**
 * Environment configuration validation
 * Ensures all required environment variables are present and valid
 */
const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development')
      .describe('Application environment'),

    PORT: z.coerce
      .number()
      .int()
      .min(1000, 'PORT must be at least 1000')
      .max(65535, 'PORT must be at most 65535')
      .default(3001)
      .describe('Server port number'),

    DATABASE_TYPE: z.enum(['neon', 'sqlite']).default('sqlite').describe('Database type to use'),

    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required').describe('Database connection URL'),
  })
  .refine(
    (data) => {
      // Cross-field validation: DATABASE_URL format should match DATABASE_TYPE
      if (data.DATABASE_TYPE === 'neon') {
        return (
          data.DATABASE_URL.startsWith('postgresql://') ||
          data.DATABASE_URL.startsWith('postgres://')
        );
      }
      if (data.DATABASE_TYPE === 'sqlite') {
        return data.DATABASE_URL.startsWith('file:') || data.DATABASE_URL.includes('.db');
      }
      return true;
    },
    {
      message: 'DATABASE_URL format must match the selected DATABASE_TYPE',
      path: ['DATABASE_URL'],
    },
  );

/**
 * Validated environment configuration
 */
export const config = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      for (const issue of error.issues) {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      }
    }
    console.error('\nPlease check your environment variables and try again.');
    process.exit(1);
  }
})();

/**
 * Check if running in development mode
 */
export const isDevelopment = config.NODE_ENV === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = config.NODE_ENV === 'production';

/**
 * Check if running in test mode
 */
export const isTest = config.NODE_ENV === 'test';

/**
 * Database configuration helpers
 */
export const isNeonDatabase = config.DATABASE_TYPE === 'neon';
export const isSqliteDatabase = config.DATABASE_TYPE === 'sqlite';

/**
 * Environment configuration type
 * Inferred from the Zod schema for type safety
 */
export type Config = z.infer<typeof envSchema>;

/**
 * Validate environment variables manually (useful for testing)
 */
export function validateEnvironment(env: Record<string, unknown>): Config {
  return envSchema.parse(env);
}
