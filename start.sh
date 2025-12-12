#!/bin/sh
set -e

echo "Running database migrations..."
node src/lib/server/db/migrate.ts

echo "Starting server..."
exec node ./build/index.js
