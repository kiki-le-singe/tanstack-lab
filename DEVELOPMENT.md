# Development Guide

## Quick Commands

### Server Development
```bash
# Start everything
pnpm dev

# Server only
cd apps/server && pnpm dev

# Database operations
pnpm db:generate  # Generate migrations
pnpm db:push      # Push to database
pnpm db:seed      # Seed sample data
pnpm db:studio    # Open database GUI
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

- **Provider**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle
- **Schema**: Users, Categories, Posts, Comments
- **Sample Data**: 3 users, 3 categories, 7 posts, 9 comments

## Next Steps

1. Frontend with React + Vite
2. TanStack Router + React Query
3. Performance benchmarking
4. Authentication
5. Medium article