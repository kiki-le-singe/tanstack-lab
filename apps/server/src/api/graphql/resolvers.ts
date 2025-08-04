import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language/index.js';
import { db, users, categories, posts, comments } from '@/db/index.js';
import { eq, and, desc } from 'drizzle-orm';
import {
  createUserSchema,
  updateUserSchema,
  createCategorySchema,
  updateCategorySchema,
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  updateCommentSchema,
} from '@/schemas/validation.js';
import type {
  PaginationArgs,
  IdArgs,
  SlugArgs,
  PostsArgs,
  PostsByCategoryArgs,
  CreateUserArgs,
  UpdateUserArgs,
  CreateCategoryArgs,
  UpdateCategoryArgs,
  CreatePostArgs,
  UpdatePostArgs,
  CreateCommentArgs,
  UpdateCommentArgs,
  DeleteArgs,
  User,
  Category,
  Post,
  Comment,
} from './types.js';

// Custom DateTime scalar
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw new Error(`Value is not an instance of Date: ${value}`);
  },
  parseValue(value: unknown): Date {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error(`Value is not a valid DateTime: ${value}`);
  },
  parseLiteral(ast): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    throw new Error(`Can only parse strings to DateTime but got a: ${ast.kind}`);
  },
});

export const resolvers = {
  DateTime: DateTimeScalar,

  Query: {
    // Users
    users: async (_: unknown, { page = 1, limit = 10 }: PaginationArgs) => {
      const offset = (page - 1) * limit;
      const userList = await db
        .select()
        .from(users)
        .limit(limit)
        .offset(offset)
        .orderBy(users.createdAt);

      return {
        users: userList,
        pagination: {
          page,
          limit,
          hasMore: userList.length === limit,
        },
      };
    },

    user: async (_: unknown, { id }: IdArgs) => {
      const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

      return user[0] || null;
    },

    // Categories
    categories: async (_: unknown, { page = 1, limit = 10 }: PaginationArgs) => {
      const offset = (page - 1) * limit;
      const categoryList = await db
        .select()
        .from(categories)
        .limit(limit)
        .offset(offset)
        .orderBy(categories.name);

      return {
        categories: categoryList,
        pagination: {
          page,
          limit,
          hasMore: categoryList.length === limit,
        },
      };
    },

    category: async (_: unknown, { id }: IdArgs) => {
      const category = await db.select().from(categories).where(eq(categories.id, id)).limit(1);

      return category[0] || null;
    },

    categoryBySlug: async (_: unknown, { slug }: SlugArgs) => {
      const category = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);

      return category[0] || null;
    },

    // Posts
    posts: async (_: unknown, { page = 1, limit = 10, filters }: PostsArgs) => {
      const offset = (page - 1) * limit;

      // Build query conditions
      const conditions = [];
      if (filters?.published !== undefined) {
        conditions.push(eq(posts.published, filters.published));
      }
      if (filters?.authorId) {
        conditions.push(eq(posts.authorId, filters.authorId));
      }
      if (filters?.categoryId) {
        conditions.push(eq(posts.categoryId, filters.categoryId));
      }

      const postList = await db
        .select()
        .from(posts)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(posts.createdAt));

      return {
        posts: postList,
        pagination: {
          page,
          limit,
          hasMore: postList.length === limit,
        },
      };
    },

    post: async (_: unknown, { id }: IdArgs) => {
      const post = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

      return post[0] || null;
    },

    postsByCategory: async (_: unknown, { categoryId, page = 1, limit = 10 }: PostsByCategoryArgs) => {
      const offset = (page - 1) * limit;
      const postList = await db
        .select()
        .from(posts)
        .where(eq(posts.categoryId, categoryId))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(posts.createdAt));

      return {
        posts: postList,
        pagination: {
          page,
          limit,
          hasMore: postList.length === limit,
        },
      };
    },

    // Comments
    comments: async (_: unknown, { page = 1, limit = 10 }: PaginationArgs) => {
      const offset = (page - 1) * limit;
      const commentList = await db
        .select()
        .from(comments)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(comments.createdAt));

      return {
        comments: commentList,
        pagination: {
          page,
          limit,
          hasMore: commentList.length === limit,
        },
      };
    },

    comment: async (_: unknown, { id }: IdArgs) => {
      const comment = await db.select().from(comments).where(eq(comments.id, id)).limit(1);

      return comment[0] || null;
    },
  },

  Mutation: {
    // User mutations
    createUser: async (_: unknown, { input }: CreateUserArgs) => {
      const validatedInput = createUserSchema.parse(input);
      const [newUser] = await db.insert(users).values(validatedInput).returning();

      return newUser;
    },

    updateUser: async (_: unknown, { id, input }: UpdateUserArgs) => {
      const validatedInput = updateUserSchema.parse(input);
      const [updatedUser] = await db
        .update(users)
        .set(validatedInput)
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return updatedUser;
    },

    deleteUser: async (_: unknown, { id }: DeleteArgs) => {
      const [deletedUser] = await db.delete(users).where(eq(users.id, id)).returning();

      return !!deletedUser;
    },

    // Category mutations
    createCategory: async (_: unknown, { input }: CreateCategoryArgs) => {
      const validatedInput = createCategorySchema.parse(input);
      const [newCategory] = await db.insert(categories).values(validatedInput).returning();

      return newCategory;
    },

    updateCategory: async (_: unknown, { id, input }: UpdateCategoryArgs) => {
      const validatedInput = updateCategorySchema.parse(input);
      const [updatedCategory] = await db
        .update(categories)
        .set(validatedInput)
        .where(eq(categories.id, id))
        .returning();

      if (!updatedCategory) {
        throw new Error('Category not found');
      }

      return updatedCategory;
    },

    deleteCategory: async (_: unknown, { id }: DeleteArgs) => {
      const [deletedCategory] = await db
        .delete(categories)
        .where(eq(categories.id, id))
        .returning();

      return !!deletedCategory;
    },

    // Post mutations
    createPost: async (_: unknown, { input }: CreatePostArgs) => {
      const validatedInput = createPostSchema.parse(input);
      const [newPost] = await db.insert(posts).values(validatedInput).returning();

      return newPost;
    },

    updatePost: async (_: unknown, { id, input }: UpdatePostArgs) => {
      const validatedInput = updatePostSchema.parse(input);
      const [updatedPost] = await db
        .update(posts)
        .set(validatedInput)
        .where(eq(posts.id, id))
        .returning();

      if (!updatedPost) {
        throw new Error('Post not found');
      }

      return updatedPost;
    },

    deletePost: async (_: unknown, { id }: DeleteArgs) => {
      const [deletedPost] = await db.delete(posts).where(eq(posts.id, id)).returning();

      return !!deletedPost;
    },

    // Comment mutations
    createComment: async (_: unknown, { input }: CreateCommentArgs) => {
      const validatedInput = createCommentSchema.parse(input);
      const [newComment] = await db.insert(comments).values(validatedInput).returning();

      return newComment;
    },

    updateComment: async (_: unknown, { id, input }: UpdateCommentArgs) => {
      const validatedInput = updateCommentSchema.parse(input);
      const [updatedComment] = await db
        .update(comments)
        .set(validatedInput)
        .where(eq(comments.id, id))
        .returning();

      if (!updatedComment) {
        throw new Error('Comment not found');
      }

      return updatedComment;
    },

    deleteComment: async (_: unknown, { id }: DeleteArgs) => {
      const [deletedComment] = await db.delete(comments).where(eq(comments.id, id)).returning();

      return !!deletedComment;
    },
  },

  // Optimized field resolvers using relational queries
  User: {
    posts: async (parent: User) => {
      return await db.query.posts.findMany({
        where: eq(posts.authorId, parent.id),
        orderBy: [desc(posts.createdAt)],
        with: {
          category: true, // Include category data in case it's requested
        },
      });
    },

    comments: async (parent: User) => {
      return await db.query.comments.findMany({
        where: eq(comments.authorId, parent.id),
        orderBy: [desc(comments.createdAt)],
        with: {
          post: {
            columns: { id: true, title: true }, // Basic post info
          },
        },
      });
    },
  },

  Category: {
    posts: async (parent: Category) => {
      return await db.query.posts.findMany({
        where: eq(posts.categoryId, parent.id),
        orderBy: [desc(posts.createdAt)],
        with: {
          author: {
            columns: { id: true, name: true, avatarUrl: true },
          },
        },
      });
    },
  },

  Post: {
    author: async (parent: Post) => {
      // Return cached author if already loaded, otherwise query
      if (parent.author && parent.author.id === parent.authorId) {
        return parent.author;
      }

      return await db.query.users.findFirst({
        where: eq(users.id, parent.authorId),
      });
    },

    category: async (parent: Post) => {
      // Return cached category if already loaded, otherwise query
      if (parent.category && parent.category.id === parent.categoryId) {
        return parent.category;
      }

      return await db.query.categories.findFirst({
        where: eq(categories.id, parent.categoryId),
      });
    },

    comments: async (parent: Post) => {
      return await db.query.comments.findMany({
        where: eq(comments.postId, parent.id),
        orderBy: [comments.createdAt],
        with: {
          author: {
            columns: { id: true, name: true, avatarUrl: true },
          },
        },
      });
    },
  },

  Comment: {
    post: async (parent: Comment) => {
      // Return cached post if already loaded, otherwise query
      if (parent.post && parent.post.id === parent.postId) {
        return parent.post;
      }

      return await db.query.posts.findFirst({
        where: eq(posts.id, parent.postId),
        with: {
          author: {
            columns: { id: true, name: true, avatarUrl: true },
          },
          category: true,
        },
      });
    },

    author: async (parent: Comment) => {
      // Return cached author if already loaded, otherwise query
      if (parent.author && parent.author.id === parent.authorId) {
        return parent.author;
      }

      return await db.query.users.findFirst({
        where: eq(users.id, parent.authorId),
      });
    },
  },
};
