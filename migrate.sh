#!/bin/bash
# Database Migration Script for Bazar Buy

echo "🔄 Running database migrations..."

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client (psql) not found. Please install PostgreSQL."
    exit 1
fi

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-bazarbuy_db}
MIGRATIONS_DIR="backend/migrations"

# Run migrations
echo "📝 Executing migrations from $MIGRATIONS_DIR..."

for migration in $(ls $MIGRATIONS_DIR/*.sql | sort); do
    echo "   ▶ $(basename $migration)"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration"
    if [ $? -ne 0 ]; then
        echo "❌ Migration $(basename $migration) failed!"
        exit 1
    fi
done

echo "✅ Migrations completed successfully!"
