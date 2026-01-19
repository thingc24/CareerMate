# Migration Guide: Monolith to Microservices

## Bước 1: Copy Code từ Monolith

Mỗi service cần copy code từ package tương ứng:

### User Service
```bash
# Copy từ backend/src/main/java/vn/careermate/userservice/*
# Đến backend/microservices/user-service/src/main/java/vn/careermate/userservice/*
```

### Job Service
```bash
# Copy từ backend/src/main/java/vn/careermate/jobservice/*
# Đến backend/microservices/job-service/src/main/java/vn/careermate/jobservice/*
```

### Content Service
```bash
# Copy từ backend/src/main/java/vn/careermate/contentservice/*
# Đến backend/microservices/content-service/src/main/java/vn/careermate/contentservice/*
```

### Learning Service
```bash
# Copy từ backend/src/main/java/vn/careermate/learningservice/*
# Đến backend/microservices/learning-service/src/main/java/vn/careermate/learningservice/*
```

### Admin Service
```bash
# Copy từ backend/src/main/java/vn/careermate/adminservice/*
# Đến backend/microservices/admin-service/src/main/java/vn/careermate/adminservice/*
```

### Notification Service
```bash
# Copy từ backend/src/main/java/vn/careermate/notificationservice/*
# Đến backend/microservices/notification-service/src/main/java/vn/careermate/notificationservice/*
```

### AI Service
```bash
# Copy từ backend/src/main/java/vn/careermate/aiservice/*
# Đến backend/microservices/ai-service/src/main/java/vn/careermate/aiservice/*
```

## Bước 2: Tạo Common Module (nếu cần)

Tạo shared DTOs và utilities:
- JWT utilities
- Common DTOs
- File storage service

## Bước 3: Cập nhật Inter-Service Communication

Sử dụng Feign Client để giao tiếp giữa các services:

```java
@FeignClient(name = "user-service")
public interface UserServiceClient {
    @GetMapping("/users/{userId}")
    UserDTO getUser(@PathVariable UUID userId);
}
```

## Bước 4: Cập nhật Frontend

Frontend sẽ gọi qua API Gateway (port 8080) thay vì trực tiếp các services.

## Thứ tự chạy Services

1. Eureka Server (8761)
2. API Gateway (8080)
3. User Service (8081)
4. Notification Service (8086)
5. Job Service (8082)
6. Content Service (8083)
7. Learning Service (8084)
8. Admin Service (8085)
9. AI Service (8087)
