# Kết quả Test Gemini API Models

## API Key đã test:
- API Key: `AIzaSyDDhMiEFOVFBR_aUzkgZI72QMflFJ2qWus`

## Kết quả test:

### ✅ Models hoạt động:
1. **gemini-2.5-flash** - ✅ SUCCESS
   - Model mới nhất, nhanh
   - Khuyến nghị sử dụng
   
2. **gemini-flash-latest** - ✅ SUCCESS
   - Latest version của flash model
   - Backup option

### ❌ Models không hoạt động:
1. **gemini-pro** - ❌ 404 Not Found
   - Không có trong v1beta API
   
2. **gemini-1.5-pro** - ❌ 404 Not Found
   - Không có trong v1beta API
   
3. **gemini-1.5-flash** - ❌ 400 API key expired
   - API key đã hết hạn (có thể do model cũ)
   
4. **gemini-2.5-pro** - ❌ 429 Rate Limit
   - Có thể bị giới hạn quota
   
5. **gemini-2.0-flash** - ❌ 429 Rate Limit
   - Có thể bị giới hạn quota
   
6. **gemini-pro-latest** - ❌ 429 Rate Limit
   - Có thể bị giới hạn quota

## Model đã cấu hình:
- **Model hiện tại**: `gemini-2.5-flash`
- **File cấu hình**: 
  - `backend/src/main/resources/application.yml`
  - `backend/src/main/resources/application-dev.yml`
  - `backend/src/main/java/vn/careermate/service/AIService.java`

## Cách test lại:
Chạy script PowerShell:
```powershell
.\TEST_GEMINI_MODELS.ps1
```

Hoặc test trực tiếp:
```powershell
$apiKey = "YOUR_API_KEY"
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey"
$body = '{"contents":[{"parts":[{"text":"Hello"}]}]}'
Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
```

## Danh sách tất cả models có sẵn:
Chạy lệnh sau để xem danh sách:
```powershell
$apiKey = "YOUR_API_KEY"
$url = "https://generativelanguage.googleapis.com/v1beta/models?key=$apiKey"
Invoke-RestMethod -Uri $url -Method Get
```

