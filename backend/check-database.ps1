# PowerShell script để kiểm tra database connection
# Chạy: .\check-database.ps1

Write-Host "=== CareerMate Database Check ===" -ForegroundColor Cyan
Write-Host ""

# Check PostgreSQL
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgTest = Test-NetConnection -ComputerName localhost -Port 5432 -InformationLevel Quiet
    if ($pgTest) {
        Write-Host "✓ PostgreSQL is running on port 5432" -ForegroundColor Green
    } else {
        Write-Host "✗ PostgreSQL is NOT running on port 5432" -ForegroundColor Red
        Write-Host "  → Start PostgreSQL service or Docker container" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Cannot check PostgreSQL connection" -ForegroundColor Red
}

Write-Host ""

# Check Redis
Write-Host "Checking Redis..." -ForegroundColor Yellow
try {
    $redisTest = Test-NetConnection -ComputerName localhost -Port 6379 -InformationLevel Quiet
    if ($redisTest) {
        Write-Host "✓ Redis is running on port 6379" -ForegroundColor Green
    } else {
        Write-Host "✗ Redis is NOT running on port 6379" -ForegroundColor Red
        Write-Host "  → Start Redis service or Docker container" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Cannot check Redis connection" -ForegroundColor Red
}

Write-Host ""

# Check Docker containers
Write-Host "Checking Docker containers..." -ForegroundColor Yellow
try {
    $docker = docker ps --format "{{.Names}}" 2>$null
    if ($docker -match "careermate-postgres") {
        Write-Host "✓ careermate-postgres container is running" -ForegroundColor Green
    } else {
        Write-Host "✗ careermate-postgres container is NOT running" -ForegroundColor Red
        Write-Host "  → Run: docker-compose up -d postgres" -ForegroundColor Yellow
    }
    
    if ($docker -match "careermate-redis") {
        Write-Host "✓ careermate-redis container is running" -ForegroundColor Green
    } else {
        Write-Host "✗ careermate-redis container is NOT running" -ForegroundColor Red
        Write-Host "  → Run: docker-compose up -d redis" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Docker is not installed or not running" -ForegroundColor Red
    Write-Host "  → Install Docker Desktop or use local PostgreSQL" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Check Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If PostgreSQL is not running, start it first" -ForegroundColor White
Write-Host "2. Create database: CREATE DATABASE careermate_db;" -ForegroundColor White
Write-Host "3. Run schema: psql -U postgres -d careermate_db -f database/schema.sql" -ForegroundColor White
Write-Host "4. Update application.yml with correct username/password" -ForegroundColor White
Write-Host "5. Run backend: mvn spring-boot:run" -ForegroundColor White

