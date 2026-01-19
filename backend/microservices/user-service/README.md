# User Service - Microservice

## Port: 8081

## Chức năng
- Authentication & Authorization (Login, Register, JWT)
- User Management
- Student Profile Management
- Recruiter Profile Management
- CV Management
- Messaging (Conversations, Messages)

## Database Schema
- Schema: `userservice`
- Tables: users, student_profiles, recruiter_profiles, cvs, conversations, messages, student_skills, oauth_providers

## Dependencies với Services khác
Hiện tại có một số dependencies với các services khác cần được xử lý:
- `AIService` - Cần tạo Feign Client sau
- `JobRepository`, `ApplicationRepository` - Cần tạo Feign Client hoặc loại bỏ
- `CVTemplateService` - Cần tạo Feign Client sau

## Cách chạy

```bash
cd backend/microservices/user-service
mvn spring-boot:run
```

## Endpoints

- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Refresh token
- `GET /students/profile` - Lấy profile sinh viên
- `GET /recruiters/profile` - Lấy profile nhà tuyển dụng
- `GET /cvs` - Lấy danh sách CV
- `POST /cvs` - Upload CV
- `GET /conversations` - Lấy danh sách cuộc trò chuyện
- `GET /messages/{conversationId}` - Lấy tin nhắn

## Lưu ý

1. JWT secret phải giống với các services khác
2. Database connection phải trỏ đúng schema `userservice`
3. File uploads được lưu tại `./uploads` (có thể cấu hình qua `app.storage.local.path`)
