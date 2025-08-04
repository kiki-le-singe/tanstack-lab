import type { Context } from 'hono';

/**
 * Standardized API response utility
 * Provides consistent response format across all endpoints
 */
export class ApiResponse {
  /**
   * Success response with data and optional metadata
   */
  static success<T>(c: Context, data: T, meta?: Record<string, unknown>) {
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
  static successWithPagination<T>(
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
  static error(c: Context, message: string, code = 500, details?: Record<string, unknown>) {
    return c.json(
      {
        success: false,
        error: {
          message,
          ...(details && { details }),
        },
        timestamp: new Date().toISOString(),
      },
      code as any,
    );
  }

  /**
   * Validation error response for invalid input
   */
  static validationError(c: Context, errors: Record<string, string[]>) {
    return c.json(
      {
        success: false,
        error: {
          message: 'Validation failed',
          details: { validation: errors },
        },
        timestamp: new Date().toISOString(),
      },
      400 as any,
    );
  }

  /**
   * Not found error response
   */
  static notFound(c: Context, resource: string) {
    return ApiResponse.error(c, `${resource} not found`, 404);
  }

  /**
   * Created response for successful resource creation
   */
  static created<T>(c: Context, data: T) {
    return c.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      201 as any,
    );
  }
}
