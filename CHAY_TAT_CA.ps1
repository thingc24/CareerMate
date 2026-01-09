# Script chạy toàn bộ: Test API + Cập nhật + Hướng dẫn
# Usage: .\CHAY_TAT_CA.ps1 -ApiKey "YOUR_API_KEY"

param(
    [string]$ApiKey = ""
)

Write-Host "=== CAREERMATE - SETUP OPENROUTER API ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get API Key
if ([string]::IsNullOrEmpty($ApiKey)) {
    Write-Host "Nhap OpenRouter API Key:" -ForegroundColor Yellow
    Write-Host "  (Lay tai: https://openrouter.ai/keys)" -ForegroundColor Gray
    $ApiKey = Read-Host "API Key"
}

if ([string]::IsNullOrEmpty($ApiKey)) {
    Write-Host "❌ API Key khong duoc de trong!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== BUOC 1: TEST API KEY ===" -ForegroundColor Green
Write-Host ""

# Test API Key
try {
    $headers = @{
        "Authorization" = "Bearer $ApiKey"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/key" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "✅ API Key hop le!" -ForegroundColor Green
    Write-Host "   Label: $($response.label)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ API Key khong hop le!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test Chat
Write-Host "Test chat request..." -ForegroundColor Yellow
try {
    $body = @{
        model = "google/gemini-2.0-flash-exp"
        messages = @(
            @{
                role = "user"
                content = "Xin chao! Test API."
            }
        )
    } | ConvertTo-Json -Depth 10
    
    $response = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/chat/completions" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    
    if ($response.choices -and $response.choices.Count -gt 0) {
        Write-Host "✅ Chat request thanh cong!" -ForegroundColor Green
        Write-Host ""
    }
} catch {
    Write-Host "❌ Chat request that bai!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "=== BUOC 2: CAP NHAT API KEY VAO CONFIG ===" -ForegroundColor Green
Write-Host ""

# Update config files
$files = @(
    "backend\src\main\resources\application.yml",
    "backend\src\main\resources\application-dev.yml"
)

$updated = 0
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Cap nhat: $file" -ForegroundColor Yellow
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Replace API key - multiple patterns
        $patterns = @(
            'api-key:\s*\$?\{?OPENROUTER_API_KEY:.*?\}?',
            'api-key:\s*YOUR_OPENROUTER_API_KEY_HERE',
            'api-key:\s*["'']?[^`n`r"'']+["'']?'
        )
        
        $found = $false
        foreach ($pattern in $patterns) {
            if ($content -match $pattern) {
                $content = $content -replace $pattern, "api-key: `$$ApiKey"
                $found = $true
                break
            }
        }
        
        if (-not $found) {
            # Try to find and replace in ai.openrouter section
            if ($content -match '(ai:\s*\r?\n\s+openrouter:\s*\r?\n\s+api-key:\s*)([^\r\n]+)') {
                $content = $content -replace '(ai:\s*\r?\n\s+openrouter:\s*\r?\n\s+api-key:\s*)([^\r\n]+)', "`$1`$$ApiKey"
                $found = $true
            }
        }
        
        Set-Content -Path $file -Value $content -NoNewline -Encoding UTF8
        Write-Host "  ✅ Da cap nhat!" -ForegroundColor Green
        $updated++
    } else {
        Write-Host "  ⚠️  File khong ton tai: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== BUOC 3: KIEM TRA CONFIG ===" -ForegroundColor Green
Write-Host ""

# Verify
foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match "api-key:\s*\$\{?OPENROUTER_API_KEY") {
            Write-Host "  ✅ $file - Su dung environment variable" -ForegroundColor Green
        } elseif ($content -match "api-key:\s*\$ApiKey") {
            Write-Host "  ✅ $file - Da cap nhat API key" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $file - Can kiem tra lai" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=== HOAN TAT ===" -ForegroundColor Green
Write-Host ""
Write-Host "Da cap nhat $updated file(s)" -ForegroundColor Green
Write-Host ""
Write-Host "BUOC TIEP THEO:" -ForegroundColor Yellow
Write-Host "  1. Restart backend:" -ForegroundColor White
Write-Host "     .\CHAY_BACKEND.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Test trong app:" -ForegroundColor White
Write-Host "     - Phan tich CV trong AI Chat" -ForegroundColor Gray
Write-Host "     - Chat voi AI" -ForegroundColor Gray
Write-Host "     - Tao cau hoi phong van" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Neu co loi, kiem tra:" -ForegroundColor White
Write-Host "     - Backend logs: backend\logs\careermate.log" -ForegroundColor Gray
Write-Host "     - Console browser (F12)" -ForegroundColor Gray
Write-Host ""
