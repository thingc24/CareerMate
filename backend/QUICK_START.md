# Quick Start - CareerMate Backend

## ✅ Database đã sẵn sàng!

PostgreSQL và Redis đang chạy trong Docker.

## 🚀 Chạy Backend

### Cách 1: Dùng script (Khuyến nghị)
```bash
cd backend
.\run-backend.bat
```

### Cách 2: Chạy thủ công
```powershell
cd backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
.\mvnw.cmd spring-boot:run
```

## ⏱️ Thời gian chạy

- **Lần đầu**: 2-5 phút (Maven tải dependencies)
- **Lần sau**: 30-60 giây (compile code)

## ✅ Kiểm tra Backend đã chạy

### 1. Xem logs
Tìm dòng:
```
Started CareerMateApplication in X.XXX seconds
```

### 2. Test API
Mở browser:
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **Health**: http://localhost:8080/api/actuator/health

### 3. Test từ Frontend
- Mở: http://localhost/CareerMate/Web/login.html
- Thử đăng ký/đăng nhập

## 🔧 Troubleshooting

### Lỗi: "' ' is not recognized"
→ Đã sửa trong `run-backend.bat` (thêm quotes cho JAVA_HOME)

### Lỗi: "Port 8080 already in use"
```powershell
# Tìm process
netstat -ano | findstr :8080
# Kill process (thay PID bằng số thực tế)
taskkill /PID <PID> /F
```

### Lỗi: "Database connection failed"
```bash
# Kiểm tra Docker
docker ps
# Khởi động lại nếu cần
docker-compose up -d postgres redis
```

## 📝 Lưu ý

- Backend chạy tại: **http://localhost:8080/api**
- Database: `careermate_db` (PostgreSQL)
- Username: `careermate_user`
- Password: `careermate_password`

---

**Sau khi backend chạy, bạn có thể test đăng nhập/đăng ký!** ✅
