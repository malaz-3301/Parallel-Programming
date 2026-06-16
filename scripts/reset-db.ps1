# scripts/reset-db.ps1
# Reset PostgreSQL database to empty state using create-db-template.sql
# Adjust the connection parameters as needed.
$connectionString = "host=127.0.0.1 port=5432 dbname=parallel_programming user=postgres password=mohammed"
$sqlFile = "C:/Users/Mohammad/.dbclient/storage/1781459467151@@127.0.0.1@5432/create-db-template.sql"

# Drop all tables (cascading) if they exist
Write-Host "Dropping existing tables..."
psql $connectionString -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Run the template SQL to recreate schema
Write-Host "Recreating schema from template..."
psql $connectionString -f $sqlFile

# Seed initial data for testing
Write-Host "Seeding database with initial data..."
$seedFile = "C:/MYFILE/php-8.3.13/Parallel-Programming/scripts/seed-data.sql"
psql $connectionString -f $seedFile

Write-Host "Database reset complete."
