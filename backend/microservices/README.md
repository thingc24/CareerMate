# 🚀 CareerMate Microservices

Hướng dẫn chạy tất cả các microservices của CareerMate.

## 📋 Danh sách Services

| Service | Port | Mô tả |
|---------|------|-------|
| eureka-server | 8761 | Service Discovery |
| api-gateway | 8080 | API Gateway |
| user-service | 8081 | User Management |
| job-service | 8082 | Job Management |
| content-service | 8083 | Content & Articles |
| notification-service | 8084 | Notifications |
| learning-service | 8085 | Learning & Courses |
| ai-service | 8086 | AI Services |
| admin-service | 8087 | Admin Panel |

## 🚀 Cách chạy tất cả services

### Cách 1: Sử dụng script tự động (Khuyến nghị)

```powershell
cd backend\microservices
.\start-all-services.ps1
```

Script này sẽ:
- ✅ Tự động kill các process đang chạy trên các ports
- ✅ Build các service chưa có JAR file
- ✅ Start tất cả services theo thứ tự đúng
- ✅ Kiểm tra health của từng service
- ✅ Hiển thị trạng thái Eureka registry

### Cách 2: Chạy từng service thủ công

```powershell
# 1. Start Eureka Server
cd backend\microservices\eureka-server
java -jar target\eureka-server-1.0.0.jar

# 2. Start API Gateway (trong terminal mới)
cd backend\microservices\api-gateway
java -jar target\api-gateway-1.0.0.jar

# 3. Start các services khác...
```

## 🛑 Dừng tất cả services

```powershell
cd backend\microservices
.\stop-all-services.ps1
```

## 📊 Kiểm tra trạng thái

### Eureka Dashboard
Mở trình duyệt: http://localhost:8761

### Health Check
```powershell
# Kiểm tra từng service
Invoke-WebRequest -Uri "http://localhost:8081/actuator/health"
Invoke-WebRequest -Uri "http://localhost:8082/actuator/health"
# ... các service khác
```

## ⚙️ Yêu cầu hệ thống

- ✅ Java 17+ (JDK 23 được khuyến nghị)
- ✅ Maven 3.6+
- ✅ PostgreSQL (đã tạo các databases riêng)
- ✅ Redis (optional, cho caching)

## 🔧 Troubleshooting

### Port đã được sử dụng
```powershell
# Kiểm tra process trên port
Get-NetTCPConnection -LocalPort 8081

# Kill process
Stop-Process -Id <PID> -Force
```

### Service không start được
1. Kiểm tra logs trong console
2. Kiểm tra database connection
3. Kiểm tra Eureka Server đã chạy chưa
4. Kiểm tra JAR file đã được build chưa: `mvn clean package -DskipTests`

### Build failed
```powershell
# Build lại service cụ thể
cd backend\microservices\<service-name>
mvn clean package -DskipTests
```

## 📝 Lưu ý

- ⏱️ Cần đợi 30-40 giây để tất cả services khởi động hoàn tất
- 🔄 Eureka Server phải chạy trước các services khác
- 🌐 API Gateway là entry point chính cho client
- 💾 Đảm bảo các databases đã được tạo và cấu hình đúng

## 🎯 Quick Start

```powershell
# 1. Di chuyển vào thư mục microservices
cd C:\xampp\htdocs\CareerMate\backend\microservices

# 2. Chạy script
.\start-all-services.ps1

# 3. Đợi 40 giây và kiểm tra kết quả
```

---

**Happy Coding! 🎉**
