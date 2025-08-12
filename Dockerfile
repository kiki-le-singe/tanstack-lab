# Fully automated Dockerfile - uses pnpm and reads .env from root
FROM node:22-alpine

WORKDIR /app

# Install required dependencies including sqlite
RUN apk add --no-cache python3 make g++ sqlite

# Enable corepack and set pnpm version
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate

# Copy root package.json and pnpm files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy workspace configs and manifests
COPY turbo.json biome.json ./

# Copy only server manifest to maximize install cache reuse
COPY apps/server/package.json apps/server/package.json

# Install all dependencies with pnpm (deterministic)
RUN pnpm install --frozen-lockfile

# Now copy the full source (invalidates layers below only when source changes)
COPY apps/ ./apps/

EXPOSE 3001

# Create startup script that handles database setup and runs the app
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "🚀 Starting TanStack Lab..."' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Prefer env vars passed at runtime. If missing, source apps/server/.env safely' >> /app/start.sh && \
    echo 'if [ -z "$DATABASE_TYPE" ] || [ -z "$DATABASE_URL" ]; then' >> /app/start.sh && \
    echo '  if [ -f "apps/server/.env" ]; then' >> /app/start.sh && \
    echo '    echo "📄 Loading configuration from apps/server/.env file..."' >> /app/start.sh && \
    echo '    set -a' >> /app/start.sh && \
    echo '    . apps/server/.env' >> /app/start.sh && \
    echo '    set +a' >> /app/start.sh && \
    echo '  else' >> /app/start.sh && \
    echo '    echo "ℹ️ No .env provided. Falling back to SQLite defaults"' >> /app/start.sh && \
    echo '    export DATABASE_TYPE=${DATABASE_TYPE:-sqlite}' >> /app/start.sh && \
    echo '    export DATABASE_URL=${DATABASE_URL:-file:./dev.db}' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Change to server directory for database operations' >> /app/start.sh && \
    echo 'cd apps/server' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# If DATABASE_TYPE not set explicitly, infer from DATABASE_URL' >> /app/start.sh && \
    echo 'if [ -z "$DATABASE_TYPE" ]; then' >> /app/start.sh && \
    echo '  if echo "$DATABASE_URL" | grep -q "postgresql://\|postgres://"; then' >> /app/start.sh && \
    echo '    export DATABASE_TYPE="neon"' >> /app/start.sh && \
    echo '  else' >> /app/start.sh && \
    echo '    export DATABASE_TYPE="sqlite"' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "📊 Database selection: TYPE=$DATABASE_TYPE URL=$DATABASE_URL"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'if [ "$DATABASE_TYPE" = "neon" ]; then' >> /app/start.sh && \
    echo '  echo "📋 Generating and pushing database schema (Neon/PostgreSQL)..."' >> /app/start.sh && \
    echo '  pnpm db:generate' >> /app/start.sh && \
    echo '  pnpm db:push' >> /app/start.sh && \
    echo 'else' >> /app/start.sh && \
    echo '  echo "📊 Using SQLite database"' >> /app/start.sh && \
    echo '  if [ ! -f "./dev.db" ] || [ ! -s "./dev.db" ]; then' >> /app/start.sh && \
    echo '    echo "📋 Creating SQLite schema..."' >> /app/start.sh && \
    echo '    sqlite3 ./dev.db < drizzle/sqlite/0000_chemical_human_robot.sql' >> /app/start.sh && \
    echo '  else' >> /app/start.sh && \
    echo '    echo "✅ SQLite database exists"' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Seed the database with sample data' >> /app/start.sh && \
    echo 'echo "🌱 Seeding database..."' >> /app/start.sh && \
    echo 'pnpm db:seed' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "✅ Database ready!"' >> /app/start.sh && \
    echo 'echo "🚀 Starting development server..."' >> /app/start.sh && \
    echo 'echo "   REST API: http://localhost:3001/api"' >> /app/start.sh && \
    echo 'echo "   GraphQL: http://localhost:3001/graphql"' >> /app/start.sh && \
    echo 'echo "   Health: http://localhost:3001/health"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Start the server in development mode' >> /app/start.sh && \
    echo 'pnpm dev' >> /app/start.sh && \
    chmod +x /app/start.sh

# Start with automated setup script as entrypoint (override Node's default entrypoint)
ENTRYPOINT ["/app/start.sh"]