#!/bin/sh
set -e

echo "RIZKI MOTOR — Docker Entrypoint"
echo "================================"

# Ensure persistent directories exist
mkdir -p /app/data /app/public/uploads

# Fix permission jika running sebagai root
if [ "$(id -u)" = "0" ]; then
  chown -R nextjs:nodejs /app/data /app/public/uploads 2>/dev/null || true
fi

# Generate Prisma client
echo ""
echo "Generating Prisma client..."
gosu nextjs npx prisma generate

# Initialize / migrate database
if [ ! -f /app/data/prod.db ]; then
  echo "Database not found, initializing..."
  gosu nextjs npx prisma db push --skip-generate
  echo "Database initialized."
else
  echo "Database found, running schema sync..."
  gosu nextjs npx prisma db push --skip-generate 2>/dev/null || true
fi

# Start the application as nextjs user
echo ""
echo "Starting RIZKI MOTOR..."
exec gosu nextjs node server.js
