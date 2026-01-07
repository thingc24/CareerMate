# Quick Start - CareerMate

## ⚡ Chạy Nhanh (3 Bước)

### 1. Khởi động PostgreSQL
```bash
# Windows: Mở Services và Start PostgreSQL
# Hoặc dùng pgAdmin để start service
```

### 2. Chạy Backend
```bash
cd backend
mvn spring-boot:run
```
✅ Backend chạy tại: **http://localhost:8080**

### 3. Chạy Frontend
```bash
cd frontend
npm install  # Chỉ cần chạy lần đầu
npm run dev
```
✅ Frontend chạy tại: **http://localhost:5173**

---

## 🔧 Cấu Hình Cần Thiết

### Backend - `application.yml`
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
```

### Frontend - `.env`
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 📝 Lưu Ý

- Đảm bảo PostgreSQL đã chạy trước khi start Backend
- Backend và Frontend chạy trên 2 terminal riêng
- Xem chi tiết tại: `HUONG_DAN_CHAY_PROJECT.md`

