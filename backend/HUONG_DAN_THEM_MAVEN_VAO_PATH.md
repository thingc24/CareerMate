# Hướng dẫn thêm Maven vào PATH - Chi tiết từng bước

## Bước 1: Mở Environment Variables

### Cách 1: Qua System Properties
1. Nhấn phím **Windows + R** (hoặc click Start → Run)
2. Gõ: `sysdm.cpl` và nhấn Enter
3. Tab **Advanced** → Click nút **Environment Variables...**

### Cách 2: Qua Settings
1. Nhấn **Windows + I** để mở Settings
2. Tìm kiếm: "environment variables"
3. Click **Edit the system environment variables**
4. Tab **Advanced** → Click **Environment Variables...**

### Cách 3: Qua Control Panel
1. Mở **Control Panel**
2. **System and Security** → **System**
3. Click **Advanced system settings** (bên trái)
4. Tab **Advanced** → Click **Environment Variables...**

## Bước 2: Thêm Maven vào PATH

Sau khi mở cửa sổ **Environment Variables**, bạn sẽ thấy 2 phần:

### Phần trên: User variables (cho user hiện tại)
### Phần dưới: System variables (cho tất cả users) ← **Dùng phần này**

1. Trong phần **System variables** (phần dưới), tìm và click chọn **Path**
2. Click nút **Edit...**
3. Cửa sổ **Edit environment variable** mở ra
4. Click nút **New** (bên phải)
5. Gõ hoặc paste: `C:\Program Files\Apache\maven\bin`
6. Click **OK**
7. Click **OK** ở cửa sổ Environment Variables
8. Click **OK** ở cửa sổ System Properties

## Bước 3: Kiểm tra

1. Mở **Command Prompt mới** (quan trọng: phải mở mới!)
2. Gõ: `mvn -version`
3. Nếu thấy thông tin Maven = **THÀNH CÔNG!** ✅

## Lưu ý quan trọng

- **Phải mở Command Prompt/PowerShell mới** sau khi thêm PATH
- Nếu không thấy `mvn -version`, kiểm tra lại:
  - Đường dẫn có đúng không: `C:\Program Files\Apache\maven\bin`
  - Có click OK đủ các bước không
  - Có mở terminal mới không

## Nếu vẫn không được

### Kiểm tra Maven đã cài đúng chưa:
1. Mở File Explorer
2. Vào: `C:\Program Files\Apache\maven\bin`
3. Phải thấy file `mvn.cmd`

### Thử thêm vào User variables thay vì System variables:
1. Trong phần **User variables** (phần trên)
2. Tìm **Path** (nếu không có thì click **New...**)
3. Thêm: `C:\Program Files\Apache\maven\bin`

---

**Sau khi thêm xong, mở Command Prompt mới và chạy: `mvn -version`**

