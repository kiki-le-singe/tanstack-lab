import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, comments } from '@/db/index.js';
import {
  createCommentSchema,
  updateCommentSchema,
  uuidParamSchema,
  paginationSchema,
} from '@/schemas/validation.js';
import { eq, desc } from 'drizzle-orm';
import { withRequestId } from '@/lib/logger.js';

const commentRoutes = new Hono();

// GET /comments - List all comments with pagination
commentRoutes.get('/', zValidator('query', paginationSchema), async (c) => {
  const { page, limit } = c.req.valid('query');
  const offset = (page - 1) * limit;

  try {
    const commentList = await db.query.comments.findMany({
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      limit,
      offset,
      orderBy: [desc(comments.createdAt)],
    });

    return c.json({
      comments: commentList,
      pagination: {
        page,
        limit,
        hasMore: commentList.length === limit,
      },
    });
  } catch (error) {
    const requestId = c.get('requestId') || 'unknown';
    const logger = withRequestId(requestId);
    logger.error({ err: error, operation: 'fetch-comments' }, 'Failed to fetch comments');
    return c.json({ error: 'Failed to fetch comments' }, 500);
  }
});

// GET /comments/:id - Get comment by ID
commentRoutes.get('/:id', zValidator('param', uuidParamSchema), async (c) => {
  const { id } = c.req.valid('param');

  try {
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, id),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }

    return c.json({ comment });
  } catch (error) {
    console.error('Error fetching comment:', error);
    return c.json({ error: 'Failed to fetch comment' }, 500);
  }
});

// POST /comments - Create new comment
commentRoutes.post('/', zValidator('json', createCommentSchema), async (c) => {
  const commentData = c.req.valid('json');

  try {
    const [newComment] = await db.insert(comments).values(commentData).returning();

    return c.json({ comment: newComment }, 201);
  } catch (error) {
    const requestId = c.get('requestId') || 'unknown';
    const logger = withRequestId(requestId);
    logger.error({ err: error, operation: 'create-comment' }, 'Failed to create comment');
    return c.json({ error: 'Failed to create comment' }, 500);
  }
});

// PUT /comments/:id - Update comment
commentRoutes.put(
  '/:id',
  zValidator('param', uuidParamSchema),
  zValidator('json', updateCommentSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const updateData = c.req.valid('json');

    try {
      const [updatedComment] = await db
        .update(comments)
        .set(updateData)
        .where(eq(comments.id, id))
        .returning();

      if (!updatedComment) {
        return c.json({ error: 'Comment not found' }, 404);
      }

      return c.json({ comment: updatedComment });
    } catch (error) {
      console.error('Error updating comment:', error);
      return c.json({ error: 'Failed to update comment' }, 500);
    }
  },
);

// DELETE /comments/:id - Delete comment
commentRoutes.delete('/:id', zValidator('param', uuidParamSchema), async (c) => {
  const { id } = c.req.valid('param');

  try {
    const [deletedComment] = await db.delete(comments).where(eq(comments.id, id)).returning();

    if (!deletedComment) {
      return c.json({ error: 'Comment not found' }, 404);
    }

    return c.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return c.json({ error: 'Failed to delete comment' }, 500);
  }
});

export { commentRoutes };
