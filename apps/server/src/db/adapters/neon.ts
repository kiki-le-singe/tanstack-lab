import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import { BaseAdapter } from './base.js';
import * as schema from '../schemas/postgresql.js';

/**
 * Neon PostgreSQL database adapter
 * Maintains compatibility with existing Neon implementation
 */
export class NeonAdapter extends BaseAdapter {
  readonly dialect = 'postgresql' as const;
  readonly type = 'neon' as const;
  readonly schema = schema;

  private _db: ReturnType<typeof drizzle> | null = null;
  private connectionString: string;

  constructor(connectionString: string) {
    super();
    this.connectionString = connectionString;
  }

  get db() {
    if (!this._db) {
      throw new Error('Neon adapter not initialized. Call initialize() first.');
    }
    return this._db;
  }

  /**
   * Initialize the Neon database connection
   */
  async initialize(): Promise<void> {
    try {
      const sql = neon(this.connectionString);
      this._db = drizzle(sql, { schema });
      this._initialized = true;
      
      // Test connection
      await this.health();
    } catch (error) {
      throw new Error(`Failed to initialize Neon adapter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check Neon database connectivity
   */
  async health(): Promise<boolean> {
    try {
      this.ensureInitialized();
      // Simple query to test connection
      await this._db!.execute(sql`SELECT 1 as health`);
      return true;
    } catch (error) {
      console.error('Neon health check failed:', error);
      return false;
    }
  }

  /**
   * Close Neon database connection
   * Note: Neon serverless connections are stateless, so this is mostly a no-op
   */
  async close(): Promise<void> {
    this._db = null;
    this._initialized = false;
  }
}