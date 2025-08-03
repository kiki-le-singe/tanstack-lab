import dotenv from 'dotenv';
dotenv.config();

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { restApi } from '@/api/rest/index.js';
import { graphqlServer } from '@/api/graphql/index.js';
import { getPackageVersion, getCurrentTimestamp } from '@/utils/index.js';

// Create main Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'TanStack Lab API Server',
    version: getPackageVersion('./package.json'),
    endpoints: {
      rest: '/api',
      graphql: '/graphql',
      health: '/health',
    },
    timestamp: getCurrentTimestamp(),
  });
});

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: getCurrentTimestamp(),
  });
});

// Mount REST API at /api
app.route('/api', restApi);

// Mount GraphQL API at /graphql
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
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Start server
const port = Number(process.env.PORT) || 3001;

console.log(`🚀 Server starting on port ${port}...`);
console.log(`📊 REST API: http://localhost:${port}/api`);
console.log(`🔍 GraphQL: http://localhost:${port}/graphql`);
console.log(`💚 Health check: http://localhost:${port}/health`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Server running on http://localhost:${port}`);