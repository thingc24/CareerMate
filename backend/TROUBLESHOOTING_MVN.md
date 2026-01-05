# Troubleshooting Maven Wrapper

## Lỗi: "' ' is not recognized"

Lỗi này xảy ra khi `mvnw.cmd` gặp vấn đề với đường dẫn có khoảng trắng.

## Giải pháp

### Cách 1: Chạy trực tiếp với java (Bỏ qua Maven Wrapper)

```cmd
cd C:\xampp\htdocs\CareerMate\backend
set JAVA_HOME=C:\Program Files\Java\jdk-23
set PATH=%JAVA_HOME%\bin;%PATH%

REM Tải Maven nếu chưa có
REM Hoặc cài Maven: https://maven.apache.org/download.cgi

REM Nếu đã có Maven:
mvn spring-boot:run
```

### Cách 2: Sửa mvnw.cmd

Vấn đề có thể ở dòng 47 trong mvnw.cmd:
```batch
for %%i in (java.exe) do set "JAVA_HOME=%%~$PATH:i"
```

Cần đảm bảo JAVA_HOME được set đúng trước khi chạy mvnw.cmd.

### Cách 3: Dùng Docker để chạy backend

```bash
cd backend
docker-compose up backend
```

### Cách 4: Cài Maven thủ công

1. Tải Maven: https://maven.apache.org/download.cgi
2. Giải nén vào `C:\Program Files\Apache\maven`
3. Thêm vào PATH: `C:\Program Files\Apache\maven\bin`
4. Chạy: `mvn spring-boot:run`

## Kiểm tra

Sau khi chạy, đợi 2-5 phút và kiểm tra:
- http://localhost:8080/api/swagger-ui.html

---

**Khuyến nghị**: Cài Maven thủ công hoặc dùng Docker để tránh vấn đề với Maven Wrapper.

