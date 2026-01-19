# 🚀 User-Service Startup Guide

## ✅ Database Connection

User-Service đã được cấu hình để kết nối với:
- **Database**: `user_service_db`
- **Schema**: `userservice`
- **Connection URL**: `jdbc:postgresql://localhost:5432/user_service_db`

## 🚀 Starting User-Service

### Option 1: Maven (Recommended)

```bash
cd backend/microservices/user-service
mvn spring-boot:run
```

### Option 2: IDE

Run `UserServiceApplication.java` từ IDE của bạn.

### Option 3: JAR File

```bash
cd backend/microservices/user-service
mvn clean package
java -jar target/user-service-1.0.0.jar
```

## ✅ Verification

### 1. Check Health Endpoint

```bash
curl http://localhost:8081/actuator/health
```

Expected response:
```json
{
  "status": "UP"
}
```

### 2. Check Database Connection in Logs

Tìm trong logs:
```
Hibernate: select ... from userservice.users
```

Không có lỗi:
```
ERROR: relation "userservice.users" does not exist
```

### 3. Test Authentication

```bash
# Register new user
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "role": "STUDENT"
  }'

# Login
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📊 Expected Logs

Khi service khởi động thành công, bạn sẽ thấy:

```
Started UserServiceApplication in X.XXX seconds
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
```

## ⚠️ Troubleshooting

### Port 8081 already in use

```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8081 | xargs kill
```

### Database connection error

1. Kiểm tra PostgreSQL đang chạy:
   ```bash
   psql -U postgres -d user_service_db -c "SELECT 1;"
   ```

2. Kiểm tra database tồn tại:
   ```bash
   psql -U postgres -l | grep user_service_db
   ```

3. Kiểm tra schema:
   ```bash
   psql -U postgres -d user_service_db -c "\dn"
   ```

### Schema not found

Đảm bảo schema `userservice` đã được tạo:
```sql
CREATE SCHEMA IF NOT EXISTS userservice;
```

## ✅ Success Indicators

- ✅ Service starts without errors
- ✅ Health endpoint returns `UP`
- ✅ Database queries work (check logs)
- ✅ Authentication endpoints work
- ✅ No connection errors in logs

## 🎯 Service is Ready When:

1. ✅ Port 8081 is listening
2. ✅ Health check returns `UP`
3. ✅ Database queries succeed
4. ✅ No errors in logs

**User-Service is now running with its own database!**
