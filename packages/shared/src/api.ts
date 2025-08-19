// API endpoint types for type-safe client calls
import type { 
  User, 
  Post, 
  Comment, 
  Category, 
  UserWithRelations,
  PostWithRelations,
  CommentWithRelations,
  ApiResponse,
  PaginatedResponse
} from './types.js';

import type {
  CreateUser,
  UpdateUser,
  CreatePost,
  UpdatePost,
  CreateComment,
  UpdateComment,
  CreateCategory,
  UpdateCategory,
  Pagination,
  PostFilters
} from './schemas.js';

// API Client types
export interface ApiClient {
  // Users
  getUsers(params?: Pagination): Promise<PaginatedResponse<User>>;
  getUser(id: string): Promise<ApiResponse<UserWithRelations>>;
  createUser(data: CreateUser): Promise<ApiResponse<User>>;
  updateUser(id: string, data: UpdateUser): Promise<ApiResponse<User>>;
  deleteUser(id: string): Promise<ApiResponse<null>>;

  // Posts  
  getPosts(params?: Pagination & PostFilters): Promise<PaginatedResponse<PostWithRelations>>;
  getPost(id: string): Promise<ApiResponse<PostWithRelations>>;
  createPost(data: CreatePost): Promise<ApiResponse<Post>>;
  updatePost(id: string, data: UpdatePost): Promise<ApiResponse<Post>>;
  deletePost(id: string): Promise<ApiResponse<null>>;

  // Comments
  getComments(params?: Pagination & { postId?: string }): Promise<PaginatedResponse<CommentWithRelations>>;
  getComment(id: string): Promise<ApiResponse<CommentWithRelations>>;
  createComment(data: CreateComment): Promise<ApiResponse<Comment>>;
  updateComment(id: string, data: UpdateComment): Promise<ApiResponse<Comment>>;
  deleteComment(id: string): Promise<ApiResponse<null>>;

  // Categories
  getCategories(params?: Pagination): Promise<PaginatedResponse<Category>>;
  getCategory(id: string): Promise<ApiResponse<Category>>;
  createCategory(data: CreateCategory): Promise<ApiResponse<Category>>;
  updateCategory(id: string, data: UpdateCategory): Promise<ApiResponse<Category>>;
  deleteCategory(id: string): Promise<ApiResponse<null>>;
}

// API Routes (for TanStack Router path matching)
export const API_ROUTES = {
  users: '/api/users',
  user: (id: string) => `/api/users/${id}`,
  posts: '/api/posts',
  post: (id: string) => `/api/posts/${id}`,
  comments: '/api/comments',
  comment: (id: string) => `/api/comments/${id}`,
  categories: '/api/categories',
  category: (id: string) => `/api/categories/${id}`,
} as const;