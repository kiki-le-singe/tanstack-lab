import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * Standardized API response utilities
 * Provides consistent response format across all endpoints
 */

/**
 * Success response with data and optional metadata
 */
export function apiSuccess<T>(c: Context, data: T, meta?: Record<string, unknown>) {
  return c.json({
    success: true,
    data,
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Success response for list endpoints with pagination
 */
export function apiSuccessWithPagination<T>(
  c: Context,
  items: T[],
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  },
) {
  return c.json({
    success: true,
    data: items,
    meta: { pagination },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Error response with message and optional details
 */
export function apiError(
  c: Context,
  message: string,
  code: ContentfulStatusCode = 500,
  details?: Record<string, unknown>,
) {
  return c.json(
    {
      success: false,
      error: {
        message,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
    },
    code,
  );
}

/**
 * Validation error response for invalid input
 */
export function apiValidationError(c: Context, errors: Record<string, string[]>) {
  return c.json(
    {
      success: false,
      error: {
        message: 'Validation failed',
        details: { validation: errors },
      },
      timestamp: new Date().toISOString(),
    },
    400,
  );
}

/**
 * Not found error response
 */
export function apiNotFound(c: Context, resource: string) {
  return apiError(c, `${resource} not found`, 404);
}

/**
 * Created response for successful resource creation
 */
export function apiCreated<T>(c: Context, data: T) {
  return c.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    201,
  );
}
