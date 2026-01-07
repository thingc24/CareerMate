# Hướng Dẫn Cài Đặt PostgreSQL Tự Động

## 🚀 Cách 1: Dùng Script Tự Động (Khuyến nghị)

### Bước 1: Chạy PowerShell as Administrator

1. **Mở PowerShell:**
   - Nhấn `Win + X`
   - Chọn "Windows PowerShell (Admin)" hoặc "Terminal (Admin)"

2. **Hoặc:**
   - Tìm "PowerShell" trong Start Menu
   - Click phải → "Run as Administrator"

### Bước 2: Chạy Script

```powershell
# Chuyển đến thư mục project
cd C:\xampp\htdocs\CareerMate

# Chạy script
.\CAI_DAT_POSTGRESQL.ps1
```

**Hoặc chạy trực tiếp:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
cd C:\xampp\htdocs\CareerMate
.\CAI_DAT_POSTGRESQL.ps1
```

### Bước 3: Đợi cài đặt hoàn tất

Script sẽ tự động:
- ✅ Cài PostgreSQL Server
- ✅ Cài pgAdmin 4
- ✅ Cài Command Line Tools
- ✅ Tự động start service

---

## 🔧 Cách 2: Dùng Chocolatey Thủ Công

### Chạy PowerShell as Administrator:

```powershell
# Cài PostgreSQL
choco install postgresql -y

# Hoặc với password tùy chỉnh
choco install postgresql --params '/Password:your_password' -y
```

---

## 📝 Cách 3: Download và Cài Thủ Công

### Bước 1: Download

1. Truy cập: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Chọn version mới nhất (khuyến nghị PostgreSQL 15 hoặc 16)
4. Download file `.exe`

### Bước 2: Cài Đặt

1. **Chạy file installer** (click phải → Run as Administrator)

2. **Chọn components:**
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4
   - ✅ Command Line Tools
   - ✅ Stack Builder (tùy chọn)

3. **Chọn thư mục cài đặt:**
   - Mặc định: `C:\Program Files\PostgreSQL\XX`
   - Giữ nguyên hoặc thay đổi

4. **Chọn thư mục data:**
   - Mặc định: `C:\Program Files\PostgreSQL\XX\data`
   - Giữ nguyên

5. **Đặt password cho user `postgres`:**
   - **Ghi nhớ password này!**
   - Ví dụ: `postgres` hoặc `careermate123`

6. **Chọn port:**
   - Mặc định: `5432`
   - Giữ nguyên

7. **Chọn locale:**
   - Mặc định: `[Default locale]`
   - Giữ nguyên

8. **Hoàn tất:**
   - Click "Next" → "Next" → "Finish"

---

## ✅ Kiểm Tra Cài Đặt Thành Công

### Kiểm tra Service:

```powershell
Get-Service | Where-Object { $_.DisplayName -like "*PostgreSQL*" }
```

**Kết quả mong đợi:**
- Status: **Running**

### Kiểm tra bằng psql:

```powershell
psql -U postgres -c "SELECT version();"
```

**Nhập password** khi được hỏi.

### Kiểm tra pgAdmin:

1. Mở Start Menu
2. Tìm "pgAdmin 4"
3. Mở pgAdmin 4
4. Kết nối với:
   - Server: `PostgreSQL`
   - Username: `postgres`
   - Password: `[password bạn đã đặt]`

---

## 🗄️ Tạo Database Sau Khi Cài

### Dùng pgAdmin:

1. **Mở pgAdmin 4**
2. **Kết nối server:**
   - Click phải "Servers" → "Create" → "Server"
   - General:
     - Name: `Local PostgreSQL`
   - Connection:
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: `[password của bạn]`
   - Click "Save"

3. **Tạo database:**
   - Mở rộng server → Databases
   - Click phải "Databases" → "Create" → "Database"
   - Database name: `careermate_db`
   - Owner: `postgres`
   - Click "Save"

### Dùng Command Line:

```powershell
# Kết nối
psql -U postgres

# Tạo database
CREATE DATABASE careermate_db;

# Thoát
\q
```

---

## 🔧 Cấu Hình Backend

Sau khi cài đặt, cập nhật `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/careermate_db
    username: postgres
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

### Lỗi: Script không chạy được

**Giải pháp:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Lỗi: Không có quyền Administrator

**Giải pháp:**
- Click phải PowerShell → "Run as Administrator"
- Hoặc dùng cách 3 (cài thủ công)

### Lỗi: Port 5432 đã được sử dụng

**Giải pháp:**
1. Kiểm tra process:
   ```powershell
   netstat -ano | findstr :5432
   ```
2. Tắt process đang dùng port
3. Hoặc đổi port PostgreSQL trong `postgresql.conf`

---

## 📝 Tóm Tắt

**Cách nhanh nhất:**
1. Chạy PowerShell as Administrator
2. Chạy: `.\CAI_DAT_POSTGRESQL.ps1`
3. Đợi cài đặt xong
4. Tạo database: `careermate_db`
5. Chạy Backend: `mvn spring-boot:run`

---

**Sau khi cài đặt xong, quay lại `HUONG_DAN_CHAY_PROJECT.md` để tiếp tục!**

