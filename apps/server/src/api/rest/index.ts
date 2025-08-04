import { Hono } from 'hono';
import { userRoutes } from './users.js';
import { postRoutes } from './posts.js';
import { categoryRoutes } from './categories.js';
import { commentRoutes } from './comments.js';
import { ApiResponse } from '@/lib/response.js';

const restApi = new Hono();

// REST API health check endpoint
restApi.get('/health', (c) => {
  return ApiResponse.success(c, {
    status: 'ok',
    api: 'REST API operational',
    version: '1.0.0',
  });
});

// Mount resource routes
restApi.route('/users', userRoutes);
restApi.route('/posts', postRoutes);
restApi.route('/categories', categoryRoutes);
restApi.route('/comments', commentRoutes);

export { restApi };
