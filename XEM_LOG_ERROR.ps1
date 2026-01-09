# Script xem chỉ lỗi trong log
# Usage: .\XEM_LOG_ERROR.ps1 [lines]

param(
    [int]$Lines = 100
)

$logFile = "backend\logs\careermate.log"

if (-not (Test-Path $logFile)) {
    Write-Host "ERROR: Log file khong ton tai: $logFile" -ForegroundColor Red
    exit 1
}

Write-Host "=== ERRORS AND EXCEPTIONS ===" -ForegroundColor Red
Write-Host "File: $logFile" -ForegroundColor Gray
Write-Host ""

$content = Get-Content $logFile -Tail ($Lines * 2) | Select-String -Pattern "ERROR|Exception|Error|Failed|Failed to" -Context 2,2

if ($content) {
    foreach ($item in $content) {
        if ($item.Line -match "ERROR|Exception|Error|Failed") {
            Write-Host $item.Line -ForegroundColor Red
        } else {
            Write-Host $item.Line -ForegroundColor Gray
        }
    }
} else {
    Write-Host "OK: Khong co loi nao trong log gan day!" -ForegroundColor Green
}
