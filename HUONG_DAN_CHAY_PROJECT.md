# Hướng Dẫn Chạy Project CareerMate

## 📋 Yêu Cầu Hệ Thống

### Backend (Spring Boot):
- Java JDK 17+ (khuyến nghị JDK 23)
- Maven 3.6+
- PostgreSQL 12+
- Redis (tùy chọn, cho caching)

### Frontend (React):
- Node.js 18+
- npm hoặc yarn

---

## 🚀 Cách Chạy Project

### Bước 1: Setup Database (PostgreSQL)

1. **Khởi động PostgreSQL:**
   ```bash
   # Windows (Services)
   - Mở Services (services.msc)
   - Tìm "postgresql-x64-XX"
   - Click "Start"

   # Hoặc dùng pgAdmin
   - Mở pgAdmin
   - Kết nối đến PostgreSQL server
   ```

2. **Tạo Database:**
   ```sql
   CREATE DATABASE careermate_db;
   CREATE USER careermate_user WITH PASSWORD 'careermate_password';
   GRANT ALL PRIVILEGES ON DATABASE careermate_db TO careermate_user;
   ```
   
   **Hoặc dùng database mặc định:**
   ```sql
   CREATE DATABASE careermate_db;
   ```
   (Sử dụng user `postgres` mặc định)

3. **Cấu hình trong `backend/src/main/resources/application.yml`:**
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/careermate_db
       username: ${DB_USERNAME:careermate_user}
       password: ${DB_PASSWORD:careermate_password}
   ```
   
   **Hoặc set environment variables:**
   ```bash
   # Windows PowerShell
   $env:DB_USERNAME="postgres"
   $env:DB_PASSWORD="your_password"
   
   # Windows CMD
   set DB_USERNAME=postgres
   set DB_PASSWORD=your_password
   ```

---

### Bước 2: Chạy Backend (Spring Boot)

1. **Mở terminal và chuyển đến thư mục backend:**
   ```bash
   cd backend
   ```

2. **Kiểm tra Java và Maven:**
   ```bash
   java -version
   mvn -version
   ```

3. **Chạy Backend:**
   ```bash
   # Cách 1: Dùng Maven
   mvn spring-boot:run

   # Cách 2: Dùng Maven Wrapper (nếu có)
   ./mvnw spring-boot:run

   # Windows
   mvnw.cmd spring-boot:run
   ```

4. **Kiểm tra Backend đã chạy:**
   - Mở trình duyệt: `http://localhost:8080`
   - Hoặc kiểm tra API: `http://localhost:8080/api/auth/test`
   - Backend sẽ chạy tại: **http://localhost:8080**

---

### Bước 3: Chạy Frontend (React)

1. **Mở terminal mới và chuyển đến thư mục frontend:**
   ```bash
   cd frontend
   ```

2. **Cài đặt dependencies (lần đầu tiên):**
   ```bash
   npm install
   ```

3. **Tạo file `.env` (nếu chưa có):**
   ```bash
   # Tạo file .env trong thư mục frontend
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

4. **Chạy Frontend:**
   ```bash
   npm run dev
   ```

5. **Kiểm tra Frontend đã chạy:**
   - Frontend sẽ chạy tại: **http://localhost:5173**
   - Mở trình duyệt và truy cập: `http://localhost:5173`

---

## 🔧 Cấu Hình Bổ Sung

### Cấu hình AI Services (Gemini API)

1. **Lấy API Key từ Google AI Studio:**
   - Truy cập: https://aistudio.google.com/apikey
   - Tạo API key mới

2. **Cấu hình trong `backend/src/main/resources/application.yml`:**
   ```yaml
   ai:
     gemini:
       api-key: YOUR_GEMINI_API_KEY
       model: gemini-2.5-flash
       timeout: 30000
   ```

### Cấu hình Vector DB (Weaviate) - Tùy chọn

1. **Chạy Weaviate với Docker:**
   ```bash
   docker run -d \
     --name weaviate \
     -p 8081:8080 \
     -e QUERY_DEFAULTS_LIMIT=25 \
     -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true \
     -e PERSISTENCE_DATA_PATH=/var/lib/weaviate \
     -v weaviate_data:/var/lib/weaviate \
     semitechnologies/weaviate:latest
   ```

2. **Cấu hình trong `backend/src/main/resources/application.yml`:**
   ```yaml
   ai:
     vector-db:
       weaviate:
         url: http://localhost:8081
         enabled: true
   ```

---

## 📝 Kiểm Tra Project Đã Chạy Thành Công

### Backend:
- ✅ API chạy tại: `http://localhost:8080`
- ✅ Swagger UI: `http://localhost:8080/swagger-ui.html` (nếu có)
- ✅ Health check: `http://localhost:8080/actuator/health`

### Frontend:
- ✅ Frontend chạy tại: `http://localhost:5173`
- ✅ Có thể đăng nhập/đăng ký
- ✅ Có thể truy cập các trang

---

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi 1: PostgreSQL Connection Refused
```
Error: Connection to localhost:5432 refused
```
**Giải pháp:**
- Kiểm tra PostgreSQL đã chạy chưa
  ```bash
  # Windows: Mở Services (services.msc) và Start PostgreSQL
  # Hoặc dùng pgAdmin để start service
  ```
- Kiểm tra database `careermate_db` đã được tạo chưa
- Kiểm tra username/password trong `application.yml` hoặc environment variables
- Kiểm tra port PostgreSQL (mặc định: 5432)
- Nếu dùng Docker, kiểm tra container đã chạy: `docker ps`

### Lỗi 2: Port 8080 đã được sử dụng
```
Error: Port 8080 is already in use
```
**Giải pháp:**
- Đổi port trong `application.yml`:
  ```yaml
  server:
    port: 8081
  ```
- Hoặc tắt ứng dụng đang dùng port 8080

### Lỗi 3: Frontend không kết nối được Backend
```
Error: Network Error / CORS Error
```
**Giải pháp:**
- Kiểm tra Backend đã chạy chưa
- Kiểm tra `VITE_API_BASE_URL` trong `.env`
- Kiểm tra CORS config trong Backend

### Lỗi 4: npm install thất bại
```
Error: npm ERR! code ELIFECYCLE
```
**Giải pháp:**
- Xóa `node_modules` và `package-lock.json`
- Chạy lại: `npm install`
- Hoặc dùng: `npm install --legacy-peer-deps`

### Lỗi 5: Maven build thất bại
```
Error: Failed to execute goal
```
**Giải pháp:**
- Xóa thư mục `target`: `mvn clean`
- Chạy lại: `mvn spring-boot:run`
- Kiểm tra Java version: `java -version` (cần JDK 17+)

### Lỗi 6: Database tables không tồn tại
```
Error: Table "users" does not exist
```
**Giải pháp:**
- Đổi `ddl-auto` trong `application.yml` từ `validate` sang `update`:
  ```yaml
  spring:
    jpa:
      hibernate:
        ddl-auto: update  # Tự động tạo/update tables
  ```
- Hoặc chạy migration scripts nếu có

---

## 📂 Cấu Trúc Project

```
CareerMate/
├── backend/              # Spring Boot API
│   ├── src/
│   │   └── main/
│   │       ├── java/     # Source code
│   │       └── resources/ # Config files
│   └── pom.xml
│
├── frontend/             # React Frontend
│   ├── src/
│   │   ├── pages/       # React pages
│   │   ├── layouts/     # Layout components
│   │   ├── services/    # API client
│   │   └── contexts/    # React contexts
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🎯 Quick Start (Tóm Tắt)

```bash
# Terminal 1: Backend
cd backend
mvn spring-boot:run

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Mở trình duyệt
# Backend: http://localhost:8080
# Frontend: http://localhost:5173
```

---

## 📞 Tài Khoản Test (Nếu có)

- **Student:**
  - Email: `student@test.com`
  - Password: `password123`

- **Recruiter:**
  - Email: `recruiter@test.com`
  - Password: `password123`

- **Admin:**
  - Email: `admin@test.com`
  - Password: `password123`

---

## ✅ Checklist Trước Khi Chạy

- [ ] PostgreSQL đã được cài đặt và chạy
- [ ] Database `careermate` đã được tạo
- [ ] Cấu hình database trong `application.yml` đúng
- [ ] Java JDK 17+ đã được cài đặt
- [ ] Maven đã được cài đặt
- [ ] Node.js 18+ đã được cài đặt
- [ ] Backend dependencies đã được tải (Maven tự động)
- [ ] Frontend dependencies đã được cài (`npm install`)
- [ ] File `.env` đã được tạo trong `frontend/`

---

**Chúc bạn thành công!** 🎉

