#!/bin/sh
set -e

echo "Starting server..."
exec node ./build/index.js
