# Script để xem logs real-time khi submit quiz
Write-Host "`n=== MONITOR LOGS SUBMIT QUIZ ===" -ForegroundColor Cyan
Write-Host "Đang theo dõi logs learning-service..." -ForegroundColor Yellow
Write-Host "Hãy test nộp bài quiz trong browser" -ForegroundColor Green
Write-Host "Nhấn Ctrl+C để dừng`n" -ForegroundColor Gray

$logFile = "backend\microservices\learning-service\logs\learning-service.log"

if (-not (Test-Path $logFile)) {
    Write-Host "⚠️  Không tìm thấy log file: $logFile" -ForegroundColor Red
    exit
}

# Đọc từ dòng cuối cùng
$lastLine = 0
$lineCount = (Get-Content $logFile | Measure-Object -Line).Lines

while ($true) {
    Start-Sleep -Milliseconds 500
    
    $currentLines = (Get-Content $logFile | Measure-Object -Line).Lines
    
    if ($currentLines -gt $lastLine) {
        # Đọc các dòng mới
        Get-Content $logFile -Tail ($currentLines - $lastLine) | ForEach-Object {
            $line = $_
            if ($line -match "SUBMIT|submit|quiz/submit|500|ERROR|Exception|Authentication|JWT") {
                Write-Host $line -ForegroundColor Yellow
            }
        }
        $lastLine = $currentLines
    }
}
