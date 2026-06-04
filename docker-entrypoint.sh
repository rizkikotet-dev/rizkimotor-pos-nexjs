#!/bin/sh
set -e

# Ensure persistent directories exist (sama-sama di-mount sebagai volume)
mkdir -p /app/data
mkdir -p /app/public/uploads

# Fix permission agar user nextjs bisa tulis (volume mount awal dibuat oleh root)
chown -R nextjs:nodejs /app/data /app/public/uploads 2>/dev/null || true
chmod -R 755 /app/data /app/public/uploads 2>/dev/null || true

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
