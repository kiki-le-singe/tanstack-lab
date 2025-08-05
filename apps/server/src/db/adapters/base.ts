import type { DatabaseAdapter, DatabaseDialect, DatabaseType } from './types.js';

/**
 * Abstract base class for database adapters
 * Provides common functionality and enforces the adapter interface
 */
export abstract class BaseAdapter<TDatabase = unknown, TSchema = Record<string, unknown>>
  implements DatabaseAdapter<TDatabase, TSchema>
{
  abstract readonly db: TDatabase;
  abstract readonly schema: TSchema;
  abstract readonly dialect: DatabaseDialect;
  abstract readonly type: DatabaseType;

  protected _initialized = false;

  /**
   * Check if the adapter has been initialized
   */
  get isInitialized(): boolean {
    return this._initialized;
  }

  /**
   * Initialize the database connection
   */
  abstract initialize(): Promise<void>;

  /**
   * Check database health/connectivity
   */
  abstract health(): Promise<boolean>;

  /**
   * Close database connection
   */
  abstract close(): Promise<void>;

  /**
   * Ensure the adapter is initialized before use
   */
  protected ensureInitialized(): void {
    if (!this._initialized) {
      throw new Error(`Database adapter (${this.type}) not initialized. Call initialize() first.`);
    }
  }
}
