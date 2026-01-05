# Hướng dẫn Setup Database - CareerMate

## ⚠️ QUAN TRỌNG: Backend cần database để hoạt động!

Nếu bạn gặp lỗi đăng nhập/đăng ký, có thể do database chưa được setup.

## 🚀 Cách nhanh nhất: Dùng Docker

### Bước 1: Cài Docker Desktop
- Tải: https://www.docker.com/products/docker-desktop
- Cài đặt và khởi động Docker Desktop

### Bước 2: Chạy Database
Mở terminal/command prompt trong thư mục `backend`:
```bash
cd backend
docker-compose up -d postgres redis
```

### Bước 3: Đợi 30 giây, kiểm tra:
```bash
docker ps
```
Phải thấy 2 containers đang chạy:
- `careermate-postgres`
- `careermate-redis`

### Bước 4: Tạo Tables (Schema)
```bash
docker exec -i careermate-postgres psql -U careermate_user -d careermate_db < database/schema.sql
```

### Bước 5: Xong! ✅
Bây giờ bạn có thể chạy backend:
```bash
mvn spring-boot:run
```

---

## 📋 Cách 2: Cài PostgreSQL thủ công

### Bước 1: Tải PostgreSQL
- Windows: https://www.postgresql.org/download/windows/
- Cài đặt, nhớ password (ví dụ: `postgres`)

### Bước 2: Tạo Database
Mở **pgAdmin** (có sẵn khi cài PostgreSQL):
1. Kết nối với PostgreSQL server
2. Right-click "Databases" → Create → Database
3. Tên: `careermate_db`
4. Click Save

### Bước 3: Chạy Schema
1. Right-click database `careermate_db` → Query Tool
2. Mở file `backend/database/schema.sql`
3. Copy toàn bộ nội dung
4. Paste vào Query Tool
5. Chạy (F5 hoặc Execute)

### Bước 4: Cập nhật cấu hình
Mở file `backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    username: postgres  # Username của bạn
    password: your_password  # Password bạn đã đặt
```

### Bước 5: Chạy Backend
```bash
cd backend
mvn spring-boot:run
```

---

## 🔍 Kiểm tra Database có chạy không

### Windows (PowerShell):
```powershell
cd backend
.\check-database.ps1
```

### Linux/Mac:
```bash
cd backend
chmod +x check-database.sh
./check-database.sh
```

### Hoặc test thủ công:
```bash
# PostgreSQL
psql -U postgres -d careermate_db
# Nếu vào được = OK!
```

---

## ❌ Troubleshooting

### Lỗi: "Connection refused"
**Nguyên nhân**: Database chưa chạy

**Giải pháp**:
- Docker: `docker ps` xem container có chạy không
- PostgreSQL: Kiểm tra service đang chạy trong Services (Windows)
- Hoặc khởi động lại: `docker-compose up -d postgres`

### Lỗi: "Authentication failed"
**Nguyên nhân**: Username/password sai

**Giải pháp**: 
- Kiểm tra `application.yml` có đúng username/password không
- Nếu dùng Docker: username = `careermate_user`, password = `careermate_password`
- Nếu dùng local: username = `postgres`, password = password bạn đã đặt

### Lỗi: "Database does not exist"
**Nguyên nhân**: Database chưa được tạo

**Giải pháp**: Tạo database trước:
```sql
CREATE DATABASE careermate_db;
```

### Lỗi: "Table does not exist"
**Nguyên nhân**: Schema chưa được chạy

**Giải pháp**: Chạy schema:
```bash
# Docker
docker exec -i careermate-postgres psql -U careermate_user -d careermate_db < database/schema.sql

# Local
psql -U postgres -d careermate_db -f backend/database/schema.sql
```

---

## 📝 Checklist

Trước khi chạy backend, đảm bảo:

- [ ] PostgreSQL đang chạy (port 5432)
- [ ] Database `careermate_db` đã được tạo
- [ ] Schema đã được chạy (có tables)
- [ ] `application.yml` có đúng username/password
- [ ] Redis đang chạy (port 6379) - Optional nhưng khuyến nghị

---

## 🎯 Quick Commands

```bash
# Start database (Docker)
cd backend
docker-compose up -d postgres redis

# Check if running
docker ps

# Run schema
docker exec -i careermate-postgres psql -U careermate_user -d careermate_db < database/schema.sql

# Stop database
docker-compose down

# View logs
docker logs careermate-postgres
```

---

**Sau khi setup xong database, đăng nhập/đăng ký sẽ hoạt động bình thường!** ✅

Xem chi tiết tại: `backend/DATABASE_SETUP.md`

