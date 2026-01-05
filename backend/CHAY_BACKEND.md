# Hướng dẫn chạy Backend - CareerMate

## ✅ Database đã sẵn sàng!

PostgreSQL và Redis đang chạy trong Docker.

## 🚀 Cách chạy Backend

### Cách 1: Dùng PowerShell Script (Khuyến nghị)

```powershell
cd C:\xampp\htdocs\CareerMate\backend
.\run-backend-direct.ps1
```

### Cách 2: Dùng Batch File

```cmd
cd C:\xampp\htdocs\CareerMate\backend
.\run-backend.bat
```

### Cách 3: Chạy trực tiếp

```powershell
cd C:\xampp\htdocs\CareerMate\backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
.\mvnw.cmd spring-boot:run
```

## ⏱️ Thời gian chạy

- **Lần đầu**: 2-5 phút (Maven tải dependencies)
- **Lần sau**: 30-60 giây (compile code)

## ✅ Kiểm tra Backend đã chạy

### 1. Xem logs trong terminal
Tìm dòng:
```
Started CareerMateApplication in X.XXX seconds
```

### 2. Test API trong browser
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **Health Check**: http://localhost:8080/api/actuator/health
- **API Docs**: http://localhost:8080/api/api-docs

### 3. Test từ Frontend
- Mở: http://localhost/CareerMate/Web/login.html
- Thử đăng ký tài khoản mới
- Hoặc đăng nhập

## 🔧 Troubleshooting

### Lỗi: "Unexpected token"
→ Đã sửa trong `run-backend-direct.ps1` (loại bỏ ký tự đặc biệt)

### Lỗi: "JAVA_HOME is not set"
**Giải pháp:**
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
```

Hoặc set trong System Environment Variables:
1. Mở System Properties → Environment Variables
2. Thêm JAVA_HOME = `C:\Program Files\Java\jdk-23`
3. Thêm `%JAVA_HOME%\bin` vào PATH

### Lỗi: "Port 8080 already in use"
**Giải pháp:**
```powershell
# Tìm process
netstat -ano | findstr :8080
# Kill process (thay PID bằng số thực tế)
taskkill /PID <PID> /F
```

Hoặc đổi port trong `application.yml`:
```yaml
server:
  port: 8081
```

### Lỗi: "Database connection failed"
**Giải pháp:**
```bash
# Kiểm tra Docker
docker ps
# Khởi động lại nếu cần
docker-compose up -d postgres redis
```

### Lỗi: "Maven wrapper not found"
**Giải pháp:**
File đã được tạo tự động. Nếu thiếu:
```powershell
New-Item -ItemType Directory -Force -Path ".mvn\wrapper"
Invoke-WebRequest -Uri "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar" -OutFile ".mvn\wrapper\maven-wrapper.jar"
```

## 📝 Cấu hình

### Database (đã setup):
- **URL**: `jdbc:postgresql://localhost:5432/careermate_db`
- **Username**: `careermate_user`
- **Password**: `careermate_password`

### Server:
- **Port**: `8080`
- **Context Path**: `/api`
- **Base URL**: `http://localhost:8080/api`

## 🎯 Quick Commands

```bash
# Start database
cd backend
docker-compose up -d postgres redis

# Run backend (PowerShell)
.\run-backend-direct.ps1

# Run backend (CMD)
.\run-backend.bat

# Stop backend
Ctrl + C

# Stop database
docker-compose down
```

## 📋 Checklist

Trước khi chạy backend:
- [ ] Database đang chạy (PostgreSQL + Redis)
- [ ] JAVA_HOME đã được set
- [ ] Maven Wrapper đã có (mvnw.cmd)
- [ ] Port 8080 không bị chiếm

---

**Backend sẽ chạy tại: http://localhost:8080/api** ✅

Sau khi backend chạy, bạn có thể test đăng nhập/đăng ký từ frontend!

