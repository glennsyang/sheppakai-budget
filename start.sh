#!/bin/sh
set -e

echo "🚀 Starting SheppakaiBudget..."

# Run database migrations
echo "📦 Running database migrations..."
./node_modules/.bin/drizzle-kit migrate

# Start the SvelteKit app
echo "🚀 Starting SvelteKit server..."
exec node ./build/index.js