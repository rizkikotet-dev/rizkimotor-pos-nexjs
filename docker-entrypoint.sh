#!/bin/sh
set -e

# Ensure data directory exists
mkdir -p /app/data

# Initialize database if it doesn't exist
if [ ! -f /app/data/prod.db ]; then
  echo "Database not found, initializing..."
  npx prisma db push --skip-generate
  echo "Database initialized."
else
  echo "Database found, running migrations..."
  npx prisma db push --skip-generate 2>/dev/null || true
fi

# Start the application
exec node server.js
