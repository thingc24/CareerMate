# Hướng Dẫn Đọc File Log

## 📍 Vị Trí File Log

File log được cấu hình trong `backend/src/main/resources/application.yml`:
```yaml
logging:
  file:
    name: logs/careermate.log
```

**Đường dẫn file log:**
- `backend/logs/careermate.log` (trong thư mục backend)
- Hoặc `logs/careermate.log` (trong thư mục root project)

## 📖 Cách Đọc Log File

### 1. Sử dụng PowerShell (Windows)

#### Xem toàn bộ log:
```powershell
Get-Content backend\logs\careermate.log
```

#### Xem 50 dòng cuối cùng (mới nhất):
```powershell
Get-Content backend\logs\careermate.log -Tail 50
```

#### Xem log theo thời gian thực (real-time):
```powershell
Get-Content backend\logs\careermate.log -Wait -Tail 20
```

#### Tìm kiếm trong log:
```powershell
# Tìm lỗi
Get-Content backend\logs\careermate.log | Select-String "ERROR"

# Tìm theo từ khóa
Get-Content backend\logs\careermate.log | Select-String "profile"

# Tìm lỗi của profile update
Get-Content backend\logs\careermate.log | Select-String "profile" | Select-String "ERROR"
```

#### Xem log của ngày hôm nay:
```powershell
$today = Get-Date -Format "yyyy-MM-dd"
Get-Content backend\logs\careermate.log | Select-String $today
```

### 2. Sử dụng Command Prompt (CMD)

#### Xem toàn bộ log:
```cmd
type backend\logs\careermate.log
```

#### Xem 50 dòng cuối:
```cmd
powershell -Command "Get-Content backend\logs\careermate.log -Tail 50"
```

### 3. Sử dụng Notepad/Text Editor

Mở file trực tiếp:
```
backend\logs\careermate.log
```

**Lưu ý:** File log có thể rất lớn, nên dùng PowerShell để xem phần cuối.

### 4. Sử dụng VS Code hoặc IDE

1. Mở VS Code
2. File → Open File
3. Chọn `backend/logs/careermate.log`
4. Sử dụng Ctrl+F để tìm kiếm

## 🔍 Các Loại Log Quan Trọng

### Log Levels:
- **ERROR**: Lỗi nghiêm trọng
- **WARN**: Cảnh báo
- **INFO**: Thông tin quan trọng
- **DEBUG**: Chi tiết debug

### Tìm các log quan trọng:

#### Tìm tất cả lỗi:
```powershell
Get-Content backend\logs\careermate.log | Select-String "ERROR"
```

#### Tìm log liên quan đến Profile:
```powershell
Get-Content backend\logs\careermate.log | Select-String "profile" -CaseSensitive:$false
```

#### Tìm log liên quan đến Authentication:
```powershell
Get-Content backend\logs\careermate.log | Select-String "JWT|Authentication|auth"
```

#### Tìm log liên quan đến Database:
```powershell
Get-Content backend\logs\careermate.log | Select-String "SQL|Hibernate|database"
```

## 📝 Script PowerShell Tiện Ích

### Script xem log real-time:
Tạo file `XEM_LOG.ps1`:
```powershell
# Xem log real-time
Write-Host "=== XEM LOG REAL-TIME ===" -ForegroundColor Green
Write-Host "Nhan Ctrl+C de thoat" -ForegroundColor Yellow
Write-Host ""

$logFile = "backend\logs\careermate.log"

if (Test-Path $logFile) {
    Get-Content $logFile -Wait -Tail 30
} else {
    Write-Host "Khong tim thay file log: $logFile" -ForegroundColor Red
    Write-Host "Backend co the chua chay hoac log chua duoc tao" -ForegroundColor Yellow
}
```

### Script tìm lỗi:
Tạo file `TIM_LOI.ps1`:
```powershell
# Tim loi trong log
Write-Host "=== TIM LOI TRONG LOG ===" -ForegroundColor Green
Write-Host ""

$logFile = "backend\logs\careermate.log"

if (Test-Path $logFile) {
    $errors = Get-Content $logFile | Select-String "ERROR"
    
    if ($errors) {
        Write-Host "Tim thay $($errors.Count) loi:" -ForegroundColor Red
        $errors | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
    } else {
        Write-Host "Khong tim thay loi nao!" -ForegroundColor Green
    }
} else {
    Write-Host "Khong tim thay file log: $logFile" -ForegroundColor Red
}
```

### Script xem log profile:
Tạo file `XEM_LOG_PROFILE.ps1`:
```powershell
# Xem log lien quan den profile
Write-Host "=== LOG PROFILE ===" -ForegroundColor Green
Write-Host ""

$logFile = "backend\logs\careermate.log"

if (Test-Path $logFile) {
    Get-Content $logFile | Select-String "profile|Profile|PROFILE" | Select-Object -Last 50
} else {
    Write-Host "Khong tim thay file log: $logFile" -ForegroundColor Red
}
```

## 🚀 Chạy Scripts

### Chạy script xem log real-time:
```powershell
.\XEM_LOG.ps1
```

### Chạy script tìm lỗi:
```powershell
.\TIM_LOI.ps1
```

### Chạy script xem log profile:
```powershell
.\XEM_LOG_PROFILE.ps1
```

## 💡 Tips

1. **Xem log real-time khi debug**: Dùng `Get-Content -Wait -Tail 20` để xem log mới nhất
2. **Tìm lỗi nhanh**: Dùng `Select-String "ERROR"` để lọc lỗi
3. **Export log**: `Get-Content backend\logs\careermate.log | Out-File log_backup.txt`
4. **Xem log của giờ cụ thể**: `Get-Content backend\logs\careermate.log | Select-String "2026-01-08 00:"`

## 📌 Lưu Ý

- File log có thể rất lớn (max 10MB, giữ 30 file)
- Log cũ sẽ được rotate tự động
- Nếu không thấy file log, backend có thể chưa chạy hoặc chưa có log nào được ghi

