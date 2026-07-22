#!/bin/sh
set -e

# Apply any pending migrations before the server starts. `migrate deploy` only
# applies existing migrations (never generates or resets) — safe for production.
echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting backend server..."
# exec so node becomes PID 1 and receives SIGTERM/SIGINT for graceful shutdown.
exec node dist/index.js
