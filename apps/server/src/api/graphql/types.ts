import type {
  CreateCategory,
  CreateComment,
  CreatePost,
  CreateUser,
  PostFilters,
  UpdateCategory,
  UpdateComment,
  UpdatePost,
  UpdateUser,
} from '@/schemas/validation.js';

// Database entity types (inferred from Drizzle schema)
export interface User {
  id: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
  categoryId: string;
  createdAt: Date;
  // Optional relations (when included via with clause)
  author?: User;
  category?: Category;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  createdAt: Date;
  // Optional relations (when included via with clause)
  post?: Post;
  author?: User;
}

// GraphQL Connection types
export interface PaginationInfo {
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface UsersConnection {
  users: User[];
  pagination: PaginationInfo;
}

export interface CategoriesConnection {
  categories: Category[];
  pagination: PaginationInfo;
}

export interface PostsConnection {
  posts: Post[];
  pagination: PaginationInfo;
}

export interface CommentsConnection {
  comments: Comment[];
  pagination: PaginationInfo;
}

// GraphQL Query argument types
export interface PaginationArgs {
  page?: number;
  limit?: number;
}

export interface IdArgs {
  id: string;
}

export interface SlugArgs {
  slug: string;
}

export interface PostsArgs extends PaginationArgs {
  filters?: PostFilters;
}

export interface PostsByCategoryArgs extends PaginationArgs {
  categoryId: string;
}

// GraphQL Mutation argument types
export interface CreateUserArgs {
  input: CreateUser;
}

export interface UpdateUserArgs {
  id: string;
  input: UpdateUser;
}

export interface CreateCategoryArgs {
  input: CreateCategory;
}

export interface UpdateCategoryArgs {
  id: string;
  input: UpdateCategory;
}

export interface CreatePostArgs {
  input: CreatePost;
}

export interface UpdatePostArgs {
  id: string;
  input: UpdatePost;
}

export interface CreateCommentArgs {
  input: CreateComment;
}

export interface UpdateCommentArgs {
  id: string;
  input: UpdateComment;
}

export interface DeleteArgs {
  id: string;
}

// GraphQL Context type (can be extended later)
export type GraphQLContext = Record<string, unknown>;

// Resolver function types
export type QueryResolvers = {
  users: (
    parent: unknown,
    args: PaginationArgs,
    context: GraphQLContext,
  ) => Promise<UsersConnection>;
  user: (parent: unknown, args: IdArgs, context: GraphQLContext) => Promise<User | null>;
  categories: (
    parent: unknown,
    args: PaginationArgs,
    context: GraphQLContext,
  ) => Promise<CategoriesConnection>;
  category: (parent: unknown, args: IdArgs, context: GraphQLContext) => Promise<Category | null>;
  categoryBySlug: (
    parent: unknown,
    args: SlugArgs,
    context: GraphQLContext,
  ) => Promise<Category | null>;
  posts: (parent: unknown, args: PostsArgs, context: GraphQLContext) => Promise<PostsConnection>;
  post: (parent: unknown, args: IdArgs, context: GraphQLContext) => Promise<Post | null>;
  postsByCategory: (
    parent: unknown,
    args: PostsByCategoryArgs,
    context: GraphQLContext,
  ) => Promise<PostsConnection>;
  comments: (
    parent: unknown,
    args: PaginationArgs,
    context: GraphQLContext,
  ) => Promise<CommentsConnection>;
  comment: (parent: unknown, args: IdArgs, context: GraphQLContext) => Promise<Comment | null>;
};

export type MutationResolvers = {
  createUser: (parent: unknown, args: CreateUserArgs, context: GraphQLContext) => Promise<User>;
  updateUser: (parent: unknown, args: UpdateUserArgs, context: GraphQLContext) => Promise<User>;
  deleteUser: (parent: unknown, args: DeleteArgs, context: GraphQLContext) => Promise<boolean>;
  createCategory: (
    parent: unknown,
    args: CreateCategoryArgs,
    context: GraphQLContext,
  ) => Promise<Category>;
  updateCategory: (
    parent: unknown,
    args: UpdateCategoryArgs,
    context: GraphQLContext,
  ) => Promise<Category>;
  deleteCategory: (parent: unknown, args: DeleteArgs, context: GraphQLContext) => Promise<boolean>;
  createPost: (parent: unknown, args: CreatePostArgs, context: GraphQLContext) => Promise<Post>;
  updatePost: (parent: unknown, args: UpdatePostArgs, context: GraphQLContext) => Promise<Post>;
  deletePost: (parent: unknown, args: DeleteArgs, context: GraphQLContext) => Promise<boolean>;
  createComment: (
    parent: unknown,
    args: CreateCommentArgs,
    context: GraphQLContext,
  ) => Promise<Comment>;
  updateComment: (
    parent: unknown,
    args: UpdateCommentArgs,
    context: GraphQLContext,
  ) => Promise<Comment>;
  deleteComment: (parent: unknown, args: DeleteArgs, context: GraphQLContext) => Promise<boolean>;
};

// Field resolver types
export type UserFieldResolvers = {
  posts: (parent: User, args: unknown, context: GraphQLContext) => Promise<Post[]>;
  comments: (parent: User, args: unknown, context: GraphQLContext) => Promise<Comment[]>;
};

export type CategoryFieldResolvers = {
  posts: (parent: Category, args: unknown, context: GraphQLContext) => Promise<Post[]>;
};

export type PostFieldResolvers = {
  author: (parent: Post, args: unknown, context: GraphQLContext) => Promise<User | null>;
  category: (parent: Post, args: unknown, context: GraphQLContext) => Promise<Category | null>;
  comments: (parent: Post, args: unknown, context: GraphQLContext) => Promise<Comment[]>;
};

export type CommentFieldResolvers = {
  post: (parent: Comment, args: unknown, context: GraphQLContext) => Promise<Post | null>;
  author: (parent: Comment, args: unknown, context: GraphQLContext) => Promise<User | null>;
};
