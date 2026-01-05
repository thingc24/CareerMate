# Kiểm tra Maven đã cài đúng chưa

## ⚠️ QUAN TRỌNG

Sau khi thêm Maven vào PATH, bạn **PHẢI**:
1. **Đóng tất cả** Command Prompt/PowerShell đang mở
2. **Mở Command Prompt mới** (hoặc PowerShell mới)
3. Mới test được `mvn -version`

## ✅ Kiểm tra Maven

### Bước 1: Mở Command Prompt mới
- Nhấn **Windows + R**
- Gõ: `cmd`
- Nhấn **Enter**

### Bước 2: Test Maven
```cmd
mvn -version
```

### Kết quả mong đợi:
```
Apache Maven 3.9.6
Maven home: C:\Program Files\Apache\maven
Java version: 23.0.2
...
```

Nếu thấy thông tin Maven = **THÀNH CÔNG!** ✅

## ❌ Nếu vẫn không thấy `mvn -version`

### Kiểm tra lại:

1. **Maven đã giải nén đúng chưa?**
   - Mở: `C:\Program Files\Apache\maven\bin`
   - Phải thấy file `mvn.cmd`

2. **PATH đã thêm đúng chưa?**
   - Mở lại Environment Variables
   - Kiểm tra Path có: `C:\Program Files\Apache\maven\bin`
   - Nếu chưa có, thêm lại

3. **Đã mở terminal mới chưa?**
   - Phải đóng và mở lại Command Prompt

## 🚀 Sau khi Maven OK, chạy Backend

```cmd
cd C:\xampp\htdocs\CareerMate\backend
set JAVA_HOME=C:\Program Files\Java\jdk-23
mvn spring-boot:run
```

Hoặc dùng script:
```cmd
cd C:\xampp\htdocs\CareerMate\backend
start-with-maven.bat
```

---

**Lưu ý**: Luôn mở Command Prompt mới sau khi thay đổi PATH!

