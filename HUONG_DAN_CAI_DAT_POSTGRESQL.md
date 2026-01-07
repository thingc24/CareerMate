# Hướng Dẫn Cài Đặt PostgreSQL và pgAdmin

## 📋 Kiểm Tra Hiện Trạng

Dựa trên kiểm tra hệ thống:
- ❌ **pgAdmin**: Chưa được cài đặt
- ❓ **PostgreSQL**: Cần kiểm tra thêm

---

## 🔧 Cài Đặt PostgreSQL

### Cách 1: Download và Cài Đặt Trực Tiếp (Khuyến nghị)

1. **Download PostgreSQL:**
   - Truy cập: https://www.postgresql.org/download/windows/
   - Download PostgreSQL Installer (64-bit)
   - Chạy file installer

2. **Cài Đặt:**
   - Chọn components: **PostgreSQL Server**, **pgAdmin 4**, **Command Line Tools**
   - Port mặc định: **5432**
   - Superuser password: **Nhập password và ghi nhớ**
   - Locale: **Default locale**

3. **Hoàn tất cài đặt:**
   - PostgreSQL sẽ tự động start service
   - pgAdmin 4 sẽ được cài đặt cùng

### Cách 2: Dùng Chocolatey (Nếu đã cài Chocolatey)

```powershell
choco install postgresql
choco install pgadmin4
```

### Cách 3: Dùng Docker (Nếu đã cài Docker)

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=careermate_db \
  -p 5432:5432 \
  postgres:15
```

---

## 🗄️ Tạo Database Sau Khi Cài Đặt

### Dùng pgAdmin:

1. **Mở pgAdmin 4**
2. **Kết nối đến server:**
   - Click phải "Servers" → "Create" → "Server"
   - General tab:
     - Name: `Local PostgreSQL`
   - Connection tab:
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: `[password bạn đã đặt khi cài]`
   - Click "Save"

3. **Tạo Database:**
   - Mở rộng server → Databases
   - Click phải "Databases" → "Create" → "Database"
   - Database name: `careermate_db`
   - Owner: `postgres`
   - Click "Save"

### Dùng Command Line (psql):

```bash
# Kết nối đến PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE careermate_db;

# Tạo user (tùy chọn)
CREATE USER careermate_user WITH PASSWORD 'careermate_password';
GRANT ALL PRIVILEGES ON DATABASE careermate_db TO careermate_user;

# Thoát
\q
```

---

## ✅ Kiểm Tra Cài Đặt Thành Công

### Kiểm tra PostgreSQL Service:

```powershell
# Windows PowerShell
Get-Service | Where-Object { $_.DisplayName -like "*PostgreSQL*" }
```

**Kết quả mong đợi:**
- Service name: `postgresql-x64-XX` (hoặc tương tự)
- Status: **Running**

### Kiểm tra bằng psql:

```bash
psql -U postgres -c "SELECT version();"
```

### Kiểm tra pgAdmin:

- Mở Start Menu → Tìm "pgAdmin 4"
- Hoặc truy cập: `http://127.0.0.1:5050` (nếu pgAdmin chạy ở browser)

---

## 🔧 Cấu Hình Backend

Sau khi cài đặt PostgreSQL, cập nhật `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/careermate_db
    username: postgres  # Hoặc careermate_user nếu đã tạo
    password: your_password  # Password bạn đã đặt
```

**Hoặc dùng environment variables:**

```powershell
# Windows PowerShell
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"
```

---

## 🐛 Xử Lý Lỗi

### Lỗi: Service không start được

**Giải pháp:**
1. Mở Services (`services.msc`)
2. Tìm PostgreSQL service
3. Click phải → Properties
4. Đổi "Log on as" thành "Local System" hoặc account có quyền
5. Start service

### Lỗi: Port 5432 đã được sử dụng

**Giải pháp:**
1. Kiểm tra process đang dùng port:
   ```powershell
   netstat -ano | findstr :5432
   ```
2. Đổi port PostgreSQL trong `postgresql.conf`
3. Hoặc tắt ứng dụng đang dùng port 5432

### Lỗi: Không kết nối được từ Backend

**Giải pháp:**
1. Kiểm tra PostgreSQL đã chạy: `Get-Service postgresql*`
2. Kiểm tra firewall: Cho phép port 5432
3. Kiểm tra `pg_hba.conf`: Đảm bảo cho phép local connections

---

## 📝 Tóm Tắt

1. **Download PostgreSQL:** https://www.postgresql.org/download/windows/
2. **Cài đặt:** Chọn cả PostgreSQL Server và pgAdmin 4
3. **Tạo database:** `careermate_db`
4. **Cấu hình Backend:** Cập nhật `application.yml`
5. **Chạy Backend:** `mvn spring-boot:run`

---

**Sau khi cài đặt xong, quay lại `HUONG_DAN_CHAY_PROJECT.md` để tiếp tục!**

