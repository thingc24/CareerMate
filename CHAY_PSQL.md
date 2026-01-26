# 🎯 GIẢI PHÁP CUỐI CÙNG - KHÔNG CẦN PGADMIN

## ✅ ĐÃ TÌM THẤY POSTGRESQL!
**Vị trí:** `C:\Program Files\PostgreSQL\18\bin\psql.exe`

## 🚀 CHẠY LỆNH NÀY TRONG POWERSHELL:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate
```

Sau đó nhập password PostgreSQL của bạn.

## 📝 KHI VÀO PSQL, COPY-PASTE CÁC LỆNH SAU:

```sql
-- Xem tất cả users hiện có
SELECT id, email, full_name, role FROM users LIMIT 10;

-- Update MỌI user có email chứa 'admin' thành ADMIN
UPDATE users 
SET role = 'ADMIN', status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
WHERE LOWER(email) LIKE '%admin%';

-- Tạo admin mặc định nếu chưa có
INSERT INTO users (id, email, password_hash, full_name, phone, role, status, email_verified, created_at, updated_at)
SELECT gen_random_uuid(), 'admin@careermate.vn', '$2a$10$rN7aLbLWlH6/y1qQJqJ7OuGq6F/HJdGS1KQqZp7VFhXqaVD3H5emu', 'System Administrator', '0900000000', 'ADMIN', 'ACTIVE', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'ADMIN');

-- Xem kết quả
SELECT email, full_name, role FROM users WHERE role = 'ADMIN';

-- Thoát
\q
```

## ⚡ HOẶC CÁCH NHANH HƠN - 1 LỆNH DUY NHẤT:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate -c "UPDATE users SET role = 'ADMIN', status = 'ACTIVE' WHERE LOWER(email) LIKE '%admin%'; SELECT email, role FROM users WHERE role = 'ADMIN';"
```

Nhập password khi được hỏi → XONG!

## 📱 SAU KHI CHẠY:

1. **Logout** khỏi app
2. **Login lại** với tài khoản admin
3. Admin pages sẽ hoạt động! ✨

---

## ❓ KHÔNG BIẾT PASSWORD POSTGRES?

Password thường là:
- `postgres`
- `admin`
- Hoặc password bạn đã đặt khi cài PostgreSQL
