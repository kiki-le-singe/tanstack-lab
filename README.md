# TanStack Lab

A monorepo project for learning and comparing modern web development tools and practices, specifically comparing REST vs GraphQL APIs using the TanStack ecosystem.

## 🏗️ Architecture

This project is built as a **Turborepo monorepo** featuring:

### Backend (`apps/server`)
- **REST API**: Built with [Hono](https://hono.dev/) - Fast & lightweight web framework
- **GraphQL API**: Built with [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) - Modern GraphQL server
- **Database**: [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL (Neon)
- **Validation**: [Zod](https://zod.dev/) for runtime type safety
- **Development**: [tsx](https://tsx.is/) for hot reloading
- **Build**: [tsup](https://tsup.egoist.dev/) for fast builds

### Frontend (Coming Soon)
- **Router**: @tanstack/router
- **Data Fetching**: @tanstack/react-query  
- **Database Client**: @tanstack/db
- **Framework**: React + Vite

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database (we recommend [Neon](https://neon.tech/))

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
   # Create .env file and add your Neon database URL
   echo 'DATABASE_URL="your-neon-connection-string"
   PORT=3001
   NODE_ENV=development' > .env
   ```

3. **Set up the database:**
   ```bash
   # Generate database schema
   pnpm db:generate
   
   # Push schema to database
   pnpm db:push
   
   # Seed with sample data
   pnpm db:seed
   ```

4. **Start development server:**
   ```bash
   # From root directory
   pnpm dev
   
   # Or just the server
   cd apps/server && pnpm dev
   ```

The server will start on `http://localhost:3001` with the following endpoints:
- REST API: `http://localhost:3001/api`
- GraphQL: `http://localhost:3001/graphql`
- Health check: `http://localhost:3001/health`

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
│       │   ├── db/           # Database schema & connection
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

### Root Level
- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm db:generate` - Generate database migrations
- `pnpm db:push` - Push schema to database
- `pnpm db:seed` - Seed database with sample data

### Server Level (`apps/server`)
- `pnpm dev` - Start server with hot reloading
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:studio` - Open Drizzle Studio

## 🎯 Learning Goals

This project aims to explore and compare:

1. **API Paradigms**: REST vs GraphQL performance, DX, and use cases
2. **Modern TypeScript**: End-to-end type safety from database to frontend
3. **Build Tools**: Modern ESM-first toolchain
4. **Data Fetching**: TanStack Query patterns for both API types
5. **Monorepo Management**: Turborepo workflows and optimization

## 📚 Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.5+
- **Package Manager**: pnpm 9+
- **Monorepo**: Turborepo 2.0+
- **Backend Framework**: Hono 4.5+
- **GraphQL**: GraphQL Yoga 5.6+
- **Database**: PostgreSQL + Drizzle ORM 0.33+
- **Validation**: Zod 3.23+
- **Development**: tsx 4.16+
- **Build**: tsup 8.2+

---

Built with ❤️ for learning modern web development practices.