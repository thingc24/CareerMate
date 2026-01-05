# Cách chạy Backend - Đơn giản nhất

## ⚠️ Backend chưa chạy tự động

Cần chạy thủ công và **xem logs** để biết vấn đề.

## 🚀 Cách chạy (BẮT BUỘC phải xem logs)

### Bước 1: Mở Command Prompt hoặc PowerShell

### Bước 2: Chạy lệnh

**PowerShell:**
```powershell
cd C:\xampp\htdocs\CareerMate\backend
.\start.bat
```

**Command Prompt:**
```cmd
cd C:\xampp\htdocs\CareerMate\backend
start.bat
```

### Bước 3: XEM LOGS trong terminal

**QUAN TRỌNG**: Phải xem logs để biết:
- ✅ Maven đang tải dependencies → Đợi 2-5 phút
- ✅ Compiling... → Đang compile code
- ✅ Started CareerMateApplication → **THÀNH CÔNG!**
- ❌ ERROR → Có lỗi, copy log gửi tôi

## ⏱️ Thời gian

- **Lần đầu**: 2-5 phút (Maven tải dependencies)
- **Lần sau**: 30-60 giây

## ✅ Kiểm tra đã chạy

Sau khi thấy `Started CareerMateApplication` trong logs:

1. Mở browser: http://localhost:8080/api/swagger-ui.html
2. Nếu thấy Swagger UI = **THÀNH CÔNG!** ✅

## ❌ Nếu có lỗi

**Copy toàn bộ log** (từ terminal) và gửi để tôi hỗ trợ!

---

**Lưu ý**: 
- Phải **xem logs** trong terminal
- Đợi đến khi thấy "Started CareerMateApplication"
- Không đóng cửa sổ terminal khi backend đang chạy

