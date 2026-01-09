# Script test OpenRouter API
# Usage: .\TEST_OPENROUTER_API.ps1

param(
    [string]$ApiKey = ""
)

Write-Host "=== TEST OPENROUTER API ===" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrEmpty($ApiKey)) {
    Write-Host "Nhap OpenRouter API Key:" -ForegroundColor Yellow
    $ApiKey = Read-Host "API Key"
}

if ([string]::IsNullOrEmpty($ApiKey)) {
    Write-Host "❌ API Key khong duoc de trong!" -ForegroundColor Red
    exit 1
}

Write-Host "Testing API Key..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Check API Key
Write-Host "1. Kiem tra API Key..." -ForegroundColor Cyan
try {
    $headers = @{
        "Authorization" = "Bearer $ApiKey"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/key" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "✅ API Key hop le!" -ForegroundColor Green
    Write-Host "   Label: $($response.label)" -ForegroundColor Gray
    Write-Host "   Created: $($response.created_at)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ API Key khong hop le hoac co loi!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Simple Chat Request
Write-Host "2. Test chat request (google/gemini-2.0-flash-exp)..." -ForegroundColor Cyan
try {
    $body = @{
        model = "google/gemini-2.0-flash-exp"
        messages = @(
            @{
                role = "user"
                content = "Xin chao! Ban co the tra loi bang tieng Viet khong?"
            }
        )
    } | ConvertTo-Json -Depth 10
    
    $headers = @{
        "Authorization" = "Bearer $ApiKey"
        "Content-Type" = "application/json"
        "HTTP-Referer" = "http://localhost:8080"
        "X-Title" = "CareerMate"
    }
    
    $response = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/chat/completions" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    
    if ($response.choices -and $response.choices.Count -gt 0) {
        $content = $response.choices[0].message.content
        Write-Host "✅ Chat request thanh cong!" -ForegroundColor Green
        Write-Host "   Response: $($content.Substring(0, [Math]::Min(100, $content.Length)))..." -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "⚠️  Response khong co content" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Chat request that bai!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Test 3: CV Analysis Format
Write-Host "3. Test CV analysis format..." -ForegroundColor Cyan
try {
    $prompt = @"
Ban la chuyen gia tu van nghe nghiep. Hay phan tich CV sau day va tra ve ket qua duoi dang JSON:
{
  "score": 75,
  "structureScore": 70,
  "contentScore": 80,
  "strengths": ["Diem manh 1", "Diem manh 2"],
  "weaknesses": ["Diem yeu 1"],
  "suggestions": ["Goi y 1"],
  "summary": "Tom tat"
}

CV Content: Nguyen Van A, Kinh nghiem 2 nam, Ky nang Java, Spring Boot
"@
    
    $body = @{
        model = "google/gemini-2.0-flash-exp"
        messages = @(
            @{
                role = "user"
                content = $prompt
            }
        )
    } | ConvertTo-Json -Depth 10
    
    $response = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/chat/completions" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    
    if ($response.choices -and $response.choices.Count -gt 0) {
        $content = $response.choices[0].message.content
        Write-Host "✅ CV analysis format test thanh cong!" -ForegroundColor Green
        Write-Host "   Response length: $($content.Length) characters" -ForegroundColor Gray
        Write-Host "   First 200 chars: $($content.Substring(0, [Math]::Min(200, $content.Length)))..." -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "❌ CV analysis format test that bai!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== KET QUA ===" -ForegroundColor Green
Write-Host "✅ OpenRouter API key hoat dong tot!" -ForegroundColor Green
Write-Host ""
Write-Host "Luu y: Cap nhat API key trong:" -ForegroundColor Yellow
Write-Host "  - backend/src/main/resources/application.yml" -ForegroundColor White
Write-Host "  - backend/src/main/resources/application-dev.yml" -ForegroundColor White
Write-Host ""
Write-Host "Hoac set environment variable:" -ForegroundColor Yellow
Write-Host "  `$env:OPENROUTER_API_KEY = `"$ApiKey`"" -ForegroundColor White
