#!/bin/bash

# Run SQL migration for table description
echo "Running migration: add_table_description.sql"

docker exec -i restaurant_booking_db psql -U postgres -d restaurant_booking < database/add_table_description.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi
