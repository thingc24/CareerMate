# Quick Start Database - CareerMate

## Cách nhanh nhất: Dùng Docker

### 1. Cài Docker Desktop
- Tải: https://www.docker.com/products/docker-desktop
- Cài đặt và khởi động

### 2. Chạy lệnh này:
```bash
cd backend
docker-compose up -d postgres redis
```

### 3. Đợi 30 giây, sau đó kiểm tra:
```bash
docker ps
```

Phải thấy 2 containers:
- `careermate-postgres` (PostgreSQL)
- `careermate-redis` (Redis)

### 4. Chạy schema (tạo tables):
```bash
docker exec -i careermate-postgres psql -U careermate_user -d careermate_db < database/schema.sql
```

### 5. Xong! Database đã sẵn sàng ✅

Backend sẽ tự động kết nối khi bạn chạy:
```bash
mvn spring-boot:run
```

---

## Nếu không có Docker: Dùng PostgreSQL Local

### 1. Tải PostgreSQL
- Windows: https://www.postgresql.org/download/windows/
- Cài đặt với password (ví dụ: `postgres`)

### 2. Tạo Database
Mở **pgAdmin** hoặc **Command Prompt**:
```sql
CREATE DATABASE careermate_db;
```

### 3. Chạy Schema
Trong pgAdmin:
1. Right-click database `careermate_db` → Query Tool
2. Mở file `backend/database/schema.sql`
3. Copy toàn bộ và paste vào Query Tool
4. Chạy (F5)

### 4. Cập nhật `application.yml`
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/careermate_db
    username: postgres
    password: your_password  # Password bạn đã đặt khi cài
```

---

## Kiểm tra kết nối

### Test Database:
```bash
# PostgreSQL
psql -U postgres -d careermate_db
# Nhập password
# Nếu vào được = OK!
```

### Test từ Backend:
1. Chạy: `mvn spring-boot:run`
2. Xem logs, tìm:
   ```
   HikariPool-1 - Start completed
   ```
3. Nếu thấy lỗi "Connection refused" → Database chưa chạy

---

## Troubleshooting

**Lỗi: "Connection refused"**
→ Database chưa chạy. Kiểm tra:
- Docker: `docker ps`
- PostgreSQL: Service đang chạy trong Services

**Lỗi: "Authentication failed"**
→ Username/password sai trong `application.yml`

**Lỗi: "Database does not exist"**
→ Chưa tạo database. Tạo database trước.

---

**Sau khi setup xong, đăng nhập/đăng ký sẽ hoạt động!** 🎉

