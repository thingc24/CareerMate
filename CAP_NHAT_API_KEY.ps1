# Script tự động cập nhật OpenRouter API Key vào config files
# Usage: .\CAP_NHAT_API_KEY.ps1 -ApiKey "YOUR_API_KEY"

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

Write-Host "=== CAP NHAT OPENROUTER API KEY ===" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrEmpty($ApiKey)) {
    Write-Host "❌ API Key khong duoc de trong!" -ForegroundColor Red
    exit 1
}

# Files to update
$files = @(
    "backend\src\main\resources\application.yml",
    "backend\src\main\resources\application-dev.yml"
)

$updated = 0
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Cap nhat: $file" -ForegroundColor Yellow
        $content = Get-Content $file -Raw
        
        # Replace API key
        $content = $content -replace 'api-key:\s*\$?\{?OPENROUTER_API_KEY:.*?\}?', "api-key: `$$ApiKey"
        $content = $content -replace 'api-key:\s*YOUR_OPENROUTER_API_KEY_HERE', "api-key: `$$ApiKey"
        $content = $content -replace 'api-key:\s*["'']?[^`n`r"'']+["'']?', "api-key: `$$ApiKey"
        
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "  ✅ Da cap nhat!" -ForegroundColor Green
        $updated++
    } else {
        Write-Host "  ⚠️  File khong ton tai: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== KET QUA ===" -ForegroundColor Green
Write-Host "Da cap nhat $updated file(s)" -ForegroundColor Green
Write-Host ""
Write-Host "BUOC TIEP THEO:" -ForegroundColor Yellow
Write-Host "  1. Kiem tra lai API key trong cac file config" -ForegroundColor White
Write-Host "  2. Restart backend: .\CHAY_BACKEND.ps1" -ForegroundColor White
Write-Host "  3. Test chuc nang AI trong app" -ForegroundColor White
