import type { DatabaseAdapter, DatabaseConfig, DatabaseType } from './types.js';
import { NeonAdapter } from './neon.js';
import { SqliteAdapter } from './sqlite.js';
import { config } from '@/lib/config.js';

/**
 * Create a database adapter based on configuration
 */
export function createDatabaseAdapter(config: DatabaseConfig): DatabaseAdapter {
  switch (config.type) {
    case 'neon':
      if (!config.connectionString) {
        throw new Error('Connection string is required for Neon adapter');
      }
      return new NeonAdapter(config.connectionString);

    case 'sqlite':
      return new SqliteAdapter(config.sqlitePath);

    default:
      throw new Error(`Unknown database type: ${config.type}`);
  }
}

/**
 * Create a database adapter based on validated environment configuration
 * Uses the validated config from lib/config.ts
 */
export function createDatabaseAdapterFromEnvironment(): DatabaseAdapter {
  const { DATABASE_TYPE, DATABASE_URL } = config;

  // Use validated configuration
  let sqlitePath = './dev.db';

  // If using SQLite and DATABASE_URL is file:// format, extract the path
  if (DATABASE_TYPE === 'sqlite' && DATABASE_URL.startsWith('file:')) {
    sqlitePath = DATABASE_URL.replace('file:', '');
  }

  return createDatabaseAdapter({
    type: DATABASE_TYPE,
    connectionString: DATABASE_URL,
    sqlitePath,
  });
}

/**
 * Get available database types
 */
export function getSupportedDatabaseTypes(): DatabaseType[] {
  return ['neon', 'sqlite'];
}
