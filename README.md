# TanStack Lab

A monorepo project for learning and comparing modern web development tools and practices, specifically comparing REST vs GraphQL APIs using the TanStack ecosystem.

## 🏗️ Architecture

This project is built as a **Turborepo monorepo** featuring:

### Backend (`apps/server`)
- **REST API**: Built with [Hono](https://hono.dev/) - Fast & lightweight web framework
- **GraphQL API**: Built with [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) - Modern GraphQL server
- **Database**: [Drizzle ORM](https://orm.drizzle.team/) with dual support:
  - **SQLite**: Zero-config, file-based database
  - **PostgreSQL**: Via [Neon](https://neon.tech/) serverless platform
- **Validation**: [Zod](https://zod.dev/) for runtime type safety + environment validation
- **Development**: [tsx](https://tsx.is/) for hot reloading
- **Build**: [tsup](https://tsup.egoist.dev/) for fast builds
- **Code Quality**: [Biome](https://biomejs.dev/) for linting & formatting

### Frontend (Coming Soon)
- **Router**: @tanstack/router
- **Data Fetching**: @tanstack/react-query  
- **Database Client**: @tanstack/db
- **Framework**: React + Vite

## ⚡ Quick Start (30 seconds)

```bash
# Choose your path:

# Docker (fastest)
git clone <repo> && cd tanstack-lab
cp apps/server/.env.example apps/server/.env
DEV_PORT=3001 docker compose up --build dev
open http://localhost:3001/health

# Local development
git clone <repo> && cd tanstack-lab
pnpm install && cd apps/server && cp .env.example .env
pnpm db:push && pnpm db:seed && pnpm dev
open http://localhost:3001/health
```

## 🚀 Detailed Setup

### Prerequisites
- Node.js 20+
- pnpm 9+
- **Optional**: PostgreSQL database via [Neon](https://neon.tech/) (SQLite works out-of-the-box)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd tanstack-lab
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cd apps/server
   cp .env.example .env
   # Edit .env - choose SQLite (zero config) or PostgreSQL
   ```

3. **Set up the database:**
   ```bash
   pnpm db:push   # Apply schema changes to database
   pnpm db:seed   # Add sample users, posts, and comments
   ```

4. **Start development server:**
   ```bash
   # From root directory
   pnpm dev
   
   # Or just the server
   cd apps/server && pnpm dev
   # Or using turborepo (from root)
   pnpm dev --filter server
   ```

### 🐳 Docker (optional)

#### Dev (hot reload)
```bash
DEV_PORT=3001 docker compose up --build dev
# then edit files under apps/server/src/** and tsx will hot reload
```

#### Self-contained (no hot reload)
```bash
docker compose up --build -d app
docker compose logs -f app
```

The server will start on `http://localhost:3001` with the following endpoints:
- **Health check**: http://localhost:3001/health
- **REST API**: http://localhost:3001/api/users, /api/posts
- **GraphQL**: http://localhost:3001/graphql (interactive playground)

### 5. **Verify it's working:**
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test REST API  
curl http://localhost:3001/api/users

# Test GraphQL (in browser)
open http://localhost:3001/graphql
```

## 🗄️ Database Schema

The project uses a simple blog-like schema:

- **Users**: `id`, `name`, `avatar_url`, `created_at`
- **Categories**: `id`, `name`, `slug`  
- **Posts**: `id`, `title`, `content`, `published`, `author_id`, `category_id`, `created_at`
- **Comments**: `id`, `content`, `post_id`, `author_id`, `created_at`

## 🌐 API Endpoints

### REST API (`http://localhost:3001/api`)

- **Users**: `GET|POST /users`, `GET|PUT|DELETE /users/:id`
- **Categories**: `GET|POST /categories`, `GET|PUT|DELETE /categories/:id`
- **Posts**: `GET|POST /posts`, `GET|PUT|DELETE /posts/:id`
- **Comments**: `GET|POST /comments`, `GET|PUT|DELETE /comments/:id`

### GraphQL API (`http://localhost:3001/graphql`)

Single endpoint with full CRUD operations and relationships for all entities.

#### Example API Calls

**REST - Get all posts:**
```bash
curl "http://localhost:3001/api/posts"
```

**REST - Get a specific post with comments:**
```bash
curl "http://localhost:3001/api/posts/[post-id]"
```

**GraphQL - Get users with their posts:**
```bash
curl -X POST "http://localhost:3001/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ users { users { name posts { title } } } }"}'
```

**GraphQL - Get posts with full relationships:**
```bash
curl -X POST "http://localhost:3001/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts { posts { title author { name } category { name } comments { content author { name } } } } }"}'
```

## 📁 Project Structure

```
tanstack-lab/
├── apps/
│   └── server/           # Backend application
│       ├── src/
│       │   ├── api/
│       │   │   ├── rest/     # Hono REST routes
│       │   │   └── graphql/  # GraphQL schema & resolvers
│       │   ├── db/           # Database layer
│       │   │   ├── adapters/ # Multi-database support
│       │   │   └── schemas/  # SQLite & PostgreSQL schemas
│       │   ├── lib/          # Config & middleware
│       │   ├── schemas/      # Zod validation schemas
│       │   └── index.ts      # Server entry point
│       ├── drizzle.config.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/             # Shared packages (future)
├── turbo.json           # Turborepo configuration
├── pnpm-workspace.yaml # pnpm workspace configuration
└── package.json         # Root package.json
```

## 🛠️ Available Scripts

### Development
```bash
pnpm dev                     # Start everything
cd apps/server && pnpm dev  # Server only
pnpm dev --filter server     # Server only (turborepo)
pnpm build                   # Build for production
```

### Database
```bash
pnpm db:generate            # Generate migrations from schema changes
pnpm db:push                # Apply schema changes to database
pnpm db:seed                # Add sample users, posts, and comments
pnpm db:studio              # Open Drizzle Studio GUI
```

## 🎯 Learning Goals

This project aims to explore and compare:

1. **API Paradigms**: REST vs GraphQL performance, DX, and use cases
2. **Database Abstractions**: Multi-database support with adapter patterns
3. **Modern TypeScript**: End-to-end type safety from database to frontend
4. **Environment Management**: Type-safe configuration with Zod validation
5. **Build Tools**: Modern ESM-first toolchain
6. **Data Fetching**: TanStack Query patterns for both API types
7. **Monorepo Management**: Turborepo workflows and optimization

## 📚 Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.5+
- **Package Manager**: pnpm 9+
- **Monorepo**: Turborepo 2.0+
- **Backend Framework**: Hono 4.5+
- **GraphQL**: GraphQL Yoga 5.6+
- **Database**: SQLite + PostgreSQL via Drizzle ORM 0.33+
- **Database Clients**: better-sqlite3 + @neondatabase/serverless
- **Validation**: Zod 3.23+ (runtime + environment validation)
- **Development**: tsx 4.16+
- **Build**: tsup 8.2+
- **Code Quality**: Biome (linting + formatting)

---

Built with ❤️ for learning modern web development practices.