# Sửa lỗi CORS

## Vấn đề
Frontend chạy trên `http://localhost` (XAMPP, port 80) không thể gọi API backend trên `http://localhost:8080` do lỗi CORS.

## Giải pháp
Đã cập nhật `SecurityConfig.java` để cho phép các origin sau:
- `http://localhost` (port 80 - XAMPP)
- `http://localhost:80`
- `http://localhost:3000` (React dev server)
- `http://localhost:8080` (Backend)

## Thay đổi
File: `backend/src/main/java/vn/careermate/config/SecurityConfig.java`

```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost",
    "http://localhost:80",
    "http://localhost:3000",
    "http://localhost:8080"
));
```

## Kiểm tra
1. Khởi động lại backend
2. Mở frontend: `http://localhost/CareerMate/Web/register.html`
3. Thử đăng ký tài khoản
4. Nếu không còn lỗi CORS = thành công! ✅

