# Hướng dẫn hoàn thiện Microservices Setup

## Bước 1: Copy Code từ Monolith

Chạy script để copy code:
```powershell
cd backend\microservices
powershell -ExecutionPolicy Bypass -File copy-service-code.ps1
```

## Bước 2: Cập nhật Package Declarations

Sau khi copy, cần đảm bảo tất cả package declarations đúng:
- `package vn.careermate.userservice.*;`
- `package vn.careermate.jobservice.*;`
- etc.

## Bước 3: Thêm Common Module Dependency

Thêm dependency vào pom.xml của mỗi service:
```xml
<dependency>
    <groupId>vn.careermate</groupId>
    <artifactId>common</artifactId>
    <version>1.0.0</version>
</dependency>
```

## Bước 4: Cập nhật Inter-Service Communication

Thay thế direct calls bằng Feign Clients:
- `UserRepository` → `UserServiceClient`
- `NotificationService` → `NotificationServiceClient`

## Bước 5: Cập nhật Security Config

Mỗi service cần có SecurityConfig riêng để validate JWT tokens.

## Bước 6: Cập nhật Frontend

Frontend sẽ gọi qua API Gateway (port 8080) thay vì trực tiếp.

## Bước 7: Test

1. Start Eureka Server
2. Start API Gateway
3. Start các services
4. Test qua API Gateway
