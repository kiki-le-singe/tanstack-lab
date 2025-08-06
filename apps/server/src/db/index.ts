import dotenv from 'dotenv';

dotenv.config();

import { logger } from '../lib/logger.js';
import type { DatabaseAdapter } from './adapters/index.js';
import { createDatabaseAdapterFromEnvironment } from './adapters/index.js';

/**
 * Global database adapter instance
 * Automatically selects the appropriate database based on environment
 */
let dbAdapter: DatabaseAdapter | null = null;

/**
 * Get the database adapter instance
 * Initializes the adapter on first access
 */
export async function getDatabase(): Promise<DatabaseAdapter> {
  if (!dbAdapter) {
    dbAdapter = createDatabaseAdapterFromEnvironment();
    await dbAdapter.initialize();

    // Log database selection with structured data
    logger.info(
      {
        database: {
          type: dbAdapter.type.toUpperCase(),
          dialect: dbAdapter.dialect,
          location: dbAdapter.type === 'sqlite' ? 'local' : 'cloud',
          file: dbAdapter.type === 'sqlite' ? './dev.db' : undefined,
        },
      },
      `Connected to ${dbAdapter.type.toUpperCase()} database`,
    );
  }

  return dbAdapter;
}

/**
 * Get the Drizzle database instance
 * Maintains compatibility with existing code
 */
export async function getDb() {
  const adapter = await getDatabase();
  return adapter.db;
}

/**
 * Get the database schema
 * Returns the appropriate schema based on the current adapter
 */
export async function getSchema() {
  const adapter = await getDatabase();
  return adapter.schema;
}

/**
 * Legacy compatibility exports
 * These maintain backward compatibility with existing code
 */

// Create a singleton instance that's initialized lazily
let _dbInstance: DatabaseAdapter['db'] | null = null;
let _schemaInstance: DatabaseAdapter['schema'] | null = null;

/**
 * Legacy db export - lazily initialized
 * Existing code can continue using `db` but it now auto-selects the database
 */
export const db = new Proxy({} as DatabaseAdapter['db'], {
  get(_target, prop) {
    if (!_dbInstance) {
      // Try to auto-initialize if not done yet
      logger.warn('Database accessed before initialization. Auto-initializing...');
      throw new Error('Database not initialized. Call initializeDatabase() at app startup.');
    }
    return _dbInstance[prop];
  },
});

/**
 * Initialize the database for legacy compatibility
 * Call this at application startup
 */
export async function initializeDatabase(): Promise<void> {
  const adapter = await getDatabase();
  _dbInstance = adapter.db;
  _schemaInstance = adapter.schema;
}

/**
 * Conditional schema loading based on DATABASE_TYPE environment
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const databaseType = process.env.DATABASE_TYPE;

const schemaModule =
  databaseType === 'sqlite'
    ? await import('./schemas/sqlite.js')
    : await import('./schemas/postgresql.js');

export const { users, categories, posts, comments } = schemaModule;

// Log schema selection in development
if (isDevelopment) {
  logger.debug(
    {
      schema: {
        type: databaseType === 'sqlite' ? 'SQLite' : 'PostgreSQL',
        databaseType,
        entities: ['users', 'categories', 'posts', 'comments'],
      },
    },
    'Database schema loaded',
  );
}
