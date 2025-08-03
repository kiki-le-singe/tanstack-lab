import { Hono } from 'hono';
import { userRoutes } from './users.js';
import { postRoutes } from './posts.js';
import { categoryRoutes } from './categories.js';
import { commentRoutes } from './comments.js';

const restApi = new Hono();

// Health check endpoint
restApi.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0' 
  });
});

// Mount resource routes
restApi.route('/users', userRoutes);
restApi.route('/posts', postRoutes);
restApi.route('/categories', categoryRoutes);
restApi.route('/comments', commentRoutes);

export { restApi };