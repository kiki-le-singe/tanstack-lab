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
  updateCommentSchema
} from '@/schemas/validation.js';

// Custom DateTime scalar
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw new Error('Value is not an instance of Date: ' + value);
  },
  parseValue(value: unknown): Date {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('Value is not a valid DateTime: ' + value);
  },
  parseLiteral(ast): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    throw new Error('Can only parse strings to DateTime but got a: ' + ast.kind);
  },
});

export const resolvers = {
  DateTime: DateTimeScalar,

  Query: {
    // Users
    users: async (_: unknown, { page = 1, limit = 10 }: { page?: number; limit?: number }) => {
      const offset = (page - 1) * limit;
      const userList = await db.select()
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

    user: async (_: unknown, { id }: { id: string }) => {
      const user = await db.select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      
      return user[0] || null;
    },

    // Categories
    categories: async (_: unknown, { page = 1, limit = 10 }: { page?: number; limit?: number }) => {
      const offset = (page - 1) * limit;
      const categoryList = await db.select()
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

    category: async (_: unknown, { id }: { id: string }) => {
      const category = await db.select()
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1);
      
      return category[0] || null;
    },

    categoryBySlug: async (_: unknown, { slug }: { slug: string }) => {
      const category = await db.select()
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1);
      
      return category[0] || null;
    },

    // Posts
    posts: async (_: unknown, { 
      page = 1, 
      limit = 10, 
      filters 
    }: { 
      page?: number; 
      limit?: number; 
      filters?: {
        published?: boolean;
        authorId?: string;
        categoryId?: string;
        categorySlug?: string;
      }
    }) => {
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

      const postList = await db.select()
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

    post: async (_: unknown, { id }: { id: string }) => {
      const post = await db.select()
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1);
      
      return post[0] || null;
    },

    postsByCategory: async (_: unknown, { 
      categoryId, 
      page = 1, 
      limit = 10 
    }: { 
      categoryId: string; 
      page?: number; 
      limit?: number; 
    }) => {
      const offset = (page - 1) * limit;
      const postList = await db.select()
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
    comments: async (_: unknown, { page = 1, limit = 10 }: { page?: number; limit?: number }) => {
      const offset = (page - 1) * limit;
      const commentList = await db.select()
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

    comment: async (_: unknown, { id }: { id: string }) => {
      const comment = await db.select()
        .from(comments)
        .where(eq(comments.id, id))
        .limit(1);
      
      return comment[0] || null;
    },
  },

  Mutation: {
    // User mutations
    createUser: async (_: unknown, { input }: { input: any }) => {
      const validatedInput = createUserSchema.parse(input);
      const [newUser] = await db.insert(users)
        .values(validatedInput)
        .returning();
      
      return newUser;
    },

    updateUser: async (_: unknown, { id, input }: { id: string; input: any }) => {
      const validatedInput = updateUserSchema.parse(input);
      const [updatedUser] = await db.update(users)
        .set(validatedInput)
        .where(eq(users.id, id))
        .returning();
      
      if (!updatedUser) {
        throw new Error('User not found');
      }
      
      return updatedUser;
    },

    deleteUser: async (_: unknown, { id }: { id: string }) => {
      const [deletedUser] = await db.delete(users)
        .where(eq(users.id, id))
        .returning();
      
      return !!deletedUser;
    },

    // Category mutations
    createCategory: async (_: unknown, { input }: { input: any }) => {
      const validatedInput = createCategorySchema.parse(input);
      const [newCategory] = await db.insert(categories)
        .values(validatedInput)
        .returning();
      
      return newCategory;
    },

    updateCategory: async (_: unknown, { id, input }: { id: string; input: any }) => {
      const validatedInput = updateCategorySchema.parse(input);
      const [updatedCategory] = await db.update(categories)
        .set(validatedInput)
        .where(eq(categories.id, id))
        .returning();
      
      if (!updatedCategory) {
        throw new Error('Category not found');
      }
      
      return updatedCategory;
    },

    deleteCategory: async (_: unknown, { id }: { id: string }) => {
      const [deletedCategory] = await db.delete(categories)
        .where(eq(categories.id, id))
        .returning();
      
      return !!deletedCategory;
    },

    // Post mutations
    createPost: async (_: unknown, { input }: { input: any }) => {
      const validatedInput = createPostSchema.parse(input);
      const [newPost] = await db.insert(posts)
        .values(validatedInput)
        .returning();
      
      return newPost;
    },

    updatePost: async (_: unknown, { id, input }: { id: string; input: any }) => {
      const validatedInput = updatePostSchema.parse(input);
      const [updatedPost] = await db.update(posts)
        .set(validatedInput)
        .where(eq(posts.id, id))
        .returning();
      
      if (!updatedPost) {
        throw new Error('Post not found');
      }
      
      return updatedPost;
    },

    deletePost: async (_: unknown, { id }: { id: string }) => {
      const [deletedPost] = await db.delete(posts)
        .where(eq(posts.id, id))
        .returning();
      
      return !!deletedPost;
    },

    // Comment mutations
    createComment: async (_: unknown, { input }: { input: any }) => {
      const validatedInput = createCommentSchema.parse(input);
      const [newComment] = await db.insert(comments)
        .values(validatedInput)
        .returning();
      
      return newComment;
    },

    updateComment: async (_: unknown, { id, input }: { id: string; input: any }) => {
      const validatedInput = updateCommentSchema.parse(input);
      const [updatedComment] = await db.update(comments)
        .set(validatedInput)
        .where(eq(comments.id, id))
        .returning();
      
      if (!updatedComment) {
        throw new Error('Comment not found');
      }
      
      return updatedComment;
    },

    deleteComment: async (_: unknown, { id }: { id: string }) => {
      const [deletedComment] = await db.delete(comments)
        .where(eq(comments.id, id))
        .returning();
      
      return !!deletedComment;
    },
  },

  // Field resolvers for relationships
  User: {
    posts: async (parent: any) => {
      return await db.select()
        .from(posts)
        .where(eq(posts.authorId, parent.id))
        .orderBy(desc(posts.createdAt));
    },

    comments: async (parent: any) => {
      return await db.select()
        .from(comments)
        .where(eq(comments.authorId, parent.id))
        .orderBy(desc(comments.createdAt));
    },
  },

  Category: {
    posts: async (parent: any) => {
      return await db.select()
        .from(posts)
        .where(eq(posts.categoryId, parent.id))
        .orderBy(desc(posts.createdAt));
    },
  },

  Post: {
    author: async (parent: any) => {
      const author = await db.select()
        .from(users)
        .where(eq(users.id, parent.authorId))
        .limit(1);
      
      return author[0];
    },

    category: async (parent: any) => {
      const category = await db.select()
        .from(categories)
        .where(eq(categories.id, parent.categoryId))
        .limit(1);
      
      return category[0];
    },

    comments: async (parent: any) => {
      return await db.select()
        .from(comments)
        .where(eq(comments.postId, parent.id))
        .orderBy(comments.createdAt);
    },
  },

  Comment: {
    post: async (parent: any) => {
      const post = await db.select()
        .from(posts)
        .where(eq(posts.id, parent.postId))
        .limit(1);
      
      return post[0];
    },

    author: async (parent: any) => {
      const author = await db.select()
        .from(users)
        .where(eq(users.id, parent.authorId))
        .limit(1);
      
      return author[0];
    },
  },
};