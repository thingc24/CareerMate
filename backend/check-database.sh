#!/bin/bash
# Bash script để kiểm tra database connection
# Chạy: chmod +x check-database.sh && ./check-database.sh

echo "=== CareerMate Database Check ==="
echo ""

# Check PostgreSQL
echo "Checking PostgreSQL..."
if nc -z localhost 5432 2>/dev/null; then
    echo "✓ PostgreSQL is running on port 5432"
else
    echo "✗ PostgreSQL is NOT running on port 5432"
    echo "  → Start PostgreSQL service or Docker container"
fi

echo ""

# Check Redis
echo "Checking Redis..."
if nc -z localhost 6379 2>/dev/null; then
    echo "✓ Redis is running on port 6379"
else
    echo "✗ Redis is NOT running on port 6379"
    echo "  → Start Redis service or Docker container"
fi

echo ""

# Check Docker containers
echo "Checking Docker containers..."
if command -v docker &> /dev/null; then
    if docker ps --format "{{.Names}}" | grep -q "careermate-postgres"; then
        echo "✓ careermate-postgres container is running"
    else
        echo "✗ careermate-postgres container is NOT running"
        echo "  → Run: docker-compose up -d postgres"
    fi
    
    if docker ps --format "{{.Names}}" | grep -q "careermate-redis"; then
        echo "✓ careermate-redis container is running"
    else
        echo "✗ careermate-redis container is NOT running"
        echo "  → Run: docker-compose up -d redis"
    fi
else
    echo "✗ Docker is not installed or not running"
    echo "  → Install Docker or use local PostgreSQL"
fi

echo ""
echo "=== Check Complete ==="
echo ""
echo "Next steps:"
echo "1. If PostgreSQL is not running, start it first"
echo "2. Create database: CREATE DATABASE careermate_db;"
echo "3. Run schema: psql -U postgres -d careermate_db -f database/schema.sql"
echo "4. Update application.yml with correct username/password"
echo "5. Run backend: mvn spring-boot:run"

