import { zValidator } from '@hono/zod-validator';
import { desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { categories, db, posts } from '@/db/index.js';
import { apiCreated, apiError, apiSuccessWithPagination } from '@/lib/response.js';
import {
  createCategorySchema,
  paginationSchema,
  updateCategorySchema,
  uuidParamSchema,
} from '@/schemas/validation.js';

const categoryRoutes = new Hono();

// GET /categories - List all categories
categoryRoutes.get('/', zValidator('query', paginationSchema), async (c) => {
  const { page, limit } = c.req.valid('query');
  const offset = (page - 1) * limit;

  try {
    const categoryList = await db.query.categories.findMany({
      limit,
      offset,
      orderBy: [categories.name],
    });

    return apiSuccessWithPagination(c, categoryList, {
      page,
      limit,
      hasMore: categoryList.length === limit,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return apiError(c, 'Could not retrieve categories from database', 500);
  }
});

// GET /categories/:id - Get category by ID
categoryRoutes.get('/:id', zValidator('param', uuidParamSchema), async (c) => {
  const { id } = c.req.valid('param');

  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!category) {
      return c.json({ error: 'Category not found' }, 404);
    }

    return c.json({ category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return c.json({ error: 'Failed to fetch category' }, 500);
  }
});

// GET /categories/slug/:slug - Get category by slug
categoryRoutes.get('/slug/:slug', async (c) => {
  const slug = c.req.param('slug');

  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });

    if (!category) {
      return c.json({ error: 'Category not found' }, 404);
    }

    return c.json({ category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return c.json({ error: 'Failed to fetch category' }, 500);
  }
});

// GET /categories/:id/posts - Get posts in a category
categoryRoutes.get(
  '/:id/posts',
  zValidator('param', uuidParamSchema),
  zValidator('query', paginationSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const { page, limit } = c.req.valid('query');
    const offset = (page - 1) * limit;

    try {
      const categoryPosts = await db.query.posts.findMany({
        where: eq(posts.categoryId, id),
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
        orderBy: [desc(posts.createdAt)],
      });

      return c.json({
        posts: categoryPosts,
        pagination: {
          page,
          limit,
          hasMore: categoryPosts.length === limit,
        },
      });
    } catch (error) {
      console.error('Error fetching category posts:', error);
      return c.json({ error: 'Failed to fetch category posts' }, 500);
    }
  },
);

// POST /categories - Create new category
categoryRoutes.post('/', zValidator('json', createCategorySchema), async (c) => {
  const categoryData = c.req.valid('json');

  try {
    const [newCategory] = await db.insert(categories).values(categoryData).returning();

    return apiCreated(c, { category: newCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

// PUT /categories/:id - Update category
categoryRoutes.put(
  '/:id',
  zValidator('param', uuidParamSchema),
  zValidator('json', updateCategorySchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const updateData = c.req.valid('json');

    try {
      const [updatedCategory] = await db
        .update(categories)
        .set(updateData)
        .where(eq(categories.id, id))
        .returning();

      if (!updatedCategory) {
        return c.json({ error: 'Category not found' }, 404);
      }

      return c.json({ category: updatedCategory });
    } catch (error) {
      console.error('Error updating category:', error);
      return c.json({ error: 'Failed to update category' }, 500);
    }
  },
);

// DELETE /categories/:id - Delete category
categoryRoutes.delete('/:id', zValidator('param', uuidParamSchema), async (c) => {
  const { id } = c.req.valid('param');

  try {
    const [deletedCategory] = await db.delete(categories).where(eq(categories.id, id)).returning();

    if (!deletedCategory) {
      return c.json({ error: 'Category not found' }, 404);
    }

    return c.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return c.json({ error: 'Failed to delete category' }, 500);
  }
});

export { categoryRoutes };
