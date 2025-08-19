import type { ApiClient, ApiResponse, PaginatedResponse, User, UserWithRelations } from '@tanstack-lab/shared';

const API_BASE = 'http://localhost:3000'; // Your server URL

class TanStackApiClient implements ApiClient {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Users
  async getUsers(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<User>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.fetch(`/api/users${query ? `?${query}` : ''}`);
  }

  async getUser(id: string): Promise<ApiResponse<UserWithRelations>> {
    return this.fetch(`/api/users/${id}`);
  }

  async createUser(data: any): Promise<ApiResponse<User>> {
    return this.fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: any): Promise<ApiResponse<User>> {
    return this.fetch(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<null>> {
    return this.fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Posts (simplified implementation - you can expand these)
  async getPosts(): Promise<any> {
    return this.fetch('/api/posts');
  }

  async getPost(id: string): Promise<any> {
    return this.fetch(`/api/posts/${id}`);
  }

  async createPost(): Promise<any> { throw new Error('Not implemented'); }
  async updatePost(): Promise<any> { throw new Error('Not implemented'); }
  async deletePost(): Promise<any> { throw new Error('Not implemented'); }

  // Comments (simplified implementation)
  async getComments(): Promise<any> {
    return this.fetch('/api/comments');
  }

  async getComment(id: string): Promise<any> {
    return this.fetch(`/api/comments/${id}`);
  }

  async createComment(): Promise<any> { throw new Error('Not implemented'); }
  async updateComment(): Promise<any> { throw new Error('Not implemented'); }
  async deleteComment(): Promise<any> { throw new Error('Not implemented'); }

  // Categories (simplified implementation)
  async getCategories(): Promise<any> {
    return this.fetch('/api/categories');
  }

  async getCategory(id: string): Promise<any> {
    return this.fetch(`/api/categories/${id}`);
  }

  async createCategory(): Promise<any> { throw new Error('Not implemented'); }
  async updateCategory(): Promise<any> { throw new Error('Not implemented'); }
  async deleteCategory(): Promise<any> { throw new Error('Not implemented'); }
}

export const apiClient = new TanStackApiClient();