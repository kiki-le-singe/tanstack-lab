import { z } from 'zod';

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  avatarUrl: z.string().url('Invalid URL').optional().nullable(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  avatarUrl: z.string().url('Invalid URL').optional().nullable(),
});

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long').optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
});

// Post schemas
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  published: z.boolean().default(false),
  authorId: z.string().uuid('Invalid author ID'),
  categoryId: z.string().uuid('Invalid category ID'),
});

export const updatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  published: z.boolean().optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
});

// Comment schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(1000, 'Content too long'),
  postId: z.string().uuid('Invalid post ID'),
  authorId: z.string().uuid('Invalid author ID'),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(1000, 'Content too long').optional(),
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const postFiltersSchema = z.object({
  published: z.coerce.boolean().optional(),
  authorId: z.string().uuid('Invalid author ID').optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  categorySlug: z.string().optional(),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// Type exports
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
export type CreatePost = z.infer<typeof createPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;
export type CreateComment = z.infer<typeof createCommentSchema>;
export type UpdateComment = z.infer<typeof updateCommentSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type PostFilters = z.infer<typeof postFiltersSchema>;
export type UuidParam = z.infer<typeof uuidParamSchema>;
