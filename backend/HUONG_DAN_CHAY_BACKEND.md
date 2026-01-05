# Hướng dẫn chạy Backend - CareerMate

## ✅ Database đã sẵn sàng!

PostgreSQL và Redis đang chạy trong Docker containers.

## 🚀 Cách chạy Backend

### Cách 1: Dùng script tự động (Khuyến nghị)

**Windows:**
```bash
cd backend
.\run-backend.bat
```

Script này sẽ:
- Tự động set JAVA_HOME
- Chạy Maven Wrapper
- Start Spring Boot backend

### Cách 2: Chạy thủ công

**Bước 1: Set JAVA_HOME**
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
```

**Bước 2: Chạy Maven Wrapper**
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

### Cách 3: Nếu đã cài Maven

```bash
cd backend
mvn spring-boot:run
```

## 🔍 Kiểm tra Backend đã chạy

### 1. Xem logs
Backend sẽ hiển thị logs trong terminal. Tìm dòng:
```
Started CareerMateApplication in X.XXX seconds
```

### 2. Test API
Mở browser và truy cập:
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **Health Check**: http://localhost:8080/api/actuator/health
- **API Docs**: http://localhost:8080/api/api-docs

### 3. Test đăng ký/đăng nhập
- Mở: http://localhost/CareerMate/Web/login.html
- Thử đăng ký tài khoản mới
- Hoặc đăng nhập

## ⚠️ Troubleshooting

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
- Tìm process đang dùng port 8080:
  ```powershell
  netstat -ano | findstr :8080
  ```
- Kill process hoặc đổi port trong `application.yml`:
  ```yaml
  server:
    port: 8081
  ```

### Lỗi: "Database connection failed"
**Giải pháp:**
- Kiểm tra Docker containers đang chạy:
  ```bash
  docker ps
  ```
- Khởi động lại nếu cần:
  ```bash
  docker-compose up -d postgres redis
  ```

### Lỗi: "Maven wrapper not found"
**Giải pháp:**
- File đã được tạo tự động
- Nếu thiếu, tải lại:
  ```powershell
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

# Run backend
.\run-backend.bat

# Stop backend
Ctrl + C

# Stop database
docker-compose down
```

---

**Backend sẽ chạy tại: http://localhost:8080/api** ✅

Sau khi backend chạy, bạn có thể test đăng nhập/đăng ký từ frontend!

