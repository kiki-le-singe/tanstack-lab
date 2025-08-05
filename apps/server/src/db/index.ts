import dotenv from 'dotenv';
dotenv.config();

import { DatabaseFactory } from './adapters/index.js';
import type { DatabaseAdapter } from './adapters/index.js';

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
    dbAdapter = DatabaseFactory.createFromEnvironment();
    await dbAdapter.initialize();
    
    // Enhanced logging to make database selection very clear
    console.log('');
    console.log('=' .repeat(60));
    console.log(`📊 DATABASE: ${dbAdapter.type.toUpperCase()} (${dbAdapter.dialect})`);
    if (dbAdapter.type === 'sqlite') {
      console.log('🏠 Running with LOCAL SQLite database');
      console.log('📁 Database file: ./dev.db');
    } else {
      console.log('☁️  Running with NEON PostgreSQL database');
      console.log('🌐 Connected to cloud database');
    }
    console.log('=' .repeat(60));
    console.log('');
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
let _dbInstance: any = null;
let _schemaInstance: any = null;

/**
 * Legacy db export - lazily initialized
 * Existing code can continue using `db` but it now auto-selects the database
 */
export const db = new Proxy({} as any, {
  get(target, prop) {
    if (!_dbInstance) {
      // Try to auto-initialize if not done yet
      console.warn('Database accessed before initialization. Auto-initializing...');
      throw new Error('Database not initialized. Call initializeDatabase() at app startup.');
    }
    return _dbInstance[prop];
  }
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
 * Legacy schema exports for type compatibility
 */
export * from './schemas/postgresql.js';
