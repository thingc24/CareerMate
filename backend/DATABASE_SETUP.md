# Hướng dẫn Setup Database - CareerMate

## Tùy chọn 1: Sử dụng Docker (Khuyến nghị - Dễ nhất)

### Bước 1: Cài đặt Docker Desktop
1. Tải Docker Desktop: https://www.docker.com/products/docker-desktop
2. Cài đặt và khởi động Docker Desktop

### Bước 2: Chạy Database với Docker Compose
```bash
cd backend
docker-compose up -d postgres redis
```

### Bước 3: Kiểm tra
```bash
docker ps
# Phải thấy careermate-postgres và careermate-redis đang chạy
```

### Bước 4: Tạo Database Schema
```bash
# Copy schema vào container và chạy
docker exec -i careermate-postgres psql -U careermate_user -d careermate_db < database/schema.sql
```

Hoặc kết nối trực tiếp:
```bash
docker exec -it careermate-postgres psql -U careermate_user -d careermate_db
```

Sau đó chạy:
```sql
\i /docker-entrypoint-initdb.d/schema.sql
```

## Tùy chọn 2: Cài đặt PostgreSQL thủ công

### Bước 1: Tải và cài đặt PostgreSQL
1. Tải PostgreSQL: https://www.postgresql.org/download/windows/
2. Cài đặt với các tùy chọn mặc định
3. Ghi nhớ password cho user `postgres`

### Bước 2: Tạo Database
1. Mở **pgAdmin** hoặc **psql** (Command Line)
2. Tạo database mới:
```sql
CREATE DATABASE careermate_db;
```

### Bước 3: Tạo User (Tùy chọn)
```sql
CREATE USER careermate_user WITH PASSWORD 'careermate_password';
GRANT ALL PRIVILEGES ON DATABASE careermate_db TO careermate_user;
```

### Bước 4: Chạy Schema
1. Mở **pgAdmin**
2. Kết nối với database `careermate_db`
3. Mở Query Tool
4. Copy toàn bộ nội dung file `backend/database/schema.sql`
5. Paste và chạy (F5)

Hoặc dùng command line:
```bash
psql -U postgres -d careermate_db -f backend/database/schema.sql
```

### Bước 5: Cập nhật application.yml
Đảm bảo cấu hình đúng:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/careermate_db
    username: postgres  # hoặc careermate_user
    password: your_password  # Password bạn đã đặt
```

## Tùy chọn 3: Sử dụng MySQL (XAMPP)

Nếu bạn muốn dùng MySQL từ XAMPP thay vì PostgreSQL:

### Bước 1: Khởi động MySQL trong XAMPP
1. Mở XAMPP Control Panel
2. Start MySQL

### Bước 2: Tạo Database
1. Mở phpMyAdmin: http://localhost/phpmyadmin
2. Tạo database mới: `careermate_db`
3. Chọn charset: `utf8mb4`, collation: `utf8mb4_unicode_ci`

### Bước 3: Cập nhật pom.xml
Thêm MySQL dependency:
```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>
```

### Bước 4: Cập nhật application.yml
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/careermate_db?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8
    username: root
    password:  # Để trống nếu XAMPP MySQL không có password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### Bước 5: Cập nhật JPA
```yaml
spring:
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
```

### Bước 6: Chuyển đổi Schema
Cần chuyển đổi `schema.sql` từ PostgreSQL sang MySQL:
- UUID → CHAR(36) hoặc VARCHAR(36)
- `uuid_generate_v4()` → `UUID()`
- `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` → giữ nguyên
- `TEXT` → `TEXT` hoặc `LONGTEXT`
- `JSONB` → `JSON`

## Kiểm tra kết nối

### Test với psql (PostgreSQL)
```bash
psql -U postgres -d careermate_db
# Nhập password
# Nếu kết nối thành công = OK!
```

### Test với MySQL
```bash
mysql -u root -p careermate_db
# Nhập password (hoặc Enter nếu không có)
# Nếu kết nối thành công = OK!
```

### Test từ Spring Boot
1. Chạy backend:
```bash
cd backend
mvn spring-boot:run
```

2. Xem logs, tìm dòng:
```
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
```

Nếu thấy lỗi connection:
```
Connection refused
```
→ Database chưa chạy hoặc cấu hình sai

## Cấu hình application.yml

### Cho PostgreSQL (Docker)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/careermate_db
    username: careermate_user
    password: careermate_password
```

### Cho PostgreSQL (Local)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/careermate_db
    username: postgres
    password: your_postgres_password
```

### Cho MySQL (XAMPP)
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/careermate_db?useSSL=false&serverTimezone=UTC
    username: root
    password: 
```

## Troubleshooting

### Lỗi: "Connection refused"
- **Nguyên nhân**: Database chưa chạy
- **Giải pháp**: 
  - PostgreSQL: Kiểm tra service đang chạy
  - Docker: `docker ps` xem container có chạy không
  - MySQL: Kiểm tra XAMPP MySQL đã Start chưa

### Lỗi: "Authentication failed"
- **Nguyên nhân**: Username/password sai
- **Giải pháp**: Kiểm tra lại trong `application.yml`

### Lỗi: "Database does not exist"
- **Nguyên nhân**: Database chưa được tạo
- **Giải pháp**: Tạo database trước khi chạy schema

### Lỗi: "Table already exists"
- **Nguyên nhân**: Schema đã được chạy rồi
- **Giải pháp**: 
  - Xóa database và tạo lại
  - Hoặc dùng `DROP TABLE IF EXISTS` trong schema

## Quick Start (Docker - Khuyến nghị)

```bash
# 1. Vào thư mục backend
cd backend

# 2. Chạy PostgreSQL và Redis
docker-compose up -d postgres redis

# 3. Đợi 10 giây để database khởi động

# 4. Chạy schema (nếu chưa tự động chạy)
docker exec -i careermate-postgres psql -U careermate_user -d careermate_db < database/schema.sql

# 5. Kiểm tra
docker exec -it careermate-postgres psql -U careermate_user -d careermate_db -c "\dt"
# Phải thấy danh sách các bảng

# 6. Chạy backend
mvn spring-boot:run
```

## Lưu ý

1. **Port 5432** (PostgreSQL) phải không bị chiếm
2. **Port 3306** (MySQL) phải không bị chiếm nếu dùng MySQL
3. **Firewall** có thể chặn kết nối - cần cho phép
4. **Password** nên đặt mạnh trong production

---

**Sau khi setup xong, backend sẽ tự động kết nối khi khởi động!** ✅

