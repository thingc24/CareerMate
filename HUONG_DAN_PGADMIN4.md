# 🐘 HƯỚNG DẪN CHẠY SQL TRONG PGADMIN 4

## Bước 1: Mở pgAdmin 4
1. Mở pgAdmin 4
2. Kết nối đến PostgreSQL server của bạn
3. Expand **Servers** → Expand server của bạn
4. Expand **Databases** → Click vào database **`careermate`**

## Bước 2: Mở Query Tool
1. Click chuột phải vào database **`careermate`**
2. Chọn **Query Tool** (hoặc nhấn Alt+Shift+Q)
3. Cửa sổ Query Tool sẽ mở ra

## Bước 3: Chạy SQL Script
1. Mở file **`QUICK_FIX_ADMIN_POSTGRES.sql`** (vừa tạo)
2. Copy **TOÀN BỘ** nội dung
3. Paste vào Query Tool trong pgAdmin 4
4. Click nút **Execute/Run** (▶️) hoặc nhấn **F5**

## Bước 4: Xem Kết Quả
Bạn sẽ thấy nhiều tab kết quả:
- ✅ Query 1: Danh sách admin users hiện tại (có thể rỗng)
- ✅ Query 2: INSERT user mới (hoặc skip nếu đã tồn tại)
- ✅ Query 3: UPDATE role thành ADMIN
- ✅ Query 4: Xác nhận admin user
- ✅ Query 5: Success message với thông tin login
- ✅ Query 6: Tất cả admin users

## Bước 5: Login Vào App
1. **Logout** khỏi app (nếu đang login)
2. **Login lại** với:
   - **Email:** `admin@careermate.vn`
   - **Password:** `admin123`
3. Vào trang **Admin Dashboard**
4. **XONG!** ✨

---

## ⚠️ LƯU Ý VỚI POSTGRESQL

- Script này dùng `gen_random_uuid()` của PostgreSQL
- Nếu lỗi UUID, database cần extension: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
- Datetime dùng `CURRENT_TIMESTAMP` thay vì `NOW()`

---

## 🔍 KIỂM TRA NHANH

Chạy query này để check admin đã có chưa:
```sql
SELECT email, role FROM users WHERE email = 'admin@careermate.vn';
```

Kết quả phải là:
```
email                | role
---------------------|-------
admin@careermate.vn  | ADMIN
```

---

## ❓ NẾU VẪN BỊ LỖI 403

1. **Clear localStorage:** Mở Console (F12) → Application → Local Storage → Clear All
2. **Hard refresh:** Ctrl + Shift + R
3. **Login lại** với `admin@careermate.vn` / `admin123`
4. **Test lại** admin pages

Nếu vẫn không được, mở **test-admin-access.html** để debug!
