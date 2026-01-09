# Script theo dõi log real-time (tương tự tail -f)
# Usage: .\XEM_LOG_THEO_DOI.ps1

$logFile = "backend\logs\careermate.log"

if (-not (Test-Path $logFile)) {
    Write-Host "ERROR: Log file khong ton tai: $logFile" -ForegroundColor Red
    Write-Host "Hay chay backend truoc: .\CHAY_BACKEND.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "=== THEO DOI LOG REAL-TIME ===" -ForegroundColor Cyan
Write-Host "File: $logFile" -ForegroundColor Gray
Write-Host "Nhan Ctrl+C de dung" -ForegroundColor Yellow
Write-Host ""

# Show last 20 lines first
$lastLines = Get-Content $logFile -Tail 20
foreach ($line in $lastLines) {
    if ($line -match "ERROR|Exception|Error") {
        Write-Host $line -ForegroundColor Red
    } elseif ($line -match "WARN|Warning") {
        Write-Host $line -ForegroundColor Yellow
    } elseif ($line -match "INFO") {
        Write-Host $line -ForegroundColor Green
    } else {
        Write-Host $line -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "--- Bat dau theo doi (cho log moi) ---" -ForegroundColor Cyan
Write-Host ""

# Follow new lines
Get-Content $logFile -Wait -Tail 0 | ForEach-Object {
    $line = $_
    
    if ($line -match "ERROR|Exception|Error") {
        Write-Host $line -ForegroundColor Red
    } elseif ($line -match "WARN|Warning") {
        Write-Host $line -ForegroundColor Yellow
    } elseif ($line -match "INFO") {
        Write-Host $line -ForegroundColor Green
    } elseif ($line -match "DEBUG") {
        Write-Host $line -ForegroundColor DarkGray
    } else {
        Write-Host $line
    }
}
