# Development Guide

## ⚡ Quick Start

```bash
# Get running in 30 seconds
git clone <repo> && cd tanstack-lab
pnpm install && cd apps/server && cp .env.example .env
pnpm db:push && pnpm db:seed && pnpm dev
curl http://localhost:3001/health
```

## 🛠️ Development Commands

### Server Development
```bash
# Start everything
pnpm dev

# Server only
cd apps/server && pnpm dev
# Or using turborepo (from root)
pnpm dev --filter server

# Database operations
pnpm db:generate            # Generate migrations from schema changes
pnpm db:push                # Apply schema changes to database
pnpm db:seed                # Add sample users, posts, and comments
pnpm db:studio              # Open Drizzle Studio GUI
```

### Docker Development (hot reload)
```bash
DEV_PORT=3001 docker compose up --build dev
# Then edit files under apps/server/src/**; tsx will hot reload
```

### Docker (self-contained, no hot reload)
```bash
docker compose up --build -d app
docker compose logs -f app
```

### Testing APIs
```bash
# Health check
curl http://localhost:3001/health

# REST API
curl http://localhost:3001/api/users
curl http://localhost:3001/api/posts

# GraphQL
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ users { users { name } } }"}'
```

## Project Structure

- `apps/server/` - Backend API server
  - See [apps/server/README.md](apps/server/README.md) for detailed docs
- `packages/` - Shared packages (future)
- `turbo.json` - Turborepo configuration
- `pnpm-workspace.yaml` - pnpm workspace setup

## URLs

- **Server**: http://localhost:3001
- **REST API**: http://localhost:3001/api
- **GraphQL**: http://localhost:3001/graphql
- **Health**: http://localhost:3001/health

## Database

### Dual Database Support
- **SQLite**: File-based, zero-config database
- **Neon**: Serverless PostgreSQL platform
- **ORM**: Drizzle with database adapter pattern
- **Schema**: Users, Categories, Posts, Comments (identical across both)
- **Sample Data**: 3 users, 3 categories, 7 posts, 9 comments

### Database Commands
```bash
# Database operations (works with both SQLite and Neon)
pnpm db:generate            # Generate migrations from schema changes
pnpm db:push                # Apply schema changes to database
pnpm db:seed                # Add sample users, posts, and comments
pnpm db:studio              # Open Drizzle Studio GUI
```

### Switching Databases
**For SQLite**:
```bash
# .env
DATABASE_TYPE=sqlite
DATABASE_URL="file:./dev.db"
```

**For Neon**:
```bash
# .env
DATABASE_TYPE=neon
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
```

### Database Features
- ✅ **Environment validation** with Zod schemas
- ✅ **Cross-field validation** (URL format matches database type)
- ✅ **Adapter pattern** for seamless database switching
- ✅ **Type safety** across both database types
- ✅ **Automatic detection** based on environment variables

## Next Steps

1. Frontend with React + Vite
2. TanStack Router + React Query
3. Performance benchmarking
4. Authentication
5. Medium article