import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { BaseAdapter } from './base.js';
import * as schema from '../schemas/sqlite.js';

/**
 * SQLite database adapter
 * Provides local database support for development and testing
 */
export class SqliteAdapter extends BaseAdapter {
  readonly dialect = 'sqlite' as const;
  readonly type = 'sqlite' as const;
  readonly schema = schema;

  private _db: ReturnType<typeof drizzle> | null = null;
  private _sqlite: Database.Database | null = null;
  private dbPath: string;

  constructor(dbPath: string = './dev.db') {
    super();
    this.dbPath = dbPath;
  }

  get db() {
    if (!this._db) {
      throw new Error('SQLite adapter not initialized. Call initialize() first.');
    }
    return this._db;
  }

  /**
   * Initialize the SQLite database connection
   */
  async initialize(): Promise<void> {
    try {
      // Create SQLite database instance
      this._sqlite = new Database(this.dbPath);

      // Enable foreign keys (important for referential integrity)
      this._sqlite.pragma('foreign_keys = ON');

      // Create Drizzle instance
      this._db = drizzle(this._sqlite, { schema });
      this._initialized = true;

      // Test connection
      await this.health();
    } catch (error) {
      throw new Error(
        `Failed to initialize SQLite adapter: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Check SQLite database connectivity
   */
  async health(): Promise<boolean> {
    try {
      this.ensureInitialized();
      // Simple query to test connection
      this._sqlite?.prepare('SELECT 1 as health').get();
      return true;
    } catch (error) {
      console.error('SQLite health check failed:', error);
      return false;
    }
  }

  /**
   * Close SQLite database connection
   */
  async close(): Promise<void> {
    if (this._sqlite) {
      this._sqlite.close();
      this._sqlite = null;
    }
    this._db = null;
    this._initialized = false;
  }
}
