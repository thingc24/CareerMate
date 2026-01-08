# Script tim loi trong log
Write-Host "=== TIM LOI TRONG LOG ===" -ForegroundColor Green
Write-Host ""

$logFile = "backend\logs\careermate.log"

if (Test-Path $logFile) {
    $errors = Get-Content $logFile | Select-String "ERROR"
    
    if ($errors) {
        Write-Host "Tim thay $($errors.Count) loi:" -ForegroundColor Red
        Write-Host ""
        $errors | ForEach-Object { 
            Write-Host $_ -ForegroundColor Yellow 
        }
    } else {
        Write-Host "Khong tim thay loi nao!" -ForegroundColor Green
    }
} else {
    Write-Host "Khong tim thay file log: $logFile" -ForegroundColor Red
    Write-Host "Backend co the chua chay" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Nhan Enter de thoat..."
Read-Host

