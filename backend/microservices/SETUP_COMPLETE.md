# Microservices Setup - Hướng dẫn hoàn thiện

## ✅ Đã hoàn thành

1. ✅ Eureka Server (port 8761)
2. ✅ API Gateway (port 8080)
3. ✅ Cấu trúc cho tất cả services:
   - user-service (8081)
   - job-service (8082)
   - content-service (8083)
   - learning-service (8084)
   - admin-service (8085)
   - notification-service (8086)
   - ai-service (8087)
4. ✅ Common module với Feign Clients
5. ✅ Scripts để copy code và start services

## 📋 Các bước tiếp theo

### Bước 1: Copy Code từ Monolith

```powershell
cd backend\microservices
powershell -ExecutionPolicy Bypass -File copy-service-code.ps1
```

### Bước 2: Cập nhật Dependencies

Thêm vào `pom.xml` của mỗi service (nếu cần gọi service khác):

```xml
<dependency>
    <groupId>vn.careermate</groupId>
    <artifactId>common</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Bước 3: Cập nhật Inter-Service Communication

Thay thế direct calls bằng Feign Clients:

**Ví dụ trong AdminService:**
```java
// Thay vì:
private final NotificationService notificationService;

// Dùng:
@Autowired
private NotificationServiceClient notificationServiceClient;

// Gọi:
NotificationRequest request = NotificationRequest.builder()
    .userId(userId)
    .type("JOB_HIDDEN")
    .title("Job đã bị ẩn")
    .message("Lý do: " + reason)
    .relatedEntityId(jobId)
    .relatedEntityType("JOB")
    .build();
notificationServiceClient.notifyJobHidden(request);
```

### Bước 4: Cập nhật Security Config

Mỗi service cần có SecurityConfig riêng để:
- Validate JWT tokens
- Configure CORS
- Set up security filters

### Bước 5: Cập nhật Frontend

Frontend sẽ gọi qua API Gateway:
- Thay vì: `http://localhost:8081/api/users/...`
- Dùng: `http://localhost:8080/api/users/...`

### Bước 6: Test

1. Start Eureka: `cd eureka-server && mvn spring-boot:run`
2. Start Gateway: `cd api-gateway && mvn spring-boot:run`
3. Start các services theo thứ tự
4. Kiểm tra Eureka Dashboard: http://localhost:8761
5. Test API qua Gateway: http://localhost:8080/api/...

## 🔧 Cấu hình Database

Mỗi service sử dụng schema riêng trong cùng database:
- `userservice` schema
- `jobservice` schema
- `contentservice` schema
- `learningservice` schema
- `adminservice` schema
- `notificationservice` schema
- `aiservice` schema

## 📝 Lưu ý

1. **JWT Secret**: Phải giống nhau ở tất cả services
2. **Database**: Cùng database, khác schema
3. **Ports**: Mỗi service chạy trên port riêng
4. **Service Discovery**: Tất cả services đăng ký với Eureka
5. **API Gateway**: Route tất cả requests đến services tương ứng
