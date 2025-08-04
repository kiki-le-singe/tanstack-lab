import DOMPurify from 'dompurify';
import type { Context, Next } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';
import { JSDOM } from 'jsdom';
import { v4 as uuidv4 } from 'uuid';
import { isDevelopment } from './config.js';

/**
 * Initialize DOMPurify with JSDOM for server-side usage
 */
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Request ID middleware
 * Adds a unique request ID to each request for tracing
 */
export const requestId = async (c: Context, next: Next) => {
  const requestId = c.req.header('x-request-id') || uuidv4();
  c.set('requestId', requestId);
  c.res.headers.set('x-request-id', requestId);
  await next();
};

/**
 * Rate limiting middleware
 * Limits requests per IP to prevent abuse
 */
export const createRateLimiter = () => {
  return rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: isDevelopment ? 1000 : 100, // Higher limit in development
    message: {
      success: false,
      error: {
        message: 'Too many requests, please try again later',
      },
      timestamp: new Date().toISOString(),
    },
    keyGenerator: (c) => {
      // Use x-forwarded-for header for proxied requests
      return c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'anonymous';
    },
    skip: (c) => {
      // Skip rate limiting for health checks
      return c.req.path === '/health' || c.req.path === '/api/health';
    },
  });
};

/**
 * Input sanitization middleware
 * Sanitizes request body to prevent XSS attacks
 */
export const sanitizeInput = async (c: Context, next: Next) => {
  // Skip sanitization for GraphQL requests - GraphQL Yoga handles its own body parsing
  if (c.req.path === '/graphql') {
    await next();
    return;
  }

  // Only sanitize JSON bodies
  const contentType = c.req.header('content-type');
  if (!contentType?.includes('application/json')) {
    await next();
    return;
  }

  try {
    const body = await c.req.json();
    const sanitizedBody = sanitizeObject(body);

    // Store sanitized body in context for later use
    c.set('sanitizedBody', sanitizedBody);

    await next();
  } catch {
    // If JSON parsing fails, continue without sanitization
    await next();
  }
};

/**
 * Type representing valid JSON values that can be sanitized
 */
type SanitizableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly SanitizableValue[]
  | { readonly [K in string]: SanitizableValue };

/**
 * Recursively sanitize a JSON value to prevent XSS attacks
 * @param obj - The value to sanitize
 * @returns The sanitized value with the same structure
 */
function sanitizeObject(obj: SanitizableValue): SanitizableValue {
  // Handle null and undefined values
  if (obj == null) {
    return obj;
  }

  // Handle primitive types
  if (typeof obj === 'string') {
    // Sanitize HTML content and trim whitespace
    return purify.sanitize(obj.trim());
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  // Handle objects (must be last check)
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: Record<string, SanitizableValue> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Sanitize object keys (they're always strings in JSON)
      const sanitizedKey = purify.sanitize(key.trim());
      sanitized[sanitizedKey] = sanitizeObject(value);
    }

    return sanitized;
  }

  // Fallback for any other type (should not happen with proper typing)
  return obj;
}

/**
 * Security headers middleware using Helmet
 */
export const securityHeaders = async (c: Context, next: Next) => {
  await next();

  // Basic security headers
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  c.res.headers.set('X-Frame-Options', 'DENY');
  c.res.headers.set('X-XSS-Protection', '1; mode=block');
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HSTS in production
  if (!isDevelopment) {
    c.res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Content Security Policy - more permissive in development for GraphQL Playground
  const csp = isDevelopment
    ? [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:", // More permissive for dev tools
        "style-src 'self' 'unsafe-inline' https:",
        "img-src 'self' data: https:",
        "font-src 'self' data: https:",
        "connect-src 'self' https:",
        "media-src 'self'",
        "object-src 'none'",
        "child-src 'none'",
        "worker-src 'self' blob:",
        "frame-ancestors 'none'",
        "base-uri 'none'",
        "form-action 'self'",
      ].join('; ')
    : [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "media-src 'self'",
        "object-src 'none'",
        "child-src 'none'",
        "worker-src 'none'",
        "frame-ancestors 'none'",
        "base-uri 'none'",
        "form-action 'self'",
      ].join('; ');

  c.res.headers.set('Content-Security-Policy', csp);
};

/**
 * Custom authentication middleware placeholder
 * Currently just passes through, but can be extended for JWT/session auth
 */
export const auth = async (c: Context, next: Next) => {
  // For now, just set a context flag indicating no auth is required
  c.set('authenticated', false);
  c.set('user', null);

  await next();
};

/**
 * Request logging enhancement
 * Adds structured logging information
 */
export const enhancedLogger = async (c: Context, next: Next) => {
  const start = Date.now();
  const requestId = c.get('requestId') || 'unknown';

  console.log(`[${requestId}] --> ${c.req.method} ${c.req.path}`);

  await next();

  const ms = Date.now() - start;
  console.log(`[${requestId}] <-- ${c.req.method} ${c.req.path} ${c.res.status} ${ms}ms`);
};
