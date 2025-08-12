# 🚀 New Developer Onboarding

Welcome to TanStack Lab! Choose ONE path: Docker or Local. Each path is self-contained.

## ⚡ 30-Second Quick Start

**Docker (fastest):**
```bash
git clone <repo> && cd tanstack-lab
cp apps/server/.env.example apps/server/.env
DEV_PORT=3001 docker compose up --build dev
open http://localhost:3001/health
```

**Local:**
```bash
git clone <repo> && cd tanstack-lab
pnpm install && cd apps/server && cp .env.example .env
pnpm db:push && pnpm db:seed && pnpm dev
open http://localhost:3001/health
```

## ✅ Choose your setup
- Docker (quickest; no Node/pnpm required)
- Local (Node/pnpm development)

---

## 🐳 Option A: Docker Quick Start (recommended)

### Prerequisites
- Docker Desktop (includes Compose)

### 1) Clone the repo
```bash
git clone <repository-url>
cd tanstack-lab
```

### 2) Configure environment
```bash
cp apps/server/.env.example apps/server/.env
# Edit apps/server/.env - choose ONE database:
# SQLite (zero config): DATABASE_TYPE=sqlite
# PostgreSQL: DATABASE_TYPE=neon + your connection URL
```

### 3) Run the server
- Hot reload (bind mounts + tsx):
```bash
DEV_PORT=3001 docker compose up --build dev
```
- Self-contained (no hot reload):
```bash
docker compose up --build -d app
docker compose logs -f app
```

### 4) Verify
```bash
open http://localhost:3001/health
```

Notes:
- The self-contained `app` service runs migrations/seed on start.
- The `dev` service is for live coding; it mounts your source. If you change schemas, run `pnpm db:push`/`pnpm db:seed` on your host or restart the service.

---

## 💻 Option B: Local Quick Start (Node/pnpm)

### Prerequisites
- Node.js 20+
- pnpm 9+

### 1) Install dependencies
```bash
pnpm install
```

### 2) Configure environment
```bash
cd apps/server
cp .env.example .env
# Edit .env - choose SQLite (zero config) or PostgreSQL
```

### 3) Set up the database
```bash
pnpm db:push   # Create tables
pnpm db:seed   # Load sample data
```

### 4) Start development
```bash
# From root
pnpm dev

# Or server only
cd apps/server && pnpm dev
# Or using turborepo (from root)
pnpm dev --filter server
```

### 5) Verify
```bash
curl http://localhost:3001/health
```

## 🧪 Test Commands

```bash
# Health check
curl http://localhost:3001/health

# Get all users (REST)
curl http://localhost:3001/api/users

# Get all posts (REST)
curl http://localhost:3001/api/posts

# GraphQL query
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ users { users { name posts { title } } } }"}'
```

## 📁 Project Structure

```
tanstack-lab/
├── apps/server/              # Backend API
│   ├── src/
│   │   ├── api/rest/         # REST endpoints (Hono)
│   │   ├── api/graphql/      # GraphQL schema (Yoga)
│   │   ├── db/               # Database layer
│   │   │   ├── adapters/     # Multi-database support
│   │   │   └── schemas/      # SQLite & PostgreSQL schemas
│   │   ├── lib/              # Config & middleware
│   │   ├── schemas/          # Zod validation
│   │   └── index.ts          # Server entry point
│   ├── drizzle/              # Database migrations
│   └── package.json          # Server dependencies
├── packages/                 # Shared code (future)
├── turbo.json               # Turborepo config
└── package.json             # Root workspace config
```

## 🛠️ Key Commands

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

### Utilities
```bash
pnpm type-check             # TypeScript validation
git status                  # Check git status
```

## 🎯 What You're Building

**TanStack Lab** is a learning project comparing REST vs GraphQL APIs:

- **Dual Database**: Supports both SQLite and PostgreSQL with identical schemas
- **Same Features**: Full CRUD operations for users, posts, categories, comments
- **Different Approaches**: 
  - REST: Multiple endpoints with Hono
  - GraphQL: Single endpoint with Yoga
- **Modern Stack**: Hono, Drizzle ORM, GraphQL Yoga, TypeScript, Zod validation

### Sample Data
After seeding, you'll have:
- 3 users (Alice, Bob, Charlie)
- 3 categories (Development, Design, Life)  
- 7 blog posts with realistic content
- 9 comments creating conversations

## 🔍 API Overview

### REST Endpoints (`/api`)
- `GET /api/users` - List users
- `GET /api/posts` - List posts with authors/categories
- `GET /api/posts/:id` - Get post with comments
- Full CRUD for all entities

### GraphQL Endpoint (`/graphql`)
- Single endpoint with complete schema
- Supports queries and mutations
- Relational data fetching
- Type-safe operations

### Example Queries

**REST - Get posts:**
```bash
curl "http://localhost:3001/api/posts"
```

**GraphQL - Get posts with relationships:**
```bash
curl -X POST "http://localhost:3001/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts { posts { title author { name } category { name } } } }"}'
```

## 🚨 Common Issues

### Environment Validation Error
```
❌ Environment validation failed:
  - DATABASE_URL: DATABASE_URL format must match the selected DATABASE_TYPE
```
**Solution**: Make sure your DATABASE_URL format matches your DATABASE_TYPE:
- SQLite: `DATABASE_URL="file:./dev.db"`
- Neon: `DATABASE_URL="postgresql://..."`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution**: Kill the existing process or change PORT in `.env`

### Migration Errors
```
Error during migration
```
**Solution**: Check your database connection and run `pnpm db:push` again

## 📚 Learning Resources

- **Drizzle ORM**: [orm.drizzle.team](https://orm.drizzle.team)
- **Hono Framework**: [hono.dev](https://hono.dev)
- **GraphQL Yoga**: [the-guild.dev/graphql/yoga-server](https://the-guild.dev/graphql/yoga-server)
- **Turborepo**: [turbo.build](https://turbo.build)

## 🤝 Development Workflow

1. **Pick a task** from the project board
2. **Create a branch**: `git checkout -b feature/your-feature`
3. **Make changes** and test locally
4. **Run tests**: `pnpm type-check`
5. **Commit changes**: `git commit -m "feat: your feature"`
6. **Push & create PR**: `git push origin feature/your-feature`

## 🆘 Getting Help

- Check the [README.md](README.md) for detailed documentation
- Read [apps/server/README.md](apps/server/README.md) for API specifics
- Ask questions in the team chat
- Review existing code for patterns

**Welcome to the team! 🎉**