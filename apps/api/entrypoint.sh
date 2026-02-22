#!/bin/sh

# Exit on error
set -e

# Function to wait for database
wait_for_db() {
  # Extract host and port from DATABASE_URL if possible
  # DATABASE_URL=postgresql://user:password@host:port/db
  DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
  DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

  # Fallback to defaults if parsing fails
  if [ -z "$DB_HOST" ]; then DB_HOST="postgres"; fi
  if [ -z "$DB_PORT" ]; then DB_PORT="5432"; fi

  echo "Waiting for database at $DB_HOST:$DB_PORT..."

  MAX_RETRIES=5
  RETRIES=0

  # Use nc (netcat) to check if the port is open
  while ! nc -z "$DB_HOST" "$DB_PORT"; do
    RETRIES=$((RETRIES+1))
    if [ $RETRIES -ge $MAX_RETRIES ]; then
      echo "Database not reachable after $MAX_RETRIES attempts."
      exit 1
    fi
    echo "Postgres unavailable - retrying ($RETRIES/$MAX_RETRIES)"
    sleep 1
  done

  echo "Postgres is up - executing migrations"
}

echo "Starting Inboxt setup..."

# Wait for DB before running migrations
wait_for_db

# Run migrations
echo "Running database migrations..."
npx node-pg-migrate up \
  --migrations-dir migrations \
  --migration-table pgmigrations

# Start the application
echo "Starting application..."
exec node dist/main.js