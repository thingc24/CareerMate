# Cách chạy Backend - CareerMate

## ⚠️ QUAN TRỌNG: Backend chưa chạy được tự động

Có thể do:
1. Maven đang tải dependencies (lần đầu mất 2-5 phút)
2. Có lỗi compile cần xem logs

## 🚀 Cách chạy (Khuyến nghị)

### Cách 1: Dùng start.bat (Đơn giản nhất)

1. Mở **Command Prompt** (không phải PowerShell)
2. Chạy:
```cmd
cd C:\xampp\htdocs\CareerMate\backend
start.bat
```

3. **Xem logs** trong cửa sổ Command Prompt
4. Đợi đến khi thấy: `Started CareerMateApplication`

### Cách 2: Chạy trực tiếp trong Command Prompt

```cmd
cd C:\xampp\htdocs\CareerMate\backend
set JAVA_HOME=C:\Program Files\Java\jdk-23
set PATH=%JAVA_HOME%\bin;%PATH%
mvnw.cmd spring-boot:run
```

### Cách 3: Nếu đã cài Maven

```cmd
cd C:\xampp\htdocs\CareerMate\backend
set JAVA_HOME=C:\Program Files\Java\jdk-23
mvn spring-boot:run
```

## ⏱️ Thời gian

- **Lần đầu**: 2-5 phút (Maven tải dependencies)
- **Lần sau**: 30-60 giây

## ✅ Kiểm tra đã chạy

Sau khi thấy `Started CareerMateApplication`, mở browser:
- http://localhost:8080/api/swagger-ui.html
- http://localhost:8080/api/actuator/health

## 🔍 Xem logs

**QUAN TRỌNG**: Phải xem logs trong terminal để biết:
- Maven đang tải dependencies
- Có lỗi compile không
- Backend đã start chưa

## ❌ Nếu có lỗi

Copy toàn bộ log và gửi để tôi hỗ trợ!

---

**Lưu ý**: Dùng **Command Prompt** (cmd.exe) thay vì PowerShell để tránh lỗi path!

