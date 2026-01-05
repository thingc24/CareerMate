# Chạy Backend với Maven - CareerMate

## ✅ Maven đã được cài tại:
```
C:\Program Files\apache-maven-3.9.12\bin
```

## 🚀 Cách chạy Backend

### Cách 1: Dùng script (Khuyến nghị)

```cmd
cd C:\xampp\htdocs\CareerMate\backend
start-with-maven.bat
```

### Cách 2: Chạy thủ công

```cmd
cd C:\xampp\htdocs\CareerMate\backend

REM Set JAVA_HOME
set JAVA_HOME=C:\Program Files\Java\jdk-23

REM Add Maven to PATH
set PATH=C:\Program Files\apache-maven-3.9.12\bin;%PATH%

REM Run Spring Boot
mvn spring-boot:run
```

### Cách 3: Nếu đã thêm Maven vào System PATH

```cmd
cd C:\xampp\htdocs\CareerMate\backend
set JAVA_HOME=C:\Program Files\Java\jdk-23
mvn spring-boot:run
```

## ⏱️ Thời gian

- **Lần đầu**: 2-5 phút (Maven tải dependencies)
- **Lần sau**: 30-60 giây

## ✅ Kiểm tra đã chạy

Sau khi thấy `Started CareerMateApplication` trong logs:

1. Mở browser: http://localhost:8080/api/swagger-ui.html
2. Nếu thấy Swagger UI = **THÀNH CÔNG!** ✅

## 🔍 Xem logs

**QUAN TRỌNG**: Xem logs trong terminal để biết:
- ✅ "Downloading..." → Maven đang tải dependencies (đợi 2-5 phút)
- ✅ "Compiling..." → Đang compile code
- ✅ "Started CareerMateApplication" → **THÀNH CÔNG!**
- ❌ "ERROR" → Có lỗi, copy log gửi tôi

## 📝 Lưu ý

- Script `start-with-maven.bat` đã được cập nhật với đường dẫn Maven của bạn
- Nếu Maven đã có trong System PATH, không cần thêm vào script
- Luôn xem logs để biết tiến trình

---

**Sau khi backend chạy, bạn có thể test đăng nhập/đăng ký!** ✅

