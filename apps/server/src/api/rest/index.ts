import { Hono } from 'hono';
import { categoryRoutes } from './categories.js';
import { commentRoutes } from './comments.js';
import { postRoutes } from './posts.js';
import { userRoutes } from './users.js';

const restApi = new Hono();

// Mount resource routes
restApi.route('/users', userRoutes);
restApi.route('/posts', postRoutes);
restApi.route('/categories', categoryRoutes);
restApi.route('/comments', commentRoutes);

export { restApi };
