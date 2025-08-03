# TanStack Lab Server

The backend API server for the TanStack Lab project, built with modern tools and best practices for 2025.

## 🛠️ Tech Stack

- **[Hono](https://hono.dev/)** - Fast, lightweight web framework for REST API
- **[GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)** - Modern GraphQL server
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript-first ORM with excellent DX
- **[Neon Database](https://neon.tech/)** - Serverless PostgreSQL
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[tsx](https://tsx.is/)** - Fast TypeScript execution for development
- **[tsup](https://tsup.egoist.dev/)** - Fast TypeScript bundler

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Neon Database account and connection string

### Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment setup:**
   ```bash
   # Create .env file
   touch .env
   
   # Add your environment variables
   echo 'DATABASE_URL="your-neon-connection-string"
   PORT=3001
   NODE_ENV=development' > .env
   ```

3. **Database setup:**
   ```bash
   # Generate migrations from schema
   pnpm db:generate
   
   # Push schema to database
   pnpm db:push
   
   # Seed with sample data
   pnpm db:seed
   ```

4. **Start development:**
   ```bash
   pnpm dev
   ```

## 📋 Available Scripts

### Development
- `pnpm dev` - Start development server with hot reloading
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Database
- `pnpm db:generate` - Generate migrations from schema changes
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio (database GUI)
- `pnpm db:seed` - Seed database with sample data

### Utilities
- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint` - Run linting (placeholder)

## 🌐 API Endpoints

### REST API (`/api`)

#### Users
- `GET /api/users` - List all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/slug/:slug` - Get category by slug
- `GET /api/categories/:id/posts` - Get posts in category
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

#### Posts
- `GET /api/posts` - List posts with filters and pagination
- `GET /api/posts/:id` - Get post with author, category, and comments
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

#### Comments
- `GET /api/comments` - List all comments (paginated)
- `GET /api/comments/:id` - Get comment by ID
- `POST /api/comments` - Create new comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### GraphQL API (`/graphql`)

Single endpoint supporting:
- **Queries**: `users`, `categories`, `posts`, `comments` with full relationships
- **Mutations**: Create, update, delete operations for all entities
- **Type Safety**: Fully typed schema with automatic validation

#### Example Queries

**Get users:**
```graphql
{
  users {
    users {
      id
      name
      avatarUrl
      posts {
        title
        category { name }
      }
    }
  }
}
```

**Get posts with relationships:**
```graphql
{
  posts {
    posts {
      title
      content
      published
      author { name }
      category { name slug }
      comments {
        content
        author { name }
      }
    }
  }
}
```

**Create a post:**
```graphql
mutation {
  createPost(input: {
    title: "New Post"
    content: "Post content..."
    authorId: "user-id"
    categoryId: "category-id"
    published: true
  }) {
    id
    title
    author { name }
  }
}
```

## 🗄️ Database Schema

Built with Drizzle ORM using PostgreSQL:

### Tables
- **users** - User profiles with avatar support
- **categories** - Post categories with SEO-friendly slugs
- **posts** - Blog posts with rich content and publishing status
- **comments** - Threaded comments on posts

### Relationships
- Users have many posts and comments
- Posts belong to a user (author) and category
- Posts have many comments
- Comments belong to a user (author) and post

### Sample Data
The seed script creates realistic blog data:
- 3 users with different profiles
- 3 categories (Development, Design, Life)
- 7 posts distributed among users and categories
- 9 comments creating realistic conversations

## 🔧 Configuration

### Environment Variables
```bash
# Required
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"

# Optional
PORT=3001
NODE_ENV=development
```

### TypeScript Configuration
- Modern ES2022 target
- ESNext modules with bundler resolution
- Strict type checking enabled
- Path mapping for clean imports (`@/db/*`, etc.)

### Drizzle Configuration
- PostgreSQL dialect
- Schema-first approach
- Migrations stored in `./drizzle`
- Type-safe database operations

## 🏗️ Project Structure

```
apps/server/
├── src/
│   ├── api/
│   │   ├── rest/          # Hono REST API routes
│   │   │   ├── users.ts
│   │   │   ├── posts.ts
│   │   │   ├── categories.ts
│   │   │   ├── comments.ts
│   │   │   └── index.ts
│   │   └── graphql/       # GraphQL schema and resolvers
│   │       ├── schema.ts
│   │       ├── resolvers.ts
│   │       └── index.ts
│   ├── db/                # Database layer
│   │   ├── schema.ts      # Drizzle schema definitions
│   │   ├── index.ts       # Database connection
│   │   └── seed.ts        # Seed script
│   ├── schemas/           # Validation schemas
│   │   └── validation.ts  # Zod schemas
│   └── index.ts           # Server entry point
├── drizzle/               # Generated migrations
├── dist/                  # Build output
├── drizzle.config.ts      # Drizzle configuration
├── tsconfig.json          # TypeScript configuration
├── package.json
└── .env                   # Environment variables
```

## 🔍 Development Tips

### Database Management
- Use `pnpm db:studio` to visually explore your database
- Run `pnpm db:generate` after schema changes
- Always test migrations on a development branch first

### API Testing
- REST endpoints return consistent JSON with pagination
- GraphQL supports introspection for schema exploration
- Use the `/health` endpoint for monitoring

### Type Safety
- All database operations are fully typed
- Zod schemas provide runtime validation
- GraphQL schema matches database structure

## 🚀 Production Deployment

### Build
```bash
pnpm build
```

### Environment
Ensure these environment variables are set:
- `DATABASE_URL` - Your production Neon connection string
- `NODE_ENV=production`
- `PORT` - Server port (default: 3001)

### Migration Strategy
1. Run migrations: `pnpm db:push`
2. Seed data if needed: `pnpm db:seed`
3. Start server: `pnpm start`

## 🤝 Contributing

This server follows modern Node.js and TypeScript best practices:
- ESM modules throughout
- Comprehensive error handling
- Type-safe database operations
- Consistent API responses
- Proper separation of concerns

For questions or improvements, please refer to the main project README.