# 🚀 New Developer Onboarding

Welcome to TanStack Lab! This guide will get you up and running in ~10 minutes.

## ✅ Prerequisites

Before starting, ensure you have:
- **Node.js 20+** - [Download here](https://nodejs.org/)
- **pnpm 9+** - Install with `npm install -g pnpm`
- **Git** - For version control
- **Database access** - Get Neon connection string from team lead

## 🏁 Quick Start (5 steps)

### 1. **Clone & Install**
```bash
git clone <repository-url>
cd tanstack-lab
pnpm install
```

### 2. **Environment Setup**
```bash
cd apps/server
touch .env

# Add your database connection (replace with real values)
echo 'DATABASE_URL="postgresql://user:password@host.neon.tech/db?sslmode=require"
PORT=3001
NODE_ENV=development' > .env
```

### 3. **Database Setup**
```bash
# Generate any new migrations
pnpm db:generate

# Apply schema to database
pnpm db:push

# Load sample data
pnpm db:seed
```

### 4. **Start Development**
```bash
# Option A: Start everything (from root)
pnpm dev

# Option B: Server only (from apps/server)
cd apps/server && pnpm dev
```

### 5. **Verify Setup**
Open these URLs in your browser:
- **Health Check**: http://localhost:3001/health
- **REST API**: http://localhost:3001/api/users
- **GraphQL**: http://localhost:3001/graphql

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
│   │   ├── db/               # Database models & seed
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
pnpm build                   # Build for production
```

### Database
```bash
pnpm db:generate            # Generate migrations
pnpm db:push                # Push schema to DB
pnpm db:seed                # Seed sample data
pnpm db:studio              # Open database GUI
```

### Utilities
```bash
pnpm type-check             # TypeScript validation
git status                  # Check git status
```

## 🎯 What You're Building

**TanStack Lab** is a learning project comparing REST vs GraphQL APIs:

- **Same Data**: Both APIs use the same PostgreSQL database
- **Same Features**: Full CRUD operations for users, posts, categories, comments
- **Different Approaches**: 
  - REST: Multiple endpoints with Hono
  - GraphQL: Single endpoint with Yoga

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

### Database Connection Error
```
Error: DATABASE_URL environment variable is required
```
**Solution**: Make sure your `.env` file has the correct `DATABASE_URL`

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