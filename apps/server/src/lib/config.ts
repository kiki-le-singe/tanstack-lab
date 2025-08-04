import { z } from 'zod';

/**
 * Environment configuration validation
 * Ensures all required environment variables are present
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
});

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
