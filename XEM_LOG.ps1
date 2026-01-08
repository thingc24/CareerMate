# Script xem log real-time
Write-Host "=== XEM LOG REAL-TIME ===" -ForegroundColor Green
Write-Host "Nhan Ctrl+C de thoat" -ForegroundColor Yellow
Write-Host ""

$logFile = "backend\logs\careermate.log"

if (Test-Path $logFile) {
    Write-Host "Dang xem log tu: $logFile" -ForegroundColor Cyan
    Write-Host "Hien thi 30 dong cuoi cung, cho doi log moi..." -ForegroundColor Gray
    Write-Host ""
    Get-Content $logFile -Wait -Tail 30
} else {
    Write-Host "Khong tim thay file log: $logFile" -ForegroundColor Red
    Write-Host "Backend co the chua chay hoac log chua duoc tao" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "De tao log, hay chay backend truoc:" -ForegroundColor Cyan
    Write-Host "  cd backend" -ForegroundColor Gray
    Write-Host "  mvn spring-boot:run" -ForegroundColor Gray
}

