import { readFileSync } from 'node:fs';
import { logger } from '../lib/logger.js';

/**
 * Get the package version from a package.json file
 */
export function getPackageVersion(packageJsonPath: string): string {
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch (_error) {
    logger.warn({ packageJsonPath }, 'Could not read package.json, using fallback version');
    return '0.0.0';
  }
}

/**
 * Get current ISO timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
