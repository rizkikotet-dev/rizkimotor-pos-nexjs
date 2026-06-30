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

# Generate prepared schema (jalan sebagai root karena write ke /app/prisma/)
echo ""
echo "Preparing Prisma schema..."
node prisma/prepare.js
chown nextjs:nodejs prisma/schema.prepared.prisma 2>/dev/null || true

# Generate Prisma client (auto-detect provider dari DATABASE_URL)
echo ""
echo "Generating Prisma client..."
gosu nextjs npx prisma generate --schema=prisma/schema.prepared.prisma

# Initialize / migrate database
if [ ! -f /app/data/prod.db ]; then
  echo "Database not found, initializing..."
  gosu nextjs npx prisma db push --schema=prisma/schema.prepared.prisma --skip-generate
  echo "Database initialized."
  IS_NEW_DB="true"
else
  echo "Database found, running schema sync..."
  gosu nextjs npx prisma db push --schema=prisma/schema.prepared.prisma --skip-generate 2>/dev/null || true
  IS_NEW_DB="false"
fi

# Seed data awal otomatis (hanya jika belum ada data)
echo ""
echo "Seeding initial data..."
gosu nextjs node prisma/seed.js

# Start the application as nextjs user
echo ""
echo "Starting RIZKI MOTOR..."
exec gosu nextjs node server.js
