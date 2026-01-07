# Kiểm Tra Kết Nối PostgreSQL

## ✅ Thông Tin Đã Cấu Hình

- **Host:** localhost
- **Port:** 5433
- **Database:** careermate_db
- **Username:** postgres
- **Password:** Vantanvip#123@

---

## 🔍 Kiểm Tra Kết Nối

### Cách 1: Dùng pgAdmin

1. **Mở pgAdmin 4**
2. **Tạo Server mới:**
   - Click phải "Servers" → "Create" → "Server"
   - **General tab:**
     - Name: `CareerMate Local`
   - **Connection tab:**
     - Host name/address: `localhost`
     - Port: `5433`
     - Maintenance database: `postgres`
     - Username: `postgres`
     - Password: `Vantanvip#123@`
     - ✅ Save password
   - Click "Save"

3. **Kiểm tra kết nối:**
   - Nếu kết nối thành công → ✅ OK
   - Nếu lỗi → Xem phần "Xử Lý Lỗi" bên dưới

---

### Cách 2: Dùng psql (Command Line)

```powershell
# Kết nối PostgreSQL
psql -U postgres -p 5433 -h localhost

# Nhập password khi được hỏi: Vantanvip#123@
```

**Sau khi kết nối:**

```sql
-- Kiểm tra version
SELECT version();

-- Liệt kê databases
\l

-- Tạo database nếu chưa có
CREATE DATABASE careermate_db;

-- Kết nối vào database
\c careermate_db

-- Thoát
\q
```

---

### Cách 3: Kiểm Tra Service

```powershell
# Kiểm tra PostgreSQL service
Get-Service | Where-Object { $_.DisplayName -like "*PostgreSQL*" }

# Hoặc
Get-Service postgresql*
```

**Kết quả mong đợi:**
- Status: **Running**

---

## 🗄️ Tạo Database

### Nếu database chưa có:

**Dùng pgAdmin:**
1. Kết nối server (như trên)
2. Click phải "Databases" → "Create" → "Database"
3. Database name: `careermate_db`
4. Owner: `postgres`
5. Click "Save"

**Dùng psql:**
```sql
CREATE DATABASE careermate_db;
```

**Hoặc chạy script:**
```powershell
psql -U postgres -p 5433 -f TAO_DATABASE.sql
```

---

## 🧪 Test Kết Nối Từ Backend

### Chạy Backend:

```powershell
cd backend
mvn spring-boot:run
```

**Kiểm tra log:**
- ✅ Nếu thấy: `HikariPool-1 - Start completed` → Kết nối thành công
- ❌ Nếu thấy: `Connection refused` hoặc `Connection timeout` → Xem phần lỗi

---

## 🐛 Xử Lý Lỗi

### Lỗi: Connection refused

**Nguyên nhân:**
- PostgreSQL service chưa chạy
- Port sai (đang dùng 5432 thay vì 5433)

**Giải pháp:**
```powershell
# Kiểm tra service
Get-Service postgresql*

# Start service nếu chưa chạy
Start-Service postgresql-x64-XX  # Thay XX bằng version của bạn
```

**Hoặc:**
1. Mở Services (`services.msc`)
2. Tìm "postgresql"
3. Click phải → Start

---

### Lỗi: Authentication failed

**Nguyên nhân:**
- Password sai
- Username sai

**Giải pháp:**
1. Kiểm tra lại password: `Vantanvip#123@`
2. Kiểm tra username: `postgres`
3. Thử reset password trong pgAdmin

---

### Lỗi: Database does not exist

**Nguyên nhân:**
- Database `careermate_db` chưa được tạo

**Giải pháp:**
- Tạo database như hướng dẫn ở trên

---

### Lỗi: Port 5433 không kết nối được

**Nguyên nhân:**
- PostgreSQL đang chạy trên port khác
- Firewall chặn port

**Giải pháp:**

1. **Kiểm tra port PostgreSQL:**
   ```powershell
   netstat -ano | findstr :5433
   ```

2. **Kiểm tra file config:**
   - Tìm file `postgresql.conf`
   - Thường ở: `C:\Program Files\PostgreSQL\XX\data\postgresql.conf`
   - Tìm dòng: `port = 5433`
   - Nếu không có, thêm: `port = 5433`
   - Restart PostgreSQL service

3. **Kiểm tra firewall:**
   ```powershell
   # Cho phép port 5433
   New-NetFirewallRule -DisplayName "PostgreSQL 5433" -Direction Inbound -LocalPort 5433 -Protocol TCP -Action Allow
   ```

---

## ✅ Checklist

- [ ] PostgreSQL service đang chạy
- [ ] Kết nối được qua pgAdmin (port 5433)
- [ ] Kết nối được qua psql
- [ ] Database `careermate_db` đã được tạo
- [ ] Backend kết nối được database
- [ ] Không có lỗi trong log Backend

---

## 📝 Lưu Ý

- **Port 5433** (không phải 5432 mặc định)
- **Password:** `Vantanvip#123@` (có ký tự đặc biệt)
- **Username:** `postgres`
- **Database:** `careermate_db`

---

**Sau khi kiểm tra xong, chạy Backend để test!**

