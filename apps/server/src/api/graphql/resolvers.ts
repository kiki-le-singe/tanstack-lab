import { and, desc, eq, type SQL } from 'drizzle-orm';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language/index.js';
import { categories, comments, db, posts, users } from '@/db/index.js';
import {
  createCategorySchema,
  createCommentSchema,
  createPostSchema,
  createUserSchema,
  updateCategorySchema,
  updateCommentSchema,
  updatePostSchema,
  updateUserSchema,
} from '@/schemas/validation.js';
import type {
  Category,
  Comment,
  CreateCategoryArgs,
  CreateCommentArgs,
  CreatePostArgs,
  CreateUserArgs,
  DeleteArgs,
  IdArgs,
  PaginationArgs,
  Post,
  PostsArgs,
  PostsByCategoryArgs,
  SlugArgs,
  UpdateCategoryArgs,
  UpdateCommentArgs,
  UpdatePostArgs,
  UpdateUserArgs,
  User,
} from './types.js';

// Custom DateTime scalar
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: unknown): string {
    // Handle Date instances
    if (value instanceof Date) {
      // Check if Date is valid
      if (Number.isNaN(value.getTime())) {
        throw new Error(`Invalid Date object: ${value}`);
      }
      return value.toISOString();
    }

    // Handle SQLite integer timestamps (convert seconds to milliseconds)
    if (typeof value === 'number') {
      // SQLite stores timestamps in seconds, JavaScript Date expects milliseconds
      const timestamp = value < 10000000000 ? value * 1000 : value;
      const date = new Date(timestamp);
      if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid timestamp: ${value}`);
      }
      return date.toISOString();
    }

    // Handle string timestamps
    if (typeof value === 'string') {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid date string: ${value}`);
      }
      return date.toISOString();
    }

    throw new Error(`Value is not a valid DateTime: ${value} (type: ${typeof value})`);
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
      return await db.query.users.findMany({
        limit,
        offset,
        orderBy: [users.createdAt],
      });
    },

    user: async (_: unknown, { id }: IdArgs) => {
      return await db.query.users.findFirst({
        where: eq(users.id, id),
      });
    },

    // Categories
    categories: async (_: unknown, { page = 1, limit = 10 }: PaginationArgs) => {
      const offset = (page - 1) * limit;
      return await db.query.categories.findMany({
        limit,
        offset,
        orderBy: [categories.name],
      });
    },

    category: async (_: unknown, { id }: IdArgs) => {
      return await db.query.categories.findFirst({
        where: eq(categories.id, id),
      });
    },

    categoryBySlug: async (_: unknown, { slug }: SlugArgs) => {
      return await db.query.categories.findFirst({
        where: eq(categories.slug, slug),
      });
    },

    // Posts
    posts: async (_: unknown, { page = 1, limit = 10, filters }: PostsArgs) => {
      const offset = (page - 1) * limit;

      // Build where condition for relational API
      let whereCondition: SQL | undefined;
      if (filters) {
        const conditions = [];
        if (filters.published !== undefined) {
          conditions.push(eq(posts.published, filters.published));
        }
        if (filters.authorId) {
          conditions.push(eq(posts.authorId, filters.authorId));
        }
        if (filters.categoryId) {
          conditions.push(eq(posts.categoryId, filters.categoryId));
        }
        whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
      }

      return await db.query.posts.findMany({
        where: whereCondition,
        limit,
        offset,
        orderBy: [desc(posts.createdAt)],
      });
    },

    post: async (_: unknown, { id }: IdArgs) => {
      return await db.query.posts.findFirst({
        where: eq(posts.id, id),
      });
    },

    postsByCategory: async (
      _: unknown,
      { categoryId, page = 1, limit = 10 }: PostsByCategoryArgs,
    ) => {
      const offset = (page - 1) * limit;
      return await db.query.posts.findMany({
        where: eq(posts.categoryId, categoryId),
        limit,
        offset,
        orderBy: [desc(posts.createdAt)],
      });
    },

    // Comments
    comments: async (_: unknown, { page = 1, limit = 10 }: PaginationArgs) => {
      const offset = (page - 1) * limit;
      return await db.query.comments.findMany({
        limit,
        offset,
        orderBy: [desc(comments.createdAt)],
      });
    },

    comment: async (_: unknown, { id }: IdArgs) => {
      return await db.query.comments.findFirst({
        where: eq(comments.id, id),
      });
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
