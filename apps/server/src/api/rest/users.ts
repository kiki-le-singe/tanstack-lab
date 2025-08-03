import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, users } from '@/db/index.js';
import { 
  createUserSchema, 
  updateUserSchema, 
  uuidParamSchema,
  paginationSchema 
} from '@/schemas/validation.js';
import { eq } from 'drizzle-orm';

const userRoutes = new Hono();

// GET /users - List all users with pagination
userRoutes.get('/', zValidator('query', paginationSchema), async (c) => {
  const { page, limit } = c.req.valid('query');
  const offset = (page - 1) * limit;

  try {
    const userList = await db.select()
      .from(users)
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);

    return c.json({
      users: userList,
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

// GET /users/:id - Get user by ID
userRoutes.get('/:id', zValidator('param', uuidParamSchema), async (c) => {
  const { id } = c.req.valid('param');

  try {
    const user = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user: user[0] });
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