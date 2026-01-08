# Script xem 50 dong cuoi cung cua log
Write-Host "=== 50 DONG LOG CUOI CUNG ===" -ForegroundColor Green
Write-Host ""

$logFile = "backend\logs\careermate.log"

if (Test-Path $logFile) {
    Write-Host "Dang doc 50 dong cuoi cung tu: $logFile" -ForegroundColor Cyan
    Write-Host ""
    Get-Content $logFile -Tail 50
} else {
    Write-Host "Khong tim thay file log: $logFile" -ForegroundColor Red
    Write-Host "Backend co the chua chay" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Nhan Enter de thoat..."
Read-Host

