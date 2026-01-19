# User-Service Database Setup

## 🎯 Database riêng cho User-Service

User-Service hiện tại đã được cấu hình để sử dụng **database riêng**: `user_service_db`

## 📋 Các bước setup:

### 1. Tạo database mới

```bash
# Windows (PowerShell)
cd backend\microservices\user-service\src\main\java\vn\careermate\userservice\database
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f create_database.sql

# Linux/Mac
psql -U postgres -f create_database.sql
```

### 2. Tạo schema và tables

```bash
# Windows (PowerShell)
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d user_service_db -f schema.sql

# Linux/Mac
psql -U postgres -d user_service_db -f schema.sql
```

### 3. Migrate data từ database cũ (nếu cần)

Nếu bạn đã có data trong `careermate_db.userservice` và muốn migrate sang database mới:

#### Option A: Sử dụng pg_dump (Khuyến nghị)

```bash
# Export data từ database cũ
pg_dump -U postgres -d careermate_db -t userservice.* --data-only --column-inserts > user_service_data.sql

# Import vào database mới
psql -U postgres -d user_service_db -f user_service_data.sql
```

#### Option B: Sử dụng pg_dump custom format

```bash
# Export với custom format
pg_dump -U postgres -d careermate_db -t userservice.* -Fc > user_service_data.dump

# Restore vào database mới
pg_restore -U postgres -d user_service_db -n userservice user_service_data.dump
```

### 4. Cập nhật application.yml

File `application.yml` đã được cập nhật để trỏ đến database mới:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/user_service_db
```

### 5. Verify

Kiểm tra database đã được tạo và có data:

```sql
-- Connect to user_service_db
psql -U postgres -d user_service_db

-- Check schema
\dn

-- Check tables
\dt userservice.*

-- Check data
SELECT COUNT(*) FROM userservice.users;
```

## 📊 Database Structure

### Database: `user_service_db`
### Schema: `userservice`

### Tables:
- `users` - Thông tin người dùng
- `oauth_providers` - OAuth providers
- `student_profiles` - Hồ sơ sinh viên
- `student_skills` - Kỹ năng sinh viên
- `cvs` - CV files
- `recruiter_profiles` - Hồ sơ nhà tuyển dụng
- `conversations` - Cuộc trò chuyện
- `messages` - Tin nhắn

## ✅ Lợi ích của database riêng:

1. **Isolation**: Mỗi service có database riêng, không ảnh hưởng lẫn nhau
2. **Scalability**: Có thể scale database độc lập
3. **Security**: Dễ quản lý permissions và access control
4. **Backup**: Backup và restore độc lập
5. **Performance**: Tối ưu database cho từng service

## 🔄 Migration từ database cũ:

Nếu bạn đang chạy từ database chung (`careermate_db`), cần migrate data:

1. **Backup data hiện tại**:
   ```bash
   pg_dump -U postgres -d careermate_db -t userservice.* > backup_userservice.sql
   ```

2. **Tạo database mới** (theo bước 1-2 ở trên)

3. **Restore data**:
   ```bash
   psql -U postgres -d user_service_db -f backup_userservice.sql
   ```

4. **Update application.yml** (đã được cập nhật)

5. **Restart service**

## ⚠️ Lưu ý:

- Database mới sẽ **trống** nếu không migrate data
- Nếu không cần migrate, có thể bỏ qua bước 3
- Đảm bảo PostgreSQL user có quyền tạo database
- Sau khi migrate, có thể xóa schema `userservice` trong `careermate_db` (nếu muốn)
