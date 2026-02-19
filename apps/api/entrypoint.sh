#!/bin/sh

# Exit on error
set -e

echo "Starting Inboxt setup..."

# Run migrations
echo "Running database migrations..."
./node_modules/.bin/node-pg-migrate up --migrations-dir migrations --migration-table pgmigrations

# Generate Prisma client
echo "Generating Prisma client..."
./node_modules/.bin/prisma generate --schema prisma/schema.prisma

# Start the application
echo "Starting application..."
exec node dist/main.js
