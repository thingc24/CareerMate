# ⚠️ DEPRECATED - Backend Monolithic

**LƯU Ý QUAN TRỌNG:** Backend monolithic này **KHÔNG CÒN ĐƯỢC SỬ DỤNG**.

## 🏗️ Kiến trúc mới: Microservices

Dự án đã được chuyển đổi hoàn toàn sang kiến trúc **Microservices**:

- ✅ **Eureka Server** (port 8761) - Service Discovery
- ✅ **API Gateway** (port 8080) - Entry point
- ✅ **user-service** (port 8081)
- ✅ **job-service** (port 8082)
- ✅ **content-service** (port 8083)
- ✅ **notification-service** (port 8084)
- ✅ **learning-service** (port 8085)
- ✅ **ai-service** (port 8086)
- ✅ **admin-service** (port 8087)

## 📁 Cấu trúc mới

Tất cả các services nằm trong: `backend/microservices/`

## 🗄️ Database

- Database cũ `careermate_db` đã bị xóa
- Mỗi microservice có database riêng:
  - `user_service_db`
  - `job_service_db`
  - `content_service_db`
  - `notification_service_db`
  - `learning_service_db`
  - `ai_service_db`
  - `admin_service_db`

## 🚀 Cách chạy hệ thống mới

Xem hướng dẫn trong: `backend/microservices/README.md`

## ❌ Tại sao backend cũ không chạy được?

1. Database `careermate_db` không tồn tại
2. Các DataInitializer đã bị xóa
3. DatabaseMigrationRunner đã bị vô hiệu hóa
4. Code đã được tách thành các microservices riêng

---

**Không nên chạy backend monolithic này nữa!**
