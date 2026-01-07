# Script to test Gemini API with different models
# Usage: .\TEST_GEMINI_MODELS.ps1

Write-Host "=== GEMINI API MODEL TESTER ===" -ForegroundColor Cyan
Write-Host ""

# Get API key from user
$apiKey = Read-Host "Enter your Gemini API key"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "Error: API key cannot be empty!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "API Key: $($apiKey.Substring(0, [Math]::Min(20, $apiKey.Length)))..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Testing API key with different models..." -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

# Models to test
$models = @(
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash-latest",
    "gemini-pro-latest"
)

$results = @{}
$baseUrl = "https://generativelanguage.googleapis.com/v1beta"

foreach ($model in $models) {
    Write-Host ""
    Write-Host "Testing model: $model" -ForegroundColor Yellow
    
    $url = "$baseUrl/models/$model`:generateContent?key=$apiKey"
    
    $bodyObj = @{
        contents = @(
            @{
                parts = @(
                    @{
                        text = "Hello, this is a test. Please respond with 'OK'."
                    }
                )
            }
        )
    }
    $body = $bodyObj | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.candidates -and $response.candidates.Count -gt 0) {
            $text = $response.candidates[0].content.parts[0].text
            $results[$model] = @{
                Success = $true
                Response = $text
                Error = $null
            }
            Write-Host "  [SUCCESS] Model $model works!" -ForegroundColor Green
            Write-Host "  Response: $($text.Substring(0, [Math]::Min(100, $text.Length)))..." -ForegroundColor Gray
        } else {
            $results[$model] = @{
                Success = $false
                Response = $null
                Error = "Invalid response structure"
            }
            Write-Host "  [FAILED] Invalid response structure" -ForegroundColor Red
        }
    } catch {
        $errorMsg = $_.Exception.Message
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            $errorMsg = "$statusCode - $errorMsg"
        }
        $results[$model] = @{
            Success = $false
            Response = $null
            Error = $errorMsg
        }
        Write-Host "  [FAILED] $errorMsg" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 500
}

# Summary
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host ""

$workingModels = @()
$failedModels = @()

foreach ($model in $models) {
    if ($results[$model].Success) {
        $workingModels += $model
    } else {
        $failedModels += $model
    }
}

if ($workingModels.Count -gt 0) {
    Write-Host "WORKING MODELS:" -ForegroundColor Green
    foreach ($model in $workingModels) {
        Write-Host "  [OK] $model" -ForegroundColor Green
    }
    Write-Host ""
}

if ($failedModels.Count -gt 0) {
    Write-Host "FAILED MODELS:" -ForegroundColor Red
    foreach ($model in $failedModels) {
        Write-Host "  [X] $model - $($results[$model].Error)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host ("=" * 60) -ForegroundColor Gray
if ($workingModels.Count -gt 0) {
    Write-Host "RECOMMENDED MODEL: $($workingModels[0])" -ForegroundColor Green
} else {
    Write-Host "RECOMMENDED MODEL: NONE (All models failed)" -ForegroundColor Red
}
Write-Host ("=" * 60) -ForegroundColor Gray

