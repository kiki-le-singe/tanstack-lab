import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, posts, users, categories, comments } from '@/db/index.js';
import { 
  createPostSchema, 
  updatePostSchema, 
  uuidParamSchema,
  paginationSchema,
  postFiltersSchema 
} from '@/schemas/validation.js';
import { eq, and, desc } from 'drizzle-orm';

const postRoutes = new Hono();

// GET /posts - List posts with pagination and filters
postRoutes.get('/', 
  zValidator('query', paginationSchema.merge(postFiltersSchema)), 
  async (c) => {
    const { page, limit, published, authorId, categoryId, categorySlug } = c.req.valid('query');
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

      // Modern relational query - cleaner and more performant
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
      console.error('Error fetching posts:', error);
      return c.json({ error: 'Failed to fetch posts' }, 500);
    }
  }
);

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
    console.error('Error fetching post:', error);
    return c.json({ error: 'Failed to fetch post' }, 500);
  }
});

// POST /posts - Create new post
postRoutes.post('/', zValidator('json', createPostSchema), async (c) => {
  const postData = c.req.valid('json');

  try {
    const [newPost] = await db.insert(posts)
      .values(postData)
      .returning();

    return c.json({ post: newPost }, 201);
  } catch (error) {
    console.error('Error creating post:', error);
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

// PUT /posts/:id - Update post
postRoutes.put('/:id', 
  zValidator('param', uuidParamSchema),
  zValidator('json', updatePostSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const updateData = c.req.valid('json');

    try {
      const [updatedPost] = await db.update(posts)
        .set(updateData)
        .where(eq(posts.id, id))
        .returning();

      if (!updatedPost) {
        return c.json({ error: 'Post not found' }, 404);
      }

      return c.json({ post: updatedPost });
    } catch (error) {
      console.error('Error updating post:', error);
      return c.json({ error: 'Failed to update post' }, 500);
    }
  }
);

// DELETE /posts/:id - Delete post
postRoutes.delete('/:id', zValidator('param', uuidParamSchema), async (c) => {
  const { id } = c.req.valid('param');

  try {
    const [deletedPost] = await db.delete(posts)
      .where(eq(posts.id, id))
      .returning();

    if (!deletedPost) {
      return c.json({ error: 'Post not found' }, 404);
    }

    return c.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return c.json({ error: 'Failed to delete post' }, 500);
  }
});

export { postRoutes };