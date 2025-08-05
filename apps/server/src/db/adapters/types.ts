/**
 * Database adapter types and interfaces
 * Provides a clean abstraction for different database implementations
 */

export type DatabaseDialect = 'postgresql' | 'sqlite';

export type DatabaseType = 'neon' | 'sqlite';

/**
 * Base database adapter interface
 * All database adapters must implement this interface
 */
export interface DatabaseAdapter {
  readonly db: any; // Drizzle database instance
  readonly schema: any; // Database schema
  readonly dialect: DatabaseDialect;
  readonly type: DatabaseType;
  
  /**
   * Initialize the database connection
   */
  initialize(): Promise<void>;
  
  /**
   * Check database health/connectivity
   */
  health(): Promise<boolean>;
  
  /**
   * Close database connection
   */
  close(): Promise<void>;
}

/**
 * Database configuration for environment-based selection
 */
export interface DatabaseConfig {
  type: DatabaseType;
  connectionString?: string;
  sqlitePath?: string;
}