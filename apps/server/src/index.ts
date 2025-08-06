import dotenv from 'dotenv';

dotenv.config();

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { graphqlServer } from '@/api/graphql/index.js';
import { restApi } from '@/api/rest/index.js';
import { initializeDatabase, getDatabase } from '@/db/index.js';
import { config, isDevelopment } from '@/lib/config.js';
import {
  auth,
  createRateLimiter,
  enhancedLogger,
  requestId,
  sanitizeInput,
  securityHeaders,
} from '@/lib/middleware.js';
import { apiError, apiSuccess } from '@/lib/response.js';
import { getPackageVersion } from '@/utils/index.js';
import { logger, withTiming } from '@/lib/logger.js';

// Create main Hono app
const app = new Hono();

// Enhanced middleware stack
app.use('*', requestId);
app.use('*', enhancedLogger);
app.use('*', securityHeaders);
app.use('*', createRateLimiter());
app.use(
  '*',
  cors({
    origin: isDevelopment
      ? ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173']
      : [], // Configure production origins as needed
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  }),
);
app.use('*', sanitizeInput);
app.use('*', auth);

// Root endpoint
app.get('/', (c) => {
  return apiSuccess(c, {
    message: 'TanStack Lab API Server',
    version: getPackageVersion('./package.json'),
    environment: config.NODE_ENV,
    endpoints: {
      rest: '/api',
      graphql: '/graphql',
      health: '/health',
    },
  });
});

// Enhanced health check with database connectivity
app.get('/health', async (c) => {
  const startTime = Date.now();

  try {
    // Test database connection using adapter
    const dbAdapter = await getDatabase();
    const isHealthy = await dbAdapter.health();

    if (!isHealthy) {
      throw new Error('Database health check failed');
    }

    const responseTime = Date.now() - startTime;

    return apiSuccess(c, {
      status: 'healthy',
      services: {
        database: 'connected',
        api: 'operational',
      },
      database: {
        type: dbAdapter.type,
        dialect: dbAdapter.dialect,
      },
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      environment: config.NODE_ENV,
      version: getPackageVersion('./package.json'),
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return apiError(c, 'Service unhealthy', 503, {
      services: {
        database: 'disconnected',
        api: 'operational',
      },
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      error: isDevelopment ? (error as Error).message : 'Database connection failed',
    });
  }
});

// Mount REST API at /api
app.route('/api', restApi);

// Mount GraphQL API at /graphql - handle all methods
app.all('/graphql', async (c) => {
  const response = await graphqlServer.fetch(c.req.raw);

  // Return the response directly from GraphQL Yoga
  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
});

// 404 handler
app.notFound((c) => {
  return apiError(c, `Endpoint not found: ${c.req.method} ${c.req.path}`, 404);
});

// Error handler
app.onError((err, c) => {
  const requestId = c.get('requestId') || 'unknown';

  logger.error(
    {
      requestId,
      err,
      path: c.req.path,
      method: c.req.method,
      userAgent: c.req.header('user-agent'),
    },
    'Server error occurred',
  );

  return apiError(
    c,
    'Internal server error',
    500,
    isDevelopment ? { error: err.message, stack: err.stack } : undefined,
  );
});

// Initialize database and start server
async function startServer() {
  const port = config.PORT;

  try {
    // Initialize database first
    await withTiming(logger, 'database-initialization', () => initializeDatabase());

    logger.info({ port }, 'Starting server');

    const server = serve({
      fetch: app.fetch,
      port,
    });

    logger.info(
      {
        port,
        endpoints: {
          rest: `/api`,
          graphql: `/graphql`,
          health: `/health`,
        },
        features: [
          'rate-limiting',
          'input-sanitization',
          'security-headers',
          'request-correlation',
        ],
      },
      'Server started successfully',
    );

    return server;
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

const server = await startServer();

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  logger.info({ signal }, 'Received shutdown signal, starting graceful shutdown');

  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.warn('Force closing server after shutdown timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
