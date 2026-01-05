# ✅ Maven đã được cài đặt thành công!

## Thông tin Maven:
- **Version**: Apache Maven 3.9.12
- **Location**: `C:\Program Files\apache-maven-3.9.12`
- **Java**: 23.0.2 ✅

## 🚀 Chạy Backend

### Cách đơn giản nhất:

```cmd
cd C:\xampp\htdocs\CareerMate\backend
start-with-maven.bat
```

Script này sẽ:
- Tự động set JAVA_HOME
- Tự động thêm Maven vào PATH
- Chạy Spring Boot

### Hoặc chạy thủ công:

```cmd
cd C:\xampp\htdocs\CareerMate\backend
set JAVA_HOME=C:\Program Files\Java\jdk-23
set PATH=C:\Program Files\apache-maven-3.9.12\bin;%PATH%
mvn spring-boot:run
```

## ⏱️ Thời gian

- **Lần đầu**: 2-5 phút (Maven tải dependencies)
- **Lần sau**: 30-60 giây

## ✅ Kiểm tra Backend đã chạy

Sau khi thấy `Started CareerMateApplication` trong logs:

1. **Swagger UI**: http://localhost:8080/api/swagger-ui.html
2. **Health Check**: http://localhost:8080/api/actuator/health
3. **Test đăng nhập**: http://localhost/CareerMate/Web/login.html

## 📝 Lưu ý

- **Xem logs** trong terminal để biết tiến trình
- Đợi đến khi thấy "Started CareerMateApplication"
- Không đóng terminal khi backend đang chạy

---

**Backend sẽ chạy tại: http://localhost:8080/api** ✅

Sau khi backend chạy, bạn có thể test đăng nhập/đăng ký từ frontend!

