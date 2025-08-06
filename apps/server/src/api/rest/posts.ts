import { zValidator } from '@hono/zod-validator';
import { and, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { comments, db, posts } from '@/db/index.js';
import { withRequestId } from '@/lib/logger.js';
import {
  createPostSchema,
  paginationSchema,
  postFiltersSchema,
  updatePostSchema,
  uuidParamSchema,
} from '@/schemas/validation.js';

const postRoutes = new Hono();

// GET /posts - List posts with pagination and filters
postRoutes.get('/', zValidator('query', paginationSchema.merge(postFiltersSchema)), async (c) => {
  const { page, limit, published, authorId, categoryId } = c.req.valid('query');
  const offset = (page - 1) * limit;

  try {
    // Build query conditions
    const conditions = [];
    if (published !== undefined) {
      conditions.push(eq(posts.published, published));
    }
    if (authorId) {
      conditions.push(eq(posts.authorId, authorId));
    }
    if (categoryId) {
      conditions.push(eq(posts.categoryId, categoryId));
    }

    const postList = await db.query.posts.findMany({
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        category: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset,
      orderBy: [desc(posts.createdAt)],
    });

    return c.json({
      posts: postList,
      pagination: {
        page,
        limit,
        hasMore: postList.length === limit,
      },
    });
  } catch (error) {
    const requestId = c.get('requestId') || 'unknown';
    const logger = withRequestId(requestId);
    logger.error(
      { err: error, operation: 'fetch-posts', filters: { published, authorId, categoryId } },
      'Failed to fetch posts',
    );
    return c.json({ error: 'Failed to fetch posts' }, 500);
  }
});

// GET /posts/:id - Get post by ID with author, category, and comments
postRoutes.get('/:id', zValidator('param', uuidParamSchema), async (c) => {
  const { id } = c.req.valid('param');

  try {
    // Single optimized query with all relationships - much more efficient!
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        category: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
        comments: {
          with: {
            author: {
              columns: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: [comments.createdAt],
        },
      },
    });

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    return c.json({ post });
  } catch (error) {
    const requestId = c.get('requestId') || 'unknown';
    const logger = withRequestId(requestId);
    logger.error({ err: error, operation: 'fetch-post', postId: id }, 'Failed to fetch post');
    return c.json({ error: 'Failed to fetch post' }, 500);
  }
});

// POST /posts - Create new post
postRoutes.post('/', zValidator('json', createPostSchema), async (c) => {
  const postData = c.req.valid('json');

  try {
    const [newPost] = await db.insert(posts).values(postData).returning();

    return c.json({ post: newPost }, 201);
  } catch (error) {
    const requestId = c.get('requestId') || 'unknown';
    const logger = withRequestId(requestId);
    logger.error({ err: error, operation: 'create-post', postData }, 'Failed to create post');
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

// PUT /posts/:id - Update post
postRoutes.put(
  '/:id',
  zValidator('param', uuidParamSchema),
  zValidator('json', updatePostSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const updateData = c.req.valid('json');

    try {
      const [updatedPost] = await db
        .update(posts)
        .set(updateData)
        .where(eq(posts.id, id))
        .returning();

      if (!updatedPost) {
        return c.json({ error: 'Post not found' }, 404);
      }

      return c.json({ post: updatedPost });
    } catch (error) {
      const requestId = c.get('requestId') || 'unknown';
      const logger = withRequestId(requestId);
      logger.error(
        { err: error, operation: 'update-post', postId: id, updateData },
        'Failed to update post',
      );
      return c.json({ error: 'Failed to update post' }, 500);
    }
  },
);

// DELETE /posts/:id - Delete post
postRoutes.delete('/:id', zValidator('param', uuidParamSchema), async (c) => {
  const { id } = c.req.valid('param');

  try {
    const [deletedPost] = await db.delete(posts).where(eq(posts.id, id)).returning();

    if (!deletedPost) {
      return c.json({ error: 'Post not found' }, 404);
    }

    return c.json({ message: 'Post deleted successfully' });
  } catch (error) {
    const requestId = c.get('requestId') || 'unknown';
    const logger = withRequestId(requestId);
    logger.error({ err: error, operation: 'delete-post', postId: id }, 'Failed to delete post');
    return c.json({ error: 'Failed to delete post' }, 500);
  }
});

export { postRoutes };
