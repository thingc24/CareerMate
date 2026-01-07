# Script tu dong tao database va cac bang chuc nang sinh vien
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$env:PGPASSWORD = "Aa1234"

Write-Host "=== TAO DATABASE VA CAC BANG ===" -ForegroundColor Cyan
Write-Host ""

# Buoc 1: Kiem tra va tao database
Write-Host "Buoc 1: Kiem tra database careermate_db..." -ForegroundColor Yellow
$dbCheck = & $psqlPath -U postgres -h localhost -p 5432 -d postgres -c "SELECT 1 FROM pg_database WHERE datname = 'careermate_db';" 2>&1

if ($dbCheck -match "1 row") {
    Write-Host "✓ Database careermate_db da ton tai" -ForegroundColor Green
} else {
    Write-Host "Dang tao database careermate_db..." -ForegroundColor Yellow
    $createDb = & $psqlPath -U postgres -h localhost -p 5432 -d postgres -c "CREATE DATABASE careermate_db;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Da tao database careermate_db" -ForegroundColor Green
    } else {
        Write-Host "✗ Loi khi tao database: $createDb" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Buoc 2: Dang tao cac bang chuc nang sinh vien..." -ForegroundColor Yellow

# Doc file SQL
$sqlFile = "TAO_BANG_CHUC_NANG_SINH_VIEN.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "✗ Khong tim thay file: $sqlFile" -ForegroundColor Red
    exit 1
}

# Chay SQL file
$sqlContent = Get-Content $sqlFile -Raw -Encoding UTF8
$result = & $psqlPath -U postgres -h localhost -p 5432 -d careermate_db -c $sqlContent 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Da tao cac bang thanh cong!" -ForegroundColor Green
} else {
    # Co the co loi do bang da ton tai, kiem tra lai
    if ($result -match "already exists") {
        Write-Host "⚠ Mot so bang da ton tai (co the bo qua)" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Co loi khi tao bang:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Buoc 3: Dang kiem tra cac bang da tao..." -ForegroundColor Yellow

# Kiem tra cac bang
$tables = & $psqlPath -U postgres -h localhost -p 5432 -d careermate_db -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" 2>&1

$expectedTables = @(
    "ai_chat_conversations",
    "ai_chat_messages", 
    "saved_jobs",
    "mock_interviews",
    "mock_interview_questions",
    "job_recommendations"
)

Write-Host ""
Write-Host "Danh sach bang da tao:" -ForegroundColor Cyan
$foundTables = @()
foreach ($line in $tables) {
    if ($line -match "^\s+(\w+)\s*$") {
        $tableName = $matches[1]
        if ($expectedTables -contains $tableName) {
            Write-Host "  ✓ $tableName" -ForegroundColor Green
            $foundTables += $tableName
        } else {
            Write-Host "  - $tableName" -ForegroundColor Gray
        }
    }
}

Write-Host ""
$missingTables = $expectedTables | Where-Object { $foundTables -notcontains $_ }
if ($missingTables.Count -eq 0) {
    Write-Host "✓ Tat ca cac bang da duoc tao thanh cong!" -ForegroundColor Green
} else {
    Write-Host "⚠ Cac bang chua duoc tao:" -ForegroundColor Yellow
    foreach ($table in $missingTables) {
        Write-Host "  - $table" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== HOAN TAT ===" -ForegroundColor Cyan

