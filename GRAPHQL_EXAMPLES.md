# GraphQL API Examples

Quick reference for testing the TanStack Lab GraphQL API at `http://localhost:3001/graphql`

## 🚀 Basic Queries

### Get All Users
```graphql
{
  users {
    id
    name
    avatarUrl
    createdAt
    updatedAt
  }
}
```

### Get All Posts with Authors
```graphql
{
  posts {
    id
    title
    published
    createdAt
    updatedAt
    author {
      name
      avatarUrl
    }
    category {
      name
      slug
    }
  }
}
```

### Get Posts with Comments
```graphql
{
  posts(limit: 5) {
    title
    content
    createdAt
    updatedAt
    author {
      name
    }
    comments {
      content
      createdAt
      updatedAt
      author {
        name
      }
    }
  }
}
```

## 📄 Pagination Queries (Enhanced!)

### Users with Pagination
```graphql
{
  usersWithPagination(page: 1, limit: 5) {
    users {
      name
      avatarUrl
      createdAt
    }
    pagination {
      page
      limit
      hasMore
      total
    }
  }
}
```

### Posts with Pagination and Filters
```graphql
{
  postsWithPagination(page: 1, limit: 3, filters: { published: true }) {
    posts {
      title
      published
      createdAt
      author {
        name
      }
      category {
        name
      }
    }
    pagination {
      page
      limit
      hasMore
      total
    }
  }
}
```

## 🔍 Single Item Queries

### Get Specific User
```graphql
{
  user(id: "1") {
    name
    avatarUrl
    createdAt
    updatedAt
    posts {
      title
      published
      updatedAt
    }
    comments {
      content
      createdAt
      post {
        title
      }
    }
  }
}
```

### Get Specific Post
```graphql
{
  post(id: "1") {
    title
    content
    published
    createdAt
    updatedAt
    author {
      name
      avatarUrl
    }
    category {
      name
      slug
    }
    comments {
      content
      createdAt
      updatedAt
      author {
        name
      }
    }
  }
}
```

### Get Category by Slug
```graphql
{
  categoryBySlug(slug: "dev") {
    name
    posts {
      title
      author {
        name
      }
    }
  }
}
```

## ✏️ Mutations

### Create User
```graphql
mutation {
  createUser(input: {
    name: "New Developer"
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=newdev"
  }) {
    id
    name
    avatarUrl
    createdAt
  }
}
```

### Create Post
```graphql
mutation {
  createPost(input: {
    title: "My First GraphQL Post"
    content: "Learning GraphQL with TanStack Lab!"
    published: true
    authorId: "1"
    categoryId: "1"
  }) {
    id
    title
    published
    author {
      name
    }
    category {
      name
    }
  }
}
```

### Create Comment
```graphql
mutation {
  createComment(input: {
    content: "Great post! Very helpful."
    postId: "1"
    authorId: "2"
  }) {
    id
    content
    createdAt
    author {
      name
    }
    post {
      title
    }
  }
}
```

### Update Post
```graphql
mutation {
  updatePost(id: "1", input: {
    title: "Updated Post Title"
    published: true
  }) {
    id
    title
    published
    updatedAt: createdAt
  }
}
```

## 🎯 Complex Queries

### Full Blog Data Structure
```graphql
{
  categories {
    name
    slug
    posts(limit: 2) {
      title
      published
      author {
        name
        avatarUrl
      }
      comments {
        content
        author {
          name
        }
      }
    }
  }
}
```

### User Activity Overview
```graphql
{
  user(id: "1") {
    name
    avatarUrl
    posts {
      title
      published
      category {
        name
      }
      comments {
        content
        author {
          name
        }
      }
    }
    comments {
      content
      post {
        title
        author {
          name
        }
      }
    }
  }
}
```

## 🔧 Advanced Filtering & Search

### 🔍 Search Posts by Content
```graphql
{
  posts(filters: { search: "TypeScript" }) {
    title
    content
    author {
      name
    }
    category {
      name
    }
  }
}
```

### 🔍 Search with Pagination
```graphql
{
  postsWithPagination(
    page: 1, 
    limit: 5, 
    filters: { search: "GraphQL", published: true }
  ) {
    posts {
      title
      content
      author {
        name
      }
    }
    pagination {
      page
      limit
      hasMore
      total
    }
  }
}
```

### Published Posts Only
```graphql
{
  posts(filters: { published: true }) {
    title
    author {
      name
    }
  }
}
```

### Posts by Specific Author
```graphql
{
  posts(filters: { authorId: "1" }) {
    title
    published
    updatedAt
    category {
      name
    }
  }
}
```

### Posts in Specific Category
```graphql
{
  posts(filters: { categoryId: "1" }) {
    title
    author {
      name
    }
  }
}
```

## 📊 Sorting & Ordering

### Sort Posts by Title (A-Z)
```graphql
{
  posts(sortBy: TITLE, sortDirection: ASC) {
    title
    createdAt
    author {
      name
    }
  }
}
```

### Sort Posts by Most Recent Updates
```graphql
{
  posts(sortBy: UPDATED_AT, sortDirection: DESC) {
    title
    updatedAt
    author {
      name
    }
  }
}
```

### Sort with Pagination
```graphql
{
  postsWithPagination(
    page: 1,
    limit: 5,
    sortBy: CREATED_AT,
    sortDirection: DESC
  ) {
    posts {
      title
      createdAt
      author {
        name
      }
    }
    pagination {
      page
      limit
      hasMore
      total
    }
  }
}
```

## 🚀 Production Features

### Complex Query with Multiple Relations
```graphql
{
  postsWithPagination(
    page: 1,
    limit: 3,
    filters: { published: true, search: "development" },
    sortBy: UPDATED_AT,
    sortDirection: DESC
  ) {
    posts {
      title
      content
      createdAt
      updatedAt
      author {
        name
        avatarUrl
        updatedAt
      }
      category {
        name
        slug
      }
      comments {
        content
        createdAt
        author {
          name
        }
      }
    }
    pagination {
      page
      limit
      hasMore
      total
    }
  }
}
```

### Performance Optimized Query
```graphql
{
  users(limit: 5) {
    name
    avatarUrl
    posts {
      title
      published
      category {
        name
      }
    }
  }
}
```

## 🧪 Testing Tips

1. **Interactive Playground**: Visit `http://localhost:3001/graphql` in your browser
2. **Schema Explorer**: Use the docs panel to explore available fields
3. **Auto-completion**: Press `Ctrl+Space` for field suggestions
4. **Multiple Queries**: You can combine multiple queries in one request
5. **Variables**: Use query variables for dynamic values
6. **Search Testing**: Try searching for "TypeScript", "GraphQL", "CSS", "Docker"
7. **Pagination**: Test with different `limit` values to see pagination in action
8. **Sorting**: Experiment with different `sortBy` and `sortDirection` combinations

## 📊 Sample Data

After running `pnpm db:seed`, you have:
- **12 users**: IDs 1-12 (Alice, Bob, Charlie, Diana, Erik, Fatima, George, Hannah, Isaac, Julia, Kevin, Luna)
- **3 categories**: Development (dev), Design (design), Life (life) 
- **20 posts**: Mix of published/draft across all categories with diverse topics
- **37 comments**: Realistic conversations on popular posts

## ✨ New Features Summary

🎯 **Enhanced Pagination**: Now includes `total` count for better UI controls
🔍 **Full-Text Search**: Search posts by title and content
📊 **Advanced Sorting**: Sort by creation date, update date, or title
⚡ **Performance Optimized**: Prevents N+1 queries with smart field resolvers
🗓️ **Update Tracking**: All entities now have `updatedAt` timestamps
🛡️ **Better Error Handling**: More descriptive error messages

Happy GraphQL querying! 🎉