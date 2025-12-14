#!/bin/sh
set -e

echo "Running database migrations..."
npx tsx src/lib/server/db/migrate.ts

echo "Starting server..."
exec node ./build/index.js
