# Kết Quả Kiểm Tra PostgreSQL

## 📊 Tóm Tắt

### ✅ Đã Hoàn Thành
- ✅ **Config Backend đã được cập nhật đúng:**
  - Port: 5433
  - Password: Vantanvip#123@
  - Username: postgres
  - Database: careermate_db

### ⚠️ Cần Kiểm Tra

1. **PostgreSQL Service:**
   - ❓ Không thấy service PostgreSQL trong danh sách
   - Có thể:
     - PostgreSQL chưa được cài đặt
     - Service có tên khác
     - Service chưa được start

2. **Port 5433:**
   - ❌ Không có process nào đang dùng port 5433
   - Có thể PostgreSQL chưa chạy hoặc đang chạy port khác

3. **psql Command:**
   - ❌ Không tìm thấy `psql` trong PATH
   - Có thể PostgreSQL chưa được cài hoặc chưa thêm vào PATH

4. **Database:**
   - ❌ Database `careermate_db` chưa tồn tại
   - Cần tạo sau khi PostgreSQL đã chạy

---

## 🔍 Các Bước Kiểm Tra Tiếp Theo

### Bước 1: Xác Nhận PostgreSQL Đã Được Cài Đặt

**Kiểm tra thư mục cài đặt:**
```powershell
# Kiểm tra Program Files
Test-Path "C:\Program Files\PostgreSQL"
Test-Path "C:\Program Files (x86)\PostgreSQL"

# Hoặc tìm trong Registry
Get-ItemProperty "HKLM:\SOFTWARE\PostgreSQL\*" -ErrorAction SilentlyContinue
```

**Nếu tìm thấy:**
- Ghi nhớ đường dẫn (ví dụ: `C:\Program Files\PostgreSQL\16`)
- Thêm `bin` vào PATH hoặc dùng đường dẫn đầy đủ

**Nếu không tìm thấy:**
- PostgreSQL chưa được cài đặt
- Cần cài đặt PostgreSQL trước

---

### Bước 2: Kiểm Tra Service PostgreSQL

**Mở Services:**
```powershell
# Mở Services Manager
services.msc
```

**Tìm các service có tên:**
- `postgresql-x64-XX` (XX là version)
- `PostgreSQL Server`
- Hoặc tên tương tự

**Nếu tìm thấy nhưng chưa chạy:**
```powershell
# Start service
Start-Service postgresql-x64-XX
```

**Nếu không tìm thấy:**
- PostgreSQL chưa được cài đặt hoặc service chưa được tạo

---

### Bước 3: Kiểm Tra Port PostgreSQL

**PostgreSQL có thể đang chạy trên:**
- Port 5432 (mặc định)
- Port 5433 (theo config của bạn)
- Port khác (nếu đã cấu hình)

**Kiểm tra tất cả ports:**
```powershell
# Kiểm tra port 5432
netstat -ano | findstr :5432

# Kiểm tra port 5433
netstat -ano | findstr :5433

# Kiểm tra tất cả ports PostgreSQL
netstat -ano | findstr "543"
```

**Nếu PostgreSQL đang chạy port 5432:**
- Cần cấu hình lại PostgreSQL để dùng port 5433
- Hoặc cập nhật config Backend về port 5432

---

### Bước 4: Kiểm Tra File Config PostgreSQL

**Tìm file `postgresql.conf`:**
- Thường ở: `C:\Program Files\PostgreSQL\XX\data\postgresql.conf`
- Hoặc: `C:\ProgramData\PostgreSQL\XX\data\postgresql.conf`

**Kiểm tra port:**
```ini
port = 5433
```

**Nếu port khác:**
- Sửa thành `5433`
- Restart PostgreSQL service

---

### Bước 5: Kiểm Tra Kết Nối

**Nếu có pgAdmin:**
1. Mở pgAdmin 4
2. Tạo server mới:
   - Host: `localhost`
   - Port: `5433`
   - Username: `postgres`
   - Password: `Vantanvip#123@`
3. Kiểm tra kết nối

**Nếu có psql:**
```powershell
# Tìm đường dẫn psql
$pgPath = "C:\Program Files\PostgreSQL\16\bin"  # Thay 16 bằng version của bạn

# Thêm vào PATH tạm thời
$env:PATH += ";$pgPath"

# Kết nối
$env:PGPASSWORD = "Vantanvip#123@"
& "$pgPath\psql.exe" -U postgres -p 5433 -h localhost
```

---

## 🛠️ Giải Pháp

### Nếu PostgreSQL Chưa Được Cài Đặt

**Cài đặt PostgreSQL:**
1. Xem file: `HUONG_DAN_CAI_DAT_TU_DONG.md`
2. Hoặc chạy script: `CAI_DAT_POSTGRESQL.ps1`
3. **Lưu ý:** Khi cài đặt, chọn port **5433** (không phải 5432)

---

### Nếu PostgreSQL Đang Chạy Port 5432

**Cách 1: Đổi Port PostgreSQL (Khuyến nghị)**

1. Tìm file `postgresql.conf`
2. Sửa: `port = 5433`
3. Restart PostgreSQL service

**Cách 2: Đổi Config Backend**

1. Sửa `application.yml`: `port: 5432`
2. Sửa `application-dev.yml`: `port: 5432`

---

### Nếu Không Kết Nối Được

**Kiểm tra:**
1. ✅ PostgreSQL service đang chạy
2. ✅ Port đúng (5433)
3. ✅ Password đúng (`Vantanvip#123@`)
4. ✅ Username đúng (`postgres`)
5. ✅ Firewall không chặn port 5433

**Test kết nối:**
```powershell
# Test với telnet (nếu có)
telnet localhost 5433

# Hoặc test với Test-NetConnection
Test-NetConnection -ComputerName localhost -Port 5433
```

---

## 📝 Checklist

- [ ] PostgreSQL đã được cài đặt
- [ ] PostgreSQL service đang chạy
- [ ] PostgreSQL đang lắng nghe port 5433
- [ ] Có thể kết nối bằng pgAdmin hoặc psql
- [ ] Database `careermate_db` đã được tạo
- [ ] Backend có thể kết nối database

---

## 🚀 Bước Tiếp Theo

1. **Xác nhận PostgreSQL đã được cài đặt:**
   - Kiểm tra thư mục `C:\Program Files\PostgreSQL`
   - Hoặc mở pgAdmin 4

2. **Nếu chưa cài:**
   - Chạy script: `CAI_DAT_POSTGRESQL.ps1`
   - Hoặc cài thủ công (xem `HUONG_DAN_CAI_DAT_TU_DONG.md`)

3. **Nếu đã cài nhưng chưa chạy:**
   - Start PostgreSQL service
   - Kiểm tra port

4. **Tạo database:**
   - Dùng pgAdmin hoặc psql
   - Chạy: `CREATE DATABASE careermate_db;`

5. **Test Backend:**
   ```powershell
   cd backend
   mvn spring-boot:run
   ```

---

**Sau khi hoàn thành các bước trên, chạy lại kiểm tra!**

