# Script xem log lien quan den profile
Write-Host "=== LOG PROFILE ===" -ForegroundColor Green
Write-Host ""

$logFile = "backend\logs\careermate.log"

if (Test-Path $logFile) {
    Write-Host "Tim log lien quan den profile (50 dong cuoi):" -ForegroundColor Cyan
    Write-Host ""
    $profileLogs = Get-Content $logFile | Select-String "profile|Profile|PROFILE" | Select-Object -Last 50
    
    if ($profileLogs) {
        $profileLogs | ForEach-Object {
            if ($_ -match "ERROR") {
                Write-Host $_ -ForegroundColor Red
            } elseif ($_ -match "WARN") {
                Write-Host $_ -ForegroundColor Yellow
            } else {
                Write-Host $_ -ForegroundColor White
            }
        }
    } else {
        Write-Host "Khong tim thay log nao lien quan den profile" -ForegroundColor Yellow
    }
} else {
    Write-Host "Khong tim thay file log: $logFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "Nhan Enter de thoat..."
Read-Host

