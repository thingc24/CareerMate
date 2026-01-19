# Checklist để đạt 100% chuẩn Microservice

## ❌ Hiện tại: CHƯA CHUẨN 100%

### Vấn đề chính:
1. **User-Service** còn direct dependencies với các services khác
2. **Các services khác** chưa được copy và hoàn thiện
3. **Feign Clients** chưa được implement đầy đủ
4. **Entity references** giữa services (RecruiterProfile -> Company)

## ✅ Đã tạo:
- Feign Client interfaces trong common module:
  - `JobServiceClient`
  - `ContentServiceClient`
  - `LearningServiceClient`
  - `AIServiceClient`
  - `NotificationServiceClient`
  - `UserServiceClient`

- DTOs trong common module:
  - `JobDTO`, `ApplicationDTO`
  - `CompanyDTO`
  - `CVTemplateDTO`
  - `CVAnalysisDTO`, `JobRecommendationDTO`
  - `UserDTO`, `NotificationRequest`

## 📋 Cần làm tiếp:

### 1. Sửa User-Service:
- [ ] Thay thế `JobRepository` → `JobServiceClient`
- [ ] Thay thế `ApplicationRepository` → `JobServiceClient`
- [ ] Thay thế `CompanyRepository` → `ContentServiceClient`
- [ ] Thay thế `CVTemplateService` → `LearningServiceClient`
- [ ] Thay thế `AIService` → `AIServiceClient`
- [ ] Sửa `RecruiterProfile` entity: thay `Company` entity bằng `UUID companyId`
- [ ] Comment/remove các repositories từ services khác

### 2. Hoàn thiện các services khác:
- [ ] Notification-Service
- [ ] Job-Service
- [ ] Content-Service
- [ ] Learning-Service
- [ ] Admin-Service
- [ ] AI-Service

### 3. Implement REST endpoints trong mỗi service:
- Mỗi service cần expose endpoints mà Feign Clients gọi
- Đảm bảo endpoints match với Feign Client interfaces

## 🎯 Tiêu chí 100%:
1. ✅ Mỗi service độc lập hoàn toàn
2. ✅ Không có direct imports giữa services
3. ✅ Tất cả communication qua Feign Clients
4. ✅ Entities không reference trực tiếp entities từ services khác
5. ✅ Mỗi service có database schema riêng
6. ✅ Mỗi service có thể chạy độc lập
7. ✅ Tất cả services đăng ký với Eureka
8. ✅ API Gateway route tất cả requests
