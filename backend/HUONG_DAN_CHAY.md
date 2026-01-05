# Hướng dẫn chạy Backend - CareerMate

## ⚠️ QUAN TRỌNG

**PowerShell**: Phải dùng `.\start.bat` (có dấu chấm và backslash)  
**Command Prompt**: Có thể dùng `start.bat` hoặc `.\start.bat`

## 🚀 Cách chạy

### Trong PowerShell:
```powershell
cd C:\xampp\htdocs\CareerMate\backend
.\start.bat
```

### Trong Command Prompt (cmd):
```cmd
cd C:\xampp\htdocs\CareerMate\backend
start.bat
```
hoặc
```cmd
.\start.bat
```

## ⏱️ Thời gian

- **Lần đầu**: 2-5 phút (Maven tải dependencies)
- **Lần sau**: 30-60 giây

## ✅ Kiểm tra đã chạy

Sau khi thấy `Started CareerMateApplication`, mở browser:
- http://localhost:8080/api/swagger-ui.html
- http://localhost:8080/api/actuator/health

## 🔍 Xem logs

**QUAN TRỌNG**: Xem logs trong terminal để biết:
- Maven đang tải dependencies
- Có lỗi compile không
- Backend đã start chưa

---

**Lưu ý**: Trong PowerShell luôn dùng `.\` trước tên file!

