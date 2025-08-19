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
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  createdAt: Date;
}

// Extended types with relations
export interface UserWithRelations extends User {
  posts?: Post[];
  comments?: Comment[];
}

export interface PostWithRelations extends Post {
  author?: User;
  category?: Category;
  comments?: Comment[];
}

export interface CommentWithRelations extends Comment {
  post?: Post;
  author?: User;
}

// API Response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      hasMore: boolean;
    };
  };
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;