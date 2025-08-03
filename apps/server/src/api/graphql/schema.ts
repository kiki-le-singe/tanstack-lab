export const typeDefs = /* GraphQL */ `
  scalar DateTime

  type User {
    id: ID!
    name: String!
    avatarUrl: String
    createdAt: DateTime!
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    published: Boolean!
    createdAt: DateTime!
    author: User!
    category: Category!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    content: String!
    createdAt: DateTime!
    post: Post!
    author: User!
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    hasMore: Boolean!
  }

  type PostsConnection {
    posts: [Post!]!
    pagination: PaginationInfo!
  }

  type UsersConnection {
    users: [User!]!
    pagination: PaginationInfo!
  }

  type CategoriesConnection {
    categories: [Category!]!
    pagination: PaginationInfo!
  }

  type CommentsConnection {
    comments: [Comment!]!
    pagination: PaginationInfo!
  }

  input CreateUserInput {
    name: String!
    avatarUrl: String
  }

  input UpdateUserInput {
    name: String
    avatarUrl: String
  }

  input CreateCategoryInput {
    name: String!
    slug: String!
  }

  input UpdateCategoryInput {
    name: String
    slug: String
  }

  input CreatePostInput {
    title: String!
    content: String!
    published: Boolean = false
    authorId: ID!
    categoryId: ID!
  }

  input UpdatePostInput {
    title: String
    content: String
    published: Boolean
    categoryId: ID
  }

  input CreateCommentInput {
    content: String!
    postId: ID!
    authorId: ID!
  }

  input UpdateCommentInput {
    content: String!
  }

  input PostFilters {
    published: Boolean
    authorId: ID
    categoryId: ID
    categorySlug: String
  }

  type Query {
    # Users
    users(page: Int = 1, limit: Int = 10): UsersConnection!
    user(id: ID!): User
    
    # Categories
    categories(page: Int = 1, limit: Int = 10): CategoriesConnection!
    category(id: ID!): Category
    categoryBySlug(slug: String!): Category
    
    # Posts
    posts(page: Int = 1, limit: Int = 10, filters: PostFilters): PostsConnection!
    post(id: ID!): Post
    postsByCategory(categoryId: ID!, page: Int = 1, limit: Int = 10): PostsConnection!
    
    # Comments
    comments(page: Int = 1, limit: Int = 10): CommentsConnection!
    comment(id: ID!): Comment
  }

  type Mutation {
    # Users
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    
    # Categories
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
    
    # Posts
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!
    
    # Comments
    createComment(input: CreateCommentInput!): Comment!
    updateComment(id: ID!, input: UpdateCommentInput!): Comment!
    deleteComment(id: ID!): Boolean!
  }
`;