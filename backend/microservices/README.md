# CareerMate Microservices Architecture

## Cấu trúc Microservices

```
microservices/
├── eureka-server/          # Service Discovery Server
├── api-gateway/            # Spring Cloud Gateway
├── user-service/            # User Management Service
├── job-service/            # Job Management Service
├── content-service/         # Article & Content Service
├── learning-service/        # Course & Challenge Service
├── admin-service/           # Admin Management Service
├── notification-service/    # Notification Service
└── ai-service/             # AI Services (CV Analysis, Mock Interview, etc.)
```

## Ports

- Eureka Server: 8761
- API Gateway: 8080
- User Service: 8081
- Job Service: 8082
- Content Service: 8083
- Learning Service: 8084
- Admin Service: 8085
- Notification Service: 8086
- AI Service: 8087

## Database

Mỗi service có schema riêng trong cùng PostgreSQL database:
- userservice schema
- jobservice schema
- contentservice schema
- learningservice schema
- adminservice schema
- notificationservice schema
- aiservice schema

## Chạy Services

1. Start Eureka Server: `cd eureka-server && mvn spring-boot:run`
2. Start API Gateway: `cd api-gateway && mvn spring-boot:run`
3. Start các services theo thứ tự:
   - User Service
   - Notification Service
   - Job Service
   - Content Service
   - Learning Service
   - Admin Service
   - AI Service

## Inter-Service Communication

Sử dụng Feign Client để giao tiếp giữa các services.
