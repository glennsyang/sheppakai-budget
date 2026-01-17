#!/bin/sh
set -e

# Start the server
echo "Starting server..."
exec node ./build/index.js
