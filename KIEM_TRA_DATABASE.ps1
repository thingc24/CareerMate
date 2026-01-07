# Script kiem tra database
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$env:PGPASSWORD = "Aa1234"

Write-Host "=== KIEM TRA DATABASE ===" -ForegroundColor Cyan
Write-Host ""

# Kiem tra database
Write-Host "Dang kiem tra database careermate_db..." -ForegroundColor Yellow
$dbList = & $psqlPath -U postgres -h localhost -p 5432 -d postgres -c "\l" 2>&1
$hasDb = $dbList | Select-String -Pattern "careermate_db"

if ($hasDb) {
    Write-Host "✓ Database careermate_db DA TON TAI!" -ForegroundColor Green
    Write-Host ""
    
    # Kiem tra bang
    Write-Host "Dang kiem tra cac bang..." -ForegroundColor Yellow
    $tables = & $psqlPath -U postgres -h localhost -p 5432 -d careermate_db -c "\dt" 2>&1
    $tableLines = $tables | Select-String -Pattern "public\s+\|\s+\w+"
    
    if ($tableLines) {
        Write-Host "✓ Tim thay cac bang!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Danh sach bang:" -ForegroundColor Cyan
        foreach ($line in $tableLines) {
            if ($line.Line -match "public\s+\|\s+(\w+)") {
                Write-Host "  - $($matches[1])" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "⚠ Chua co bang nao" -ForegroundColor Yellow
        Write-Host "Backend se tu dong tao bang khi chay (ddl-auto: update)" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ Database careermate_db CHUA TON TAI" -ForegroundColor Red
    Write-Host ""
    Write-Host "Can tao database!" -ForegroundColor Yellow
    Write-Host "Chay file: TAO_DATABASE.sql trong pgAdmin" -ForegroundColor Gray
}

