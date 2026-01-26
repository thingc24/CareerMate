# 🚀 HƯỚNG DẪN FIX ADMIN 403 - STEP BY STEP

## ⚡ CÁCH FIX NHANH NHẤT (2 phút)

### Bước 1: Mở phpMyAdmin
1. Vào http://localhost/phpmyadmin
2. Click vào database `careermate` bên trái
3. Click tab **SQL** ở trên

### Bước 2: Chạy SQL Script
1. Mở file `QUICK_FIX_ADMIN.sql` trong thư mục gốc CareerMate
2. Copy TOÀN BỘ nội dung
3. Paste vào ô SQL trong phpMyAdmin
4. Click nút **Go** (hoặc **Thực hiện**)

### Bước 3: Kiểm tra kết quả
Bạn sẽ thấy các kết quả:
- ✅ Step 1: Hiển thị admin users hiện tại
- ✅ Step 2: Tạo user mới (nếu chưa tồn tại)
- ✅ Step 3: Cập nhật role thành ADMIN
- ✅ Step 4: Xác nhận user admin
- ✅ Success message với thông tin login

### Bước 4: Login vào app
1. Logout nếu đang login
2. Login lại với:
   - **Email:** `admin@careermate.vn`
   - **Password:** `admin123`
3. Vào trang Admin Dashboard
4. Xong! ✨

---

## 🧪 TEST TRƯỚC KHI FIX (Optional)

Nếu muốn kiểm tra vấn đề trước:

1. Mở file `test-admin-access.html` trong browser
2. Login với tài khoản hiện tại
3. Click "Kiểm tra Token" → Xem có role ADMIN không
4. Click "Test Admin Dashboard" → Xem lỗi 403 hay không

---

## 🔄 OPTION 2: REBUILD SERVICES (NẾU VẪN LỖI)

Nếu sau khi fix database vẫn bị 403:

1. **Stop tất cả backend services:**
   - Tìm tất cả cửa sổ PowerShell đang chạy CHAY_BACKEND.ps1
   - Ctrl+C để stop từng cái

2. **Rebuild services:**
   ```
   Double-click REBUILD_ALL_SERVICES.bat
   Đợi build xong (khoảng 5-10 phút)
   ```

3. **Start lại services:**
   ```powershell
   .\CHAY_BACKEND.ps1
   ```

4. **Test lại admin pages**

---

## ❓ NẾU VẪN BỊ LỖI

### Check 1: Token có role ADMIN không?
```
Mở test-admin-access.html → Login → Click "Kiểm tra Token"
→ Phải thấy: "role": "ADMIN"
```

### Check 2: Backend services đang chạy?
```
Vào http://localhost:8761
→ Phải thấy: admin-service, user-service, notification-service đều UP
```

### Check 3: Database có user admin không?
```sql
SELECT email, role FROM careermate.users WHERE email = 'admin@careermate.vn';
-- Phải thấy role = 'ADMIN'
```

---

## 📞 LIÊN HỆ

Nếu vẫn không được, gửi cho tôi:
1. Screenshot lỗi 403 trong browser
2. Screenshot kết quả từ test-admin-access.html
3. Kết quả query: `SELECT email, role FROM users WHERE email = 'admin@careermate.vn'`
