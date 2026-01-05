# Hướng dẫn cài Maven - Chi tiết từng bước

## Bước 1: Tải Maven

1. Mở browser
2. Vào: https://maven.apache.org/download.cgi
3. Tìm phần **Files** → **apache-maven-3.9.6-bin.zip** (hoặc version mới nhất)
4. Click để tải về

## Bước 2: Giải nén

1. Tìm file vừa tải (thường ở thư mục Downloads)
2. Right-click → **Extract All...**
3. Chọn thư mục: `C:\Program Files\Apache\`
4. Click **Extract**
5. Kết quả: `C:\Program Files\Apache\apache-maven-3.9.6\`
6. **Đổi tên** thư mục thành: `maven`
   - Kết quả cuối: `C:\Program Files\Apache\maven\`

## Bước 3: Thêm vào PATH (Chi tiết)

### Cách mở Environment Variables:

**Phương pháp 1: Dùng Windows + R**
1. Nhấn **Windows + R**
2. Gõ: `sysdm.cpl`
3. Nhấn **Enter**
4. Tab **Advanced**
5. Click **Environment Variables...**

**Phương pháp 2: Qua Settings**
1. Nhấn **Windows + I**
2. Gõ vào ô tìm kiếm: "environment"
3. Click **Edit the system environment variables**
4. Tab **Advanced**
5. Click **Environment Variables...**

### Thêm Maven vào PATH:

1. Trong cửa sổ **Environment Variables**:
   - Phần dưới: **System variables** ← **Dùng phần này**
   - Tìm và click chọn **Path**
   - Click nút **Edit...**

2. Trong cửa sổ **Edit environment variable**:
   - Click nút **New** (bên phải)
   - Gõ: `C:\Program Files\Apache\maven\bin`
   - Click **OK**

3. Đóng các cửa sổ:
   - Click **OK** ở cửa sổ Edit environment variable
   - Click **OK** ở cửa sổ Environment Variables
   - Click **OK** ở cửa sổ System Properties

## Bước 4: Kiểm tra

1. **Đóng tất cả Command Prompt/PowerShell đang mở**
2. Mở **Command Prompt mới** (quan trọng!)
3. Gõ: `mvn -version`
4. Nếu thấy:
   ```
   Apache Maven 3.9.6
   Maven home: C:\Program Files\Apache\maven
   ```
   = **THÀNH CÔNG!** ✅

## Bước 5: Chạy Backend

```cmd
cd C:\xampp\htdocs\CareerMate\backend
set JAVA_HOME=C:\Program Files\Java\jdk-23
mvn spring-boot:run
```

## ❌ Nếu không thấy `mvn -version`

### Kiểm tra:
1. Đường dẫn có đúng không?
   - Mở: `C:\Program Files\Apache\maven\bin`
   - Phải thấy file `mvn.cmd`

2. Đã mở Command Prompt mới chưa?
   - Phải đóng và mở lại terminal

3. Đã click OK đủ các bước chưa?
   - Kiểm tra lại từ đầu

### Thử lại:
1. Mở lại Environment Variables
2. Kiểm tra Path có `C:\Program Files\Apache\maven\bin` chưa
3. Nếu chưa có, thêm lại
4. Mở Command Prompt mới và test lại

---

**Sau khi cài xong Maven, backend sẽ chạy được!** ✅

