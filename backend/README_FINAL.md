# Hướng dẫn chạy Backend - CareerMate

## ⚠️ Vấn đề với Maven Wrapper

Maven Wrapper (`mvnw.cmd`) có thể gặp lỗi với đường dẫn có khoảng trắng.

## ✅ Giải pháp tốt nhất: Cài Maven

### Bước 1: Tải Maven
- Link: https://maven.apache.org/download.cgi
- Chọn: `apache-maven-3.9.x-bin.zip`

### Bước 2: Giải nén
- Giải nén vào: `C:\Program Files\Apache\maven`
- Kết quả: `C:\Program Files\Apache\maven\bin\mvn.cmd`

### Bước 3: Thêm vào PATH
1. Mở System Properties → Environment Variables
2. Trong System Variables, tìm `Path`
3. Click Edit → New
4. Thêm: `C:\Program Files\Apache\maven\bin`
5. Click OK

### Bước 4: Chạy Backend
```cmd
cd C:\xampp\htdocs\CareerMate\backend
start-simple.bat
```

Hoặc:
```cmd
cd C:\xampp\htdocs\CareerMate\backend
set JAVA_HOME=C:\Program Files\Java\jdk-23
mvn spring-boot:run
```

## 🐳 Giải pháp 2: Dùng Docker

```bash
cd backend
docker-compose up backend
```

## ⏱️ Thời gian

- **Lần đầu**: 2-5 phút (Maven tải dependencies)
- **Lần sau**: 30-60 giây

## ✅ Kiểm tra đã chạy

Sau khi thấy `Started CareerMateApplication`, mở:
- http://localhost:8080/api/swagger-ui.html

---

**Khuyến nghị**: Cài Maven thủ công để tránh vấn đề với Maven Wrapper!

