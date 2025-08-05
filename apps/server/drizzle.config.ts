import { defineConfig } from 'drizzle-kit';

/**
 * Main Drizzle configuration that auto-selects the appropriate config
 * based on environment variables
 */

const databaseUrl = process.env.DATABASE_URL;
const databaseType = process.env.DATABASE_TYPE;

// Auto-detect database type
let dialect: 'postgresql' | 'sqlite' = 'sqlite'; // Default to SQLite
let schema = './src/db/schemas/sqlite.ts';
let out = './drizzle/sqlite';
let dbCredentials: any = { url: process.env.SQLITE_PATH || './dev.db' };

if (databaseType === 'neon' || (databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')))) {
  dialect = 'postgresql';
  schema = './src/db/schemas/postgresql.ts';
  out = './drizzle/neon';
  dbCredentials = { url: databaseUrl! };
}

export default defineConfig({
  schema,
  out,
  dialect,
  dbCredentials,
  verbose: true,
  strict: true,
});