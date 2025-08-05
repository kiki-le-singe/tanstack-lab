# TanStack Lab Server

The backend API server for the TanStack Lab project, built with modern tools and best practices for 2025.

## 🛠️ Tech Stack

- **[Hono](https://hono.dev/)** - Fast, lightweight web framework for REST API
- **[GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)** - Modern GraphQL server
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript-first ORM with excellent DX
- **[Neon Database](https://neon.tech/)** - Serverless PostgreSQL (production)
- **[SQLite](https://sqlite.org/)** - Embedded database (development)
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation with environment validation
- **[tsx](https://tsx.is/)** - Fast TypeScript execution for development
- **[tsup](https://tsup.egoist.dev/)** - Fast TypeScript bundler
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- **Optional**: Neon Database account for production database

### Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment setup:**
   ```bash
   # Create .env file
   cp .env.example .env
   ```
   
   **Choose your database:**
   
   **Option A: SQLite (Recommended for development)**
   ```bash
   # .env
   DATABASE_TYPE=sqlite
   DATABASE_URL="file:./dev.db"
   PORT=3001
   NODE_ENV=development
   ```
   
   **Option B: Neon PostgreSQL (Production)**
   ```bash
   # .env
   DATABASE_TYPE=neon
   DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
   PORT=3001
   NODE_ENV=development
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

Built with Drizzle ORM supporting both SQLite and PostgreSQL with identical schemas:

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
The server uses **enhanced Zod validation** for type-safe environment configuration:

```bash
# Database Configuration (Required)
DATABASE_TYPE=sqlite|neon           # Choose database type
DATABASE_URL="connection-string"    # Database connection URL

# Server Configuration (Optional - has defaults)
PORT=3001                          # Server port (1000-65535)
NODE_ENV=development               # Environment (development|production|test)
```

**Database URL formats:**
- **SQLite**: `file:./dev.db` or path to `.db` file
- **Neon**: `postgresql://user:pass@host.neon.tech/db?sslmode=require`

**Validation Features:**
- ✅ Cross-field validation (DATABASE_URL format must match DATABASE_TYPE)
- ✅ Port range validation (1000-65535)
- ✅ Environment enum validation
- ✅ Clear error messages with helpful hints

### TypeScript Configuration
- Modern ES2022 target
- ESNext modules with bundler resolution
- Strict type checking enabled
- Path mapping for clean imports (`@/db/*`, etc.)

### Database Adapter Architecture
- **Multi-database support** with adapter pattern
- **Environment-based selection** via `DATABASE_TYPE` configuration
- **Schema-first approach** with dialect-specific implementations
- **Type-safe operations** across both database types
- **Automatic database detection** and connection management

**Supported Databases:**
- **SQLite**: `better-sqlite3` with file-based storage
- **PostgreSQL**: `@neondatabase/serverless` for Neon integration

**Configuration:**
- Migrations stored in `./drizzle/{sqlite|neon}`
- Separate schemas: `src/db/schemas/{sqlite|postgresql}.ts`
- Factory pattern: `DatabaseFactory.createFromEnvironment()`

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
│   │       ├── types.ts
│   │       └── index.ts
│   ├── db/                # Database layer
│   │   ├── adapters/      # Database adapter pattern
│   │   │   ├── base.ts    # Abstract base adapter
│   │   │   ├── factory.ts # Adapter factory
│   │   │   ├── neon.ts    # Neon PostgreSQL adapter
│   │   │   ├── sqlite.ts  # SQLite adapter
│   │   │   └── types.ts   # Adapter interfaces
│   │   ├── schemas/       # Database schemas
│   │   │   ├── postgresql.ts # PostgreSQL schema
│   │   │   └── sqlite.ts     # SQLite schema
│   │   ├── index.ts       # Database connection management
│   │   └── seed.ts        # Seed script
│   ├── lib/               # Core utilities
│   │   ├── config.ts      # Environment validation
│   │   ├── middleware.ts  # Security middleware
│   │   └── response.ts    # API response utilities
│   ├── schemas/           # Validation schemas
│   │   └── validation.ts  # Zod schemas
│   ├── utils/             # Helper functions
│   │   └── index.ts
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
- **SQLite**: Zero-config, file-based database
- **Neon**: Serverless PostgreSQL with advanced features
- Use `pnpm db:studio` to visually explore your database
- Run `pnpm db:generate` after schema changes
- **Database switching**: Just change `DATABASE_TYPE` in `.env` and restart

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
- `DATABASE_TYPE=neon` - Use Neon PostgreSQL
- `DATABASE_URL` - Your production Neon connection string
- `NODE_ENV=production`
- `PORT` - Server port (default: 3001)

### Migration Strategy
1. Run migrations: `pnpm db:push`
2. Seed data if needed: `pnpm db:seed`
3. Start server: `pnpm start`

## 🤝 Contributing

This server follows modern Node.js and TypeScript best practices:
- **ESM modules** throughout
- **Database adapter pattern** for multi-database support
- **Comprehensive error handling** with graceful shutdowns
- **Type-safe database operations** across SQLite and PostgreSQL
- **Environment validation** with Zod schemas
- **Security-first middleware** (rate limiting, sanitization, headers)
- **Consistent API responses** for both REST and GraphQL
- **Clean architecture** with proper separation of concerns

For questions or improvements, please refer to the main project README.