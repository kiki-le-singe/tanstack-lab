import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, users, posts, comments } from '@/db/index.js';
import { 
  createUserSchema, 
  updateUserSchema, 
  uuidParamSchema,
  paginationSchema 
} from '@/schemas/validation.js';
import { eq, desc } from 'drizzle-orm';

const userRoutes = new Hono();

// GET /users - List all users with pagination
userRoutes.get('/', zValidator('query', paginationSchema), async (c) => {
  const { page, limit } = c.req.valid('query');
  const offset = (page - 1) * limit;

  try {
    // Modern relational query with post counts
    const userList = await db.query.users.findMany({
      limit,
      offset,
      orderBy: [users.createdAt],
      with: {
        posts: {
          columns: { id: true }, // Only get IDs for counting
          where: eq(posts.published, true), // Only published posts
        },
      },
    });

    // Transform to include post count
    const usersWithCounts = userList.map(user => ({
      ...user,
      postCount: user.posts.length,
      posts: undefined, // Remove the posts array, just keep the count
    }));

    return c.json({
      users: usersWithCounts,
      pagination: {
        page,
        limit,
        hasMore: userList.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// GET /users/:id - Get user by ID with posts and comments
userRoutes.get('/:id', zValidator('param', uuidParamSchema), async (c) => {
  const { id } = c.req.valid('param');

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        posts: {
          with: {
            category: {
              columns: { id: true, name: true, slug: true },
            },
          },
          orderBy: [desc(posts.createdAt)],
        },
        comments: {
          with: {
            post: {
              columns: { id: true, title: true },
            },
          },
          orderBy: [desc(comments.createdAt)],
          limit: 10, // Limit recent comments
        },
      },
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

// POST /users - Create new user
userRoutes.post('/', zValidator('json', createUserSchema), async (c) => {
  const userData = c.req.valid('json');

  try {
    const [newUser] = await db.insert(users)
      .values(userData)
      .returning();

    return c.json({ user: newUser }, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// PUT /users/:id - Update user
userRoutes.put('/:id', 
  zValidator('param', uuidParamSchema),
  zValidator('json', updateUserSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const updateData = c.req.valid('json');

    try {
      const [updatedUser] = await db.update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        return c.json({ error: 'User not found' }, 404);
      }

      return c.json({ user: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      return c.json({ error: 'Failed to update user' }, 500);
    }
  }
);

// DELETE /users/:id - Delete user
userRoutes.delete('/:id', zValidator('param', uuidParamSchema), async (c) => {
  const { id } = c.req.valid('param');

  try {
    const [deletedUser] = await db.delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!deletedUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

export { userRoutes };